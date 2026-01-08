import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

interface ScenicFlyTour {
    _id: string;
    name: string;
    description: string;
    images: string[];
    duration: number;
    route: {
        departure: {
            location: string;
            coordinates: { lat: number; lng: number };
        };
        highlights: {
            name: string;
            description: string;
            timeOverLocation?: number;
        }[];
        return: {
            location: string;
        };
    };
    aircraft: {
        type: string;
        model: string;
        capacity: number;
        features: string[];
    };
    pricing: {
        perPerson: number;
        currency: string;
        privateCharter?: number;
        groupDiscount?: {
            minimumPeople: number;
            discountPercentage: number;
        };
    };
    includes: string[];
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    requirements: {
        weatherDependent: boolean;
    };
}

export default function ScenicFlyTours() {
    const { formatPrice } = useCurrencyStore();
    const [tours, setTours] = useState<ScenicFlyTour[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('rating');
    const [filterFeatured, setFilterFeatured] = useState(false);

    useEffect(() => {
        fetchTours();
    }, [sortBy, filterFeatured]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const params: any = { sortBy };
            if (filterFeatured) params.featured = 'true';

            const response = await api.get('/scenic-tours', { params });
            setTours(response.data);
        } catch (error) {
            console.error('Error fetching scenic fly tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins} min`;
        if (mins === 0) return `${hours} hr`;
        return `${hours} hr ${mins} min`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-vanuatu-blue mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading scenic fly tours...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            {/* Hero Section */}
            <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-400 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white z-10 px-4">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            🛩️ Scenic Fly Tours
                        </h1>
                        <p className="text-xl md:text-2xl mb-6">
                            Discover Vanuatu from Above - Breathtaking Aerial Adventures
                        </p>
                        <p className="text-lg max-w-2xl mx-auto">
                            Experience the stunning beauty of Vanuatu's islands, volcanoes, and crystal-clear waters
                            from a unique bird's-eye perspective
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 -mt-20 relative z-10">
                {/* Filters and Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterFeatured}
                                    onChange={(e) => setFilterFeatured(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="font-medium">Featured Tours Only</span>
                            </label>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="rating">Highest Rated</option>
                                <option value="price">Lowest Price</option>
                                <option value="duration">Shortest Duration</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>

                        <CurrencySelector />
                    </div>
                </div>

                {/* Tours Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">{tours.length}</span> scenic fly tour{tours.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Tours Grid */}
                {tours.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow">
                        <div className="text-6xl mb-4">✈️</div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Tours Available</h3>
                        <p className="text-gray-500">Check back soon for amazing aerial adventures!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tours.map((tour) => (
                            <div
                                key={tour._id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                                {/* Image */}
                                <div className="relative h-56 overflow-hidden">
                                    {tour.images[0] ? (
                                        <img
                                            src={tour.images[0]}
                                            alt={tour.name}
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                            <span className="text-white text-6xl">✈️</span>
                                        </div>
                                    )}
                                    {tour.isFeatured && (
                                        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            ⭐ Featured
                                        </div>
                                    )}
                                    {tour.requirements.weatherDependent && (
                                        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            ☀️ Weather Dependent
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{tour.name}</h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={i < Math.round(tour.rating) ? 'text-yellow-400' : 'text-gray-300'}
                                                >
                                                    ⭐
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {tour.rating.toFixed(1)} ({tour.reviewCount} reviews)
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

                                    {/* Route Info */}
                                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                                            <span className="font-semibold">📍 Route:</span>
                                            <span>{tour.route.departure.location}</span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {tour.route.highlights.length} scenic highlights including{' '}
                                            {tour.route.highlights.slice(0, 2).map(h => h.name).join(', ')}
                                            {tour.route.highlights.length > 2 && '...'}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-blue-600">⏱️</span>
                                            <span className="text-gray-700">{formatDuration(tour.duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-blue-600">👥</span>
                                            <span className="text-gray-700">Max {tour.aircraft.capacity}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-blue-600">✈️</span>
                                            <span className="text-gray-700">{tour.aircraft.model}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-blue-600">📦</span>
                                            <span className="text-gray-700">{tour.includes.length} Includes</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="border-t pt-4 mb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-sm text-gray-500">From</span>
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {formatPrice(tour.pricing.perPerson, false)}
                                                </div>
                                                <span className="text-sm text-gray-500">per person</span>
                                            </div>
                                            {tour.pricing.groupDiscount && (
                                                <div className="text-right">
                                                    <div className="text-xs text-green-600 font-semibold">
                                                        GROUP DISCOUNT
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {tour.pricing.groupDiscount.discountPercentage}% off
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        for {tour.pricing.groupDiscount.minimumPeople}+ people
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Book Button */}
                                    <Link
                                        to={`/scenic-tours/${tour._id}`}
                                        className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        View Details & Book
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Information Section */}
                <div className="mt-16 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        Why Choose Our Scenic Fly Tours?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-5xl mb-3">🔒</div>
                            <h3 className="font-semibold text-lg mb-2">Safety First</h3>
                            <p className="text-gray-600 text-sm">
                                Experienced pilots, well-maintained aircraft, and comprehensive safety protocols
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-3">📸</div>
                            <h3 className="font-semibold text-lg mb-2">Perfect Views</h3>
                            <p className="text-gray-600 text-sm">
                                Panoramic windows and optimal flight paths for unforgettable photo opportunities
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-3">🎧</div>
                            <h3 className="font-semibold text-lg mb-2">Expert Commentary</h3>
                            <p className="text-gray-600 text-sm">
                                Live pilot commentary about landmarks, history, and points of interest
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
