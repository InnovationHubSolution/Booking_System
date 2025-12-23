# How to Add Price for an Accommodation

## Overview
Accommodations in the Vanuatu Booking System use a **room-based pricing model**. Each property can have multiple room types, and each room type has its own price.

---

## Pricing Structure

### Property Model
Each accommodation (property) contains:
- **Property Information**: Name, description, location, amenities
- **Rooms Array**: Each room has its own pricing and details

### Room Pricing Fields
Each room in the property includes:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `type` | String | Room type (e.g., "Deluxe Suite", "Standard Room") | Yes |
| `description` | String | Room description | No |
| `maxGuests` | Number | Maximum guests allowed | Yes |
| `beds` | Number | Number of beds | Yes |
| `bathrooms` | Number | Number of bathrooms | Yes |
| **`pricePerNight`** | **Number** | **Price per night in VUV** | **Yes** |
| `currency` | String | Currency code (default: VUV) | No |
| `available` | Boolean | Room availability status | No (default: true) |
| `count` | Number | Number of rooms of this type | No (default: 1) |
| `amenities` | Array | Room-specific amenities | No |

---

## Methods to Add Pricing

### Method 1: Using the API (Recommended for Hosts)

#### Step 1: Authenticate as a Host
First, you need to be logged in as a host user.

**Login Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "host@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "your_jwt_token",
  "userId": "user_id",
  "user": {
    "userId": "user_id",
    "email": "host@example.com",
    "role": "customer",
    "isHost": true
  }
}
```

Save the `token` for subsequent requests.

#### Step 2: Create a New Property with Pricing

**Request:**
```http
POST http://localhost:5000/api/properties
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "name": "Paradise Beach Resort",
  "description": "Luxury beachfront resort with stunning ocean views",
  "propertyType": "resort",
  "address": {
    "street": "123 Beachfront Drive",
    "city": "Port Vila",
    "state": "Shefa",
    "country": "Vanuatu",
    "zipCode": "",
    "coordinates": {
      "lat": -17.7334,
      "lng": 168.3273
    }
  },
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "amenities": [
    "WiFi",
    "Pool",
    "Restaurant",
    "Beach Access",
    "Spa",
    "Gym"
  ],
  "rooms": [
    {
      "type": "Standard Room",
      "description": "Comfortable room with garden view",
      "maxGuests": 2,
      "beds": 1,
      "bathrooms": 1,
      "pricePerNight": 15000,
      "currency": "VUV",
      "available": true,
      "count": 10,
      "amenities": ["Air Conditioning", "TV", "Mini Fridge"]
    },
    {
      "type": "Deluxe Ocean View",
      "description": "Spacious room with breathtaking ocean views",
      "maxGuests": 3,
      "beds": 2,
      "bathrooms": 1,
      "pricePerNight": 25000,
      "currency": "VUV",
      "available": true,
      "count": 5,
      "amenities": ["Air Conditioning", "TV", "Mini Fridge", "Balcony", "Ocean View"]
    },
    {
      "type": "Executive Suite",
      "description": "Luxury suite with separate living area",
      "maxGuests": 4,
      "beds": 2,
      "bathrooms": 2,
      "pricePerNight": 45000,
      "currency": "VUV",
      "available": true,
      "count": 3,
      "amenities": ["Air Conditioning", "TV", "Kitchen", "Balcony", "Ocean View", "Jacuzzi"]
    }
  ],
  "checkInTime": "14:00",
  "checkOutTime": "11:00",
  "cancellationPolicy": "moderate",
  "houseRules": [
    "No smoking",
    "No pets",
    "Quiet hours: 10 PM - 7 AM"
  ]
}
```

**Response:**
```json
{
  "_id": "property_id",
  "name": "Paradise Beach Resort",
  "rooms": [
    {
      "type": "Standard Room",
      "pricePerNight": 15000,
      "currency": "VUV",
      ...
    }
  ],
  "createdAt": "2025-12-24T...",
  "updatedAt": "2025-12-24T..."
}
```

#### Step 3: Update Property Pricing (Edit Existing)

**Request:**
```http
PUT http://localhost:5000/api/properties/{property_id}
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "rooms": [
    {
      "type": "Standard Room",
      "description": "Comfortable room with garden view",
      "maxGuests": 2,
      "beds": 1,
      "bathrooms": 1,
      "pricePerNight": 18000,
      "currency": "VUV",
      "available": true,
      "count": 10,
      "amenities": ["Air Conditioning", "TV", "Mini Fridge"]
    },
    {
      "type": "Deluxe Ocean View",
      "maxGuests": 3,
      "beds": 2,
      "bathrooms": 1,
      "pricePerNight": 28000,
      "currency": "VUV",
      "available": true,
      "count": 5,
      "amenities": ["Air Conditioning", "TV", "Mini Fridge", "Balcony", "Ocean View"]
    }
  ]
}
```

---

### Method 2: Using Postman or Similar API Tool

1. **Open Postman** (or Insomnia, Thunder Client, etc.)

2. **Create a POST request** to:
   ```
   http://localhost:5000/api/properties
   ```

3. **Add Headers:**
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer your_jwt_token`

4. **Set Body** (raw JSON):
   ```json
   {
     "name": "Your Property Name",
     "propertyType": "hotel",
     "rooms": [
       {
         "type": "Standard Room",
         "maxGuests": 2,
         "beds": 1,
         "bathrooms": 1,
         "pricePerNight": 15000
       }
     ]
   }
   ```

5. **Click Send**

---

### Method 3: Using Frontend (Host Dashboard)

#### For Hosts with Dashboard Access:

1. **Login** to your account at `http://localhost:3000/login`

2. **Navigate to Host Dashboard**:
   - Click on your profile/menu
   - Select "Host Dashboard" or "My Properties"

3. **Add New Property**:
   - Click "Add Property" or "List Property" button
   - Fill in property details form

4. **Set Room Prices**:
   - In the "Rooms" section, add each room type
   - For each room, enter:
     - Room type name
     - Number of guests, beds, bathrooms
     - **Price per night** (in VUV)
     - Availability and count

5. **Save Property**:
   - Review all details
   - Click "Save" or "Publish"

---

### Method 4: Direct Database Access (Admin Only)

**Using MongoDB Compass or Mongo Shell:**

```javascript
// Connect to database
use vanuatu-booking

// Insert new property with pricing
db.properties.insertOne({
  name: "Beach Villa",
  description: "Beautiful beachfront villa",
  propertyType: "villa",
  address: {
    street: "456 Coastal Road",
    city: "Port Vila",
    state: "Shefa",
    country: "Vanuatu",
    coordinates: {
      type: "Point",
      coordinates: [168.3273, -17.7334]
    }
  },
  ownerId: ObjectId("owner_user_id"),
  images: ["https://example.com/villa1.jpg"],
  amenities: ["WiFi", "Pool", "Kitchen"],
  rooms: [
    {
      type: "Master Bedroom",
      description: "Large bedroom with ocean view",
      maxGuests: 2,
      beds: 1,
      bathrooms: 1,
      pricePerNight: 35000,
      currency: "VUV",
      available: true,
      count: 1,
      amenities: ["King Bed", "Ensuite Bathroom", "Ocean View"]
    }
  ],
  rating: 0,
  reviewCount: 0,
  checkInTime: "15:00",
  checkOutTime: "10:00",
  cancellationPolicy: "moderate",
  houseRules: ["No smoking"],
  isActive: true,
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Update existing property pricing
db.properties.updateOne(
  { _id: ObjectId("property_id") },
  {
    $set: {
      "rooms.0.pricePerNight": 20000,
      "rooms.1.pricePerNight": 30000,
      updatedAt: new Date()
    }
  }
)
```

---

## Pricing Best Practices

### 1. Competitive Pricing
```
Standard Room: VUV 12,000 - 20,000/night
Deluxe Room:   VUV 20,000 - 35,000/night
Suite:         VUV 35,000 - 60,000/night
Villa:         VUV 60,000+/night
```

### 2. Multiple Room Types
Always offer at least 2-3 room types:
- Budget option (Standard)
- Mid-range option (Deluxe)
- Premium option (Suite/Villa)

### 3. Dynamic Pricing Considerations
Consider implementing:
- Seasonal pricing (high/low season)
- Weekend vs weekday rates
- Long-stay discounts
- Last-minute deals

### 4. Currency
- Default currency: **VUV (Vanuatu Vatu)**
- All prices stored in VUV
- Currency conversion handled on frontend if needed

### 5. Pricing Transparency
Include in your price:
- Base room rate
- Note any additional fees separately (cleaning, service, taxes)

---

## Price Calculation Examples

### Example 1: Single Room Type
```json
{
  "rooms": [
    {
      "type": "Standard Double",
      "maxGuests": 2,
      "beds": 1,
      "bathrooms": 1,
      "pricePerNight": 15000,
      "count": 20
    }
  ]
}
```
**Booking 3 nights:** 15,000 × 3 = 45,000 VUV

### Example 2: Multiple Room Types
```json
{
  "rooms": [
    {
      "type": "Budget Single",
      "pricePerNight": 8000,
      "maxGuests": 1
    },
    {
      "type": "Standard Double",
      "pricePerNight": 15000,
      "maxGuests": 2
    },
    {
      "type": "Family Suite",
      "pricePerNight": 28000,
      "maxGuests": 4
    }
  ]
}
```

**Family Suite for 5 nights:** 28,000 × 5 = 140,000 VUV

---

## Testing Your Pricing

### Test with cURL:

**Create Property:**
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Hotel",
    "propertyType": "hotel",
    "address": {
      "street": "Test St",
      "city": "Port Vila",
      "state": "Shefa",
      "country": "Vanuatu",
      "coordinates": {"lat": -17.7334, "lng": 168.3273}
    },
    "rooms": [{
      "type": "Test Room",
      "maxGuests": 2,
      "beds": 1,
      "bathrooms": 1,
      "pricePerNight": 10000
    }]
  }'
```

**Search by Price Range:**
```bash
curl "http://localhost:5000/api/properties/search?minPrice=10000&maxPrice=30000"
```

---

## Common Errors and Solutions

### Error: "pricePerNight is required"
**Solution:** Ensure each room has a `pricePerNight` field:
```json
{
  "rooms": [{
    "type": "Room Name",
    "pricePerNight": 15000  // Required!
  }]
}
```

### Error: "ValidationError: rooms.pricePerNight: Path `pricePerNight` is required"
**Solution:** Check that the field name is exactly `pricePerNight` (camelCase)

### Error: 403 Unauthorized
**Solution:** 
- Make sure you're logged in
- Ensure your account has host privileges
- Check that JWT token is valid and included in Authorization header

### Price Not Showing in Search Results
**Solution:**
- Verify `isActive: true` on the property
- Check that room `available: true`
- Ensure price is within search filter range

---

## Quick Reference: API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/properties/search` | Search properties (with price filters) | No |
| GET | `/api/properties/:id` | Get property details | No |
| POST | `/api/properties` | Create new property | Yes (Host) |
| PUT | `/api/properties/:id` | Update property/pricing | Yes (Owner/Admin) |
| DELETE | `/api/properties/:id` | Delete property | Yes (Owner/Admin) |
| GET | `/api/properties/host/my-properties` | Get host's properties | Yes (Host) |

---

## Price Modification Workflow

### To Change Prices:

1. **Get Property ID**:
   ```bash
   GET /api/properties/host/my-properties
   ```

2. **Prepare Update**:
   ```json
   {
     "rooms": [
       {
         "type": "Standard Room",
         "pricePerNight": 18000  // Updated price
       }
     ]
   }
   ```

3. **Send Update Request**:
   ```bash
   PUT /api/properties/{property_id}
   ```

4. **Verify Changes**:
   ```bash
   GET /api/properties/{property_id}
   ```

---

## Support

If you need help with pricing:
- Check this guide first
- Review the [Property Model](../backend/src/models/Property.ts)
- Test with Postman/curl
- Contact system administrator

**Currency Rates (Reference):**
- 1 USD ≈ 115 VUV
- 1 EUR ≈ 125 VUV
- 1 AUD ≈ 75 VUV

*Prices in VUV (Vanuatu Vatu)*
