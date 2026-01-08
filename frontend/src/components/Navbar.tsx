import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
    const { token, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-vanuatu-blue shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                        🌴 Vanuatu Travel Hub
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        {/* Accommodations Dropdown */}
                        <div className="relative group">
                            <button className="text-white hover:text-vanuatu-yellow transition flex items-center gap-1">
                                🏠 Stay
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <Link to="/properties" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🏨 All Properties
                                </Link>
                                <Link to="/properties?type=hotel" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🏨 Hotels
                                </Link>
                                <Link to="/properties?type=resort" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🏖️ Resorts
                                </Link>
                                <Link to="/properties?type=villa" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🏡 Villas
                                </Link>
                                <Link to="/properties?type=bungalow" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🛖 Bungalows
                                </Link>
                            </div>
                        </div>

                        {/* Experiences Dropdown */}
                        <div className="relative group">
                            <button className="text-white hover:text-vanuatu-yellow transition flex items-center gap-1">
                                🌟 Experiences
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <Link to="/services" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🎯 All Experiences
                                </Link>
                                <Link to="/scenic-tours" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    ✈️ Scenic Tours
                                </Link>
                                <Link to="/services?category=adventure" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🏄 Adventure
                                </Link>
                                <Link to="/services?category=cultural" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🗿 Cultural Tours
                                </Link>
                                <Link to="/services?category=diving" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🤿 Diving
                                </Link>
                                <Link to="/services?category=nature" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🌺 Nature
                                </Link>
                            </div>
                        </div>

                        {/* Travel Services Dropdown */}
                        <div className="relative group">
                            <button className="text-white hover:text-vanuatu-yellow transition flex items-center gap-1">
                                ✈️ Travel
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <Link to="/flights" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    ✈️ Flights
                                </Link>
                                <Link to="/packages" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    📦 Travel Packages
                                </Link>
                                <Link to="/transfers" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🚐 Airport Transfers
                                </Link>
                                <Link to="/car-rental" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                    🚗 Car Rental
                                </Link>
                            </div>
                        </div>

                        <Link
                            to="/map"
                            className="text-white hover:text-vanuatu-yellow transition font-semibold bg-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/50"
                        >
                            🗺️ Explore Map
                        </Link>

                        {token ? (
                            <>
                                <Link to="/wishlist" className="text-white hover:text-vanuatu-yellow transition">
                                    ❤️ Wishlist
                                </Link>
                                <Link to="/my-bookings" className="text-white hover:text-vanuatu-yellow transition">
                                    My Trips
                                </Link>
                                {user?.role === 'host' || user?.isHost ? (
                                    <Link to="/host/dashboard" className="text-white hover:text-vanuatu-yellow transition">
                                        Host Dashboard
                                    </Link>
                                ) : null}
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-white hover:text-vanuatu-yellow transition">
                                        Admin
                                    </Link>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="bg-vanuatu-green text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
                                    >
                                        {user?.firstName?.[0] || 'U'}
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                                            <div className="px-4 py-2 border-b">
                                                <div className="font-semibold text-gray-800">
                                                    {user?.firstName} {user?.lastName}
                                                </div>
                                                <div className="text-sm text-gray-600">{user?.email}</div>
                                            </div>
                                            <Link
                                                to="/my-bookings"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                📋 My Bookings
                                            </Link>
                                            <Link
                                                to="/wishlist"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                ❤️ Wishlist
                                            </Link>
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                👤 Profile Settings
                                            </Link>
                                            <Link
                                                to="/payment-methods"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                💳 Payment Methods
                                            </Link>
                                            <Link
                                                to="/check-in"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                📱 Quick Check-in
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-white hover:text-vanuatu-yellow transition">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-vanuatu-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden bg-vanuatu-blue border-t border-blue-600 py-4">
                        <Link
                            to="/properties"
                            className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Properties
                        </Link>
                        <Link
                            to="/services"
                            className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            🌟 Experiences
                        </Link>
                        <Link
                            to="/scenic-tours"
                            className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            ✈️ Scenic Tours
                        </Link>
                        <Link
                            to="/flights"
                            className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            ✈️ Flights
                        </Link>
                        <Link
                            to="/packages"
                            className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            📦 Packages
                        </Link>
                        <Link
                            to="/map"
                            className="block text-white hover:text-vanuatu-yellow transition px-4 py-2 font-semibold bg-blue-500/20 rounded"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            🗺️ Explore Map
                        </Link>
                        {token ? (
                            <>
                                <Link
                                    to="/wishlist"
                                    className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    ❤️ Wishlist
                                </Link>
                                <Link
                                    to="/my-bookings"
                                    className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    My Trips
                                </Link>
                                {(user?.role === 'host' || user?.isHost) && (
                                    <Link
                                        to="/host/dashboard"
                                        className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Host Dashboard
                                    </Link>
                                )}
                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setShowMobileMenu(false);
                                    }}
                                    className="block w-full text-left text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block text-white hover:text-vanuatu-yellow transition px-4 py-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
