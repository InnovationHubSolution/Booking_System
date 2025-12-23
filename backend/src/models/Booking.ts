import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    userId: mongoose.Types.ObjectId;
    bookingType: 'property' | 'service' | 'flight' | 'car-rental' | 'transfer' | 'package';

    // Property/Service/Package booking
    propertyId?: mongoose.Types.ObjectId;
    serviceId?: mongoose.Types.ObjectId;
    packageId?: mongoose.Types.ObjectId;
    roomType?: string;

    // Flight booking
    flightId?: mongoose.Types.ObjectId;
    returnFlightId?: mongoose.Types.ObjectId;
    flightClass?: 'economy' | 'business' | 'firstClass';
    passengers?: {
        adults: number;
        children: number;
        infants: number;
    };
    passengerDetails?: {
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        passportNumber: string;
        nationality: string;
    }[];

    // Car rental booking
    carRentalId?: mongoose.Types.ObjectId;
    pickupLocation?: string;
    dropoffLocation?: string;
    driverDetails?: {
        firstName: string;
        lastName: string;
        licenseNumber: string;
        licenseExpiry: Date;
    };

    // Transfer booking
    transferId?: mongoose.Types.ObjectId;
    vehicleType?: string;
    pickupDateTime?: Date;
    pickupAddress?: string;
    dropoffAddress?: string;
    flightNumber?: string;

    checkInDate: Date;
    checkOutDate: Date;
    nights?: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    totalPrice: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    guestCount: {
        adults: number;
        children: number;
    };
    guestDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    specialRequests?: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    createdAt: Date;
}

const BookingSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: {
        type: String,
        enum: ['property', 'service', 'flight', 'car-rental', 'transfer', 'package'],
        required: true
    },

    // Property/Service/Package references
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    packageId: { type: Schema.Types.ObjectId, ref: 'TravelPackage' },
    roomType: { type: String },

    // Flight references
    flightId: { type: Schema.Types.ObjectId, ref: 'Flight' },
    returnFlightId: { type: Schema.Types.ObjectId, ref: 'Flight' },
    flightClass: {
        type: String,
        enum: ['economy', 'business', 'firstClass']
    },
    passengers: {
        adults: { type: Number },
        children: { type: Number },
        infants: { type: Number }
    },
    passengerDetails: [{
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        passportNumber: String,
        nationality: String
    }],

    // Car rental references
    carRentalId: { type: Schema.Types.ObjectId, ref: 'CarRental' },
    pickupLocation: String,
    dropoffLocation: String,
    driverDetails: {
        firstName: String,
        lastName: String,
        licenseNumber: String,
        licenseExpiry: Date
    },

    // Transfer references
    transferId: { type: Schema.Types.ObjectId, ref: 'Transfer' },
    vehicleType: String,
    pickupDateTime: Date,
    pickupAddress: String,
    dropoffAddress: String,
    flightNumber: String,

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    nights: { type: Number },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    totalPrice: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    guestCount: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 }
    },
    guestDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    specialRequests: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

BookingSchema.index({ userId: 1, bookingType: 1, createdAt: -1 });
BookingSchema.index({ propertyId: 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ flightId: 1 });
BookingSchema.index({ carRentalId: 1 });
BookingSchema.index({ transferId: 1 });
BookingSchema.index({ packageId: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
