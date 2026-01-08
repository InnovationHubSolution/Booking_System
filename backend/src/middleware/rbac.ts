import { Response, NextFunction } from 'express';
import { RequestWithAudit } from './audit';
import { RBACHelper, Permission, UserRole, AccessLevel } from '../types/rbac';

/**
 * Extended Request with user and RBAC context
 */
export interface RequestWithRBAC extends RequestWithAudit {
    userRole?: UserRole;
    permissions?: Permission[];
    accessLevel?: AccessLevel;
}

/**
 * Middleware to check if user has required permission
 * Usage: router.get('/bookings', requirePermission('booking:read:all'), handler)
 */
export const requirePermission = (permission: Permission) => {
    return (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userRole = user.role as UserRole;

            if (!RBACHelper.hasPermission(userRole, permission)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: permission,
                    userRole
                });
            }

            req.userRole = userRole;
            req.permissions = RBACHelper.getPermissions(userRole);
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed'
            });
        }
    };
};

/**
 * Middleware to check if user has ANY of the required permissions
 * Usage: router.get('/items', requireAnyPermission(['item:read', 'item:read:all']), handler)
 */
export const requireAnyPermission = (permissions: Permission[]) => {
    return (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userRole = user.role as UserRole;

            if (!RBACHelper.hasAnyPermission(userRole, permissions)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: `One of: ${permissions.join(', ')}`,
                    userRole
                });
            }

            req.userRole = userRole;
            req.permissions = RBACHelper.getPermissions(userRole);
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed'
            });
        }
    };
};

/**
 * Middleware to check if user has ALL of the required permissions
 * Usage: router.post('/admin', requireAllPermissions(['user:create', 'user:update']), handler)
 */
export const requireAllPermissions = (permissions: Permission[]) => {
    return (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userRole = user.role as UserRole;

            if (!RBACHelper.hasAllPermissions(userRole, permissions)) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: `All of: ${permissions.join(', ')}`,
                    userRole
                });
            }

            req.userRole = userRole;
            req.permissions = RBACHelper.getPermissions(userRole);
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed'
            });
        }
    };
};

/**
 * Middleware to check role
 * Usage: router.get('/admin', requireRole('admin'), handler)
 */
export const requireRole = (...roles: UserRole[]) => {
    return (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userRole = user.role as UserRole;

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    required: `Role must be one of: ${roles.join(', ')}`,
                    userRole
                });
            }

            req.userRole = userRole;
            req.permissions = RBACHelper.getPermissions(userRole);
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({
                success: false,
                error: 'Role check failed'
            });
        }
    };
};

/**
 * Middleware to check access level
 * Usage: router.put('/bookings/:id', requireAccessLevel('booking', AccessLevel.UPDATE), handler)
 */
export const requireAccessLevel = (resource: string, minLevel: AccessLevel) => {
    return (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userRole = user.role as UserRole;
            const accessLevel = RBACHelper.getAccessLevel(userRole, resource);

            if (accessLevel < minLevel) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient access level',
                    required: `Level ${minLevel} (${AccessLevel[minLevel]})`,
                    current: `Level ${accessLevel} (${AccessLevel[accessLevel]})`,
                    userRole
                });
            }

            req.userRole = userRole;
            req.accessLevel = accessLevel;
            req.permissions = RBACHelper.getPermissions(userRole);
            next();
        } catch (error) {
            console.error('Access level check error:', error);
            res.status(500).json({
                success: false,
                error: 'Access level check failed'
            });
        }
    };
};

/**
 * Middleware to check resource ownership
 * Verifies user can access their own resources
 */
export const checkResourceOwnership = (resourceGetter: (req: any) => Promise<any>) => {
    return async (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userRole = user.role as UserRole;
            const userId = user._id?.toString() || user.id?.toString();

            // Admins and managers can access any resource
            if (['admin', 'manager'].includes(userRole)) {
                return next();
            }

            // Get the resource
            const resource = await resourceGetter(req);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }

            // Check ownership
            const isOwner = RBACHelper.isResourceOwner(userId, resource);

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only access your own resources'
                });
            }

            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            res.status(500).json({
                success: false,
                error: 'Ownership check failed'
            });
        }
    };
};

/**
 * Middleware to log permission usage for auditing
 */
export const logPermissionUsage = (action: string) => {
    return (req: RequestWithRBAC, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (user) {
            console.log(`[RBAC] ${action} - User: ${user.email}, Role: ${user.role}, IP: ${req.ip}`);
        }

        next();
    };
};

/**
 * Helper to check permission in code (non-middleware)
 */
export const checkPermission = (userRole: UserRole, permission: Permission): boolean => {
    return RBACHelper.hasPermission(userRole, permission);
};

/**
 * Helper to get user permissions in code
 */
export const getUserPermissions = (userRole: UserRole): Permission[] => {
    return RBACHelper.getPermissions(userRole);
};
