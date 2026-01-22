import React from 'react';

interface BookingSummaryProps {
    items: Array<{
        label: string;
        value: string | number;
        icon?: string;
        highlight?: boolean;
    }>;
    subtotal?: number;
    fees?: Array<{
        label: string;
        amount: number;
        icon?: string;
    }>;
    total: number;
    currency?: string;
    className?: string;
    showBorder?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
    items,
    subtotal,
    fees,
    total,
    currency = '',
    className = '',
    showBorder = true
}) => {
    const formatPrice = (amount: number) => {
        return `${currency}${amount.toFixed(2)}`;
    };

    return (
        <div className={`glass-card rounded-pacific ${showBorder ? 'border-2 border-pacific-light/20' : ''} ${className}`}>
            {/* Header */}
            <div className="bg-gradient-ocean text-white p-5 rounded-t-pacific">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Booking Summary
                </h3>
                <p className="text-sm text-cloud-gray mt-1">Review your selection</p>
            </div>

            {/* Items */}
            <div className="p-6 space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`flex justify-between items-start gap-4 ${item.highlight ? 'bg-pacific-light/10 p-3 rounded-lg' : ''
                            }`}
                    >
                        <div className="flex items-start gap-2 flex-1">
                            {item.icon && <span className="text-xl mt-0.5">{item.icon}</span>}
                            <span className={`text-gray-700 ${item.highlight ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </div>
                        <span className={`font-medium text-right ${item.highlight ? 'text-pacific-deep text-lg' : 'text-gray-900'
                            }`}>
                            {item.value}
                        </span>
                    </div>
                ))}

                {/* Pricing Breakdown */}
                {(subtotal !== undefined || fees) && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
                        {subtotal !== undefined && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Subtotal</span>
                                <span className="font-semibold text-gray-900 text-lg">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                        )}

                        {fees && fees.map((fee, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-600 flex items-center gap-2">
                                    {fee.icon && <span>{fee.icon}</span>}
                                    {fee.label}
                                </span>
                                <span className="text-coral font-medium">
                                    {formatPrice(fee.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Total */}
                <div className="mt-6 pt-6 border-t-4 border-gradient-ocean">
                    <div className="bg-gradient-to-br from-pacific-turquoise/10 via-pacific-blue/10 to-pacific-deep/10 p-5 rounded-xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Amount</p>
                                <p className="text-xs text-gray-500 mt-0.5">Including all fees and taxes</p>
                            </div>
                            <div className="text-right">
                                <p className="price-display-large">
                                    {formatPrice(total)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">🔒</span>
                        <span>Secure Payment Processing</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="text-2xl">💳</span>
                        <span className="text-2xl">🏦</span>
                        <span className="text-2xl">📱</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;
