import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
    const { token, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-vanuatu-blue shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                        🌴 Vanuatu Bookings
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/properties" className="text-white hover:text-vanuatu-yellow transition">
                            Properties
                        </Link>
                        <Link to="/services" className="text-white hover:text-vanuatu-yellow transition">
                            Experiences
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
                                                My Bookings
                                            </Link>
                                            <Link
                                                to="/wishlist"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                Wishlist
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
                    <button className="md:hidden text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="width" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
