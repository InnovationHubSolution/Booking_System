import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoadingState, FriendlyErrorMessage } from '../components/PremiumUX';
import { BookingModal } from '../components/BookingModal';
import api from '../api/axios';

interface CarRental {
    id: string;
    make: string;
    model: string;
    year: number;
    type: 'compact' | 'sedan' | 'suv' | '4wd' | 'luxury' | 'van';
    transmission: 'manual' | 'automatic';
    seats: number;
    luggage: number;
    fuelType: 'petrol' | 'diesel' | 'hybrid';
    pricePerDay: number;
    currency: string;
    features: string[];
    images: string[];
    provider: {
        name: string;
        rating: number;
        reviews: number;
        location: string;
    };
    availability: boolean;
    pickupLocations: string[];
}

export default function CarRentalPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState<CarRental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCar, setSelectedCar] = useState<CarRental | null>(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        transmission: searchParams.get('transmission') || '',
        minSeats: searchParams.get('minSeats') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        pickupLocation: searchParams.get('pickupLocation') || '',
        pickupDate: searchParams.get('pickupDate') || '',
        returnDate: searchParams.get('returnDate') || ''
    });

    useEffect(() => {
        fetchCars();
    }, [searchParams]);

    const fetchCars = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/car-rental?${params.toString()}`);
            setCars(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load car rentals');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    };

    const handleBookNow = (car: CarRental) => {
        setSelectedCar(car);
        setBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        setBookingModalOpen(false);
        setSelectedCar(null);
    };

    const mockCars: CarRental[] = [
        {
            id: '1',
            make: 'Toyota',
            model: 'Corolla',
            year: 2023,
            type: 'sedan',
            transmission: 'automatic',
            seats: 5,
            luggage: 3,
            fuelType: 'petrol',
            pricePerDay: 5500,
            currency: 'VUV',
            features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging'],
            images: ['/api/placeholder/400/300'],
            provider: {
                name: 'Vanuatu Car Rental',
                rating: 4.7,
                reviews: 134,
                location: 'Port Vila'
            },
            availability: true,
            pickupLocations: ['Port Vila Airport', 'Port Vila Downtown', 'Hotel Pickup']
        },
        {
            id: '2',
            make: 'Nissan',
            model: 'Patrol',
            year: 2022,
            type: '4wd',
            transmission: 'automatic',
            seats: 7,
            luggage: 5,
            fuelType: 'diesel',
            pricePerDay: 8500,
            currency: 'VUV',
            features: ['4WD', 'Air Conditioning', 'GPS Navigation', 'Roof Rack', 'Tow Bar'],
            images: ['/api/placeholder/400/300'],
            provider: {
                name: 'Island 4WD Rentals',
                rating: 4.9,
                reviews: 89,
                location: 'Port Vila'
            },
            availability: true,
            pickupLocations: ['Port Vila Airport', 'Luganville Airport', 'Hotel Pickup']
        },
        {
            id: '3',
            make: 'Hyundai',
            model: 'i30',
            year: 2023,
            type: 'compact',
            transmission: 'manual',
            seats: 5,
            luggage: 2,
            fuelType: 'petrol',
            pricePerDay: 4200,
            currency: 'VUV',
            features: ['Air Conditioning', 'Bluetooth', 'Fuel Efficient'],
            images: ['/api/placeholder/400/300'],
            provider: {
                name: 'Budget Cars Vanuatu',
                rating: 4.5,
                reviews: 76,
                location: 'Port Vila'
            },
            availability: true,
            pickupLocations: ['Port Vila Airport', 'Port Vila Downtown']
        }
    ];

    if (loading) return <LoadingState message="Finding available cars..." />;

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <FriendlyErrorMessage
                    error={error}
                    onRetry={fetchCars}
                    onClose={() => setError(null)}
                />
            </div>
        );
    }

    const carsToShow = cars.length > 0 ? cars : mockCars;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">🚗 Car Rental in Vanuatu</h1>
                    <p className="text-xl opacity-90">Explore Vanuatu at your own pace with our reliable rental cars</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Search Form */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Perfect Car</h2>
                    <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                            <select
                                value={filters.pickupLocation}
                                onChange={(e) => setFilters(prev => ({ ...prev, pickupLocation: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select location</option>
                                <option value="port-vila-airport">Port Vila Airport</option>
                                <option value="port-vila-downtown">Port Vila Downtown</option>
                                <option value="luganville-airport">Luganville Airport</option>
                                <option value="hotel-pickup">Hotel Pickup</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                            <input
                                type="date"
                                value={filters.pickupDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, pickupDate: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                            <input
                                type="date"
                                value={filters.returnDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, returnDate: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Car Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="compact">Compact</option>
                                <option value="sedan">Sedan</option>
                                <option value="suv">SUV</option>
                                <option value="4wd">4WD</option>
                                <option value="van">Van</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                            <select
                                value={filters.transmission}
                                onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Seats</label>
                            <select
                                value={filters.minSeats}
                                onChange={(e) => setFilters(prev => ({ ...prev, minSeats: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Any</option>
                                <option value="2">2+ Seats</option>
                                <option value="5">5+ Seats</option>
                                <option value="7">7+ Seats</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={applyFilters}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Search Cars
                            </button>
                        </div>
                    </div>
                </div>

                {/* Car Results */}
                <div className="space-y-6">
                    {carsToShow.map((car) => (
                        <div key={car.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                            <div className="grid md:grid-cols-4 gap-6 p-6">
                                <div className="md:col-span-1">
                                    <img
                                        src={car.images[0]}
                                        alt={`${car.make} ${car.model}`}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {car.make} {car.model} ({car.year})
                                            </h3>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded-full">
                                                    {car.type.toUpperCase()}
                                                </span>
                                                <span>👥 {car.seats} seats</span>
                                                <span>🧳 {car.luggage} luggage</span>
                                                <span>⚡ {car.transmission}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {car.features.map((feature, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900">{car.provider.name}</span>
                                            <div className="flex items-center">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="text-sm text-gray-600 ml-1">
                                                    {car.provider.rating} ({car.provider.reviews})
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600">📍 {car.provider.location}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-1 flex flex-col justify-between">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-1">
                                            {car.pricePerDay.toLocaleString()} {car.currency}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-4">per day</div>

                                        {car.availability ? (
                                            <div className="text-green-600 font-medium mb-4">✅ Available</div>
                                        ) : (
                                            <div className="text-red-600 font-medium mb-4">❌ Not Available</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleBookNow(car)}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                            disabled={!car.availability}
                                        >
                                            {car.availability ? 'Book Now' : 'Unavailable'}
                                        </button>
                                        <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {carsToShow.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚗</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cars Available</h3>
                        <p className="text-gray-600 mb-6">Try different dates or locations to find available cars</p>
                        <button
                            onClick={() => {
                                setFilters({
                                    type: '', transmission: '', minSeats: '', maxPrice: '',
                                    pickupLocation: '', pickupDate: '', returnDate: ''
                                });
                                setSearchParams(new URLSearchParams());
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedCar && (
                <BookingModal
                    car={selectedCar}
                    isOpen={bookingModalOpen}
                    onClose={closeBookingModal}
                    pickupDate={filters.pickupDate}
                    returnDate={filters.returnDate}
                    pickupLocation={filters.pickupLocation}
                />
            )}
        </div>
    );
}