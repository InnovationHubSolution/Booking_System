# User & Audit Control System

## Overview
This system implements comprehensive audit tracking for accountability and dispute resolution in the Vanuatu Booking System. It tracks who created, modified, or deleted records, along with timestamps and IP addresses.

## Features

### 1. Audit Fields
Every model now includes the following audit fields:

#### Creation Tracking
- `createdBy` - User ID who created the record
- `createdAt` - Timestamp of creation
- `createdByName` - Cached user name for reporting
- `createdByRole` - User role at time of creation (customer/admin/host)
- `createdByIp` - IP address of creator

#### Update Tracking
- `updatedBy` - User ID who last updated the record
- `updatedAt` - Timestamp of last update
- `updatedByName` - Cached user name for reporting
- `updatedByRole` - User role at time of update
- `updatedByIp` - IP address of updater

#### Soft Delete Tracking
- `deletedBy` - User ID who deleted/deactivated the record
- `deletedAt` - Timestamp of deletion
- `deletedReason` - Reason for deletion
- `isDeleted` - Soft delete flag

### 2. Audit History
Complete change history is tracked in the `AuditHistory` collection:
- Record ID and type
- Action performed (create/update/delete/restore)
- User who performed the action
- Timestamp and IP address
- Detailed field-level changes (old value vs new value)
- Optional reason for changes

### 3. Automatic Tracking
The audit plugin automatically:
- Populates audit fields on create/update
- Creates audit history entries
- Tracks field-level changes
- Excludes soft-deleted records from queries

## Implementation

### Models Updated
All models now include audit fields:
- ✅ Booking
- ✅ Property
- ✅ User
- ✅ Review
- ✅ Flight
- ✅ CarRental
- ✅ Service
- ✅ Transfer
- ✅ TravelPackage
- ✅ Promotion
- ✅ Wishlist

### Files Created
1. **types/audit.ts** - Audit interfaces and types
2. **models/AuditHistory.ts** - Audit history model
3. **middleware/audit.ts** - Audit middleware and plugin

## Usage Examples

### 1. Creating a Record with Audit Context

```typescript
import { withAuditContext } from '../middleware/audit';

// In a route handler
router.post('/bookings', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const booking = new Booking({
            // ... booking data
        });
        
        // Attach audit context before saving
        if (req.auditContext) {
            withAuditContext(booking, req.auditContext);
        }
        
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});
```

### 2. Updating a Record

```typescript
router.put('/bookings/:id', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Update fields
        booking.status = req.body.status;
        booking.pricing.totalAmount = req.body.totalAmount;
        
        // Attach audit context
        if (req.auditContext) {
            withAuditContext(booking, req.auditContext);
        }
        
        await booking.save(); // Audit is automatically tracked
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking' });
    }
});
```

### 3. Soft Delete a Record

```typescript
router.delete('/properties/:id', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Soft delete with reason
        await property.softDelete(
            req.auditContext,
            req.body.reason || 'Deleted by owner'
        );
        
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});
```

### 4. Restore a Soft-Deleted Record

```typescript
router.post('/properties/:id/restore', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        // Include deleted records in the query
        const property = await Property.findById(req.params.id).setOptions({ includeDeleted: true });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        await property.restore(req.auditContext);
        res.json({ message: 'Property restored successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restore property' });
    }
});
```

### 5. Query Audit History

```typescript
import AuditHistory from '../models/AuditHistory';

// Get audit history for a specific booking
router.get('/bookings/:id/audit-history', authenticateUser, async (req, res) => {
    try {
        const history = await AuditHistory.find({
            recordId: req.params.id,
            recordType: 'Booking'
        })
        .populate('performedBy', 'firstName lastName email')
        .sort({ performedAt: -1 });
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit history' });
    }
});

// Get all changes made by a specific user
router.get('/audit/user/:userId', authenticateUser, async (req, res) => {
    try {
        const history = await AuditHistory.find({
            performedBy: req.params.userId
        })
        .sort({ performedAt: -1 })
        .limit(100);
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user audit history' });
    }
});

// Get all changes to bookings in the last 7 days
router.get('/audit/recent-bookings', authenticateUser, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const history = await AuditHistory.find({
            recordType: 'Booking',
            performedAt: { $gte: sevenDaysAgo }
        })
        .populate('performedBy', 'firstName lastName')
        .sort({ performedAt: -1 });
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent changes' });
    }
});
```

### 6. Manual Audit History Creation

```typescript
import { createAuditHistory } from '../middleware/audit';

// For complex operations that need explicit audit logging
router.post('/bookings/:id/payment', authenticateUser, async (req: RequestWithAudit, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        // Process payment...
        booking.payment.status = 'paid';
        booking.payment.paidAt = new Date();
        
        await booking.save();
        
        // Create custom audit entry
        if (req.auditContext) {
            await createAuditHistory(
                booking._id,
                'Booking',
                'update',
                req.auditContext,
                [
                    {
                        field: 'payment.status',
                        oldValue: 'pending',
                        newValue: 'paid'
                    }
                ],
                'Payment processed successfully'
            );
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Payment processing failed' });
    }
});
```

## Security & Best Practices

### 1. IP Address Collection
The system automatically captures IP addresses for audit purposes:
- Use `req.ip` or `req.socket.remoteAddress`
- Consider proxy headers if behind a reverse proxy

### 2. Data Retention
The `AuditHistory` model includes a TTL index (2 years by default):
- Automatically deletes old audit records
- Adjust `expireAfterSeconds` based on compliance requirements
- Remove the TTL index for permanent retention

### 3. Performance Considerations
- Audit fields are indexed for efficient querying
- Compound indexes optimize common audit queries
- Consider archiving old audit data to separate collection

### 4. GDPR & Privacy
- Audit history may contain personal data
- Implement data anonymization for deleted users
- Provide audit log export for data subject requests

### 5. Access Control
Restrict audit history access to authorized users:

```typescript
// Only admins can view audit history
const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.get('/audit/*', authenticateUser, isAdmin, ...);
```

## Dispute Resolution Benefits

### 1. Booking Disputes
- Track who created/modified bookings
- View complete payment history with timestamps
- See who approved refunds and why

### 2. Price Changes
- Track when prices were modified
- See old vs new pricing
- Identify who made the changes

### 3. Cancellation Disputes
- Track cancellation time and reason
- See who cancelled (customer vs admin)
- View refund processing history

### 4. Property Management
- Track property modifications
- See who deactivated listings
- Monitor pricing changes

### 5. User Account Changes
- Track role changes
- Monitor verification status changes
- See loyalty point adjustments

## Reporting Examples

### Generate Daily Activity Report

```typescript
router.get('/reports/daily-activity', authenticateUser, isAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activity = await AuditHistory.aggregate([
            {
                $match: {
                    performedAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: {
                        recordType: '$recordType',
                        action: '$action'
                    },
                    count: { $sum: 1 },
                    users: { $addToSet: '$performedByName' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});
```

## Testing

### Manual Testing

```bash
# Create a booking
curl -X POST http://localhost:5000/api/bookings \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"propertyId": "...", "checkInDate": "2025-01-15", ...}'

# View audit history
curl http://localhost:5000/api/bookings/BOOKING_ID/audit-history \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Soft delete
curl -X DELETE http://localhost:5000/api/properties/PROPERTY_ID \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"reason": "Owner request"}'
```

## Monitoring & Alerts

Set up alerts for suspicious activity:
- Multiple failed deletion attempts
- Unusual bulk updates
- Off-hours administrative changes
- Repeated payment refunds

## Future Enhancements

1. **Real-time Audit Streaming** - WebSocket notifications for audit events
2. **Advanced Analytics** - ML-based anomaly detection
3. **Compliance Reports** - Pre-built SOC 2, ISO 27001 audit reports
4. **Blockchain Integration** - Immutable audit trail
5. **Multi-factor Authentication** - For sensitive operations
6. **Audit Log Export** - CSV/PDF export functionality
7. **Change Approval Workflow** - Require approval for critical changes

## Support

For questions or issues with the audit system:
- Check the code documentation in `middleware/audit.ts`
- Review model implementations for examples
- Contact the development team for assistance
