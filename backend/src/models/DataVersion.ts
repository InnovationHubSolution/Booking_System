import mongoose, { Schema, Document } from 'mongoose';

/**
 * Data Version Interface
 * Tracks document versions for rollback and history
 */
export interface IDataVersion extends Document {
    // Document reference
    documentId: mongoose.Types.ObjectId;
    documentType: string; // Model name (Booking, Property, etc.)

    // Version info
    version: number; // Incremental version number
    versionLabel?: string; // Optional label (e.g., "v1.0", "Draft", "Published")

    // Snapshot of document data
    data: any; // Complete document snapshot
    snapshot: {
        compressed: boolean;
        size: number; // Size in bytes
        checksum?: string; // MD5 hash for integrity
    };

    // Change tracking
    changeType: 'created' | 'updated' | 'deleted' | 'restored' | 'snapshot';
    changesSummary?: string; // Human-readable summary
    changedFields?: string[]; // List of modified fields
    diff?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];

    // Metadata
    createdBy: mongoose.Types.ObjectId;
    createdByName: string;
    createdByRole: string;
    createdAt: Date;
    ipAddress?: string;
    userAgent?: string;

    // Backup reference
    backupSnapshotId?: mongoose.Types.ObjectId;

    // Restore info
    restoredFrom?: mongoose.Types.ObjectId; // Version ID this was restored from
    restoredAt?: Date;
    restoredBy?: mongoose.Types.ObjectId;

    // Tags and notes
    tags?: string[];
    notes?: string;

    // Retention
    retentionPolicy?: {
        keepForever: boolean;
        expiresAt?: Date;
    };
}

const DataVersionSchema: Schema = new Schema({
    documentId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    documentType: {
        type: String,
        required: true,
        index: true
    },
    version: {
        type: Number,
        required: true,
        index: true
    },
    versionLabel: {
        type: String
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    snapshot: {
        compressed: { type: Boolean, default: false },
        size: { type: Number, required: true },
        checksum: { type: String }
    },
    changeType: {
        type: String,
        enum: ['created', 'updated', 'deleted', 'restored', 'snapshot'],
        required: true,
        index: true
    },
    changesSummary: {
        type: String
    },
    changedFields: [{
        type: String
    }],
    diff: [{
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdByName: {
        type: String,
        required: true
    },
    createdByRole: {
        type: String,
        enum: ['customer', 'admin', 'host', 'manager', 'support', 'system'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        index: true,
        immutable: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    backupSnapshotId: {
        type: Schema.Types.ObjectId,
        ref: 'BackupSnapshot',
        index: true
    },
    restoredFrom: {
        type: Schema.Types.ObjectId,
        ref: 'DataVersion'
    },
    restoredAt: {
        type: Date
    },
    restoredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
        type: String,
        index: true
    }],
    notes: {
        type: String
    },
    retentionPolicy: {
        keepForever: { type: Boolean, default: false },
        expiresAt: { type: Date }
    }
}, {
    timestamps: false // We manage our own timestamp
});

// Compound indexes for efficient queries
DataVersionSchema.index({ documentId: 1, version: -1 });
DataVersionSchema.index({ documentType: 1, createdAt: -1 });
DataVersionSchema.index({ documentId: 1, documentType: 1, version: -1 });
DataVersionSchema.index({ createdBy: 1, createdAt: -1 });
DataVersionSchema.index({ backupSnapshotId: 1 });

// TTL index for automatic cleanup (keep versions for 1 year by default)
// This only affects versions without keepForever=true
DataVersionSchema.index(
    { 'retentionPolicy.expiresAt': 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            'retentionPolicy.keepForever': { $ne: true },
            'retentionPolicy.expiresAt': { $exists: true }
        }
    }
);

export default mongoose.model<IDataVersion>('DataVersion', DataVersionSchema);
