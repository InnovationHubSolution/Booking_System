import express, { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Property from '../models/Property';
import { auth, AuthRequest } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';

const router = express.Router();

// Admin-only middleware
const adminOnly = (req: AuthRequest, res: Response, next: Function) => {
    if (req.user?.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }
    next();
};

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get analytics data (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/', auth, adminOnly, catchAsync(async (req: AuthRequest, res: Response) => {
    const range = req.query.range || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (range) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            previousStartDate.setDate(now.getDate() - 14);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            previousStartDate.setFullYear(now.getFullYear() - 2);
            break;
        case 'month':
        default:
            startDate.setMonth(now.getMonth() - 1);
            previousStartDate.setMonth(now.getMonth() - 2);
    }

    // Get current period bookings
    const currentBookings = await Booking.find({
        bookingDate: { $gte: startDate, $lte: now }
    }).populate('userId', 'firstName lastName');

    // Get previous period bookings for comparison
    const previousBookings = await Booking.find({
        bookingDate: { $gte: previousStartDate, $lt: startDate }
    });

    // Calculate overview metrics
    const totalBookings = currentBookings.length;
    const previousTotalBookings = previousBookings.length;
    const bookingGrowth = previousTotalBookings > 0
        ? ((totalBookings - previousTotalBookings) / previousTotalBookings * 100).toFixed(1)
        : 0;

    const totalRevenue = currentBookings.reduce((sum, booking) =>
        sum + (booking.pricing.totalAmount || 0), 0
    );
    const previousTotalRevenue = previousBookings.reduce((sum, booking) =>
        sum + (booking.pricing.totalAmount || 0), 0
    );
    const revenueGrowth = previousTotalRevenue > 0
        ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue * 100).toFixed(1)
        : 0;

    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();

    // Bookings by month
    const monthlyBookings: { [key: string]: { count: number; revenue: number } } = {};
    currentBookings.forEach(booking => {
        const month = new Date(booking.bookingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
        if (!monthlyBookings[month]) {
            monthlyBookings[month] = { count: 0, revenue: 0 };
        }
        monthlyBookings[month].count++;
        monthlyBookings[month].revenue += booking.pricing.totalAmount || 0;
    });

    const bookingsByMonth = Object.entries(monthlyBookings).map(([month, data]) => ({
        month,
        count: data.count,
        revenue: data.revenue
    }));

    // Bookings by type
    const bookingTypes: { [key: string]: number } = {};
    currentBookings.forEach(booking => {
        bookingTypes[booking.bookingType] = (bookingTypes[booking.bookingType] || 0) + 1;
    });

    const bookingsByType = Object.entries(bookingTypes).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / totalBookings) * 100).toFixed(1)
    }));

    // Top properties
    const propertyBookings: { [key: string]: { name: string; bookings: number; revenue: number } } = {};

    for (const booking of currentBookings) {
        if (booking.bookingType === 'property' && booking.propertyId) {
            const propertyId = booking.propertyId.toString();
            if (!propertyBookings[propertyId]) {
                const property = await Property.findById(booking.propertyId);
                propertyBookings[propertyId] = {
                    name: property?.name || 'Unknown',
                    bookings: 0,
                    revenue: 0
                };
            }
            propertyBookings[propertyId].bookings++;
            propertyBookings[propertyId].revenue += booking.pricing.totalAmount || 0;
        }
    }

    const topProperties = Object.values(propertyBookings)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Recent bookings
    const recentBookings = await Booking.find()
        .sort({ bookingDate: -1 })
        .limit(10)
        .populate('userId', 'firstName lastName')
        .select('reservationNumber bookingType status pricing.totalAmount bookingDate userId');

    const formattedRecentBookings = recentBookings.map(booking => ({
        _id: booking._id,
        reservationNumber: booking.reservationNumber,
        bookingType: booking.bookingType,
        status: booking.status,
        totalAmount: booking.pricing.totalAmount || 0,
        bookingDate: booking.bookingDate,
        user: {
            firstName: (booking.userId as any)?.firstName || 'Unknown',
            lastName: (booking.userId as any)?.lastName || ''
        }
    }));

    res.json({
        overview: {
            totalBookings,
            totalRevenue: Math.round(totalRevenue),
            totalUsers,
            totalProperties,
            bookingGrowth: parseFloat(bookingGrowth as string),
            revenueGrowth: parseFloat(revenueGrowth as string)
        },
        bookingsByMonth,
        bookingsByType,
        topProperties,
        recentBookings: formattedRecentBookings
    });
}));

export default router;
