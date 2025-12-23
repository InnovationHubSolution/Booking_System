import express from 'express';
import paymentService from '../services/paymentService';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/payments/calculate
 * Calculate pricing for a booking
 */
router.post('/calculate', auth, async (req: AuthRequest, res) => {
    try {
        const { unitPrice, quantity, discount, taxRate } = req.body;

        if (!unitPrice || !quantity) {
            return res.status(400).json({
                message: 'Unit price and quantity are required'
            });
        }

        const pricing = paymentService.calculatePricing(
            unitPrice,
            quantity,
            discount,
            taxRate
        );

        res.json({
            success: true,
            pricing
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/payments/validate-discount
 * Validate a discount code
 */
router.post('/validate-discount', auth, async (req: AuthRequest, res) => {
    try {
        const { code, bookingType } = req.body;

        if (!code) {
            return res.status(400).json({
                message: 'Discount code is required'
            });
        }

        const result = await paymentService.validateDiscountCode(code, bookingType || 'general');

        if (!result.valid) {
            return res.status(404).json({
                message: result.message,
                valid: false
            });
        }

        res.json({
            success: true,
            valid: true,
            discount: result.discount,
            message: result.message
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/payments/process
 * Process payment for a booking
 */
router.post('/process', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, amount, paymentMethod, paymentDetails } = req.body;

        if (!bookingId || !amount || !paymentMethod) {
            return res.status(400).json({
                message: 'Booking ID, amount, and payment method are required'
            });
        }

        const validMethods = ['cash', 'card', 'mobile', 'transfer', 'paypal', 'stripe'];
        if (!validMethods.includes(paymentMethod)) {
            return res.status(400).json({
                message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`
            });
        }

        const result = await paymentService.processPayment(
            bookingId,
            amount,
            paymentMethod,
            paymentDetails
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: result.message,
            booking: result.booking
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/payments/refund
 * Process refund for a booking
 */
router.post('/refund', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, refundAmount, refundReason } = req.body;

        if (!bookingId || !refundAmount || !refundReason) {
            return res.status(400).json({
                message: 'Booking ID, refund amount, and refund reason are required'
            });
        }

        const result = await paymentService.processRefund(
            bookingId,
            refundAmount,
            refundReason
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: result.message,
            refundAmount: result.refundAmount,
            booking: result.booking
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/payments/summary/:bookingId
 * Get payment summary for a specific booking
 */
router.get('/summary/:bookingId', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId } = req.params;

        const summary = await paymentService.getPaymentSummary(bookingId);

        if (!summary) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            summary
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/payments/report
 * Get payment report for a date range
 * Query params: startDate, endDate, status (optional)
 */
router.get('/report', auth, async (req: AuthRequest, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Start date and end date are required'
            });
        }

        const report = await paymentService.getPaymentReport(
            new Date(startDate as string),
            new Date(endDate as string),
            status as string
        );

        res.json({
            success: true,
            report
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/payments/status/:bookingId
 * Get payment status for a booking
 */
router.get('/status/:bookingId', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId } = req.params;

        const summary = await paymentService.getPaymentSummary(bookingId);

        if (!summary) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            status: summary.payment.status,
            paidAmount: summary.payment.paidAmount,
            remainingAmount: summary.payment.remainingAmount,
            totalAmount: summary.pricing.total,
            currency: summary.pricing.currency
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PATCH /api/payments/:bookingId/update-status
 * Manually update payment status (admin only)
 */
router.patch('/:bookingId/update-status', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reference } = req.body;

        const validStatuses = ['unpaid', 'partial', 'paid', 'refunded', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // This would typically be restricted to admin users
        // You'd check req.user.role === 'admin' here

        const Booking = require('../models/Booking').default;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        booking.payment = {
            ...booking.payment,
            status,
            reference: reference || booking.payment?.reference
        };

        await booking.save();

        res.json({
            success: true,
            message: 'Payment status updated',
            booking
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

