import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
    // Use a compatible API version or remove this line to use the latest
    // apiVersion: '2023-10-16',
});

export interface StripePaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
    metadata?: Record<string, string>;
}

export interface PaymentMethodData {
    type: 'card' | 'paypal' | 'bank_transfer';
    card?: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
        name: string;
    };
    paypal?: {
        email: string;
    };
    bank?: {
        account_number: string;
        routing_number: string;
        account_holder_name: string;
        bank_name: string;
    };
}

/**
 * Create a Stripe PaymentIntent
 */
export const createPaymentIntent = async (
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
): Promise<StripePaymentIntent> => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: currency.toLowerCase(),
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret!,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            metadata: paymentIntent.metadata
        };
    } catch (error: any) {
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
};

/**
 * Confirm a payment with a payment method
 */
export const confirmPayment = async (
    paymentIntentId: string,
    paymentMethodId: string
): Promise<StripePaymentIntent> => {
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
        });

        return {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret!,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            metadata: paymentIntent.metadata
        };
    } catch (error: any) {
        throw new Error(`Failed to confirm payment: ${error.message}`);
    }
};

/**
 * Create a payment method from card data
 */
export const createPaymentMethod = async (
    cardData: PaymentMethodData['card'] & { billing_details?: any }
): Promise<string> => {
    try {
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: cardData.number,
                exp_month: cardData.exp_month,
                exp_year: cardData.exp_year,
                cvc: cardData.cvc,
            },
            billing_details: cardData.billing_details || {
                name: cardData.name,
            },
        });

        return paymentMethod.id;
    } catch (error: any) {
        throw new Error(`Failed to create payment method: ${error.message}`);
    }
};

/**
 * Process refund
 */
export const createRefund = async (
    paymentIntentId: string,
    amount?: number,
    reason: string = 'requested_by_customer'
): Promise<any> => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined,
            reason: reason as any,
        });

        return {
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            reason: refund.reason
        };
    } catch (error: any) {
        throw new Error(`Failed to create refund: ${error.message}`);
    }
};

/**
 * Retrieve payment intent
 */
export const getPaymentIntent = async (paymentIntentId: string): Promise<StripePaymentIntent> => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        return {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret!,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            metadata: paymentIntent.metadata
        };
    } catch (error: any) {
        throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
};

/**
 * Handle webhook events from Stripe
 */
export const handleWebhook = async (
    body: string,
    signature: string
): Promise<any> => {
    try {
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'
        );

        switch (event.type) {
            case 'payment_intent.succeeded':
                // Handle successful payment
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                break;
            case 'payment_intent.payment_failed':
                // Handle failed payment
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    } catch (error: any) {
        throw new Error(`Webhook error: ${error.message}`);
    }
};

export default {
    createPaymentIntent,
    confirmPayment,
    createPaymentMethod,
    createRefund,
    getPaymentIntent,
    handleWebhook
};