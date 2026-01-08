import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import { useAuthStore } from '../store/authStore';

interface ScenicFlyTour {
    _id: string;
    name: string;
    description: string;
    images: string[];
    duration: number;
    route: {
        departure: {
            location: string;
            coordinates: { lat: number; lng: number };
        };
        highlights: {
            name: string;
            description: string;
            coordinates?: { lat: number; lng: number };
            timeOverLocation?: number;
        }[];
        return: {
            location: string;
            coordinates: { lat: number; lng: number };
        };
    };
    aircraft: {
        type: string;
        model: string;
        capacity: number;
        features: string[];
    };
    pricing: {
        perPerson: number;
        currency: string;
        privateCharter?: number;
        childDiscount?: number;
        groupDiscount?: {
            minimumPeople: number;
            discountPercentage: number;
        };
    };
    schedule: {
        availableDays: number[];
        timeSlots: {
            departureTime: string;
            availableSeats: number;
        }[];
    };
    includes: string[];
    requirements: {
        minimumAge?: number;
        weightLimit?: number;
        healthRestrictions?: string[];
        weatherDependent: boolean;
    };
    cancellationPolicy: {
        freeCancellation: number;
        refundPercentage: {
            moreThan24Hours: number;
            lessThan24Hours: number;
            lessThan12Hours: number;
        };
    };
    rating: number;
    reviewCount: number;
    safetyInformation: string[];
}

export default function ScenicFlyTourDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const { token } = useAuthStore();
    const isAuthenticated = !!token;
    const [tour, setTour] = useState<ScenicFlyTour | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [passengers, setPassengers] = useState(1);

    useEffect(() => {
        fetchTourDetails();
    }, [id]);

    const fetchTourDetails = async () => {
        try {
            const response = await api.get(`/scenic-tours/${id}`);
            setTour(response.data);
        } catch (error) {
            console.error('Error fetching tour details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/scenic-tours/${id}` } });
            return;
        }
        navigate(`/booking/scenic-tour/${id}`, { state: { passengers } });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins} minutes`;
        if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
    };

    const getDayName = (day: number) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    };

    const calculatePrice = () => {
        if (!tour) return 0;
        let price = tour.pricing.perPerson * passengers;

        // Apply group discount if applicable
        if (tour.pricing.groupDiscount && passengers >= tour.pricing.groupDiscount.minimumPeople) {
            price = price * (1 - tour.pricing.groupDiscount.discountPercentage / 100);
        }

        return price;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading tour details...</p>
                </div>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Tour Not Found</h2>
                <p className="text-gray-600 mb-6">The scenic fly tour you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/scenic-tours')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                    Browse All Tours
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Image Gallery */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-3">
                            <div className="relative h-96 rounded-xl overflow-hidden">
                                {tour.images[selectedImage] ? (
                                    <img
                                        src={tour.images[selectedImage]}
                                        alt={tour.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <span className="text-white text-9xl">✈️</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                            {tour.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${tour.name} ${idx + 1}`}
                                    className={`h-24 w-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition ${selectedImage === idx ? 'ring-4 ring-blue-600' : ''
                                        }`}
                                    onClick={() => setSelectedImage(idx)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">{tour.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`text-xl ${i < Math.round(tour.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                    <span className="text-gray-600">
                                        {tour.rating.toFixed(1)} ({tour.reviewCount} reviews)
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{tour.description}</p>
                        </div>

                        {/* Route Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">✈️ Flight Route</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                                        S
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Departure</h3>
                                        <p className="text-gray-600">{tour.route.departure.location}</p>
                                    </div>
                                </div>

                                {tour.route.highlights.map((highlight, idx) => (
                                    <div key={idx} className="flex items-start gap-3 ml-4">
                                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{highlight.name}</h3>
                                            <p className="text-gray-600 text-sm">{highlight.description}</p>
                                            {highlight.timeOverLocation && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    ⏱️ {highlight.timeOverLocation} minutes over location
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-start gap-3">
                                    <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                                        E
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Return</h3>
                                        <p className="text-gray-600">{tour.route.return.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">✓ What's Included</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {tour.includes.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-green-500 text-xl">✓</span>
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Aircraft Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">🛩️ Aircraft Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Type</p>
                                    <p className="font-semibold text-gray-800">{tour.aircraft.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Model</p>
                                    <p className="font-semibold text-gray-800">{tour.aircraft.model}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Capacity</p>
                                    <p className="font-semibold text-gray-800">{tour.aircraft.capacity} passengers</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 mb-2">Features</p>
                                <div className="flex flex-wrap gap-2">
                                    {tour.aircraft.features.map((feature, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">ℹ️ Requirements & Restrictions</h2>
                            <div className="space-y-3">
                                {tour.requirements.minimumAge && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Minimum Age:</span> {tour.requirements.minimumAge} years
                                    </p>
                                )}
                                {tour.requirements.weightLimit && (
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Weight Limit:</span> {tour.requirements.weightLimit} kg per person
                                    </p>
                                )}
                                {tour.requirements.weatherDependent && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                        <p className="text-yellow-800">
                                            <span className="font-semibold">⚠️ Weather Dependent:</span> Flights may be rescheduled due to weather conditions
                                        </p>
                                    </div>
                                )}
                                {tour.requirements.healthRestrictions && tour.requirements.healthRestrictions.length > 0 && (
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-2">Health Restrictions:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {tour.requirements.healthRestrictions.map((restriction, idx) => (
                                                <li key={idx} className="text-gray-600">{restriction}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Safety Information */}
                        {tour.safetyInformation && tour.safetyInformation.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Safety Information</h2>
                                <ul className="space-y-2">
                                    {tour.safetyInformation.map((info, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{info}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Cancellation Policy */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Cancellation Policy</h2>
                            <div className="space-y-3">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Free Cancellation:</span> Up to {tour.cancellationPolicy.freeCancellation} hours before departure
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Refund Schedule:</span>
                                    </p>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li>• More than 24 hours: {tour.cancellationPolicy.refundPercentage.moreThan24Hours}% refund</li>
                                        <li>• Less than 24 hours: {tour.cancellationPolicy.refundPercentage.lessThan24Hours}% refund</li>
                                        <li>• Less than 12 hours: {tour.cancellationPolicy.refundPercentage.lessThan12Hours}% refund</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-1">From</p>
                                <div className="text-4xl font-bold text-blue-600">
                                    {formatPrice(tour.pricing.perPerson, false)}
                                </div>
                                <p className="text-sm text-gray-500">per person</p>
                            </div>

                            {/* Passenger Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Number of Passengers
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={tour.aircraft.capacity}
                                    value={passengers}
                                    onChange={(e) => setPassengers(Math.max(1, Math.min(tour.aircraft.capacity, parseInt(e.target.value) || 1)))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum {tour.aircraft.capacity} passengers
                                </p>
                            </div>

                            {/* Group Discount Info */}
                            {tour.pricing.groupDiscount && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-600 text-xl">💰</span>
                                        <div>
                                            <p className="font-semibold text-green-800 text-sm">Group Discount Available!</p>
                                            <p className="text-xs text-green-700 mt-1">
                                                {tour.pricing.groupDiscount.discountPercentage}% off for {tour.pricing.groupDiscount.minimumPeople}+ passengers
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Total Price */}
                            <div className="border-t border-b py-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Total Price</span>
                                    <span className="text-2xl font-bold text-gray-800">
                                        {formatPrice(calculatePrice(), false)}
                                    </span>
                                </div>
                            </div>

                            {/* Schedule Info */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">📅 Available Days</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tour.schedule.availableDays.map(day => (
                                        <span
                                            key={day}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold"
                                        >
                                            {getDayName(day)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Key Info */}
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span>⏱️</span>
                                    <span>Duration: {formatDuration(tour.duration)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span>📍</span>
                                    <span>Departs from: {tour.route.departure.location}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Book Now
                            </button>

                            {tour.pricing.privateCharter && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600 mb-2">Want to book the entire aircraft?</p>
                                    <p className="text-lg font-semibold text-blue-600">
                                        Private Charter: {formatPrice(tour.pricing.privateCharter, false)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
