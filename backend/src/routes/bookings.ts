import express, { Request, Response } from 'express';
import Booking from '../models/Booking';
import Property from '../models/Property';
import Service from '../models/Service';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

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
            specialRequests
        } = req.body;

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

        const totalPrice = room.pricePerNight * nights;

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
            return res.status(400).json({ message: 'Room not available for selected dates' });
        }

        const booking = new Booking({
            userId: req.user?.userId,
            propertyId,
            roomType,
            checkInDate,
            checkOutDate,
            nights,
            totalPrice,
            guestCount: {
                adults: guestCount?.adults || 1,
                children: guestCount?.children || 0
            },
            guestDetails,
            specialRequests
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
        const { serviceId, checkInDate, checkOutDate, guestCount, guestDetails } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const duration = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60);
        const totalPrice = (duration / service.duration) * service.price * (guestCount?.adults || 1);

        const booking = new Booking({
            userId: req.user?.userId,
            serviceId,
            checkInDate,
            checkOutDate,
            nights: 1,
            totalPrice,
            guestCount: {
                adults: guestCount?.adults || 1,
                children: guestCount?.children || 0
            },
            guestDetails
        });

        await booking.save();
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
