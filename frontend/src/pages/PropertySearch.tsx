import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Map from '../components/Map';
import { useCurrencyStore } from '../store/currencyStore';

interface Property {
    _id: string;
    name: string;
    description: string;
    propertyType: string;
    address: {
        city: string;
        state: string;
        coordinates: { lat: number; lng: number };
    };
    images: string[];
    rating: number;
    reviewCount: number;
    rooms: Array<{
        type: string;
        pricePerNight: number;
        maxGuests: number;
    }>;
    amenities: string[];
    featured: boolean;
}

export default function PropertySearch() {
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrencyStore();
    const [showMap, setShowMap] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filters, setFilters] = useState({
        destination: '',
        minPrice: 0,
        maxPrice: 10000,
        rating: 0,
        amenities: [] as string[],
        propertyType: searchParams.get('type') || '',
        sortBy: 'recommended'
    });

    useEffect(() => {
        searchProperties();
    }, [filters.sortBy, filters.rating, filters.propertyType]);

    // Update property type filter from URL params
    useEffect(() => {
        const type = searchParams.get('type');
        if (type) {
            setFilters(prev => ({ ...prev, propertyType: type }));
        }
    }, [searchParams]);

    const searchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.destination) params.append('destination', filters.destination);
            if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.rating) params.append('rating', filters.rating.toString());
            if (filters.propertyType) params.append('propertyType', filters.propertyType);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            params.append('limit', '20');

            const response = await api.get(`/properties/search?${params.toString()}`);
            const propertiesData = response.data?.properties || response.data || [];
            setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        } catch (error) {
            console.error('Error searching properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 9) return 'Superb';
        if (rating >= 8) return 'Very Good';
        if (rating >= 7) return 'Good';
        if (rating >= 6) return 'Pleasant';
        return 'Rated';
    };

    const markers = properties
        .filter(property =>
            property.address?.coordinates?.lat &&
            property.address?.coordinates?.lng &&
            typeof property.address.coordinates.lat === 'number' &&
            typeof property.address.coordinates.lng === 'number' &&
            !isNaN(property.address.coordinates.lat) &&
            !isNaN(property.address.coordinates.lng)
        )
        .map(property => ({
            position: [property.address.coordinates.lat, property.address.coordinates.lng] as [number, number],
            popup: `
                <div class="text-center">
                    <img src="${property.images[0]}" alt="${property.name}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
                    <h3 class="font-bold text-lg">${property.name}</h3>
                    <p class="text-gray-600">${property.address.city}</p>
                    <p class="text-blue-600 font-semibold">$${property.rooms[0]?.pricePerNight}/night</p>
                    <p class="text-yellow-500">★ ${property.rating.toFixed(1)}</p>
                    <a href="/property/${property._id}" class="text-blue-500 hover:underline">View Details</a>
                </div>
            `,
        }));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-blue-600 text-white py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Tanna Island"
                            className="flex-1 px-4 py-2 rounded text-gray-900"
                            value={filters.destination}
                            onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                        />
                        <button
                            onClick={searchProperties}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-2 rounded font-bold"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="text-sm text-gray-600">
                        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
                        <span className="mx-2">›</span>
                        <Link to="/properties" className="text-blue-600 hover:underline">Vanuatu</Link>
                        <span className="mx-2">›</span>
                        <span className="text-blue-600 hover:underline">Tanna</span>
                        <span className="mx-2">›</span>
                        <span className="text-blue-600 hover:underline">Tanna Island</span>
                        <span className="mx-2">›</span>
                        <span>Search results</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Filters */}
                    <div className="w-80 flex-shrink-0">
                        {/* Map Section */}
                        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border-2 border-blue-500">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">Map View</h3>
                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${showMap
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {showMap ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Hide Map
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            Show Map
                                        </>
                                    )}
                                </button>
                            </div>
                            {showMap && (
                                <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                                    <Map
                                        center={[-17.7334, 168.3273]}
                                        zoom={10}
                                        markers={markers}
                                        style={{ height: '100%', width: '100%' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Filter by Section */}
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-4">Filter by:</h3>

                            {/* Budget Slider */}
                            <div className="mb-6 pb-6 border-b">
                                <h4 className="font-semibold mb-3">Your budget (per night)</h4>
                                <div className="text-sm text-gray-600 mb-2">
                                    VUV {filters.minPrice.toLocaleString()} – VUV {filters.maxPrice.toLocaleString()}+
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20000"
                                    step="1000"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                    className="w-full accent-blue-600"
                                />
                            </div>

                            {/* Popular Filters */}
                            <div className="mb-6 pb-6 border-b">
                                <h4 className="font-semibold mb-3">Popular filters</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.rating >= 8}
                                                onChange={(e) => setFilters({ ...filters, rating: e.target.checked ? 8 : 0 })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">Very Good: 8+</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">4</span>
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" />
                                            <span className="text-sm">Based on guest reviews</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">11</span>
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" />
                                            <span className="text-sm">Breakfast included</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">11</span>
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.propertyType === 'villa'}
                                                onChange={(e) => setFilters({ ...filters, propertyType: e.target.checked ? 'villa' : '' })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">Vacation Homes</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">1</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="bg-white rounded-lg p-4 mb-4 border-4 border-yellow-400">
                            <div className="flex items-center justify-between mb-3">
                                <h1 className="text-2xl font-bold">
                                    Tanna Island: {properties.length} properties found
                                </h1>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-1 rounded border ${viewMode === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'}`}
                                    >
                                        List
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1 rounded border ${viewMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'}`}
                                    >
                                        Grid
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Sort by:</span>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="border rounded px-3 py-1.5 text-sm font-medium"
                                >
                                    <option value="recommended">Our top picks</option>
                                    <option value="price-low">Price (lowest first)</option>
                                    <option value="price-high">Price (highest first)</option>
                                    <option value="rating">Guest rating</option>
                                </select>
                            </div>
                        </div>

                        {/* Property Listings */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {properties.map((property) => (
                                    <div key={property._id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
                                        <div className="flex">
                                            {/* Property Image */}
                                            <div className="w-80 h-64 relative flex-shrink-0">
                                                <img
                                                    src={property.images[0]}
                                                    alt={property.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 shadow">
                                                    ♡
                                                </button>
                                            </div>

                                            {/* Property Details */}
                                            <div className="flex-1 p-4 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <Link to={`/property/${property._id}`} className="hover:underline">
                                                            <h3 className="text-xl font-bold text-blue-600 mb-1">{property.name}</h3>
                                                        </Link>
                                                        {property.featured && (
                                                            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                                                                Genius
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                                                                📍 {property.address.city}
                                                            </span>
                                                            <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                                                                · Show on map
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                20.2 km from downtown
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Deal Badge */}
                                                <div className="mt-3">
                                                    <div className="bg-green-50 border border-green-300 rounded px-3 py-1.5 inline-block">
                                                        <span className="text-green-700 font-semibold text-sm">Late Escape Deal</span>
                                                    </div>
                                                </div>

                                                {/* Room Type */}
                                                <div className="flex-1 mt-3">
                                                    <h4 className="font-semibold mb-1">
                                                        {property.rooms[0]?.type || 'Bungalow with Private Bathroom'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        2 beds (1 twin, 1 queen)
                                                    </p>
                                                    <p className="text-red-600 text-xs mt-2 font-medium">
                                                        Only 4 rooms left at this price on our site
                                                    </p>
                                                </div>

                                                {/* Bottom Section */}
                                                <div className="flex justify-between items-end mt-auto pt-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-blue-600 text-white px-2 py-1.5 rounded-tr-lg rounded-br-lg rounded-tl-lg font-bold text-sm">
                                                            {property.rating.toFixed(1)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm">{getRatingLabel(property.rating)}</div>
                                                            <div className="text-xs text-gray-600">{property.reviewCount} reviews</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-600 mb-1">2 nights, 2 adults</div>
                                                        <div className="text-sm text-gray-500 line-through">
                                                            VUV {(property.rooms[0]?.pricePerNight * 2.4).toLocaleString()}
                                                        </div>
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {formatPrice(property.rooms[0]?.pricePerNight * 2 || 0, false)}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mb-3">Includes taxes and fees</div>
                                                        <Link
                                                            to={`/property/${property._id}`}
                                                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-semibold text-center"
                                                        >
                                                            See availability →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* More Properties Section */}
                        {!loading && properties.length > 0 && (
                            <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">More properties you might like</h2>
                                    <button className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">Properties similar to {properties[0]?.name}</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {properties.slice(1, 4).map((property) => (
                                        <Link
                                            key={property._id}
                                            to={`/property/${property._id}`}
                                            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={property.images[0]}
                                                    alt={property.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <button className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow">
                                                    ♡
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-semibold text-sm mb-2">{property.name}</h3>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                                        {property.rating.toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-600">{property.reviewCount} reviews</span>
                                                </div>
                                                <div className="text-lg font-bold">
                                                    {formatPrice(property.rooms[0]?.pricePerNight || 0, false)}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
