import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Currency {
    code: string;
    symbol: string;
    name: string;
    rate: number; // Rate from VUV
}

export const currencies: Currency[] = [
    { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu', rate: 1 },
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0084 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.013 },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 0.014 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0077 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0066 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.23 },
];

interface CurrencyState {
    selectedCurrency: Currency;
    setCurrency: (currency: Currency) => void;
    convertPrice: (priceInVUV: number) => number;
    formatPrice: (priceInVUV: number, showCode?: boolean) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            selectedCurrency: currencies[0], // Default to VUV

            setCurrency: (currency: Currency) => {
                set({ selectedCurrency: currency });
            },

            convertPrice: (priceInVUV: number) => {
                const { selectedCurrency } = get();
                return priceInVUV * selectedCurrency.rate;
            },

            formatPrice: (priceInVUV: number, showCode = true) => {
                const { selectedCurrency, convertPrice } = get();
                const convertedPrice = convertPrice(priceInVUV);

                const formatted = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: selectedCurrency.code === 'VUV' || selectedCurrency.code === 'JPY' ? 0 : 2,
                    maximumFractionDigits: selectedCurrency.code === 'VUV' || selectedCurrency.code === 'JPY' ? 0 : 2,
                }).format(convertedPrice);

                if (showCode) {
                    return `${selectedCurrency.symbol}${formatted} ${selectedCurrency.code}`;
                }
                return `${selectedCurrency.symbol}${formatted}`;
            },
        }),
        {
            name: 'currency-storage',
        }
    )
);
