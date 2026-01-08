import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

interface TravelPackage {
    _id: string;
    name: string;
    description: string;
    images: string[];
    destination: string;
    destinationCoordinates?: {
        lat: number;
        lng: number;
    };
    duration: {
        days: number;
        nights: number;
    };
    includes: {
        flights: boolean;
        accommodation: boolean;
        transfers: boolean;
        tours: boolean;
        meals: string;
        carRental: boolean;
    };
    pricing: {
        basePrice: number;
        currency: string;
        discountPercentage?: number;
    };
    category: string;
    difficulty: string;
    highlights: string[];
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
}

const Packages = () => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const [packages, setPackages] = useState<TravelPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        maxPrice: '',
        minDuration: '',
        maxDuration: '',
        sortBy: 'featured'
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/packages/search', {
                params: filters
            });
            setPackages(response.data.packages || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
        setLoading(false);
    };

    const getDiscountedPrice = (pkg: TravelPackage) => {
        if (pkg.pricing.discountPercentage) {
            return pkg.pricing.basePrice * (1 - pkg.pricing.discountPercentage / 100);
        }
        return pkg.pricing.basePrice;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#004D7A] to-[#009E60] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">🌴 Travel Packages to Vanuatu</h1>
                            <p className="text-xl">Complete vacation packages with flights, hotels, tours & more!</p>
                        </div>
                        <CurrencySelector />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h3 className="font-bold text-lg mb-4">Filters</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                >
                                    <option value="">All Categories</option>
                                    <option value="adventure">Adventure</option>
                                    <option value="beach">Beach</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="luxury">Luxury</option>
                                    <option value="family">Family</option>
                                    <option value="honeymoon">Honeymoon</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Duration (days)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minDuration}
                                        onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                                        className="w-1/2 px-3 py-2 border rounded-lg"
                                        min="1"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxDuration}
                                        onChange={(e) => setFilters({ ...filters, maxDuration: e.target.value })}
                                        className="w-1/2 px-3 py-2 border rounded-lg"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Max Price (VUV)</label>
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                    placeholder="Any"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price">Price: Low to High</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="duration">Duration</option>
                                </select>
                            </div>

                            <button
                                onClick={fetchPackages}
                                className="w-full bg-[#004D7A] text-white py-2 rounded-lg hover:bg-[#003555] transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Packages Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D7A] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading packages...</p>
                            </div>
                        ) : packages.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600">No packages found</p>
                            </div>
                        ) : (
                            <>
                                {/* Destinations Map */}
                                <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-4">
                                        <h2 className="text-2xl font-bold mb-4">Package Destinations</h2>
                                        <Map
                                            center={[-17.7334, 168.3273]}
                                            zoom={10}
                                            markers={packages
                                                .filter(pkg =>
                                                    pkg.destinationCoordinates &&
                                                    typeof pkg.destinationCoordinates.lat === 'number' &&
                                                    typeof pkg.destinationCoordinates.lng === 'number' &&
                                                    !isNaN(pkg.destinationCoordinates.lat) &&
                                                    !isNaN(pkg.destinationCoordinates.lng)
                                                )
                                                .map(pkg => ({
                                                    position: [
                                                        pkg.destinationCoordinates!.lat,
                                                        pkg.destinationCoordinates!.lng
                                                    ],
                                                    popup: `<strong>${pkg.name}</strong><br/>${pkg.destination}<br/>${pkg.duration.days}D/${pkg.duration.nights}N - ${formatPrice(getDiscountedPrice(pkg), false)}`
                                                }))}
                                            style={{ height: '350px', width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {packages.map((pkg) => {
                                        const discountedPrice = getDiscountedPrice(pkg);
                                        const hasDiscount = pkg.pricing.discountPercentage && pkg.pricing.discountPercentage > 0;

                                        return (
                                            <div
                                                key={pkg._id}
                                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                                                onClick={() => navigate(`/package/${pkg._id}`)}
                                            >
                                                {/* Image */}
                                                <div className="relative">
                                                    <img
                                                        src={pkg.images[0] || 'https://via.placeholder.com/400x300'}
                                                        alt={pkg.name}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    {pkg.isFeatured && (
                                                        <div className="absolute top-2 left-2 bg-[#FFCE00] text-[#004D7A] px-3 py-1 rounded-full text-sm font-bold">
                                                            ⭐ FEATURED
                                                        </div>
                                                    )}
                                                    {hasDiscount && (
                                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                            {pkg.pricing.discountPercentage}% OFF
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                                                        {pkg.duration.days}D / {pkg.duration.nights}N
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="bg-[#009E60] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                                                            {pkg.category}
                                                        </span>
                                                        <div className="flex items-center">
                                                            <span className="text-[#FFCE00] text-lg">★</span>
                                                            <span className="ml-1 font-semibold">{pkg.rating}</span>
                                                            <span className="ml-1 text-sm text-gray-600">({pkg.reviewCount})</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>

                                                    {/* Includes Icons */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {pkg.includes.flights && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">✈️ Flights</span>
                                                        )}
                                                        {pkg.includes.accommodation && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🏨 Hotel</span>
                                                        )}
                                                        {pkg.includes.transfers && (
                                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">🚗 Transfers</span>
                                                        )}
                                                        {pkg.includes.tours && (
                                                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">🎯 Tours</span>
                                                        )}
                                                        {pkg.includes.meals !== 'none' && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🍽️ Meals</span>
                                                        )}
                                                    </div>

                                                    {/* Highlights */}
                                                    <div className="mb-3">
                                                        <ul className="text-sm text-gray-700 space-y-1">
                                                            {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                                                                <li key={idx} className="flex items-center">
                                                                    <span className="text-[#009E60] mr-2">✓</span>
                                                                    {highlight}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="border-t pt-3 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-600">From</p>
                                                            <div className="flex items-baseline">
                                                                {hasDiscount && (
                                                                    <span className="text-sm text-gray-400 line-through mr-2">
                                                                        {formatPrice(pkg.pricing.basePrice, false)}
                                                                    </span>
                                                                )}
                                                                <span className="text-2xl font-bold text-[#004D7A]">
                                                                    {formatPrice(Math.round(discountedPrice), false)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">per person</p>
                                                        </div>
                                                        <button className="bg-[#FFCE00] text-[#004D7A] px-6 py-2 rounded-lg font-semibold hover:bg-[#FFD700] transition">
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Packages;
