import { loadStripe } from '@stripe/stripe-js';
import logger from '../utils/logger';

const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
export const isStripeConfigured = !!stripeKey;

let stripePromise = null;
export const getStripe = () => {
  if (!stripePromise && isStripeConfigured) {
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};

export const processOneTimeDonation = async (donationData) => {
  if (!isStripeConfigured) {
    logger.log('Stripe not configured — simulating donation:', donationData);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      transactionId: `sim_don_${Date.now()}`,
      message: 'Donation simulated (configure Stripe for real payments)',
    };
  }

  // With a real Supabase backend, this would call an Edge Function that creates
  // a Stripe Checkout Session or PaymentIntent server-side, then redirect.
  logger.log('Would create Stripe PaymentIntent for:', donationData);
  return { success: false, message: 'Server-side Stripe integration required' };
};

export const processEventPayment = async (paymentData) => {
  if (!isStripeConfigured) {
    logger.log('Stripe not configured — simulating event payment:', paymentData);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      transactionId: `sim_pay_${Date.now()}`,
      message: 'Payment simulated (configure Stripe for real payments)',
    };
  }

  logger.log('Would create Stripe Checkout Session for:', paymentData);
  return { success: false, message: 'Server-side Stripe integration required' };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
