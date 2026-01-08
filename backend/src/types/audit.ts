import mongoose from 'mongoose';

/**
 * Audit Fields Interface
 * Essential for accountability and dispute resolution
 * Tracks who created/modified records and when
 */
export interface IAuditFields {
    // Creation tracking
    createdBy?: mongoose.Types.ObjectId;  // User who created the record
    createdAt: Date;                       // When the record was created
    createdByName?: string;                // Cached name for reporting (optional)
    createdByRole?: string;                // Role at time of creation (customer/admin/host)
    createdByIp?: string;                  // IP address of creator (for security)

    // Update tracking
    updatedBy?: mongoose.Types.ObjectId;  // User who last updated the record
    updatedAt?: Date;                      // When the record was last updated
    updatedByName?: string;                // Cached name for reporting (optional)
    updatedByRole?: string;                // Role at time of update
    updatedByIp?: string;                  // IP address of updater (for security)

    // Soft delete tracking (for data retention and recovery)
    deletedBy?: mongoose.Types.ObjectId;  // User who deleted/deactivated the record
    deletedAt?: Date;                      // When the record was deleted
    deletedReason?: string;                // Reason for deletion
    isDeleted?: boolean;                   // Soft delete flag
}

/**
 * Audit History Entry Interface
 * For tracking detailed change history
 */
export interface IAuditHistory {
    recordId: mongoose.Types.ObjectId;     // ID of the record being tracked
    recordType: string;                    // Model name (Booking, Property, etc.)
    action: 'create' | 'update' | 'delete' | 'restore';
    performedBy: mongoose.Types.ObjectId;  // User who performed the action
    performedByName: string;               // Name of user (cached for reporting)
    performedByRole: string;               // Role of user at time of action
    performedAt: Date;                     // Timestamp of action
    ipAddress?: string;                    // IP address of user
    userAgent?: string;                    // Browser/device info
    changes?: {                            // What was changed
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    reason?: string;                       // Optional reason for the change
    metadata?: {                           // Additional context
        sessionId?: string;
        location?: string;
        deviceType?: string;
    };
}

/**
 * Audit Context Interface
 * Passed through requests to populate audit fields
 */
export interface IAuditContext {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userRole: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}

/**
 * Extended Document interface with audit methods
 */
export interface IAuditDocument {
    softDelete(auditContext?: IAuditContext, reason?: string): Promise<any>;
    restore(auditContext?: IAuditContext): Promise<any>;
}

/**
 * Audit Schema Definition
 * Can be added to any Mongoose schema
 */
export const auditFields = {
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,  // Cannot be changed after creation
        index: true
    },
    createdByName: {
        type: String
    },
    createdByRole: {
        type: String,
        enum: ['customer', 'admin', 'host', 'system']
    },
    createdByIp: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    updatedAt: {
        type: Date,
        index: true
    },
    updatedByName: {
        type: String
    },
    updatedByRole: {
        type: String,
        enum: ['customer', 'admin', 'host', 'system']
    },
    updatedByIp: {
        type: String
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedAt: {
        type: Date
    },
    deletedReason: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
};
