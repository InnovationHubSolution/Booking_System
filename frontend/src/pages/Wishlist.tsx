import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { LoadingState, FriendlyErrorMessage, Toast, ConfirmationDialog } from '../components/PremiumUX';

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
    const [error, setError] = useState<string | null>(null);
    const [removeDialog, setRemoveDialog] = useState({ show: false, propertyId: '', propertyName: '' });
    const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
        show: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setError(null);
            const response = await api.get('/wishlist');
            setProperties(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async () => {
        try {
            await api.delete(`/wishlist/remove/${removeDialog.propertyId}`);
            setProperties(properties.filter(p => p._id !== removeDialog.propertyId));
            setNotification({ show: true, type: 'success', message: 'Property removed from wishlist' });
            setRemoveDialog({ show: false, propertyId: '', propertyName: '' });
        } catch (error: any) {
            setNotification({ show: true, type: 'error', message: 'Failed to remove from wishlist' });
        }
    };

    const clearNotification = () => {
        setNotification({ show: false, type: 'success', message: '' });
    };

    if (loading) return <LoadingState message="Loading your wishlist..." />;

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <FriendlyErrorMessage
                    error={error}
                    onRetry={fetchWishlist}
                    onClose={() => setError(null)}
                />
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
                                        onClick={() => setRemoveDialog({ show: true, propertyId: property._id, propertyName: property.name })}
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

            {/* Remove Confirmation Dialog */}
            {removeDialog.show && (
                <ConfirmationDialog
                    icon="💔"
                    title="Remove from Wishlist"
                    message={`Remove ${removeDialog.propertyName} from your wishlist?`}
                    confirmText="Remove"
                    cancelText="Keep"
                    confirmColor="red"
                    onConfirm={removeFromWishlist}
                    onCancel={() => setRemoveDialog({ show: false, propertyId: '', propertyName: '' })}
                />
            )}

            {/* Notification Toast */}
            {notification.show && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={clearNotification}
                />
            )}
        </div>
    );
}
