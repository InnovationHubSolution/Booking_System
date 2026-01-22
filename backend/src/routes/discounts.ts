import express, { Router, Response } from 'express';
import { auth, AuthRequest, isAdmin } from '../middleware/auth';
import Discount from '../models/Discount';
import DiscountUsage from '../models/DiscountUsage';

const router: Router = express.Router();

/**
 * GET /api/discounts
 * Get all active discounts (public)
 */
router.get('/', async (req, res: Response) => {
    try {
        const { category, active = 'true' } = req.query;

        const query: any = {};

        if (active === 'true') {
            query.isActive = true;
            query.validFrom = { $lte: new Date() };
            query.validUntil = { $gte: new Date() };
        }

        if (category && category !== 'all') {
            query.$or = [
                { applicableCategories: category },
                { applicableCategories: 'all' }
            ];
        }

        const discounts = await Discount.find(query)
            .select('-userRestrictions.specificUsers')
            .sort({ value: -1 });

        res.json({
            success: true,
            count: discounts.length,
            data: discounts
        });
    } catch (error: any) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch discounts',
            message: error.message
        });
    }
});

/**
 * GET /api/discounts/validate/:code
 * Validate a discount code
 */
router.get('/validate/:code', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.params;
        const { amount, category } = req.query;

        const discount = await Discount.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!discount) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Invalid or expired discount code'
            });
        }

        // Check if discount is valid
        const isValidDiscount = (discount as any).isValid();
        if (!isValidDiscount) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'This discount code has expired or reached maximum uses'
            });
        }

        // Check category applicability
        if (category && discount.applicableCategories && discount.applicableCategories.length > 0) {
            const isApplicable = discount.applicableCategories.includes('all') ||
                discount.applicableCategories.includes(category as string);
            if (!isApplicable) {
                return res.status(400).json({
                    success: false,
                    valid: false,
                    message: `This discount is not applicable to ${category} bookings`
                });
            }
        }

        // Check minimum amount
        if (amount && discount.minPurchaseAmount) {
            const purchaseAmount = parseFloat(amount as string);
            if (purchaseAmount < discount.minPurchaseAmount) {
                return res.status(400).json({
                    success: false,
                    valid: false,
                    message: `Minimum purchase amount of ${discount.minPurchaseAmount} VUV required`
                });
            }
        }

        // Check user eligibility
        const userId = (req.user as any)._id.toString();
        const canUse = await (discount as any).canUserUse(userId);

        if (!canUse) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'You are not eligible to use this discount code'
            });
        }

        // Calculate discount if amount provided
        let discountAmount = 0;
        if (amount) {
            discountAmount = (discount as any).calculateDiscount(parseFloat(amount as string));
        }

        res.json({
            success: true,
            valid: true,
            data: {
                code: discount.code,
                type: discount.type,
                value: discount.value,
                description: discount.description,
                discountAmount,
                maxDiscountAmount: discount.maxDiscountAmount
            },
            message: 'Discount code is valid'
        });
    } catch (error: any) {
        console.error('Error validating discount:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate discount code',
            message: error.message
        });
    }
});

/**
 * POST /api/discounts
 * Create a new discount (admin only)
 */
router.post('/', auth, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const discountData = req.body;

        // Check if code already exists
        const existingDiscount = await Discount.findOne({
            code: discountData.code.toUpperCase()
        });

        if (existingDiscount) {
            return res.status(400).json({
                success: false,
                error: 'A discount with this code already exists'
            });
        }

        const discount = new Discount({
            ...discountData,
            code: discountData.code.toUpperCase()
        });

        await discount.save();

        res.status(201).json({
            success: true,
            message: 'Discount created successfully',
            data: discount
        });
    } catch (error: any) {
        console.error('Error creating discount:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create discount',
            message: error.message
        });
    }
});

/**
 * PUT /api/discounts/:id
 * Update a discount (admin only)
 */
router.put('/:id', auth, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const discount = await Discount.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'Discount not found'
            });
        }

        res.json({
            success: true,
            message: 'Discount updated successfully',
            data: discount
        });
    } catch (error: any) {
        console.error('Error updating discount:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update discount',
            message: error.message
        });
    }
});

/**
 * DELETE /api/discounts/:id
 * Delete a discount (admin only)
 */
router.delete('/:id', auth, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const discount = await Discount.findByIdAndDelete(id);

        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'Discount not found'
            });
        }

        res.json({
            success: true,
            message: 'Discount deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting discount:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete discount',
            message: error.message
        });
    }
});

/**
 * GET /api/discounts/usage/my
 * Get user's discount usage history
 */
router.get('/usage/my', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id;

        const usage = await DiscountUsage.find({ userId })
            .populate('discountId', 'code description')
            .populate('bookingId', 'bookingReference status')
            .sort({ usedAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: usage.length,
            data: usage
        });
    } catch (error: any) {
        console.error('Error fetching discount usage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch discount usage',
            message: error.message
        });
    }
});

/**
 * GET /api/discounts/stats
 * Get discount statistics (admin only)
 */
router.get('/stats', auth, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const totalDiscounts = await Discount.countDocuments();
        const activeDiscounts = await Discount.countDocuments({
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        const totalUsage = await DiscountUsage.countDocuments();
        const totalDiscountAmount = await DiscountUsage.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$discountAmount' }
                }
            }
        ]);

        const topDiscounts = await DiscountUsage.aggregate([
            {
                $group: {
                    _id: '$discountId',
                    usageCount: { $sum: 1 },
                    totalSavings: { $sum: '$discountAmount' }
                }
            },
            { $sort: { usageCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'discounts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'discount'
                }
            },
            { $unwind: '$discount' }
        ]);

        res.json({
            success: true,
            data: {
                totalDiscounts,
                activeDiscounts,
                totalUsage,
                totalDiscountAmount: totalDiscountAmount[0]?.total || 0,
                topDiscounts
            }
        });
    } catch (error: any) {
        console.error('Error fetching discount stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch discount statistics',
            message: error.message
        });
    }
});

export default router;
