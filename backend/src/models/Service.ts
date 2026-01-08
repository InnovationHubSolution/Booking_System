import mongoose, { Schema, Document } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface IService extends Document, IAuditFields {
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    duration: number;
    capacity: number;
    location: string;
    images: string[];
    availableDays: number[];
    availableHours: { start: string; end: string };
    isActive: boolean;
    amenities: string[];
}

const ServiceSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'VUV' },
    duration: { type: Number, required: true },
    capacity: { type: Number, default: 1 },
    location: { type: String, required: true },
    images: [{ type: String }],
    availableDays: [{ type: Number, min: 0, max: 6 }],
    availableHours: {
        start: { type: String, required: true },
        end: { type: String, required: true }
    },
    isActive: { type: Boolean, default: true },
    amenities: [{ type: String }]
});

// Apply audit plugin
ServiceSchema.plugin(auditPlugin, {
    fieldsToTrack: ['price', 'isActive', 'capacity']
});

export default mongoose.model<IService>('Service', ServiceSchema);
