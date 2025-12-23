import express, { Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import availabilityService from '../services/availabilityService';
import Booking from '../models/Booking';

const router = express.Router();

/**
 * Check resource availability
 * POST /api/resources/check-availability
 */
router.post('/check-availability', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { resourceId, resourceType, checkInDate, checkOutDate, excludeBookingId } = req.body;

        if (!resourceId || !resourceType || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                message: 'Missing required fields: resourceId, resourceType, checkInDate, checkOutDate'
            });
        }

        const availability = await availabilityService.checkResourceAvailability({
            resourceId,
            resourceType,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            excludeBookingId
        });

        res.json(availability);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Find available rooms
 * GET /api/resources/rooms/available?propertyId=xxx&roomType=xxx&checkIn=xxx&checkOut=xxx
 */
router.get('/rooms/available', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { propertyId, roomType, checkInDate, checkOutDate, quantity } = req.query;

        if (!propertyId || !roomType || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                message: 'Missing required query parameters'
            });
        }

        const availableRooms = await availabilityService.findAvailableRooms(
            propertyId as string,
            roomType as string,
            new Date(checkInDate as string),
            new Date(checkOutDate as string),
            parseInt(quantity as string) || 1
        );

        res.json({
            available: availableRooms.length > 0,
            count: availableRooms.length,
            rooms: availableRooms
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Find available vehicles
 * GET /api/resources/vehicles/available?vehicleType=xxx&pickupDate=xxx&returnDate=xxx
 */
router.get('/vehicles/available', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleType, pickupDate, returnDate } = req.query;

        if (!vehicleType || !pickupDate || !returnDate) {
            return res.status(400).json({
                message: 'Missing required query parameters'
            });
        }

        const availableVehicles = await availabilityService.findAvailableVehicles(
            vehicleType as string,
            new Date(pickupDate as string),
            new Date(returnDate as string)
        );

        res.json({
            available: availableVehicles.length > 0,
            count: availableVehicles.length,
            vehicles: availableVehicles
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get bookings for a specific resource
 * GET /api/resources/:resourceId/bookings
 */
router.get('/:resourceId/bookings', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { resourceId } = req.params;
        const { startDate, endDate } = req.query;

        const bookings = await availabilityService.getResourceBookings(
            resourceId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.json({
            resourceId,
            bookings,
            count: bookings.length
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Allocate resource to booking
 * POST /api/resources/allocate
 */
router.post('/allocate', auth, async (req: AuthRequest, res: Response) => {
    try {
        const {
            bookingId,
            resourceId,
            resourceType,
            resourceName,
            capacity,
            quantity,
            notes
        } = req.body;

        if (!bookingId || !resourceId || !resourceType) {
            return res.status(400).json({
                message: 'Missing required fields: bookingId, resourceId, resourceType'
            });
        }

        const success = await availabilityService.allocateResource(
            bookingId,
            resourceId,
            resourceType,
            resourceName,
            capacity || 1,
            quantity || 1,
            req.user?.userId,
            notes
        );

        if (success) {
            const booking = await Booking.findById(bookingId)
                .populate('resourceAllocation');
            res.json({
                message: 'Resource allocated successfully',
                booking
            });
        } else {
            res.status(500).json({ message: 'Failed to allocate resource' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Update resource status
 * PATCH /api/resources/:bookingId/status
 */
router.patch('/:bookingId/status', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!['available', 'allocated', 'occupied', 'maintenance', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const success = await availabilityService.updateResourceStatus(bookingId, status);

        if (success) {
            const booking = await Booking.findById(bookingId);
            res.json({
                message: 'Resource status updated successfully',
                booking
            });
        } else {
            res.status(500).json({ message: 'Failed to update resource status' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get occupancy statistics
 * GET /api/resources/occupancy/stats?resourceType=room&startDate=xxx&endDate=xxx
 */
router.get('/occupancy/stats', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { resourceType, startDate, endDate } = req.query;

        if (!resourceType || !startDate || !endDate) {
            return res.status(400).json({
                message: 'Missing required query parameters'
            });
        }

        const stats = await availabilityService.getResourceOccupancyStats(
            resourceType as any,
            new Date(startDate as string),
            new Date(endDate as string)
        );

        res.json({
            resourceType,
            period: { startDate, endDate },
            stats
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get all resources by type
 * GET /api/resources/list?resourceType=room&status=available
 */
router.get('/list', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { resourceType, status } = req.query;

        const query: any = {};
        if (resourceType) {
            query['resourceAllocation.resourceType'] = resourceType;
        }
        if (status) {
            query['resourceAllocation.availabilityStatus'] = status;
        }

        const resources = await Booking.find(query)
            .select('resourceAllocation checkInDate checkOutDate status')
            .sort({ 'resourceAllocation.resourceId': 1 });

        // Group by resourceId
        const resourceMap = new Map();
        resources.forEach(booking => {
            const resId = booking.resourceAllocation?.resourceId;
            if (resId) {
                if (!resourceMap.has(resId)) {
                    resourceMap.set(resId, {
                        resourceId: resId,
                        resourceType: booking.resourceAllocation?.resourceType,
                        resourceName: booking.resourceAllocation?.resourceName,
                        capacity: booking.resourceAllocation?.capacity,
                        status: booking.resourceAllocation?.availabilityStatus,
                        bookings: []
                    });
                }
                resourceMap.get(resId).bookings.push({
                    bookingId: booking._id,
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    status: booking.status
                });
            }
        });

        res.json({
            count: resourceMap.size,
            resources: Array.from(resourceMap.values())
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
