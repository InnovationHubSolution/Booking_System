import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';
import { LoadingState, FriendlyErrorMessage, EmptyState, Badge } from '../components/PremiumUX';

interface Service {
    _id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    duration: number;
    location: string;
    images: string[];
    amenities: string[];
}

export default function Services() {
    const { formatPrice } = useCurrencyStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState(searchParams.get('category') || 'All');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setError(null);
                const response = await api.get('/services');
                setServices(response.data);
            } catch (error: any) {
                setError(error.response?.data?.message || error.message || 'Failed to load services');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Update filter when search params change
    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setFilter(category);
        }
    }, [searchParams]);

    const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];
    const filteredServices = filter === 'All'
        ? services
        : services.filter(s => s.category.toLowerCase() === filter.toLowerCase());

    if (loading) return <LoadingState message="Discovering amazing experiences for you..." size="large" />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-vanuatu-blue">Vanuatu Experiences</h1>
                    <CurrencySelector />
                </div>
                <FriendlyErrorMessage
                    error={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-vanuatu-blue">Vanuatu Experiences</h1>
                <CurrencySelector />
            </div>

            <div className="mb-8 flex gap-4 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg ${filter === cat
                            ? 'bg-vanuatu-blue text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filteredServices.length === 0 ? (
                <EmptyState
                    icon="🏝️"
                    title="No Experiences Found"
                    description={`No experiences found in the ${filter} category. Try selecting a different category or check back later.`}
                    actionButton={{
                        label: "Show All Categories",
                        onClick: () => setFilter('All')
                    }}
                />
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {filteredServices.map((service) => (
                        <div key={service._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {service.images[0] && (
                                <div className="relative h-48">
                                    <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4">
                                        <Badge color="green" size="small">
                                            {service.category}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-bold mt-2 mb-2 text-gray-900">{service.name}</h3>
                                <p className="text-gray-600 text-sm mb-2 flex items-center">
                                    <span className="mr-2">📍</span>
                                    {service.location}
                                </p>
                                <p className="text-gray-700 mb-4 line-clamp-3">{service.description}</p>

                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                        {service.amenities.slice(0, 3).map((amenity, i) => (
                                            <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                                {amenity}
                                            </span>
                                        ))}
                                        {service.amenities.length > 3 && (
                                            <span className="text-xs text-gray-500">+{service.amenities.length - 3} more</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <span className="text-2xl font-bold text-blue-600">{formatPrice(service.price, false)}</span>
                                        <span className="text-gray-500 text-sm ml-1">per person</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-500 text-sm flex items-center">
                                            <span className="mr-1">⏱️</span>
                                            {service.duration} min
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to={`/book/${service._id}`}
                                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Book Experience
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
