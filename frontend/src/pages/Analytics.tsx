import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    ChartBarIcon,
    UsersIcon,
    HomeIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
    overview: {
        totalBookings: number;
        totalRevenue: number;
        totalUsers: number;
        totalProperties: number;
        bookingGrowth: number;
        revenueGrowth: number;
    };
    bookingsByMonth: Array<{ month: string; count: number; revenue: number }>;
    bookingsByType: Array<{ type: string; count: number; percentage: number }>;
    topProperties: Array<{ name: string; bookings: number; revenue: number }>;
    recentBookings: Array<{
        _id: string;
        reservationNumber: string;
        bookingType: string;
        status: string;
        totalAmount: number;
        bookingDate: string;
        user: { firstName: string; lastName: string };
    }>;
}

const Analytics: React.FC = () => {
    const { token } = useAuthStore();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/analytics?range=${timeRange}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    const { overview, bookingsByMonth, bookingsByType, topProperties, recentBookings } = analytics;

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ElementType;
        growth?: number;
        color: string;
    }> = ({ title, value, icon: Icon, growth, color }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                    {growth !== undefined && (
                        <p className={`mt-2 text-sm flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${growth < 0 ? 'rotate-180' : ''}`} />
                            {Math.abs(growth)}% from last period
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600">Track your business performance and insights</p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6 flex gap-2">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Bookings"
                        value={overview.totalBookings.toLocaleString()}
                        icon={CalendarIcon}
                        growth={overview.bookingGrowth}
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`$${overview.totalRevenue.toLocaleString()}`}
                        icon={CurrencyDollarIcon}
                        growth={overview.revenueGrowth}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Total Users"
                        value={overview.totalUsers.toLocaleString()}
                        icon={UsersIcon}
                        color="bg-purple-600"
                    />
                    <StatCard
                        title="Total Properties"
                        value={overview.totalProperties.toLocaleString()}
                        icon={HomeIcon}
                        color="bg-orange-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Bookings by Month */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings by Month</h2>
                        <div className="space-y-3">
                            {bookingsByMonth.map((item) => (
                                <div key={item.month} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{item.month}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 rounded-full h-2"
                                                style={{
                                                    width: `${(item.count / Math.max(...bookingsByMonth.map(b => b.count))) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {item.count} (${item.revenue.toLocaleString()})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bookings by Type */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings by Type</h2>
                        <div className="space-y-4">
                            {bookingsByType.map((item, index) => {
                                const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600'];
                                return (
                                    <div key={item.type}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
                                            <span className="text-sm text-gray-600">{item.percentage}%</span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${colors[index % colors.length]} rounded-full h-2`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{item.count} bookings</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Properties */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Properties</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Property Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bookings
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topProperties.map((property, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {property.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {property.bookings}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                            ${property.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reservation #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentBookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {booking.reservationNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.user.firstName} {booking.user.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                            {booking.bookingType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                            ${booking.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
