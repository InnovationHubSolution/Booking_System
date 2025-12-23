import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    propertyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    rating: number;
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
    comment: string;
    images: string[];
    helpful: mongoose.Types.ObjectId[];
    response?: {
        text: string;
        date: Date;
        userId?: mongoose.Types.ObjectId; // Host/manager who responded
    };
    verified: boolean; // Only from confirmed bookings
    travelerType?: 'solo' | 'couple' | 'family' | 'business' | 'group';
    roomType?: string;
    stayDuration?: number; // nights
    tripPurpose?: 'leisure' | 'business' | 'family-vacation' | 'romantic' | 'adventure';
    likedFeatures?: string[]; // What the guest liked most
    improvementSuggestions?: string[]; // What could be better
    wouldRecommend: boolean;
    flagged: boolean; // For inappropriate content
    flagReason?: string;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, required: true, min: 1, max: 5 },
    accuracy: { type: Number, required: true, min: 1, max: 5 },
    checkIn: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    location: { type: Number, required: true, min: 1, max: 5 },
    value: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
    helpful: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    response: {
        text: { type: String },
        date: { type: Date },
        userId: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    verified: { type: Boolean, default: true },
    travelerType: {
        type: String,
        enum: ['solo', 'couple', 'family', 'business', 'group']
    },
    roomType: { type: String },
    stayDuration: { type: Number },
    tripPurpose: {
        type: String,
        enum: ['leisure', 'business', 'family-vacation', 'romantic', 'adventure']
    },
    likedFeatures: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    wouldRecommend: { type: Boolean, default: true },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ propertyId: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
