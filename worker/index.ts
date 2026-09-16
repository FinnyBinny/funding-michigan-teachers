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
import { isKnownRoute } from '../shared/routes';
import {
  MERCH_COLORS, findProduct, unitPrice, orderTotal, validateCart,
  type CartLine, type Fulfilment,
} from '../shared/merch';

export interface Env {
  ASSETS: Fetcher;
  STRIPE_SECRET_KEY?: string;
  /**
   * Comma-separated IPs to deny, set in the Cloudflare dashboard (Settings →
   * Variables and Secrets). Preferred over the in-code list below: it takes
   * effect without a deploy and doesn't publish the addresses to GitHub.
   */
  BLOCKED_IPS?: string;
}

/**
 * Baseline blocklist committed to the repo.
 *
 * Intentionally empty. Anything added here is public on GitHub — including to
 * the person being blocked — and changing it needs a commit and a deploy. Use
 * the BLOCKED_IPS environment variable instead unless a block genuinely
 * belongs in version control.
 *
 * Entries may be an exact IPv4/IPv6 address, or end in `*` to match a prefix
 * (e.g. '203.0.113.*' for a noisy /24).
 */
const BLOCKED_IPS_BASELINE: string[] = [];

function isBlocked(ip: string | null, env: Env): boolean {
  if (!ip) return false;
  const rules = [
    ...BLOCKED_IPS_BASELINE,
    ...(env.BLOCKED_IPS ?? '').split(','),
  ]
    .map((r) => r.trim())
    .filter(Boolean);

  return rules.some((rule) =>
    rule.endsWith('*') ? ip.startsWith(rule.slice(0, -1)) : ip === rule,
  );
}

/** Static files (hashed bundles, images, favicon) rather than app routes. */
function isAssetPath(pathname: string): boolean {
  return pathname.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(pathname);
}

/**
 * Serves the SPA shell under a status other than 200 — the app renders the
 * matching page client-side while the response still carries an honest code
 * (404 for a path that doesn't exist, 403 for a blocked visitor).
 */
async function shellWithStatus(request: Request, env: Env, status: number): Promise<Response> {
  const shellUrl = new URL('/index.html', request.url);
  const res = await env.ASSETS.fetch(new Request(shellUrl.toString(), { method: 'GET' }));
  return new Response(res.body, { status, headers: res.headers });
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
                ? `${fundTeacher}'s classroom fund · Funding Michigan Teachers · 501(c)(3) EIN 93-4485967 · at least 80¢ of every dollar goes to teachers`
                : '501(c)(3) nonprofit · EIN 93-4485967 · at least 80¢ of every dollar goes to teachers',
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
            ? `Your gift goes to ${fundTeacher}'s classroom.`
            : 'At least 80¢ of every dollar goes directly to Michigan teachers.',
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

/**
 * Merch checkout.
 *
 * The browser sends product ids, sizes, colors and quantities — never prices.
 * Every amount is looked up from shared/merch.ts here on the server, because a
 * checkout that trusts the page can be bought from for whatever the buyer
 * types into dev tools.
 *
 * Size and color ride along in metadata so the packing list in the Stripe
 * dashboard says exactly what to press.
 */
async function createMerchSession(request: Request, env: Env): Promise<Response> {
  // Validate the order before anything else. A malformed cart is the caller's
  // fault whatever the server's own configuration is, so it earns a 400 rather
  // than being masked by a 500 about a missing key — and rejecting it here
  // costs nothing.
  let body: { lines?: CartLine[]; fulfilment?: Fulfilment };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const lines = body.lines ?? [];
  const problem = validateCart(lines);
  if (problem) return json({ error: problem }, 400);

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Payments are not configured on the server.' }, 500);
  }

  const fulfilment: Fulfilment = body.fulfilment === 'delivery' ? 'delivery' : 'pickup';
  const { delivery } = orderTotal(lines, fulfilment);

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const origin = request.headers.get('origin') ?? 'https://www.fundingmichiganteachers.org';

  const items = lines.map((l) => {
    const product = findProduct(l.productId)!;
    const color = MERCH_COLORS.find((c) => c.id === l.colorId)!;
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${product.name} — ${color.name}, ${l.size}`,
          description: l.atCost
            ? 'Educator pricing: sold at our cost, no margin to FMT.'
            : 'Funding Michigan Teachers · 501(c)(3) EIN 93-4485967',
        },
        unit_amount: unitPrice(product, l.atCost),
      },
      quantity: l.qty,
    };
  });

  if (delivery > 0) {
    items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Local delivery', description: 'Free on orders over $50.' },
        unit_amount: delivery,
      },
      quantity: 1,
    });
  }

  // A compact packing list, because Stripe truncates long metadata values and
  // the line items alone do not say which press setting each shirt needs.
  const packing = lines
    .map((l) => {
      const p = findProduct(l.productId)!;
      const c = MERCH_COLORS.find((x) => x.id === l.colorId)!;
      return `${l.qty}x ${p.name}/${c.name}/${l.size}${l.atCost ? ' (educator)' : ''}`;
    })
    .join('; ')
    .slice(0, 480);

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: items,
      // Delivery needs somewhere to send it; pickup deliberately does not ask.
      ...(fulfilment === 'delivery'
        ? { shipping_address_collection: { allowed_countries: ['US' as const] } }
        : {}),
      phone_number_collection: { enabled: true },
      return_url: `${origin}/shop?stripe_session_id={CHECKOUT_SESSION_ID}`,
      metadata: { order_type: 'merch', fulfilment, packing },
      custom_text: {
        submit: {
          message:
            fulfilment === 'pickup'
              ? 'We will email you to arrange pickup at a school or one of our events.'
              : 'We will email you once your order is pressed and on its way.',
        },
      },
    });
    return json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Merch checkout session failed:', err);
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
    const path = url.pathname;

    // Canonical host: both the apex and www are bound to this Worker and used
    // to serve identical content on two hostnames (duplicate content in
    // Google's eyes). The canonical tag says www, so the apex 301s there.
    if (url.hostname === 'fundingmichiganteachers.org') {
      url.hostname = 'www.fundingmichiganteachers.org';
      return Response.redirect(url.toString(), 301);
    }

    // Canonical paths: /donate/ used to render the HOMEPAGE at 200 (the
    // client router matched exactly, then fell through). Redirect trailing
    // slashes on real pages so ads/links with a stray slash land correctly.
    if (path.length > 1 && /\/+$/.test(path) && !path.startsWith('/api/')) {
      const stripped = path.replace(/\/+$/, '') || '/';
      if (isKnownRoute(stripped)) {
        url.pathname = stripped;
        return Response.redirect(url.toString(), 301);
      }
    }

    // CF-Connecting-IP is set by Cloudflare itself and can't be forged by the
    // client, unlike X-Forwarded-For.
    if (isBlocked(request.headers.get('CF-Connecting-IP'), env)) {
      if (path.startsWith('/api/')) {
        return json({ error: 'Access restricted' }, 403);
      }
      // Assets stay reachable on purpose: without them the restricted page
      // would render as unstyled HTML with no JavaScript.
      if (isAssetPath(path)) {
        return env.ASSETS.fetch(request);
      }
      if (path === '/restricted') {
        return shellWithStatus(request, env, 403);
      }
      return Response.redirect(new URL('/restricted', url).toString(), 302);
    }

    if (path === '/api/create-checkout-session' && request.method === 'POST') {
      return createCheckoutSession(request, env);
    }
    if (path === '/api/create-merch-session' && request.method === 'POST') {
      return createMerchSession(request, env);
    }
    if (path === '/api/checkout-session-status' && request.method === 'GET') {
      return checkoutSessionStatus(request, env);
    }
    if (path.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    // Real pages and static files are served as-is; anything else gets the SPA
    // shell under a genuine 404 so typos and dead links stop reporting success.
    if (isAssetPath(path) || isKnownRoute(path)) {
      return env.ASSETS.fetch(request);
    }
    return shellWithStatus(request, env, 404);
  },
};
