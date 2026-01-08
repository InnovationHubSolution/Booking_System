import mongoose, { Document, Schema } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface ITransfer extends Document, IAuditFields {
    name: string;
    description: string;
    provider: {
        name: string;
        logo: string;
        rating: number;
        reviewCount: number;
    };
    type: 'airport' | 'hotel' | 'port' | 'custom' | 'tour';
    route: {
        from: {
            name: string;
            address: string;
            type: string; // Airport, Hotel, Port, Address
            coordinates: {
                type: { type: String, default: 'Point' };
                coordinates: [number]; // [longitude, latitude]
            };
        };
        to: {
            name: string;
            address: string;
            type: string;
            coordinates: {
                type: { type: String, default: 'Point' };
                coordinates: [number];
            };
        };
        distance: number; // in km
        duration: number; // in minutes
    };
    vehicleOptions: {
        type: 'sedan' | 'suv' | 'van' | 'minibus' | 'bus' | 'luxury';
        capacity: number; // max passengers
        luggage: number; // max bags
        price: number;
        features: string[]; // AC, WiFi, Water, etc.
        image: string;
        available: number;
    }[];
    schedule: {
        availability: '24/7' | 'scheduled';
        operatingHours?: {
            start: string;
            end: string;
        };
    };
    pricing: {
        basePrice: number;
        currency: string;
        pricePerKm?: number;
        waitingTimeFee?: number; // per hour
    };
    features: string[];
    cancellationPolicy: {
        freeCancellation: boolean;
        deadline?: number; // hours before pickup
        refundPercentage: number;
    };
    meetAndGreet: boolean;
    flightTracking: boolean; // for airport transfers
    childSeatAvailable: boolean;
    wheelchairAccessible: boolean;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TransferSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    provider: {
        name: { type: String, required: true },
        logo: { type: String, required: true },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },
    type: {
        type: String,
        enum: ['airport', 'hotel', 'port', 'custom', 'tour'],
        required: true
    },
    route: {
        from: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            type: { type: String, required: true },
            coordinates: {
                type: { type: String, default: 'Point' },
                coordinates: { type: [Number], required: true }
            }
        },
        to: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            type: { type: String, required: true },
            coordinates: {
                type: { type: String, default: 'Point' },
                coordinates: { type: [Number], required: true }
            }
        },
        distance: { type: Number, required: true },
        duration: { type: Number, required: true }
    },
    vehicleOptions: [{
        type: {
            type: String,
            enum: ['sedan', 'suv', 'van', 'minibus', 'bus', 'luxury'],
            required: true
        },
        capacity: { type: Number, required: true },
        luggage: { type: Number, required: true },
        price: { type: Number, required: true },
        features: [String],
        image: String,
        available: { type: Number, default: 5 }
    }],
    schedule: {
        availability: {
            type: String,
            enum: ['24/7', 'scheduled'],
            default: '24/7'
        },
        operatingHours: {
            start: String,
            end: String
        }
    },
    pricing: {
        basePrice: { type: Number, required: true },
        currency: { type: String, default: 'VUV' },
        pricePerKm: Number,
        waitingTimeFee: Number
    },
    features: [String],
    cancellationPolicy: {
        freeCancellation: { type: Boolean, default: true },
        deadline: Number,
        refundPercentage: { type: Number, default: 100 }
    },
    meetAndGreet: { type: Boolean, default: true },
    flightTracking: { type: Boolean, default: false },
    childSeatAvailable: { type: Boolean, default: true },
    wheelchairAccessible: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes
TransferSchema.index({ type: 1, isActive: 1 });
TransferSchema.index({ 'route.from.coordinates': '2dsphere' });
TransferSchema.index({ 'route.to.coordinates': '2dsphere' });

// Apply audit plugin
TransferSchema.plugin(auditPlugin, {
    fieldsToTrack: ['pricing.basePrice', 'isActive', 'vehicleOptions']
});

export default mongoose.model<ITransfer>('Transfer', TransferSchema);
