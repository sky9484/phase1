/**
 * Stripe Checkout deposit integration for USD-first deposits.
 * Phase 1 scaffold: Creates checkout sessions and confirms deposits.
 */

export interface StripeCheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  amountUsd: number;
  status: 'pending' | 'completed' | 'failed';
}

export async function createStripeCheckoutSession(amountUsd: number, transferIntentId: string): Promise<StripeCheckoutSession> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  // In Phase 1, this is a scaffold. Replace with actual Stripe API call:
  // const stripe = require('stripe')(STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({ ... });

  const sessionId = `cs_${Date.now()}_${transferIntentId.slice(0, 8)}`;
  const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

  return {
    sessionId,
    checkoutUrl,
    amountUsd,
    status: 'pending',
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function confirmStripeDeposit(_sessionId: string): Promise<{ confirmed: boolean; amountUsd: number }> {
  // Phase 1 scaffold: Verify session status with Stripe
  // In production, call stripe.checkout.sessions.retrieve(sessionId);
  return {
    confirmed: true,
    amountUsd: 0, // Extract from session
  };
}
