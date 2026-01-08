import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeScanner, useQRCodeScanner } from '../components/QRCodeScanner';
import {
    LoadingState,
    FriendlyErrorMessage,
    SuccessConfirmation,
    Toast,
    ConfirmationDialog
} from '../components/PremiumUX';
import api from '../api/axios';
import { socketService } from '../services/socketService';
import { format } from 'date-fns';

interface CheckInPageProps {
    bookingId?: string;
}

export default function CheckInPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkInSuccess, setCheckInSuccess] = useState(false);
    const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    const {
        isScanning,
        notification,
        startScanning,
        stopScanning,
        handleScanSuccess,
        clearNotification
    } = useQRCodeScanner();

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
        requestLocationPermission();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            setBooking(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const requestLocationPermission = async () => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000
                });
            });

            setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setLocationPermission('granted');
        } catch (error) {
            setLocationPermission('denied');
        }
    };

    const performCheckIn = async (qrData?: string, location?: { lat: number; lng: number }) => {
        setLoading(true);
        try {
            const checkInData = {
                bookingId: bookingId || (qrData ? extractBookingIdFromQR(qrData) : null),
                qrCode: qrData,
                location: location || currentLocation,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            const response = await api.post('/advanced/check-in', checkInData);

            // Emit real-time update
            if (socketService.isConnected()) {
                if (checkInData.bookingId) {
                    socketService.emitBookingUpdate(checkInData.bookingId, {
                        status: 'checked-in',
                        checkInTime: new Date(),
                        location: location || currentLocation
                    });
                }
            }

            setBooking(response.data.booking);
            setCheckInSuccess(true);

        } catch (error: any) {
            setError(error.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const extractBookingIdFromQR = (qrData: string): string | null => {
        if (qrData.startsWith('VU-BOOKING:')) {
            const parts = qrData.split(':');
            return parts[1] || null;
        }
        return qrData; // Assume it's a booking ID
    };

    const handleQRScanSuccess = async (qrData: string) => {
        stopScanning();
        await performCheckIn(qrData);
    };

    const handleManualCheckIn = async () => {
        if (!booking) return;
        await performCheckIn();
    };

    if (loading) return <LoadingState message="Processing check-in..." size="large" />;

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <FriendlyErrorMessage
                    error={error}
                    onRetry={() => {
                        setError(null);
                        if (bookingId) {
                            fetchBookingDetails();
                        }
                    }}
                    onClose={() => navigate('/my-bookings')}
                />
            </div>
        );
    }

    if (checkInSuccess) {
        return (
            <SuccessConfirmation
                icon="🎉"
                title="Check-in Successful!"
                message={`Welcome! You've successfully checked in for ${booking?.serviceId?.name}. Enjoy your experience in Vanuatu!`}
                onClose={() => navigate('/my-bookings')}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">📱 Easy Check-in</h1>
                <p className="text-xl text-gray-600">Check in to your booking using QR code or manual confirmation</p>
            </div>

            {/* Booking Summary */}
            {booking && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                            {booking.reservationNumber}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">{booking.serviceId?.name}</h3>
                            <p className="text-gray-600 mb-2">📅 {format(new Date(booking.startDate), 'PPP p')}</p>
                            <p className="text-gray-600 mb-2">👥 {booking.guestCount || 1} guests</p>
                            <p className="text-gray-600">💰 Total: {booking.pricing?.totalAmount || booking.totalPrice} {booking.pricing?.currency || 'VUV'}</p>
                        </div>

                        <div>
                            {booking.qrCode && (
                                <div className="text-center">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(booking.qrCode)}&size=150x150`}
                                        alt="Booking QR Code"
                                        className="mx-auto mb-2 border border-gray-200 rounded-lg"
                                    />
                                    <p className="text-sm text-gray-500">Your QR Code</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Check-in Methods */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* QR Code Scan */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📱</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
                        <p className="text-gray-600">Use your device camera to scan the QR code for instant check-in</p>
                    </div>

                    <button
                        onClick={startScanning}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition text-lg"
                    >
                        Start Camera Scan
                    </button>
                </div>

                {/* Manual Check-in */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✋</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manual Check-in</h2>
                        <p className="text-gray-600">Check in manually if you have booking details</p>
                    </div>

                    <button
                        onClick={handleManualCheckIn}
                        disabled={!booking}
                        className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-lg"
                    >
                        {booking ? 'Check In Now' : 'No Booking Data'}
                    </button>
                </div>
            </div>

            {/* Location Permission Info */}
            {locationPermission === 'denied' && (
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">📍</span>
                        <div>
                            <h3 className="font-semibold text-yellow-800">Location Access Denied</h3>
                            <p className="text-yellow-700 text-sm">Check-in will proceed without location verification. You can enable location access in your browser settings for enhanced security.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Status */}
            {booking && (
                <div className="mt-8 text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${booking.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'checked-in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        Status: {booking.status.replace('-', ' ').toUpperCase()}
                    </div>
                    {booking.checkInTime && (
                        <p className="text-gray-600 mt-2">
                            Checked in at {format(new Date(booking.checkInTime), 'PPP p')}
                        </p>
                    )}
                </div>
            )}

            {/* QR Scanner Modal */}
            {isScanning && (
                <QRCodeScanner
                    onScanSuccess={handleQRScanSuccess}
                    onClose={stopScanning}
                />
            )}

            {/* Notifications */}
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

// Export the component for routing
export { CheckInPage };