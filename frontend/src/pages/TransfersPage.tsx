import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoadingState, FriendlyErrorMessage } from '../components/PremiumUX';
import api from '../api/axios';

interface Transfer {
    id: string;
    type: 'airport_pickup' | 'airport_dropoff' | 'inter_island' | 'hotel_transfer';
    from: string;
    to: string;
    duration: string;
    price: number;
    currency: string;
    vehicleType: string;
    maxPassengers: number;
    description: string;
    features: string[];
    image: string;
    provider: {
        name: string;
        rating: number;
        reviews: number;
    };
}

export default function TransfersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        vehicleType: searchParams.get('vehicleType') || '',
        passengers: searchParams.get('passengers') || '2'
    });

    useEffect(() => {
        fetchTransfers();
    }, [searchParams]);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/transfers/search?${params.toString()}`);
            const transfersData = Array.isArray(response.data) ? response.data : [];
            
            // Transform backend data structure to frontend format
            const transformedTransfers = transfersData.map((transfer: any) => {
                // Get the cheapest vehicle option
                const cheapestVehicle = transfer.vehicleOptions?.reduce((min: any, vehicle: any) => 
                    vehicle.price < min.price ? vehicle : min
                , transfer.vehicleOptions[0] || { price: 0, type: 'Sedan', capacity: 4, features: [], image: '' });

                return {
                    id: transfer._id || transfer.id,
                    type: transfer.type || 'airport',
                    from: transfer.route?.from?.name || '',
                    to: transfer.route?.to?.name || '',
                    duration: transfer.route?.duration ? `${transfer.route.duration} minutes` : '30 minutes',
                    price: cheapestVehicle?.price || transfer.pricing?.basePrice || 0,
                    currency: transfer.pricing?.currency || 'VUV',
                    vehicleType: cheapestVehicle?.type || 'Sedan',
                    maxPassengers: cheapestVehicle?.capacity || 4,
                    description: transfer.description || '',
                    features: cheapestVehicle?.features || transfer.features || [],
                    image: cheapestVehicle?.image || transfer.vehicleOptions?.[0]?.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
                    provider: {
                        name: transfer.provider?.name || 'Transfer Service',
                        rating: transfer.provider?.rating || transfer.rating || 0,
                        reviews: transfer.provider?.reviewCount || transfer.reviewCount || 0
                    }
                };
            });
            
            setTransfers(transformedTransfers);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load transfers');
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

    const mockTransfers: Transfer[] = [
        {
            id: '1',
            type: 'airport_pickup',
            from: 'Port Vila Airport (VLI)',
            to: 'Port Vila Hotels',
            duration: '30 minutes',
            price: 3500,
            currency: 'VUV',
            vehicleType: 'Sedan',
            maxPassengers: 4,
            description: 'Comfortable airport pickup service to Port Vila hotels',
            features: ['Air Conditioning', 'Free WiFi', 'Bottled Water', 'Professional Driver'],
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
            provider: {
                name: 'Vanuatu Transfer Co.',
                rating: 4.8,
                reviews: 156
            }
        },
        {
            id: '2',
            type: 'inter_island',
            from: 'Port Vila',
            to: 'Luganville, Espiritu Santo',
            duration: '1 hour flight + transfer',
            price: 25000,
            currency: 'VUV',
            vehicleType: 'Van + Flight',
            maxPassengers: 8,
            description: 'Complete inter-island transfer including flight and ground transportation',
            features: ['Domestic Flight', 'Ground Transfer', 'Luggage Handling', 'Meet & Greet'],
            image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
            provider: {
                name: 'Island Hopper Transfers',
                rating: 4.9,
                reviews: 89
            }
        },
        {
            id: '3',
            type: 'hotel_transfer',
            from: 'Port Vila Hotels',
            to: 'Mele Cascades',
            duration: '45 minutes',
            price: 4500,
            currency: 'VUV',
            vehicleType: 'SUV',
            maxPassengers: 6,
            description: 'Scenic transfer to the beautiful Mele Cascades waterfall',
            features: ['4WD Vehicle', 'Local Guide', 'Photo Stops', 'Return Transfer'],
            image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop',
            provider: {
                name: 'Adventure Transfers Vanuatu',
                rating: 4.7,
                reviews: 203
            }
        }
    ];

    if (loading) return <LoadingState message="Finding the best transfers..." />;

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <FriendlyErrorMessage
                    error={error}
                    onRetry={fetchTransfers}
                    onClose={() => setError(null)}
                />
            </div>
        );
    }

    const transfersToShow = transfers.length > 0 ? transfers : mockTransfers;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">🚐 Airport Transfers & Transportation</h1>
                    <p className="text-xl opacity-90">Comfortable and reliable transfers across Vanuatu</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Transfers</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="airport_pickup">Airport Pickup</option>
                                <option value="airport_dropoff">Airport Dropoff</option>
                                <option value="inter_island">Inter-Island</option>
                                <option value="hotel_transfer">Hotel Transfer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                            <select
                                value={filters.vehicleType}
                                onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Vehicles</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Van">Van</option>
                                <option value="Bus">Bus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                            <select
                                value={filters.passengers}
                                onChange={(e) => setFilters(prev => ({ ...prev, passengers: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="1">1 Passenger</option>
                                <option value="2">2 Passengers</option>
                                <option value="4">4 Passengers</option>
                                <option value="6">6 Passengers</option>
                                <option value="8">8+ Passengers</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (VUV)</label>
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                placeholder="Enter max price"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={applyFilters}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Transfer Results */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {transfersToShow.map((transfer) => (
                        <div key={transfer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                            <img
                                src={transfer.image}
                                alt={transfer.description}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{transfer.from} → {transfer.to}</h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>🚗 {transfer.vehicleType}</span>
                                            <span>👥 Up to {transfer.maxPassengers} passengers</span>
                                            <span>⏱️ {transfer.duration}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {transfer.price.toLocaleString()} {transfer.currency}
                                        </div>
                                        <div className="text-sm text-gray-600">per transfer</div>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4">{transfer.description}</p>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {transfer.features.map((feature, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-900">{transfer.provider.name}</span>
                                        <div className="flex items-center">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="text-sm text-gray-600 ml-1">
                                                {transfer.provider.rating} ({transfer.provider.reviews} reviews)
                                            </span>
                                        </div>
                                    </div>
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                        Book Transfer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {transfersToShow.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚐</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transfers Found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters to find more options</p>
                        <button
                            onClick={() => {
                                setFilters({ type: '', maxPrice: '', vehicleType: '', passengers: '2' });
                                setSearchParams(new URLSearchParams());
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}