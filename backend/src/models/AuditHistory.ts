import mongoose, { Schema, Document } from 'mongoose';
import { IAuditHistory } from '../types/audit';

export interface IAuditHistoryDocument extends IAuditHistory, Document { }

const AuditHistorySchema: Schema = new Schema({
    recordId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    recordType: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete', 'restore'],
        required: true,
        index: true
    },
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    performedByName: {
        type: String,
        required: true
    },
    performedByRole: {
        type: String,
        enum: ['customer', 'admin', 'host', 'system'],
        required: true
    },
    performedAt: {
        type: Date,
        default: Date.now,
        required: true,
        index: true,
        immutable: true  // Cannot be changed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    changes: [{
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed }
    }],
    reason: {
        type: String
    },
    metadata: {
        sessionId: { type: String },
        location: { type: String },
        deviceType: { type: String }
    }
}, {
    timestamps: false  // We manage our own timestamp (performedAt)
});

// Compound indexes for common queries
AuditHistorySchema.index({ recordId: 1, recordType: 1, performedAt: -1 });
AuditHistorySchema.index({ performedBy: 1, performedAt: -1 });
AuditHistorySchema.index({ recordType: 1, action: 1, performedAt: -1 });

// TTL index - automatically delete audit records older than 2 years (for GDPR compliance)
// Remove or adjust this based on your data retention requirements
AuditHistorySchema.index({ performedAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.model<IAuditHistoryDocument>('AuditHistory', AuditHistorySchema);
