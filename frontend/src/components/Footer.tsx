import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-gradient-to-br from-pacific-deep via-pacific-blue to-pacific-turquoise text-white mt-20">
            {/* Decorative wave separator */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white">
                <svg className="absolute bottom-0 w-full h-16" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 22L60 25.3C120 28.7 240 35.3 360 37.8C480 40.3 600 38.7 720 32.2C840 25.7 960 14.3 1080 12.8C1200 11.3 1320 19.7 1380 23.8L1440 28V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z"
                        fill="url(#footer-gradient)" />
                    <defs>
                        <linearGradient id="footer-gradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0A4A6B" />
                            <stop offset="50%" stopColor="#1B7FA8" />
                            <stop offset="100%" stopColor="#00A99D" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Pattern overlay */}
            <div className="absolute inset-0 pattern-kastom-mat opacity-5 pointer-events-none"></div>
            <div className="absolute inset-0 pattern-reef opacity-5 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-8">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-4xl">🌴</span>
                            <h3 className="text-xl font-bold">Vanuatu Travel Hub</h3>
                        </div>
                        <p className="text-cloud-gray mb-4 leading-relaxed">
                            Your gateway to paradise. Discover the beauty, culture, and adventure of Vanuatu's islands.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-sunset rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-xl">📘</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-sunset rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-xl">📷</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-sunset rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-xl">🐦</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-sunset rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <span className="text-xl">▶️</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>🔗</span> Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/properties" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Properties
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Experiences
                                </Link>
                            </li>
                            <li>
                                <Link to="/scenic-tours" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Scenic Tours
                                </Link>
                            </li>
                            <li>
                                <Link to="/packages" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Packages
                                </Link>
                            </li>
                            <li>
                                <Link to="/map" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Explore Map
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>💬</span> Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/my-bookings" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    My Bookings
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-of-service" className="text-cloud-gray hover:text-sunset transition-colors duration-300 flex items-center gap-2 group">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>📞</span> Contact
                        </h4>
                        <ul className="space-y-3 text-cloud-gray">
                            <li className="flex items-start gap-2">
                                <span className="text-sunset mt-1">📍</span>
                                <span>Port Vila, Vanuatu</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sunset mt-1">📧</span>
                                <a href="mailto:info@vanuatutravelhub.com" className="hover:text-sunset transition-colors duration-300">
                                    info@vanuatutravelhub.com
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sunset mt-1">☎️</span>
                                <a href="tel:+678123456" className="hover:text-sunset transition-colors duration-300">
                                    +678 123 456
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sunset mt-1">⏰</span>
                                <span>Mon-Sat: 8AM - 6PM</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="glass-card-dark rounded-pacific p-8 mb-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                            <span>✉️</span> Stay Connected
                        </h3>
                        <p className="text-cloud-gray mb-4">
                            Subscribe to receive exclusive deals, travel tips, and island updates
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sunset"
                            />
                            <button className="btn-accent px-6 py-3 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment methods */}
                <div className="flex flex-wrap justify-center items-center gap-4 mb-8 pb-8 border-b border-white/10">
                    <span className="text-cloud-gray text-sm">We accept:</span>
                    <div className="flex gap-3 items-center">
                        <div className="bg-white/10 px-3 py-2 rounded text-xl">💳</div>
                        <div className="bg-white/10 px-3 py-2 rounded text-xl">💰</div>
                        <div className="bg-white/10 px-3 py-2 rounded text-xl">🏦</div>
                        <div className="bg-white/10 px-3 py-2 rounded text-xl">📱</div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-cloud-gray text-sm">
                    <p>
                        © {currentYear} Vanuatu Travel Hub. All rights reserved.
                    </p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-coral animate-pulse">❤️</span> in the Pacific
                    </p>
                </div>
            </div>
        </footer>
    );
}
