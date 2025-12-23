# Booking/Reservation Details System

## Overview
The booking system now includes comprehensive reservation tracking with unique identifiers, status management, and source tracking.

---

## Core Booking Fields

### 1. **Reservation Number** (Unique)
- **Format**: `VU-YYYYMM-XXXXXX`
- **Example**: `VU-202512-001234`
- **Auto-generated**: Yes
- **Purpose**: Primary booking identifier for customers
- **Indexed**: Yes (for fast lookups)

```javascript
// Auto-generated in model:
reservationNumber: "VU-202512-458923"
```

### 2. **Booking Date & Time**
- **Field**: `bookingDate`
- **Type**: DateTime
- **Default**: Current timestamp
- **Purpose**: Records when the booking was created
- **Format**: ISO 8601

```javascript
bookingDate: "2025-12-23T14:30:00.000Z"
```

### 3. **Reservation Status**
- **Field**: `status`
- **Type**: Enum
- **Values**:
  - `pending` - Awaiting confirmation
  - `confirmed` - Booking confirmed
  - `cancelled` - Booking cancelled
  - `completed` - Service/stay completed
  - `no-show` - Customer didn't show up

```javascript
status: "confirmed"
```

### 4. **Booking Source**
- **Field**: `bookingSource`
- **Type**: Enum
- **Values**:
  - `online` - Website booking (default)
  - `counter` - Walk-in/front desk booking
  - `agent` - Through travel agent
  - `mobile-app` - Mobile application booking

```javascript
bookingSource: "online"
```

### 5. **Reference Number**
- **Format**: `REF-TIMESTAMP-RANDOM`
- **Example**: `REF-1735049823-7834`
- **Auto-generated**: Yes
- **Purpose**: Internal tracking and cross-referencing
- **Indexed**: Yes

```javascript
referenceNumber: "REF-1735049823-7834"
```

---

## API Usage

### Create a Booking

**Endpoint**: `POST /api/bookings/property`

**Request Body**:
```json
{
  "propertyId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "roomType": "Deluxe Suite",
  "checkInDate": "2025-12-25",
  "checkOutDate": "2025-12-30",
  "guestCount": {
    "adults": 2,
    "children": 1
  },
  "guestDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+678 5551234"
  },
  "bookingSource": "online",
  "specialRequests": "Late check-in requested"
}
```

**Response**:
```json
{
  "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
  "reservationNumber": "VU-202512-458923",
  "referenceNumber": "REF-1735049823-7834",
  "bookingDate": "2025-12-23T14:30:00.000Z",
  "status": "pending",
  "bookingSource": "online",
  "bookingType": "property",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "propertyId": {
    "name": "Paradise Resort",
    "address": { "city": "Port Vila" }
  },
  "roomType": "Deluxe Suite",
  "checkInDate": "2025-12-25T00:00:00.000Z",
  "checkOutDate": "2025-12-30T00:00:00.000Z",
  "nights": 5,
  "totalPrice": 140000,
  "paymentStatus": "pending",
  "guestCount": {
    "adults": 2,
    "children": 1
  },
  "guestDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+678 5551234"
  },
  "specialRequests": "Late check-in requested",
  "createdAt": "2025-12-23T14:30:00.000Z",
  "updatedAt": "2025-12-23T14:30:00.000Z"
}
```

### Get Booking by Reservation Number

**Endpoint**: `GET /api/bookings/reservation/:reservationNumber`

**Example**: `GET /api/bookings/reservation/VU-202512-458923`

### Get Booking by Reference Number

**Endpoint**: `GET /api/bookings/reference/:referenceNumber`

**Example**: `GET /api/bookings/reference/REF-1735049823-7834`

### Update Booking Status

**Endpoint**: `PATCH /api/bookings/:bookingId/status`

**Request Body**:
```json
{
  "status": "confirmed"
}
```

### Get Bookings by Source

**Endpoint**: `GET /api/bookings?source=online`

**Query Parameters**:
- `source` - Filter by booking source
- `status` - Filter by status
- `from` - Start date filter
- `to` - End date filter

---

## Frontend Implementation

### Viewing Booking Details

**Route**: `/booking/:bookingId`

**Features**:
- ✅ Displays reservation number prominently
- ✅ Shows booking source with icon
- ✅ Status badge with color coding
- ✅ Reference number for support
- ✅ Complete booking timeline
- ✅ Guest information
- ✅ Payment status
- ✅ Print confirmation option

**Usage**:
```javascript
// Navigate to booking details
navigate(`/booking/${bookingId}`);

// Or direct link
<a href={`/booking/${booking._id}`}>View Details</a>
```

### My Bookings Page

Shows reservation numbers on each booking card:
```jsx
<span className="bg-[#004D7A] text-white px-3 py-1 rounded-full text-sm font-semibold">
  {booking.reservationNumber}
</span>
```

---

## Database Queries

### Find Booking by Reservation Number
```javascript
const booking = await Booking.findOne({ 
  reservationNumber: 'VU-202512-458923' 
});
```

### Find Bookings by Source
```javascript
const onlineBookings = await Booking.find({ 
  bookingSource: 'online',
  status: 'confirmed'
});
```

### Get Today's Bookings
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todaysBookings = await Booking.find({
  bookingDate: {
    $gte: today,
    $lt: tomorrow
  }
});
```

### Count Bookings by Status
```javascript
const statusCounts = await Booking.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);
```

### Revenue by Booking Source
```javascript
const revenueBySource = await Booking.aggregate([
  {
    $match: { paymentStatus: 'paid' }
  },
  {
    $group: {
      _id: '$bookingSource',
      totalRevenue: { $sum: '$totalPrice' },
      bookingCount: { $sum: 1 }
    }
  }
]);
```

---

## Status Workflow

### Typical Booking Flow:

1. **pending** → Customer creates booking
2. **confirmed** → Payment received or admin confirms
3. **completed** → Service/stay finished
4. **cancelled** → Customer or admin cancels
5. **no-show** → Customer didn't arrive

### Status Transitions:
```
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
confirmed → no-show
```

---

## Benefits

✅ **Unique Tracking**: Each booking has 2 unique identifiers
✅ **Quick Lookup**: Fast search by reservation or reference number
✅ **Source Analytics**: Track which channels drive bookings
✅ **Status Management**: Clear booking lifecycle
✅ **Customer Service**: Easy reference for support queries
✅ **Reporting**: Analyze booking patterns by source/status
✅ **Audit Trail**: Complete booking history with timestamps

---

## Testing

### Create Test Booking:
```bash
curl -X POST http://localhost:5000/api/bookings/property \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "propertyId": "PROPERTY_ID",
    "roomType": "Standard Room",
    "checkInDate": "2025-12-25",
    "checkOutDate": "2025-12-27",
    "guestDetails": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "+678 5551234"
    },
    "bookingSource": "online"
  }'
```

### Search by Reservation Number:
```bash
curl http://localhost:5000/api/bookings/reservation/VU-202512-458923 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Admin Features

Admins can:
- View all bookings with filters
- Update booking status
- See booking source analytics
- Track no-shows
- Generate reports by source/status
- Manually set reference numbers

---

## Mobile App Integration

For future mobile app:
- Set `bookingSource: 'mobile-app'`
- Use reservation number for QR codes
- Reference number for offline sync
- Push notifications on status changes

---

## Support & Troubleshooting

**Customer can't find booking?**
- Search by reservation number (VU-XXXXXX-XXXXXX)
- Search by email address
- Search by reference number

**Duplicate bookings?**
- Check `createdAt` timestamp
- Compare reference numbers
- Verify guest email

**Wrong booking source?**
- Update via API: `PATCH /api/bookings/:id`
- Set correct `bookingSource` value

---

## Future Enhancements

- [ ] QR code generation from reservation number
- [ ] Email notifications with reservation details
- [ ] SMS confirmations with reference number
- [ ] Integration with external booking systems
- [ ] Real-time status updates (WebSocket)
- [ ] Booking modification history
- [ ] Multi-language reservation confirmations
