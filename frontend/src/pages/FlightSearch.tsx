import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import FlightMap from '../components/FlightMap';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
}

interface Flight {
    _id: string;
    flightNumber: string;
    airline: {
        code: string;
        name: string;
        logo: string;
    };
    departure: {
        airport: Airport;
        dateTime: string;
    };
    arrival: {
        airport: Airport;
        dateTime: string;
    };
    duration: number;
    classes: {
        economy: {
            available: number;
            price: number;
            baggage: { cabin: string; checked: string };
            amenities: string[];
        };
        business?: {
            available: number;
            price: number;
            baggage: { cabin: string; checked: string };
            amenities: string[];
        };
    };
    stops: number;
    status: string;
    currency: string;
}

const FlightSearch = () => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const [searchParams, setSearchParams] = useState({
        from: 'VLI',
        to: 'SYD',
        departDate: '',
        returnDate: '',
        passengers: 1,
        class: 'economy'
    });

    const [flights, setFlights] = useState<{ outbound: Flight[]; return: Flight[] }>({
        outbound: [],
        return: []
    });
    const [loading, setLoading] = useState(false);
    const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);

    const popularAirports = [
        { code: 'VLI', city: 'Port Vila', country: 'Vanuatu', coords: [-17.6993, 168.3199] as [number, number] },
        { code: 'SYD', city: 'Sydney', country: 'Australia', coords: [-33.9461, 151.1772] as [number, number] },
        { code: 'NOU', city: 'Noumea', country: 'New Caledonia', coords: [-22.0147, 166.2130] as [number, number] },
        { code: 'BNE', city: 'Brisbane', country: 'Australia', coords: [-27.3842, 153.1175] as [number, number] },
        { code: 'AKL', city: 'Auckland', country: 'New Zealand', coords: [-37.0082, 174.7850] as [number, number] },
        { code: 'NAN', city: 'Nadi', country: 'Fiji', coords: [-17.7554, 177.4430] as [number, number] }
    ];

    const searchFlights = async () => {
        if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/flights/search', {
                params: searchParams
            });
            const flightsData = response.data || { outbound: [], return: [] };
            setFlights(flightsData);
        } catch (error) {
            console.error('Error searching flights:', error);
            alert('Failed to search flights');
        }
        setLoading(false);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateTime: string) => {
        return new Date(dateTime).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleBooking = () => {
        if (!selectedOutbound) {
            alert('Please select an outbound flight');
            return;
        }

        navigate('/booking/flight', {
            state: {
                outbound: selectedOutbound,
                return: selectedReturn,
                passengers: searchParams.passengers,
                class: searchParams.class
            }
        });
    };

    const FlightCard = ({ flight, onSelect, isSelected }: { flight: Flight; onSelect: () => void; isSelected: boolean }) => {
        const flightClass = searchParams.class as 'economy' | 'business';
        const classInfo = flight.classes[flightClass];

        if (!classInfo) {
            return null;
        }

        return (
            <div
                onClick={onSelect}
                className={`border rounded-lg p-4 mb-4 cursor-pointer transition-all ${isSelected ? 'border-[#004D7A] bg-blue-50' : 'border-gray-300 hover:border-[#004D7A]'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <img
                            src={flight.airline.logo}
                            alt={flight.airline.name}
                            className="w-12 h-12 object-contain"
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{formatTime(flight.departure.dateTime)}</p>
                                    <p className="text-sm text-gray-600">{flight.departure.airport.code}</p>
                                    <p className="text-xs text-gray-500">{formatDate(flight.departure.dateTime)}</p>
                                </div>

                                <div className="flex-1 px-4 text-center">
                                    <p className="text-sm text-gray-600">{formatDuration(flight.duration)}</p>
                                    <div className="relative h-0.5 bg-gray-300 my-1">
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                            {flight.stops === 0 ? (
                                                <span className="text-xs text-[#009E60]">Direct</span>
                                            ) : (
                                                <span className="text-xs text-gray-600">{flight.stops} stop(s)</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{flight.airline.name}</p>
                                </div>

                                <div className="text-center">
                                    <p className="text-2xl font-bold">{formatTime(flight.arrival.dateTime)}</p>
                                    <p className="text-sm text-gray-600">{flight.arrival.airport.code}</p>
                                    <p className="text-xs text-gray-500">{formatDate(flight.arrival.dateTime)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <div className="text-sm text-gray-600">
                                    <p>Baggage: {classInfo?.baggage.cabin} cabin, {classInfo?.baggage.checked} checked</p>
                                    <p className="text-xs">{classInfo?.amenities.join(' • ')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-[#004D7A]">
                                        {formatPrice(classInfo?.price || 0, false)}
                                    </p>
                                    <p className="text-sm text-gray-600">per person</p>
                                    <p className="text-xs text-green-600">{classInfo?.available} seats left</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Bar */}
            <div className="bg-[#004D7A] text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">✈️ International Flight Booking</h1>
                        <CurrencySelector />
                    </div>

                    <div className="bg-white rounded-lg p-6 text-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">From</label>
                                <select
                                    value={searchParams.from}
                                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                >
                                    {popularAirports.map((airport) => (
                                        <option key={airport.code} value={airport.code}>
                                            {airport.code} - {airport.city}, {airport.country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">To</label>
                                <select
                                    value={searchParams.to}
                                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                >
                                    {popularAirports.map((airport) => (
                                        <option key={airport.code} value={airport.code}>
                                            {airport.code} - {airport.city}, {airport.country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Depart Date</label>
                                <input
                                    type="date"
                                    value={searchParams.departDate}
                                    onChange={(e) => setSearchParams({ ...searchParams, departDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Return Date (Optional)</label>
                                <input
                                    type="date"
                                    value={searchParams.returnDate}
                                    onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                    min={searchParams.departDate}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Passengers</label>
                                <input
                                    type="number"
                                    value={searchParams.passengers}
                                    onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                    min="1"
                                    max="9"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Class</label>
                                <select
                                    value={searchParams.class}
                                    onChange={(e) => setSearchParams({ ...searchParams, class: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D7A]"
                                >
                                    <option value="economy">Economy</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={searchFlights}
                                    disabled={loading}
                                    className="w-full bg-[#FFCE00] text-[#004D7A] py-2 px-6 rounded-lg font-semibold hover:bg-[#FFD700] transition disabled:bg-gray-300"
                                >
                                    {loading ? 'Searching...' : 'Search Flights'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-4 py-8">
                {/* Flight Route Map */}
                {(flights.outbound.length > 0 || flights.return.length > 0) && searchParams.from && searchParams.to && (
                    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Flight Route</h2>
                        <FlightMap
                            departureCoords={popularAirports.find(a => a.code === searchParams.from)?.coords || [0, 0]}
                            arrivalCoords={popularAirports.find(a => a.code === searchParams.to)?.coords || [0, 0]}
                            departureAirport={`${searchParams.from} - ${popularAirports.find(a => a.code === searchParams.from)?.city}`}
                            arrivalAirport={`${searchParams.to} - ${popularAirports.find(a => a.code === searchParams.to)?.city}`}
                        />
                    </div>
                )}

                {flights.outbound.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Outbound Flights ({flights.outbound.length} found)
                        </h2>
                        {flights.outbound.map((flight) => (
                            <FlightCard
                                key={flight._id}
                                flight={flight}
                                onSelect={() => setSelectedOutbound(flight)}
                                isSelected={selectedOutbound?._id === flight._id}
                            />
                        ))}
                    </div>
                )}

                {flights.return.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Return Flights ({flights.return.length} found)
                        </h2>
                        {flights.return.map((flight) => (
                            <FlightCard
                                key={flight._id}
                                flight={flight}
                                onSelect={() => setSelectedReturn(flight)}
                                isSelected={selectedReturn?._id === flight._id}
                            />
                        ))}
                    </div>
                )}

                {(selectedOutbound || selectedReturn) && (
                    <div className="sticky bottom-0 bg-white border-t-2 border-[#004D7A] p-4">
                        <div className="container mx-auto flex items-center justify-between">
                            <div>
                                <p className="text-lg font-semibold">
                                    Total: {formatPrice(((selectedOutbound?.classes[searchParams.class as 'economy' | 'business']?.price || 0) +
                                        (selectedReturn?.classes[searchParams.class as 'economy' | 'business']?.price || 0)) * searchParams.passengers, false)}
                                </p>
                                <p className="text-sm text-gray-600">for {searchParams.passengers} passenger(s)</p>
                            </div>
                            <button
                                onClick={handleBooking}
                                className="bg-[#004D7A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#003555] transition"
                            >
                                Continue to Booking
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightSearch;
