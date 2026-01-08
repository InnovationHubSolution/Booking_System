# User & Audit Control System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VANUATU BOOKING SYSTEM                              │
│                      User & Audit Control System                            │
└─────────────────────────────────────────────────────────────────────────────┘

                                    USER REQUEST
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS MIDDLEWARE CHAIN                          │
├────────────────────────────────────────────────────────────────────────────┤
│  1. cors()                                                                 │
│  2. express.json()                                                         │
│  3. auditContextMiddleware  ◄── Extracts user info from JWT               │
│     └─> Creates req.auditContext {                                         │
│           userId, userName, userRole, ipAddress, userAgent                 │
│         }                                                                   │
└─────────────────────────┬──────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           ROUTE HANDLERS                                   │
├────────────────────────────────────────────────────────────────────────────┤
│  POST /api/bookings                                                        │
│  └─> Create new booking                                                    │
│      1. const booking = new Booking(data)                                  │
│      2. withAuditContext(booking, req.auditContext) ◄── Attach context     │
│      3. await booking.save()  ────────┐                                    │
│                                       │                                     │
│  PUT /api/bookings/:id                │                                    │
│  └─> Update existing booking          │                                    │
│      1. booking.status = 'confirmed'  │                                    │
│      2. withAuditContext(booking, req.auditContext)                        │
│      3. await booking.save() ─────────┤                                    │
│                                       │                                     │
│  DELETE /api/bookings/:id             │                                    │
│  └─> Soft delete booking              │                                    │
│      await booking.softDelete(req.auditContext, reason) ──┐                │
└───────────────────────────────────────┼────────────────────┼───────────────┘
                                        │                    │
                                        ▼                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                      MONGOOSE AUDIT PLUGIN                                 │
├────────────────────────────────────────────────────────────────────────────┤
│  schema.pre('save', async function() {                                     │
│    const auditContext = this.$locals.auditContext                          │
│                                                                             │
│    if (this.isNew) {                                                       │
│      ┌─────────────────────────────────────┐                              │
│      │   POPULATE CREATION AUDIT FIELDS    │                              │
│      ├─────────────────────────────────────┤                              │
│      │ • createdBy = userId                │                              │
│      │ • createdAt = now()                 │                              │
│      │ • createdByName = userName          │                              │
│      │ • createdByRole = userRole          │                              │
│      │ • createdByIp = ipAddress           │                              │
│      └─────────────────────────────────────┘                              │
│                     │                                                       │
│                     ▼                                                       │
│      ┌─────────────────────────────────────┐                              │
│      │   CREATE AUDIT HISTORY RECORD       │                              │
│      ├─────────────────────────────────────┤                              │
│      │ recordId: booking._id               │                              │
│      │ recordType: 'Booking'               │                              │
│      │ action: 'create'                    │                              │
│      │ performedBy: userId                 │                              │
│      │ performedAt: now()                  │                              │
│      └─────────────────────────────────────┘                              │
│                                                                             │
│    } else if (this.isModified()) {                                         │
│      ┌─────────────────────────────────────┐                              │
│      │   POPULATE UPDATE AUDIT FIELDS      │                              │
│      ├─────────────────────────────────────┤                              │
│      │ • updatedBy = userId                │                              │
│      │ • updatedAt = now()                 │                              │
│      │ • updatedByName = userName          │                              │
│      │ • updatedByRole = userRole          │                              │
│      │ • updatedByIp = ipAddress           │                              │
│      └─────────────────────────────────────┘                              │
│                     │                                                       │
│                     ▼                                                       │
│      ┌─────────────────────────────────────┐                              │
│      │   TRACK FIELD-LEVEL CHANGES         │                              │
│      ├─────────────────────────────────────┤                              │
│      │ Compare old vs new values:          │                              │
│      │ • status: 'pending' → 'confirmed'   │                              │
│      │ • totalAmount: 15000 → 12000        │                              │
│      │ • payment.status: 'unpaid' → 'paid' │                              │
│      └─────────────────────────────────────┘                              │
│                     │                                                       │
│                     ▼                                                       │
│      ┌─────────────────────────────────────┐                              │
│      │   CREATE AUDIT HISTORY RECORD       │                              │
│      ├─────────────────────────────────────┤                              │
│      │ action: 'update'                    │                              │
│      │ changes: [                          │                              │
│      │   { field: 'status',                │                              │
│      │     oldValue: 'pending',            │                              │
│      │     newValue: 'confirmed' }         │                              │
│      │ ]                                   │                              │
│      └─────────────────────────────────────┘                              │
│    }                                                                        │
│  })                                                                         │
│                                                                             │
│  schema.methods.softDelete = async function(auditContext, reason) {        │
│    ┌──────────────────────────────────────┐                               │
│    │   POPULATE DELETE AUDIT FIELDS       │                               │
│    ├──────────────────────────────────────┤                               │
│    │ • isDeleted = true                   │                               │
│    │ • deletedBy = userId                 │                               │
│    │ • deletedAt = now()                  │                               │
│    │ • deletedReason = reason             │                               │
│    └──────────────────────────────────────┘                               │
│                     │                                                       │
│                     ▼                                                       │
│    ┌──────────────────────────────────────┐                               │
│    │   CREATE AUDIT HISTORY RECORD        │                               │
│    │   action: 'delete'                   │                               │
│    │   reason: 'Customer request'         │                               │
│    └──────────────────────────────────────┘                               │
│  }                                                                          │
│                                                                             │
│  schema.pre(/^find/, function() {                                          │
│    // Exclude soft-deleted records by default                             │
│    if (!this.getOptions().includeDeleted) {                                │
│      this.where({ isDeleted: { $ne: true } })                             │
│    }                                                                        │
│  })                                                                         │
└─────────────────────────┬──────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         MONGODB DATABASE                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐    │
│  │  BOOKING COLLECTION                                               │    │
│  ├───────────────────────────────────────────────────────────────────┤    │
│  │  {                                                                 │    │
│  │    _id: "674d8f9a...",                                            │    │
│  │    reservationNumber: "VU-2025-001234",                           │    │
│  │    status: "confirmed",                                           │    │
│  │    pricing: { totalAmount: 12000 },                               │    │
│  │    payment: { status: "paid" },                                   │    │
│  │                                                                    │    │
│  │    // ✅ AUDIT FIELDS                                              │    │
│  │    createdBy: ObjectId("user123"),                                │    │
│  │    createdAt: ISODate("2025-12-26T10:00:00Z"),                    │    │
│  │    createdByName: "John Customer",                                │    │
│  │    createdByRole: "customer",                                     │    │
│  │    createdByIp: "192.168.1.100",                                  │    │
│  │                                                                    │    │
│  │    updatedBy: ObjectId("admin456"),                               │    │
│  │    updatedAt: ISODate("2025-12-26T14:30:00Z"),                    │    │
│  │    updatedByName: "Admin Smith",                                  │    │
│  │    updatedByRole: "admin",                                        │    │
│  │    updatedByIp: "192.168.1.50",                                   │    │
│  │                                                                    │    │
│  │    isDeleted: false                                               │    │
│  │  }                                                                 │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐    │
│  │  AUDITHISTORY COLLECTION                                          │    │
│  ├───────────────────────────────────────────────────────────────────┤    │
│  │  [                                                                 │    │
│  │    {                                                               │    │
│  │      recordId: "674d8f9a...",                                     │    │
│  │      recordType: "Booking",                                       │    │
│  │      action: "create",                                            │    │
│  │      performedBy: ObjectId("user123"),                            │    │
│  │      performedByName: "John Customer",                            │    │
│  │      performedByRole: "customer",                                 │    │
│  │      performedAt: ISODate("2025-12-26T10:00:00Z"),                │    │
│  │      ipAddress: "192.168.1.100"                                   │    │
│  │    },                                                              │    │
│  │    {                                                               │    │
│  │      recordId: "674d8f9a...",                                     │    │
│  │      recordType: "Booking",                                       │    │
│  │      action: "update",                                            │    │
│  │      performedBy: ObjectId("admin456"),                           │    │
│  │      performedByName: "Admin Smith",                              │    │
│  │      performedByRole: "admin",                                    │    │
│  │      performedAt: ISODate("2025-12-26T14:30:00Z"),                │    │
│  │      ipAddress: "192.168.1.50",                                   │    │
│  │      changes: [                                                    │    │
│  │        {                                                           │    │
│  │          field: "status",                                         │    │
│  │          oldValue: "pending",                                     │    │
│  │          newValue: "confirmed"                                    │    │
│  │        },                                                          │    │
│  │        {                                                           │    │
│  │          field: "pricing.totalAmount",                            │    │
│  │          oldValue: 15000,                                         │    │
│  │          newValue: 12000                                          │    │
│  │        }                                                           │    │
│  │      ],                                                            │    │
│  │      reason: "Applied VIP discount"                               │    │
│  │    }                                                               │    │
│  │  ]                                                                 │    │
│  └───────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────┐
│                          AUDIT API ENDPOINTS                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GET /api/audit/Booking/674d8f9a...                                        │
│  └─> Returns complete change history for the booking                       │
│                                                                             │
│  GET /api/audit/user/USER_ID                                               │
│  └─> Returns all actions performed by the user                             │
│                                                                             │
│  GET /api/audit/recent?hours=24                                            │
│  └─> Returns recent activity (admin only)                                  │
│                                                                             │
│  GET /api/audit/stats?days=7                                               │
│  └─> Returns statistics and analytics                                      │
│                                                                             │
│  POST /api/audit/search                                                    │
│  └─> Advanced search with filters                                          │
│                                                                             │
│  GET /api/audit/export                                                     │
│  └─> Export audit data to CSV                                              │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────┐
│                         KEY BENEFITS                                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ ACCOUNTABILITY        Track who made every change                      │
│  ✅ DISPUTE RESOLUTION    Complete history for resolving conflicts         │
│  ✅ COMPLIANCE            Meet audit and regulatory requirements           │
│  ✅ SECURITY              IP tracking for suspicious activity monitoring   │
│  ✅ DATA RECOVERY         Soft delete allows restoration                   │
│  ✅ ANALYTICS             Business intelligence from change patterns       │
│  ✅ AUTOMATIC             No manual tracking required                      │
│  ✅ PERFORMANCE           Indexed and optimized for speed                  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Flow Summary

1. **Request arrives** → User authenticated
2. **Audit context extracted** → User info captured (ID, name, role, IP)
3. **Route handler executes** → Business logic runs
4. **Audit context attached** → `withAuditContext(doc, req.auditContext)`
5. **Document saved** → Triggers mongoose pre-save hook
6. **Audit plugin runs** → Populates audit fields automatically
7. **Change tracking** → Compares old vs new values
8. **Audit history created** → Complete log stored in database
9. **Response sent** → User receives result
10. **Audit trail complete** → Full accountability achieved

## Data Flow

```
User Action → Authentication → Audit Context → Route Handler →
Document Creation/Update → Audit Plugin → Database Save →
Audit History Creation → Complete Audit Trail
```

## Models with Audit Tracking

All 11 models track:
- Booking, Property, User, Review
- Flight, CarRental, Service, Transfer
- TravelPackage, Promotion, Wishlist

Each model tracks relevant fields for its domain.
