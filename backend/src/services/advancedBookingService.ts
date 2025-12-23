import Booking from '../models/Booking';
import mongoose from 'mongoose';

/**
 * Advanced Booking Service
 * Handles check-in/out, QR codes, signatures, terms acceptance, and geolocation
 */

interface CheckInData {
    bookingId: string;
    checkedInBy?: string;
    actualArrivalTime?: Date;
    notes?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface CheckOutData {
    bookingId: string;
    checkedOutBy?: string;
    actualDepartureTime?: Date;
    notes?: string;
    damageReported?: boolean;
    damageDescription?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface SignatureData {
    bookingId: string;
    signatureData: string; // Base64 encoded image
    deviceInfo?: string;
    ipAddress?: string;
}

interface TermsAcceptanceData {
    bookingId: string;
    version?: string;
    ipAddress?: string;
}

interface LocationTrackingData {
    bookingId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
}

/**
 * Process customer check-in
 */
export const processCheckIn = async (data: CheckInData) => {
    try {
        const booking = await Booking.findById(data.bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        // Check if already checked in
        if (booking.checkIn?.status === 'checked-in') {
            return {
                success: false,
                message: 'Customer is already checked in',
                error: 'ALREADY_CHECKED_IN'
            };
        }

        // Check if booking is confirmed or paid
        if (booking.status === 'cancelled') {
            return {
                success: false,
                message: 'Cannot check in cancelled booking',
                error: 'BOOKING_CANCELLED'
            };
        }

        // Determine check-in status based on time
        const now = new Date();
        const scheduledCheckIn = new Date(booking.checkInDate);
        const isLate = now > new Date(scheduledCheckIn.getTime() + 60 * 60 * 1000); // More than 1 hour late

        // Update check-in information
        booking.checkIn = {
            status: isLate ? 'late' : 'checked-in',
            checkedInAt: now,
            checkedInBy: data.checkedInBy ? new mongoose.Types.ObjectId(data.checkedInBy) : undefined,
            actualArrivalTime: data.actualArrivalTime || now,
            notes: data.notes,
            location: data.location ? {
                type: 'Point',
                coordinates: [data.location.longitude, data.location.latitude]
            } : undefined
        };

        // Update booking status if needed
        if (booking.status === 'confirmed') {
            booking.status = 'completed';
        }

        // Update resource status to occupied
        if (booking.resourceAllocation) {
            booking.resourceAllocation.availabilityStatus = 'occupied';
        }

        await booking.save();

        return {
            success: true,
            message: `Check-in successful${isLate ? ' (Late arrival noted)' : ''}`,
            booking: booking.toObject(),
            checkInTime: now,
            status: isLate ? 'late' : 'on-time'
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Check-in failed',
            error: error.message
        };
    }
};

/**
 * Process customer check-out
 */
export const processCheckOut = async (data: CheckOutData) => {
    try {
        const booking = await Booking.findById(data.bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        // Check if checked in first
        if (booking.checkIn?.status !== 'checked-in' && booking.checkIn?.status !== 'late') {
            return {
                success: false,
                message: 'Customer must be checked in before checking out',
                error: 'NOT_CHECKED_IN'
            };
        }

        // Check if already checked out
        if (booking.checkOut?.status === 'checked-out') {
            return {
                success: false,
                message: 'Customer is already checked out',
                error: 'ALREADY_CHECKED_OUT'
            };
        }

        // Determine check-out status based on time
        const now = new Date();
        const scheduledCheckOut = new Date(booking.checkOutDate);
        const isLate = now > new Date(scheduledCheckOut.getTime() + 60 * 60 * 1000); // More than 1 hour late
        const isExtended = now > new Date(scheduledCheckOut.getTime() + 24 * 60 * 60 * 1000); // More than 1 day late

        // Update check-out information
        booking.checkOut = {
            status: isExtended ? 'extended' : (isLate ? 'late-checkout' : 'checked-out'),
            checkedOutAt: now,
            checkedOutBy: data.checkedOutBy ? new mongoose.Types.ObjectId(data.checkedOutBy) : undefined,
            actualDepartureTime: data.actualDepartureTime || now,
            notes: data.notes,
            damageReported: data.damageReported || false,
            damageDescription: data.damageDescription,
            location: data.location ? {
                type: 'Point',
                coordinates: [data.location.longitude, data.location.latitude]
            } : undefined
        };

        // Update booking status
        booking.status = 'completed';

        // Update resource status to available
        if (booking.resourceAllocation) {
            booking.resourceAllocation.availabilityStatus = 'available';
        }

        await booking.save();

        return {
            success: true,
            message: `Check-out successful${isLate ? ' (Late checkout noted)' : ''}${data.damageReported ? ' - Damage reported' : ''}`,
            booking: booking.toObject(),
            checkOutTime: now,
            status: isExtended ? 'extended' : (isLate ? 'late' : 'on-time'),
            damageReported: data.damageReported || false
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Check-out failed',
            error: error.message
        };
    }
};

/**
 * Save customer signature
 */
export const saveSignature = async (data: SignatureData) => {
    try {
        const booking = await Booking.findById(data.bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        // Validate signature data (should be base64)
        if (!data.signatureData.startsWith('data:image')) {
            return {
                success: false,
                message: 'Invalid signature format. Must be base64 encoded image',
                error: 'INVALID_SIGNATURE_FORMAT'
            };
        }

        booking.customerSignature = {
            signatureData: data.signatureData,
            signedAt: new Date(),
            deviceInfo: data.deviceInfo,
            ipAddress: data.ipAddress
        };

        await booking.save();

        return {
            success: true,
            message: 'Signature saved successfully',
            signedAt: new Date()
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to save signature',
            error: error.message
        };
    }
};

/**
 * Accept terms and conditions
 */
export const acceptTerms = async (data: TermsAcceptanceData) => {
    try {
        const booking = await Booking.findById(data.bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        // Check if already accepted
        if (booking.termsAndConditions?.accepted) {
            return {
                success: false,
                message: 'Terms already accepted',
                error: 'ALREADY_ACCEPTED'
            };
        }

        booking.termsAndConditions = {
            accepted: true,
            acceptedAt: new Date(),
            version: data.version || 'v1.0',
            ipAddress: data.ipAddress
        };

        await booking.save();

        return {
            success: true,
            message: 'Terms and conditions accepted',
            acceptedAt: new Date(),
            version: data.version || 'v1.0'
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to accept terms',
            error: error.message
        };
    }
};

/**
 * Update pickup location for transfers/rentals
 */
export const updatePickupLocation = async (
    bookingId: string,
    latitude: number,
    longitude: number,
    address?: string
) => {
    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        if (!booking.geolocation) {
            booking.geolocation = {};
        }

        booking.geolocation.pickup = {
            type: 'Point',
            coordinates: [longitude, latitude],
            address,
            timestamp: new Date()
        };

        await booking.save();

        return {
            success: true,
            message: 'Pickup location updated',
            location: { latitude, longitude, address }
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to update pickup location',
            error: error.message
        };
    }
};

/**
 * Update dropoff location for transfers/rentals
 */
export const updateDropoffLocation = async (
    bookingId: string,
    latitude: number,
    longitude: number,
    address?: string
) => {
    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        if (!booking.geolocation) {
            booking.geolocation = {};
        }

        booking.geolocation.dropoff = {
            type: 'Point',
            coordinates: [longitude, latitude],
            address,
            timestamp: new Date()
        };

        await booking.save();

        return {
            success: true,
            message: 'Dropoff location updated',
            location: { latitude, longitude, address }
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to update dropoff location',
            error: error.message
        };
    }
};

/**
 * Add location tracking point (for real-time vehicle/driver tracking)
 */
export const addTrackingPoint = async (data: LocationTrackingData) => {
    try {
        const booking = await Booking.findById(data.bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        if (!booking.geolocation) {
            booking.geolocation = {};
        }

        if (!booking.geolocation.tracking) {
            booking.geolocation.tracking = [];
        }

        // Add new tracking point
        booking.geolocation.tracking.push({
            type: 'Point',
            coordinates: [data.longitude, data.latitude],
            timestamp: new Date(),
            speed: data.speed,
            heading: data.heading
        });

        // Keep only last 100 tracking points to avoid excessive data
        if (booking.geolocation.tracking.length > 100) {
            booking.geolocation.tracking = booking.geolocation.tracking.slice(-100);
        }

        await booking.save();

        return {
            success: true,
            message: 'Tracking point added',
            totalPoints: booking.geolocation.tracking.length
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to add tracking point',
            error: error.message
        };
    }
};

/**
 * Get booking by QR code
 */
export const getBookingByQRCode = async (qrCode: string) => {
    try {
        const booking = await Booking.findOne({ qrCode })
            .populate('userId', 'firstName lastName email phone')
            .populate('propertyId', 'name address')
            .populate('serviceId', 'name')
            .populate('checkIn.checkedInBy', 'firstName lastName')
            .populate('checkOut.checkedOutBy', 'firstName lastName');

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found with this QR code',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        return {
            success: true,
            booking: booking.toObject()
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to retrieve booking',
            error: error.message
        };
    }
};

/**
 * Get booking by barcode
 */
export const getBookingByBarcode = async (barcode: string) => {
    try {
        const booking = await Booking.findOne({ barcode })
            .populate('userId', 'firstName lastName email phone')
            .populate('propertyId', 'name address')
            .populate('serviceId', 'name');

        if (!booking) {
            return {
                success: false,
                message: 'Booking not found with this barcode',
                error: 'BOOKING_NOT_FOUND'
            };
        }

        return {
            success: true,
            booking: booking.toObject()
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to retrieve booking',
            error: error.message
        };
    }
};

/**
 * Get check-in statistics for a date range
 */
export const getCheckInStats = async (startDate: Date, endDate: Date) => {
    try {
        const stats = await Booking.aggregate([
            {
                $match: {
                    'checkIn.checkedInAt': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$checkIn.status',
                    count: { $sum: 1 },
                    bookings: { $push: '$reservationNumber' }
                }
            }
        ]);

        return {
            success: true,
            period: { startDate, endDate },
            stats
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to get check-in statistics',
            error: error.message
        };
    }
};

/**
 * Get real-time location tracking for active bookings
 */
export const getActiveTrackingBookings = async () => {
    try {
        const bookings = await Booking.find({
            bookingType: { $in: ['transfer', 'car-rental'] },
            'checkIn.status': 'checked-in',
            'checkOut.status': { $ne: 'checked-out' },
            'geolocation.tracking': { $exists: true, $ne: [] }
        })
            .select('reservationNumber bookingType geolocation.tracking userId guestDetails')
            .populate('userId', 'firstName lastName phone')
            .sort({ 'geolocation.tracking.timestamp': -1 });

        return {
            success: true,
            count: bookings.length,
            bookings: bookings.map(b => ({
                reservationNumber: b.reservationNumber,
                bookingType: b.bookingType,
                customer: b.userId || b.guestDetails,
                lastLocation: b.geolocation?.tracking?.[b.geolocation.tracking.length - 1],
                trackingPoints: b.geolocation?.tracking?.length || 0
            }))
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to get active tracking',
            error: error.message
        };
    }
};

export default {
    processCheckIn,
    processCheckOut,
    saveSignature,
    acceptTerms,
    updatePickupLocation,
    updateDropoffLocation,
    addTrackingPoint,
    getBookingByQRCode,
    getBookingByBarcode,
    getCheckInStats,
    getActiveTrackingBookings
};
