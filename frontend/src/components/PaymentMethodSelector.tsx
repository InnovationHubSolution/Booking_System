import React, { useState } from 'react';
import {
    getEnabledPaymentMethods,
    getPaymentMethodsByCurrency,
    calculateProcessingFee,
    PaymentMethodConfig
} from '../../../shared/paymentTypes';
import { useCurrencyStore } from '../store/currencyStore';

interface PaymentMethodSelectorProps {
    selectedMethod?: string;
    onSelectMethod: (method: string) => void;
    amount: number;
    currency?: string;
    showProcessingFee?: boolean;
    className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedMethod,
    onSelectMethod,
    amount,
    currency,
    showProcessingFee = true,
    className = ''
}) => {
    const { selectedCurrency, formatPrice } = useCurrencyStore();
    const currentCurrency = currency || selectedCurrency.code;

    const paymentMethods = currency
        ? getPaymentMethodsByCurrency(currentCurrency)
        : getEnabledPaymentMethods();

    const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

    const handleMethodClick = (method: PaymentMethodConfig) => {
        if (expandedMethod === method.value) {
            setExpandedMethod(null);
        } else {
            setExpandedMethod(method.value);
            onSelectMethod(method.value);
        }
    };

    return (
        <div className={`payment-method-selector ${className}`}>
            <div className="mb-6">
                <h3 className="section-header text-2xl md:text-3xl">
                    💳 Select Payment Method
                </h3>
                <p className="section-subheader text-gray-600 mt-2">
                    Choose your preferred payment option for a seamless booking experience
                </p>
            </div>

            <div className="space-y-4">
                {paymentMethods.map((method) => {
                    const processingFee = calculateProcessingFee(amount, method.value);
                    const totalWithFee = amount + processingFee;
                    const isSelected = selectedMethod === method.value;
                    const isExpanded = expandedMethod === method.value;

                    return (
                        <div
                            key={method.value}
                            className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleMethodClick(method)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="payment-icon">
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg text-pacific-deep mb-1">
                                            {method.label}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {method.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {(method.processingFee || 0) > 0 && (
                                        <div className="text-right bg-gray-50 px-3 py-2 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">
                                                Processing Fee
                                            </p>
                                            <p className="text-sm font-semibold text-coral">
                                                +{method.processingFee}%
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {formatPrice(processingFee)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="ml-2">
                                        <input
                                            type="radio"
                                            checked={isSelected}
                                            onChange={() => onSelectMethod(method.value)}
                                            className="h-5 w-5 text-pacific-blue focus:ring-pacific-blue cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-5 pt-5 border-t-2 border-pacific-light/20 bg-gradient-to-br from-pacific-light/5 to-transparent rounded-lg p-4">
                                    <div className="space-y-3 text-sm">
                                        {method.currency && (
                                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                                    💱 Accepted currencies:
                                                </span>
                                                <span className="font-semibold text-pacific-deep">
                                                    {method.currency.join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {method.minAmount && (
                                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                                    ⬇️ Minimum amount:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatPrice(method.minAmount)}
                                                </span>
                                            </div>
                                        )}

                                        {method.maxAmount && (
                                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                                    ⬆️ Maximum amount:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatPrice(method.maxAmount)}
                                                </span>
                                            </div>
                                        )}

                                        {showProcessingFee && (
                                            <div className="mt-4 pt-4 border-t-2 border-pacific-turquoise/20">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-700">Subtotal:</span>
                                                        <span className="font-semibold text-gray-900 text-base">
                                                            {formatPrice(amount)}
                                                        </span>
                                                    </div>

                                                    {processingFee > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700">Processing fee:</span>
                                                            <span className="text-coral font-medium">
                                                                {formatPrice(processingFee)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-3 border-t-2 border-pacific-deep/10 bg-gradient-to-r from-pacific-turquoise/10 to-pacific-blue/10 p-3 rounded-lg">
                                                        <span className="font-bold text-pacific-deep text-lg">Total:</span>
                                                        <span className="price-display text-pacific-blue">
                                                            {formatPrice(totalWithFee)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {paymentMethods.length === 0 && (
                <div className="glass-card text-center py-12 rounded-pacific">
                    <div className="text-6xl mb-4">💳</div>
                    <p className="text-gray-600 text-lg font-medium">
                        No payment methods available for {currentCurrency}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Please select a different currency or contact support
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
