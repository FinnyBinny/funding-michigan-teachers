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
  MERCH_COLORS, findProduct, unitPrice, orderTotal, validateCart, findCode,
  CODE_LABEL, type CartLine, type Fulfilment,
} from '../shared/merch';

/**
 * A Secrets Store binding, as the dashboard's Bindings → "Add a binding" →
 * "Secrets Store" flow creates it. Cloudflare hands the Worker an object with
 * one async method rather than the value itself, which is why that panel's
 * example reads `await env.MY_SECRET.get()`.
 *
 * Spelled out here rather than imported so this file compiles whichever kind
 * of binding is actually attached.
 */
interface SecretsStoreBinding {
  /** Resolves the secret's value, or throws if the secret no longer exists. */
  get(): Promise<string>;
}

/**
 * A credential that may arrive in either shape.
 *
 * "Settings → Variables and Secrets → Secret" (and `wrangler secret put`)
 * injects a plain string. "Settings → Bindings → Secrets Store" injects the
 * object above. Both are legitimate, and the person wiring one up is in a
 * dashboard rather than in this file — so accept either and resolve it
 * through readSecret().
 */
type SecretValue = string | SecretsStoreBinding;

export interface Env {
  ASSETS: Fetcher;
  STRIPE_SECRET_KEY?: string;
  /**
   * Comma-separated IPs to deny, set in the Cloudflare dashboard (Settings →
   * Variables and Secrets). Preferred over the in-code list below: it takes
   * effect without a deploy and doesn't publish the addresses to GitHub.
   */
  BLOCKED_IPS?: string;
  /**
   * Merch codes, set in the Cloudflare dashboard so they never ship to the
   * browser. Format: "OKEMOS26:educator, TOM-OCT26:free-tee".
   * See shared/merch.ts for the kinds and the rotation advice.
   */
  MERCH_CODES?: string;
  /**
   * Bloomerang API key, set in the Cloudflare dashboard as a Secret.
   *
   * This is a PRIVATE key and must never be prefixed VITE_, committed, or
   * sent to the browser — it can read and write the whole CRM. The public
   * `pub_` key that used to run in the browser is a different credential
   * entirely, and the reason this endpoint exists: with reCAPTCHA enabled on
   * Bloomerang's forms, a browser call carrying no captcha token is refused,
   * and there is no way to obtain one without Bloomerang's own widget on the
   * page. A server-to-server call is authenticated instead, so captcha —
   * which exists to prove a human filled a form — does not apply.
   *
   * Absent, this endpoint answers 503 and the site carries on: every form
   * already delivers by email, and the CRM copy is the only thing missing.
   *
   * Either a plain secret string or a Secrets Store binding — see SecretValue.
   * Always read it through readSecret(), never directly: a Secrets Store
   * binding is a truthy OBJECT, so a bare `if (!env.BLOOMERANG_API_KEY)` check
   * passes and the object then stringifies into the X-API-KEY header as the
   * literal text "[object Object]". Bloomerang answers 401, which reads like a
   * revoked key rather than a mis-typed binding and costs an afternoon
   * regenerating a key that was never the problem.
   */
  BLOOMERANG_API_KEY?: SecretValue;
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
  // '/' rather than '/index.html': with html_handling at its default the asset
  // service answers '/index.html' with a 307 to '/', and leaning on the binding
  // to follow its own redirect is a dependency worth not having.
  const shellUrl = new URL('/', request.url).toString();

  // A real page forwards the caller's headers so If-None-Match still earns a
  // 304. The shell is ~15KB and every page view fetches it; dropping the
  // validator here would make all of them unconditional.
  const headers = new Headers(request.headers);
  if (status !== 200) {
    // A 304 must never come back under a 404 or 403, so don't let the asset
    // service answer conditionally on those paths.
    headers.delete('If-None-Match');
    headers.delete('If-Modified-Since');
  }

  const res = await env.ASSETS.fetch(
    new Request(shellUrl, { method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers }),
  );
  if (status === 200) return res;

  const out = new Headers(res.headers);
  // The shell's ETag belongs to its 200 response. Carried onto a 404 or 403 it
  // lets a later conditional request be answered 304 for the wrong status.
  out.delete('ETag');
  out.set('Cache-Control', 'no-store');
  return new Response(res.body, { status, headers: out });
}

/**
 * Resolves a credential that may be a plain string or a Secrets Store binding.
 *
 * Returns undefined when it is absent or unreadable, which every caller already
 * handles by answering 503: a missing CRM key is a setup step, not an outage,
 * and the forms deliver by email regardless.
 *
 * Deliberately returns rather than throws, and deliberately logs nothing. A
 * Secrets Store failure message is safe to print today, but code that prints
 * near a credential eventually prints the credential.
 */
async function readSecret(value: SecretValue | undefined): Promise<string | undefined> {
  if (typeof value === 'string') return value.trim() || undefined;
  if (value && typeof value.get === 'function') {
    try {
      const resolved = await value.get();
      return typeof resolved === 'string' && resolved.trim() ? resolved.trim() : undefined;
    } catch {
      // Secrets Store throws when the binding points at a secret that was
      // deleted or renamed. Same outcome for us as never having been set.
      return undefined;
    }
  }
  return undefined;
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
 * Answers "is this code any good?" for the shop, so the order slip can show
 * the discount before checkout. It reveals nothing beyond the answer for the
 * one code asked about — it never enumerates codes, and the real enforcement
 * still happens when the session is created.
 */
async function checkMerchCode(request: Request, env: Env): Promise<Response> {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }
  const entered = String(body.code ?? '').slice(0, 40);
  const match = findCode(env.MERCH_CODES, entered);
  if (!match) return json({ valid: false });
  return json({ valid: true, kind: match.kind, label: CODE_LABEL[match.kind] });
}

/**
 * Merch checkout.
 *
 * The browser sends product ids, sizes, colors and quantities — never prices,
 * and never a claim about which discount applies. Every amount, and the code
 * itself, is resolved from the server's own data, because a checkout that
 * trusts the page can be bought from for whatever the buyer types into dev
 * tools.
 *
 * Size and color ride along in metadata so the packing list in the Stripe
 * dashboard says exactly what to press.
 */
async function createMerchSession(request: Request, env: Env): Promise<Response> {
  // Validate the order before anything else. A malformed cart is the caller's
  // fault whatever the server's own configuration is, so it earns a 400 rather
  // than being masked by a 500 about a missing key — and rejecting it here
  // costs nothing.
  let body: { lines?: CartLine[]; fulfilment?: Fulfilment; code?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const lines = body.lines ?? [];
  const problem = validateCart(lines);
  if (problem) return json({ error: problem }, 400);

  // The code is re-checked here, not trusted from the page. A browser that
  // claims educator pricing without a valid code simply does not get it.
  const code = findCode(env.MERCH_CODES, String(body.code ?? ''));
  const educatorPricing = code?.kind === 'educator';
  let freeTeeRemaining = code?.kind === 'free-tee' ? 1 : 0;

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Payments are not configured on the server.' }, 500);
  }

  const fulfilment: Fulfilment = body.fulfilment === 'delivery' ? 'delivery' : 'pickup';
  const { delivery } = orderTotal(lines, fulfilment);

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const origin = request.headers.get('origin') ?? 'https://www.fundingmichiganteachers.org';

  const items: {
    price_data: {
      currency: string;
      product_data: { name: string; description: string };
      unit_amount: number;
    };
    quantity: number;
  }[] = [];

  for (const l of lines) {
    const product = findProduct(l.productId)!;
    const color = MERCH_COLORS.find((c) => c.id === l.colorId)!;
    const atCost = educatorPricing || l.atCost;

    // A free-tee code covers exactly one shirt. The rest of the line is
    // charged normally rather than the whole line going free.
    let freeHere = 0;
    if (freeTeeRemaining > 0 && product.id === 'tee') {
      freeHere = Math.min(freeTeeRemaining, l.qty);
      freeTeeRemaining -= freeHere;
    }

    if (freeHere > 0) {
      items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} — ${color.name}, ${l.size}`,
            description: 'Teacher of the Month — on us.',
          },
          unit_amount: 0,
        },
        quantity: freeHere,
      });
    }

    if (l.qty - freeHere > 0) {
      items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} — ${color.name}, ${l.size}`,
            description: atCost
              ? 'Educator pricing: sold at our cost, no margin to FMT.'
              : 'Funding Michigan Teachers · 501(c)(3) EIN 93-4485967',
          },
          unit_amount: unitPrice(product, atCost),
        },
        quantity: l.qty - freeHere,
      });
    }
  }

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
      metadata: { order_type: 'merch', fulfilment, packing, code: code?.code ?? '' },
      /**
       * The packing list on the PaymentIntent, not just the session.
       *
       * Session metadata is only visible if you open the Checkout Session,
       * which is two clicks off the Payments list and not where anyone
       * actually looks. A PaymentIntent description shows in the Payments
       * list, on the payment page, in the emailed receipt and in a CSV
       * export — so the order can be pressed straight from Stripe instead of
       * emailing the buyer to ask what they bought.
       */
      payment_intent_data: {
        description: `${packing} — ${fulfilment === 'delivery' ? 'DELIVERY' : 'pickup'}`,
        metadata: { order_type: 'merch', fulfilment, packing, code: code?.code ?? '' },
      },
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

/**
 * Files a form submission into Bloomerang, server to server.
 *
 * Replaces calling Bloomerang from the visitor's browser. That worked only
 * while their forms had no reCAPTCHA: their own embed sends a captcha token
 * with every submit, obtained from a widget their library renders, and
 * nothing outside that embed can produce one. With captcha enabled, a
 * browser call is refused no matter what it contains. An authenticated
 * server call is not subject to it at all.
 *
 * Two requests, deliberately. Bloomerang will happily create a second
 * constituent for an address it already holds, so a teacher who asks for
 * supplies twice would become two people in the CRM. This searches first and
 * reuses the account when one exists.
 *
 * Never fails the caller's form: the site reports success from its own email
 * delivery, and this answers with whether the CRM copy also landed so the
 * browser console can say so.
 */
async function fileInBloomerang(request: Request, env: Env): Promise<Response> {
  let body: { form?: string; name?: string; email?: string; phone?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const email = String(body.email ?? '').trim();
  if (!email.includes('@')) return json({ error: 'A valid email is required' }, 400);

  // Resolved once per request, not once per call: this handler makes up to
  // three Bloomerang requests, and under Secrets Store each .get() is a real
  // binding call.
  const apiKey = await readSecret(env.BLOOMERANG_API_KEY);
  if (!apiKey) {
    // Not configured yet. Not an error worth alarming anyone about — the
    // submission reached FMT by email regardless.
    return json({ filed: false, reason: 'BLOOMERANG_API_KEY is not set on the Worker' }, 503);
  }

  const api = async (path: string, init?: RequestInit) => {
    const res = await fetch(`https://api.bloomerang.co/v2/${path}`, {
      ...init,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    let parsed: unknown = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { /* keep the raw text */ }
    return { ok: res.ok, status: res.status, body: parsed, raw: text.slice(0, 400) };
  };

  // Everything before the final space is the first name, which keeps middle
  // names attached rather than dropping them.
  const parts = String(body.name ?? '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
  const lastName = parts.length ? parts[parts.length - 1] : '';

  try {
    // 1. Is this person already in the CRM?
    const found = await api(`constituents/search?search=${encodeURIComponent(email)}&take=1`);
    let accountId: number | undefined =
      (found.body as { Results?: { Id?: number }[] } | null)?.Results?.[0]?.Id;

    // 2. Create them if not.
    if (!accountId) {
      const created = await api('constituent', {
        method: 'POST',
        body: JSON.stringify({
          Type: 'Individual',
          FirstName: firstName,
          LastName: lastName || email,
          PrimaryEmail: { Type: 'Home', Value: email },
          ...(body.phone ? { PrimaryPhone: { Type: 'Home', Number: body.phone } } : {}),
        }),
      });
      if (!created.ok) {
        return json({ filed: false, stage: 'constituent', status: created.status, detail: created.raw }, 502);
      }
      accountId = (created.body as { Id?: number } | null)?.Id;
    }

    if (!accountId) {
      return json({ filed: false, stage: 'constituent', detail: 'no account id returned' }, 502);
    }

    // 3. Record what they actually sent.
    const interaction = await api('interaction', {
      method: 'POST',
      body: JSON.stringify({
        AccountId: accountId,
        Channel: 'Email',
        Purpose: 'Other',
        Subject: String(body.form ?? 'Website form'),
        Note: String(body.note ?? ''),
        Date: new Date().toISOString().slice(0, 10),
      }),
    });

    if (!interaction.ok) {
      // The person is in the CRM even if the note did not attach, which is
      // worth saying rather than reporting a flat failure.
      return json(
        { filed: 'partial', accountId, stage: 'interaction', status: interaction.status, detail: interaction.raw },
        502,
      );
    }

    return json({ filed: true, accountId });
  } catch (err) {
    return json({ filed: false, detail: err instanceof Error ? err.message : 'unknown error' }, 502);
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
    if (path === '/api/check-merch-code' && request.method === 'POST') {
      return checkMerchCode(request, env);
    }
    if (path === '/api/create-merch-session' && request.method === 'POST') {
      return createMerchSession(request, env);
    }
    if (path === '/api/crm' && request.method === 'POST') {
      return fileInBloomerang(request, env);
    }
    if (path === '/api/checkout-session-status' && request.method === 'GET') {
      return checkoutSessionStatus(request, env);
    }
    if (path.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    // Static files come from the asset store, and now genuinely 404 when the
    // file isn't there. A hashed bundle from a previous build must never come
    // back as the HTML shell: the browser refuses it as a module script, the
    // lazy import rejects, and the visitor is left on a blank page.
    if (isAssetPath(path)) {
      const res = await env.ASSETS.fetch(request);
      // Someone who typed a missing file into the address bar still gets the
      // branded 404. A subresource fetch keeps the bare one so the browser —
      // and src/main.tsx's recovery — can see the failure honestly.
      if (res.status === 404 && request.headers.get('Sec-Fetch-Mode') === 'navigate') {
        return shellWithStatus(request, env, 404);
      }
      return res;
    }

    // Pages are the Worker's job now that the asset service no longer falls
    // back to the shell. Real routes get it at 200, anything else under a
    // genuine 404 so typos and dead links stop reporting success.
    return shellWithStatus(request, env, isKnownRoute(path) ? 200 : 404);
  },
};
