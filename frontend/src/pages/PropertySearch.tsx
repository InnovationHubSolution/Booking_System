import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Map from '../components/Map';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

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
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrencyStore();
    const [filters, setFilters] = useState({
        destination: '',
        checkIn: '',
        checkOut: '',
        adults: 2,
        children: 0,
        minPrice: '',
        maxPrice: '',
        propertyType: '',
        amenities: [] as string[],
        rating: '',
        sortBy: 'featured'
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const amenitiesList = [
        'Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Beach Access',
        'Parking', 'Gym', 'Air Conditioning', 'Kitchen'
    ];

    const propertyTypes = ['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse'];

    useEffect(() => {
        searchProperties();
    }, [page, filters.sortBy]);

    const searchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== '') {
                    if (key === 'amenities') {
                        params.append(key, (value as string[]).join(','));
                    } else {
                        params.append(key, value.toString());
                    }
                }
            });
            params.append('page', page.toString());
            params.append('limit', '12');

            const response = await axios.get(`/properties/search?${params.toString()}`);
            setProperties(response.data.properties);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Error searching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        searchProperties();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Bar */}
            <div className="bg-gradient-to-r from-vanuatu-blue to-vanuatu-green text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold">Find Your Perfect Stay in Vanuatu</h1>
                        <CurrencySelector />
                    </div>
                    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <input
                                type="text"
                                placeholder="Where are you going?"
                                className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue"
                                value={filters.destination}
                                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                            />
                            <input
                                type="date"
                                className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue"
                                value={filters.checkIn}
                                onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                            />
                            <input
                                type="date"
                                className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue"
                                value={filters.checkOut}
                                onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Adults"
                                    className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue w-1/2"
                                    value={filters.adults}
                                    onChange={(e) => setFilters({ ...filters, adults: parseInt(e.target.value) })}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Children"
                                    className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue w-1/2"
                                    value={filters.children}
                                    onChange={(e) => setFilters({ ...filters, children: parseInt(e.target.value) })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-vanuatu-yellow hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h3 className="text-xl font-bold mb-4">Filters</h3>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="font-semibold mb-2 block">Price Per Night</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-1/2 px-3 py-2 border rounded"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-1/2 px-3 py-2 border rounded"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="mb-6">
                                <label className="font-semibold mb-2 block">Property Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded"
                                    value={filters.propertyType}
                                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                                >
                                    <option value="">All Types</option>
                                    {propertyTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rating */}
                            <div className="mb-6">
                                <label className="font-semibold mb-2 block">Minimum Rating</label>
                                <select
                                    className="w-full px-3 py-2 border rounded"
                                    value={filters.rating}
                                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                >
                                    <option value="">Any Rating</option>
                                    <option value="4.5">4.5+ Stars</option>
                                    <option value="4.0">4.0+ Stars</option>
                                    <option value="3.5">3.5+ Stars</option>
                                </select>
                            </div>

                            {/* Amenities */}
                            <div className="mb-6">
                                <label className="font-semibold mb-2 block">Amenities</label>
                                <div className="space-y-2">
                                    {amenitiesList.map(amenity => (
                                        <label key={amenity} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.amenities.includes(amenity)}
                                                onChange={() => toggleAmenity(amenity)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSearch}
                                className="w-full bg-vanuatu-blue text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {/* Sort Options */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                {!loading && `${properties.length} properties found`}
                            </p>
                            <select
                                className="px-4 py-2 border rounded-lg"
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            >
                                <option value="featured">Our Top Picks</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>

                        {/* Property Grid */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vanuatu-blue"></div>
                            </div>
                        ) : (
                            <>
                                {/* Map View */}
                                {properties.length > 0 && (
                                    <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                                        <Map
                                            center={[
                                                properties[0].address.coordinates.lat,
                                                properties[0].address.coordinates.lng
                                            ]}
                                            zoom={12}
                                            markers={properties.map(prop => ({
                                                position: [prop.address.coordinates.lat, prop.address.coordinates.lng],
                                                popup: `<strong>${prop.name}</strong><br/>$${Math.min(...prop.rooms.map(r => r.pricePerNight))} VUV/night`
                                            }))}
                                            style={{ height: '400px', width: '100%' }}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {properties.map((property) => (
                                        <Link
                                            key={property._id}
                                            to={`/property/${property._id}`}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                                        >
                                            <div className="relative h-48">
                                                <img
                                                    src={property.images[0] || 'https://via.placeholder.com/400'}
                                                    alt={property.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                />
                                                {property.featured && (
                                                    <span className="absolute top-2 left-2 bg-vanuatu-yellow text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2">{property.name}</h3>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    {property.address.city}, {property.address.state}
                                                </p>
                                                <div className="flex items-center mb-2">
                                                    <span className="text-vanuatu-yellow mr-1">★</span>
                                                    <span className="font-semibold">{property.rating.toFixed(1)}</span>
                                                    <span className="text-gray-500 text-sm ml-1">
                                                        ({property.reviewCount} reviews)
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {property.amenities.slice(0, 3).map((amenity, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-2xl font-bold text-vanuatu-blue">
                                                            {formatPrice(Math.min(...property.rooms.map(r => r.pricePerNight)), false)}
                                                        </span>
                                                        <span className="text-gray-600 text-sm"> /night</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 border rounded disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 border rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
