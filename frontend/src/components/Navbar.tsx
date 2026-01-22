import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import TourismBanner from './TourismBanner';

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
        <>
            <TourismBanner />
            <nav className="bg-gradient-to-br from-pacific-deep via-pacific-blue to-pacific-turquoise shadow-pacific-lg relative z-50">
                {/* Sand Drawing Pattern Background */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400"%3E%3Cg fill="none" stroke="%23D4B896" stroke-width="2.5"%3E%3Cpath d="M100,200 Q110,180 120,200 T140,200 Q150,220 160,200 T180,200" stroke-linecap="round" /%3E%3Cpath d="M200,150 Q210,130 220,150 T240,150 Q250,170 260,150 T280,150" stroke-linecap="round" /%3E%3Cpath d="M300,250 Q310,230 320,250 T340,250 Q350,270 360,250 T380,250" stroke-linecap="round" /%3E%3Ccircle cx="120" cy="170" r="8" stroke-width="2" /%3E%3Ccircle cx="240" cy="180" r="10" stroke-width="2" /%3E%3Ccircle cx="340" cy="220" r="9" stroke-width="2" /%3E%3Cpath d="M150,280 L160,290 L150,300 L140,290 Z" stroke-width="2" /%3E%3Cpath d="M270,130 L280,140 L270,150 L260,140 Z" stroke-width="2" /%3E%3Cpath d="M80,230 Q85,225 90,230 Q85,235 80,230" stroke-width="2" /%3E%3Cpath d="M400,180 Q405,175 410,180 Q405,185 400,180" stroke-width="2" /%3E%3Cpath d="M180,320 L185,315 L190,320 L185,325 Z" stroke-width="1.5" /%3E%3Cpath d="M320,100 L325,95 L330,100 L325,105 Z" stroke-width="1.5" /%3E%3Cline x1="100" y1="150" x2="110" y2="160" stroke-width="2" stroke-linecap="round" /%3E%3Cline x1="110" y1="150" x2="100" y2="160" stroke-width="2" stroke-linecap="round" /%3E%3Cline x1="360" y1="180" x2="370" y2="190" stroke-width="2" stroke-linecap="round" /%3E%3Cline x1="370" y1="180" x2="360" y2="190" stroke-width="2" stroke-linecap="round" /%3E%3Cpath d="M220,280 Q230,270 240,280" stroke-width="2" stroke-linecap="round" /%3E%3Cpath d="M220,290 Q230,300 240,290" stroke-width="2" stroke-linecap="round" /%3E%3C/g%3E%3C/svg%3E')`,
                        backgroundSize: '250px 200px',
                        backgroundRepeat: 'repeat',
                    }}
                ></div>

                {/* Reef pattern overlay */}
                <div className="absolute inset-0 pattern-reef opacity-10 pointer-events-none"></div>
                {/* Wave animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-wave pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:text-sunset transition-colors duration-300">
                            <img 
                                src="https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=100&h=100&fit=crop" 
                                alt="Vanuatu Totem" 
                                className="h-10 w-10 object-cover rounded-full border-2 border-sunset shadow-lg"
                            />
                            <span className="font-heading">Vanuatu Travel Hub</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            {/* Accommodations Dropdown */}
                            <div className="relative group">
                                <button className="text-white hover:text-sunset transition-colors duration-300 flex items-center gap-1 font-medium px-3 py-2 rounded-lg hover:bg-white/10">
                                    🏠 Stay
                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-pacific shadow-pacific-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pattern-card">
                                    <div className="relative z-10">
                                        <Link to="/properties" className="block px-4 py-2 text-pacific-deep hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200 font-medium">
                                            🏨 All Properties
                                        </Link>
                                        <div className="pattern-divider-namele my-1 mx-4"></div>
                                        <Link to="/properties?type=hotel" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🏨 Hotels
                                        </Link>
                                        <Link to="/properties?type=resort" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🏖️ Resorts
                                        </Link>
                                        <Link to="/properties?type=villa" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🏡 Villas
                                        </Link>
                                        <Link to="/properties?type=bungalow" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🛖 Bungalows
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Experiences Dropdown */}
                            <div className="relative group">
                                <button className="text-white hover:text-sunset transition-colors duration-300 flex items-center gap-1 font-medium px-3 py-2 rounded-lg hover:bg-white/10">
                                    🌟 Experiences
                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-pacific shadow-pacific-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pattern-card">
                                    <div className="relative z-10">
                                        <Link to="/services" className="block px-4 py-2 text-pacific-deep hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200 font-medium">
                                            🎯 All Experiences
                                        </Link>
                                        <div className="pattern-divider-namele my-1 mx-4"></div>
                                        <Link to="/scenic-tours" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            ✈️ Scenic Tours
                                        </Link>
                                        <Link to="/services?category=adventure" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🏄 Adventure
                                        </Link>
                                        <Link to="/services?category=cultural" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🗿 Cultural Tours
                                        </Link>
                                        <Link to="/services?category=diving" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🤿 Diving
                                        </Link>
                                        <Link to="/services?category=nature" className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200">
                                            🌺 Nature
                                        </Link>
                                    </div>
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
                                                    <div className="text-sm text-stone">{user?.email}</div>
                                                </div>
                                                <div className="pattern-divider-namele my-2 mx-4"></div>
                                                <Link
                                                    to="/my-bookings"
                                                    className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200"
                                                    onClick={() => setShowMenu(false)}
                                                >
                                                    📋 My Bookings
                                                </Link>
                                                <Link
                                                    to="/wishlist"
                                                    className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200"
                                                    onClick={() => setShowMenu(false)}
                                                >
                                                    ❤️ Wishlist
                                                </Link>
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200"
                                                    onClick={() => setShowMenu(false)}
                                                >
                                                    👤 Profile Settings
                                                </Link>
                                                <Link
                                                    to="/payment-methods"
                                                    className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200"
                                                    onClick={() => setShowMenu(false)}
                                                >
                                                    💳 Payment Methods
                                                </Link>
                                                <Link
                                                    to="/check-in"
                                                    className="block px-4 py-2 text-shadow hover:bg-pacific-light/10 hover:text-pacific-blue transition-colors duration-200"
                                                    onClick={() => setShowMenu(false)}
                                                >
                                                    📱 Quick Check-in
                                                </Link>
                                                <div className="pattern-divider-namele my-2 mx-4"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-flame hover:bg-flame/10 font-medium transition-colors duration-200"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-white hover:text-sunset transition-colors duration-300 font-medium px-3 py-2 rounded-lg hover:bg-white/10">
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-gradient-sunset text-white px-6 py-2 rounded-lg font-semibold hover:shadow-sunset transform hover:scale-105 transition-all duration-300"
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
        </>
    );
}
