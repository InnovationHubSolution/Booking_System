# Resource Availability & Allocation System

## Overview
Complete system for managing resource allocation and preventing double bookings across all booking types (rooms, seats, vehicles, staff, equipment).

---

## Core Components

### 1. Resource Allocation Fields

Every booking can have resource allocation:

```typescript
resourceAllocation: {
  resourceId: string;        // "ROOM-101", "SEAT-12A", "VU-V001"
  resourceType: string;      // 'room' | 'seat' | 'vehicle' | 'staff' | 'equipment'
  resourceName: string;      // "Deluxe Suite - Room 101"
  capacity: number;          // Maximum capacity (e.g., 4 guests)
  allocatedQuantity: number; // How many units allocated (e.g., 2 guests)
  availabilityStatus: string;// 'available' | 'allocated' | 'occupied' | 'maintenance' | 'blocked'
  assignedBy: ObjectId;      // User who assigned the resource
  assignedAt: Date;          // When resource was assigned
  notes: string;             // Additional notes
}
```

---

## Resource Types

### **1. Room (Property Bookings)**
- **Resource ID Format**: `{PROPERTY}-{ROOMTYPE}-{NUMBER}`
- **Example**: `PAR-DEL-001` (Paradise Resort, Deluxe, Room 001)
- **Capacity**: Number of guests the room can accommodate
- **Status**: available → allocated → occupied → available

### **2. Seat (Flight Bookings)**
- **Resource ID Format**: `{FLIGHT}-{CLASS}-{SEAT}`
- **Example**: `NF123-ECO-12A` (Flight NF123, Economy, Seat 12A)
- **Capacity**: 1 (one person per seat)
- **Status**: available → allocated → occupied

### **3. Vehicle (Car Rental)**
- **Resource ID Format**: `VU-V{NUMBER}`
- **Example**: `VU-V001` (Vehicle 001)
- **Capacity**: Number of passengers
- **Status**: available → allocated → occupied → maintenance → available

### **4. Staff (Service Bookings)**
- **Resource ID Format**: `STAFF-{ID}`
- **Example**: `STAFF-JD001` (Staff John Doe)
- **Capacity**: Number of concurrent bookings they can handle
- **Status**: available → allocated → occupied

### **5. Equipment (Activity Bookings)**
- **Resource ID Format**: `EQ-{TYPE}-{NUMBER}`
- **Example**: `EQ-DIVE-005` (Diving Equipment 005)
- **Capacity**: Quantity available
- **Status**: available → allocated → occupied → maintenance

---

## API Endpoints

### Check Resource Availability

**Endpoint**: `POST /api/resources/check-availability`

**Request**:
```json
{
  "resourceId": "PAR-DEL-001",
  "resourceType": "room",
  "checkInDate": "2025-12-25",
  "checkOutDate": "2025-12-30",
  "excludeBookingId": "optional-booking-id"
}
```

**Response**:
```json
{
  "available": true,
  "conflictingBookings": [],
  "availableQuantity": 4,
  "totalCapacity": 4,
  "message": "Resource PAR-DEL-001 is available (4/4 units free)"
}
```

---

### Find Available Rooms

**Endpoint**: `GET /api/resources/rooms/available`

**Query Parameters**:
- `propertyId`: Property ID
- `roomType`: Type of room (e.g., "Deluxe Suite")
- `checkInDate`: Check-in date
- `checkOutDate`: Check-out date
- `quantity`: Number of rooms needed (default: 1)

**Example**:
```
GET /api/resources/rooms/available?propertyId=65a1b2c3&roomType=Deluxe&checkInDate=2025-12-25&checkOutDate=2025-12-30&quantity=2
```

**Response**:
```json
{
  "available": true,
  "count": 3,
  "rooms": [
    "PAR-DEL-001",
    "PAR-DEL-002",
    "PAR-DEL-003"
  ]
}
```

---

### Find Available Vehicles

**Endpoint**: `GET /api/resources/vehicles/available`

**Query Parameters**:
- `vehicleType`: Type of vehicle (SUV, sedan, etc.)
- `pickupDate`: Pickup date
- `returnDate`: Return date

**Response**:
```json
{
  "available": true,
  "count": 5,
  "vehicles": [
    "VU-V001",
    "VU-V002",
    "VU-V003",
    "VU-V004",
    "VU-V005"
  ]
}
```

---

### Allocate Resource to Booking

**Endpoint**: `POST /api/resources/allocate`

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "resourceId": "PAR-DEL-001",
  "resourceType": "room",
  "resourceName": "Deluxe Suite - Room 101",
  "capacity": 4,
  "quantity": 2,
  "notes": "Allocated for honeymoon package"
}
```

**Response**:
```json
{
  "message": "Resource allocated successfully",
  "booking": {
    "_id": "65b2c3d4e5f6g7h8",
    "reservationNumber": "VU-202512-458923",
    "resourceAllocation": {
      "resourceId": "PAR-DEL-001",
      "resourceType": "room",
      "resourceName": "Deluxe Suite - Room 101",
      "capacity": 4,
      "allocatedQuantity": 2,
      "availabilityStatus": "allocated",
      "assignedAt": "2025-12-23T14:30:00.000Z"
    }
  }
}
```

---

### Update Resource Status

**Endpoint**: `PATCH /api/resources/:bookingId/status`

**Request**:
```json
{
  "status": "occupied"
}
```

**Valid Statuses**:
- `available` - Resource is free
- `allocated` - Reserved but not yet in use
- `occupied` - Currently in use
- `maintenance` - Under maintenance
- `blocked` - Temporarily unavailable

---

### Get Resource Bookings

**Endpoint**: `GET /api/resources/:resourceId/bookings`

**Query Parameters** (optional):
- `startDate`: Filter bookings from this date
- `endDate`: Filter bookings until this date

**Example**:
```
GET /api/resources/PAR-DEL-001/bookings?startDate=2025-12-01&endDate=2025-12-31
```

**Response**:
```json
{
  "resourceId": "PAR-DEL-001",
  "count": 8,
  "bookings": [
    {
      "_id": "booking1",
      "reservationNumber": "VU-202512-458923",
      "checkInDate": "2025-12-25",
      "checkOutDate": "2025-12-30",
      "status": "confirmed",
      "userId": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

---

### Get Occupancy Statistics

**Endpoint**: `GET /api/resources/occupancy/stats`

**Query Parameters**:
- `resourceType`: Type of resource (room, vehicle, etc.)
- `startDate`: Start date for analysis
- `endDate`: End date for analysis

**Example**:
```
GET /api/resources/occupancy/stats?resourceType=room&startDate=2025-12-01&endDate=2025-12-31
```

**Response**:
```json
{
  "resourceType": "room",
  "period": {
    "startDate": "2025-12-01",
    "endDate": "2025-12-31"
  },
  "stats": [
    {
      "_id": "PAR-DEL-001",
      "totalBookings": 15,
      "totalNights": 75,
      "totalRevenue": 2100000,
      "averagePrice": 140000
    }
  ]
}
```

---

### List All Resources

**Endpoint**: `GET /api/resources/list`

**Query Parameters** (optional):
- `resourceType`: Filter by type
- `status`: Filter by availability status

**Example**:
```
GET /api/resources/list?resourceType=room&status=available
```

**Response**:
```json
{
  "count": 12,
  "resources": [
    {
      "resourceId": "PAR-DEL-001",
      "resourceType": "room",
      "resourceName": "Deluxe Suite - Room 101",
      "capacity": 4,
      "status": "available",
      "bookings": []
    }
  ]
}
```

---

## Availability Service Functions

### JavaScript/TypeScript Usage

```typescript
import availabilityService from '../services/availabilityService';

// Check if resource is available
const availability = await availabilityService.checkResourceAvailability({
  resourceId: 'PAR-DEL-001',
  resourceType: 'room',
  checkInDate: new Date('2025-12-25'),
  checkOutDate: new Date('2025-12-30')
});

if (availability.available) {
  console.log('Room is available!');
}

// Find available rooms
const rooms = await availabilityService.findAvailableRooms(
  'propertyId',
  'Deluxe Suite',
  new Date('2025-12-25'),
  new Date('2025-12-30'),
  2 // need 2 rooms
);

// Allocate resource
await availabilityService.allocateResource(
  'bookingId',
  'PAR-DEL-001',
  'room',
  'Deluxe Suite - Room 101',
  4, // capacity
  2, // allocated quantity
  'userId',
  'Special honeymoon package'
);
```

---

## Double Booking Prevention

### How It Works:

1. **Date Overlap Check**: System checks for any bookings where dates overlap:
   - New booking starts during existing booking
   - New booking ends during existing booking
   - New booking completely encompasses existing booking

2. **Capacity Management**: 
   - Each resource has a capacity (max occupancy)
   - System tracks allocated quantity
   - Prevents over-allocation

3. **Status Tracking**:
   - Only checks against `pending`, `confirmed`, `occupied` bookings
   - Ignores `cancelled` bookings
   - Considers `maintenance` and `blocked` as unavailable

### Example Scenario:

**Room PAR-DEL-001** (Capacity: 4)

**Existing Bookings**:
- Booking A: Dec 20-25 (2 guests) - Status: confirmed
- Booking B: Dec 28-31 (2 guests) - Status: confirmed

**New Booking Request**: Dec 24-27 (2 guests)

**Result**: ❌ REJECTED
- Reason: Overlaps with Booking A (Dec 20-25)
- Even though capacity allows 2 more guests, the room is already allocated

**Alternative Request**: Dec 26-28 (2 guests)

**Result**: ✅ APPROVED
- No conflicts with existing bookings
- Room is available during this period

---

## Automatic Resource Assignment

When creating a booking, the system automatically:

1. **Generates Resource ID**:
   ```typescript
   const roomNumber = `${property.name.substring(0, 3)}-${roomType.substring(0, 3)}-${count + 1}`;
   // Example: "PAR-DEL-001"
   ```

2. **Assigns Resource**:
   - Sets capacity from room/vehicle specifications
   - Calculates allocated quantity from guest count
   - Sets status to 'allocated'
   - Records who assigned it and when

3. **Validates Availability**:
   - Checks for conflicting bookings
   - Ensures capacity isn't exceeded
   - Returns error if unavailable

---

## Status Lifecycle

### Room Booking:
```
available → allocated (booking created) → occupied (guest checks in) → available (guest checks out)
```

### Vehicle Rental:
```
available → allocated (booking confirmed) → occupied (vehicle picked up) → maintenance (if needed) → available
```

### Staff Assignment:
```
available → allocated (service booked) → occupied (service in progress) → available (service completed)
```

---

## Best Practices

### 1. Always Check Availability First
```typescript
// Before creating booking
const availability = await availabilityService.checkResourceAvailability({...});
if (!availability.available) {
  return res.status(400).json({ message: 'Resource not available' });
}
```

### 2. Use Transactions for Critical Operations
```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Create booking
  // Allocate resource
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
}
```

### 3. Update Status When State Changes
```typescript
// When guest checks in
await availabilityService.updateResourceStatus(bookingId, 'occupied');

// When guest checks out
await availabilityService.updateResourceStatus(bookingId, 'available');
```

### 4. Regular Maintenance Checks
```typescript
// Mark resources for maintenance
await availabilityService.updateResourceStatus(bookingId, 'maintenance');
```

---

## Reporting & Analytics

### Occupancy Rate Calculation:
```typescript
const stats = await availabilityService.getResourceOccupancyStats(
  'room',
  new Date('2025-12-01'),
  new Date('2025-12-31')
);

const occupancyRate = (stats.totalNights / (30 * totalRooms)) * 100;
```

### Revenue Per Resource:
```typescript
stats.forEach(resource => {
  console.log(`${resource._id}: ${resource.totalRevenue} VUV`);
});
```

---

## Error Handling

### Common Errors:

**1. Double Booking Attempt**:
```json
{
  "message": "Room not available for selected dates",
  "conflictingBookings": 1,
  "availableRooms": 0
}
```

**2. Resource Not Found**:
```json
{
  "message": "Resource PAR-DEL-999 not found"
}
```

**3. Invalid Date Range**:
```json
{
  "message": "Invalid date range: checkOut must be after checkIn"
}
```

---

## Testing

### Test Double Booking Prevention:

```bash
# Create first booking
curl -X POST http://localhost:5000/api/bookings/property \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "propertyId": "PROP_ID",
    "roomType": "Deluxe",
    "checkInDate": "2025-12-25",
    "checkOutDate": "2025-12-30",
    "guestDetails": {...}
  }'

# Try to book same room/dates (should fail)
curl -X POST http://localhost:5000/api/bookings/property \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "propertyId": "PROP_ID",
    "roomType": "Deluxe",
    "checkInDate": "2025-12-26",
    "checkOutDate": "2025-12-29",
    "guestDetails": {...}
  }'
```

---

## Benefits

✅ **Prevents Double Bookings**: Comprehensive date/capacity checks
✅ **Resource Tracking**: Know exactly what's allocated where
✅ **Capacity Management**: Track occupancy vs availability
✅ **Status Workflow**: Clear lifecycle for each resource
✅ **Analytics Ready**: Full occupancy and revenue stats
✅ **Scalable**: Works for any resource type
✅ **Audit Trail**: Records who assigned what and when
✅ **Real-time**: Immediate availability checks

---

## Future Enhancements

- [ ] Real-time dashboard showing resource availability
- [ ] Automated resource assignment based on preferences
- [ ] Waitlist system for fully booked resources
- [ ] Smart pricing based on occupancy
- [ ] Maintenance schedule integration
- [ ] Mobile notifications for resource assignments
- [ ] Bulk resource operations
- [ ] Resource swapping/upgrades
