import mongoose, { Document, Schema } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface ITravelPackage extends Document, IAuditFields {
    name: string;
    description: string;
    images: string[];
    destination: string;
    destinationCoordinates?: {
        lat: number;
        lng: number;
    };
    duration: {
        days: number;
        nights: number;
    };
    includes: {
        flights: boolean;
        accommodation: boolean;
        transfers: boolean;
        tours: boolean;
        meals: 'none' | 'breakfast' | 'half-board' | 'full-board' | 'all-inclusive';
        carRental: boolean;
        insurance: boolean;
    };
    itinerary: {
        day: number;
        title: string;
        description: string;
        activities: string[];
        meals: string[];
        accommodation: string;
    }[];
    pricing: {
        basePrice: number;
        currency: string;
        priceIncludes: string[];
        priceExcludes: string[];
        discountPercentage?: number;
    };
    availability: {
        startDate: Date;
        endDate: Date;
        maxParticipants: number;
        minParticipants: number;
        currentBookings: number;
    };
    category: 'adventure' | 'beach' | 'cultural' | 'luxury' | 'family' | 'honeymoon' | 'group';
    difficulty: 'easy' | 'moderate' | 'challenging';
    highlights: string[];
    rating: number;
    reviewCount: number;
    isActive: boolean;
    isFeatured: boolean;
}

const TravelPackageSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
    destination: { type: String, required: true },
    destinationCoordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    duration: {
        days: { type: Number, required: true },
        nights: { type: Number, required: true }
    },
    includes: {
        flights: { type: Boolean, default: false },
        accommodation: { type: Boolean, default: true },
        transfers: { type: Boolean, default: false },
        tours: { type: Boolean, default: false },
        meals: {
            type: String,
            enum: ['none', 'breakfast', 'half-board', 'full-board', 'all-inclusive'],
            default: 'breakfast'
        },
        carRental: { type: Boolean, default: false },
        insurance: { type: Boolean, default: false }
    },
    itinerary: [{
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        activities: [String],
        meals: [String],
        accommodation: String
    }],
    pricing: {
        basePrice: { type: Number, required: true },
        currency: { type: String, default: 'VUV' },
        priceIncludes: [String],
        priceExcludes: [String],
        discountPercentage: Number
    },
    availability: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        maxParticipants: { type: Number, required: true },
        minParticipants: { type: Number, default: 1 },
        currentBookings: { type: Number, default: 0 }
    },
    category: {
        type: String,
        enum: ['adventure', 'beach', 'cultural', 'luxury', 'family', 'honeymoon', 'group'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'challenging'],
        default: 'easy'
    },
    highlights: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

// Indexes
TravelPackageSchema.index({ destination: 1, category: 1, isActive: 1 });
TravelPackageSchema.index({ 'pricing.basePrice': 1 });
TravelPackageSchema.index({ isFeatured: 1, rating: -1 });

// Apply audit plugin
TravelPackageSchema.plugin(auditPlugin, {
    fieldsToTrack: ['pricing.basePrice', 'isActive', 'isFeatured', 'availability']
});

export default mongoose.model<ITravelPackage>('TravelPackage', TravelPackageSchema);
