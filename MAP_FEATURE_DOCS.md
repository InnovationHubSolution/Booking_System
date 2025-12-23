# Map Feature Documentation

## Overview
The Vanuatu Booking System now includes comprehensive interactive map functionality powered by Leaflet and React-Leaflet.

## Features

### 1. **Map View Page** (`/map`)
- Interactive full-screen map showing all properties and services
- Toggle between property and service markers
- Adjustable search radius (10km - 200km)
- Real-time marker updates based on filters
- Click markers to navigate to property/service details
- Statistics dashboard showing totals
- Legend explaining marker colors

### 2. **Property Details Map**
- Each property details page includes an embedded map
- Shows exact property location
- Interactive popup with property info
- Price and rating display in popup

### 3. **Custom Markers**
- **Blue markers**: Properties/Hotels
- **Green markers**: Services/Experiences
- **Red markers**: Selected/Active items
- Teardrop-shaped markers with white center dot
- Hover effects and click interactions

## Components

### Map Component (`frontend/src/components/Map.tsx`)
Main reusable map component with the following props:

```typescript
interface MapProps {
  center: [number, number];        // [latitude, longitude]
  zoom?: number;                   // Default: 13
  markers?: Array<{
    id: string;
    position: [number, number];    // [latitude, longitude]
    title: string;
    type?: 'property' | 'service';
    price?: number;
    rating?: number;
    imageUrl?: string;
    onClick?: () => void;
  }>;
  style?: React.CSSProperties;
  onMapClick?: (lat: number, lng: number) => void;
}
```

**Features:**
- Custom teardrop markers with color coding
- Image preview in popups
- Price and rating display
- Auto-centering on coordinate changes
- OpenStreetMap tile layer
- Click handlers for navigation

### PropertyMap Component (`frontend/src/components/PropertyMap.tsx`)
Simplified component for displaying a single property location:

```typescript
interface PropertyMapProps {
  coordinates: [number, number];   // [longitude, latitude]
  propertyName: string;
  price?: number;
  rating?: number;
  imageUrl?: string;
  style?: React.CSSProperties;
}
```

### MapView Page (`frontend/src/pages/MapView.tsx`)
Full-featured map exploration page with:
- Property/Service filter toggles
- Search radius selector
- Center on Vanuatu button
- Results counter
- Statistics cards
- Automatic data fetching based on map center and radius

## Usage Examples

### Basic Map
```tsx
import Map from '../components/Map';

<Map
  center={[-17.7334, 168.3273]}  // Vanuatu coordinates
  zoom={10}
  markers={[
    {
      id: '1',
      position: [-17.7334, 168.3273],
      title: 'Beach Resort',
      type: 'property',
      price: 150,
      rating: 4.5,
      imageUrl: 'https://...',
      onClick: () => navigate('/property/1')
    }
  ]}
/>
```

### Property Location Map
```tsx
import PropertyMap from '../components/PropertyMap';

<PropertyMap
  coordinates={[168.3273, -17.7334]}  // [lng, lat]
  propertyName="Sunset Villa"
  price={200}
  rating={4.8}
  imageUrl="https://..."
/>
```

## API Integration

### Property Search with Geolocation
The `/api/properties/search` endpoint supports geolocation filtering:

```javascript
GET /api/properties/search?latitude=-17.7334&longitude=168.3273&radius=50
```

Parameters:
- `latitude`: Center point latitude
- `longitude`: Center point longitude
- `radius`: Search radius in kilometers

### Backend Support
Properties and services must have location data in this format:

```javascript
{
  location: {
    coordinates: [longitude, latitude],  // GeoJSON format
    address: "123 Main St",
    city: "Port Vila"
  }
}
```

## Navigation

### Navbar Integration
The map view is accessible from the main navigation:
- Desktop: "🗺️ Map" link in top navbar
- Mobile: Available in hamburger menu

### Routes
```tsx
<Route path="/map" element={<MapView />} />
```

## Styling

### Custom Marker Styles
Markers use inline CSS for teardrop shape:
- Border-radius: `50% 50% 50% 0`
- Rotation: `-45deg` for teardrop effect
- White border and shadow for depth
- Color-coded by type

### Map Container Styles
- Rounded corners with `rounded-lg`
- Shadow effects with `shadow-lg`
- Responsive height (default 500px, adjustable)
- Full width by default

## Dependencies

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.21"
}
```

## Configuration

### CDN Resources
Default marker icons loaded from CDN:
```javascript
iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png'
iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png'
shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
```

### Tile Provider
Uses OpenStreetMap tiles (free, no API key required):
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Best Practices

1. **Coordinate Format**
   - Backend stores: `[longitude, latitude]` (GeoJSON standard)
   - Leaflet expects: `[latitude, longitude]`
   - Always convert when passing to map components

2. **Performance**
   - Limit markers displayed (paginate or cluster for large datasets)
   - Use appropriate zoom levels
   - Debounce map move events for search

3. **User Experience**
   - Show loading states while fetching data
   - Provide clear marker legends
   - Enable zoom controls
   - Make popups informative with images and pricing

4. **Accessibility**
   - Provide text alternatives for map content
   - Ensure keyboard navigation works
   - Include location addresses as text

## Future Enhancements

Potential improvements:
1. Marker clustering for dense areas
2. Heat maps for popular regions
3. Drawing tools for custom search areas
4. Saved locations and favorites
5. Offline map support
6. Street view integration
7. Distance calculations between points
8. Route planning for multi-stop trips

## Troubleshooting

### Markers Not Showing
- Check coordinate format (lat/lng order)
- Verify data has valid coordinates
- Check zoom level is appropriate
- Ensure markers array is populated

### Map Not Rendering
- Verify Leaflet CSS is imported
- Check CDN URLs for marker icons
- Ensure container has height set
- Check browser console for errors

### Performance Issues
- Reduce number of markers
- Implement marker clustering
- Use appropriate tile zoom levels
- Optimize image sizes in popups
