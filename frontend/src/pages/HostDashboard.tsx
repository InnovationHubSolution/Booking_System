import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

interface Property {
    _id: string;
    name: string;
    propertyType: string;
    address: {
        city: string;
    };
    rating: number;
    reviewCount: number;
    isActive: boolean;
}

interface Booking {
    _id: string;
    propertyId: {
        name: string;
    };
    userId: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    totalPrice: number;
    status: string;
    guestCount: {
        adults: number;
        children: number;
    };
}

export default function HostDashboard() {
    const { formatPrice } = useCurrencyStore();
    const [properties, setProperties] = useState<Property[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHostData();
    }, []);

    const fetchHostData = async () => {
        try {
            const [propertiesRes, bookingsRes] = await Promise.all([
                axios.get('/properties/host/my-properties'),
                axios.get('/bookings/host/bookings')
            ]);
            setProperties(propertiesRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching host data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId: string, status: string) => {
        try {
            await axios.patch(`/bookings/${bookingId}/status`, { status });
            fetchHostData();
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    const stats = {
        totalProperties: properties.length,
        activeProperties: properties.filter(p => p.isActive).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        totalRevenue: bookings
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, b) => sum + b.totalPrice, 0)
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Host Dashboard</h1>
                <div className="flex gap-4 items-center">
                    <CurrencySelector />
                    <Link
                        to="/host/property/new"
                        className="bg-vanuatu-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add Property
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-gray-600 text-sm">Total Properties</div>
                    <div className="text-3xl font-bold text-vanuatu-blue">{stats.totalProperties}</div>
                    <div className="text-sm text-gray-500 mt-1">{stats.activeProperties} active</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-gray-600 text-sm">Total Bookings</div>
                    <div className="text-3xl font-bold text-vanuatu-green">{stats.totalBookings}</div>
                    <div className="text-sm text-gray-500 mt-1">{stats.confirmedBookings} confirmed</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-gray-600 text-sm">Pending Bookings</div>
                    <div className="text-3xl font-bold text-vanuatu-yellow">{stats.pendingBookings}</div>
                    <div className="text-sm text-gray-500 mt-1">Needs attention</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-gray-600 text-sm">Total Revenue</div>
                    <div className="text-3xl font-bold text-vanuatu-blue">{formatPrice(stats.totalRevenue, false)}</div>
                    <div className="text-sm text-gray-500 mt-1">All time</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b">
                    <div className="flex">
                        <button
                            className={`px-6 py-4 font-semibold ${activeTab === 'properties'
                                    ? 'border-b-2 border-vanuatu-blue text-vanuatu-blue'
                                    : 'text-gray-600'
                                }`}
                            onClick={() => setActiveTab('properties')}
                        >
                            My Properties ({properties.length})
                        </button>
                        <button
                            className={`px-6 py-4 font-semibold ${activeTab === 'bookings'
                                    ? 'border-b-2 border-vanuatu-blue text-vanuatu-blue'
                                    : 'text-gray-600'
                                }`}
                            onClick={() => setActiveTab('bookings')}
                        >
                            Bookings ({bookings.length})
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'properties' ? (
                        <div className="space-y-4">
                            {properties.length === 0 ? (
                                <p className="text-center text-gray-600 py-8">
                                    No properties yet. Add your first property to get started!
                                </p>
                            ) : (
                                properties.map((property) => (
                                    <div
                                        key={property._id}
                                        className="border rounded-lg p-4 hover:shadow-md transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    {property.propertyType} • {property.address.city}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center">
                                                        <span className="text-vanuatu-yellow mr-1">★</span>
                                                        <span className="font-semibold">{property.rating.toFixed(1)}</span>
                                                        <span className="text-gray-500 text-sm ml-1">
                                                            ({property.reviewCount} reviews)
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm ${property.isActive
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {property.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/property/${property._id}`}
                                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/host/property/edit/${property._id}`}
                                                    className="px-4 py-2 bg-vanuatu-blue text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <p className="text-center text-gray-600 py-8">No bookings yet</p>
                            ) : (
                                bookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="border rounded-lg p-4 hover:shadow-md transition"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-2">
                                                <h3 className="font-bold mb-2">{booking.propertyId.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Guest:</strong> {booking.userId.firstName}{' '}
                                                    {booking.userId.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Room:</strong> {booking.roomType}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Guests:</strong> {booking.guestCount.adults} adults,{' '}
                                                    {booking.guestCount.children} children
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Contact:</strong> {booking.userId.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Check-in:</strong>
                                                    <br />
                                                    {new Date(booking.checkInDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <strong>Check-out:</strong>
                                                    <br />
                                                    {new Date(booking.checkOutDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <strong>Nights:</strong> {booking.nights}
                                                </p>
                                            </div>
                                            <div className="flex flex-col justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold text-vanuatu-blue mb-2">
                                                        {formatPrice(booking.totalPrice, false)}
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm inline-block ${booking.status === 'confirmed'
                                                                ? 'bg-green-100 text-green-700'
                                                                : booking.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {booking.status.charAt(0).toUpperCase() +
                                                            booking.status.slice(1)}
                                                    </span>
                                                </div>
                                                {booking.status === 'pending' && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() =>
                                                                updateBookingStatus(booking._id, 'confirmed')
                                                            }
                                                            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateBookingStatus(booking._id, 'cancelled')
                                                            }
                                                            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
