import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';

interface BookingDetails {
    _id: string;
    reservationNumber: string;
    bookingDate: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    bookingSource: 'online' | 'counter' | 'agent' | 'mobile-app';
    referenceNumber: string;
    bookingType: string;
    propertyId?: {
        name: string;
        address: { city: string };
    };
    serviceId?: {
        name: string;
        location: string;
    };
    roomType?: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    totalPrice: number;
    paymentStatus: string;
    guestCount: {
        adults: number;
        children: number;
    };
    guestDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    specialRequests?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

const BookingDetailsPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'no-show':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'online':
                return '🌐';
            case 'counter':
                return '🏢';
            case 'agent':
                return '👤';
            case 'mobile-app':
                return '📱';
            default:
                return '📋';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D7A] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="bg-[#004D7A] text-white px-6 py-2 rounded-lg hover:bg-[#003555]"
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#004D7A] mb-2">
                                Booking Details
                            </h1>
                            <p className="text-gray-600">
                                {booking.propertyId?.name || booking.serviceId?.name}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status.toUpperCase()}
                        </span>
                    </div>

                    {/* Core Booking Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-gradient-to-br from-[#004D7A] to-[#009E60] text-white rounded-lg">
                        <div>
                            <p className="text-sm opacity-90">Reservation Number</p>
                            <p className="text-2xl font-bold tracking-wider">{booking.reservationNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Reference Number</p>
                            <p className="text-lg font-semibold">{booking.referenceNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Booking Date & Time</p>
                            <p className="text-lg font-semibold">
                                {format(new Date(booking.bookingDate), 'PPP p')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Booking Source</p>
                            <p className="text-lg font-semibold">
                                {getSourceIcon(booking.bookingSource)} {booking.bookingSource.replace('-', ' ').toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stay Details */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Stay Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Check-In</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {format(new Date(booking.checkInDate), 'PPP')}
                            </p>
                            <p className="text-sm text-gray-500">After 2:00 PM</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Check-Out</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {format(new Date(booking.checkOutDate), 'PPP')}
                            </p>
                            <p className="text-sm text-gray-500">Before 11:00 AM</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Duration</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guest Information */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">👥 Guest Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Name</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {booking.guestDetails.firstName} {booking.guestDetails.lastName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {booking.guestDetails.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {booking.guestDetails.phone}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Guests</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {booking.guestCount.adults} Adult{booking.guestCount.adults !== 1 ? 's' : ''}
                                {booking.guestCount.children > 0 && `, ${booking.guestCount.children} Child${booking.guestCount.children !== 1 ? 'ren' : ''}`}
                            </p>
                        </div>
                    </div>

                    {booking.specialRequests && (
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="text-sm font-semibold text-yellow-800 mb-1">Special Requests</p>
                            <p className="text-gray-700">{booking.specialRequests}</p>
                        </div>
                    )}
                </div>

                {/* Room/Service Details */}
                {booking.roomType && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">🏨 Room Details</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Room Type</p>
                                <p className="text-lg font-semibold text-gray-800">{booking.roomType}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">💳 Payment Information</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">Booking Type</span>
                            <span className="font-semibold text-gray-800 capitalize">{booking.bookingType}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-gray-600">Payment Status</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    booking.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {booking.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-xl font-bold text-gray-800">Total Amount</span>
                            <span className="text-3xl font-bold text-[#004D7A]">
                                {formatPrice(booking.totalPrice, false)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cancellation Info */}
                {booking.status === 'cancelled' && booking.cancellationReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-red-800 mb-2">❌ Cancellation Details</h2>
                        <p className="text-gray-700">{booking.cancellationReason}</p>
                    </div>
                )}

                {/* Timestamps */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Booking Timeline</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Created</span>
                            <span className="font-semibold text-gray-800">
                                {format(new Date(booking.createdAt), 'PPP p')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Last Updated</span>
                            <span className="font-semibold text-gray-800">
                                {format(new Date(booking.updatedAt), 'PPP p')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                    >
                        ← Back to Bookings
                    </button>
                    {booking.status === 'confirmed' && (
                        <button
                            onClick={() => window.print()}
                            className="flex-1 bg-[#004D7A] text-white py-3 rounded-lg font-semibold hover:bg-[#003555] transition"
                        >
                            🖨️ Print Confirmation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;
