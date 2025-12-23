import { useState, useRef, useEffect } from 'react';
import { useCurrencyStore, currencies } from '../store/currencyStore';

const CurrencySelector = () => {
    const { selectedCurrency, setCurrency } = useCurrencyStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCurrencyChange = (currency: typeof currencies[0]) => {
        setCurrency(currency);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
                <span className="text-lg">{selectedCurrency.symbol}</span>
                <span className="font-semibold text-sm">{selectedCurrency.code}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Select Currency
                        </div>
                        {currencies.map((currency) => (
                            <button
                                key={currency.code}
                                onClick={() => handleCurrencyChange(currency)}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${selectedCurrency.code === currency.code ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{currency.symbol}</span>
                                    <div>
                                        <div className="font-semibold text-sm">{currency.code}</div>
                                        <div className="text-xs text-gray-500">{currency.name}</div>
                                    </div>
                                </div>
                                {selectedCurrency.code === currency.code && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="border-t px-4 py-2 text-xs text-gray-500">
                        Prices converted from Vanuatu Vatu (VUV)
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
