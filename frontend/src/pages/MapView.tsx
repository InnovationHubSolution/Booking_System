import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';

interface Property {
    _id: string;
    name: string;
    location: {
        coordinates: [number, number];
        address: string;
        city: string;
    };
    price: number;
    rating: number;
    imageUrl: string;
    propertyType: string;
    starRating?: number;
}

interface Service {
    _id: string;
    name: string;
    location: {
        coordinates: [number, number];
        address: string;
    };
    price: number;
    rating: number;
    imageUrl: string;
    category: string;
}

const MapView: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProperties, setShowProperties] = useState(true);
    const [showServices, setShowServices] = useState(true);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-17.7334, 168.3273]); // Vanuatu default
    const [searchRadius, setSearchRadius] = useState(50); // km

    useEffect(() => {
        fetchMapData();
    }, [showProperties, showServices, mapCenter, searchRadius]);

    const fetchMapData = async () => {
        setLoading(true);
        try {
            const [propertiesRes, servicesRes] = await Promise.all([
                showProperties ? axios.get('http://localhost:5000/api/properties/search', {
                    params: {
                        latitude: mapCenter[0],
                        longitude: mapCenter[1],
                        radius: searchRadius,
                    }
                }) : Promise.resolve({ data: [] }),
                showServices ? axios.get('http://localhost:5000/api/services', {
                    params: {
                        latitude: mapCenter[0],
                        longitude: mapCenter[1],
                        radius: searchRadius,
                    }
                }) : Promise.resolve({ data: [] }),
            ]);

            setProperties(propertiesRes.data);
            setServices(servicesRes.data);
        } catch (error) {
            console.error('Error fetching map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const markers = [
        ...properties.map(property => ({
            id: property._id,
            position: [property.location.coordinates[1], property.location.coordinates[0]] as [number, number],
            title: property.name,
            type: 'property' as const,
            price: property.price,
            rating: property.rating,
            imageUrl: property.imageUrl,
            onClick: () => navigate(`/property/${property._id}`),
        })),
        ...services.map(service => ({
            id: service._id,
            position: [service.location.coordinates[1], service.location.coordinates[0]] as [number, number],
            title: service.name,
            type: 'service' as const,
            price: service.price,
            rating: service.rating,
            imageUrl: service.imageUrl,
            onClick: () => navigate(`/service/${service._id}`),
        })),
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Map</h1>
                    <p className="text-gray-600">
                        Discover properties and services in Vanuatu
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Toggle buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowProperties(!showProperties)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${showProperties
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span className="mr-2">🏨</span>
                                Properties ({properties.length})
                            </button>
                            <button
                                onClick={() => setShowServices(!showServices)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${showServices
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span className="mr-2">🎯</span>
                                Services ({services.length})
                            </button>
                        </div>

                        {/* Search radius */}
                        <div className="flex items-center gap-2">
                            <label className="text-gray-700 font-medium">Radius:</label>
                            <select
                                value={searchRadius}
                                onChange={(e) => setSearchRadius(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={10}>10 km</option>
                                <option value={25}>25 km</option>
                                <option value={50}>50 km</option>
                                <option value={100}>100 km</option>
                                <option value={200}>200 km</option>
                            </select>
                        </div>

                        {/* Reset to Vanuatu */}
                        <button
                            onClick={() => setMapCenter([-17.7334, 168.3273])}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            📍 Center on Vanuatu
                        </button>

                        {/* Total results */}
                        <div className="ml-auto text-gray-600 font-medium">
                            {markers.length} results
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="h-[600px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    ) : (
                        <Map
                            center={mapCenter}
                            zoom={10}
                            markers={markers}
                            style={{ height: '600px', width: '100%' }}
                        />
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Properties</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">Services</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="text-gray-700">Selected</span>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-3">
                        💡 Click on any marker to view details or adjust the search radius to explore more areas
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="text-gray-600 text-sm font-medium mb-1">Total Properties</h4>
                        <p className="text-3xl font-bold text-blue-600">{properties.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="text-gray-600 text-sm font-medium mb-1">Total Services</h4>
                        <p className="text-3xl font-bold text-green-600">{services.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="text-gray-600 text-sm font-medium mb-1">Search Area</h4>
                        <p className="text-3xl font-bold text-purple-600">{searchRadius} km</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;
