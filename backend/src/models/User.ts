import mongoose, { Schema, Document } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface IUser extends Document, IAuditFields {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'customer' | 'admin' | 'host';
    profileImage?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    isHost: boolean;
    verified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;
    lastLogin?: Date;
    loginAttempts?: number;
    lockUntil?: Date;
    savedPaymentMethods?: {
        type: 'card' | 'paypal' | 'mobile';
        lastFour?: string;
        brand?: string; // Visa, Mastercard, etc.
        expiryMonth?: number;
        expiryYear?: number;
        isDefault: boolean;
        tokenId: string; // Encrypted token from payment provider
    }[];
    travelerProfiles?: {
        firstName: string;
        lastName: string;
        dateOfBirth?: Date;
        passportNumber?: string;
        passportExpiry?: Date;
        nationality?: string;
        frequentFlyerNumber?: string;
        specialRequirements?: string[];
    }[];
    preferences?: {
        currency: string;
        language: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
            marketing: boolean;
        };
        dietaryRestrictions?: string[];
    };
    loyaltyProgram?: {
        memberId: string;
        tier: 'bronze' | 'silver' | 'gold' | 'platinum';
        points: number;
        lifetimeBookings: number;
        joinedAt: Date;
    };
    savedSearches?: {
        searchType: 'property' | 'flight' | 'car' | 'package';
        criteria: any;
        name?: string;
        createdAt: Date;
    }[];
    recentlyViewed?: {
        itemType: 'property' | 'flight' | 'car' | 'service';
        itemId: mongoose.Types.ObjectId;
        viewedAt: Date;
    }[];
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['customer', 'admin', 'host'], default: 'customer' },
    profileImage: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String }
    },
    isHost: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    savedPaymentMethods: [{
        type: { type: String, enum: ['card', 'paypal', 'mobile'] },
        lastFour: { type: String },
        brand: { type: String },
        expiryMonth: { type: Number },
        expiryYear: { type: Number },
        isDefault: { type: Boolean, default: false },
        tokenId: { type: String, required: true }
    }],
    travelerProfiles: [{
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date },
        passportNumber: { type: String },
        passportExpiry: { type: Date },
        nationality: { type: String },
        frequentFlyerNumber: { type: String },
        specialRequirements: [{ type: String }]
    }],
    preferences: {
        currency: { type: String, default: 'VUV' },
        language: { type: String, default: 'en' },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            marketing: { type: Boolean, default: false }
        },
        dietaryRestrictions: [{ type: String }]
    },
    loyaltyProgram: {
        memberId: { type: String },
        tier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            default: 'bronze'
        },
        points: { type: Number, default: 0 },
        lifetimeBookings: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now }
    },
    savedSearches: [{
        searchType: {
            type: String,
            enum: ['property', 'flight', 'car', 'package']
        },
        criteria: { type: Schema.Types.Mixed },
        name: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    recentlyViewed: [{
        itemType: {
            type: String,
            enum: ['property', 'flight', 'car', 'service']
        },
        itemId: { type: Schema.Types.ObjectId },
        viewedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Apply audit plugin to track all changes
UserSchema.plugin(auditPlugin, {
    fieldsToTrack: [
        'email',
        'role',
        'verified',
        'isHost',
        'loyaltyProgram.tier',
        'loyaltyProgram.points'
    ]
});

export default mongoose.model<IUser>('User', UserSchema);
