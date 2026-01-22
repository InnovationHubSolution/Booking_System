import express, { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

// In-memory notification store (in production, use a database model)
interface Notification {
    id: string;
    userId: string;
    type: 'booking' | 'payment' | 'promotion' | 'system';
    title: string;
    message: string;
    read: boolean;
    data?: any;
    createdAt: Date;
}

// Temporary in-memory store
const notifications: Notification[] = [];

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id.toString();
        const { unreadOnly = 'false', limit = 50 } = req.query;

        let userNotifications = notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (unreadOnly === 'true') {
            userNotifications = userNotifications.filter(n => !n.read);
        }

        userNotifications = userNotifications.slice(0, parseInt(limit as string));

        const unreadCount = notifications.filter(n => n.userId === userId && !n.read).length;

        res.json({
            success: true,
            count: userNotifications.length,
            unreadCount,
            data: userNotifications
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications',
            message: error.message
        });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id.toString();
        const { id } = req.params;

        const notification = notifications.find(n => n.id === id && n.userId === userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        notification.read = true;

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read',
            message: error.message
        });
    }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id.toString();

        const userNotifications = notifications.filter(n => n.userId === userId && !n.read);
        userNotifications.forEach(n => n.read = true);

        res.json({
            success: true,
            message: `Marked ${userNotifications.length} notifications as read`
        });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notifications as read',
            message: error.message
        });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id.toString();
        const { id } = req.params;

        const index = notifications.findIndex(n => n.id === id && n.userId === userId);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        notifications.splice(index, 1);

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification',
            message: error.message
        });
    }
});

/**
 * DELETE /api/notifications
 * Delete all notifications
 */
router.delete('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)._id.toString();

        const initialCount = notifications.length;
        const filtered = notifications.filter(n => n.userId !== userId);
        const deletedCount = initialCount - filtered.length;

        notifications.length = 0;
        notifications.push(...filtered);

        res.json({
            success: true,
            message: `Deleted ${deletedCount} notifications`
        });
    } catch (error: any) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notifications',
            message: error.message
        });
    }
});

/**
 * Helper function to create a notification (used internally)
 */
export const createNotification = (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
): void => {
    const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        title,
        message,
        read: false,
        data,
        createdAt: new Date()
    };

    notifications.push(notification);

    // Clean up old notifications (keep only last 100 per user)
    const userNotifs = notifications.filter(n => n.userId === userId);
    if (userNotifs.length > 100) {
        const toRemove = userNotifs
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .slice(0, userNotifs.length - 100);

        toRemove.forEach(notif => {
            const index = notifications.findIndex(n => n.id === notif.id);
            if (index > -1) notifications.splice(index, 1);
        });
    }
};

export default router;
