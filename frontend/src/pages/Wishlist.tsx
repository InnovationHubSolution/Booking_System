import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

interface Property {
    _id: string;
    name: string;
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

export default function Wishlist() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await axios.get('/wishlist');
            setProperties(response.data.properties);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (propertyId: string) => {
        try {
            await axios.delete(`/wishlist/remove/${propertyId}`);
            setProperties(properties.filter(p => p._id !== propertyId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vanuatu-blue"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

            {properties.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-600 text-xl mb-6">Your wishlist is empty</p>
                    <Link
                        to="/properties"
                        className="bg-vanuatu-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
                    >
                        Explore Properties
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <Link to={`/property/${property._id}`}>
                                <div className="relative h-48">
                                    <img
                                        src={property.images[0]}
                                        alt={property.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                            <div className="p-4">
                                <Link to={`/property/${property._id}`}>
                                    <h3 className="font-bold text-lg mb-2 hover:text-vanuatu-blue">{property.name}</h3>
                                </Link>
                                <p className="text-gray-600 text-sm mb-2">
                                    {property.address.city}, {property.address.state}
                                </p>
                                <div className="flex items-center mb-3">
                                    <span className="text-vanuatu-yellow mr-1">★</span>
                                    <span className="font-semibold">{property.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm ml-1">
                                        ({property.reviewCount})
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-xl font-bold text-vanuatu-blue">
                                            ${Math.min(...property.rooms.map(r => r.pricePerNight))}
                                        </span>
                                        <span className="text-gray-600 text-sm"> /night</span>
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(property._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
