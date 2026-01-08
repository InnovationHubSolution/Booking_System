# 🛩️ Scenic Fly Tours - Quick Start Guide

## Overview

The **Scenic Fly Tours** feature enables users to book breathtaking aerial tours of Vanuatu's stunning landscapes, including active volcanoes, pristine lagoons, coral reefs, and remote islands.

---

## Quick Start

### Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:3000`
- MongoDB database connected

### Installation

#### 1. Seed the Database
```bash
cd backend
npx ts-node src/scripts/seedScenicTours.ts
```

This will create 3 scenic fly tours:
- ✈️ **Volcano & Islands Explorer** (90 min, 25,000 VUV)
- 🌊 **Blue Lagoon & Coral Reefs** (60 min, 18,000 VUV)
- 🏝️ **Northern Islands Paradise** (120 min, 35,000 VUV)

#### 2. Start the Servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

#### 3. Access the Feature
- **Homepage**: `http://localhost:3000` - See featured tours section
- **All Tours**: `http://localhost:3000/scenic-tours`
- **Navigation**: Click "✈️ Scenic Tours" in the main menu

---

## Features

### ✨ User Features

#### Browse Tours
- View all available scenic fly tours
- Filter by featured tours
- Sort by: Rating, Price, Duration, Popularity
- See tour cards with images, pricing, and key details

#### Tour Details
- Complete tour information
- Visual flight route with highlights
- Aircraft specifications
- Safety information and requirements
- Cancellation policy
- Dynamic price calculator
- Group discount display
- Available days and time slots

#### Pricing Features
- **Base Price**: Per person pricing
- **Group Discounts**: Automatic discounts for groups
- **Child Discounts**: Reduced rates for children
- **Private Charter**: Book entire aircraft
- **Real-time Calculator**: See total price as you select passengers

### 🛠️ Admin Features

Create, update, and delete tours via API:

```bash
# Get all tours
GET /api/scenic-tours

# Get specific tour
GET /api/scenic-tours/:id

# Check availability
GET /api/scenic-tours/:id/availability?date=2025-12-30

# Create tour (Admin only)
POST /api/scenic-tours

# Update tour (Admin only)
PUT /api/scenic-tours/:id

# Delete tour (Admin only)
DELETE /api/scenic-tours/:id
```

---

## Tour Information

### Available Tours

#### 1. Volcano & Islands Explorer
- **Duration**: 90 minutes
- **Price**: 25,000 VUV per person
- **Aircraft**: Cessna 206 (5 passengers)
- **Route**: Mt. Yasur Volcano, Sulphur Bay, Port Resolution
- **Status**: ⭐ Featured
- **Days**: Sun, Tue, Thu, Sat

#### 2. Blue Lagoon & Coral Reefs
- **Duration**: 60 minutes
- **Price**: 18,000 VUV per person
- **Aircraft**: Britten-Norman Islander (8 passengers)
- **Route**: Mele Cascades, Hideaway Island, Blue Lagoon
- **Status**: ⭐ Featured
- **Days**: Mon-Sat

#### 3. Northern Islands Paradise
- **Duration**: 120 minutes
- **Price**: 35,000 VUV per person
- **Aircraft**: Twin Otter DHC-6 (12 passengers)
- **Route**: Champagne Beach, Million Dollar Point, Blue Holes
- **Status**: ⭐ Featured
- **Days**: Sun, Wed, Fri
- **Seasonal**: April - November

---

## API Reference

### GET /api/scenic-tours

Get all scenic fly tours with optional filtering and sorting.

**Query Parameters:**
- `featured` (boolean) - Show only featured tours
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `duration` (number) - Filter by duration
- `sortBy` (string) - Sort by: `price`, `rating`, `duration`, `popular`

**Example:**
```bash
curl http://localhost:5000/api/scenic-tours?featured=true&sortBy=rating
```

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Volcano & Islands Explorer",
    "description": "Experience the raw power...",
    "duration": 90,
    "pricing": {
      "perPerson": 25000,
      "currency": "VUV",
      "groupDiscount": {
        "minimumPeople": 4,
        "discountPercentage": 10
      }
    },
    "rating": 4.9,
    "reviewCount": 127,
    "isFeatured": true
  }
]
```

### GET /api/scenic-tours/:id

Get detailed information about a specific tour.

**Example:**
```bash
curl http://localhost:5000/api/scenic-tours/67734a1b2c3d4e5f6a7b8c9d
```

### GET /api/scenic-tours/:id/availability

Check tour availability for a specific date.

**Query Parameters:**
- `date` (string) - Date in YYYY-MM-DD format

**Example:**
```bash
curl "http://localhost:5000/api/scenic-tours/67734a1b2c3d4e5f6a7b8c9d/availability?date=2025-12-30"
```

**Response:**
```json
{
  "available": true,
  "timeSlots": [
    { "departureTime": "07:00", "availableSeats": 5 },
    { "departureTime": "10:00", "availableSeats": 5 },
    { "departureTime": "14:00", "availableSeats": 5 }
  ],
  "weatherDependent": true
}
```

### POST /api/scenic-tours (Admin Only)

Create a new scenic fly tour.

**Headers:**
- `Authorization: Bearer {admin_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Sunset Volcano Tour",
  "description": "Beautiful sunset flight over Mt. Yasur",
  "duration": 45,
  "route": {
    "departure": {
      "location": "Tanna Airport",
      "coordinates": { "lat": -19.4553, "lng": 169.2234 }
    },
    "highlights": [
      {
        "name": "Mt. Yasur",
        "description": "Active volcano at sunset",
        "timeOverLocation": 15
      }
    ],
    "return": {
      "location": "Tanna Airport",
      "coordinates": { "lat": -19.4553, "lng": 169.2234 }
    }
  },
  "aircraft": {
    "type": "Single Engine",
    "model": "Cessna 172",
    "capacity": 3,
    "features": ["Panoramic windows", "Air conditioning"]
  },
  "pricing": {
    "perPerson": 20000,
    "currency": "VUV"
  },
  "schedule": {
    "availableDays": [0, 1, 2, 3, 4, 5, 6],
    "timeSlots": [
      { "departureTime": "17:00", "availableSeats": 3 }
    ]
  },
  "includes": ["Pilot commentary", "Refreshments"],
  "requirements": {
    "minimumAge": 8,
    "weatherDependent": true
  },
  "isActive": true,
  "isFeatured": false
}
```

### PUT /api/scenic-tours/:id (Admin Only)

Update an existing tour.

**Headers:**
- `Authorization: Bearer {admin_token}`
- `Content-Type: application/json`

### DELETE /api/scenic-tours/:id (Admin Only)

Delete a tour.

**Headers:**
- `Authorization: Bearer {admin_token}`

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── ScenicFlyTour.ts          # Tour data model
│   ├── routes/
│   │   └── scenicTours.ts            # API endpoints
│   ├── scripts/
│   │   └── seedScenicTours.ts        # Database seeding
│   └── server.ts                      # Route registration

frontend/
├── src/
│   ├── pages/
│   │   ├── ScenicFlyTours.tsx        # Tours listing
│   │   ├── ScenicFlyTourDetails.tsx  # Tour details
│   │   └── Home.tsx                   # Homepage (updated)
│   ├── components/
│   │   └── Navbar.tsx                 # Navigation (updated)
│   └── App.tsx                        # Routes (updated)
```

---

## Usage Examples

### Customer Journey

1. **Discover Tours**
   - Visit homepage or click "✈️ Scenic Tours" in navigation
   - Browse featured tours on homepage
   - Click "View All Scenic Tours"

2. **Explore Options**
   - View all available tours
   - Filter by featured tours
   - Sort by price, rating, duration, or popularity
   - Click on a tour card to see details

3. **View Tour Details**
   - See complete tour information
   - Review flight route and highlights
   - Check aircraft specifications
   - Read safety information and requirements
   - Review cancellation policy

4. **Calculate Price**
   - Select number of passengers
   - See automatic group discount applied
   - View total price in sidebar

5. **Book Tour**
   - Click "Book Now" button
   - Login if not authenticated
   - Complete booking process

### Admin Operations

#### Add New Tour
```javascript
// Login as admin
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@vanuatu.com',
    password: 'admin123'
  })
});
const { token } = await response.json();

// Create tour
await fetch('http://localhost:5000/api/scenic-tours', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(tourData)
});
```

#### Update Tour Pricing
```javascript
await fetch(`http://localhost:5000/api/scenic-tours/${tourId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    'pricing.perPerson': 22000,
    'pricing.groupDiscount': {
      minimumPeople: 5,
      discountPercentage: 15
    }
  })
});
```

---

## Configuration

### Environment Variables

No additional environment variables required. Uses existing:

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/vanuatu-booking
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:5000
```

### Database Indexes

The model automatically creates these indexes for performance:
- Text index on `name` and `description`
- Compound index on `isActive`, `isFeatured`, `rating`
- Index on `pricing.perPerson`

---

## Testing

### Manual Testing Checklist

**Frontend:**
- [ ] Homepage displays scenic tours section
- [ ] Navigation shows "✈️ Scenic Tours" link
- [ ] All tours page loads correctly
- [ ] Featured filter works
- [ ] Sort options work (price, rating, duration, popularity)
- [ ] Tour cards display properly
- [ ] Click on tour card navigates to details
- [ ] Tour details page shows all information
- [ ] Image gallery works
- [ ] Flight route displays correctly
- [ ] Price calculator updates dynamically
- [ ] Group discount shows when applicable
- [ ] Book button works (redirects to login if needed)

**Backend:**
- [ ] GET /api/scenic-tours returns tours
- [ ] Filter by featured works
- [ ] Sorting works correctly
- [ ] GET /api/scenic-tours/:id returns tour details
- [ ] Availability check works
- [ ] Admin can create tours
- [ ] Admin can update tours
- [ ] Admin can delete tours
- [ ] Non-admin cannot modify tours

### Test Scenarios

#### Scenario 1: Browse and View Tours
1. Visit http://localhost:3000
2. Scroll to scenic tours section
3. Click "View All Scenic Tours"
4. Verify 3 tours are displayed
5. Click featured filter
6. Change sort to "Lowest Price"
7. Click on "Blue Lagoon & Coral Reefs"
8. Verify tour details load

#### Scenario 2: Price Calculator
1. On tour details page
2. Change passengers to 4
3. Verify group discount appears
4. Verify total price updates
5. Change passengers to 1
6. Verify discount disappears

#### Scenario 3: Availability Check
1. Use API or browser console
2. Check availability for next week
3. Verify time slots returned
4. Check for Monday vs Sunday
5. Verify day-specific availability

---

## Troubleshooting

### Tours Not Displaying

**Problem**: No tours showing on the page

**Solutions:**
1. Verify backend is running: `http://localhost:5000/health`
2. Check database has tours: `npx ts-node src/scripts/seedScenicTours.ts`
3. Check browser console for errors
4. Verify API endpoint: `http://localhost:5000/api/scenic-tours`

### Images Not Loading

**Problem**: Tour images showing broken

**Solutions:**
1. Check internet connection (images from Unsplash)
2. Verify image URLs in database
3. Check browser console for CORS errors
4. Ensure Content Security Policy allows external images

### Booking Button Not Working

**Problem**: Book button doesn't respond

**Solutions:**
1. Check if user is logged in
2. Verify authentication state in browser
3. Check console for JavaScript errors
4. Ensure React Router is configured correctly

### Availability Check Fails

**Problem**: Availability endpoint returns error

**Solutions:**
1. Verify date format is YYYY-MM-DD
2. Check tour ID is valid
3. Verify backend server is running
4. Check MongoDB connection

---

## Performance Tips

### Frontend Optimization
- Images are optimized via Unsplash CDN
- Lazy loading implemented for tour cards
- React components are memoized where appropriate
- API calls are efficiently batched

### Backend Optimization
- Database indexes for fast queries
- Efficient MongoDB queries with projection
- Rate limiting implemented
- Response caching ready (can add Redis)

### Recommended Enhancements
1. Add pagination for tours list
2. Implement image lazy loading library
3. Add service worker for offline support
4. Cache featured tours for faster load
5. Optimize images for mobile devices

---

## Security

### Authentication
- Admin routes protected with JWT middleware
- Role-based access control (RBAC)
- Token expiration handled

### Data Validation
- Input sanitization on all endpoints
- Mongoose schema validation
- XSS protection
- SQL injection prevention (NoSQL)

### Best Practices
- Passwords hashed with bcrypt
- Sensitive data not exposed in API
- CORS properly configured
- Rate limiting on API endpoints

---

## Support

### Documentation
- **Full Documentation**: [SCENIC_FLY_TOURS_DOCUMENTATION.md](SCENIC_FLY_TOURS_DOCUMENTATION.md)
- **Main README**: [README.md](README.md)
- **API Docs**: http://localhost:5000/api-docs (Swagger)

### Common Questions

**Q: How do I add more tours?**
A: Use the POST /api/scenic-tours endpoint with admin credentials, or add to seedScenicTours.ts

**Q: Can I customize tour images?**
A: Yes, update the `images` array in the tour document with your image URLs

**Q: How do discounts work?**
A: Group discounts apply automatically when passenger count meets minimum. Child discounts are percentage-based.

**Q: What about seasonal tours?**
A: Set `seasonalAvailability` with `startMonth` and `endMonth` to restrict availability

**Q: Can tours be weather-dependent?**
A: Yes, set `requirements.weatherDependent` to true to show weather warnings

---

## Future Roadmap

### Planned Features
- [ ] Complete booking integration
- [ ] Real-time seat availability
- [ ] Weather API integration
- [ ] GPS flight tracking
- [ ] Photo packages
- [ ] Video recording options
- [ ] Gift vouchers
- [ ] Customer reviews and ratings
- [ ] Multi-language support
- [ ] Virtual tour previews

### Enhancement Ideas
- Custom route builder
- Charter service booking
- Corporate packages
- Wedding flights
- Photography workshops
- Educational tours
- VIP premium services
- Loyalty rewards program

---

## Contributing

### Adding New Tours

1. Create tour data object following the schema
2. Add to `seedScenicTours.ts` or use API
3. Include high-quality images
4. Provide detailed route information
5. Set appropriate pricing and discounts
6. Configure schedule and availability
7. Add comprehensive safety information

### Modifying Existing Features

1. Update model if schema changes needed
2. Update API routes for new endpoints
3. Update frontend components
4. Test thoroughly
5. Update documentation
6. Commit with clear message

---

## License

This feature is part of the Vanuatu Booking System.  
© 2025 Innovation Hub Solution. All rights reserved.

---

## Quick Links

- **Backend API**: http://localhost:5000/api/scenic-tours
- **Frontend**: http://localhost:3000/scenic-tours
- **Swagger Docs**: http://localhost:5000/api-docs
- **GitHub Repo**: [InnovationHubSolution/Booking_System](https://github.com/InnovationHubSolution/Booking_System)

---

**Last Updated**: December 29, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

## Need Help?

Contact the development team or open an issue in the GitHub repository.

Happy Flying! 🛩️✨
