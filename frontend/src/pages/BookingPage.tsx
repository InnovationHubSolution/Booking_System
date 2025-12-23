import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';
import 'react-calendar/dist/Calendar.css';

export default function BookingPage() {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const [service, setService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [notes, setNotes] = useState('');
    const [guestDetails, setGuestDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchService = async () => {
            const response = await api.get(`/services/${serviceId}`);
            setService(response.data);
        };
        fetchService();
    }, [serviceId]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        const [hours, minutes] = selectedTime.split(':');
        const checkInDate = new Date(selectedDate);
        checkInDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const checkOutDate = new Date(checkInDate);
        checkOutDate.setMinutes(checkOutDate.getMinutes() + service.duration);

        try {
            await api.post('/bookings/service', {
                serviceId,
                checkInDate,
                checkOutDate,
                guestCount: {
                    adults: guestCount,
                    children: 0
                },
                guestDetails,
                specialRequests: notes,
                bookingSource: 'online',
                currency: 'VUV'
            });

            alert('Booking created successfully! 🎉');
            navigate('/my-bookings');
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(error.response?.data?.message || 'Booking failed. Please try again.');
        }
    };

    if (!service) return <div className="text-center py-20">Loading...</div>;

    const totalPrice = service.price * guestCount;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-vanuatu-blue">Book {service.name}</h1>
                <CurrencySelector />
            </div>
            <p className="text-gray-600 mb-8">📍 {service.location}</p>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold mb-3">Select Date</h3>
                    <Calendar
                        onChange={(value: any) => setSelectedDate(value)}
                        value={selectedDate}
                        minDate={new Date()}
                        className="rounded-lg shadow"
                    />
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Select Time</label>
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Number of Guests</label>
                        <input
                            type="number"
                            min="1"
                            max={service.capacity}
                            value={guestCount}
                            onChange={(e) => setGuestCount(parseInt(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Max capacity: {service.capacity}</p>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold mb-3">Guest Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name *</label>
                                <input
                                    type="text"
                                    value={guestDetails.firstName}
                                    onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={guestDetails.lastName}
                                    onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={guestDetails.email}
                                    onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone *</label>
                                <input
                                    type="tel"
                                    value={guestDetails.phone}
                                    onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                                    placeholder="+678..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            rows={4}
                            placeholder="Any special requirements..."
                        />
                    </div>

                    <div className="bg-vanuatu-blue bg-opacity-10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm">
                            <p>Price per guest: {formatPrice(service.price, false)}</p>
                            <p>Guests: {guestCount}</p>
                            <p>Duration: {service.duration} minutes</p>
                            <p className="text-lg font-bold text-vanuatu-blue pt-2">
                                Total: {formatPrice(totalPrice, false)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-vanuatu-green text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
                    >
                        Confirm Booking
                    </button>
                </form>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-3">What's Included</h3>
                <div className="grid grid-cols-2 gap-2">
                    {service.amenities.map((amenity: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-vanuatu-green">✓</span>
                            <span>{amenity}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
