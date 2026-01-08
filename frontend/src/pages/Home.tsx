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
        destination: 'Port Vila',
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
            {/* Hero Section - Booking.com Style with Blue Water Background */}
            <div className="relative h-[400px] overflow-hidden">
                {/* Background Image - Fitted */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80&fit=crop')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 40%'
                    }}
                />

                {/* Subtle Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-black/20" />

                <div className="relative max-w-7xl mx-auto px-4 py-16 h-full flex flex-col justify-center">
                    <div className="absolute top-4 right-4 z-20">
                        <CurrencySelector />
                    </div>
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-2xl text-white">
                        Find your next stay
                    </h1>
                    <p className="text-xl mb-8 text-white drop-shadow-xl">
                        Search deals on hotels, homes, and much more...
                    </p>

                    {/* Search Bar - Booking.com Style */}
                    <form onSubmit={handleSearch} className="bg-yellow-400 rounded-lg shadow-2xl p-1 max-w-5xl border-4 border-yellow-500">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                            {/* Location Input */}
                            <div className="md:col-span-4 bg-white border-r-2 border-yellow-500 rounded-l-md">
                                <div className="p-3">
                                    <div className="flex items-center text-gray-600 mb-1">
                                        <span className="text-sm"></span>
                                        <span className="text-xs ml-1 font-medium">Where are you going?</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Port Vila"
                                        className="w-full px-2 py-1 text-gray-900 font-medium focus:outline-none"
                                        value={searchData.destination}
                                        onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* Check-in Date */}
                            <div className="md:col-span-3 bg-white border-r-2 border-yellow-500">
                                <div className="p-3">
                                    <div className="text-xs text-gray-600 mb-1 font-medium"> Check-in date</div>
                                    <input
                                        type="date"
                                        className="w-full text-gray-900 font-medium focus:outline-none"
                                        value={searchData.checkIn}
                                        onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* Check-out Date */}
                            <div className="md:col-span-3 bg-white border-r-2 border-yellow-500">
                                <div className="p-3">
                                    <div className="text-xs text-gray-600 mb-1 font-medium"> Check-out date</div>
                                    <input
                                        type="date"
                                        className="w-full text-gray-900 font-medium focus:outline-none"
                                        value={searchData.checkOut}
                                        onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* Search Button */}
                            <div className="md:col-span-2 flex items-center">
                                <button
                                    type="submit"
                                    className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-r-md transition text-lg"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>
                    {/* Checkbox */}
                    <div className="mt-4 flex items-center">
                        <input type="checkbox" id="entire-home" className="w-4 h-4 mr-2" />
                        <label htmlFor="entire-home" className="text-white text-sm">
                            I am looking for an entire home or apartment
                        </label>
                    </div>
                </div>
            </div>

            {/* Why Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12">Why Vanuatu Travel Hub?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center"><span className="text-5xl"></span></div>
                            <h3 className="text-lg font-bold mb-2">Book now pay at the property</h3>
                            <p className="text-gray-600 text-sm">FREE cancellation on most rooms</p>
                        </div>
                        <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center"><span className="text-5xl"></span></div>
                            <h3 className="text-lg font-bold mb-2">300M+ reviews from fellow travelers</h3>
                            <p className="text-gray-600 text-sm">Verified reviews you can trust</p>
                        </div>
                        <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center"><span className="text-5xl"></span></div>
                            <h3 className="text-lg font-bold mb-2">2+ million properties worldwide</h3>
                            <p className="text-gray-600 text-sm">From hotels to villas and more</p>
                        </div>
                        <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center"><span className="text-5xl"></span></div>
                            <h3 className="text-lg font-bold mb-2">Trusted 24/7 customer service you can rely on</h3>
                            <p className="text-gray-600 text-sm">We are here whenever you need us</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Properties */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-2">Homes guests love</h2>
                    <p className="text-gray-600 mb-8">Explore our top-rated properties</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProperties.slice(0, 6).map((property) => (
                            <Link key={property._id} to={`/property/${property._id}`} className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition group border border-gray-200">
                                <div className="relative h-56">
                                    <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-lg">{property.name}</h3>
                                        <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-bold">{property.rating.toFixed(1)}</div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{property.address.city}, {property.address.state}</p>
                                    <p className="text-gray-500 text-xs mb-3">{property.reviewCount} reviews</p>
                                    <div className="flex items-baseline justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">{formatPrice(property.rooms[0]?.pricePerNight || 0, false)}</span>
                                            <span className="text-gray-600 text-sm ml-1">/ night</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* NEW: Scenic Fly Tours Section */}
            <div className="bg-gradient-to-b from-sky-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3">✈️ Scenic Fly Tours</h2>
                        <p className="text-xl text-gray-600">Experience Vanuatu from Above</p>
                        <p className="text-gray-500 mt-2">Discover breathtaking aerial views of volcanoes, lagoons, and pristine islands</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative h-48">
                                <img src="https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=800" alt="Volcano Tour" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                                    ⭐ Featured
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Volcano & Islands Explorer</h3>
                                <p className="text-gray-600 text-sm mb-4">90-minute flight over Mt. Yasur volcano and pristine coastlines</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-blue-600">25,000 VUV</span>
                                    <span className="text-sm text-gray-500">per person</span>
                                </div>
                                <Link to="/scenic-tours" className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative h-48">
                                <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" alt="Blue Lagoon" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Blue Lagoon & Coral Reefs</h3>
                                <p className="text-gray-600 text-sm mb-4">60-minute flight over stunning blue holes and coral gardens</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-blue-600">18,000 VUV</span>
                                    <span className="text-sm text-gray-500">per person</span>
                                </div>
                                <Link to="/scenic-tours" className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative h-48">
                                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="Northern Islands" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Northern Islands Paradise</h3>
                                <p className="text-gray-600 text-sm mb-4">120-minute comprehensive tour of Espiritu Santo</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-blue-600">35,000 VUV</span>
                                    <span className="text-sm text-gray-500">per person</span>
                                </div>
                                <Link to="/scenic-tours" className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <Link
                            to="/scenic-tours"
                            className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            View All Scenic Tours →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Destinations */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-3">Explore Vanuatu</h2>
                    <p className="text-gray-600 mb-8">Discover the most popular destinations</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Link to="/properties?destination=Port Vila" className="group relative h-64 rounded-lg overflow-hidden shadow-lg">
                            <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800" alt="Port Vila" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-1">Port Vila</h3>
                                    <p>Capital city & gateway to paradise</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/properties?destination=Tanna" className="group relative h-64 rounded-lg overflow-hidden shadow-lg">
                            <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" alt="Tanna" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-1">Tanna Island</h3>
                                    <p>Home to the famous Mt Yasur volcano</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/properties?destination=Espiritu Santo" className="group relative h-64 rounded-lg overflow-hidden shadow-lg">
                            <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" alt="Espiritu Santo" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
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
