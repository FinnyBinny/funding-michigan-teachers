/**
 * Vercel serverless function (Node.js runtime) — looks up a completed
 * Checkout Session so the page can show "thanks, your gift went through"
 * after Stripe's embedded checkout finishes and calls the return_url with
 * ?stripe_session_id=...
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'Stripe is not configured on the server.' });
    return;
  }

  const sessionId = req.query.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'Missing session_id' });
    return;
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.status(200).json({
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      mode: session.mode,
    });
  } catch (err) {
    console.error('Stripe session status lookup failed:', err);
    res.status(500).json({ error: 'Could not retrieve session status' });
  }
}
