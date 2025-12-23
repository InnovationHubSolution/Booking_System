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
        const startDate = new Date(selectedDate);
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + service.duration);

        try {
            await api.post('/bookings', {
                serviceId,
                startDate,
                endDate,
                guestCount,
                notes
            });

            alert('Booking created successfully! 🎉');
            navigate('/my-bookings');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Booking failed');
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
