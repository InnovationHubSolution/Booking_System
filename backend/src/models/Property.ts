import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
    name: string;
    description: string;
    propertyType: 'hotel' | 'apartment' | 'resort' | 'villa' | 'hostel' | 'guesthouse';
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
    }[];
    rating: number;
    reviewCount: number;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
    houseRules: string[];
    isActive: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: {
        type: String,
        enum: ['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse'],
        required: true
    },
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
        amenities: [{ type: String }]
    }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'moderate'
    },
    houseRules: [{ type: String }],
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }
}, {
    timestamps: true
});

PropertySchema.index({ 'address.coordinates': '2dsphere' });
PropertySchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProperty>('Property', PropertySchema);
