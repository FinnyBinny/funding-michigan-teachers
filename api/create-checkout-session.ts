/**
 * Vercel serverless function (Node.js runtime) — creates a Stripe Embedded
 * Checkout session.
 *
 * This is the ONLY place STRIPE_SECRET_KEY may be used. It runs on
 * Vercel's server, never in the browser, so the secret key is never
 * exposed to visitors. The client only ever sees the short-lived
 * `client_secret` returned below, which is safe to use in the page.
 *
 * Deployed automatically by Vercel — any file under /api becomes a
 * serverless endpoint at /api/<filename>. No extra config needed.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

interface RequestBody {
  amount: number;              // USD, whole dollars (e.g. 25 for $25)
  frequency: 'once' | 'monthly';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'Stripe is not configured on the server (missing STRIPE_SECRET_KEY).' });
    return;
  }

  const body = req.body as RequestBody;
  const amount = Number(body?.amount);
  const frequency = body?.frequency === 'monthly' ? 'monthly' : 'once';

  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    res.status(400).json({ error: 'Invalid donation amount' });
    return;
  }

  const stripe = new Stripe(secretKey);
  const origin = (req.headers.origin as string) || 'https://www.fundingmichiganteachers.org';
  const unitAmount = Math.round(amount * 100); // Stripe wants cents

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name:
                frequency === 'monthly'
                  ? 'Monthly donation to Funding Michigan Teachers'
                  : 'Donation to Funding Michigan Teachers',
              description: '501(c)(3) nonprofit · EIN 93-4485967 · 100% goes to teachers',
            },
            unit_amount: unitAmount,
            ...(frequency === 'monthly' ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      // Stripe requires a return_url even in embedded mode as a fallback for
      // redirect-based payment methods (e.g. some bank redirects). The
      // {CHECKOUT_SESSION_ID} placeholder is filled in by Stripe.
      return_url: `${origin}/donate?stripe_session_id={CHECKOUT_SESSION_ID}`,
      ...(frequency === 'once' ? { submit_type: 'donate' as const } : {}),
      custom_text: {
        submit: { message: '100% of your gift goes directly to Michigan teachers.' },
      },
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error creating checkout session';
    res.status(500).json({ error: message });
  }
}
