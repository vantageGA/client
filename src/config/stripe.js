import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key from environment variables
// In development, if not provided, use a mock key for testing
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

export const stripePromise = loadStripe(stripePublishableKey);
