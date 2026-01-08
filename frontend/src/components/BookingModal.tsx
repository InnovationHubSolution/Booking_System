import React, { useState, useEffect } from 'react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { calculateProcessingFee } from '../../../shared/paymentTypes';
import { useCurrencyStore } from '../store/currencyStore';
import api from '../api/axios';

interface CarRental {
    id: string;
    make: string;
    model: string;
    year: number;
    type: 'compact' | 'sedan' | 'suv' | '4wd' | 'luxury' | 'van';
    transmission: 'manual' | 'automatic';
    seats: number;
    luggage: number;
    fuelType: 'petrol' | 'diesel' | 'hybrid';
    pricePerDay: number;
    currency: string;
    features: string[];
    images: string[];
    provider: {
        name: string;
        rating: number;
        reviews: number;
        location: string;
    };
    availability: boolean;
    pickupLocations: string[];
}

interface BookingModalProps {
    car: CarRental;
    isOpen: boolean;
    onClose: () => void;
    pickupDate?: string;
    returnDate?: string;
    pickupLocation?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
    car,
    isOpen,
    onClose,
    pickupDate = '',
    returnDate = '',
    pickupLocation = ''
}) => {
    const { selectedCurrency, formatPrice } = useCurrencyStore();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation

    // Booking details state
    const [bookingDetails, setBookingDetails] = useState({
        pickupDate: pickupDate,
        returnDate: returnDate,
        pickupLocation: pickupLocation || car.pickupLocations[0] || '',
        returnLocation: pickupLocation || car.pickupLocations[0] || '',
        driverAge: '',
        additionalDrivers: 0,
        insurance: 'basic',
        addOns: [] as string[],
        specialRequests: ''
    });

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('');
    const [backupPaymentMethod, setBackupPaymentMethod] = useState('');
    const [useBackupPayment, setUseBackupPayment] = useState(false);
    const [paymentRetryAttempts, setPaymentRetryAttempts] = useState(0);
    const [backupCars, setBackupCars] = useState<CarRental[]>([]);
    const [showBackupCars, setShowBackupCars] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        billingAddress: {
            street: '',
            city: '',
            postalCode: '',
            country: ''
        }
    });

    // Calculate rental duration
    const calculateDuration = () => {
        if (!bookingDetails.pickupDate || !bookingDetails.returnDate) return 0;
        const pickup = new Date(bookingDetails.pickupDate);
        const returnDate = new Date(bookingDetails.returnDate);
        const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calculate pricing
    const calculatePricing = () => {
        const duration = calculateDuration();
        const basePrice = car.pricePerDay * duration;

        // Add-on prices
        const addOnPrices = {
            'child-seat': 15,
            'gps': 10,
            'additional-driver': 25,
            'roof-rack': 20,
            'wifi': 8
        };

        const addOnsTotal = bookingDetails.addOns.reduce((total, addOn) => {
            return total + (addOnPrices[addOn as keyof typeof addOnPrices] || 0) * duration;
        }, 0);

        // Insurance upgrade
        const insuranceUpgrade = bookingDetails.insurance === 'premium' ? 35 * duration : 0;

        // Additional drivers
        const additionalDriversTotal = bookingDetails.additionalDrivers * 25 * duration;

        const subtotal = basePrice + addOnsTotal + insuranceUpgrade + additionalDriversTotal;
        const processingFee = paymentMethod ? calculateProcessingFee(subtotal, paymentMethod) : 0;
        const tax = (subtotal + processingFee) * 0.15; // 15% VAT
        const total = subtotal + processingFee + tax;

        return {
            duration,
            basePrice,
            addOnsTotal,
            insuranceUpgrade,
            additionalDriversTotal,
            subtotal,
            processingFee,
            tax,
            total
        };
    };

    const pricing = calculatePricing();

    const handleBookingSubmit = async () => {
        setLoading(true);
        try {
            // Create booking
            const bookingResponse = await api.post('/api/bookings', {
                type: 'car-rental',
                itemId: car.id,
                details: bookingDetails,
                pricing: {
                    unitPrice: car.pricePerDay,
                    quantity: pricing.duration,
                    totalAmount: pricing.total
                }
            });

            const bookingId = bookingResponse.data.id;

            // Try primary payment method
            const primaryPaymentMethod = useBackupPayment ? backupPaymentMethod : paymentMethod;
            const primaryPaymentResponse = await tryPayment(bookingId, primaryPaymentMethod);

            if (primaryPaymentResponse.success) {
                setStep(3);
            } else {
                // If primary fails and we have a backup, try backup
                if (!useBackupPayment && backupPaymentMethod && paymentRetryAttempts < 2) {
                    setPaymentRetryAttempts(prev => prev + 1);
                    const backupPaymentResponse = await tryPayment(bookingId, backupPaymentMethod);

                    if (backupPaymentResponse.success) {
                        setStep(3);
                        alert('Primary payment failed, but backup payment succeeded!');
                    } else {
                        await handlePaymentFailure();
                    }
                } else {
                    await handlePaymentFailure();
                }
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            await handlePaymentFailure();
        } finally {
            setLoading(false);
        }
    };

    const tryPayment = async (bookingId: string, method: string) => {
        try {
            const paymentResponse = await api.post('/api/payments/process', {
                bookingId,
                amount: pricing.total,
                paymentMethod: method,
                paymentDetails
            });
            return paymentResponse.data;
        } catch (error) {
            console.error(`Payment failed with method ${method}:`, error);
            return { success: false, error };
        }
    };

    const handlePaymentFailure = async () => {
        // Fetch backup car options
        if (!showBackupCars) {
            try {
                const backupResponse = await api.get(`/api/car-rental/alternatives?originalCarId=${car.id}&pickupDate=${bookingDetails.pickupDate}&returnDate=${bookingDetails.returnDate}`);
                setBackupCars(backupResponse.data);
                setShowBackupCars(true);
                alert('Payment failed. Here are some alternative vehicles available for the same dates.');
            } catch (error) {
                alert('Payment failed and no alternative vehicles are available. Please try a different payment method or contact support.');
            }
        } else {
            alert('Payment failed multiple times. Please contact support for assistance.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Book {car.make} {car.model}
                        </h2>
                        <p className="text-gray-600">Step {step} of 3</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {i}
                                </div>
                                {i < 3 && (
                                    <div className={`w-12 h-1 mx-2 ${step > i ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>Details</span>
                        <span>Payment</span>
                        <span>Confirmation</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Rental Period */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Rental Period</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pickup Date
                                        </label>
                                        <input
                                            type="date"
                                            value={bookingDetails.pickupDate}
                                            onChange={(e) => setBookingDetails(prev => ({
                                                ...prev,
                                                pickupDate: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Return Date
                                        </label>
                                        <input
                                            type="date"
                                            value={bookingDetails.returnDate}
                                            onChange={(e) => setBookingDetails(prev => ({
                                                ...prev,
                                                returnDate: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                {pricing.duration > 0 && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Duration: {pricing.duration} day{pricing.duration > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            {/* Locations */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Pickup & Return Locations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pickup Location
                                        </label>
                                        <select
                                            value={bookingDetails.pickupLocation}
                                            onChange={(e) => setBookingDetails(prev => ({
                                                ...prev,
                                                pickupLocation: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            {car.pickupLocations.map((location) => (
                                                <option key={location} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Return Location
                                        </label>
                                        <select
                                            value={bookingDetails.returnLocation}
                                            onChange={(e) => setBookingDetails(prev => ({
                                                ...prev,
                                                returnLocation: e.target.value
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            {car.pickupLocations.map((location) => (
                                                <option key={location} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Add-ons & Extras</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'child-seat', name: 'Child Safety Seat', price: 15 },
                                        { id: 'gps', name: 'GPS Navigation', price: 10 },
                                        { id: 'additional-driver', name: 'Additional Driver License', price: 25 },
                                        { id: 'roof-rack', name: 'Roof Rack/Luggage Carrier', price: 20 },
                                        { id: 'wifi', name: 'Mobile WiFi Hotspot', price: 8 }
                                    ].map((addon) => (
                                        <label key={addon.id} className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={bookingDetails.addOns.includes(addon.id)}
                                                onChange={(e) => {
                                                    setBookingDetails(prev => ({
                                                        ...prev,
                                                        addOns: e.target.checked
                                                            ? [...prev.addOns, addon.id]
                                                            : prev.addOns.filter(id => id !== addon.id)
                                                    }));
                                                }}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span className="flex-1">{addon.name}</span>
                                            <span className="text-sm text-gray-600">
                                                +{formatPrice(addon.price)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Insurance */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Insurance Coverage</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="insurance"
                                            value="basic"
                                            checked={bookingDetails.insurance === 'basic'}
                                            onChange={(e) => setBookingDetails(prev => ({
                                                ...prev,
                                                insurance: e.target.value
                                            }))}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">Basic Coverage</div>
                                            <div className="text-sm text-gray-600">Included - Third party liability</div>
                                        </div>
                                        <span className="text-sm text-gray-600">Included</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="insurance"
                                            value="premium"
                                            checked={bookingDetails.insurance === 'premium'}
                                            onChange={(e) => setBookingDetails(prev => ({
                                                ...prev,
                                                insurance: e.target.value
                                            }))}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">Premium Coverage</div>
                                            <div className="text-sm text-gray-600">Full comprehensive + collision damage waiver</div>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            +{formatPrice(35)}/day
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Price Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Base rental ({pricing.duration} days)</span>
                                        <span>{formatPrice(pricing.basePrice)}</span>
                                    </div>
                                    {pricing.addOnsTotal > 0 && (
                                        <div className="flex justify-between">
                                            <span>Add-ons</span>
                                            <span>{formatPrice(pricing.addOnsTotal)}</span>
                                        </div>
                                    )}
                                    {pricing.insuranceUpgrade > 0 && (
                                        <div className="flex justify-between">
                                            <span>Insurance upgrade</span>
                                            <span>{formatPrice(pricing.insuranceUpgrade)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 font-semibold">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(pricing.subtotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!bookingDetails.pickupDate || !bookingDetails.returnDate || pricing.duration === 0}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Price Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Final Price</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(pricing.subtotal)}</span>
                                    </div>
                                    {pricing.processingFee > 0 && (
                                        <div className="flex justify-between">
                                            <span>Processing fee</span>
                                            <span>{formatPrice(pricing.processingFee)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Tax (15%)</span>
                                        <span>{formatPrice(pricing.tax)}</span>
                                    </div>
                                    <div className="border-t pt-2 font-bold text-lg">
                                        <div className="flex justify-between">
                                            <span>Total</span>
                                            <span>{formatPrice(pricing.tax)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onSelectMethod={setPaymentMethod}
                                amount={pricing.subtotal}
                                currency={car.currency}
                            />

                            {/* Backup Payment Method */}
                            <div className="border rounded-lg p-4 bg-yellow-50">
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-yellow-600">🛡️</span>
                                    <h3 className="text-lg font-semibold text-yellow-800">Backup Payment Method</h3>
                                    <span className="text-sm text-yellow-600">(Optional but Recommended)</span>
                                </div>
                                <p className="text-sm text-yellow-700 mb-4">
                                    Select a backup payment method in case your primary payment fails. This ensures your booking won't be lost.
                                </p>
                                <PaymentMethodSelector
                                    selectedMethod={backupPaymentMethod}
                                    onSelectMethod={setBackupPaymentMethod}
                                    amount={pricing.subtotal}
                                    currency={car.currency}
                                    className="bg-white"
                                />
                                {backupPaymentMethod && (
                                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-green-600">✅</span>
                                            <span className="text-sm text-green-700 font-medium">
                                                Backup payment method configured
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Details Form */}
                            {paymentMethod && ['credit-card', 'debit-card', 'stripe'].includes(paymentMethod) && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Card Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cardholderName}
                                                onChange={(e) => setPaymentDetails(prev => ({
                                                    ...prev,
                                                    cardholderName: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cardNumber}
                                                onChange={(e) => setPaymentDetails(prev => ({
                                                    ...prev,
                                                    cardNumber: e.target.value
                                                }))}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.expiryDate}
                                                onChange={(e) => setPaymentDetails(prev => ({
                                                    ...prev,
                                                    expiryDate: e.target.value
                                                }))}
                                                placeholder="MM/YY"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cvv}
                                                onChange={(e) => setPaymentDetails(prev => ({
                                                    ...prev,
                                                    cvv: e.target.value
                                                }))}
                                                placeholder="123"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleBookingSubmit}
                                    disabled={!paymentMethod || loading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
                                >
                                    {loading ? 'Processing...' : `Pay ${formatPrice(pricing.total)}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-6">
                            <div className="text-6xl">✅</div>
                            <h3 className="text-2xl font-bold text-green-600">Booking Confirmed!</h3>
                            <p className="text-gray-600">
                                Your car rental has been successfully booked and paid for.
                                You will receive a confirmation email shortly.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* Backup Cars Display - Shown when payment fails */}
                    {showBackupCars && backupCars.length > 0 && (
                        <div className="space-y-6">
                            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-4xl mb-2">⚠️</div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Issue</h3>
                                <p className="text-red-700">
                                    We couldn't process your payment for the selected vehicle. Here are similar alternatives available for your dates:
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Alternative Vehicles</h3>
                                {backupCars.map((backupCar) => (
                                    <div key={backupCar.id} className="border rounded-lg p-4 hover:border-blue-300 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg">
                                                    {backupCar.make} {backupCar.model} ({backupCar.year})
                                                </h4>
                                                <p className="text-gray-600 mb-2">{backupCar.type} • {backupCar.transmission}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>👥 {backupCar.seats} seats</span>
                                                    <span>🧳 {backupCar.luggage} bags</span>
                                                    <span>⛽ {backupCar.fuelType}</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-blue-600 mb-1">
                                                    {formatPrice(backupCar.pricePerDay)} / day
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // Switch to backup car and restart booking
                                                        window.location.reload(); // Simple approach - you could make this more elegant
                                                    }}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    Book This Car
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition mr-4"
                                >
                                    Try Different Payment
                                </button>
                                <button
                                    onClick={onClose}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};