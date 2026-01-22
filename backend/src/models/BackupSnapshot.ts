import mongoose, { Schema, Document } from 'mongoose';

/**
 * Backup Snapshot Interface
 * Tracks system-wide backup points for disaster recovery
 */
export interface IBackupSnapshot extends Document {
    // Snapshot identification
    snapshotId: string; // Unique identifier (e.g., "SNAPSHOT-2025-12-26-001")
    name: string; // Human-readable name
    description?: string;

    // Backup type
    type: 'manual' | 'scheduled' | 'pre-migration' | 'disaster-recovery' | 'rollback-point';
    status: 'in-progress' | 'completed' | 'failed' | 'partial' | 'verifying';

    // Backup scope
    scope: {
        includeCollections: string[]; // Collections included
        excludeCollections?: string[];
        includeAudit: boolean;
        includeVersions: boolean;
        includeFiles: boolean;
    };

    // Backup statistics
    statistics: {
        totalDocuments: number;
        totalSize: number; // Bytes
        compressedSize?: number;
        documentsPerCollection: {
            collection: string;
            count: number;
            size: number;
        }[];
    };

    // Storage information
    storage: {
        location: 'local' | 's3' | 'azure' | 'gcs' | 'ftp';
        path: string;
        encrypted: boolean;
        compressionType?: 'gzip' | 'bzip2' | 'none';
        checksums: {
            collection: string;
            checksum: string;
        }[];
    };

    // Timing
    startedAt: Date;
    completedAt?: Date;
    duration?: number; // Seconds

    // Verification
    verified: boolean;
    verifiedAt?: Date;
    verificationResults?: {
        passed: boolean;
        errors?: string[];
        warnings?: string[];
    };

    // Created by
    createdBy: mongoose.Types.ObjectId;
    createdByName: string;
    createdByRole: string;
    createdByIp?: string;

    // Restoration info
    restoredCount: number; // How many times this snapshot was used
    lastRestoredAt?: Date;
    lastRestoredBy?: mongoose.Types.ObjectId;

    // Retention
    retentionPolicy: {
        keepForever: boolean;
        expiresAt?: Date;
        autoDelete: boolean;
    };

    // Metadata
    tags: string[];
    metadata?: {
        systemVersion?: string;
        databaseVersion?: string;
        environment?: 'development' | 'staging' | 'production';
        [key: string]: any;
    };

    // Related snapshots
    parentSnapshotId?: mongoose.Types.ObjectId; // Incremental backup parent
    incrementalBackup: boolean;

    // Error tracking
    backupErrors?: {
        collection?: string;
        error: string;
        timestamp: Date;
    }[];
}

const BackupSnapshotSchema: Schema = new Schema({
    snapshotId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['manual', 'scheduled', 'pre-migration', 'disaster-recovery', 'rollback-point'],
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'failed', 'partial', 'verifying'],
        default: 'in-progress',
        index: true
    },
    scope: {
        includeCollections: [{ type: String }],
        excludeCollections: [{ type: String }],
        includeAudit: { type: Boolean, default: true },
        includeVersions: { type: Boolean, default: true },
        includeFiles: { type: Boolean, default: false }
    },
    statistics: {
        totalDocuments: { type: Number, default: 0 },
        totalSize: { type: Number, default: 0 },
        compressedSize: { type: Number },
        documentsPerCollection: [{
            collection: { type: String },
            count: { type: Number },
            size: { type: Number }
        }]
    },
    storage: {
        location: {
            type: String,
            enum: ['local', 's3', 'azure', 'gcs', 'ftp'],
            default: 'local'
        },
        path: { type: String, required: true },
        encrypted: { type: Boolean, default: false },
        compressionType: {
            type: String,
            enum: ['gzip', 'bzip2', 'none'],
            default: 'gzip'
        },
        checksums: [{
            collection: { type: String },
            checksum: { type: String }
        }]
    },
    startedAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    duration: {
        type: Number
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    verificationResults: {
        passed: { type: Boolean },
        errors: [{ type: String }],
        warnings: [{ type: String }]
    },
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
        enum: ['admin', 'manager', 'system'],
        required: true
    },
    createdByIp: {
        type: String
    },
    restoredCount: {
        type: Number,
        default: 0
    },
    lastRestoredAt: {
        type: Date
    },
    lastRestoredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    retentionPolicy: {
        keepForever: { type: Boolean, default: false },
        expiresAt: { type: Date },
        autoDelete: { type: Boolean, default: true }
    },
    tags: [{
        type: String,
        index: true
    }],
    metadata: {
        type: Schema.Types.Mixed
    },
    parentSnapshotId: {
        type: Schema.Types.ObjectId,
        ref: 'BackupSnapshot'
    },
    incrementalBackup: {
        type: Boolean,
        default: false
    },
    backupErrors: [{
        collection: { type: String },
        error: { type: String },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes
BackupSnapshotSchema.index({ type: 1, status: 1, startedAt: -1 });
BackupSnapshotSchema.index({ verified: 1, startedAt: -1 });
BackupSnapshotSchema.index({ tags: 1, startedAt: -1 });
BackupSnapshotSchema.index({ 'retentionPolicy.expiresAt': 1 });

// TTL index for automatic cleanup
BackupSnapshotSchema.index(
    { 'retentionPolicy.expiresAt': 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            'retentionPolicy.keepForever': { $ne: true },
            'retentionPolicy.autoDelete': true,
            'retentionPolicy.expiresAt': { $exists: true }
        }
    }
);

// Generate snapshot ID before saving
BackupSnapshotSchema.pre('save', function (next) {
    if (!this.snapshotId) {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.getTime().toString().slice(-6);
        this.snapshotId = `SNAPSHOT-${dateStr}-${timeStr}`;
    }
    next();
});

export default mongoose.model<IBackupSnapshot>('BackupSnapshot', BackupSnapshotSchema);
