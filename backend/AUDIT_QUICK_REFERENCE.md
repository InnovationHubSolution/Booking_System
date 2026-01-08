# User & Audit Control - Quick Reference

## 🎯 At a Glance

**Status:** ✅ FULLY IMPLEMENTED & READY TO USE

**What it does:**
- Tracks WHO created/modified/deleted records
- Tracks WHEN changes happened
- Tracks WHAT changed (old value → new value)
- Tracks WHY changes were made (optional reason)
- Tracks WHERE (IP address for security)

---

## 📁 Files Created/Modified

### Created Files:
```
backend/src/
├── types/audit.ts                           # Audit interfaces
├── models/AuditHistory.ts                   # Change history database
├── middleware/audit.ts                      # Audit automation
├── routes/audit.ts                          # Audit query endpoints
├── routes/bookings-with-audit-example.ts    # Usage examples
├── AUDIT_SYSTEM_GUIDE.md                    # Full documentation
└── AUDIT_IMPLEMENTATION_SUMMARY.md          # Implementation summary
```

### Modified Files:
```
backend/src/
├── server.ts                      # Added audit middleware
└── models/
    ├── Booking.ts                 # ✅ Audit enabled
    ├── Property.ts                # ✅ Audit enabled
    ├── User.ts                    # ✅ Audit enabled
    ├── Review.ts                  # ✅ Audit enabled
    ├── Flight.ts                  # ✅ Audit enabled
    ├── CarRental.ts               # ✅ Audit enabled
    ├── Service.ts                 # ✅ Audit enabled
    ├── Transfer.ts                # ✅ Audit enabled
    ├── TravelPackage.ts           # ✅ Audit enabled
    ├── Promotion.ts               # ✅ Audit enabled
    └── Wishlist.ts                # ✅ Audit enabled
```

---

## 🚀 Quick Start

### 1. Using Audit in Your Routes

```typescript
import { RequestWithAudit, withAuditContext } from '../middleware/audit';

router.post('/bookings', authenticateUser, async (req: RequestWithAudit, res) => {
    const booking = new Booking(req.body);
    
    // ✅ Add this line before saving
    if (req.auditContext) {
        withAuditContext(booking, req.auditContext);
    }
    
    await booking.save(); // Audit is automatic!
    res.json(booking);
});
```

### 2. Soft Delete with Reason

```typescript
await (booking as any).softDelete(
    req.auditContext,
    'Customer request'
);
```

### 3. Restore Deleted Record

```typescript
const booking = await Booking.findById(id)
    .setOptions({ includeDeleted: true });
    
await (booking as any).restore(req.auditContext);
```

### 4. View Change History

```typescript
GET /api/audit/Booking/BOOKING_ID
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 API Endpoints

### Audit Query Endpoints
```
GET  /api/audit/:recordType/:recordId    # History for specific record
GET  /api/audit/user/:userId             # User's activity
GET  /api/audit/recent?hours=24          # Recent activity
GET  /api/audit/stats?days=7             # Statistics
POST /api/audit/search                   # Advanced search
GET  /api/audit/export                   # Export to CSV
```

### Example Requests

**Get booking history:**
```bash
curl http://localhost:5000/api/audit/Booking/674d8f9a5e8b3c001f123456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get recent changes:**
```bash
curl http://localhost:5000/api/audit/recent?hours=24 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Export audit data:**
```bash
curl http://localhost:5000/api/audit/export?startDate=2025-01-01 \
  -H "Authorization: Bearer YOUR_TOKEN" > audit.csv
```

---

## 🎨 What Each Field Tracks

### Every Record Now Has:

**Creation:**
- `createdBy` - User ObjectId
- `createdAt` - Timestamp
- `createdByName` - "John Doe"
- `createdByRole` - "admin" | "customer" | "host"
- `createdByIp` - "192.168.1.1"

**Updates:**
- `updatedBy` - User ObjectId
- `updatedAt` - Timestamp
- `updatedByName` - "Jane Admin"
- `updatedByRole` - "admin"
- `updatedByIp` - "192.168.1.2"

**Soft Delete:**
- `isDeleted` - true/false
- `deletedBy` - User ObjectId
- `deletedAt` - Timestamp
- `deletedReason` - "Owner request"

---

## 💡 Common Use Cases

### 1. Dispute Resolution
```typescript
// "Who changed my booking price?"
GET /api/audit/Booking/BOOKING_ID

Response shows:
- Changed by: "Admin Smith"
- Date: 2025-12-26 14:30:00
- Field: pricing.totalAmount
- Old value: 15000
- New value: 12000
- Reason: "Applied VIP discount"
```

### 2. Security Monitoring
```typescript
// "Show all admin actions today"
GET /api/audit/recent?hours=24

// Filter for admins
const adminActions = response.data.filter(
    record => record.performedByRole === 'admin'
);
```

### 3. User Activity Tracking
```typescript
// "What did this user change this week?"
GET /api/audit/user/USER_ID
```

### 4. Data Recovery
```typescript
// View what was deleted
const booking = await Booking.findById(id)
    .setOptions({ includeDeleted: true });
    
// Restore it
await (booking as any).restore(req.auditContext);
```

---

## ⚠️ Important Notes

### Authentication Required
All audit endpoints require authentication:
```typescript
router.get('/audit/*', authenticateUser, ...);
```

### Access Control
- **Admins** - Can view all audit history
- **Users** - Can view their own activity
- **Record Owners** - Can view changes to their records

### Performance
- All audit fields are indexed
- Queries are optimized with compound indexes
- Background audit logging (non-blocking)

### Data Retention
- Default: 2 years (automatic deletion)
- Configurable in `AuditHistory.ts`
- Remove TTL index for permanent retention

---

## 🔧 Customization

### Track Different Fields
Edit model files to specify which fields to track:

```typescript
BookingSchema.plugin(auditPlugin, {
    fieldsToTrack: [
        'status',
        'pricing.totalAmount',
        'payment.status',
        // Add your fields here
    ]
});
```

### Change Retention Period
In `models/AuditHistory.ts`:

```typescript
// Change from 2 years (63072000) to 1 year (31536000)
AuditHistorySchema.index(
    { performedAt: 1 }, 
    { expireAfterSeconds: 31536000 }
);
```

### Disable Soft Delete Filter
To include deleted records in queries:

```typescript
const allBookings = await Booking.find()
    .setOptions({ includeDeleted: true });
```

---

## 📖 Documentation Files

- **AUDIT_SYSTEM_GUIDE.md** - Complete guide with examples
- **AUDIT_IMPLEMENTATION_SUMMARY.md** - What was implemented
- **THIS FILE** - Quick reference

---

## ✅ Testing Checklist

- [ ] Create a booking → Check `createdBy`, `createdAt`
- [ ] Update booking status → Check audit history
- [ ] Delete booking → Verify soft delete
- [ ] Restore booking → Verify restoration
- [ ] View audit history → Check all fields
- [ ] Export audit data → Check CSV format
- [ ] Test access control → Non-admins restricted

---

## 🚨 Troubleshooting

**Audit fields not populated?**
- Ensure `auditContextMiddleware` is in `server.ts`
- Check `withAuditContext()` is called before save

**Can't see deleted records?**
- Use `.setOptions({ includeDeleted: true })`

**Audit history not created?**
- Check `auditContext` is available in request
- Verify user is authenticated

**TypeScript errors?**
- Cast to `any` for softDelete/restore: `(doc as any).softDelete()`

---

## 📞 Need Help?

Check these files for detailed information:
1. **AUDIT_SYSTEM_GUIDE.md** - Comprehensive documentation
2. **routes/bookings-with-audit-example.ts** - Working examples
3. **middleware/audit.ts** - Technical implementation

---

## 🎉 You're All Set!

The audit system is:
✅ Installed and configured  
✅ Integrated with all models  
✅ Ready to use immediately  
✅ Fully documented  

Just restart your server and start tracking changes! 🚀
