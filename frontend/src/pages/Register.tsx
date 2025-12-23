import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/register', formData);
            setAuth(response.data.token, response.data.userId, response.data.user);
            navigate('/services');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold mb-6 text-vanuatu-blue">Register</h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            placeholder="+678..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-vanuatu-blue"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-vanuatu-green text-white py-3 rounded-lg hover:bg-green-600"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-vanuatu-blue hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
