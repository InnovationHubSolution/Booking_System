import express, { Response } from 'express';
import Promotion from '../models/Promotion';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get active promotions
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { type, featured, applicable } = req.query;

        const query: any = {
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        };

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (applicable) {
            query.applicableFor = applicable;
        }

        if (type) {
            query.type = type;
        }

        const promotions = await Promotion.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .select('-createdBy');

        res.json({ promotions });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Validate promotion code
router.post('/validate', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { code, bookingType, itemId, amount, nights, passengers } = req.body;

        const promotion = await Promotion.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (!promotion) {
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }

        // Check usage limits
        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
            return res.status(400).json({ message: 'Promotion code has reached its usage limit' });
        }

        // Check applicable services
        if (!promotion.applicableFor.includes(bookingType)) {
            return res.status(400).json({
                message: `This promotion is not applicable for ${bookingType}`
            });
        }

        // Check specific items if applicable
        if (promotion.specificItems && promotion.specificItems.length > 0) {
            const isApplicable = promotion.specificItems.some(
                item => item.itemType === bookingType && item.itemId.toString() === itemId
            );
            if (!isApplicable) {
                return res.status(400).json({
                    message: 'This promotion is not applicable for this item'
                });
            }
        }

        // Check minimum spend
        if (promotion.minimumSpend && amount < promotion.minimumSpend) {
            return res.status(400).json({
                message: `Minimum spend of ${promotion.minimumSpend} required`
            });
        }

        // Check conditions
        if (promotion.conditions) {
            const { conditions } = promotion;

            if (conditions.minNights && nights < conditions.minNights) {
                return res.status(400).json({
                    message: `Minimum ${conditions.minNights} nights required`
                });
            }

            if (conditions.minPassengers && passengers < conditions.minPassengers) {
                return res.status(400).json({
                    message: `Minimum ${conditions.minPassengers} passengers required`
                });
            }

            if (conditions.userTierRequired && req.user?.loyaltyProgram) {
                const tierLevels: { [key: string]: number } = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
                const requiredLevel = tierLevels[conditions.userTierRequired];
                const userTier = req.user.loyaltyProgram.tier || 'bronze';
                const userLevel = tierLevels[userTier];
                if (userLevel < requiredLevel) {
                    return res.status(400).json({
                        message: `${conditions.userTierRequired} tier membership required`
                    });
                }
            }

            if (conditions.firstTimeUser) {
                // Check if user has any previous bookings
                const Booking = require('../models/Booking').default;
                const previousBookings = await Booking.countDocuments({
                    userId: req.user?._id,
                    status: { $in: ['confirmed', 'completed'] }
                });

                if (previousBookings > 0) {
                    return res.status(400).json({
                        message: 'This promotion is only for first-time users'
                    });
                }
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (promotion.type === 'percentage') {
            discountAmount = (amount * promotion.discountValue) / 100;
            if (promotion.maximumDiscount && discountAmount > promotion.maximumDiscount) {
                discountAmount = promotion.maximumDiscount;
            }
        } else if (promotion.type === 'fixed') {
            discountAmount = promotion.discountValue;
        }

        res.json({
            valid: true,
            promotion: {
                code: promotion.code,
                name: promotion.name,
                type: promotion.type,
                discountValue: promotion.discountValue,
                discountAmount,
                finalAmount: amount - discountAmount
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Apply promotion (admin only)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin' && req.user?.role !== 'host') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const promotion = new Promotion({
            ...req.body,
            createdBy: req.user._id
        });

        await promotion.save();
        res.status(201).json({ promotion });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update promotion (admin only)
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin' && req.user?.role !== 'host') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        res.json({ promotion });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Delete promotion (admin only)
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const promotion = await Promotion.findByIdAndDelete(req.params.id);

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        res.json({ message: 'Promotion deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Increment promotion usage (internal use)
router.post('/:id/use', auth, async (req: AuthRequest, res: Response) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { $inc: { usageCount: 1 } },
            { new: true }
        );

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        res.json({ promotion });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
