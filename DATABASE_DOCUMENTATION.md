# Vanuatu Booking System - Database Documentation

## 📊 Database Overview

**Database Name:** `vanuatu-booking`  
**Type:** MongoDB (NoSQL Document Database)  
**Connection:** `mongodb://localhost:27017/vanuatu-booking`  
**Status:** ✅ Active & Populated

---

## 🗂️ Collections Structure

### 1. **Users Collection**
Stores all user accounts (customers, hosts, admins)

**Fields:**
- `_id`: ObjectId (auto-generated)
- `email`: String (unique, required)
- `password`: String (hashed with bcrypt)
- `firstName`: String
- `lastName`: String
- `phone`: String
- `role`: Enum (`'customer'`, `'host'`, `'admin'`)
- `isHost`: Boolean
- `verified`: Boolean
- `profileImage`: String (URL)
- `address`: Object (optional)
- `savedPaymentMethods`: Array
- `travelerProfiles`: Array
- `preferences`: Object
- `loyaltyProgram`: Object
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `email` (unique)
- `role`

**Current Data:** 5 users
- 1 Admin
- 2 Hosts
- 2 Customers

---

### 2. **Properties Collection**
Accommodation listings (hotels, resorts, apartments, villas)

**Fields:**
- `_id`: ObjectId
- `name`: String (required)
- `description`: String
- `propertyType`: Enum (`'hotel'`, `'apartment'`, `'resort'`, `'villa'`, `'hostel'`, etc.)
- `starRating`: Number (1-5)
- `address`: Object
  - `street`: String
  - `city`: String
  - `state`: String
  - `country`: String
  - `zipCode`: String
  - `coordinates`: GeoJSON Point
    - `type`: "Point"
    - `coordinates`: [longitude, latitude]
- `ownerId`: ObjectId (ref: User)
- `images`: Array of Strings (URLs)
- `amenities`: Array of Strings
- `rooms`: Array of Objects
  - `type`: String (room name)
  - `description`: String
  - `maxGuests`: Number
  - `beds`: Number
  - `bathrooms`: Number
  - `pricePerNight`: Number
  - `currency`: String
  - `available`: Boolean
  - `count`: Number (how many rooms of this type)
  - `amenities`: Array
  - `mealPlan`: Enum
  - `size`: Number (sqm)
  - `bedType`: String
  - `viewType`: String
- `rating`: Number (0-5, calculated average)
- `reviewCount`: Number
- `checkInTime`: String
- `checkOutTime`: String
- `cancellationPolicy`: Object
- `houseRules`: Array of Strings
- `isActive`: Boolean
- `featured`: Boolean
- `instantConfirmation`: Boolean
- `propertyFeatures`: Object (parking, wifi, pool, etc.)
- `nearbyAttractions`: Array
- `sustainability`: Object
- `pricing`: Object (taxRate, fees, deposit)
- `availability`: Object
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `address.coordinates` (2dsphere for geospatial queries)
- `name`, `description` (text search)
- `isActive`
- `featured`

**Current Data:** 5 properties
- 2 in Port Vila
- 1 in Mele Bay
- 1 in Luganville
- 1 in Port Vila center

---

### 3. **Flights Collection**
Flight information and schedules

**Fields:**
- `_id`: ObjectId
- `flightNumber`: String (e.g., "NF101")
- `airline`: Object
  - `code`: String (2-letter code)
  - `name`: String
  - `logo`: String (URL)
- `departure`: Object
  - `airport`: Object (code, name, city, country)
  - `terminal`: String
  - `gate`: String
  - `dateTime`: Date
- `arrival`: Object (same structure as departure)
- `duration`: Number (minutes)
- `aircraft`: Object (type, model, seatConfiguration)
- `seatMap`: Array (optional, detailed seat layout)
- `classes`: Object
  - `economy`: Object
    - `available`: Number
    - `price`: Number
    - `currency`: String
    - `amenities`: Array
    - `baggage`: Object (checked, cabin, allowances)
  - `business`: Object (same structure)
  - `first`: Object (optional)
- `stops`: Number
- `layovers`: Array
- `status`: Enum (`'scheduled'`, `'boarding'`, `'departed'`, `'arrived'`, `'cancelled'`, `'delayed'`)
- `isInternational`: Boolean
- `isActive`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `flightNumber`
- `departure.airport.code`
- `arrival.airport.code`
- `departure.dateTime`
- `isActive`

**Current Data:** 4 flights
- 2 International (Australia ↔ Vanuatu)
- 2 Domestic (Port Vila ↔ Luganville)

---

### 4. **Services Collection**
Tours, activities, and experiences

**Fields:**
- `_id`: ObjectId
- `name`: String
- `description`: String
- `category`: String (tour, diving, etc.)
- `price`: Number
- `currency`: String
- `duration`: Number (minutes)
- `capacity`: Number (max participants)
- `location`: String
- `images`: Array of Strings
- `availableDays`: Array of Numbers (0-6, Sunday-Saturday)
- `availableHours`: Object
  - `start`: String (HH:MM)
  - `end`: String (HH:MM)
- `isActive`: Boolean
- `amenities`: Array of Strings (what's included)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `category`
- `isActive`
- `location`

**Current Data:** 5 services
- 2 Tours
- 3 Diving/Water activities

---

### 5. **Bookings Collection**
Reservation records (comprehensive enterprise schema)

**Fields:**
- `_id`: ObjectId
- `reservationNumber`: String (unique, e.g., "VU-LZYX1234-ABC123")
- `referenceNumber`: String (unique)
- `bookingDate`: Date
- `status`: Enum (`'pending'`, `'confirmed'`, `'cancelled'`, `'completed'`, `'no-show'`)
- `bookingSource`: Enum (`'online'`, `'counter'`, `'agent'`, `'mobile-app'`)
- `bookingType`: Enum (`'property'`, `'service'`, `'flight'`, `'car-rental'`, `'transfer'`, `'package'`)
- `userId`: ObjectId (ref: User)
- `propertyId`: ObjectId (ref: Property, for property bookings)
- `serviceId`: ObjectId (ref: Service, for service bookings)
- `flightId`: ObjectId (ref: Flight, for flight bookings)
- `roomType`: String
- `checkInDate`: Date
- `checkOutDate`: Date
- `nights`: Number
- `totalPrice`: Number (legacy field)
- `pricing`: Object (comprehensive breakdown)
  - `unitPrice`: Number
  - `quantity`: Number
  - `subtotal`: Number
  - `discount`: Object (optional)
  - `discountAmount`: Number
  - `taxRate`: Number
  - `taxAmount`: Number
  - `totalAmount`: Number
  - `currency`: String
- `payment`: Object
  - `status`: Enum (`'unpaid'`, `'partial'`, `'paid'`, `'refunded'`, `'failed'`)
  - `method`: String
  - `reference`: String
  - `transactionId`: String
  - `paidAmount`: Number
  - `remainingAmount`: Number
  - `paidAt`: Date
  - `refundAmount`: Number
  - `refundReason`: String
  - `refundedAt`: Date
- `guestCount`: Object
  - `adults`: Number
  - `children`: Number
  - `infants`: Number (optional)
- `guestDetails`: Object
  - `firstName`: String (required)
  - `lastName`: String (required)
  - `email`: String (required)
  - `phone`: String (required)
- `specialRequests`: String
- `resourceAllocation`: Object (room assignment, seat number, etc.)
- `checkIn`: Object (status, timestamp, location)
- `checkOut`: Object (status, timestamp, location)
- `qrCode`: String (for mobile check-in)
- `barcode`: String
- `termsAndConditions`: Object
- `cancellationReason`: String
- `cancelledAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `reservationNumber` (unique)
- `referenceNumber` (unique)
- `userId`
- `propertyId`
- `status`
- `checkInDate`
- `qrCode` (unique)

**Current Data:** Created dynamically through booking flow

---

### 6. **Reviews Collection**
Property and service reviews from customers

**Fields:**
- `_id`: ObjectId
- `propertyId`: ObjectId (ref: Property)
- `userId`: ObjectId (ref: User)
- `bookingId`: ObjectId (ref: Booking, required)
- `rating`: Number (1-5, overall)
- `cleanliness`: Number (1-5, required)
- `accuracy`: Number (1-5, required)
- `checkIn`: Number (1-5, required)
- `communication`: Number (1-5, required)
- `location`: Number (1-5, required)
- `value`: Number (1-5, required)
- `comment`: String
- `images`: Array of Strings
- `helpful`: Array of ObjectIds (users who found it helpful)
- `response`: Object (host's response)
- `verified`: Boolean (from confirmed booking)
- `travelerType`: Enum (`'solo'`, `'couple'`, `'family'`, `'business'`, `'group'`)
- `roomType`: String
- `stayDuration`: Number (nights)
- `tripPurpose`: Enum (`'leisure'`, `'business'`, `'family-vacation'`, `'romantic'`, `'adventure'`)
- `likedFeatures`: Array of Strings
- `improvementSuggestions`: Array of Strings
- `wouldRecommend`: Boolean
- `flagged`: Boolean
- `flagReason`: String
- `createdAt`: Date

**Indexes:**
- `propertyId`, `createdAt` (compound)
- `userId`
- `verified`

**Current Data:** Created through post-stay review flow

---

### 7. **Promotions Collection**
Discount codes and promotional campaigns

**Fields:**
- `_id`: ObjectId
- `code`: String (unique)
- `name`: String
- `description`: String
- `type`: Enum (`'percentage'`, `'fixed'`, `'free-nights'`)
- `value`: Number
- `applicableTypes`: Array (`'property'`, `'service'`, `'flight'`)
- `validFrom`: Date
- `validUntil`: Date
- `usageLimit`: Number
- `usageCount`: Number
- `minimumSpend`: Number
- `maximumDiscount`: Number
- `isActive`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `code` (unique)
- `isActive`
- `validFrom`, `validUntil`

---

## 🔑 Test Accounts

### Admin Account
- **Email:** admin@vanuatu.com
- **Password:** password123
- **Role:** Admin (full system access)

### Host Accounts
1. **Host 1**
   - **Email:** host1@vanuatu.com
   - **Password:** password123
   - **Properties:** The Havannah, Warwick Le Lagon

2. **Host 2**
   - **Email:** host2@vanuatu.com
   - **Password:** password123
   - **Properties:** Coconut Palms, Espiritu Hideaway, Port Vila Apartments

### Customer Accounts
1. **Customer 1**
   - **Email:** customer1@example.com
   - **Password:** password123

2. **Customer 2**
   - **Email:** customer2@example.com
   - **Password:** password123

---

## 🛠️ Database Operations

### Seeding the Database
```bash
cd backend
npm run seed
```

### Connecting to MongoDB
```bash
mongosh mongodb://localhost:27017/vanuatu-booking
```

### Common MongoDB Commands
```javascript
// Show all collections
show collections

// Count documents
db.users.countDocuments()
db.properties.countDocuments()
db.flights.countDocuments()
db.services.countDocuments()

// Find all properties
db.properties.find().pretty()

// Find properties by city
db.properties.find({ "address.city": "Port Vila" })

// Find flights by route
db.flights.find({ 
  "departure.airport.code": "SYD",
  "arrival.airport.code": "VLI" 
})

// Get user by email
db.users.findOne({ email: "admin@vanuatu.com" })

// Get all bookings for a user
db.bookings.find({ userId: ObjectId("...") })

// Clear all collections
db.users.deleteMany({})
db.properties.deleteMany({})
db.flights.deleteMany({})
db.services.deleteMany({})
db.bookings.deleteMany({})
db.reviews.deleteMany({})
```

---

## 📈 Database Performance

### Indexes Created
- ✅ User email (unique)
- ✅ Property geospatial (2dsphere)
- ✅ Property text search
- ✅ Flight search (departure, arrival, date)
- ✅ Booking reservation numbers (unique)
- ✅ Review property + date (compound)

### Query Optimization
- Geospatial queries for "properties near me"
- Text search for property names and descriptions
- Compound indexes for booking lookups
- Date range queries for flight search

---

## 🔒 Security Features

1. **Password Hashing:** All passwords hashed with bcrypt (10 rounds)
2. **JWT Authentication:** Secure token-based auth
3. **Role-Based Access:** Admin, Host, Customer roles
4. **Verified Accounts:** Email verification flag
5. **Booking Validation:** Comprehensive validation on all required fields

---

## 📊 Current Database Statistics

| Collection   | Documents | Size    | Indexes |
|-------------|-----------|---------|---------|
| users       | 5         | ~5 KB   | 2       |
| properties  | 5         | ~50 KB  | 3       |
| flights     | 4         | ~20 KB  | 5       |
| services    | 5         | ~15 KB  | 3       |
| bookings    | 0         | -       | 6       |
| reviews     | 0         | -       | 3       |
| promotions  | 0         | -       | 3       |

**Total:** ~90 KB  
**Status:** ✅ Production Ready

---

## 🚀 Next Steps

1. ✅ Database seeded with initial data
2. ✅ All schemas validated and tested
3. ✅ Indexes created for performance
4. ⏳ Create bookings through app (not seed data due to complexity)
5. ⏳ Generate reviews after bookings
6. ⏳ Add promotional campaigns

---

## 📝 Notes

- **Bookings** are not seeded due to complex validation requirements - create through the application flow
- **Reviews** require completed bookings - create after stay
- All **coordinates** use GeoJSON format: `[longitude, latitude]`
- All **dates** stored as ISO 8601 format
- All **prices** can be in multiple currencies
- **Phone numbers** follow international format

---

## 🌐 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017/vanuatu-booking
- **API Health:** http://localhost:5000/health

---

**Last Updated:** December 24, 2025  
**Database Version:** 1.0  
**Schema Version:** Enterprise (Full Features)
