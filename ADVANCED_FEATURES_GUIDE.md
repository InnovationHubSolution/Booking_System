# Advanced Booking Features

## Overview
Powerful advanced features including check-in/check-out management, QR codes, barcodes, digital signatures, terms acceptance, and real-time geolocation tracking.

---

## Features Included

### 1. ✅ Check-in Status
- Track customer arrival and check-in
- Late arrival detection
- Staff assignment tracking
- Location-based check-in

### 2. ✅ Check-out Status
- Track customer departure
- Late checkout detection
- Damage reporting
- Extended stay management

### 3. 📱 QR Code & Barcode
- Auto-generated QR codes
- Barcode scanning support
- Quick booking verification
- Contactless check-in

### 4. 📝 Terms & Conditions
- Digital acceptance tracking
- Version control
- IP address logging
- Timestamp recording

### 5. ✍️ Customer Signature
- Digital signature capture
- Base64 image storage
- Device tracking
- Legal documentation

### 6. 📍 Geolocation
- Pickup/dropoff tracking
- Real-time vehicle tracking
- Route history
- Speed and heading data

---

## Data Structure

### Check-in Object
```typescript
checkIn: {
  status: 'not-checked-in' | 'checked-in' | 'late' | 'no-show';
  checkedInAt: Date;
  checkedInBy: ObjectId;  // Staff member
  actualArrivalTime: Date;
  notes: string;
  location: {
    type: 'Point';
    coordinates: [longitude, latitude];
  };
}
```

### Check-out Object
```typescript
checkOut: {
  status: 'not-checked-out' | 'checked-out' | 'late-checkout' | 'extended';
  checkedOutAt: Date;
  checkedOutBy: ObjectId;  // Staff member
  actualDepartureTime: Date;
  notes: string;
  damageReported: boolean;
  damageDescription: string;
  location: {
    type: 'Point';
    coordinates: [longitude, latitude];
  };
}
```

### QR Code & Barcode
```typescript
qrCode: string;  // "VU-BOOKING:VU-202512-458923:property:1703345678901"
barcode: string; // "VU202512458923" (no dashes)
```

### Terms & Conditions
```typescript
termsAndConditions: {
  accepted: boolean;
  acceptedAt: Date;
  version: string;  // "v1.0", "v2.0"
  ipAddress: string;
}
```

### Customer Signature
```typescript
customerSignature: {
  signatureData: string;  // Base64 encoded image
  signedAt: Date;
  deviceInfo: string;
  ipAddress: string;
}
```

### Geolocation
```typescript
geolocation: {
  pickup: {
    type: 'Point';
    coordinates: [longitude, latitude];
    address: string;
    timestamp: Date;
  };
  dropoff: {
    type: 'Point';
    coordinates: [longitude, latitude];
    address: string;
    timestamp: Date;
  };
  tracking: [{
    type: 'Point';
    coordinates: [longitude, latitude];
    timestamp: Date;
    speed: number;    // km/h
    heading: number;  // degrees (0-360)
  }];
}
```

---

## API Endpoints

### 1. Check-in

**POST `/api/advanced/check-in`**

Process customer check-in with automatic late detection.

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "actualArrivalTime": "2025-12-25T14:30:00Z",
  "notes": "Early arrival, upgraded to deluxe suite",
  "location": {
    "latitude": -17.7334,
    "longitude": 168.3273
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check-in successful",
  "checkInTime": "2025-12-25T14:30:00.000Z",
  "status": "on-time",
  "booking": {
    "checkIn": {
      "status": "checked-in",
      "checkedInAt": "2025-12-25T14:30:00.000Z",
      "actualArrivalTime": "2025-12-25T14:30:00.000Z",
      "notes": "Early arrival, upgraded to deluxe suite"
    },
    "resourceAllocation": {
      "availabilityStatus": "occupied"
    }
  }
}
```

**Late Arrival**:
If customer arrives >1 hour after scheduled check-in:
```json
{
  "message": "Check-in successful (Late arrival noted)",
  "status": "late",
  "booking": {
    "checkIn": {
      "status": "late"
    }
  }
}
```

---

### 2. Check-out

**POST `/api/advanced/check-out`**

Process customer check-out with damage reporting.

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "actualDepartureTime": "2025-12-28T10:00:00Z",
  "notes": "Clean checkout, excellent guest",
  "damageReported": false,
  "location": {
    "latitude": -17.7334,
    "longitude": 168.3273
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check-out successful",
  "checkOutTime": "2025-12-28T10:00:00.000Z",
  "status": "on-time",
  "damageReported": false,
  "booking": {
    "status": "completed",
    "checkOut": {
      "status": "checked-out",
      "checkedOutAt": "2025-12-28T10:00:00.000Z"
    },
    "resourceAllocation": {
      "availabilityStatus": "available"
    }
  }
}
```

**With Damage**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "damageReported": true,
  "damageDescription": "Broken mirror in bathroom"
}
```

Response:
```json
{
  "message": "Check-out successful - Damage reported",
  "damageReported": true
}
```

---

### 3. Save Signature

**POST `/api/advanced/signature`**

Save customer's digital signature.

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "deviceInfo": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Signature saved successfully",
  "signedAt": "2025-12-23T15:30:00.000Z"
}
```

**Frontend Implementation**:
```javascript
// Using signature-pad library
import SignaturePad from 'signature-pad';

const canvas = document.getElementById('signature-canvas');
const signaturePad = new SignaturePad(canvas);

// Save signature
const signatureData = signaturePad.toDataURL(); // Base64
await fetch('/api/advanced/signature', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    bookingId: booking._id,
    signatureData: signatureData,
    deviceInfo: navigator.userAgent
  })
});
```

---

### 4. Accept Terms

**POST `/api/advanced/accept-terms`**

Record acceptance of terms and conditions.

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "version": "v2.0"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Terms and conditions accepted",
  "acceptedAt": "2025-12-23T15:00:00.000Z",
  "version": "v2.0"
}
```

**Frontend Implementation**:
```jsx
<div className="terms-acceptance">
  <input
    type="checkbox"
    checked={termsAccepted}
    onChange={(e) => {
      if (e.target.checked) {
        acceptTerms();
      }
    }}
  />
  <label>
    I accept the <a href="/terms">Terms and Conditions</a> (v2.0)
  </label>
</div>
```

---

### 5. Update Pickup Location

**POST `/api/advanced/location/pickup`**

Set pickup location for transfers/rentals.

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "latitude": -17.7334,
  "longitude": 168.3273,
  "address": "Port Vila International Airport"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pickup location updated",
  "location": {
    "latitude": -17.7334,
    "longitude": 168.3273,
    "address": "Port Vila International Airport"
  }
}
```

---

### 6. Update Dropoff Location

**POST `/api/advanced/location/dropoff`**

Set dropoff location for transfers/rentals.

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "latitude": -17.7434,
  "longitude": 168.3173,
  "address": "The Havannah Vanuatu Resort"
}
```

---

### 7. Add Tracking Point

**POST `/api/advanced/location/track`**

Add real-time GPS tracking point (for active transfers/rentals).

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "latitude": -17.7384,
  "longitude": 168.3223,
  "speed": 45.5,
  "heading": 135
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tracking point added",
  "totalPoints": 24
}
```

**Real-time Tracking Implementation**:
```javascript
// Send location every 30 seconds
navigator.geolocation.watchPosition(
  async (position) => {
    await fetch('/api/advanced/location/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId: activeBooking._id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed * 3.6, // Convert m/s to km/h
        heading: position.coords.heading
      })
    });
  },
  null,
  { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
);
```

---

### 8. Get Booking by QR Code

**GET `/api/advanced/qr/:qrCode`**

Retrieve booking details by scanning QR code.

**Example**:
```
GET /api/advanced/qr/VU-BOOKING:VU-202512-458923:property:1703345678901
```

**Response**:
```json
{
  "success": true,
  "booking": {
    "reservationNumber": "VU-202512-458923",
    "bookingType": "property",
    "checkIn": {
      "status": "not-checked-in"
    },
    "payment": {
      "status": "paid"
    },
    "userId": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**QR Code Display**:
```jsx
import QRCode from 'qrcode.react';

<QRCode
  value={booking.qrCode}
  size={256}
  level="H"
  includeMargin={true}
/>
```

---

### 9. Get Booking by Barcode

**GET `/api/advanced/barcode/:barcode`**

Retrieve booking by barcode scan.

**Example**:
```
GET /api/advanced/barcode/VU202512458923
```

**Barcode Display**:
```jsx
import Barcode from 'react-barcode';

<Barcode
  value={booking.barcode}
  format="CODE128"
  width={2}
  height={50}
/>
```

---

### 10. Check-in Statistics

**GET `/api/advanced/check-in/stats`**

Get check-in statistics for reporting.

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

**Example**:
```
GET /api/advanced/check-in/stats?startDate=2025-12-01&endDate=2025-12-31
```

**Response**:
```json
{
  "success": true,
  "period": {
    "startDate": "2025-12-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z"
  },
  "stats": [
    {
      "_id": "checked-in",
      "count": 145,
      "bookings": ["VU-202512-458923", "VU-202512-458924", ...]
    },
    {
      "_id": "late",
      "count": 12,
      "bookings": ["VU-202512-458925", ...]
    },
    {
      "_id": "no-show",
      "count": 3,
      "bookings": ["VU-202512-458926", ...]
    }
  ]
}
```

---

### 11. Active Tracking

**GET `/api/advanced/tracking/active`**

Get all bookings with active real-time tracking.

**Response**:
```json
{
  "success": true,
  "count": 5,
  "bookings": [
    {
      "reservationNumber": "VU-202512-458923",
      "bookingType": "transfer",
      "customer": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "lastLocation": {
        "coordinates": [168.3273, -17.7334],
        "timestamp": "2025-12-23T16:45:00.000Z",
        "speed": 55.3,
        "heading": 270
      },
      "trackingPoints": 48
    }
  ]
}
```

**Live Tracking Dashboard**:
```jsx
// Display vehicles on map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[-17.7334, 168.3273]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {activeBookings.map(booking => {
    const [lng, lat] = booking.lastLocation.coordinates;
    return (
      <Marker key={booking.reservationNumber} position={[lat, lng]}>
        <Popup>
          <div>
            <strong>{booking.reservationNumber}</strong>
            <p>Speed: {booking.lastLocation.speed} km/h</p>
            <p>Updated: {formatTime(booking.lastLocation.timestamp)}</p>
          </div>
        </Popup>
      </Marker>
    );
  })}
</MapContainer>
```

---

### 12. Booking Status

**GET `/api/advanced/booking/:bookingId/status`**

Get comprehensive booking status.

**Response**:
```json
{
  "success": true,
  "reservationNumber": "VU-202512-458923",
  "bookingStatus": "completed",
  "paymentStatus": "paid",
  "checkIn": {
    "status": "checked-in",
    "checkedInAt": "2025-12-25T14:00:00.000Z",
    "checkedInBy": {
      "firstName": "Staff",
      "lastName": "Member"
    }
  },
  "checkOut": {
    "status": "checked-out",
    "checkedOutAt": "2025-12-28T10:00:00.000Z"
  },
  "termsAccepted": true
}
```

---

## Check-in/Check-out Workflows

### Hotel Check-in Flow

```
1. Customer arrives at property
2. Staff scans QR code/barcode from booking confirmation
3. System retrieves booking details
4. Verify payment status (must be paid or partial)
5. Customer accepts terms & conditions
6. Customer provides signature
7. Staff processes check-in with location
8. Room status updated to "occupied"
9. Generate room key/access card
10. Email confirmation sent
```

### Vehicle Rental Check-out Flow

```
1. Customer returns vehicle
2. Staff inspects for damage
3. If damage found:
   - Document with photos
   - Add damage description
   - Flag for additional charges
4. Staff processes check-out
5. Vehicle status updated to "available"
6. Final receipt generated
7. Refund security deposit (if applicable)
```

---

## Status Transitions

### Check-in Status Flow:
```
not-checked-in → checked-in (on-time arrival)
not-checked-in → late (arrived >1 hour late)
not-checked-in → no-show (didn't arrive)
```

### Check-out Status Flow:
```
not-checked-out → checked-out (on-time departure)
not-checked-out → late-checkout (departed >1 hour late)
not-checked-out → extended (stayed >1 day extra)
```

---

## Geolocation Features

### Use Cases:

**1. Airport Transfers**
- Track pickup location (airport gate)
- Real-time driver location
- ETA calculations
- Route optimization

**2. Car Rentals**
- Pickup location (rental office)
- Dropoff location (return point)
- GPS tracking for fleet management
- Geofencing alerts

**3. Tour Services**
- Meeting point tracking
- Guide location
- Group member tracking
- Safety monitoring

**4. Field Services**
- Technician location
- Service area coverage
- Route efficiency
- Arrival time estimates

---

## QR Code Usage

### Generation:
```
Format: VU-BOOKING:{reservationNumber}:{bookingType}:{timestamp}
Example: VU-BOOKING:VU-202512-458923:property:1703345678901
```

### Applications:
- ✅ Contactless check-in at kiosks
- ✅ Quick staff verification
- ✅ Mobile boarding passes
- ✅ Event ticket scanning
- ✅ Access control integration

---

## Barcode Usage

### Format:
```
Barcode: {reservationNumber without dashes}
Example: VU202512458923
```

### Applications:
- ✅ Traditional barcode scanners
- ✅ Legacy system integration
- ✅ Printed tickets
- ✅ ID cards
- ✅ Luggage tags

---

## Security Considerations

### Terms Acceptance:
- ✅ IP address logged
- ✅ Timestamp recorded
- ✅ Version tracked
- ✅ Cannot be undone
- ✅ Legal documentation

### Digital Signatures:
- ✅ Base64 encoded storage
- ✅ Device fingerprinting
- ✅ IP logging
- ✅ Timestamp proof
- ✅ Non-repudiation

### Geolocation:
- ✅ User consent required
- ✅ Privacy controls
- ✅ Data retention limits (100 points)
- ✅ Anonymous tracking option
- ✅ GDPR compliant

---

## Database Indexes

Optimized for fast queries:

```javascript
// QR/Barcode lookup
{ qrCode: 1 }
{ barcode: 1 }

// Status queries
{ 'checkIn.status': 1 }
{ 'checkOut.status': 1 }
{ 'checkIn.checkedInAt': 1 }
{ 'checkOut.checkedOutAt': 1 }

// Geolocation queries (2dsphere)
{ 'geolocation.pickup.coordinates': '2dsphere' }
{ 'geolocation.dropoff.coordinates': '2dsphere' }

// Terms tracking
{ 'termsAndConditions.accepted': 1 }
```

---

## Frontend Components

### Check-in Interface:
```jsx
<CheckInForm
  booking={booking}
  onCheckIn={async (data) => {
    const result = await checkInCustomer(booking._id, data);
    if (result.success) {
      showSuccess('Check-in successful!');
    }
  }}
/>
```

### Signature Pad:
```jsx
<SignaturePad
  onSave={(signatureData) => {
    saveSignature(booking._id, signatureData);
  }}
/>
```

### Terms Modal:
```jsx
<TermsModal
  version="v2.0"
  onAccept={() => {
    acceptTerms(booking._id);
  }}
/>
```

### Live Tracking Map:
```jsx
<LiveTrackingMap
  bookings={activeBookings}
  center={[-17.7334, 168.3273]}
  zoom={13}
/>
```

---

## Benefits

✅ **Contactless Operations**: QR code check-in reduces physical contact
✅ **Real-time Tracking**: Know exactly where vehicles/staff are
✅ **Legal Compliance**: Digital signatures and terms acceptance
✅ **Late Arrival Management**: Automatic detection and handling
✅ **Damage Documentation**: Immediate reporting with timestamps
✅ **Staff Accountability**: Track who performed check-in/out
✅ **Customer Experience**: Faster check-in with mobile QR codes
✅ **Fleet Management**: Real-time vehicle location tracking
✅ **Safety Features**: GPS tracking for passenger safety
✅ **Analytics**: Check-in statistics and patterns

---

## Testing

### Test Check-in:
```bash
curl -X POST http://localhost:5000/api/advanced/check-in \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "notes": "Test check-in",
    "location": {
      "latitude": -17.7334,
      "longitude": 168.3273
    }
  }'
```

### Test QR Code Scan:
```bash
curl -X GET http://localhost:5000/api/advanced/qr/VU-BOOKING:VU-202512-458923:property:1703345678901
```

### Test Tracking:
```bash
curl -X POST http://localhost:5000/api/advanced/location/track \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "latitude": -17.7334,
    "longitude": 168.3273,
    "speed": 45,
    "heading": 180
  }'
```

---

## Next Steps

- [ ] Implement frontend QR code scanner
- [ ] Create signature pad component
- [ ] Build live tracking dashboard
- [ ] Add push notifications for check-in
- [ ] Integrate payment gateway
- [ ] Create mobile app for drivers
- [ ] Add facial recognition check-in
- [ ] Implement geofencing alerts
- [ ] Create analytics dashboard
- [ ] Add SMS notifications
