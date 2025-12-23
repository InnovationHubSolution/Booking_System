import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

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
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/services');
                setServices(response.data);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];
    const filteredServices = filter === 'All'
        ? services
        : services.filter(s => s.category === filter);

    if (loading) return <div className="text-center py-20">Loading...</div>;

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

            <div className="grid md:grid-cols-3 gap-8">
                {filteredServices.map((service) => (
                    <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                        {service.images[0] && (
                            <img src={service.images[0]} alt={service.name} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                            <span className="text-sm bg-vanuatu-green text-white px-3 py-1 rounded-full">
                                {service.category}
                            </span>
                            <h3 className="text-xl font-semibold mt-3 mb-2">{service.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">{service.location}</p>
                            <p className="text-gray-700 mb-4">{service.description}</p>

                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {service.amenities.slice(0, 3).map((amenity, i) => (
                                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-2xl font-bold text-vanuatu-blue">{formatPrice(service.price, false)}</span>
                                <span className="text-gray-500">{service.duration} min</span>
                            </div>

                            <Link
                                to={`/book/${service._id}`}
                                className="block w-full bg-vanuatu-blue text-white text-center py-2 rounded-lg hover:bg-blue-700"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
