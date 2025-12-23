import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';

export default function PropertyBookingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { formatPrice } = useCurrencyStore();

    const { propertyId, roomType, checkIn, checkOut, adults, children } = location.state || {};

    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [guestDetails, setGuestDetails] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: ''
    });
    const [specialRequests, setSpecialRequests] = useState('');

    useEffect(() => {
        if (!propertyId || !roomType || !checkIn || !checkOut) {
            alert('Missing booking information');
            navigate(-1);
            return;
        }
        fetchProperty();
    }, []);

    const fetchProperty = async () => {
        try {
            const response = await api.get(`/properties/${propertyId}`);
            setProperty(response.data);
        } catch (error) {
            console.error('Error fetching property:', error);
            alert('Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

    const calculateNights = () => {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await api.post('/bookings/property', {
                propertyId,
                roomType,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guestCount: {
                    adults: adults || 2,
                    children: children || 0
                },
                guestDetails,
                specialRequests,
                bookingSource: 'online',
                currency: 'VUV'
            });

            alert('Booking created successfully! 🎉');
            navigate('/my-bookings');
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(error.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vanuatu-blue"></div>
            </div>
        );
    }

    if (!property) {
        return <div className="container mx-auto px-4 py-20 text-center">Property not found</div>;
    }

    const room = property.rooms.find((r: any) => r.type === roomType);
    if (!room) {
        return <div className="container mx-auto px-4 py-20 text-center">Room type not found</div>;
    }

    const nights = calculateNights();
    const subtotal = room.pricePerNight * nights;
    const tax = subtotal * 0.125; // 12.5% VAT
    const total = subtotal + tax;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-vanuatu-blue mb-8">Complete Your Booking</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleBooking} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                            <div>
                                <h2 className="text-xl font-bold mb-4">Guest Information</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={guestDetails.firstName}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            value={guestDetails.lastName}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={guestDetails.email}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            value={guestDetails.phone}
                                            onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                            placeholder="+678..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4">Special Requests</h2>
                                <textarea
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                    rows={4}
                                    placeholder="Any special requirements or requests..."
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Special requests are subject to availability and may incur additional charges.
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                                <p className="text-sm text-gray-700">
                                    {property.cancellationPolicy === 'flexible' &&
                                        'Free cancellation up to 24 hours before check-in'}
                                    {property.cancellationPolicy === 'moderate' &&
                                        'Free cancellation up to 5 days before check-in'}
                                    {property.cancellationPolicy === 'strict' &&
                                        'Cancellation fees apply. See full policy for details.'}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-vanuatu-green text-white py-3 rounded-lg hover:bg-green-600 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>

                    {/* Booking Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

                            <div className="mb-4">
                                <img
                                    src={property.images[0] || 'https://via.placeholder.com/400'}
                                    alt={property.name}
                                    className="w-full h-40 object-cover rounded-lg mb-2"
                                />
                                <h3 className="font-semibold">{property.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {property.address.city}, {property.address.state}
                                </p>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Room Type:</span>
                                    <span className="font-medium">{room.type}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Check-in:</span>
                                    <span className="font-medium">{new Date(checkIn).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Check-out:</span>
                                    <span className="font-medium">{new Date(checkOut).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Guests:</span>
                                    <span className="font-medium">{adults || 2} adults, {children || 0} children</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Nights:</span>
                                    <span className="font-medium">{nights}</span>
                                </div>
                            </div>

                            <div className="border-t mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {formatPrice(room.pricePerNight, false)} × {nights} nights
                                    </span>
                                    <span>{formatPrice(subtotal, false)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (12.5%)</span>
                                    <span>{formatPrice(tax, false)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className="text-vanuatu-blue">{formatPrice(total, false)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
