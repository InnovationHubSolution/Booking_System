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
    deposit: number;
    currency: string;
    features: string[];
    images: string[];
    provider: {
        name: string;
        rating: number;
        reviews: number;
        location: string;
        phone?: string;
        email?: string;
        website?: string;
        address?: string;
        openingHours?: string;
        logo?: string;
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

            const response = await api.get(`/car-rentals/search?${params.toString()}`);
            const carsData = Array.isArray(response.data) ? response.data : [];

            // Transform backend data structure to frontend format
            const transformedCars = carsData.map((car: any) => ({
                id: car._id || car.id,
                make: car.vehicle?.make || '',
                model: car.vehicle?.model || '',
                year: car.vehicle?.year || 2023,
                type: car.vehicle?.category || 'sedan',
                transmission: car.vehicle?.transmission || 'automatic',
                seats: car.vehicle?.seats || 5,
                luggage: car.vehicle?.luggage || 2,
                fuelType: car.vehicle?.fuelType || 'petrol',
                pricePerDay: car.pricing?.dailyRate || 0,
                deposit: car.pricing?.deposit || 0,
                currency: car.pricing?.currency || 'VUV',
                features: car.features || [],
                images: car.images || [],
                provider: {
                    name: car.company?.name || 'Car Rental Provider',
                    rating: car.company?.rating || car.rating || 0,
                    reviews: car.company?.reviewCount || car.reviewCount || 0,
                    location: car.location?.pickupLocations?.[0]?.name || 'Port Vila',
                    phone: car.company?.phone,
                    email: car.company?.email,
                    website: car.company?.website,
                    address: car.location?.pickupLocations?.[0]?.address,
                    openingHours: car.location?.pickupLocations?.[0]?.openingHours,
                    logo: car.company?.logo
                },
                availability: car.available > 0,
                pickupLocations: car.location?.pickupLocations?.map((loc: any) => loc.name) || []
            }));

            setCars(transformedCars);
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
            deposit: 15000,
            currency: 'VUV',
            features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging'],
            images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop'],
            provider: {
                name: 'Vanuatu Car Rental',
                rating: 4.7,
                reviews: 134,
                location: 'Port Vila',
                phone: '+678 22345',
                email: 'info@vanuatucarrental.com',
                website: 'www.vanuatucarrental.com',
                address: 'Port Vila Airport Terminal',
                openingHours: '7:00 AM - 8:00 PM'
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
            deposit: 25000,
            currency: 'VUV',
            features: ['4WD', 'Air Conditioning', 'GPS Navigation', 'Roof Rack', 'Tow Bar'],
            images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop'],
            provider: {
                name: 'Island 4WD Rentals',
                rating: 4.9,
                reviews: 89,
                location: 'Port Vila',
                phone: '+678 23456',
                email: 'bookings@island4wd.vu',
                website: 'www.island4wd.vu',
                address: 'Lini Highway, Port Vila',
                openingHours: '8:00 AM - 6:00 PM'
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
            images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=300&fit=crop'],
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

                                    {/* Rental Company Information */}
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-1">🚗 Rental Company</h5>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-blue-600">{car.provider.name}</span>
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-500">⭐</span>
                                                        <span className="text-sm text-gray-600 ml-1">
                                                            {car.provider.rating.toFixed(1)} ({car.provider.reviews} reviews)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <span className="w-5">📍</span>
                                                <span>{car.provider.address || car.provider.location}</span>
                                            </div>
                                            {car.provider.phone && (
                                                <div className="flex items-center">
                                                    <span className="w-5">📞</span>
                                                    <a href={`tel:${car.provider.phone}`} className="hover:text-blue-600">
                                                        {car.provider.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {car.provider.email && (
                                                <div className="flex items-center">
                                                    <span className="w-5">📧</span>
                                                    <a href={`mailto:${car.provider.email}`} className="hover:text-blue-600">
                                                        {car.provider.email}
                                                    </a>
                                                </div>
                                            )}
                                            {car.provider.openingHours && (
                                                <div className="flex items-center">
                                                    <span className="w-5">🕒</span>
                                                    <span>{car.provider.openingHours}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-1 flex flex-col justify-between">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-1">
                                            {car.pricePerDay.toLocaleString()} {car.currency}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">per day</div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
                                            <div className="text-xs text-gray-500">Security Deposit</div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                {car.deposit.toLocaleString()} {car.currency}
                                            </div>
                                        </div>

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