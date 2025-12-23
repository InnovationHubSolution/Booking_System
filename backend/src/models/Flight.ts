import mongoose, { Document, Schema } from 'mongoose';

export interface IFlight extends Document {
    flightNumber: string;
    airline: {
        code: string;
        name: string;
        logo: string;
    };
    departure: {
        airport: {
            code: string; // VLI, NOU, SYD, etc.
            name: string;
            city: string;
            country: string;
        };
        terminal?: string;
        gate?: string;
        dateTime: Date;
    };
    arrival: {
        airport: {
            code: string;
            name: string;
            city: string;
            country: string;
        };
        terminal?: string;
        gate?: string;
        dateTime: Date;
    };
    duration: number; // in minutes
    aircraft: {
        type: string;
        model: string;
    };
    classes: {
        economy: {
            available: number;
            price: number;
            baggage: {
                cabin: string; // e.g., "7kg"
                checked: string; // e.g., "23kg"
            };
            amenities: string[];
        };
        business?: {
            available: number;
            price: number;
            baggage: {
                cabin: string;
                checked: string;
            };
            amenities: string[];
        };
        firstClass?: {
            available: number;
            price: number;
            baggage: {
                cabin: string;
                checked: string;
            };
            amenities: string[];
        };
    };
    stops: number; // 0 for direct, 1+ for connecting
    layovers?: {
        airport: {
            code: string;
            name: string;
            city: string;
        };
        duration: number; // in minutes
    }[];
    status: 'scheduled' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived';
    isInternational: boolean;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FlightSchema = new Schema({
    flightNumber: { type: String, required: true, unique: true },
    airline: {
        code: { type: String, required: true },
        name: { type: String, required: true },
        logo: { type: String, required: true }
    },
    departure: {
        airport: {
            code: { type: String, required: true },
            name: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true }
        },
        terminal: String,
        gate: String,
        dateTime: { type: Date, required: true }
    },
    arrival: {
        airport: {
            code: { type: String, required: true },
            name: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true }
        },
        terminal: String,
        gate: String,
        dateTime: { type: Date, required: true }
    },
    duration: { type: Number, required: true },
    aircraft: {
        type: { type: String, required: true },
        model: { type: String, required: true }
    },
    classes: {
        economy: {
            available: { type: Number, required: true },
            price: { type: Number, required: true },
            baggage: {
                cabin: { type: String, required: true },
                checked: { type: String, required: true }
            },
            amenities: [String]
        },
        business: {
            available: Number,
            price: Number,
            baggage: {
                cabin: String,
                checked: String
            },
            amenities: [String]
        },
        firstClass: {
            available: Number,
            price: Number,
            baggage: {
                cabin: String,
                checked: String
            },
            amenities: [String]
        }
    },
    stops: { type: Number, default: 0 },
    layovers: [{
        airport: {
            code: String,
            name: String,
            city: String
        },
        duration: Number
    }],
    status: {
        type: String,
        enum: ['scheduled', 'delayed', 'cancelled', 'boarding', 'departed', 'arrived'],
        default: 'scheduled'
    },
    isInternational: { type: Boolean, required: true },
    currency: { type: String, default: 'VUV' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index for search
FlightSchema.index({ 'departure.airport.code': 1, 'arrival.airport.code': 1, 'departure.dateTime': 1 });
FlightSchema.index({ 'airline.code': 1 });
FlightSchema.index({ isInternational: 1, isActive: 1 });

export default mongoose.model<IFlight>('Flight', FlightSchema);
