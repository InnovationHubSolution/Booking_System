# Pricing Guide - Vanuatu Booking System

## How to Add/Update Prices

### 1. **Hotels/Properties** (per night, per room)

**API Endpoint:** `POST /api/properties` or `PATCH /api/properties/:id`

```json
{
  "name": "Paradise Resort",
  "propertyType": "resort",
  "rooms": [
    {
      "type": "Standard Room",
      "pricePerNight": 15000,
      "currency": "VUV",
      "maxGuests": 2
    },
    {
      "type": "Deluxe Suite",
      "pricePerNight": 25000,
      "currency": "VUV",
      "maxGuests": 4
    }
  ]
}
```

**Price in VUV (Vanuatu Vatu):**
- Budget room: 8,000 - 15,000 VUV/night
- Mid-range: 15,000 - 30,000 VUV/night
- Luxury: 30,000+ VUV/night

---

### 2. **Tours/Services** (per person)

**API Endpoint:** `POST /api/services` or `PATCH /api/services/:id`

```json
{
  "name": "Blue Lagoon Tour",
  "category": "sightseeing",
  "price": 8500,
  "currency": "VUV",
  "duration": 240,
  "capacity": 20,
  "location": "Port Vila"
}
```

**Typical Tour Prices:**
- Short tour (2-3 hours): 5,000 - 10,000 VUV
- Half-day tour: 10,000 - 18,000 VUV
- Full-day tour: 18,000 - 35,000 VUV
- Multi-day adventure: 50,000+ VUV

---

### 3. **Travel Packages** (complete package)

**API Endpoint:** `POST /api/packages` or `PATCH /api/packages/:id`

```json
{
  "name": "7-Day Paradise Escape",
  "duration": { "days": 7, "nights": 6 },
  "pricing": {
    "basePrice": 185000,
    "currency": "VUV",
    "discountPercentage": 10
  }
}
```

**Package Pricing:**
- Weekend (2-3 days): 50,000 - 100,000 VUV
- Week-long (5-7 days): 150,000 - 300,000 VUV
- Extended (10+ days): 350,000+ VUV

---

### 4. **Flights** (per person, per class)

**API Endpoint:** `POST /api/flights` or `PATCH /api/flights/:id`

```json
{
  "flightNumber": "NF123",
  "classes": {
    "economy": {
      "available": 150,
      "price": 45000,
      "currency": "VUV"
    },
    "business": {
      "available": 20,
      "price": 85000,
      "currency": "VUV"
    }
  }
}
```

---

### 5. **Car Rentals** (per day)

**API Endpoint:** `POST /api/car-rentals` or `PATCH /api/car-rentals/:id`

```json
{
  "vehicleType": "SUV",
  "model": "Toyota RAV4",
  "dailyRate": 8500,
  "currency": "VUV"
}
```

---

## Currency Conversion

All prices are stored in **VUV (Vanuatu Vatu)**. The frontend automatically converts to:
- USD (US Dollar)
- AUD (Australian Dollar)
- NZD (New Zealand Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)

**Current Exchange Rates (in currencyStore.ts):**
```typescript
VUV → USD: 0.0084 (1 USD ≈ 119 VUV)
VUV → AUD: 0.013  (1 AUD ≈ 77 VUV)
VUV → NZD: 0.014  (1 NZD ≈ 71 VUV)
```

---

## Quick Add Examples

### Add a New Hotel with Pricing:
```bash
POST http://localhost:5000/api/properties
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Ocean View Hotel",
  "description": "Beautiful beachfront property",
  "propertyType": "hotel",
  "address": {
    "street": "Rue de la Plage",
    "city": "Port Vila",
    "country": "Vanuatu",
    "coordinates": { "lat": -17.7334, "lng": 168.3273 }
  },
  "rooms": [
    {
      "type": "Standard",
      "description": "Comfortable room with ocean view",
      "maxGuests": 2,
      "beds": 1,
      "bathrooms": 1,
      "pricePerNight": 12000,
      "currency": "VUV",
      "available": true,
      "count": 20,
      "amenities": ["WiFi", "AC", "TV"]
    }
  ],
  "amenities": ["Pool", "Restaurant", "Bar"],
  "images": ["https://example.com/hotel1.jpg"]
}
```

### Add a New Tour with Pricing:
```bash
POST http://localhost:5000/api/services
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Volcano Night Tour",
  "description": "Experience the active volcano at night",
  "category": "adventure",
  "price": 28000,
  "currency": "VUV",
  "duration": 360,
  "capacity": 15,
  "location": "Tanna Island",
  "availableDays": [0, 2, 4, 6],
  "availableHours": { "start": "16:00", "end": "23:00" },
  "amenities": ["Transport", "Dinner", "Guide"],
  "images": ["https://example.com/volcano.jpg"]
}
```

---

## Bulk Price Updates

To update multiple items at once, you can use the database directly:

```javascript
// Update all properties in Port Vila by 10%
db.properties.updateMany(
  { "address.city": "Port Vila" },
  { $mul: { "rooms.$[].pricePerNight": 1.1 } }
)

// Set all tours in a category to a specific price range
db.services.updateMany(
  { category: "sightseeing" },
  { $set: { price: 8500 } }
)
```

---

## Testing Prices

Once added, you can view prices in different currencies at:
- **Home:** http://localhost:3000/
- **Properties:** http://localhost:3000/properties
- **Services:** http://localhost:3000/services
- **Packages:** http://localhost:3000/packages
- **Flights:** http://localhost:3000/flights

The currency selector is available on all pages (top-right corner).

---

## Price Validation

All prices must be:
- ✅ Positive numbers
- ✅ In VUV currency (for database storage)
- ✅ Reasonable for Vanuatu market
- ✅ Include currency field set to "VUV"

---

## Need Help?

- Check the seed data in `backend/src/server.ts` for examples
- All models are in `backend/src/models/`
- Frontend currency conversion in `frontend/src/store/currencyStore.ts`
