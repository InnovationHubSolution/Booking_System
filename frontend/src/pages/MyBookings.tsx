import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

export default function MyBookings() {
    const { formatPrice } = useCurrencyStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
            fetchBookings();
        } catch (error) {
            alert('Failed to cancel booking');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-vanuatu-blue">My Bookings</h1>
                <CurrencySelector />
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600 mb-4">No bookings yet</p>
                    <a href="/services" className="text-vanuatu-blue hover:underline">
                        Browse services
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 text-vanuatu-blue">
                                        {booking.serviceId?.name}
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        📅 {format(new Date(booking.startDate), 'PPP p')} -
                                        {format(new Date(booking.endDate), 'p')}
                                    </p>
                                    <p className="text-gray-600 mb-2">
                                        👥 Guests: {booking.guestCount}
                                    </p>
                                    <p className="text-gray-600">
                                        Total: <span className="font-semibold text-lg">{formatPrice(booking.totalPrice, false)}</span>
                                    </p>
                                    {booking.notes && (
                                        <p className="text-gray-500 text-sm mt-2 italic">
                                            Note: {booking.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${booking.status === 'confirmed'
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : booking.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                            }`}
                                    >
                                        {booking.status.toUpperCase()}
                                    </span>

                                    {booking.status === 'pending' && (
                                        <button
                                            onClick={() => cancelBooking(booking._id)}
                                            className="mt-4 block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
