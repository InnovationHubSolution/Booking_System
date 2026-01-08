import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';
import {
    NoBookingsEmptyState,
    LoadingBookings,
    FriendlyErrorMessage,
    ConfirmationDialog,
    Toast,
    Badge
} from '../components/PremiumUX';
import { socketService } from '../services/socketService';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
    const { formatPrice } = useCurrencyStore();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelDialog, setCancelDialog] = useState<{ show: boolean; bookingId: string; bookingNumber: string }>({
        show: false,
        bookingId: '',
        bookingNumber: ''
    });
    const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
        show: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        fetchBookings();

        // Real-time booking updates
        if (socketService.isConnected()) {
            socketService.onBookingUpdate((data) => {
                // Refresh bookings when there's an update
                fetchBookings();
                showNotification('info', `Booking ${data.reservationNumber} updated`);
            });

            socketService.onBookingCancelled((data) => {
                // Update local state
                setBookings(prev =>
                    prev.map(booking =>
                        booking._id === data.bookingId
                            ? { ...booking, status: 'cancelled' }
                            : booking
                    )
                );
                showNotification('info', `Booking cancelled successfully`);
            });
        }
    }, []);

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ show: true, type: type as any, message });
    };

    const fetchBookings = async () => {
        try {
            setError(null);
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const showCancelDialog = (bookingId: string, reservationNumber: string) => {
        setCancelDialog({ show: true, bookingId, bookingNumber: reservationNumber });
    };

    const cancelBooking = async () => {
        try {
            await api.patch(`/bookings/${cancelDialog.bookingId}/status`, { status: 'cancelled' });

            // Emit real-time update
            if (socketService.isConnected()) {
                socketService.emitBookingUpdate(cancelDialog.bookingId, { status: 'cancelled' });
            }

            fetchBookings();
            showNotification('success', `Booking ${cancelDialog.bookingNumber} cancelled successfully`);
        } catch (error: any) {
            showNotification('error', error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelDialog({ show: false, bookingId: '', bookingNumber: '' });
        }
    };

    const generateQRCodeURL = (booking: any) => {
        const qrData = booking.qrCode || `VU-BOOKING:${booking.reservationNumber}:${booking.bookingType || 'general'}:${Date.now()}`;
        return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200`;
    };

    if (loading) return <LoadingBookings />;

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-vanuatu-blue">My Bookings</h1>
                    <CurrencySelector />
                </div>
                <FriendlyErrorMessage
                    error={error}
                    onRetry={fetchBookings}
                    onClose={() => setError(null)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-vanuatu-blue">My Bookings</h1>
                <CurrencySelector />
            </div>

            {bookings.length === 0 ? (
                <NoBookingsEmptyState onSearch={() => navigate('/services')} />
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => window.location.href = `/booking/${booking._id}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {booking.reservationNumber && (
                                        <div className="mb-2">
                                            <span className="bg-[#004D7A] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                {booking.reservationNumber}
                                            </span>
                                            {booking.bookingSource && (
                                                <span className="ml-2 text-sm text-gray-500">
                                                    via {booking.bookingSource}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-semibold mb-2 text-vanuatu-blue">
                                        {booking.serviceId?.name}
                                    </h3>
                                    {booking.startDate && booking.endDate && (
                                        <p className="text-gray-600 mb-2">
                                            📅 {format(new Date(booking.startDate), 'PPP p')} -
                                            {format(new Date(booking.endDate), 'p')}
                                        </p>
                                    )}
                                    {booking.bookingDate && (
                                        <p className="text-gray-600 mb-2">
                                            🗓️ Booked: {format(new Date(booking.bookingDate), 'PPP')}
                                        </p>
                                    )}
                                    <p className="text-gray-600 mb-2">
                                        👥 Guests: {booking.guestCount || 1}
                                    </p>
                                    <p className="text-gray-600">
                                        Total: <span className="font-semibold text-lg">{formatPrice(booking.totalPrice || booking.pricing?.totalAmount || 0, false)}</span>
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showCancelDialog(booking._id, booking.reservationNumber);
                                            }}
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

            {/* Cancel Confirmation Dialog */}
            {cancelDialog.show && (
                <ConfirmationDialog
                    icon="⚠️"
                    title="Cancel Booking"
                    message={`Are you sure you want to cancel booking ${cancelDialog.bookingNumber}? This action cannot be undone.`}
                    confirmText="Yes, Cancel"
                    cancelText="Keep Booking"
                    confirmColor="red"
                    onConfirm={cancelBooking}
                    onCancel={() => setCancelDialog({ show: false, bookingId: '', bookingNumber: '' })}
                />
            )}

            {/* Notification Toast */}
            {notification.show && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ show: false, type: 'success', message: '' })}
                />
            )}
        </div>
    );
}
