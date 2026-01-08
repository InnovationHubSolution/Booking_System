import mongoose, { Document, Schema } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface IScenicFlyTour extends Document, IAuditFields {
    name: string;
    description: string;
    images: string[];
    duration: number; // in minutes
    route: {
        departure: {
            location: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        };
        highlights: {
            name: string;
            description: string;
            coordinates?: {
                lat: number;
                lng: number;
            };
            timeOverLocation?: number; // minutes spent over this location
        }[];
        return: {
            location: string;
            coordinates: {
                lat: number;
                lng: number;
            };
        };
    };
    aircraft: {
        type: string;
        model: string;
        capacity: number;
        features: string[]; // e.g., ["Panoramic windows", "Air conditioning", "Headphones"]
    };
    pricing: {
        perPerson: number;
        currency: string;
        privateCharter?: number; // Full aircraft charter price
        childDiscount?: number; // Percentage discount for children
        groupDiscount?: {
            minimumPeople: number;
            discountPercentage: number;
        };
    };
    schedule: {
        availableDays: number[]; // 0 = Sunday, 6 = Saturday
        timeSlots: {
            departureTime: string; // "09:00"
            availableSeats: number;
        }[];
    };
    includes: string[]; // e.g., ["Pilot commentary", "Refreshments", "Photo opportunities"]
    requirements: {
        minimumAge?: number;
        weightLimit?: number; // per person in kg
        healthRestrictions?: string[];
        weatherDependent: boolean;
    };
    cancellationPolicy: {
        freeCancellation: number; // hours before departure
        refundPercentage: {
            moreThan24Hours: number;
            lessThan24Hours: number;
            lessThan12Hours: number;
        };
    };
    rating: number;
    reviewCount: number;
    totalBookings: number;
    isActive: boolean;
    isFeatured: boolean;
    seasonalAvailability?: {
        startMonth: number; // 1-12
        endMonth: number; // 1-12
    };
    safetyInformation: string[];
    maxBookingsPerDay?: number;
}

const ScenicFlyTourSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    duration: { type: Number, required: true }, // in minutes
    route: {
        departure: {
            location: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
            }
        },
        highlights: [{
            name: { type: String, required: true },
            description: { type: String, required: true },
            coordinates: {
                lat: Number,
                lng: Number
            },
            timeOverLocation: Number
        }],
        return: {
            location: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
            }
        }
    },
    aircraft: {
        type: { type: String, required: true },
        model: { type: String, required: true },
        capacity: { type: Number, required: true },
        features: [{ type: String }]
    },
    pricing: {
        perPerson: { type: Number, required: true },
        currency: { type: String, default: 'VUV' },
        privateCharter: Number,
        childDiscount: Number,
        groupDiscount: {
            minimumPeople: Number,
            discountPercentage: Number
        }
    },
    schedule: {
        availableDays: [{ type: Number, min: 0, max: 6 }],
        timeSlots: [{
            departureTime: { type: String, required: true },
            availableSeats: { type: Number, required: true }
        }]
    },
    includes: [{ type: String }],
    requirements: {
        minimumAge: Number,
        weightLimit: Number,
        healthRestrictions: [String],
        weatherDependent: { type: Boolean, default: true }
    },
    cancellationPolicy: {
        freeCancellation: { type: Number, default: 24 },
        refundPercentage: {
            moreThan24Hours: { type: Number, default: 100 },
            lessThan24Hours: { type: Number, default: 50 },
            lessThan12Hours: { type: Number, default: 0 }
        }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seasonalAvailability: {
        startMonth: { type: Number, min: 1, max: 12 },
        endMonth: { type: Number, min: 1, max: 12 }
    },
    safetyInformation: [{ type: String }],
    maxBookingsPerDay: Number
}, {
    timestamps: true
});

// Apply audit plugin
ScenicFlyTourSchema.plugin(auditPlugin, {
    fieldsToTrack: ['pricing.perPerson', 'isActive', 'schedule.timeSlots']
});

// Index for efficient searching
ScenicFlyTourSchema.index({ name: 'text', description: 'text' });
ScenicFlyTourSchema.index({ isActive: 1, isFeatured: -1, rating: -1 });
ScenicFlyTourSchema.index({ 'pricing.perPerson': 1 });

export default mongoose.model<IScenicFlyTour>('ScenicFlyTour', ScenicFlyTourSchema);
