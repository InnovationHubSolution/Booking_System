import Booking from '../models/Booking';
import mongoose from 'mongoose';

/**
 * Resource Availability Service
 * Prevents double bookings by checking resource allocation
 */

export interface ResourceCheckParams {
    resourceId: string;
    resourceType: 'room' | 'seat' | 'vehicle' | 'staff' | 'equipment';
    checkInDate: Date;
    checkOutDate: Date;
    excludeBookingId?: string;
}

export interface AvailabilityResult {
    available: boolean;
    conflictingBookings: any[];
    availableQuantity: number;
    totalCapacity: number;
    message: string;
}

/**
 * Check if a resource is available for the given date range
 */
export async function checkResourceAvailability(
    params: ResourceCheckParams
): Promise<AvailabilityResult> {
    const { resourceId, resourceType, checkInDate, checkOutDate, excludeBookingId } = params;

    // Build query to find conflicting bookings
    const query: any = {
        'resourceAllocation.resourceId': resourceId,
        'resourceAllocation.resourceType': resourceType,
        status: { $in: ['pending', 'confirmed', 'occupied'] },
        $or: [
            // Booking starts during the requested period
            { checkInDate: { $lt: checkOutDate, $gte: checkInDate } },
            // Booking ends during the requested period
            { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } },
            // Booking completely encompasses the requested period
            { checkInDate: { $lte: checkInDate }, checkOutDate: { $gte: checkOutDate } }
        ]
    };

    // Exclude a specific booking (useful for updates)
    if (excludeBookingId) {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }

    const conflictingBookings = await Booking.find(query)
        .populate('resourceAllocation')
        .lean();

    // Calculate total allocated quantity
    const totalAllocated = conflictingBookings.reduce(
        (sum, booking) => sum + (booking.resourceAllocation?.allocatedQuantity || 0),
        0
    );

    // Get resource capacity (assume from first booking or default to 1)
    const capacity = conflictingBookings.length > 0
        ? conflictingBookings[0].resourceAllocation?.capacity || 1
        : 1;

    const availableQuantity = capacity - totalAllocated;
    const available = availableQuantity > 0;

    return {
        available,
        conflictingBookings,
        availableQuantity,
        totalCapacity: capacity,
        message: available
            ? `Resource ${resourceId} is available (${availableQuantity}/${capacity} units free)`
            : `Resource ${resourceId} is fully booked (${conflictingBookings.length} conflicting bookings)`
    };
}

/**
 * Find available rooms in a property for date range
 */
export async function findAvailableRooms(
    propertyId: string,
    roomType: string,
    checkInDate: Date,
    checkOutDate: Date,
    requiredQuantity: number = 1
): Promise<string[]> {
    // Get all room IDs of this type
    // In a real implementation, you'd query the Property model for room numbers
    const potentialRoomIds = [`${propertyId}-${roomType}-001`, `${propertyId}-${roomType}-002`];

    const availableRooms: string[] = [];

    for (const roomId of potentialRoomIds) {
        const availability = await checkResourceAvailability({
            resourceId: roomId,
            resourceType: 'room',
            checkInDate,
            checkOutDate
        });

        if (availability.available && availability.availableQuantity >= requiredQuantity) {
            availableRooms.push(roomId);
        }
    }

    return availableRooms;
}

/**
 * Find available vehicles for date range
 */
export async function findAvailableVehicles(
    vehicleType: string,
    pickupDate: Date,
    returnDate: Date
): Promise<string[]> {
    // Get all vehicles of this type
    const allVehicles = await Booking.distinct('resourceAllocation.resourceId', {
        'resourceAllocation.resourceType': 'vehicle',
        bookingType: 'car-rental'
    });

    const availableVehicles: string[] = [];

    for (const vehicleId of allVehicles) {
        const availability = await checkResourceAvailability({
            resourceId: vehicleId,
            resourceType: 'vehicle',
            checkInDate: pickupDate,
            checkOutDate: returnDate
        });

        if (availability.available) {
            availableVehicles.push(vehicleId);
        }
    }

    return availableVehicles;
}

/**
 * Find available flight seats
 */
export async function findAvailableSeats(
    flightId: string,
    flightClass: 'economy' | 'business' | 'firstClass',
    requiredSeats: number
): Promise<{ available: boolean; seatNumbers: string[] }> {
    // Get all booked seats for this flight and class
    const bookedSeats = await Booking.find({
        flightId: new mongoose.Types.ObjectId(flightId),
        flightClass,
        status: { $in: ['confirmed', 'pending'] }
    }).select('resourceAllocation.resourceId');

    const bookedSeatIds = bookedSeats
        .map(b => b.resourceAllocation?.resourceId)
        .filter(Boolean);

    // In a real implementation, get available seats from Flight model
    // For now, return mock available seats
    const totalSeats = flightClass === 'economy' ? 150 : 20;
    const availableCount = totalSeats - bookedSeatIds.length;

    return {
        available: availableCount >= requiredSeats,
        seatNumbers: [] // Would return actual seat numbers
    };
}

/**
 * Allocate resource to a booking
 */
export async function allocateResource(
    bookingId: string,
    resourceId: string,
    resourceType: 'room' | 'seat' | 'vehicle' | 'staff' | 'equipment',
    resourceName: string,
    capacity: number,
    quantity: number,
    assignedBy?: string,
    notes?: string
): Promise<boolean> {
    try {
        await Booking.findByIdAndUpdate(bookingId, {
            resourceAllocation: {
                resourceId,
                resourceType,
                resourceName,
                capacity,
                allocatedQuantity: quantity,
                availabilityStatus: 'allocated',
                assignedBy: assignedBy ? new mongoose.Types.ObjectId(assignedBy) : undefined,
                assignedAt: new Date(),
                notes
            }
        });
        return true;
    } catch (error) {
        console.error('Error allocating resource:', error);
        return false;
    }
}

/**
 * Update resource availability status
 */
export async function updateResourceStatus(
    bookingId: string,
    status: 'available' | 'allocated' | 'occupied' | 'maintenance' | 'blocked'
): Promise<boolean> {
    try {
        await Booking.findByIdAndUpdate(bookingId, {
            'resourceAllocation.availabilityStatus': status
        });
        return true;
    } catch (error) {
        console.error('Error updating resource status:', error);
        return false;
    }
}

/**
 * Get all bookings for a specific resource
 */
export async function getResourceBookings(
    resourceId: string,
    startDate?: Date,
    endDate?: Date
): Promise<any[]> {
    const query: any = {
        'resourceAllocation.resourceId': resourceId,
        status: { $ne: 'cancelled' }
    };

    if (startDate && endDate) {
        query.$or = [
            { checkInDate: { $gte: startDate, $lt: endDate } },
            { checkOutDate: { $gt: startDate, $lte: endDate } },
            { checkInDate: { $lte: startDate }, checkOutDate: { $gte: endDate } }
        ];
    }

    return await Booking.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('propertyId', 'name')
        .populate('serviceId', 'name')
        .sort({ checkInDate: 1 });
}

/**
 * Get occupancy statistics for resources
 */
export async function getResourceOccupancyStats(
    resourceType: 'room' | 'seat' | 'vehicle' | 'staff' | 'equipment',
    startDate: Date,
    endDate: Date
): Promise<any> {
    const bookings = await Booking.aggregate([
        {
            $match: {
                'resourceAllocation.resourceType': resourceType,
                status: { $in: ['confirmed', 'occupied'] },
                checkInDate: { $lt: endDate },
                checkOutDate: { $gt: startDate }
            }
        },
        {
            $group: {
                _id: '$resourceAllocation.resourceId',
                totalBookings: { $sum: 1 },
                totalNights: { $sum: '$nights' },
                totalRevenue: { $sum: '$totalPrice' },
                averagePrice: { $avg: '$totalPrice' }
            }
        },
        {
            $sort: { totalRevenue: -1 }
        }
    ]);

    return bookings;
}

export default {
    checkResourceAvailability,
    findAvailableRooms,
    findAvailableVehicles,
    findAvailableSeats,
    allocateResource,
    updateResourceStatus,
    getResourceBookings,
    getResourceOccupancyStats
};
