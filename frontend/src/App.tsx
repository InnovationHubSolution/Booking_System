import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import { socketService } from './services/socketService';
import { Toast } from './components/PremiumUX';
import ChatSystem from './components/ChatSystem';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import PropertySearch from './pages/PropertySearch';
import PropertyDetails from './pages/PropertyDetails';
import Wishlist from './pages/Wishlist';
import HostDashboard from './pages/HostDashboard';
import BookingPage from './pages/BookingPage';
import PropertyBookingPage from './pages/PropertyBookingPage';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import FlightSearch from './pages/FlightSearch';
import Packages from './pages/Packages';
import MapView from './pages/MapView';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ScenicFlyTours from './pages/ScenicFlyTours';
import ScenicFlyTourDetails from './pages/ScenicFlyTourDetails';
import CheckInPage from './pages/CheckInPage';
import ProfilePage from './pages/ProfilePage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import TransfersPage from './pages/TransfersPage';
import CarRentalPage from './pages/CarRentalPage';

function App() {
    const { token, user } = useAuthStore();
    const [notifications, setNotifications] = useState<any[]>([]);

    console.log('App component rendering...', { token, user });

    // Initialize socket connection when user is authenticated
    useEffect(() => {
        console.log('Socket effect running', { token });
        if (token) {
            socketService.connect(token);

            // Set up real-time event listeners
            socketService.onNotification((notification) => {
                setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
            });

            socketService.onBookingUpdate((data) => {
                setNotifications(prev => [...prev, {
                    id: Date.now(),
                    type: 'info',
                    message: `Booking ${data.reservationNumber} has been updated`,
                    icon: '📋'
                }]);
            });

            socketService.onPaymentUpdate((data) => {
                setNotifications(prev => [...prev, {
                    id: Date.now(),
                    type: 'success',
                    message: `Payment ${data.status} for booking ${data.bookingId}`,
                    icon: '💳'
                }]);
            });

            return () => {
                socketService.disconnect();
            };
        }
    }, [token]);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    console.log('About to render App JSX');

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/properties" element={<PropertySearch />} />
                        <Route path="/map" element={<MapView />} />
                        <Route path="/property/:id" element={<PropertyDetails />} />
                        <Route path="/flights" element={<FlightSearch />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/scenic-tours" element={<ScenicFlyTours />} />
                        <Route path="/scenic-tours/:id" element={<ScenicFlyTourDetails />} />
                        <Route path="/transfers" element={<TransfersPage />} />
                        <Route path="/car-rental" element={<CarRentalPage />} />
                        <Route
                            path="/wishlist"
                            element={token ? <Wishlist /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/host/dashboard"
                            element={token ? <HostDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/book/:serviceId"
                            element={token ? <BookingPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/booking/property"
                            element={token ? <PropertyBookingPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/booking/flight"
                            element={token ? <BookingPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/my-bookings"
                            element={token ? <MyBookings /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/booking/:bookingId"
                            element={token ? <BookingDetails /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/booking/:bookingId/check-in"
                            element={token ? <CheckInPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/check-in"
                            element={token ? <CheckInPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/profile"
                            element={token ? <ProfilePage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/payment-methods"
                            element={token ? <PaymentMethodsPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/admin"
                            element={token ? <AdminDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/analytics"
                            element={token ? <Analytics /> : <Navigate to="/login" />}
                        />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                    </Routes>

                    {/* Chat System */}
                    {token && user && (
                        <ChatSystem currentUserId={user.id || user._id} />
                    )}

                    {/* Real-time Notifications */}
                    <div className="fixed top-4 right-4 z-50 space-y-2">
                        {notifications.map((notification) => (
                            <Toast
                                key={notification.id}
                                type={notification.type || 'info'}
                                message={notification.message}
                                onClose={() => removeNotification(notification.id)}
                            />
                        ))}
                    </div>
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
