import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import AddProperty from './pages/AddProperty';

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
                <div className="min-h-screen bg-gradient-to-br from-white via-cloud/30 to-pacific-light/10 relative">
                    {/* Subtle Pacific background pattern overlay */}
                    <div className="fixed inset-0 pattern-kastom-mat-5 opacity-20 pointer-events-none z-0"></div>
                    <div className="fixed inset-0 pattern-wave opacity-3 pointer-events-none z-0"></div>

                    {/* Content wrapper */}
                    <div className="relative z-10">
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
                                path="/host/property/new"
                                element={token ? <AddProperty /> : <Navigate to="/login" />}
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

                        {/* Footer */}
                        <Footer />

                        {/* Chat System */}
                        {token && user && (
                            <ChatSystem currentUserId={user.id || user._id} />
                        )}

                        {/* Scroll to Top Button */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="fixed bottom-8 right-8 z-40 bg-gradient-ocean text-white p-4 rounded-full shadow-pacific-lg hover:scale-110 transition-all duration-300 group"
                            aria-label="Scroll to top"
                        >
                            <svg className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>

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
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
