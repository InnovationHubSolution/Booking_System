import mongoose, { Schema, Document } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface IPromotion extends Document, IAuditFields {
    code: string;
    name: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free-nights' | 'upgrade' | 'early-bird' | 'last-minute';
    discountValue: number; // Percentage (0-100) or fixed amount
    applicableFor: ('property' | 'flight' | 'car' | 'transfer' | 'package' | 'service')[];
    specificItems?: {
        itemType: 'property' | 'flight' | 'car' | 'transfer' | 'package' | 'service';
        itemId: mongoose.Types.ObjectId;
    }[];
    minimumSpend?: number;
    maximumDiscount?: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit?: number;
    usageCount: number;
    perUserLimit?: number;
    conditions?: {
        minNights?: number;
        minPassengers?: number;
        bookingDaysInAdvance?: number;
        userTierRequired?: 'bronze' | 'silver' | 'gold' | 'platinum';
        firstTimeUser?: boolean;
        destinationCities?: string[];
        propertyTypes?: string[];
    };
    priority: number; // Higher priority promos applied first
    isActive: boolean;
    isFeatured: boolean;
    bannerImage?: string;
    termsAndConditions: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PromotionSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'free-nights', 'upgrade', 'early-bird', 'last-minute'],
        required: true
    },
    discountValue: { type: Number, required: true },
    applicableFor: [{
        type: String,
        enum: ['property', 'flight', 'car', 'transfer', 'package', 'service']
    }],
    specificItems: [{
        itemType: {
            type: String,
            enum: ['property', 'flight', 'car', 'transfer', 'package', 'service']
        },
        itemId: { type: Schema.Types.ObjectId }
    }],
    minimumSpend: { type: Number },
    maximumDiscount: { type: Number },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    conditions: {
        minNights: { type: Number },
        minPassengers: { type: Number },
        bookingDaysInAdvance: { type: Number },
        userTierRequired: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum']
        },
        firstTimeUser: { type: Boolean },
        destinationCities: [{ type: String }],
        propertyTypes: [{ type: String }]
    },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    bannerImage: { type: String },
    termsAndConditions: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

// code index automatically created by unique: true
PromotionSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
PromotionSchema.index({ applicableFor: 1 });

// Apply audit plugin
PromotionSchema.plugin(auditPlugin, {
    fieldsToTrack: ['isActive', 'usageCount', 'discountValue']
});

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
