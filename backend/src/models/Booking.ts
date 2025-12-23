import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    // Booking/Reservation Details (Core)
    reservationNumber: string; // Unique booking reference (e.g., VU-2025-001234)
    bookingDate: Date; // When the booking was made
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    bookingSource: 'online' | 'counter' | 'agent' | 'mobile-app';
    referenceNumber: string; // External reference number for tracking

    userId: mongoose.Types.ObjectId;
    bookingType: 'property' | 'service' | 'flight' | 'car-rental' | 'transfer' | 'package';

    // Availability & Allocation (Critical for avoiding double bookings)
    resourceAllocation?: {
        resourceId: string; // Room No, Seat No, Vehicle No, Staff ID
        resourceType: 'room' | 'seat' | 'vehicle' | 'staff' | 'equipment';
        resourceName?: string; // Human-readable name (e.g., "Room 101", "Vehicle VU-001")
        capacity: number; // Maximum capacity of the resource
        allocatedQuantity: number; // How many units are allocated
        availabilityStatus: 'available' | 'allocated' | 'occupied' | 'maintenance' | 'blocked';
        assignedBy?: mongoose.Types.ObjectId; // User who assigned the resource
        assignedAt?: Date;
        notes?: string; // Special notes about allocation
    };

    // Pricing & Payment (Financial tracking)
    pricing: {
        unitPrice: number; // Price per unit (per night, per person, per service)
        quantity: number; // Number of units (nights, passengers, items)
        subtotal: number; // unitPrice * quantity
        discount?: {
            type: 'percentage' | 'fixed' | 'coupon' | 'seasonal';
            value: number; // Percentage (0-100) or fixed amount
            code?: string; // Discount/Coupon code
            reason?: string; // Reason for discount
        };
        discountAmount: number; // Calculated discount amount
        taxRate: number; // Tax/VAT rate percentage (e.g., 15 for 15%)
        taxAmount: number; // Calculated tax amount
        totalAmount: number; // Final amount (subtotal - discount + tax)
        currency: string; // Currency code (VUV, USD, etc.)
    };
    payment: {
        status: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'failed';
        method?: 'cash' | 'card' | 'mobile' | 'transfer' | 'paypal' | 'stripe';
        reference?: string; // Payment reference/receipt number
        transactionId?: string; // External transaction ID
        paidAmount: number; // Amount paid so far
        remainingAmount: number; // Amount still owed
        paidAt?: Date; // When payment was completed
        refundAmount?: number; // Amount refunded (if applicable)
        refundReason?: string; // Reason for refund
        refundedAt?: Date; // When refund was processed
        paymentDetails?: {
            cardLastFour?: string; // Last 4 digits of card
            cardBrand?: string; // Visa, Mastercard, etc.
            mobileProvider?: string; // Mobile money provider
            accountNumber?: string; // For transfers
        };
    };

    // Advanced Features (Check-in/out, QR, Terms, Signature, Location)
    checkIn?: {
        status: 'not-checked-in' | 'checked-in' | 'late' | 'no-show';
        checkedInAt?: Date;
        checkedInBy?: mongoose.Types.ObjectId; // Staff member who checked in
        actualArrivalTime?: Date;
        notes?: string;
        location?: {
            type: 'Point';
            coordinates: [number, number]; // [longitude, latitude]
        };
    };
    checkOut?: {
        status: 'not-checked-out' | 'checked-out' | 'late-checkout' | 'extended';
        checkedOutAt?: Date;
        checkedOutBy?: mongoose.Types.ObjectId; // Staff member who checked out
        actualDepartureTime?: Date;
        notes?: string;
        damageReported?: boolean;
        damageDescription?: string;
        location?: {
            type: 'Point';
            coordinates: [number, number]; // [longitude, latitude]
        };
    };
    qrCode?: string; // QR code data for quick check-in/verification
    barcode?: string; // Barcode for alternative scanning
    termsAndConditions?: {
        accepted: boolean;
        acceptedAt?: Date;
        version?: string; // Terms version (e.g., 'v1.0', 'v2.0')
        ipAddress?: string; // IP where terms were accepted
    };
    customerSignature?: {
        signatureData?: string; // Base64 encoded signature image
        signedAt?: Date;
        deviceInfo?: string; // Device used for signing
        ipAddress?: string;
    };
    geolocation?: {
        pickup?: {
            type: 'Point';
            coordinates: [number, number]; // [longitude, latitude]
            address?: string;
            timestamp?: Date;
        };
        dropoff?: {
            type: 'Point';
            coordinates: [number, number]; // [longitude, latitude]
            address?: string;
            timestamp?: Date;
        };
        tracking?: {
            type: 'Point';
            coordinates: [number, number];
            timestamp: Date;
            speed?: number; // km/h
            heading?: number; // degrees
        }[];
    };

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
    updatedAt?: Date;
}

const BookingSchema: Schema = new Schema({
    // Booking/Reservation Details (Core)
    reservationNumber: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    bookingDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
        default: 'pending',
        required: true
    },
    bookingSource: {
        type: String,
        enum: ['online', 'counter', 'agent', 'mobile-app'],
        default: 'online',
        required: true
    },
    referenceNumber: {
        type: String,
        required: true,
        index: true
    },

    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: {
        type: String,
        enum: ['property', 'service', 'flight', 'car-rental', 'transfer', 'package'],
        required: true
    },

    // Availability & Allocation
    resourceAllocation: {
        resourceId: {
            type: String,
            index: true
        },
        resourceType: {
            type: String,
            enum: ['room', 'seat', 'vehicle', 'staff', 'equipment']
        },
        resourceName: String,
        capacity: {
            type: Number,
            default: 1
        },
        allocatedQuantity: {
            type: Number,
            default: 1
        },
        availabilityStatus: {
            type: String,
            enum: ['available', 'allocated', 'occupied', 'maintenance', 'blocked'],
            default: 'allocated'
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        notes: String
    },

    // Pricing & Payment
    pricing: {
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: {
                type: String,
                enum: ['percentage', 'fixed', 'coupon', 'seasonal']
            },
            value: {
                type: Number,
                min: 0
            },
            code: String,
            reason: String
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        taxRate: {
            type: Number,
            default: 15, // Default 15% VAT for Vanuatu
            min: 0,
            max: 100
        },
        taxAmount: {
            type: Number,
            required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'VUV',
            required: true
        }
    },
    payment: {
        status: {
            type: String,
            enum: ['unpaid', 'partial', 'paid', 'refunded', 'failed'],
            default: 'unpaid',
            required: true
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'mobile', 'transfer', 'paypal', 'stripe']
        },
        reference: {
            type: String,
            index: true
        },
        transactionId: {
            type: String,
            index: true
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        remainingAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        paidAt: Date,
        refundAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        refundReason: String,
        refundedAt: Date,
        paymentDetails: {
            cardLastFour: String,
            cardBrand: String,
            mobileProvider: String,
            accountNumber: String
        }
    },

    // Advanced Features
    checkIn: {
        status: {
            type: String,
            enum: ['not-checked-in', 'checked-in', 'late', 'no-show'],
            default: 'not-checked-in'
        },
        checkedInAt: Date,
        checkedInBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        actualArrivalTime: Date,
        notes: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }
        }
    },
    checkOut: {
        status: {
            type: String,
            enum: ['not-checked-out', 'checked-out', 'late-checkout', 'extended'],
            default: 'not-checked-out'
        },
        checkedOutAt: Date,
        checkedOutBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        actualDepartureTime: Date,
        notes: String,
        damageReported: {
            type: Boolean,
            default: false
        },
        damageDescription: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }
        }
    },
    qrCode: {
        type: String,
        index: true
    },
    barcode: {
        type: String,
        index: true
    },
    termsAndConditions: {
        accepted: {
            type: Boolean,
            required: true,
            default: false
        },
        acceptedAt: Date,
        version: String,
        ipAddress: String
    },
    customerSignature: {
        signatureData: String, // Base64 encoded image
        signedAt: Date,
        deviceInfo: String,
        ipAddress: String
    },
    geolocation: {
        pickup: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            },
            address: String,
            timestamp: Date
        },
        dropoff: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            },
            address: String,
            timestamp: Date
        },
        tracking: [{
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            },
            timestamp: {
                type: Date,
                required: true
            },
            speed: Number,
            heading: Number
        }]
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
    totalPrice: { type: Number }, // Deprecated: Use pricing.totalAmount instead
    paymentStatus: { // Deprecated: Use payment.status instead
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt
});

// Generate unique reservation number before saving
BookingSchema.pre('save', async function (next) {
    if (!this.reservationNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
        this.reservationNumber = `VU-${year}${month}-${random}`;
    }
    if (!this.referenceNumber) {
        this.referenceNumber = `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    // Generate QR Code data (can be encoded into actual QR image on frontend)
    if (!this.qrCode) {
        this.qrCode = `VU-BOOKING:${this.reservationNumber}:${this.bookingType}:${Date.now()}`;
    }
    // Generate Barcode data (Code128 format)
    if (!this.barcode && this.reservationNumber) {
        this.barcode = (this.reservationNumber as string).replace(/-/g, '');
    }
    // Initialize check-in/check-out status if not set
    if (!this.checkIn) {
        this.checkIn = { status: 'not-checked-in' } as any;
    }
    if (!this.checkOut) {
        this.checkOut = { status: 'not-checked-out' } as any;
    }
    next();
});

BookingSchema.index({ userId: 1, bookingType: 1, createdAt: -1 });
BookingSchema.index({ propertyId: 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ flightId: 1 });
BookingSchema.index({ carRentalId: 1 });
BookingSchema.index({ transferId: 1 });
BookingSchema.index({ packageId: 1 });
BookingSchema.index({ reservationNumber: 1 });
BookingSchema.index({ referenceNumber: 1 });
BookingSchema.index({ status: 1, bookingDate: -1 });
BookingSchema.index({ bookingSource: 1 });
BookingSchema.index({ 'resourceAllocation.resourceId': 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ 'resourceAllocation.availabilityStatus': 1 });
BookingSchema.index({ 'resourceAllocation.resourceType': 1, status: 1 });
BookingSchema.index({ qrCode: 1 });
BookingSchema.index({ barcode: 1 });
BookingSchema.index({ 'checkIn.status': 1 });
BookingSchema.index({ 'checkOut.status': 1 });
BookingSchema.index({ 'checkIn.checkedInAt': 1 });
BookingSchema.index({ 'checkOut.checkedOutAt': 1 });
BookingSchema.index({ 'termsAndConditions.accepted': 1 });
BookingSchema.index({ 'geolocation.pickup.coordinates': '2dsphere' });
BookingSchema.index({ 'geolocation.dropoff.coordinates': '2dsphere' });

export default mongoose.model<IBooking>('Booking', BookingSchema);
