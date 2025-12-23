import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

export default function AdminDashboard() {
    const { formatPrice } = useCurrencyStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, revenue: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data);

            const total = response.data.length;
            const confirmed = response.data.filter((b: any) => b.status === 'confirmed').length;
            const pending = response.data.filter((b: any) => b.status === 'pending').length;
            const revenue = response.data
                .filter((b: any) => b.paymentStatus === 'paid')
                .reduce((sum: number, b: any) => sum + b.totalPrice, 0);

            setStats({ total, confirmed, pending, revenue });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const updateBookingStatus = async (bookingId: string, status: string) => {
        try {
            await api.patch(`/bookings/${bookingId}/status`, { status });
            fetchData();
        } catch (error) {
            alert('Failed to update booking');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-vanuatu-blue">Admin Dashboard</h1>
                <CurrencySelector />
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium">Total Bookings</h3>
                    <p className="text-3xl font-bold mt-2 text-vanuatu-blue">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium">Confirmed</h3>
                    <p className="text-3xl font-bold mt-2 text-vanuatu-green">{stats.confirmed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
                    <p className="text-3xl font-bold mt-2 text-vanuatu-yellow">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-2 text-vanuatu-green">{formatPrice(stats.revenue, false)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4">Customer</th>
                                <th className="text-left py-3 px-4">Service</th>
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Guests</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Price</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        {booking.userId?.firstName} {booking.userId?.lastName}
                                    </td>
                                    <td className="py-3 px-4">{booking.serviceId?.name}</td>
                                    <td className="py-3 px-4">
                                        {format(new Date(booking.startDate), 'PP')}
                                    </td>
                                    <td className="py-3 px-4">{booking.guestCount}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-semibold">{formatPrice(booking.totalPrice, false)}</td>
                                    <td className="py-3 px-4">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                                            className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-vanuatu-blue"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
