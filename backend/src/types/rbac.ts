import mongoose from 'mongoose';

/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for different user roles
 */

export type UserRole = 'customer' | 'admin' | 'host' | 'manager' | 'support' | 'system';

export type Permission =
    // Booking permissions
    | 'booking:create'
    | 'booking:read'
    | 'booking:read:own'
    | 'booking:read:all'
    | 'booking:update'
    | 'booking:update:own'
    | 'booking:update:all'
    | 'booking:delete'
    | 'booking:delete:own'
    | 'booking:delete:all'
    | 'booking:restore'

    // Property permissions
    | 'property:create'
    | 'property:read'
    | 'property:read:own'
    | 'property:read:all'
    | 'property:update'
    | 'property:update:own'
    | 'property:update:all'
    | 'property:delete'
    | 'property:approve'

    // User permissions
    | 'user:create'
    | 'user:read'
    | 'user:read:own'
    | 'user:read:all'
    | 'user:update'
    | 'user:update:own'
    | 'user:update:all'
    | 'user:delete'
    | 'user:verify'
    | 'user:change-role'

    // Payment permissions
    | 'payment:process'
    | 'payment:refund'
    | 'payment:view'
    | 'payment:view:all'

    // Review permissions
    | 'review:create'
    | 'review:read'
    | 'review:update:own'
    | 'review:delete:own'
    | 'review:delete:all'
    | 'review:flag'
    | 'review:moderate'

    // Audit permissions
    | 'audit:read'
    | 'audit:read:own'
    | 'audit:read:all'
    | 'audit:export'

    // System permissions
    | 'system:settings'
    | 'system:backup'
    | 'system:restore'
    | 'system:logs'

    // Promotion permissions
    | 'promotion:create'
    | 'promotion:update'
    | 'promotion:delete'
    | 'promotion:view:all'

    // Report permissions
    | 'report:view'
    | 'report:export'
    | 'report:financial';

/**
 * Role Permission Matrix
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    customer: [
        'booking:create',
        'booking:read:own',
        'booking:update:own',
        'booking:delete:own',
        'property:read',
        'user:read:own',
        'user:update:own',
        'payment:process',
        'payment:view',
        'review:create',
        'review:read',
        'review:update:own',
        'review:delete:own',
        'audit:read:own',
    ],

    host: [
        'booking:read',
        'booking:update',
        'property:create',
        'property:read:own',
        'property:read:all',
        'property:update:own',
        'property:delete',
        'user:read:own',
        'user:update:own',
        'payment:view',
        'review:read',
        'review:flag',
        'audit:read:own',
        'report:view',
    ],

    manager: [
        'booking:read:all',
        'booking:update:all',
        'booking:delete:all',
        'booking:restore',
        'property:read:all',
        'property:update:all',
        'property:approve',
        'user:read:all',
        'user:update:all',
        'user:verify',
        'payment:process',
        'payment:refund',
        'payment:view:all',
        'review:read',
        'review:moderate',
        'review:delete:all',
        'audit:read:all',
        'audit:export',
        'promotion:create',
        'promotion:update',
        'promotion:delete',
        'promotion:view:all',
        'report:view',
        'report:export',
        'report:financial',
    ],

    support: [
        'booking:read:all',
        'booking:update:all',
        'property:read:all',
        'user:read:all',
        'user:update',
        'user:verify',
        'payment:view:all',
        'review:read',
        'review:flag',
        'review:moderate',
        'audit:read:all',
        'report:view',
    ],

    admin: [
        // Admins have all permissions
        'booking:create',
        'booking:read:all',
        'booking:update:all',
        'booking:delete:all',
        'booking:restore',
        'property:create',
        'property:read:all',
        'property:update:all',
        'property:delete',
        'property:approve',
        'user:create',
        'user:read:all',
        'user:update:all',
        'user:delete',
        'user:verify',
        'user:change-role',
        'payment:process',
        'payment:refund',
        'payment:view:all',
        'review:create',
        'review:read',
        'review:delete:all',
        'review:moderate',
        'audit:read:all',
        'audit:export',
        'system:settings',
        'system:backup',
        'system:restore',
        'system:logs',
        'promotion:create',
        'promotion:update',
        'promotion:delete',
        'promotion:view:all',
        'report:view',
        'report:export',
        'report:financial',
    ],

    system: [
        // System role for automated processes
        'booking:create',
        'booking:read:all',
        'booking:update:all',
        'system:backup',
        'system:logs',
    ],
};

/**
 * Access Level Configuration
 * Defines hierarchical access levels for fine-grained control
 */
export enum AccessLevel {
    NONE = 0,
    READ = 1,
    WRITE = 2,
    UPDATE = 3,
    DELETE = 4,
    FULL = 5,
}

export interface IAccessControl {
    role: UserRole;
    accessLevel: AccessLevel;
    permissions: Permission[];
    customPermissions?: Permission[]; // Override specific permissions
    restrictions?: {
        maxBookingsPerDay?: number;
        maxPropertiesActive?: number;
        canViewFinancials?: boolean;
        canModifyPricing?: boolean;
        canAccessAudit?: boolean;
    };
    temporaryElevation?: {
        grantedBy: mongoose.Types.ObjectId;
        grantedAt: Date;
        expiresAt: Date;
        reason: string;
        additionalPermissions: Permission[];
    };
}

/**
 * Resource-Level Permissions
 * For document-level access control
 */
export interface IResourcePermission {
    userId: mongoose.Types.ObjectId;
    resourceType: 'booking' | 'property' | 'review' | 'payment';
    resourceId: mongoose.Types.ObjectId;
    permissions: Permission[];
    grantedBy: mongoose.Types.ObjectId;
    grantedAt: Date;
    expiresAt?: Date;
    reason?: string;
}

/**
 * Permission Check Result
 */
export interface IPermissionCheck {
    allowed: boolean;
    reason?: string;
    requiredPermission?: Permission;
    userRole?: UserRole;
    accessLevel?: AccessLevel;
}

/**
 * Helper functions for RBAC
 */
export class RBACHelper {
    /**
     * Check if a role has a specific permission
     */
    static hasPermission(role: UserRole, permission: Permission): boolean {
        return ROLE_PERMISSIONS[role]?.includes(permission) || false;
    }

    /**
     * Check if a role has any of the specified permissions
     */
    static hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
        const rolePermissions = ROLE_PERMISSIONS[role] || [];
        return permissions.some(permission => rolePermissions.includes(permission));
    }

    /**
     * Check if a role has all of the specified permissions
     */
    static hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
        const rolePermissions = ROLE_PERMISSIONS[role] || [];
        return permissions.every(permission => rolePermissions.includes(permission));
    }

    /**
     * Get all permissions for a role
     */
    static getPermissions(role: UserRole): Permission[] {
        return ROLE_PERMISSIONS[role] || [];
    }

    /**
     * Get access level based on permissions
     */
    static getAccessLevel(role: UserRole, resource: string): AccessLevel {
        const permissions = this.getPermissions(role);

        if (permissions.includes(`${resource}:delete:all` as Permission)) {
            return AccessLevel.FULL;
        } else if (permissions.includes(`${resource}:delete` as Permission) ||
            permissions.includes(`${resource}:delete:own` as Permission)) {
            return AccessLevel.DELETE;
        } else if (permissions.includes(`${resource}:update:all` as Permission) ||
            permissions.includes(`${resource}:update:own` as Permission)) {
            return AccessLevel.UPDATE;
        } else if (permissions.includes(`${resource}:create` as Permission)) {
            return AccessLevel.WRITE;
        } else if (permissions.includes(`${resource}:read:all` as Permission) ||
            permissions.includes(`${resource}:read:own` as Permission) ||
            permissions.includes(`${resource}:read` as Permission)) {
            return AccessLevel.READ;
        }

        return AccessLevel.NONE;
    }

    /**
     * Check if user is resource owner
     */
    static isResourceOwner(userId: string, resource: any): boolean {
        if (!resource) return false;

        // Check common owner fields
        return resource.userId?.toString() === userId ||
            resource.ownerId?.toString() === userId ||
            resource.createdBy?.toString() === userId ||
            resource._id?.toString() === userId;
    }

    /**
     * Validate permission request
     */
    static validatePermission(
        userRole: UserRole,
        permission: Permission,
        resourceOwnerId?: string,
        requesterId?: string
    ): IPermissionCheck {
        const hasPermission = this.hasPermission(userRole, permission);

        // Check if it's an "own" permission
        if (permission.endsWith(':own') && resourceOwnerId && requesterId) {
            if (resourceOwnerId !== requesterId && !this.hasPermission(userRole, permission.replace(':own', ':all') as Permission)) {
                return {
                    allowed: false,
                    reason: 'Not authorized: You can only access your own resources',
                    requiredPermission: permission,
                    userRole
                };
            }
        }

        return {
            allowed: hasPermission,
            reason: hasPermission ? undefined : 'Insufficient permissions',
            requiredPermission: permission,
            userRole,
            accessLevel: this.getAccessLevel(userRole, permission.split(':')[0])
        };
    }
}
