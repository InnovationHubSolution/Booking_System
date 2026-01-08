/**
 * Payment Integration Guide
 * 
 * This file demonstrates how the payment system is wired and configured
 * across the booking system components.
 */

// Frontend Payment Flow
import React, { useState } from 'react';
import api from '../api/axios';

// Example of complete payment integration
export const PaymentIntegrationExample = () => {
    const [paymentStep, setPaymentStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [bookingData, setBookingData] = useState({
        carId: 'car-123',
        pickupDate: '2024-01-15',
        returnDate: '2024-01-18',
        totalAmount: 16500 // VUV
    });

    // Step 1: Create payment intent (for Stripe/card payments)
    const createPaymentIntent = async () => {
        try {
            const response = await api.post('/api/payments/create-intent', {
                bookingId: bookingData.carId,
                amount: bookingData.totalAmount,
                currency: 'vt' // VUV not supported by Stripe, so we use closest
            });

            return response.data;
        } catch (error) {
            console.error('Failed to create payment intent:', error);
            throw error;
        }
    };

    // Step 2: Process payment with selected method
    const processPayment = async (paymentMethod: string, paymentDetails: any) => {
        try {
            // Create booking first
            const bookingResponse = await api.post('/api/bookings', {
                type: 'car-rental',
                itemId: bookingData.carId,
                details: {
                    pickupDate: bookingData.pickupDate,
                    returnDate: bookingData.returnDate
                },
                pricing: {
                    totalAmount: bookingData.totalAmount,
                    currency: 'VUV'
                }
            });

            const bookingId = bookingResponse.data.id;

            // Process payment
            const paymentResponse = await api.post('/api/payments/process', {
                bookingId,
                amount: bookingData.totalAmount,
                paymentMethod,
                paymentDetails
            });

            return paymentResponse.data;
        } catch (error) {
            console.error('Payment processing failed:', error);
            throw error;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Integration Demo</h2>

            {/* Payment Method Selection */}
            {paymentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Payment Method</h3>
                    <div className="grid gap-3">
                        {[
                            { id: 'stripe', name: 'Credit/Debit Card (Stripe)', icon: '💳' },
                            { id: 'cash', name: 'Cash Payment', icon: '💵' },
                            { id: 'mobile-money', name: 'Mobile Money (Digicel/Vodafone)', icon: '📱' },
                            { id: 'bank-transfer', name: 'Bank Transfer', icon: '🏦' },
                            { id: 'paypal', name: 'PayPal', icon: '💙' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => {
                                    setSelectedPaymentMethod(method.id);
                                    setPaymentStep(2);
                                }}
                                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <span className="text-2xl">{method.icon}</span>
                                <span>{method.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Processing */}
            {paymentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                        Complete Payment - {selectedPaymentMethod}
                    </h3>

                    {/* Different forms based on payment method */}
                    {selectedPaymentMethod === 'stripe' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full p-3 border rounded"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedPaymentMethod === 'mobile-money' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Mobile Provider</label>
                                <select className="w-full p-3 border rounded">
                                    <option>Digicel Mobile Money</option>
                                    <option>Vodafone M-PAiSA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    placeholder="+678 7XX XXXX"
                                    className="w-full p-3 border rounded"
                                />
                            </div>
                            <div className="bg-blue-50 p-4 rounded">
                                <p className="text-sm text-blue-800">
                                    You will receive an SMS with payment instructions after clicking Pay.
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedPaymentMethod === 'cash' && (
                        <div className="bg-green-50 p-4 rounded">
                            <p className="text-green-800">
                                <strong>Cash Payment Instructions:</strong><br />
                                1. Complete the booking<br />
                                2. Bring cash to our pickup location<br />
                                3. Present your booking reference<br />
                                4. Complete payment and receive your car keys
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            // Process payment based on selected method
                            processPayment(selectedPaymentMethod, {}).then(() => {
                                setPaymentStep(3);
                            });
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
                    >
                        Pay VT {bookingData.totalAmount.toLocaleString()}
                    </button>
                </div>
            )}

            {/* Payment Confirmation */}
            {paymentStep === 3 && (
                <div className="text-center space-y-4">
                    <div className="text-6xl">✅</div>
                    <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
                    <p className="text-gray-600">
                        Your booking has been confirmed. You will receive an email
                        confirmation shortly.
                    </p>
                    <div className="bg-gray-50 p-4 rounded">
                        <p className="font-semibold">Booking Reference: CAR-20240115-123456</p>
                        <p className="text-sm text-gray-600">
                            Please save this reference number for your records.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Backend Configuration Example
/*
// Environment Variables Required:
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

// Payment Methods Support Matrix:
┌─────────────────┬──────────┬─────────────────┬──────────────┬──────────────┐
│ Payment Method  │ Currency │ Processing Fee  │ Min Amount   │ Max Amount   │
├─────────────────┼──────────┼─────────────────┼──────────────┼──────────────┤
│ Cash            │ VUV/AUD  │ 0%             │ 0           │ No limit     │
│ Credit Card     │ All      │ 2.5%           │ 1000 VUV    │ No limit     │
│ Debit Card      │ All      │ 1.5%           │ 1000 VUV    │ No limit     │
│ Mobile Money    │ VUV      │ 1.0%           │ 100 VUV     │ 500,000 VUV  │
│ Bank Transfer   │ All      │ 0%             │ 10,000 VUV  │ No limit     │
│ PayPal          │ All      │ 3.4%           │ 1000 VUV    │ No limit     │
│ Stripe          │ All      │ 2.9%           │ 1000 VUV    │ No limit     │
│ EFTPOS          │ VUV/AUD  │ 0.5%           │ 0           │ No limit     │
└─────────────────┴──────────┴─────────────────┴──────────────┴──────────────┘

// API Endpoints:
POST /api/payments/calculate         - Calculate pricing with fees
POST /api/payments/create-intent     - Create Stripe payment intent
POST /api/payments/process          - Process payment with any method
POST /api/payments/webhook          - Handle Stripe webhooks
POST /api/payments/validate-discount - Validate discount codes
POST /api/payments/refund           - Process refunds

// Database Schema (MongoDB):
{
  payment: {
    status: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'failed',
    method: 'cash' | 'credit-card' | 'mobile-money' | etc,
    reference: 'PAY-20240115-123456',
    transactionId: 'TXN-1705123456-7890',
    paidAmount: 16500,
    remainingAmount: 0,
    processingFee: 412.50,
    currency: 'VUV',
    paidAt: '2024-01-15T10:30:00Z',
    paymentDetails: {
      // Method-specific details
      last4: '1234', // for cards
      mobileNumber: '+678...' // for mobile money
    }
  }
}
*/

export default PaymentIntegrationExample;