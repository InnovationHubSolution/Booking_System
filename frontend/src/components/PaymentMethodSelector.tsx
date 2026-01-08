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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Payment Method
            </h3>

            <div className="space-y-3">
                {paymentMethods.map((method) => {
                    const processingFee = calculateProcessingFee(amount, method.value);
                    const totalWithFee = amount + processingFee;
                    const isSelected = selectedMethod === method.value;
                    const isExpanded = expandedMethod === method.value;

                    return (
                        <div
                            key={method.value}
                            className={`
                                border-2 rounded-lg p-4 cursor-pointer transition-all
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }
                            `}
                            onClick={() => handleMethodClick(method)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{method.icon}</span>
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {method.label}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {method.description}
                                        </p>
                                    </div>
                                </div>

                                {(method.processingFee || 0) > 0 && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                            +{method.processingFee}% fee
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatPrice(processingFee)}
                                        </p>
                                    </div>
                                )}

                                <div className="ml-4">
                                    <input
                                        type="radio"
                                        checked={isSelected}
                                        onChange={() => onSelectMethod(method.value)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="space-y-2 text-sm">
                                        {method.currency && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Accepted currencies:</span>
                                                <span className="font-medium text-gray-900">
                                                    {method.currency.join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {method.minAmount && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Minimum amount:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatPrice(method.minAmount)}
                                                </span>
                                            </div>
                                        )}

                                        {method.maxAmount && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Maximum amount:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatPrice(method.maxAmount)}
                                                </span>
                                            </div>
                                        )}

                                        {showProcessingFee && (
                                            <>
                                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {formatPrice(amount)}
                                                    </span>
                                                </div>

                                                {processingFee > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Processing fee:</span>
                                                        <span className="text-gray-900">
                                                            {formatPrice(processingFee)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                                    <span className="font-semibold text-gray-900">Total:</span>
                                                    <span className="font-bold text-blue-600">
                                                        {formatPrice(totalWithFee)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {paymentMethods.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        No payment methods available for {currentCurrency}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
