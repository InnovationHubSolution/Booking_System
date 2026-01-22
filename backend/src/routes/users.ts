import express, { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Booking from '../models/Booking';

const router: Router = express.Router();

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;

        const user = await User.findById(userId)
            .select('-password')
            .populate('preferences');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user profile',
            message: error.message
        });
    }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const updateData = req.body;

        // Don't allow updating password or email through this endpoint
        delete updateData.password;
        delete updateData.email;
        delete updateData.role;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            message: error.message
        });
    }
});

/**
 * PUT /api/users/password
 * Change user password
 */
router.put('/password', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.default.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error: any) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password',
            message: error.message
        });
    }
});

/**
 * GET /api/users/bookings
 * Get user's booking history
 */
router.get('/bookings', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const { status, limit = 20, page = 1 } = req.query;

        const query: any = { userId };
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .sort({ bookingDate: -1 })
                .limit(parseInt(limit as string))
                .skip(skip)
                .populate('propertyId', 'name images location')
                .populate('serviceId', 'name type images'),
            Booking.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: bookings.length,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string)),
            data: bookings
        });
    } catch (error: any) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings',
            message: error.message
        });
    }
});

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;

        const [totalBookings, completedBookings, cancelledBookings, totalSpent] = await Promise.all([
            Booking.countDocuments({ userId }),
            Booking.countDocuments({ userId, status: 'completed' }),
            Booking.countDocuments({ userId, status: 'cancelled' }),
            Booking.aggregate([
                { $match: { userId: userId, status: { $in: ['completed', 'confirmed'] } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalBookings,
                completedBookings,
                cancelledBookings,
                activeBookings: totalBookings - completedBookings - cancelledBookings,
                totalSpent: totalSpent[0]?.total || 0
            }
        });
    } catch (error: any) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user statistics',
            message: error.message
        });
    }
});

/**
 * POST /api/users/preferences
 * Update user preferences
 */
router.post('/preferences', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const preferences = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { preferences } },
            { new: true }
        ).select('preferences');

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: user?.preferences
        });
    } catch (error: any) {
        console.error('Error updating preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences',
            message: error.message
        });
    }
});

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required to delete account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify password
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Incorrect password'
            });
        }

        // Check for active bookings
        const activeBookings = await Booking.countDocuments({
            userId,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete account with active bookings. Please cancel or complete all bookings first.'
            });
        }

        // Soft delete - deactivate account
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error: any) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account',
            message: error.message
        });
    }
});

export default router;
