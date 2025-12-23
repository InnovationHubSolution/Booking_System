import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
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
import FlightSearch from './pages/FlightSearch';
import Packages from './pages/Packages';
import MapView from './pages/MapView';

function App() {
    const { token } = useAuthStore();

    return (
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
                        path="/admin"
                        element={token ? <AdminDashboard /> : <Navigate to="/login" />}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
