import express from 'express';
import advancedBookingService from '../services/advancedBookingService';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/advanced/check-in
 * Process customer check-in
 */
router.post('/check-in', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, actualArrivalTime, notes, location } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                message: 'Booking ID is required'
            });
        }

        const result = await advancedBookingService.processCheckIn({
            bookingId,
            checkedInBy: req.user?.userId,
            actualArrivalTime: actualArrivalTime ? new Date(actualArrivalTime) : undefined,
            notes,
            location
        });

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/advanced/check-out
 * Process customer check-out
 */
router.post('/check-out', auth, async (req: AuthRequest, res) => {
    try {
        const {
            bookingId,
            actualDepartureTime,
            notes,
            damageReported,
            damageDescription,
            location
        } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                message: 'Booking ID is required'
            });
        }

        const result = await advancedBookingService.processCheckOut({
            bookingId,
            checkedOutBy: req.user?.userId,
            actualDepartureTime: actualDepartureTime ? new Date(actualDepartureTime) : undefined,
            notes,
            damageReported,
            damageDescription,
            location
        });

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/advanced/signature
 * Save customer signature
 */
router.post('/signature', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, signatureData, deviceInfo } = req.body;

        if (!bookingId || !signatureData) {
            return res.status(400).json({
                message: 'Booking ID and signature data are required'
            });
        }

        const result = await advancedBookingService.saveSignature({
            bookingId,
            signatureData,
            deviceInfo,
            ipAddress: req.ip
        });

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/advanced/accept-terms
 * Accept terms and conditions
 */
router.post('/accept-terms', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, version } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                message: 'Booking ID is required'
            });
        }

        const result = await advancedBookingService.acceptTerms({
            bookingId,
            version,
            ipAddress: req.ip
        });

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/advanced/location/pickup
 * Update pickup location
 */
router.post('/location/pickup', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, latitude, longitude, address } = req.body;

        if (!bookingId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: 'Booking ID, latitude, and longitude are required'
            });
        }

        const result = await advancedBookingService.updatePickupLocation(
            bookingId,
            latitude,
            longitude,
            address
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/advanced/location/dropoff
 * Update dropoff location
 */
router.post('/location/dropoff', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, latitude, longitude, address } = req.body;

        if (!bookingId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: 'Booking ID, latitude, and longitude are required'
            });
        }

        const result = await advancedBookingService.updateDropoffLocation(
            bookingId,
            latitude,
            longitude,
            address
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/advanced/location/track
 * Add real-time tracking point
 */
router.post('/location/track', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId, latitude, longitude, speed, heading } = req.body;

        if (!bookingId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: 'Booking ID, latitude, and longitude are required'
            });
        }

        const result = await advancedBookingService.addTrackingPoint({
            bookingId,
            latitude,
            longitude,
            speed,
            heading
        });

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/advanced/qr/:qrCode
 * Get booking by QR code
 */
router.get('/qr/:qrCode', async (req: AuthRequest, res) => {
    try {
        const { qrCode } = req.params;

        const result = await advancedBookingService.getBookingByQRCode(qrCode);

        if (!result.success) {
            return res.status(404).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/advanced/barcode/:barcode
 * Get booking by barcode
 */
router.get('/barcode/:barcode', async (req: AuthRequest, res) => {
    try {
        const { barcode } = req.params;

        const result = await advancedBookingService.getBookingByBarcode(barcode);

        if (!result.success) {
            return res.status(404).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/advanced/check-in/stats
 * Get check-in statistics
 * Query params: startDate, endDate
 */
router.get('/check-in/stats', auth, async (req: AuthRequest, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Start date and end date are required'
            });
        }

        const result = await advancedBookingService.getCheckInStats(
            new Date(startDate as string),
            new Date(endDate as string)
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/advanced/tracking/active
 * Get all active tracking bookings (real-time)
 */
router.get('/tracking/active', auth, async (req: AuthRequest, res) => {
    try {
        const result = await advancedBookingService.getActiveTrackingBookings();

        if (!result.success) {
            return res.status(400).json({
                message: result.message,
                error: result.error
            });
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/advanced/booking/:bookingId/status
 * Get comprehensive booking status including check-in/out
 */
router.get('/booking/:bookingId/status', auth, async (req: AuthRequest, res) => {
    try {
        const { bookingId } = req.params;

        const Booking = require('../models/Booking').default;
        const booking = await Booking.findById(bookingId)
            .select('reservationNumber status checkIn checkOut termsAndConditions payment.status')
            .populate('checkIn.checkedInBy', 'firstName lastName')
            .populate('checkOut.checkedOutBy', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            reservationNumber: booking.reservationNumber,
            bookingStatus: booking.status,
            paymentStatus: booking.payment?.status,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            termsAccepted: booking.termsAndConditions?.accepted || false
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

