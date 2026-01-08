# 🗺️ Google Maps Integration - Vanuatu Restricted

## Why Restrict Maps to Vanuatu?

### ✅ Strategic Benefits

1. **No Accidental Overseas Searches**
   - Users can't search for properties/services outside Vanuatu
   - Maintains focus on the national market
   - Reduces confusion and support requests

2. **Faster Loading Times**
   - Critical for Vanuatu's connectivity challenges
   - Smaller map tiles to download
   - Restricted bounds = faster rendering
   - Better mobile experience

3. **Clear National Focus**
   - Tourism within Vanuatu
   - Local transport and hotels
   - Regional services only
   - Professional regional platform image

4. **Cleaner UX, Less Clutter**
   - No irrelevant global data
   - Focused search results
   - Better marker visibility
   - Simplified user experience

5. **Easier Compliance & Data Control**
   - Know exact geographic coverage
   - Simpler data validation
   - Better regulatory compliance
   - Controlled business scope

---

## 🔧 Implementation

### Configuration File: `src/config/maps.ts`

**Vanuatu Map Boundaries:**
```typescript
bounds: {
    north: -13.0,      // Northernmost point
    south: -20.5,      // Southernmost point
    east: 170.5,       // Easternmost point
    west: 166.0        // Westernmost point
}
```

**Zoom Restrictions:**
- **Default Zoom:** 9 (perfect overview of islands)
- **Min Zoom:** 7 (prevents zooming out too far)
- **Max Zoom:** 18 (street-level detail)

**Country Code:** `VU` (ISO 3166-1 Alpha-2)

---

## 📦 Components Created

### 1. **VanuatuMap.tsx**
Main map component with Vanuatu restrictions built-in.

```tsx
import VanuatuMap from './components/VanuatuMap';

<VanuatuMap
    center={{ lat: -17.7334, lng: 168.3273 }}
    zoom={10}
    markers={markers}
    style={{ height: '400px', width: '100%' }}
/>
```

### 2. **GoogleMapsProvider.tsx**
Wraps the entire app to load Google Maps once.

```tsx
import GoogleMapsProvider from './components/GoogleMapsProvider';

<GoogleMapsProvider>
    <App />
</GoogleMapsProvider>
```

### 3. **VanuatuPlacesAutocomplete.tsx**
Location search restricted to Vanuatu only.

```tsx
import VanuatuPlacesAutocomplete from './components/VanuatuPlacesAutocomplete';

<VanuatuPlacesAutocomplete
    onPlaceSelected={(place) => {
        console.log('Selected:', place);
    }}
    placeholder="Search locations in Vanuatu..."
/>
```

**Features:**
- ✅ Auto-validates location is in Vanuatu
- ✅ Rejects overseas locations
- ✅ Shows alert if user tries to select outside VU
- ✅ Clears input on invalid selection

### 4. **Map.tsx (Legacy Wrapper)**
Maintains backward compatibility with existing code.

Automatically converts old Leaflet-style props to Google Maps format.

---

## 🔑 Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Create API key (Credentials → Create Credentials → API Key)
5. **Restrict the key** (for security):
   - Application restrictions: HTTP referrers
   - Add your domain: `http://localhost:3001/*` (dev)
   - Add your domain: `https://yourdomain.com/*` (prod)
   - API restrictions: Select specific APIs above

### Step 2: Add API Key to Environment

Edit `frontend/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC_your_actual_api_key_here
VITE_API_BASE_URL=http://localhost:5000/api
```

**⚠️ Security Note:**
- Never commit `.env` to Git
- Use different keys for dev/staging/prod
- Enable billing alerts in Google Cloud
- Set usage quotas to prevent unexpected charges

### Step 3: Restart Frontend

```bash
cd frontend
npm run dev
```

---

## 📊 Map Restrictions In Action

### Strict Bounds Enforcement

```typescript
restriction: {
    latLngBounds: {
        north: -13.0,
        south: -20.5,
        east: 170.5,
        west: 166.0,
    },
    strictBounds: true, // Cannot pan outside Vanuatu
}
```

**What This Does:**
- Users physically cannot drag the map outside Vanuatu
- Attempts to pan away will "bounce back"
- Search results automatically filtered to VU

### Autocomplete Country Filter

```typescript
componentRestrictions: { 
    country: 'vu' // Only Vanuatu locations
}
```

**What This Does:**
- Search suggestions only show Vanuatu locations
- Airports, hotels, landmarks - all within VU
- Invalid selections are rejected with alert

---

## 🎯 Use Cases

### Property Search
```tsx
<VanuatuPlacesAutocomplete
    onPlaceSelected={(place) => {
        const location = place.geometry?.location;
        if (location) {
            setSearchCenter({
                lat: location.lat(),
                lng: location.lng()
            });
        }
    }}
/>
```

### Property Details Page
```tsx
<VanuatuMap
    center={{ lat: property.lat, lng: property.lng }}
    zoom={15}
    markers={[{
        position: { lat: property.lat, lng: property.lng },
        info: `<h3>${property.name}</h3><p>$${property.price}/night</p>`
    }]}
/>
```

### Flight Routes (within Vanuatu)
```tsx
<VanuatuMap
    markers={[
        { position: departureCoords, info: 'Departure: Port Vila' },
        { position: arrivalCoords, info: 'Arrival: Luganville' }
    ]}
    polyline={[departureCoords, arrivalCoords]}
/>
```

---

## 🚀 Migration from Leaflet

**Old Code (Leaflet):**
```tsx
<MapContainer center={[-17.7334, 168.3273]} zoom={10}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[-17.7334, 168.3273]}>
        <Popup>Port Vila</Popup>
    </Marker>
</MapContainer>
```

**New Code (Google Maps with restrictions):**
```tsx
<VanuatuMap
    center={{ lat: -17.7334, lng: 168.3273 }}
    zoom={10}
    markers={[{
        position: { lat: -17.7334, lng: 168.3273 },
        info: 'Port Vila'
    }]}
/>
```

**Changes:**
- ✅ `[lat, lng]` → `{ lat, lng }`
- ✅ No TileLayer needed (Google handles it)
- ✅ Popup becomes `info` property
- ✅ Automatic Vanuatu restrictions applied

---

## 💰 Cost Estimation (Google Maps)

### Free Tier (Monthly):
- **Map Loads:** $200 free credit (~28,000 loads)
- **Places Autocomplete:** ~2,800 requests free
- **Geocoding:** ~40,000 requests free

### Typical Usage (500 users/month):
- Map views: ~10,000 loads = $70
- Searches: ~1,000 autocomplete = $11
- **Total:** ~$81/month

**Cost Optimization:**
- Implement client-side caching
- Use map load restrictions
- Set daily quotas in Google Cloud
- Monitor usage dashboard

---

## 🔒 Security Best Practices

### 1. API Key Restrictions
```
Application Restrictions:
✓ HTTP referrers (websites)
  https://yourdomain.com/*
  http://localhost:3001/* (dev only)

API Restrictions:
✓ Maps JavaScript API
✓ Places API
✓ Geocoding API
```

### 2. Environment Variables
```bash
# Never commit this file
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 3. Rate Limiting (Backend)
Implement API rate limiting for geocoding requests from your server.

### 4. Client-Side Validation
```tsx
// Always validate coordinates are in Vanuatu
const isInVanuatu = (lat: number, lng: number) => {
    return lat >= -20.5 && lat <= -13.0 &&
           lng >= 166.0 && lng <= 170.5;
};
```

---

## 📈 Performance Tips

### 1. Lazy Load Maps
```tsx
// Only load map when user scrolls to it
import { lazy, Suspense } from 'react';

const VanuatuMap = lazy(() => import('./components/VanuatuMap'));

<Suspense fallback={<div>Loading map...</div>}>
    <VanuatuMap {...props} />
</Suspense>
```

### 2. Marker Clustering (many markers)
```bash
npm install @googlemaps/markerclusterer
```

### 3. Cache Geocoding Results
```tsx
// Store location lookups in localStorage
const cachedGeocode = localStorage.getItem(`geo_${address}`);
```

---

## 🎉 What You Get

✅ **Google Maps UI** - Professional, familiar interface  
✅ **Vanuatu-Only** - Cannot search or pan outside VU  
✅ **Places Autocomplete** - Hotels, airports, landmarks (VU only)  
✅ **Street View** - Available where Google has coverage  
✅ **Satellite View** - Toggle between map/satellite  
✅ **Mobile Optimized** - Touch-friendly gestures  
✅ **Fast Loading** - Restricted bounds = smaller tiles  
✅ **Backward Compatible** - Old code still works  

---

## 📞 Support

### Common Issues

**"Map not loading"**
→ Check API key in `.env` file
→ Verify APIs are enabled in Google Cloud
→ Check browser console for errors

**"Places autocomplete not working"**
→ Ensure Places API is enabled
→ Check API key restrictions
→ Verify billing is enabled (required for Places API)

**"Map shows grey tiles"**
→ API key not valid
→ Check HTTP referrer restrictions
→ Billing account may be inactive

---

## 🌟 Next Steps

1. **Add your Google Maps API key** to `frontend/.env`
2. **Enable required APIs** in Google Cloud Console
3. **Set up billing** (required for production)
4. **Configure API restrictions** for security
5. **Test the map** on http://localhost:3001
6. **Monitor usage** in Google Cloud dashboard

Your booking system is now using **enterprise-grade** Google Maps with **smart Vanuatu restrictions**! 🚀
