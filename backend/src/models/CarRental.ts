import mongoose, { Document, Schema } from 'mongoose';

export interface ICarRental extends Document {
    company: {
        name: string;
        logo: string;
        rating: number;
        reviewCount: number;
    };
    vehicle: {
        make: string;
        model: string;
        year: number;
        category: 'economy' | 'compact' | 'midsize' | 'fullsize' | 'suv' | 'luxury' | 'van' | '4x4';
        transmission: 'automatic' | 'manual';
        fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
        seats: number;
        doors: number;
        luggage: number; // number of large bags
        airConditioning: boolean;
    };
    images: string[];
    location: {
        pickupLocations: {
            name: string;
            address: string;
            type: 'airport' | 'city' | 'hotel' | 'port';
            coordinates: {
                type: { type: String, default: 'Point' };
                coordinates: [number]; // [longitude, latitude]
            };
            openingHours: string;
        }[];
        dropoffLocations: {
            name: string;
            address: string;
            type: 'airport' | 'city' | 'hotel' | 'port';
            coordinates: {
                type: { type: String, default: 'Point' };
                coordinates: [number];
            };
            openingHours: string;
        }[];
    };
    pricing: {
        dailyRate: number;
        weeklyRate?: number;
        monthlyRate?: number;
        currency: string;
        deposit: number;
        excessReduction?: number; // optional insurance
    };
    features: string[]; // GPS, Child seat, USB, Bluetooth, etc.
    fuelPolicy: 'full-to-full' | 'same-to-same' | 'full-to-empty';
    mileage: {
        unlimited: boolean;
        kmPerDay?: number;
        extraKmCharge?: number;
    };
    insurance: {
        basic: {
            included: boolean;
            coverage: string;
            excess: number;
        };
        premium?: {
            price: number;
            coverage: string;
            excess: number;
        };
    };
    requirements: {
        minAge: number;
        maxAge?: number;
        drivingLicenseYears: number;
        internationalLicense: boolean;
    };
    available: number;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CarRentalSchema = new Schema({
    company: {
        name: { type: String, required: true },
        logo: { type: String, required: true },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },
    vehicle: {
        make: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        category: {
            type: String,
            enum: ['economy', 'compact', 'midsize', 'fullsize', 'suv', 'luxury', 'van', '4x4'],
            required: true
        },
        transmission: {
            type: String,
            enum: ['automatic', 'manual'],
            required: true
        },
        fuelType: {
            type: String,
            enum: ['petrol', 'diesel', 'hybrid', 'electric'],
            required: true
        },
        seats: { type: Number, required: true },
        doors: { type: Number, required: true },
        luggage: { type: Number, required: true },
        airConditioning: { type: Boolean, default: true }
    },
    images: [String],
    location: {
        pickupLocations: [{
            name: { type: String, required: true },
            address: { type: String, required: true },
            type: {
                type: String,
                enum: ['airport', 'city', 'hotel', 'port'],
                required: true
            },
            coordinates: {
                type: { type: String, default: 'Point' },
                coordinates: { type: [Number], required: true }
            },
            openingHours: String
        }],
        dropoffLocations: [{
            name: { type: String, required: true },
            address: { type: String, required: true },
            type: {
                type: String,
                enum: ['airport', 'city', 'hotel', 'port'],
                required: true
            },
            coordinates: {
                type: { type: String, default: 'Point' },
                coordinates: { type: [Number], required: true }
            },
            openingHours: String
        }]
    },
    pricing: {
        dailyRate: { type: Number, required: true },
        weeklyRate: Number,
        monthlyRate: Number,
        currency: { type: String, default: 'VUV' },
        deposit: { type: Number, required: true },
        excessReduction: Number
    },
    features: [String],
    fuelPolicy: {
        type: String,
        enum: ['full-to-full', 'same-to-same', 'full-to-empty'],
        default: 'full-to-full'
    },
    mileage: {
        unlimited: { type: Boolean, default: false },
        kmPerDay: Number,
        extraKmCharge: Number
    },
    insurance: {
        basic: {
            included: { type: Boolean, default: true },
            coverage: String,
            excess: Number
        },
        premium: {
            price: Number,
            coverage: String,
            excess: Number
        }
    },
    requirements: {
        minAge: { type: Number, default: 21 },
        maxAge: Number,
        drivingLicenseYears: { type: Number, default: 1 },
        internationalLicense: { type: Boolean, default: false }
    },
    available: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes
CarRentalSchema.index({ 'vehicle.category': 1, 'pricing.dailyRate': 1 });
CarRentalSchema.index({ 'location.pickupLocations.coordinates': '2dsphere' });
CarRentalSchema.index({ isActive: 1 });

export default mongoose.model<ICarRental>('CarRental', CarRentalSchema);
