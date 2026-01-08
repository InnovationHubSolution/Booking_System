import express, { Router } from 'express';
import { auth as authenticateUser } from '../middleware/auth';
import { RequestWithAudit, withAuditContext } from '../middleware/audit';
import AuditHistory from '../models/AuditHistory';
import Booking from '../models/Booking';

const router: Router = express.Router();

/**
 * Get audit history for a specific record
 * GET /api/audit/:recordType/:recordId
 */
router.get('/:recordType/:recordId', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const { recordType, recordId } = req.params;
        const { limit = '50', skip = '0' } = req.query;

        // Only admins or record owners can view audit history
        const isAdmin = (req as any).user?.role === 'admin';

        const history = await AuditHistory.find({
            recordId,
            recordType
        })
            .populate('performedBy', 'firstName lastName email role')
            .sort({ performedAt: -1 })
            .limit(parseInt(limit as string))
            .skip(parseInt(skip as string));

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error fetching audit history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit history'
        });
    }
});

/**
 * Get audit history for a specific user
 * GET /api/audit/user/:userId
 */
router.get('/user/:userId', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const { userId } = req.params;
        const { limit = '100', skip = '0', action, recordType } = req.query;

        // Only admins or the user themselves can view their audit history
        const isAdmin = (req as any).user?.role === 'admin';
        const isSelf = (req as any).user?._id?.toString() === userId;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const query: any = { performedBy: userId };
        if (action) query.action = action;
        if (recordType) query.recordType = recordType;

        const history = await AuditHistory.find(query)
            .sort({ performedAt: -1 })
            .limit(parseInt(limit as string))
            .skip(parseInt(skip as string));

        // Group by record type
        const groupedByType = history.reduce((acc: any, record) => {
            if (!acc[record.recordType]) {
                acc[record.recordType] = [];
            }
            acc[record.recordType].push(record);
            return acc;
        }, {});

        res.json({
            success: true,
            totalRecords: history.length,
            groupedByType,
            data: history
        });
    } catch (error) {
        console.error('Error fetching user audit history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user audit history'
        });
    }
});

/**
 * Get recent audit activity (last 24 hours)
 * GET /api/audit/recent
 */
router.get('/recent', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Only admins can view recent activity
        if ((req as any).user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const { hours = '24' } = req.query;
        const hoursAgo = new Date();
        hoursAgo.setHours(hoursAgo.getHours() - parseInt(hours as string));

        const history = await AuditHistory.find({
            performedAt: { $gte: hoursAgo }
        })
            .populate('performedBy', 'firstName lastName email role')
            .sort({ performedAt: -1 })
            .limit(200);

        // Statistics
        const stats = {
            totalActions: history.length,
            actionTypes: history.reduce((acc: any, record) => {
                acc[record.action] = (acc[record.action] || 0) + 1;
                return acc;
            }, {}),
            recordTypes: history.reduce((acc: any, record) => {
                acc[record.recordType] = (acc[record.recordType] || 0) + 1;
                return acc;
            }, {}),
            uniqueUsers: [...new Set(history.map(r => r.performedByName))].length
        };

        res.json({
            success: true,
            timeRange: { from: hoursAgo, to: new Date() },
            stats,
            data: history
        });
    } catch (error) {
        console.error('Error fetching recent audit activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent audit activity'
        });
    }
});

/**
 * Get audit statistics
 * GET /api/audit/stats
 */
router.get('/stats', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Only admins can view stats
        if ((req as any).user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const { days = '7' } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

        const stats = await AuditHistory.aggregate([
            {
                $match: {
                    performedAt: { $gte: daysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$performedAt' } },
                        action: '$action',
                        recordType: '$recordType'
                    },
                    count: { $sum: 1 },
                    users: { $addToSet: '$performedByName' }
                }
            },
            {
                $sort: { '_id.date': -1 }
            }
        ]);

        // Top active users
        const topUsers = await AuditHistory.aggregate([
            {
                $match: {
                    performedAt: { $gte: daysAgo }
                }
            },
            {
                $group: {
                    _id: '$performedByName',
                    count: { $sum: 1 },
                    actions: { $addToSet: '$action' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            success: true,
            timeRange: { from: daysAgo, to: new Date() },
            dailyStats: stats,
            topUsers
        });
    } catch (error) {
        console.error('Error fetching audit statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit statistics'
        });
    }
});

/**
 * Search audit history
 * POST /api/audit/search
 */
router.post('/search', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Only admins can search audit history
        if ((req as any).user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const {
            recordType,
            action,
            performedBy,
            startDate,
            endDate,
            searchField,
            searchValue,
            limit = 100,
            skip = 0
        } = req.body;

        const query: any = {};

        if (recordType) query.recordType = recordType;
        if (action) query.action = action;
        if (performedBy) query.performedBy = performedBy;
        if (startDate || endDate) {
            query.performedAt = {};
            if (startDate) query.performedAt.$gte = new Date(startDate);
            if (endDate) query.performedAt.$lte = new Date(endDate);
        }
        if (searchField && searchValue) {
            query[`changes.field`] = searchField;
        }

        const history = await AuditHistory.find(query)
            .populate('performedBy', 'firstName lastName email role')
            .sort({ performedAt: -1 })
            .limit(limit)
            .skip(skip);

        const totalCount = await AuditHistory.countDocuments(query);

        res.json({
            success: true,
            totalCount,
            page: Math.floor(skip / limit) + 1,
            totalPages: Math.ceil(totalCount / limit),
            data: history
        });
    } catch (error) {
        console.error('Error searching audit history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search audit history'
        });
    }
});

/**
 * Export audit history to CSV
 * GET /api/audit/export
 */
router.get('/export', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Only admins can export audit data
        if ((req as any).user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const { recordType, startDate, endDate } = req.query;

        const query: any = {};
        if (recordType) query.recordType = recordType;
        if (startDate || endDate) {
            query.performedAt = {};
            if (startDate) query.performedAt.$gte = new Date(startDate as string);
            if (endDate) query.performedAt.$lte = new Date(endDate as string);
        }

        const history = await AuditHistory.find(query)
            .populate('performedBy', 'firstName lastName email')
            .sort({ performedAt: -1 })
            .limit(10000); // Limit for performance

        // Convert to CSV
        const csv = [
            'Date,Time,Record Type,Record ID,Action,Performed By,Role,IP Address,Changes',
            ...history.map(record => {
                const date = new Date(record.performedAt);
                const changes = record.changes?.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ') || '';
                return [
                    date.toLocaleDateString(),
                    date.toLocaleTimeString(),
                    record.recordType,
                    record.recordId,
                    record.action,
                    record.performedByName,
                    record.performedByRole,
                    record.ipAddress || '',
                    `"${changes}"`
                ].join(',');
            })
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-history-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting audit history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export audit history'
        });
    }
});

export default router;
