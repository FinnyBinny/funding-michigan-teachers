/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Worker — serves the built Vite SPA as static assets and
 * handles the two Stripe API routes server-side. This is the actual
 * production backend (this site deploys via Cloudflare Workers, not
 * Vercel — see wrangler.jsonc).
 *
 * STRIPE_SECRET_KEY must never be exposed to the browser. It's set as a
 * Worker secret (dashboard: Workers & Pages → funding-michigan-teachers →
 * Settings → Variables and Secrets → add STRIPE_SECRET_KEY as "Secret",
 * or via `npx wrangler secret put STRIPE_SECRET_KEY`), never committed
 * to this repo.
 */
import Stripe from 'stripe';

export interface Env {
  ASSETS: Fetcher;
  STRIPE_SECRET_KEY?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function createCheckoutSession(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe is not configured on the server (missing STRIPE_SECRET_KEY).' }, 500);
  }

  let body: {
    amount?: number;
    frequency?: 'once' | 'monthly';
    fund?: { title?: string; teacher?: string } | null;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const amount = Number(body.amount);
  const frequency = body.frequency === 'monthly' ? 'monthly' : 'once';

  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    return json({ error: 'Invalid donation amount' }, 400);
  }

  // Designated gift to one teacher's classroom fund. Trimmed and length-capped
  // because it comes from a query string and is shown on the Stripe receipt.
  const clean = (s: unknown, max: number) =>
    typeof s === 'string' ? s.trim().slice(0, max) : '';
  const fundTitle = clean(body.fund?.title, 120);
  const fundTeacher = clean(body.fund?.teacher, 80);

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const origin = request.headers.get('origin') ?? 'https://www.fundingmichiganteachers.org';
  const unitAmount = Math.round(amount * 100);

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
              name: fundTitle
                ? `${frequency === 'monthly' ? 'Monthly gift' : 'Gift'} to ${fundTitle}`
                : frequency === 'monthly'
                  ? 'Monthly donation to Funding Michigan Teachers'
                  : 'Donation to Funding Michigan Teachers',
              description: fundTeacher
                ? `${fundTeacher}'s classroom fund · Funding Michigan Teachers · 501(c)(3) EIN 93-4485967 · 100% goes to teachers`
                : '501(c)(3) nonprofit · EIN 93-4485967 · 100% goes to teachers',
            },
            unit_amount: unitAmount,
            ...(frequency === 'monthly' ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      return_url: `${origin}/donate?stripe_session_id={CHECKOUT_SESSION_ID}`,
      ...(frequency === 'once' ? { submit_type: 'donate' as const } : {}),
      // Recorded on the Stripe payment so designated gifts can be reported on
      // and routed to the right classroom.
      ...(fundTitle
        ? { metadata: { designated_fund: fundTitle, teacher: fundTeacher } }
        : {}),
      custom_text: {
        submit: {
          message: fundTeacher
            ? `100% of your gift goes to ${fundTeacher}'s classroom.`
            : '100% of your gift goes directly to Michigan teachers.',
        },
      },
    });

    return json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error creating checkout session';
    return json({ error: message }, 500);
  }
}

async function checkoutSessionStatus(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe is not configured on the server.' }, 500);
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return json({ error: 'Missing session_id' }, 400);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return json({
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      mode: session.mode,
    });
  } catch (err) {
    console.error('Stripe session status lookup failed:', err);
    return json({ error: 'Could not retrieve session status' }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/create-checkout-session' && request.method === 'POST') {
      return createCheckoutSession(request, env);
    }
    if (url.pathname === '/api/checkout-session-status' && request.method === 'GET') {
      return checkoutSessionStatus(request, env);
    }
    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    // Everything else falls through to the built Vite SPA (dist/), with
    // client-side routing handled by not_found_handling in wrangler.jsonc.
    return env.ASSETS.fetch(request);
  },
};
