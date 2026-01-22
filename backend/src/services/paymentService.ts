import Booking from '../models/Booking';
import mongoose from 'mongoose';
import stripeService from './stripeService';

/**
 * Payment Service
 * Handles all payment-related business logic including calculations, processing, and refunds
 */

interface PricingCalculation {
    unitPrice: number;
    quantity: number;
    subtotal: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
}

interface DiscountConfig {
    type: 'percentage' | 'fixed' | 'coupon' | 'seasonal';
    value: number;
    code?: string;
    reason?: string;
}

interface PaymentProcessingResult {
    success: boolean;
    message: string;
    booking?: any;
    error?: string;
}

interface RefundResult {
    success: boolean;
    message: string;
    refundAmount: number;
    booking?: any;
    error?: string;
}

/**
 * Calculate comprehensive pricing for a booking
 * @param unitPrice - Price per unit (per night, per person, per item)
 * @param quantity - Number of units (nights, passengers, items)
 * @param discount - Optional discount configuration
 * @param taxRate - Tax/VAT rate percentage (default: 15% for Vanuatu)
 * @returns Complete pricing breakdown
 */
export const calculatePricing = (
    unitPrice: number,
    quantity: number,
    discount?: DiscountConfig,
    taxRate: number = 15
): PricingCalculation => {
    // Calculate subtotal
    const subtotal = unitPrice * quantity;

    // Calculate discount
    let discountAmount = 0;
    if (discount) {
        if (discount.type === 'percentage') {
            discountAmount = (subtotal * discount.value) / 100;
        } else if (discount.type === 'fixed' || discount.type === 'coupon' || discount.type === 'seasonal') {
            discountAmount = discount.value;
        }
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    // Calculate amount after discount
    const amountAfterDiscount = subtotal - discountAmount;

    // Calculate tax on discounted amount
    const taxAmount = (amountAfterDiscount * taxRate) / 100;

    // Calculate final total
    const totalAmount = amountAfterDiscount + taxAmount;

    return {
        unitPrice,
        quantity,
        subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
        discountAmount: Math.round(discountAmount * 100) / 100,
        taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
};

/**
 * Generate unique payment reference number
 * Format: PAY-YYYYMMDD-XXXXXX
 */
export const generatePaymentReference = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    return `PAY-${year}${month}${day}-${random}`;
};

/**
 * Generate unique transaction ID
 * Format: TXN-TIMESTAMP-RANDOM
 */
export const generateTransactionId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN-${timestamp}-${random}`;
};

/**
 * Process payment for a booking
 * @param bookingId - Booking ID
 * @param amount - Amount to be paid
 * @param paymentMethod - Payment method used
 * @param paymentDetails - Additional payment details (card info, mobile provider, etc.)
 * @returns Payment processing result
 */
export const processPayment = async (
    bookingId: string,
    amount: number,
    paymentMethod: 'cash' | 'credit-card' | 'debit-card' | 'mobile-money' | 'bank-transfer' | 'paypal' | 'stripe' | 'western-union' | 'money-gram' | 'travelex' | 'eftpos' | 'american-express' | 'diners-club' | 'alipay' | 'wechat-pay' | 'unionpay' | 'crypto',
    paymentDetails?: any
): Promise<PaymentProcessingResult> => {
    try {
        // Fetch booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        // Check if booking is already paid
        if (booking.payment?.status === 'paid') {
            return {
                success: false,
                message: 'Booking is already fully paid',
                error: 'ALREADY_PAID'
            };
        }

        // Get total amount due
        const totalAmount = booking.pricing?.totalAmount || booking.totalPrice || 0;
        const currentPaid = booking.payment?.paidAmount || 0;
        const remaining = totalAmount - currentPaid;

        // Validate payment amount
        if (amount <= 0) {
            return {
                success: false,
                message: 'Invalid payment amount',
                error: 'INVALID_AMOUNT'
            };
        }

        if (amount > remaining) {
            return {
                success: false,
                message: `Payment amount exceeds remaining balance. Remaining: ${remaining} ${booking.pricing?.currency || 'VUV'}`,
                error: 'AMOUNT_EXCEEDS_BALANCE'
            };
        }

        // Calculate new paid amount and remaining
        const newPaidAmount = currentPaid + amount;
        const newRemaining = totalAmount - newPaidAmount;

        // Determine payment status
        let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'partial';
        if (newRemaining === 0) {
            paymentStatus = 'paid';
        } else if (newPaidAmount === 0) {
            paymentStatus = 'unpaid';
        }

        // Generate payment reference and transaction ID
        const paymentReference = generatePaymentReference();
        const transactionId = generateTransactionId();

        // Process payment based on method
        let paymentProcessingResult;
        switch (paymentMethod) {
            case 'stripe':
            case 'credit-card':
            case 'debit-card':
                if (paymentDetails?.paymentIntentId && paymentDetails?.paymentMethodId) {
                    try {
                        paymentProcessingResult = await stripeService.confirmPayment(
                            paymentDetails.paymentIntentId,
                            paymentDetails.paymentMethodId
                        );
                    } catch (error: any) {
                        return {
                            success: false,
                            message: `Card payment failed: ${error.message}`,
                            error: 'STRIPE_PAYMENT_FAILED'
                        };
                    }
                } else if (paymentDetails?.card) {
                    // Create payment intent and process
                    try {
                        const paymentIntent = await stripeService.createPaymentIntent(
                            amount,
                            booking.pricing?.currency || 'usd',
                            {
                                booking_id: bookingId,
                                payment_reference: paymentReference
                            }
                        );

                        const paymentMethodId = await stripeService.createPaymentMethod({
                            number: paymentDetails.card.number,
                            exp_month: paymentDetails.card.expMonth,
                            exp_year: paymentDetails.card.expYear,
                            cvc: paymentDetails.card.cvv,
                            name: paymentDetails.card.name
                        });

                        paymentProcessingResult = await stripeService.confirmPayment(
                            paymentIntent.id,
                            paymentMethodId
                        );
                    } catch (error: any) {
                        return {
                            success: false,
                            message: `Card payment failed: ${error.message}`,
                            error: 'STRIPE_PROCESSING_FAILED'
                        };
                    }
                }
                break;

            case 'paypal':
                // PayPal integration would go here
                // For now, mark as pending manual verification
                paymentProcessingResult = { status: 'requires_payment_method' };
                break;

            case 'cash':
                // Cash payments are confirmed when received at counter
                paymentProcessingResult = { status: 'succeeded' };
                break;

            case 'bank-transfer':
            case 'mobile-money':
            case 'western-union':
            case 'money-gram':
                // These require manual verification
                paymentProcessingResult = { status: 'requires_payment_method' };
                paymentStatus = 'partial'; // Keep as partial until verified
                break;

            default:
                paymentProcessingResult = { status: 'requires_payment_method' };
                break;
        }

        // Check if payment was successful
        if (paymentProcessingResult && paymentProcessingResult.status !== 'succeeded') {
            // Payment failed or requires additional action
            if (paymentProcessingResult.status === 'requires_payment_method') {
                paymentStatus = 'partial'; // Mark as partial payment pending verification
            } else {
                return {
                    success: false,
                    message: 'Payment processing failed. Please try again.',
                    error: 'PAYMENT_FAILED'
                };
            }
        }

        // Update booking payment information
        booking.payment = {
            status: paymentStatus,
            method: paymentMethod,
            reference: paymentReference,
            transactionId: transactionId,
            paidAmount: newPaidAmount,
            remainingAmount: newRemaining,
            paidAt: paymentStatus === 'paid' ? new Date() : booking.payment?.paidAt,
            refundAmount: booking.payment?.refundAmount || 0,
            refundReason: booking.payment?.refundReason,
            refundedAt: booking.payment?.refundedAt,
            paymentDetails: paymentDetails || booking.payment?.paymentDetails
        };

        // Update legacy paymentStatus field for backward compatibility
        if (paymentStatus === 'paid') {
            booking.paymentStatus = 'paid';
        }

        // If payment is complete, update booking status
        if (paymentStatus === 'paid' && booking.status === 'pending') {
            booking.status = 'confirmed';
        }

        await booking.save();

        return {
            success: true,
            message: `Payment of ${amount} ${booking.pricing?.currency || 'VUV'} processed successfully. ${paymentStatus === 'paid' ? 'Booking fully paid.' : `Remaining: ${newRemaining}`}`,
            booking: booking.toObject()
        };

    } catch (error: any) {
        return {
            success: false,
            message: 'Payment processing failed',
            error: error.message
        };
    }
};

/**
 * Process refund for a booking
 * @param bookingId - Booking ID
 * @param refundAmount - Amount to be refunded
 * @param refundReason - Reason for refund
 * @returns Refund processing result
 */
export const processRefund = async (
    bookingId: string,
    refundAmount: number,
    refundReason: string
): Promise<RefundResult> => {
    try {
        // Fetch booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                refundAmount: 0,
                error: 'BOOKING_NOT_FOUND'
            };
        }

        // Check if booking has payment
        if (!booking.payment || booking.payment.paidAmount === 0) {
            return {
                success: false,
                message: 'No payment found to refund',
                refundAmount: 0,
                error: 'NO_PAYMENT'
            };
        }

        // Validate refund amount
        if (refundAmount <= 0) {
            return {
                success: false,
                message: 'Invalid refund amount',
                refundAmount: 0,
                error: 'INVALID_AMOUNT'
            };
        }

        const maxRefundable = booking.payment.paidAmount - (booking.payment.refundAmount || 0);
        if (refundAmount > maxRefundable) {
            return {
                success: false,
                message: `Refund amount exceeds available amount. Maximum refundable: ${maxRefundable} ${booking.pricing?.currency || 'VUV'}`,
                refundAmount: 0,
                error: 'AMOUNT_EXCEEDS_PAID'
            };
        }

        // Calculate new refund total
        const newRefundAmount = (booking.payment.refundAmount || 0) + refundAmount;

        // Update payment status
        let paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'failed' = booking.payment.status;
        if (newRefundAmount === booking.payment.paidAmount) {
            paymentStatus = 'refunded';
        }

        // Update booking
        booking.payment = {
            ...booking.payment,
            status: paymentStatus,
            refundAmount: newRefundAmount,
            refundReason: refundReason,
            refundedAt: new Date()
        };

        // Update booking status if fully refunded
        if (paymentStatus === 'refunded') {
            booking.status = 'cancelled';
            booking.paymentStatus = 'refunded'; // Update legacy field
            booking.cancelledAt = new Date();
            booking.cancellationReason = refundReason;
        }

        await booking.save();

        return {
            success: true,
            message: `Refund of ${refundAmount} ${booking.pricing?.currency || 'VUV'} processed successfully${paymentStatus === 'refunded' ? '. Fully refunded.' : '.'}`,
            refundAmount: newRefundAmount,
            booking: booking.toObject()
        };

    } catch (error: any) {
        return {
            success: false,
            message: 'Refund processing failed',
            refundAmount: 0,
            error: error.message
        };
    }
};

/**
 * Get payment summary for a booking
 */
export const getPaymentSummary = async (bookingId: string) => {
    try {
        const booking = await Booking.findById(bookingId)
            .populate('userId', 'firstName lastName email');

        if (!booking) {
            return null;
        }

        const totalAmount = booking.pricing?.totalAmount || booking.totalPrice || 0;
        const paidAmount = booking.payment?.paidAmount || 0;
        const refundAmount = booking.payment?.refundAmount || 0;
        const remainingAmount = totalAmount - paidAmount;

        return {
            bookingId: booking._id,
            reservationNumber: booking.reservationNumber,
            customer: booking.userId,
            pricing: {
                unitPrice: booking.pricing?.unitPrice || 0,
                quantity: booking.pricing?.quantity || 1,
                subtotal: booking.pricing?.subtotal || 0,
                discount: {
                    type: booking.pricing?.discount?.type,
                    value: booking.pricing?.discount?.value,
                    code: booking.pricing?.discount?.code,
                    amount: booking.pricing?.discountAmount || 0
                },
                tax: {
                    rate: booking.pricing?.taxRate || 0,
                    amount: booking.pricing?.taxAmount || 0
                },
                total: totalAmount,
                currency: booking.pricing?.currency || 'VUV'
            },
            payment: {
                status: booking.payment?.status || 'unpaid',
                method: booking.payment?.method,
                reference: booking.payment?.reference,
                transactionId: booking.payment?.transactionId,
                paidAmount,
                remainingAmount,
                refundAmount,
                paidAt: booking.payment?.paidAt,
                refundedAt: booking.payment?.refundedAt
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all payments within a date range (for reporting)
 */
export const getPaymentReport = async (
    startDate: Date,
    endDate: Date,
    paymentStatus?: string
) => {
    try {
        const query: any = {
            'payment.paidAt': {
                $gte: startDate,
                $lte: endDate
            }
        };

        if (paymentStatus) {
            query['payment.status'] = paymentStatus;
        }

        const bookings = await Booking.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('propertyId', 'name')
            .populate('serviceId', 'name')
            .populate('packageId', 'name')
            .sort({ 'payment.paidAt': -1 });

        const summary = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((sum, b) => sum + (b.payment?.paidAmount || 0), 0),
            totalRefunded: bookings.reduce((sum, b) => sum + (b.payment?.refundAmount || 0), 0),
            byPaymentMethod: {} as any,
            byStatus: {} as any
        };

        // Group by payment method
        bookings.forEach(booking => {
            const method = booking.payment?.method || 'unknown';
            const status = booking.payment?.status || 'unknown';

            summary.byPaymentMethod[method] = (summary.byPaymentMethod[method] || 0) + (booking.payment?.paidAmount || 0);
            summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
        });

        return {
            period: { startDate, endDate },
            summary,
            bookings
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Validate discount code
 */
export const validateDiscountCode = async (
    code: string,
    bookingType: string,
    userId?: string,
    amount?: number
): Promise<{
    valid: boolean;
    discount?: DiscountConfig;
    message?: string;
}> => {
    try {
        const Discount = (await import('../models/Discount')).default;

        // Find the discount by code
        const discount = await Discount.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!discount) {
            return {
                valid: false,
                message: 'Invalid or expired discount code'
            };
        }

        // Check if discount is valid (date range, max uses, etc.)
        if (!discount.isValid()) {
            return {
                valid: false,
                message: 'This discount code has expired or reached maximum uses'
            };
        }

        // Check if discount is applicable to this booking category
        if (discount.applicableCategories && discount.applicableCategories.length > 0) {
            const isApplicable = discount.applicableCategories.includes('all') ||
                discount.applicableCategories.includes(bookingType);
            if (!isApplicable) {
                return {
                    valid: false,
                    message: `This discount is not applicable to ${bookingType} bookings`
                };
            }
        }

        // Check minimum purchase amount
        if (amount && discount.minPurchaseAmount && amount < discount.minPurchaseAmount) {
            return {
                valid: false,
                message: `Minimum purchase amount of ${discount.minPurchaseAmount} VUV required`
            };
        }

        // Check if user can use this discount
        if (userId) {
            const canUse = await discount.canUserUse(userId);
            if (!canUse) {
                return {
                    valid: false,
                    message: 'You are not eligible to use this discount code'
                };
            }
        }

        // Return valid discount
        return {
            valid: true,
            discount: {
                type: discount.type,
                value: discount.value,
                code: discount.code,
                reason: discount.description
            },
            message: 'Discount code applied successfully'
        };
    } catch (error) {
        console.error('Error validating discount code:', error);
        return {
            valid: false,
            message: 'Error validating discount code'
        };
    }
};

export default {
    calculatePricing,
    generatePaymentReference,
    generateTransactionId,
    processPayment,
    processRefund,
    getPaymentSummary,
    getPaymentReport,
    validateDiscountCode
};
