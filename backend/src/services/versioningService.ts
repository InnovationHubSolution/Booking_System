import mongoose, { Document } from 'mongoose';
import DataVersion from '../models/DataVersion';
import { IAuditContext } from '../types/audit';
import crypto from 'crypto';

/**
 * Data Versioning Service
 * Automatically tracks document versions for rollback and history
 */

export interface VersioningOptions {
    enabled: boolean;
    maxVersions?: number; // Keep only last N versions (0 = unlimited)
    keepImportantVersions?: boolean; // Keep tagged/labeled versions
    retentionDays?: number; // Auto-delete after N days (0 = keep forever)
    compressData?: boolean; // Compress version data
    trackFields?: string[]; // Specific fields to track (empty = all)
}

/**
 * Create a new version snapshot of a document
 */
export const createVersion = async (
    doc: any,
    changeType: 'created' | 'updated' | 'deleted' | 'restored' | 'snapshot',
    auditContext?: IAuditContext,
    options: {
        versionLabel?: string;
        changesSummary?: string;
        changedFields?: string[];
        diff?: any[];
        tags?: string[];
        notes?: string;
        backupSnapshotId?: mongoose.Types.ObjectId;
        keepForever?: boolean;
    } = {}
): Promise<any> => {
    try {
        const modelName = (doc.constructor as any).modelName;

        // Get current version number
        const latestVersion = await DataVersion.findOne({
            documentId: doc._id,
            documentType: modelName
        })
            .sort({ version: -1 })
            .select('version');

        const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

        // Create snapshot of current data
        const docData = doc.toObject ? doc.toObject() : doc;
        const dataString = JSON.stringify(docData);
        const dataSize = Buffer.byteLength(dataString, 'utf8');
        const checksum = crypto.createHash('md5').update(dataString).digest('hex');

        // Calculate retention
        let expiresAt: Date | undefined;
        if (!options.keepForever && options.diff) {
            const retentionDays = 365; // Default 1 year
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + retentionDays);
        }

        // Create version record
        const version = await DataVersion.create({
            documentId: doc._id,
            documentType: modelName,
            version: nextVersion,
            versionLabel: options.versionLabel,
            data: docData,
            snapshot: {
                compressed: false,
                size: dataSize,
                checksum
            },
            changeType,
            changesSummary: options.changesSummary,
            changedFields: options.changedFields,
            diff: options.diff,
            createdBy: auditContext?.userId,
            createdByName: auditContext?.userName || 'System',
            createdByRole: auditContext?.userRole || 'system',
            ipAddress: auditContext?.ipAddress,
            userAgent: auditContext?.userAgent,
            backupSnapshotId: options.backupSnapshotId,
            tags: options.tags,
            notes: options.notes,
            retentionPolicy: {
                keepForever: options.keepForever || false,
                expiresAt
            }
        });

        return version;
    } catch (error) {
        console.error('Failed to create version:', error);
        // Don't throw - versioning should not block main operations
        return null;
    }
};

/**
 * Get version history for a document
 */
export const getVersionHistory = async (
    documentId: mongoose.Types.ObjectId,
    documentType: string,
    options: {
        limit?: number;
        skip?: number;
        includeData?: boolean;
    } = {}
) => {
    try {
        const query = DataVersion.find({
            documentId,
            documentType
        })
            .sort({ version: -1 });

        if (!options.includeData) {
            query.select('-data'); // Exclude large data field
        }

        if (options.limit) {
            query.limit(options.limit);
        }

        if (options.skip) {
            query.skip(options.skip);
        }

        const versions = await query.exec();
        const total = await DataVersion.countDocuments({ documentId, documentType });

        return {
            versions,
            total,
            currentVersion: versions[0]?.version || 0
        };
    } catch (error) {
        console.error('Failed to get version history:', error);
        throw error;
    }
};

/**
 * Get a specific version of a document
 */
export const getVersion = async (
    documentId: mongoose.Types.ObjectId,
    documentType: string,
    version: number
) => {
    try {
        const versionDoc = await DataVersion.findOne({
            documentId,
            documentType,
            version
        });

        return versionDoc;
    } catch (error) {
        console.error('Failed to get version:', error);
        throw error;
    }
};

/**
 * Restore a document to a previous version
 */
export const restoreVersion = async (
    Model: mongoose.Model<any>,
    versionId: mongoose.Types.ObjectId,
    auditContext?: IAuditContext
): Promise<any> => {
    try {
        const version = await DataVersion.findById(versionId);

        if (!version) {
            throw new Error('Version not found');
        }

        // Find current document
        const currentDoc = await Model.findById(version.documentId);

        if (!currentDoc) {
            throw new Error('Document not found');
        }

        // Save current state before restoring
        await createVersion(currentDoc, 'snapshot', auditContext, {
            versionLabel: `Pre-restore snapshot`,
            changesSummary: `Snapshot before restoring to version ${version.version}`,
            tags: ['pre-restore']
        });

        // Restore data
        Object.assign(currentDoc, version.data);

        // Update audit fields
        if (auditContext) {
            currentDoc.updatedBy = auditContext.userId;
            currentDoc.updatedByName = auditContext.userName;
            currentDoc.updatedByRole = auditContext.userRole;
            currentDoc.updatedByIp = auditContext.ipAddress;
            currentDoc.updatedAt = new Date();
        }

        await currentDoc.save();

        // Create version record for restoration
        await createVersion(currentDoc, 'restored', auditContext, {
            versionLabel: `Restored from v${version.version}`,
            changesSummary: `Restored to version ${version.version}`,
            tags: ['restoration'],
            keepForever: true
        });

        // Update restoration info in the original version
        version.restoredAt = new Date();
        version.restoredBy = auditContext?.userId;
        await version.save();

        return currentDoc;
    } catch (error) {
        console.error('Failed to restore version:', error);
        throw error;
    }
};

/**
 * Compare two versions
 */
export const compareVersions = async (
    versionId1: mongoose.Types.ObjectId,
    versionId2: mongoose.Types.ObjectId
) => {
    try {
        const [version1, version2] = await Promise.all([
            DataVersion.findById(versionId1),
            DataVersion.findById(versionId2)
        ]);

        if (!version1 || !version2) {
            throw new Error('One or both versions not found');
        }

        if (version1.documentId.toString() !== version2.documentId.toString()) {
            throw new Error('Versions are for different documents');
        }

        // Calculate differences
        const differences = calculateDiff(version1.data, version2.data);

        return {
            version1: {
                version: version1.version,
                createdAt: version1.createdAt,
                createdByName: version1.createdByName,
                changeType: version1.changeType
            },
            version2: {
                version: version2.version,
                createdAt: version2.createdAt,
                createdByName: version2.createdByName,
                changeType: version2.changeType
            },
            differences
        };
    } catch (error) {
        console.error('Failed to compare versions:', error);
        throw error;
    }
};

/**
 * Calculate differences between two objects
 */
const calculateDiff = (obj1: any, obj2: any, path: string = ''): any[] => {
    const differences: any[] = [];

    const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    for (const key of keys) {
        const fullPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];

        // Skip internal mongoose fields
        if (key.startsWith('_') || key === '__v') continue;

        if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
            // Recursive comparison for nested objects
            if (!Array.isArray(val1) && !Array.isArray(val2)) {
                differences.push(...calculateDiff(val1, val2, fullPath));
            } else {
                // Simple comparison for arrays
                if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                    differences.push({
                        field: fullPath,
                        oldValue: val1,
                        newValue: val2
                    });
                }
            }
        } else if (val1 !== val2) {
            differences.push({
                field: fullPath,
                oldValue: val1,
                newValue: val2
            });
        }
    }

    return differences;
};

/**
 * Mongoose plugin for automatic versioning
 */
export const versioningPlugin = (schema: mongoose.Schema, options: VersioningOptions = { enabled: true }) => {
    if (!options.enabled) return;

    // Post-save hook for versioning
    schema.post('save', async function (doc) {
        try {
            const auditContext = (doc as any).$locals?.auditContext;
            const isNew = (doc as any).$isNew;

            await createVersion(
                doc,
                isNew ? 'created' : 'updated',
                auditContext,
                {
                    changesSummary: isNew ? 'Document created' : 'Document updated',
                    tags: isNew ? ['creation'] : ['update']
                }
            );
        } catch (error) {
            console.error('Versioning plugin error:', error);
            // Don't throw - allow operation to complete
        }
    });

    // Add version query methods
    schema.statics.getVersionHistory = async function (documentId: mongoose.Types.ObjectId) {
        return getVersionHistory(documentId, this.modelName);
    };

    schema.methods.getVersionHistory = async function () {
        return getVersionHistory(this._id, (this.constructor as any).modelName);
    };

    schema.methods.restoreToVersion = async function (versionId: mongoose.Types.ObjectId, auditContext?: IAuditContext) {
        return restoreVersion(this.constructor as mongoose.Model<any>, versionId, auditContext);
    };
};

/**
 * Cleanup old versions based on retention policy
 */
export const cleanupOldVersions = async (
    documentId?: mongoose.Types.ObjectId,
    documentType?: string
) => {
    try {
        const query: any = {
            'retentionPolicy.keepForever': { $ne: true },
            'retentionPolicy.expiresAt': { $lte: new Date() }
        };

        if (documentId) query.documentId = documentId;
        if (documentType) query.documentType = documentType;

        const result = await DataVersion.deleteMany(query);

        return {
            deleted: result.deletedCount,
            message: `Cleaned up ${result.deletedCount} old versions`
        };
    } catch (error) {
        console.error('Failed to cleanup old versions:', error);
        throw error;
    }
};
