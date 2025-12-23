import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
    name: string;
    description: string;
    propertyType: 'hotel' | 'apartment' | 'resort' | 'villa' | 'hostel' | 'guesthouse' | 'bed-and-breakfast' | 'motel' | 'boutique-hotel';
    starRating?: number; // 1-5 star hotel classification
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    ownerId: mongoose.Types.ObjectId;
    images: string[];
    amenities: string[];
    rooms: {
        type: string;
        description: string;
        maxGuests: number;
        beds: number;
        bathrooms: number;
        pricePerNight: number;
        currency: string;
        available: boolean;
        count: number;
        amenities: string[];
        mealPlan?: 'none' | 'breakfast' | 'half-board' | 'full-board' | 'all-inclusive';
        size?: number; // Room size in sqm
        bedType?: string; // King, Queen, Twin, etc.
        viewType?: string; // Ocean view, garden view, etc.
    }[];
    rating: number;
    reviewCount: number;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: {
        type: 'flexible' | 'moderate' | 'strict' | 'non-refundable';
        description?: string;
        freeCancellationDays?: number; // Days before check-in for free cancellation
        penaltyPercentage?: number; // Percentage of booking amount charged as penalty
    };
    houseRules: string[];
    isActive: boolean;
    featured: boolean;
    instantConfirmation: boolean;
    propertyFeatures: {
        parking: boolean;
        wifi: boolean;
        pool: boolean;
        gym: boolean;
        spa: boolean;
        restaurant: boolean;
        bar: boolean;
        airConditioning: boolean;
        petsAllowed: boolean;
        smokingAllowed: boolean;
        wheelchairAccessible: boolean;
        familyFriendly: boolean;
        beach: boolean;
        kitchen: boolean;
        laundry: boolean;
        elevator: boolean;
        reception24h: boolean;
    };
    nearbyAttractions?: {
        name: string;
        distance: number; // in km
        type: 'beach' | 'airport' | 'restaurant' | 'shopping' | 'attraction' | 'transport';
    }[];
    sustainability?: {
        certified: boolean;
        practices: string[];
    };
    pricing: {
        taxRate: number; // Percentage
        serviceFeeRate: number; // Percentage
        cleaningFee?: number;
        depositRequired?: number;
    };
    availability: {
        minimumStay?: number; // Minimum nights
        maximumStay?: number; // Maximum nights
        advanceBookingDays?: number; // How far in advance can book
    };
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: {
        type: String,
        enum: ['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse', 'bed-and-breakfast', 'motel', 'boutique-hotel'],
        required: true
    },
    starRating: { type: Number, min: 1, max: 5 },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: 'Vanuatu' },
        zipCode: { type: String },
        coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true }
        }
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    rooms: [{
        type: { type: String, required: true },
        description: { type: String },
        maxGuests: { type: Number, required: true },
        beds: { type: Number, required: true },
        bathrooms: { type: Number, required: true },
        pricePerNight: { type: Number, required: true },
        available: { type: Boolean, default: true },
        count: { type: Number, default: 1 },
        amenities: [{ type: String }],
        mealPlan: {
            type: String,
            enum: ['none', 'breakfast', 'half-board', 'full-board', 'all-inclusive'],
            default: 'none'
        },
        size: { type: Number },
        bedType: { type: String },
        viewType: { type: String }
    }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    cancellationPolicy: {
        type: {
            type: String,
            enum: ['flexible', 'moderate', 'strict', 'non-refundable'],
            default: 'moderate'
        },
        description: { type: String },
        freeCancellationDays: { type: Number, default: 1 },
        penaltyPercentage: { type: Number, default: 0 }
    },
    houseRules: [{ type: String }],
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    instantConfirmation: { type: Boolean, default: true },
    propertyFeatures: {
        parking: { type: Boolean, default: false },
        wifi: { type: Boolean, default: false },
        pool: { type: Boolean, default: false },
        gym: { type: Boolean, default: false },
        spa: { type: Boolean, default: false },
        restaurant: { type: Boolean, default: false },
        bar: { type: Boolean, default: false },
        airConditioning: { type: Boolean, default: false },
        petsAllowed: { type: Boolean, default: false },
        smokingAllowed: { type: Boolean, default: false },
        wheelchairAccessible: { type: Boolean, default: false },
        familyFriendly: { type: Boolean, default: false },
        beach: { type: Boolean, default: false },
        kitchen: { type: Boolean, default: false },
        laundry: { type: Boolean, default: false },
        elevator: { type: Boolean, default: false },
        reception24h: { type: Boolean, default: false }
    },
    nearbyAttractions: [{
        name: { type: String },
        distance: { type: Number },
        type: {
            type: String,
            enum: ['beach', 'airport', 'restaurant', 'shopping', 'attraction', 'transport']
        }
    }],
    sustainability: {
        certified: { type: Boolean, default: false },
        practices: [{ type: String }]
    },
    pricing: {
        taxRate: { type: Number, default: 12.5 },
        serviceFeeRate: { type: Number, default: 5 },
        cleaningFee: { type: Number, default: 0 },
        depositRequired: { type: Number, default: 0 }
    },
    availability: {
        minimumStay: { type: Number, default: 1 },
        maximumStay: { type: Number },
        advanceBookingDays: { type: Number, default: 365 }
    }
}, {
    timestamps: true
});

PropertySchema.index({ 'address.coordinates': '2dsphere' });
PropertySchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProperty>('Property', PropertySchema);
