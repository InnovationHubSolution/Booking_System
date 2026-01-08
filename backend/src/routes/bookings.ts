import express, { Request, Response } from 'express';
import Booking from '../models/Booking';
import Property from '../models/Property';
import Service from '../models/Service';
import { auth, AuthRequest } from '../middleware/auth';
import availabilityService from '../services/availabilityService';
import paymentService from '../services/paymentService';

const router = express.Router();

/**
 * @swagger
 * /api/bookings/property:
 *   post:
 *     summary: Create a property booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - roomType
 *               - checkInDate
 *               - checkOutDate
 *               - guestCount
 *               - guestDetails
 *             properties:
 *               propertyId:
 *                 type: string
 *               roomType:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               guestCount:
 *                 type: number
 *               guestDetails:
 *                 type: object
 *               specialRequests:
 *                 type: string
 *               discountCode:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
// Create booking for property
router.post('/property', auth, async (req: AuthRequest, res: Response) => {
    try {
        const {
            propertyId,
            roomType,
            checkInDate,
            checkOutDate,
            guestCount,
            guestDetails,
            specialRequests,
            discountCode,
            currency
        } = req.body;

        // Validate guest details
        if (!guestDetails || !guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
            return res.status(400).json({
                message: 'Guest details are incomplete. Please provide first name, last name, email, and phone number.'
            });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Calculate nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        if (nights < 1) {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        // Find room and calculate price
        const room = property.rooms.find(r => r.type === roomType);
        if (!room) {
            return res.status(404).json({ message: 'Room type not found' });
        }

        // Validate and apply discount if provided
        let discount;
        if (discountCode) {
            const discountValidation = await paymentService.validateDiscountCode(discountCode, 'property');
            if (discountValidation.valid) {
                discount = discountValidation.discount;
            }
        }

        // Calculate comprehensive pricing
        const pricing = paymentService.calculatePricing(
            room.pricePerNight,
            nights,
            discount,
            15 // 15% VAT for Vanuatu
        );

        const totalPrice = pricing.totalAmount;

        // Check availability
        const conflictingBookings = await Booking.find({
            propertyId,
            roomType,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
            ]
        });

        if (conflictingBookings.length >= room.count) {
            return res.status(400).json({
                message: 'Room not available for selected dates',
                conflictingBookings: conflictingBookings.length,
                availableRooms: room.count - conflictingBookings.length
            });
        }

        // Generate room number for allocation
        const roomNumber = `${property.name.substring(0, 3).toUpperCase()}-${roomType.substring(0, 3).toUpperCase()}-${String(conflictingBookings.length + 1).padStart(3, '0')}`;

        // Generate unique reservation and reference numbers
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const reservationNumber = `VU-${timestamp}-${random}`;
        const referenceNumber = `BK-${property.name.substring(0, 3).toUpperCase()}-${timestamp}`;

        const booking = new Booking({
            reservationNumber,
            referenceNumber,
            bookingType: 'property',
            bookingSource: req.body.bookingSource || 'online',
            userId: req.user?.userId,
            propertyId,
            roomType,
            checkInDate,
            checkOutDate,
            nights,
            totalPrice, // Legacy field
            // New comprehensive pricing
            pricing: {
                unitPrice: room.pricePerNight,
                quantity: nights,
                subtotal: pricing.subtotal,
                discount: discount ? {
                    type: discount.type,
                    value: discount.value,
                    code: discount.code,
                    reason: discount.reason
                } : undefined,
                discountAmount: pricing.discountAmount,
                taxRate: pricing.taxRate,
                taxAmount: pricing.taxAmount,
                totalAmount: pricing.totalAmount,
                currency: currency || 'VUV'
            },
            // Payment tracking
            payment: {
                status: 'unpaid',
                paidAmount: 0,
                remainingAmount: pricing.totalAmount
            },
            guestCount: {
                adults: guestCount?.adults || 1,
                children: guestCount?.children || 0
            },
            guestDetails,
            specialRequests,
            // Allocate resource
            resourceAllocation: {
                resourceId: roomNumber,
                resourceType: 'room',
                resourceName: `${roomType} - ${roomNumber}`,
                capacity: room.maxGuests,
                allocatedQuantity: (guestCount?.adults || 1) + (guestCount?.children || 0),
                availabilityStatus: 'allocated',
                assignedBy: req.user?.userId,
                assignedAt: new Date(),
                notes: `Auto-assigned to ${guestDetails.firstName} ${guestDetails.lastName}`
            }
        });

        await booking.save();
        await booking.populate('propertyId');

        res.status(201).json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create booking for service (legacy)
router.post('/service', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { serviceId, checkInDate, checkOutDate, guestCount, guestDetails, currency } = req.body;

        // Validate guest details
        if (!guestDetails || !guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
            return res.status(400).json({
                message: 'Guest details are incomplete. Please provide first name, last name, email, and phone number.'
            });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const duration = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60);
        const quantity = Math.max(1, guestCount?.adults || 1);
        const unitPrice = service.price;
        const subtotal = unitPrice * quantity;
        const taxRate = 15;
        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        // Generate unique reservation and reference numbers
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const reservationNumber = `VU-SVC-${timestamp}-${random}`;
        const referenceNumber = `SVC-${service.name.substring(0, 3).toUpperCase()}-${timestamp}`;

        const booking = new Booking({
            reservationNumber,
            referenceNumber,
            bookingType: 'service',
            bookingSource: req.body.bookingSource || 'online',
            userId: req.user?.userId,
            serviceId,
            checkInDate,
            checkOutDate,
            nights: 1,
            totalPrice: totalAmount,
            pricing: {
                unitPrice,
                quantity,
                subtotal,
                discountAmount: 0,
                taxRate,
                taxAmount,
                totalAmount,
                currency: currency || 'VUV'
            },
            payment: {
                status: 'unpaid',
                paidAmount: 0,
                remainingAmount: totalAmount
            },
            guestCount: {
                adults: guestCount?.adults || 1,
                children: guestCount?.children || 0
            },
            guestDetails
        });

        await booking.save();
        await booking.populate('serviceId');
        res.status(201).json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get user bookings
router.get('/my-bookings', auth, async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking.find({ userId: req.user?.userId })
            .populate('propertyId')
            .populate('serviceId')
            .sort({ checkInDate: -1 });

        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get all bookings (admin only)
router.get('/all', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const bookings = await Booking.find()
            .populate('userId', 'firstName lastName email')
            .populate('propertyId', 'name address')
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get host bookings
router.get('/host/bookings', auth, async (req: AuthRequest, res: Response) => {
    try {
        const properties = await Property.find({ ownerId: req.user?.userId });
        const propertyIds = properties.map(p => p._id);

        const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
            .populate('userId', 'firstName lastName email phone')
            .populate('propertyId', 'name')
            .sort({ checkInDate: -1 });

        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get booking by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('propertyId')
            .populate('serviceId')
            .populate('userId', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (
            booking.userId._id.toString() !== req.user?.userId &&
            req.user?.role !== 'admin'
        ) {
            const property = await Property.findById(booking.propertyId);
            if (!property || property.ownerId.toString() !== req.user?.userId) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = req.body.reason;
        booking.cancelledAt = new Date();

        await booking.save();
        res.json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update booking status (host/admin)
router.patch('/:id/status', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id).populate('propertyId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        let authorized = req.user?.role === 'admin';
        if (!authorized && booking.propertyId) {
            const property = await Property.findById(booking.propertyId);
            authorized = property?.ownerId.toString() === req.user?.userId;
        }

        if (!authorized) {
            return res.status(403).json({ message: 'Access denied' });
        }

        booking.status = status;
        await booking.save();

        res.json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update payment status
router.patch('/:id/payment', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { paymentStatus } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        booking.paymentStatus = paymentStatus;
        await booking.save();

        res.json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
