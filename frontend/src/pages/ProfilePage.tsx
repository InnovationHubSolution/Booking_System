import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoadingState, FriendlyErrorMessage, Toast } from '../components/PremiumUX';
import api from '../api/axios';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    preferences?: {
        currency: string;
        language: string;
        newsletter: boolean;
        smsNotifications: boolean;
    };
}

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile>({
        firstName: '',
        lastName: '',
        email: '',
        preferences: {
            currency: 'VUV',
            language: 'en',
            newsletter: true,
            smsNotifications: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            }));
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/profile');
            const profileData = response.data?.data || response.data;
            
            if (profileData) {
                setProfile({
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    email: profileData.email || '',
                    phone: profileData.phone || '',
                    dateOfBirth: profileData.dateOfBirth || '',
                    nationality: profileData.nationality || '',
                    address: profileData.address || undefined,
                    emergencyContact: profileData.emergencyContact || undefined,
                    preferences: {
                        currency: profileData.preferences?.currency || 'VUV',
                        language: profileData.preferences?.language || 'en',
                        newsletter: profileData.preferences?.newsletter ?? true,
                        smsNotifications: profileData.preferences?.smsNotifications ?? false
                    }
                });
            }
            setError(null);
        } catch (error: any) {
            console.error('Profile fetch error:', error);
            // Don't show error if user just doesn't have extended profile yet
            if (error.response?.status !== 404) {
                setError(error.response?.data?.message || 'Failed to load profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/users/profile', profile);
            const updatedProfile = response.data?.data || response.data;
            setProfile({
                ...profile,
                ...updatedProfile
            });
            setNotification({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error: any) {
            setNotification({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingState message="Loading profile..." />;

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <FriendlyErrorMessage
                    error={error}
                    onRetry={fetchProfile}
                    onClose={() => setError(null)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">👤 My Profile</h1>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                    value={profile.preferences?.currency || 'VUV'}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        preferences: {
                                            currency: e.target.value,
                                            language: prev.preferences?.language || 'en',
                                            newsletter: prev.preferences?.newsletter || false,
                                            smsNotifications: prev.preferences?.smsNotifications || false
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="VUV">VUV - Vanuatu Vatu</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="AUD">AUD - Australian Dollar</option>
                                    <option value="NZD">NZD - New Zealand Dollar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                <select
                                    value={profile.preferences?.language || 'en'}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        preferences: {
                                            currency: prev.preferences?.currency || 'VUV',
                                            language: e.target.value,
                                            newsletter: prev.preferences?.newsletter || false,
                                            smsNotifications: prev.preferences?.smsNotifications || false
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                    <option value="bi">Bislama</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={profile.preferences?.newsletter || false}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        preferences: {
                                            currency: prev.preferences?.currency || 'VUV',
                                            language: prev.preferences?.language || 'en',
                                            newsletter: e.target.checked,
                                            smsNotifications: prev.preferences?.smsNotifications || false
                                        }
                                    }))}
                                    className="mr-3 rounded"
                                />
                                <span className="text-gray-700">Subscribe to newsletter</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={profile.preferences?.smsNotifications || false}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev,
                                        preferences: {
                                            currency: prev.preferences?.currency || 'VUV',
                                            language: prev.preferences?.language || 'en',
                                            newsletter: prev.preferences?.newsletter || false,
                                            smsNotifications: e.target.checked
                                        }
                                    }))}
                                    className="mr-3 rounded"
                                />
                                <span className="text-gray-700">Receive SMS notifications</span>
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Notification Toast */}
            {notification && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}