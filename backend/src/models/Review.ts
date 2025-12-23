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
    };
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
        date: { type: Date }
    },
    createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ propertyId: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
