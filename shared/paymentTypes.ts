/**
 * Shared Payment Types Configuration
 * This file exports payment configurations to be used by both frontend and backend
 */

export interface PaymentMethodConfig {
    value: string;
    label: string;
    description: string;
    icon?: string;
    enabled: boolean;
    currency?: string[];
    region?: string[];
    processingFee?: number;
    minAmount?: number;
    maxAmount?: number;
}

export const PAYMENT_METHODS: Record<string, PaymentMethodConfig> = {
    // Local & Cash Payments
    cash: {
        value: 'cash',
        label: 'Cash',
        description: 'Pay with cash at counter (VUV, AUD, USD accepted)',
        icon: '💵',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD'],
        region: ['VU'],
        processingFee: 0
    },

    // Credit & Debit Cards
    'credit-card': {
        value: 'credit-card',
        label: 'Credit Card',
        description: 'Visa, Mastercard, Amex',
        icon: '💳',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR', 'GBP', 'NZD'],
        processingFee: 2.5
    },
    'debit-card': {
        value: 'debit-card',
        label: 'Debit Card',
        description: 'Pay directly from your bank account',
        icon: '💳',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR', 'GBP', 'NZD'],
        processingFee: 1.5
    },

    // EFTPOS (Common in Vanuatu and Pacific)
    eftpos: {
        value: 'eftpos',
        label: 'EFTPOS',
        description: 'Electronic Funds Transfer at Point of Sale',
        icon: '🏧',
        enabled: true,
        currency: ['VUV', 'AUD', 'NZD'],
        region: ['VU', 'AU', 'NZ'],
        processingFee: 0.5
    },

    // Premium Cards
    'american-express': {
        value: 'american-express',
        label: 'American Express',
        description: 'Amex card payments',
        icon: '💳',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR', 'GBP'],
        processingFee: 3.5
    },
    'diners-club': {
        value: 'diners-club',
        label: 'Diners Club',
        description: 'Diners Club card payments',
        icon: '💳',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR'],
        processingFee: 3.0
    },

    // Mobile Money (Popular in Vanuatu)
    'mobile-money': {
        value: 'mobile-money',
        label: 'Mobile Money',
        description: 'Digicel Mobile Money, Vodafone M-PAiSA',
        icon: '📱',
        enabled: true,
        currency: ['VUV'],
        region: ['VU'],
        processingFee: 1.0,
        maxAmount: 500000
    },

    // Bank Transfers
    'bank-transfer': {
        value: 'bank-transfer',
        label: 'Bank Transfer',
        description: 'Direct bank transfer (ANZ, NBV, Bred Bank)',
        icon: '🏦',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR', 'GBP'],
        processingFee: 0,
        minAmount: 10000
    },

    // International Payment Processors
    paypal: {
        value: 'paypal',
        label: 'PayPal',
        description: 'Secure online payments via PayPal',
        icon: '💙',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR', 'GBP', 'NZD'],
        processingFee: 3.4
    },
    stripe: {
        value: 'stripe',
        label: 'Stripe',
        description: 'Pay securely with Stripe',
        icon: '💜',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD', 'EUR', 'GBP', 'NZD'],
        processingFee: 2.9
    },

    // Money Transfer Services
    'western-union': {
        value: 'western-union',
        label: 'Western Union',
        description: 'International money transfer',
        icon: '🌍',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD'],
        region: ['VU'],
        processingFee: 0,
        minAmount: 5000
    },
    'money-gram': {
        value: 'money-gram',
        label: 'MoneyGram',
        description: 'International money transfer',
        icon: '🌍',
        enabled: true,
        currency: ['VUV', 'AUD', 'USD'],
        region: ['VU'],
        processingFee: 0,
        minAmount: 5000
    },

    // Asian Payment Methods (Popular with tourists)
    alipay: {
        value: 'alipay',
        label: 'Alipay',
        description: 'Chinese mobile payment platform',
        icon: '🇨🇳',
        enabled: true,
        currency: ['CNY', 'USD', 'VUV'],
        region: ['CN', 'VU'],
        processingFee: 2.0
    },
    'wechat-pay': {
        value: 'wechat-pay',
        label: 'WeChat Pay',
        description: 'Chinese mobile payment platform',
        icon: '💬',
        enabled: true,
        currency: ['CNY', 'USD', 'VUV'],
        region: ['CN', 'VU'],
        processingFee: 2.0
    },
    unionpay: {
        value: 'unionpay',
        label: 'UnionPay',
        description: 'Chinese bank card payment network',
        icon: '🏦',
        enabled: true,
        currency: ['CNY', 'USD', 'VUV', 'AUD'],
        region: ['CN', 'VU'],
        processingFee: 2.5
    }
};

// Helper function to get enabled payment methods
export const getEnabledPaymentMethods = (): PaymentMethodConfig[] => {
    return Object.values(PAYMENT_METHODS).filter(method => method.enabled);
};

// Helper function to get payment methods by currency
export const getPaymentMethodsByCurrency = (currency: string): PaymentMethodConfig[] => {
    return Object.values(PAYMENT_METHODS).filter(
        method => method.enabled && (!method.currency || method.currency.includes(currency))
    );
};

// Helper function to get payment methods by region
export const getPaymentMethodsByRegion = (region: string): PaymentMethodConfig[] => {
    return Object.values(PAYMENT_METHODS).filter(
        method => method.enabled && (!method.region || method.region.includes(region))
    );
};

// Helper function to calculate processing fee
export const calculateProcessingFee = (amount: number, paymentMethod: string): number => {
    const method = PAYMENT_METHODS[paymentMethod];
    if (!method || !method.processingFee) return 0;
    return (amount * method.processingFee) / 100;
};

export default PAYMENT_METHODS;