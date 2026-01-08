// Vanuatu Map Configuration
// Restricts map to Vanuatu for faster loading, better UX, and compliance

export const VANUATU_CONFIG = {
    // Center of Vanuatu
    center: {
        lat: -17.7334,
        lng: 168.3273
    },

    // Default zoom level
    defaultZoom: 9,

    // Minimum zoom (prevent zooming out too far)
    minZoom: 7,

    // Maximum zoom
    maxZoom: 18,

    // Map bounds - restricts panning to Vanuatu region
    bounds: {
        north: -13.0,      // Northernmost point
        south: -20.5,      // Southernmost point
        east: 170.5,       // Easternmost point
        west: 166.0        // Westernmost point
    },

    // Country code for autocomplete restriction
    countryCode: 'VU',

    // Map styles options
    styles: [
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#1e90ff' }]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
        }
    ]
};

// Google Maps libraries to load
export const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing")[] = ["places", "geometry"];

// Map options with Vanuatu restrictions
export const getMapOptions = () => ({
    center: VANUATU_CONFIG.center,
    zoom: VANUATU_CONFIG.defaultZoom,
    minZoom: VANUATU_CONFIG.minZoom,
    maxZoom: VANUATU_CONFIG.maxZoom,
    restriction: {
        latLngBounds: {
            north: VANUATU_CONFIG.bounds.north,
            south: VANUATU_CONFIG.bounds.south,
            east: VANUATU_CONFIG.bounds.east,
            west: VANUATU_CONFIG.bounds.west,
        },
        strictBounds: true, // Prevents panning outside bounds
    },
    gestureHandling: 'greedy', // Better mobile experience
    streetViewControl: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
        position: 3, // TOP_RIGHT
    },
    zoomControl: true,
    zoomControlOptions: {
        position: 7, // RIGHT_CENTER
    },
    fullscreenControl: true,
});

// Autocomplete options restricted to Vanuatu
export const getAutocompleteOptions = () => ({
    componentRestrictions: { country: 'vu' }, // ISO 3166-1 Alpha-2 code for Vanuatu
    fields: ['address_components', 'geometry', 'name', 'formatted_address'],
    types: ['establishment', 'geocode'], // Hotels, landmarks, addresses
});

// Geocoding bias towards Vanuatu
export const getGeocodingBias = () => ({
    bounds: {
        northeast: {
            lat: VANUATU_CONFIG.bounds.north,
            lng: VANUATU_CONFIG.bounds.east,
        },
        southwest: {
            lat: VANUATU_CONFIG.bounds.south,
            lng: VANUATU_CONFIG.bounds.west,
        },
    },
    componentRestrictions: {
        country: 'VU',
    },
});
