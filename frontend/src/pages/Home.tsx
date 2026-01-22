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

    return (
        <div>
            {/* Hero Section - Full Screen Welcome */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Video/Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-pacific-deep/40 via-transparent to-volcanic-black/60" />

                {/* Currency Selector */}
                <div className="absolute top-4 right-4 z-20">
                    <CurrencySelector />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl leading-tight">
                        Your Vanuatu Adventure Starts Here.
                    </h1>
                    <p className="text-xl md:text-2xl text-white mb-12 drop-shadow-xl max-w-3xl mx-auto leading-relaxed">
                        Set in the heart of the Pacific with its proud heritage and strong traditions, Vanuatu offers an authentic Polynesian experience. Explore crystal clear waters, vibrant reefs, and welcoming island communities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/properties"
                            className="bg-sunset hover:bg-sunset-dark text-white px-10 py-4 rounded-lg font-bold text-lg shadow-sunset transform hover:scale-105 transition-all duration-300"
                        >
                            EXPLORE OUR ISLANDS
                        </Link>
                        <Link
                            to="/services"
                            className="bg-white hover:bg-cloud text-pacific-deep px-10 py-4 rounded-lg font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            THINGS TO SEE & DO
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center group">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-ocean rounded-full flex items-center justify-center pattern-nakamal transform group-hover:scale-110 transition-all duration-300 shadow-pacific-lg">
                                <span className="text-5xl">😊</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-pacific-deep">A place where every smile feels like home</h3>
                            <p className="text-gray-600">Where friendly faces welcome you with open arms, and the warmth of Vanuatu stays with you long after you leave.</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-earth rounded-full flex items-center justify-center pattern-namele transform group-hover:scale-110 transition-all duration-300 shadow-pacific-lg">
                                <span className="text-5xl">🌴</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-pacific-deep">A place where nature remains untouched</h3>
                            <p className="text-gray-600">Where pristine beaches, vibrant reefs, and wild beauty endure, Vanuatu invites you to experience nature in its purest form.</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-sunset rounded-full flex items-center justify-center pattern-kastom-mat transform group-hover:scale-110 transition-all duration-300 shadow-sunset">
                                <span className="text-5xl">💃</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-pacific-deep">A place where culture lives in every heart</h3>
                            <p className="text-gray-600">Where ancient traditions, joyful dances, and heartfelt welcomes weave the story of Vanuatu's proud people.</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-24 h-24 mx-auto mb-6 bg-pacific-turquoise rounded-full flex items-center justify-center pattern-reef transform group-hover:scale-110 transition-all duration-300 shadow-pacific-lg">
                                <span className="text-5xl">🐋</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-pacific-deep">A place where you dive with sea life</h3>
                            <p className="text-gray-600">Where the deep blue becomes your playground, and swimming alongside gentle sea creatures is a memory for life.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Properties */}
            <div className="bg-gradient-to-b from-pacific-light/10 to-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3 text-pacific-deep">Plan Your Vanuatu Trip</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Get ready for an unforgettable escape to the heart of the Pacific. Find everything you need from accommodations to experiences.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {featuredProperties.slice(0, 6).map((property) => (
                            <Link
                                key={property._id}
                                to={`/property/${property._id}`}
                                className="bg-white rounded-pacific overflow-hidden hover:shadow-pacific-lg transition-all duration-300 transform hover:-translate-y-2 border border-pacific-light/20 pattern-card"
                            >
                                <div className="relative h-64">
                                    <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-sunset text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        ⭐ {property.rating.toFixed(1)}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-2 text-pacific-deep">{property.name}</h3>
                                    <p className="text-gray-600 text-sm mb-1">📍 {property.address.city}, {property.address.state}</p>
                                    <p className="text-gray-500 text-xs mb-4">{property.reviewCount} reviews</p>
                                    <div className="flex items-baseline justify-between border-t border-pacific-light/20 pt-4">
                                        <div>
                                            <span className="text-3xl font-bold text-pacific-blue">{formatPrice(property.rooms[0]?.pricePerNight || 0, false)}</span>
                                            <span className="text-gray-600 text-sm ml-2">/ night</span>
                                        </div>
                                        <span className="text-sunset font-semibold">View Details →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center">
                        <Link
                            to="/properties"
                            className="inline-block bg-gradient-ocean text-white px-10 py-4 rounded-lg font-bold text-lg shadow-pacific-lg transform hover:scale-105 transition-all duration-300"
                        >
                            VIEW ALL ACCOMMODATIONS
                        </Link>
                    </div>
                </div>
            </div>

            {/* Island Highlights Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3 text-pacific-deep">Discover Vanuatu's Islands</h2>
                        <p className="text-xl text-gray-600">Each island offers unique adventures and unforgettable experiences</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Link to="/properties?destination=Port Vila" className="group relative h-96 rounded-pacific overflow-hidden shadow-pacific-lg">
                            <img
                                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800"
                                alt="Port Vila"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-volcanic-black via-volcanic-black/50 to-transparent">
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                    <h3 className="text-3xl font-bold mb-3">Efate</h3>
                                    <p className="text-lg mb-4">Capital city & gateway to paradise. Experience urban island living with stunning beaches and rich culture.</p>
                                    <span className="inline-block bg-sunset px-6 py-2 rounded-lg font-semibold group-hover:bg-sunset-dark transition">
                                        DISCOVER MORE →
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link to="/properties?destination=Tanna" className="group relative h-96 rounded-pacific overflow-hidden shadow-pacific-lg">
                            <img
                                src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
                                alt="Tanna"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-volcanic-black via-volcanic-black/50 to-transparent">
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                    <h3 className="text-3xl font-bold mb-3">Tanna</h3>
                                    <p className="text-lg mb-4">Home to the famous Mt Yasur volcano. Witness nature's raw power and explore ancient traditions.</p>
                                    <span className="inline-block bg-sunset px-6 py-2 rounded-lg font-semibold group-hover:bg-sunset-dark transition">
                                        DISCOVER MORE →
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <Link to="/properties?destination=Espiritu Santo" className="group relative h-96 rounded-pacific overflow-hidden shadow-pacific-lg">
                            <img
                                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
                                alt="Espiritu Santo"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-volcanic-black via-volcanic-black/50 to-transparent">
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                    <h3 className="text-3xl font-bold mb-3">Espiritu Santo</h3>
                                    <p className="text-lg mb-4">Pristine beaches & world-class diving. Discover blue holes and vibrant coral reefs.</p>
                                    <span className="inline-block bg-sunset px-6 py-2 rounded-lg font-semibold group-hover:bg-sunset-dark transition">
                                        DISCOVER MORE →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Experiences Section */}
            <div className="bg-gradient-to-b from-pacific-sky/20 to-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3 text-pacific-deep">✈️ Scenic Fly Tours</h2>
                        <p className="text-xl text-gray-600">Experience Vanuatu from Above</p>
                        <p className="text-gray-500 mt-2">Discover breathtaking aerial views of volcanoes, lagoons, and pristine islands</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div className="bg-white rounded-pacific shadow-pacific-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 pattern-card">
                            <div className="relative h-56">
                                <img src="https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=800" alt="Volcano Tour" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-coral text-white px-3 py-1 rounded-full text-sm font-bold">
                                    ⭐ Featured
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-pacific-deep">Volcano & Islands Explorer</h3>
                                <p className="text-gray-600 text-sm mb-4">90-minute flight over Mt. Yasur volcano and pristine coastlines</p>
                                <div className="flex items-center justify-between mb-4 border-t border-pacific-light/20 pt-4">
                                    <span className="text-2xl font-bold text-pacific-blue">25,000 VUV</span>
                                    <span className="text-sm text-gray-500">per person</span>
                                </div>
                                <Link to="/scenic-tours" className="block w-full bg-gradient-ocean text-white text-center py-3 rounded-lg hover:shadow-pacific-lg transition font-semibold">
                                    Learn More
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-pacific shadow-pacific-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 pattern-card">
                            <div className="relative h-56">
                                <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800" alt="Blue Lagoon" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-pacific-deep">Blue Lagoon & Coral Reefs</h3>
                                <p className="text-gray-600 text-sm mb-4">60-minute flight over stunning blue holes and coral gardens</p>
                                <div className="flex items-center justify-between mb-4 border-t border-pacific-light/20 pt-4">
                                    <span className="text-2xl font-bold text-pacific-blue">18,000 VUV</span>
                                    <span className="text-sm text-gray-500">per person</span>
                                </div>
                                <Link to="/scenic-tours" className="block w-full bg-gradient-ocean text-white text-center py-3 rounded-lg hover:shadow-pacific-lg transition font-semibold">
                                    Learn More
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-pacific shadow-pacific-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 pattern-card">
                            <div className="relative h-56">
                                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="Northern Islands" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-pacific-deep">Northern Islands Paradise</h3>
                                <p className="text-gray-600 text-sm mb-4">120-minute comprehensive tour of Espiritu Santo</p>
                                <div className="flex items-center justify-between mb-4 border-t border-pacific-light/20 pt-4">
                                    <span className="text-2xl font-bold text-pacific-blue">35,000 VUV</span>
                                    <span className="text-sm text-gray-500">per person</span>
                                </div>
                                <Link to="/scenic-tours" className="block w-full bg-gradient-ocean text-white text-center py-3 rounded-lg hover:shadow-pacific-lg transition font-semibold">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <Link
                            to="/scenic-tours"
                            className="inline-block bg-gradient-sunset text-white px-10 py-4 rounded-lg font-bold text-lg shadow-sunset transform hover:scale-105 transition-all duration-300"
                        >
                            VIEW ALL SCENIC TOURS →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="relative py-32 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
                    }}
                />
                <div className="absolute inset-0 bg-pacific-deep/80" />

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-5xl font-bold mb-6">Ready to Experience Vanuatu?</h2>
                    <p className="text-2xl mb-10 leading-relaxed">
                        From pristine beaches to active volcanoes, from vibrant culture to world-class diving. Your Pacific adventure awaits.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/properties"
                            className="bg-sunset hover:bg-sunset-dark text-white px-10 py-4 rounded-lg font-bold text-lg shadow-sunset transform hover:scale-105 transition-all duration-300"
                        >
                            START PLANNING YOUR TRIP
                        </Link>
                        <Link
                            to="/services"
                            className="bg-white hover:bg-cloud text-pacific-deep px-10 py-4 rounded-lg font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            EXPLORE EXPERIENCES
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
