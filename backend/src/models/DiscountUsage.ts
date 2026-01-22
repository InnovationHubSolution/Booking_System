import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscountUsage extends Document {
    discountId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
    usedAt: Date;
    createdAt: Date;
}

const DiscountUsageSchema = new Schema<IDiscountUsage>({
    discountId: {
        type: Schema.Types.ObjectId,
        ref: 'Discount',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0
    },
    originalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    finalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
DiscountUsageSchema.index({ discountId: 1, userId: 1 });
DiscountUsageSchema.index({ userId: 1, usedAt: -1 });
DiscountUsageSchema.index({ bookingId: 1 });

const DiscountUsage = mongoose.model<IDiscountUsage>('DiscountUsage', DiscountUsageSchema);

export default DiscountUsage;
