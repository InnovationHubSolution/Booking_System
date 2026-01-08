import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';
import { LoadingState } from '../components/PremiumUX';

interface VanuatuLocation {
    _id: string;
    name: string;
    type: 'accommodation' | 'attraction' | 'restaurant' | 'activity' | 'transport' | 'service';
    location: {
        coordinates: [number, number]; // [longitude, latitude]
        address: string;
        island: string;
        region: string;
    };
    price?: number;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    description: string;
    category?: string;
    amenities?: string[];
    featured: boolean;
}

const MapView: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [locations, setLocations] = useState<VanuatuLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['accommodation', 'attraction', 'activity']);
    const [selectedIsland, setSelectedIsland] = useState<string>('all');
    const [mapCenter, setMapCenter] = useState<[number, number]>([-17.7334, 168.3273]); // Port Vila
    const [zoom, setZoom] = useState(9);

    // Comprehensive Vanuatu locations data
    const vanuatuLocations: VanuatuLocation[] = [
        // EFATE ISLAND - Port Vila Area
        {
            _id: '1', name: 'Iririki Island Resort & Spa', type: 'accommodation',
            location: { coordinates: [168.3158, -17.7368], address: 'Iririki Island', island: 'Efate', region: 'Port Vila' },
            price: 450, rating: 4.8, reviewCount: 324, imageUrl: '/api/placeholder/300/200',
            description: 'Luxury island resort with overwater bungalows', amenities: ['Spa', 'Pool', 'Restaurant'], featured: true
        },
        {
            _id: '2', name: 'The Havannah', type: 'accommodation',
            location: { coordinates: [168.2847, -17.6423], address: 'Havannah Harbour', island: 'Efate', region: 'North Efate' },
            price: 850, rating: 4.9, reviewCount: 198, imageUrl: '/api/placeholder/300/200',
            description: 'Adults-only luxury resort with villas', amenities: ['Adults Only', 'Spa', 'Beach'], featured: true
        },
        {
            _id: '3', name: 'Mele Cascades', type: 'attraction',
            location: { coordinates: [168.2234, -17.7654], address: 'Mele Village', island: 'Efate', region: 'West Efate' },
            price: 15, rating: 4.6, reviewCount: 876, imageUrl: '/api/placeholder/300/200',
            description: 'Beautiful waterfall with swimming holes', featured: true
        },
        {
            _id: '4', name: 'Eden on the River', type: 'attraction',
            location: { coordinates: [168.2456, -17.7845], address: 'Eton Village', island: 'Efate', region: 'West Efate' },
            price: 25, rating: 4.5, reviewCount: 432, imageUrl: '/api/placeholder/300/200',
            description: 'Tropical garden with river swimming and zip lines', featured: false
        },
        {
            _id: '5', name: 'Chief Roi Mata\'s Domain', type: 'attraction',
            location: { coordinates: [168.4123, -17.6234], address: 'Hat Island', island: 'Efate', region: 'North Efate' },
            price: 0, rating: 4.4, reviewCount: 156, imageUrl: '/api/placeholder/300/200',
            description: 'UNESCO World Heritage site with cultural significance', featured: false
        },
        {
            _id: '6', name: 'Port Vila Markets', type: 'attraction',
            location: { coordinates: [168.3156, -17.7356], address: 'Kumul Highway', island: 'Efate', region: 'Port Vila' },
            price: 0, rating: 4.2, reviewCount: 543, imageUrl: '/api/placeholder/300/200',
            description: 'Local markets with fresh produce and handicrafts', featured: false
        },

        // ESPIRITU SANTO ISLAND
        {
            _id: '7', name: 'Ratua Private Island', type: 'accommodation',
            location: { coordinates: [166.9876, -15.2345], address: 'Ratua Island', island: 'Espiritu Santo', region: 'East Coast' },
            price: 1200, rating: 4.9, reviewCount: 89, imageUrl: '/api/placeholder/300/200',
            description: 'Private island eco-resort', amenities: ['Private Island', 'Eco-Resort', 'Diving'], featured: true
        },
        {
            _id: '8', name: 'SS President Coolidge Wreck', type: 'activity',
            location: { coordinates: [167.1234, -15.4567], address: 'Million Dollar Point', island: 'Espiritu Santo', region: 'Luganville' },
            price: 95, rating: 4.8, reviewCount: 234, imageUrl: '/api/placeholder/300/200',
            description: 'World\'s largest accessible shipwreck dive', category: 'Diving', featured: true
        },
        {
            _id: '9', name: 'Million Dollar Point', type: 'attraction',
            location: { coordinates: [167.1845, -15.4234], address: 'East Coast Road', island: 'Espiritu Santo', region: 'Luganville' },
            price: 0, rating: 4.3, reviewCount: 298, imageUrl: '/api/placeholder/300/200',
            description: 'WWII military equipment dumping site', featured: false
        },
        {
            _id: '10', name: 'Blue Holes', type: 'attraction',
            location: { coordinates: [166.9456, -15.3456], address: 'Matevulu Village', island: 'Espiritu Santo', region: 'East Coast' },
            price: 20, rating: 4.7, reviewCount: 456, imageUrl: '/api/placeholder/300/200',
            description: 'Crystal clear freshwater swimming holes', featured: true
        },

        // TANNA ISLAND
        {
            _id: '11', name: 'Mount Yasur Volcano', type: 'attraction',
            location: { coordinates: [169.4472, -19.5311], address: 'Sulphur Bay', island: 'Tanna', region: 'South East' },
            price: 45, rating: 4.9, reviewCount: 789, imageUrl: '/api/placeholder/300/200',
            description: 'Active volcano with spectacular lava displays', featured: true
        },
        {
            _id: '12', name: 'Tanna Lodge', type: 'accommodation',
            location: { coordinates: [169.3456, -19.4567], address: 'White Grass', island: 'Tanna', region: 'West Coast' },
            price: 320, rating: 4.6, reviewCount: 145, imageUrl: '/api/placeholder/300/200',
            description: 'Eco-lodge with volcano views', amenities: ['Eco-Lodge', 'Restaurant', 'Tours'], featured: false
        },
        {
            _id: '13', name: 'Port Resolution', type: 'attraction',
            location: { coordinates: [169.5234, -19.5678], address: 'Port Resolution Bay', island: 'Tanna', region: 'South East' },
            price: 0, rating: 4.4, reviewCount: 234, imageUrl: '/api/placeholder/300/200',
            description: 'Natural harbour with hot springs and cultural sites', featured: false
        },

        // PENTECOST ISLAND
        {
            _id: '14', name: 'Land Diving (Naghol)', type: 'activity',
            location: { coordinates: [168.1234, -15.7890], address: 'Bunlap Village', island: 'Pentecost', region: 'South' },
            price: 150, rating: 4.8, reviewCount: 67, imageUrl: '/api/placeholder/300/200',
            description: 'Traditional bungee jumping with vines', category: 'Cultural Experience', featured: true
        },

        // MALEKULA ISLAND
        {
            _id: '15', name: 'Norsup Airport Lodge', type: 'accommodation',
            location: { coordinates: [167.4012, -16.4567], address: 'Norsup', island: 'Malekula', region: 'North West' },
            price: 180, rating: 4.2, reviewCount: 78, imageUrl: '/api/placeholder/300/200',
            description: 'Simple lodge near airport', amenities: ['Restaurant', 'Airport Transfer'], featured: false
        },
        {
            _id: '16', name: 'Small Nambas Culture', type: 'activity',
            location: { coordinates: [167.3456, -16.3456], address: 'Interior Villages', island: 'Malekula', region: 'Interior' },
            price: 75, rating: 4.5, reviewCount: 89, imageUrl: '/api/placeholder/300/200',
            description: 'Cultural tour to traditional villages', category: 'Cultural Experience', featured: false
        },

        // RESTAURANTS & SERVICES
        {
            _id: '17', name: 'Waterfront Bar & Grill', type: 'restaurant',
            location: { coordinates: [168.3234, -17.7389], address: 'Waterfront', island: 'Efate', region: 'Port Vila' },
            price: 45, rating: 4.3, reviewCount: 567, imageUrl: '/api/placeholder/300/200',
            description: 'Waterfront dining with fresh seafood', featured: false
        },
        {
            _id: '18', name: 'Port Vila International Airport', type: 'transport',
            location: { coordinates: [168.3197, -17.6992], address: 'Bauerfield Road', island: 'Efate', region: 'Port Vila' },
            price: 0, rating: 4.1, reviewCount: 1234, imageUrl: '/api/placeholder/300/200',
            description: 'Main international airport for Vanuatu', featured: false
        },
        {
            _id: '19', name: 'Luganville Airport', type: 'transport',
            location: { coordinates: [167.2197, -15.5056], address: 'Pekoa Airport', island: 'Espiritu Santo', region: 'Luganville' },
            price: 0, rating: 3.9, reviewCount: 345, imageUrl: '/api/placeholder/300/200',
            description: 'Domestic airport serving Espiritu Santo', featured: false
        },
        {
            _id: '20', name: 'Air Vanuatu', type: 'service',
            location: { coordinates: [168.3156, -17.7356], address: 'Rue Higginson', island: 'Efate', region: 'Port Vila' },
            price: 0, rating: 4.0, reviewCount: 432, imageUrl: '/api/placeholder/300/200',
            description: 'National airline booking office', featured: false
        }
    ];
    useEffect(() => {
        loadVanuatuData();
    }, [selectedTypes, selectedIsland]);

    const loadVanuatuData = () => {
        setLoading(true);

        // Filter locations based on selected criteria
        const filteredLocations = vanuatuLocations.filter(location => {
            const typeMatch = selectedTypes.includes(location.type);
            const islandMatch = selectedIsland === 'all' || location.location.island === selectedIsland;
            return typeMatch && islandMatch;
        });

        // Simulate API delay
        setTimeout(() => {
            setLocations(filteredLocations);
            setLoading(false);
        }, 500);
    };

    const handleIslandSelect = (island: string) => {
        setSelectedIsland(island);

        // Set map center based on island
        const islandCenters: Record<string, { center: [number, number]; zoom: number }> = {
            'Efate': { center: [-17.7334, 168.3273], zoom: 11 },
            'Espiritu Santo': { center: [-15.4, 167.0], zoom: 10 },
            'Tanna': { center: [-19.5, 169.4], zoom: 11 },
            'Pentecost': { center: [-15.8, 168.1], zoom: 11 },
            'Malekula': { center: [-16.3, 167.4], zoom: 10 },
            'all': { center: [-17.0, 168.0], zoom: 8 }
        };

        const config = islandCenters[island] || islandCenters['all'];
        setMapCenter(config.center);
        setZoom(config.zoom);
    };

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            'accommodation': '🏨',
            'attraction': '🗾',
            'restaurant': '🍽️',
            'activity': '🎯',
            'transport': '✈️',
            'service': '🏢'
        };
        return icons[type] || '📍';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'accommodation': 'blue',
            'attraction': 'green',
            'restaurant': 'orange',
            'activity': 'purple',
            'transport': 'gray',
            'service': 'yellow'
        };
        return colors[type] || 'blue';
    };

    const markers = locations.map(location => ({
        position: [location.location.coordinates[1], location.location.coordinates[0]] as [number, number],
        popup: `
            <div class="max-w-xs p-2">
                <img src="${location.imageUrl}" alt="${location.name}" 
                     style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                <div class="space-y-2">
                    <h3 class="font-bold text-lg text-gray-900 leading-tight">${location.name}</h3>
                    <div class="flex items-center text-sm text-gray-600">
                        <span class="mr-2">${getTypeIcon(location.type)}</span>
                        <span class="capitalize">${location.type.replace('_', ' ')}</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        📍 ${location.location.address}, ${location.location.island}
                    </div>
                    ${location.price ? `<div class="text-lg font-semibold text-${getTypeColor(location.type)}-600">
                        $${location.price} ${location.type === 'accommodation' ? '/night' : ''}
                    </div>` : ''}
                    <div class="flex items-center text-sm">
                        <span class="text-yellow-500 mr-1">★</span>
                        <span class="font-medium">${location.rating.toFixed(1)}</span>
                        <span class="text-gray-500 ml-1">(${location.reviewCount} reviews)</span>
                    </div>
                    <p class="text-sm text-gray-700 leading-relaxed">${location.description}</p>
                    ${location.amenities ? `<div class="flex flex-wrap gap-1 mt-2">
                        ${location.amenities.map(amenity => `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${amenity}</span>`).join('')}
                    </div>` : ''}
                    ${location.featured ? '<div class="inline-block bg-gold-100 text-gold-800 px-2 py-1 rounded-full text-xs font-medium mt-2">✨ Featured</div>' : ''}
                    <div class="mt-3">
                        <button onclick="window.open('/property/${location._id}', '_blank')" 
                                class="bg-${getTypeColor(location.type)}-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-${getTypeColor(location.type)}-700 transition">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `,
        type: location.type
    }));

    if (loading) return <LoadingState message="Exploring the beautiful islands of Vanuatu..." size="large" />;

    const islands = ['all', 'Efate', 'Espiritu Santo', 'Tanna', 'Pentecost', 'Malekula'];
    const locationTypes = ['accommodation', 'attraction', 'restaurant', 'activity', 'transport', 'service'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">🗺️ Explore Vanuatu</h1>
                    <p className="text-xl opacity-90">Discover the 83 volcanic islands of this South Pacific paradise</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">83 Islands</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">12 Active Volcanoes</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">100+ Languages</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Melanesian Culture</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Island Navigation */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Island Adventure</h2>
                    <div className="flex flex-wrap gap-2">
                        {islands.map((island) => (
                            <button
                                key={island}
                                onClick={() => handleIslandSelect(island)}
                                className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${selectedIsland === island
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                    }`}
                            >
                                {island === 'all' ? '🌍 All Islands' : `🏝️ ${island}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location Type Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What are you looking for?</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {locationTypes.map((type) => {
                            const isSelected = selectedTypes.includes(type);
                            const count = locations.filter(l => l.type === type).length;
                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${isSelected
                                            ? `border-${getTypeColor(type)}-500 bg-${getTypeColor(type)}-50`
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                                    <div className={`font-medium text-sm ${isSelected ? `text-${getTypeColor(type)}-700` : 'text-gray-700'
                                        }`}>
                                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">({count})</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Map Container */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {selectedIsland === 'all' ? 'All Islands' : selectedIsland} - {locations.length} locations
                                </h3>
                                <p className="text-sm text-gray-600">Click any marker to view details</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleIslandSelect('all')}
                                    className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
                                >
                                    🌍 Show All
                                </button>
                            </div>
                        </div>
                    </div>
                    <Map
                        center={mapCenter}
                        zoom={zoom}
                        markers={markers}
                        style={{ height: '600px', width: '100%' }}
                    />
                </div>

                {/* Island Information Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h4 className="text-lg font-bold text-blue-600 mb-3">🏝️ Efate Island</h4>
                        <p className="text-gray-600 text-sm mb-3">Capital island home to Port Vila, the main commercial center</p>
                        <div className="space-y-1 text-xs text-gray-500">
                            <div>• Population: ~65,000</div>
                            <div>• Main attractions: Mele Cascades, Markets</div>
                            <div>• Activities: City tours, cultural sites</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h4 className="text-lg font-bold text-green-600 mb-3">🚢 Espiritu Santo</h4>
                        <p className="text-gray-600 text-sm mb-3">Largest island famous for diving and WWII history</p>
                        <div className="space-y-1 text-xs text-gray-500">
                            <div>• Size: Largest island in Vanuatu</div>
                            <div>• Famous for: SS President Coolidge wreck</div>
                            <div>• Activities: Diving, blue holes</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h4 className="text-lg font-bold text-red-600 mb-3">🌋 Tanna Island</h4>
                        <p className="text-gray-600 text-sm mb-3">Home to the world's most accessible active volcano</p>
                        <div className="space-y-1 text-xs text-gray-500">
                            <div>• Volcano: Mount Yasur (active)</div>
                            <div>• Culture: Traditional tribes</div>
                            <div>• Activities: Volcano tours, hot springs</div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {locationTypes.map((type) => {
                        const count = locations.filter(l => l.type === type).length;
                        const totalCount = vanuatuLocations.filter(l => l.type === type).length;
                        return (
                            <div key={type} className="bg-white rounded-lg shadow-md p-4 text-center">
                                <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                                <div className="text-lg font-bold text-gray-900">{count}</div>
                                <div className="text-xs text-gray-500 capitalize">{type.replace('_', ' ')}</div>
                                <div className="text-xs text-gray-400">of {totalCount} total</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MapView;
