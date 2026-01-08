import { Request, Response, NextFunction } from 'express';
import mongoose, { Document, Model } from 'mongoose';
import AuditHistory from '../models/AuditHistory';
import { IAuditContext } from '../types/audit';
import { createVersion } from '../services/versioningService';

/**
 * Extended Request interface with audit context
 */
export interface RequestWithAudit extends Request {
    auditContext?: IAuditContext;
}

/**
 * Middleware to extract and attach audit context to request
 * Should be applied after authentication middleware
 */
export const auditContextMiddleware = (req: RequestWithAudit, res: Response, next: NextFunction) => {
    // Check if user is authenticated (from auth middleware)
    if ((req as any).user) {
        const user = (req as any).user;
        req.auditContext = {
            userId: user._id || user.id,
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role || 'customer',
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
            sessionId: (req as any).sessionID
        };
    }
    next();
};

/**
 * Helper function to populate audit fields on document creation
 */
export const populateCreateAudit = (doc: any, auditContext?: IAuditContext) => {
    if (auditContext) {
        doc.createdBy = auditContext.userId;
        doc.createdByName = auditContext.userName;
        doc.createdByRole = auditContext.userRole;
        doc.createdByIp = auditContext.ipAddress;
    }
    doc.createdAt = new Date();
};

/**
 * Helper function to populate audit fields on document update
 */
export const populateUpdateAudit = (doc: any, auditContext?: IAuditContext) => {
    if (auditContext) {
        doc.updatedBy = auditContext.userId;
        doc.updatedByName = auditContext.userName;
        doc.updatedByRole = auditContext.userRole;
        doc.updatedByIp = auditContext.ipAddress;
    }
    doc.updatedAt = new Date();
};

/**
 * Helper function to populate audit fields on soft delete
 */
export const populateDeleteAudit = (doc: any, auditContext?: IAuditContext, reason?: string) => {
    if (auditContext) {
        doc.deletedBy = auditContext.userId;
        doc.deletedReason = reason;
    }
    doc.deletedAt = new Date();
    doc.isDeleted = true;
};

/**
 * Create audit history entry
 */
export const createAuditHistory = async (
    recordId: mongoose.Types.ObjectId,
    recordType: string,
    action: 'create' | 'update' | 'delete' | 'restore',
    auditContext: IAuditContext,
    changes?: { field: string; oldValue: any; newValue: any }[],
    reason?: string
) => {
    try {
        await AuditHistory.create({
            recordId,
            recordType,
            action,
            performedBy: auditContext.userId,
            performedByName: auditContext.userName,
            performedByRole: auditContext.userRole,
            performedAt: new Date(),
            ipAddress: auditContext.ipAddress,
            userAgent: auditContext.userAgent,
            changes,
            reason,
            metadata: {
                sessionId: auditContext.sessionId
            }
        });
    } catch (error) {
        // Log error but don't fail the main operation
        console.error('Failed to create audit history:', error);
    }
};

/**
 * Track changes between old and new document versions
 */
export const trackChanges = (oldDoc: any, newDoc: any, fieldsToTrack: string[]) => {
    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    for (const field of fieldsToTrack) {
        const oldValue = getNestedValue(oldDoc, field);
        const newValue = getNestedValue(newDoc, field);

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
                field,
                oldValue,
                newValue
            });
        }
    }

    return changes;
};

/**
 * Get nested object value by path (e.g., 'pricing.totalAmount')
 */
const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Mongoose plugin to automatically add audit tracking
 * Usage: MySchema.plugin(auditPlugin, { fieldsToTrack: ['status', 'totalPrice'], enableVersioning: true });
 */
export const auditPlugin = (schema: mongoose.Schema, options: { fieldsToTrack?: string[], enableVersioning?: boolean } = {}) => {
    // Add audit fields to schema if not already present
    if (!schema.path('createdBy')) {
        schema.add({
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
            createdAt: { type: Date, default: Date.now, immutable: true, index: true },
            createdByName: { type: String },
            createdByRole: { type: String, enum: ['customer', 'admin', 'host', 'system'] },
            createdByIp: { type: String },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
            updatedAt: { type: Date, index: true },
            updatedByName: { type: String },
            updatedByRole: { type: String, enum: ['customer', 'admin', 'host', 'system'] },
            updatedByIp: { type: String },
            deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            deletedAt: { type: Date },
            deletedReason: { type: String },
            isDeleted: { type: Boolean, default: false, index: true }
        });
    }

    // Pre-save hook for audit tracking
    schema.pre('save', async function (next) {
        const doc = this as any;
        const auditContext = (doc as any).$locals?.auditContext;

        if (this.isNew) {
            // New document - populate creation audit
            populateCreateAudit(doc, auditContext);

            // Create audit history
            if (auditContext) {
                await createAuditHistory(
                    doc._id,
                    (this.constructor as any).modelName,
                    'create',
                    auditContext
                );
            }

            // Create version if enabled
            if (options.enableVersioning) {
                await createVersion(doc, 'created', auditContext, {
                    versionLabel: 'Initial version',
                    changesSummary: 'Document created'
                });
            }
        } else if (this.isModified()) {
            // Existing document - populate update audit
            populateUpdateAudit(doc, auditContext);

            // Track changes and create audit history
            if (auditContext && options.fieldsToTrack) {
                const oldDoc = await (this.constructor as Model<any>).findById(doc._id);
                if (oldDoc) {
                    const changes = trackChanges(oldDoc.toObject(), doc.toObject(), options.fieldsToTrack);
                    if (changes.length > 0) {
                        await createAuditHistory(
                            doc._id,
                            (this.constructor as any).modelName,
                            'update',
                            auditContext,
                            changes
                        );

                        // Create version if enabled
                        if (options.enableVersioning) {
                            await createVersion(doc, 'updated', auditContext, {
                                changesSummary: `Updated ${changes.length} field(s)`,
                                changedFields: changes.map(c => c.field),
                                diff: changes
                            });
                        }
                    }
                }
            }
        }

        next();
    });

    // Add soft delete method
    schema.methods.softDelete = async function (auditContext?: IAuditContext, reason?: string) {
        populateDeleteAudit(this, auditContext, reason);

        if (auditContext) {
            await createAuditHistory(
                this._id,
                (this.constructor as any).modelName,
                'delete',
                auditContext,
                undefined,
                reason
            );
        }

        return this.save();
    };

    // Add restore method
    schema.methods.restore = async function (auditContext?: IAuditContext) {
        this.isDeleted = false;
        this.deletedAt = undefined;
        this.deletedBy = undefined;
        this.deletedReason = undefined;
        populateUpdateAudit(this, auditContext);

        if (auditContext) {
            await createAuditHistory(
                this._id,
                (this.constructor as any).modelName,
                'restore',
                auditContext
            );
        }

        return this.save();
    };

    // Modify find queries to exclude soft-deleted documents by default
    schema.pre(/^find/, function (next) {
        const query = this as mongoose.Query<any, any>;
        if (!(query.getOptions() as any).includeDeleted) {
            query.where({ isDeleted: { $ne: true } });
        }
        next();
    });
};

/**
 * Helper to attach audit context to a document before save
 */
export const withAuditContext = <T extends Document>(doc: T, auditContext: IAuditContext): T => {
    (doc as any).$locals = (doc as any).$locals || {};
    (doc as any).$locals.auditContext = auditContext;
    return doc;
};
