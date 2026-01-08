/**
 * Example: Booking Route with Full Audit Control
 * This file demonstrates how to properly use the audit system in route handlers
 */

import express, { Router } from 'express';
import { auth as authenticateUser } from '../middleware/auth';
import { RequestWithAudit, withAuditContext, createAuditHistory } from '../middleware/audit';
import Booking from '../models/Booking';

const router: Router = express.Router();

/**
 * CREATE BOOKING with audit tracking
 * POST /api/bookings
 */
router.post('/', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const bookingData = req.body;

        // Create new booking
        const booking = new Booking({
            ...bookingData,
            userId: (req as any).user._id,
            status: 'pending',
            bookingDate: new Date()
        });

        // Attach audit context (who created this booking)
        if (req.auditContext) {
            withAuditContext(booking, req.auditContext);
        }

        await booking.save();
        // Audit history is automatically created by the plugin

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error: any) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking',
            details: error.message
        });
    }
});

/**
 * UPDATE BOOKING STATUS with audit tracking
 * PUT /api/bookings/:id/status
 */
router.put('/:id/status', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Check authorization
        const isAdmin = (req as any).user.role === 'admin';
        const isOwner = booking.userId.toString() === (req as any).user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this booking'
            });
        }

        const oldStatus = booking.status;

        // Update status
        booking.status = status;
        if (status === 'cancelled' && reason) {
            booking.cancellationReason = reason;
            booking.cancelledAt = new Date();
        }

        // Attach audit context
        if (req.auditContext) {
            withAuditContext(booking, req.auditContext);
        }

        await booking.save();
        // Audit history with field changes is automatically tracked

        res.json({
            success: true,
            message: `Booking status updated from ${oldStatus} to ${status}`,
            data: booking
        });
    } catch (error: any) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking status',
            details: error.message
        });
    }
});

/**
 * PROCESS PAYMENT with custom audit logging
 * POST /api/bookings/:id/payment
 */
router.post('/:id/payment', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const { id } = req.params;
        const { amount, method, transactionId } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Store old values for audit
        const oldPaymentStatus = booking.payment.status;
        const oldPaidAmount = booking.payment.paidAmount;

        // Process payment (simplified)
        booking.payment.paidAmount += amount;
        booking.payment.method = method;
        booking.payment.transactionId = transactionId;

        if (booking.payment.paidAmount >= booking.pricing.totalAmount) {
            booking.payment.status = 'paid';
            booking.payment.paidAt = new Date();
            booking.status = 'confirmed';
        } else {
            booking.payment.status = 'partial';
        }

        booking.payment.remainingAmount = booking.pricing.totalAmount - booking.payment.paidAmount;

        // Attach audit context
        if (req.auditContext) {
            withAuditContext(booking, req.auditContext);
        }

        await booking.save();

        // Create custom detailed audit entry for payment
        if (req.auditContext) {
            await createAuditHistory(
                booking._id,
                'Booking',
                'update',
                req.auditContext,
                [
                    {
                        field: 'payment.status',
                        oldValue: oldPaymentStatus,
                        newValue: booking.payment.status
                    },
                    {
                        field: 'payment.paidAmount',
                        oldValue: oldPaidAmount,
                        newValue: booking.payment.paidAmount
                    },
                    {
                        field: 'payment.method',
                        oldValue: null,
                        newValue: method
                    }
                ],
                `Payment of ${amount} ${booking.pricing.currency} processed via ${method}`
            );
        }

        res.json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                booking,
                paymentDetails: {
                    amountPaid: amount,
                    totalPaid: booking.payment.paidAmount,
                    remaining: booking.payment.remainingAmount,
                    status: booking.payment.status
                }
            }
        });
    } catch (error: any) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process payment',
            details: error.message
        });
    }
});

/**
 * CANCEL BOOKING with soft delete
 * DELETE /api/bookings/:id
 */
router.delete('/:id', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Check authorization
        const isAdmin = (req as any).user.role === 'admin';
        const isOwner = booking.userId.toString() === (req as any).user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this booking'
            });
        }

        // Soft delete the booking
        await (booking as any).softDelete(
            req.auditContext,
            reason || 'Booking cancelled by user'
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                bookingId: booking._id,
                cancelledAt: booking.deletedAt,
                reason: booking.deletedReason
            }
        });
    } catch (error: any) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking',
            details: error.message
        });
    }
});

/**
 * RESTORE CANCELLED BOOKING
 * POST /api/bookings/:id/restore
 */
router.post('/:id/restore', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Only admins can restore bookings
        if ((req as any).user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required to restore bookings'
            });
        }

        const { id } = req.params;

        // Include deleted bookings in query
        const booking = await Booking.findById(id).setOptions({ includeDeleted: true });
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        if (!booking.isDeleted) {
            return res.status(400).json({
                success: false,
                error: 'Booking is not cancelled'
            });
        }

        // Restore the booking
        await (booking as any).restore(req.auditContext);

        res.json({
            success: true,
            message: 'Booking restored successfully',
            data: booking
        });
    } catch (error: any) {
        console.error('Error restoring booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore booking',
            details: error.message
        });
    }
});

/**
 * GET BOOKING AUDIT HISTORY
 * GET /api/bookings/:id/audit-history
 */
router.get('/:id/audit-history', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Check authorization
        const isAdmin = (req as any).user.role === 'admin';
        const isOwner = booking.userId.toString() === (req as any).user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view audit history'
            });
        }

        const AuditHistory = (await import('../models/AuditHistory')).default;
        const history = await AuditHistory.find({
            recordId: id,
            recordType: 'Booking'
        })
            .populate('performedBy', 'firstName lastName email role')
            .sort({ performedAt: -1 });

        res.json({
            success: true,
            bookingId: id,
            totalChanges: history.length,
            data: history
        });
    } catch (error: any) {
        console.error('Error fetching audit history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit history',
            details: error.message
        });
    }
});

/**
 * BULK UPDATE BOOKINGS (with audit tracking)
 * POST /api/bookings/bulk-update
 */
router.post('/bulk-update', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Only admins can bulk update
        if ((req as any).user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required for bulk operations'
            });
        }

        const { bookingIds, updates } = req.body;

        if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking IDs'
            });
        }

        const results = {
            successful: [] as any[],
            failed: [] as any[]
        };

        // Process each booking
        for (const bookingId of bookingIds) {
            try {
                const booking = await Booking.findById(bookingId);
                if (!booking) {
                    results.failed.push({ bookingId, reason: 'Not found' });
                    continue;
                }

                // Apply updates
                Object.assign(booking, updates);

                // Attach audit context
                if (req.auditContext) {
                    withAuditContext(booking, req.auditContext);
                }

                await booking.save();
                results.successful.push(bookingId);
            } catch (error: any) {
                results.failed.push({ bookingId, reason: error.message });
            }
        }

        res.json({
            success: true,
            message: `Updated ${results.successful.length} of ${bookingIds.length} bookings`,
            results
        });
    } catch (error: any) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform bulk update',
            details: error.message
        });
    }
});

export default router;
