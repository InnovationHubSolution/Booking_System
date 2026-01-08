import React, { useState, useEffect } from 'react';
import { LoadingState, FriendlyErrorMessage, Toast, ConfirmationDialog } from '../components/PremiumUX';
import api from '../api/axios';

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'bank_transfer';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    email?: string; // for PayPal
    bankName?: string; // for bank transfer
    accountNumber?: string; // for bank transfer
}

export default function PaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showAddCard, setShowAddCard] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [newCard, setNewCard] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        name: '',
        isDefault: false
    });

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get('/users/payment-methods');
            setPaymentMethods(response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/payment-methods', newCard);
            setPaymentMethods(prev => [...prev, response.data]);
            setNewCard({ cardNumber: '', expiryMonth: '', expiryYear: '', cvc: '', name: '', isDefault: false });
            setShowAddCard(false);
            setNotification({ type: 'success', message: 'Payment method added successfully!' });
        } catch (error: any) {
            setNotification({ type: 'error', message: error.response?.data?.message || 'Failed to add payment method' });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/users/payment-methods/${id}`);
            setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
            setNotification({ type: 'success', message: 'Payment method removed successfully!' });
        } catch (error: any) {
            setNotification({ type: 'error', message: error.response?.data?.message || 'Failed to remove payment method' });
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await api.put(`/users/payment-methods/${id}/default`);
            setPaymentMethods(prev => prev.map(pm => ({ ...pm, isDefault: pm.id === id })));
            setNotification({ type: 'success', message: 'Default payment method updated!' });
        } catch (error: any) {
            setNotification({ type: 'error', message: error.response?.data?.message || 'Failed to update default payment method' });
        }
    };

    if (loading) return <LoadingState message="Loading payment methods..." />;

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <FriendlyErrorMessage
                    error={error}
                    onRetry={fetchPaymentMethods}
                    onClose={() => setError(null)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">💳 Payment Methods</h1>
                    <button
                        onClick={() => setShowAddCard(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add Payment Method
                    </button>
                </div>

                {paymentMethods.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Methods</h3>
                        <p className="text-gray-600 mb-6">Add a payment method to make bookings easier</p>
                        <button
                            onClick={() => setShowAddCard(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Add Your First Payment Method
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            {method.type === 'card' && '💳'}
                                            {method.type === 'paypal' && '🔵'}
                                            {method.type === 'bank_transfer' && '🏦'}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                {method.type === 'card' && (
                                                    <>
                                                        <span className="font-medium text-gray-900">
                                                            •••• •••• •••• {method.last4}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {method.brand?.toUpperCase()}
                                                        </span>
                                                        {method.isDefault && (
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                                Default
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                                {method.type === 'paypal' && (
                                                    <>
                                                        <span className="font-medium text-gray-900">PayPal</span>
                                                        <span className="text-sm text-gray-600">{method.email}</span>
                                                    </>
                                                )}
                                            </div>
                                            {method.type === 'card' && (
                                                <p className="text-sm text-gray-600">
                                                    Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!method.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(method.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setDeleteConfirm(method.id)}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Card Modal */}
                {showAddCard && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Payment Method</h2>
                            <form onSubmit={handleAddCard} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                    <input
                                        type="text"
                                        value={newCard.cardNumber}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                                        <select
                                            value={newCard.expiryMonth}
                                            onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">MM</option>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                                        <select
                                            value={newCard.expiryYear}
                                            onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">YYYY</option>
                                            {Array.from({ length: 10 }, (_, i) => {
                                                const year = new Date().getFullYear() + i;
                                                return <option key={year} value={year}>{year}</option>
                                            })}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                                        <input
                                            type="text"
                                            value={newCard.cvc}
                                            onChange={(e) => setNewCard(prev => ({ ...prev, cvc: e.target.value }))}
                                            placeholder="123"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={newCard.name}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="John Doe"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={newCard.isDefault}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        className="mr-3 rounded"
                                    />
                                    <span className="text-gray-700">Set as default payment method</span>
                                </label>
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Add Payment Method
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCard(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <ConfirmationDialog
                        title="Remove Payment Method"
                        message="Are you sure you want to remove this payment method? This action cannot be undone."
                        icon="warning"
                        confirmText="Remove"
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(deleteConfirm)}
                        onCancel={() => setDeleteConfirm(null)}
                    />
                )}
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