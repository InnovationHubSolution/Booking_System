import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
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
    };
    images: string[];
    rating: number;
    reviewCount: number;
    rooms: Array<{
        pricePerNight: number;
    }>;
}

export default function Home() {
    const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
    const { formatPrice } = useCurrencyStore();
    const [searchData, setSearchData] = useState({
        destination: 'Vanuatu',
        checkIn: '',
        checkOut: '',
        guests: 2
    });

    useEffect(() => {
        fetchFeaturedProperties();
    }, []);

    const fetchFeaturedProperties = async () => {
        try {
            const response = await axios.get('/properties/featured/list');
            setFeaturedProperties(response.data);
        } catch (error) {
            console.error('Error fetching featured properties:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchData.destination) params.append('destination', searchData.destination);
        if (searchData.checkIn) params.append('checkIn', searchData.checkIn);
        if (searchData.checkOut) params.append('checkOut', searchData.checkOut);
        if (searchData.guests) params.append('adults', searchData.guests.toString());
        window.location.href = `/properties?${params.toString()}`;
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-vanuatu-blue to-vanuatu-green text-white">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
                    <div className="absolute top-4 right-4">
                        <CurrencySelector />
                    </div>
                    <h1 className="text-6xl font-bold mb-6">
                        🌺 Discover Vanuatu 🌺
                    </h1>
                    <p className="text-2xl mb-12">
                        Find your perfect accommodation in the South Pacific paradise
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Where to?"
                                className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue"
                                value={searchData.destination}
                                onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                            />
                            <input
                                type="date"
                                className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue"
                                value={searchData.checkIn}
                                onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                            />
                            <input
                                type="date"
                                className="px-4 py-3 rounded-lg border text-gray-800 focus:ring-2 focus:ring-vanuatu-blue"
                                value={searchData.checkOut}
                                onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                            />
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

            {/* Featured Properties */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-vanuatu-blue">
                        Featured Accommodations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredProperties.slice(0, 6).map((property) => (
                            <Link
                                key={property._id}
                                to={`/property/${property._id}`}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition group"
                            >
                                <div className="relative h-64">
                                    <img
                                        src={property.images[0]}
                                        alt={property.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                    <span className="absolute top-4 right-4 bg-vanuatu-yellow text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
                                        Featured
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-2">{property.name}</h3>
                                    <p className="text-gray-600 mb-3">
                                        {property.address.city}, {property.address.state}
                                    </p>
                                    <div className="flex items-center mb-3">
                                        <span className="text-vanuatu-yellow text-xl mr-1">★</span>
                                        <span className="font-bold">{property.rating.toFixed(1)}</span>
                                        <span className="text-gray-500 text-sm ml-2">
                                            ({property.reviewCount} reviews)
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {property.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-2xl font-bold text-vanuatu-blue">
                                                {formatPrice(Math.min(...property.rooms.map(r => r.pricePerNight)), false)}
                                            </span>
                                            <span className="text-gray-600"> /night</span>
                                        </div>
                                        <span className="text-vanuatu-blue font-semibold">View Details →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/properties"
                            className="inline-block bg-vanuatu-blue text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                        >
                            View All Properties
                        </Link>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-vanuatu-blue">
                        Why Book With Us?
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                            <div className="text-5xl mb-4">🏨</div>
                            <h3 className="text-xl font-semibold mb-2">Best Properties</h3>
                            <p className="text-gray-600">Hand-picked resorts, hotels, and villas</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                            <div className="text-5xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                            <p className="text-gray-600">Competitive rates guaranteed</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                            <div className="text-5xl mb-4">⭐</div>
                            <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
                            <p className="text-gray-600">Real reviews from real travelers</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg shadow">
                            <div className="text-5xl mb-4">🛡️</div>
                            <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
                            <p className="text-gray-600">Safe and secure payment</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Destinations */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-vanuatu-blue">
                        Explore Vanuatu
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Link to="/properties?destination=Port Vila" className="group relative h-64 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800"
                                alt="Port Vila"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-1">Port Vila</h3>
                                    <p>Capital city & gateway to paradise</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/properties?destination=Tanna" className="group relative h-64 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
                                alt="Tanna"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-1">Tanna Island</h3>
                                    <p>Home to the famous Mt Yasur volcano</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/properties?destination=Espiritu Santo" className="group relative h-64 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
                                alt="Espiritu Santo"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-1">Espiritu Santo</h3>
                                    <p>Pristine beaches & world-class diving</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
