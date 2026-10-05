/**
 * Checks the Worker's Bloomerang filing: the Stripe webhook (signed test
 * events, so the signature check is real) and the /api/crm form path, with
 * Bloomerang itself mocked. Run: npx tsx scripts/test-crm.mts
 */
import Stripe from 'stripe';
import worker from '../worker/index.ts';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : `\n      ${detail}`}`);
};

// ── A pretend Bloomerang ────────────────────────────────────────────────────
type Call = { url: string; body: any };
let calls: Call[] = [];
let searchResults: any[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith('https://api.bloomerang.co/')) return realFetch(input, init);
  const body = init?.body ? JSON.parse(init.body) : null;
  calls.push({ url, body });
  if (url.includes('constituents/search')) return Response.json({ Results: searchResults });
  if (url.endsWith('/constituent')) return Response.json({ Id: 7 });
  if (url.endsWith('/interaction')) return Response.json({ Id: 99 });
  return new Response('not mocked', { status: 500 });
}) as typeof fetch;

const SECRET = 'whsec_test_secret';
const env: any = {
  ASSETS: { fetch: () => new Response('') },
  STRIPE_SECRET_KEY: 'sk_test_dummy',
  STRIPE_WEBHOOK_SECRET: SECRET,
  BLOOMERANG_API_KEY: 'test-key',
};
const stripe = new Stripe('sk_test_dummy');

async function sendEvent(event: object, secret = SECRET, e = env) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return worker.fetch(new Request('https://www.fundingmichiganteachers.org/api/stripe-webhook', {
    method: 'POST', headers: { 'Stripe-Signature': header, 'Content-Type': 'application/json' }, body: payload,
  }), e);
}
const completed = (session: object) => ({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: session } });

// 1. A forged event is refused.
calls = [];
let res = await sendEvent(completed({ id: 'cs_1' }), 'whsec_wrong');
check('forged signature is refused, nothing filed', res.status === 400 && calls.length === 0, `status ${res.status}`);

// 2. A donation files a new person and the gift.
calls = []; searchResults = [];
res = await sendEvent(completed({
  id: 'cs_test_gift', mode: 'payment', amount_total: 2606,
  customer_details: { email: 'donor@example.com', name: 'Pat Donor', phone: null },
  metadata: { gift_amount_cents: '2500', fee_covered_cents: '106', designation_label: 'Okemos Mid-Year Refill' },
}));
const created = calls.find((c) => c.url.endsWith('/constituent'));
const interaction = calls.find((c) => c.url.endsWith('/interaction'));
check('donation: 200 and filed', res.status === 200 && (await res.json() as any).filed === true);
check('donation: new constituent with the donor email', created?.body?.PrimaryEmail?.Value === 'donor@example.com');
check('donation: interaction says what and where',
  /Gift of \$25\.00 to Okemos Mid-Year Refill, plus \$1\.06 to cover the card fee/.test(interaction?.body?.Note ?? ''),
  interaction?.body?.Note);
check('donation: filed as an inbound website contact', interaction?.body?.Channel === 'Website' && interaction?.body?.IsInbound === true && interaction?.body?.Subject === 'Website — donation');

// 3. An existing person is matched only on the exact email.
calls = [];
searchResults = [
  { Id: 1, PrimaryEmail: { Value: 'someone.else@example.com' } },
  { Id: 2, PrimaryEmail: { Value: 'DONOR@example.com' } },
];
await sendEvent(completed({
  id: 'cs_test_again', mode: 'subscription', amount_total: 5000,
  customer_details: { email: 'donor@example.com', name: 'Pat Donor' },
  metadata: { gift_amount_cents: '5000' },
}));
check('repeat donor: no duplicate created', !calls.some((c) => c.url.endsWith('/constituent')));
check('repeat donor: attached to the exact-email match, not the first hit',
  calls.find((c) => c.url.endsWith('/interaction'))?.body?.AccountId === 2);
check('monthly gift is called monthly', /^Monthly gift of \$50\.00/.test(calls.find((c) => c.url.endsWith('/interaction'))?.body?.Note ?? ''));

// 4. A shop order is filed as an order, not a gift.
calls = []; searchResults = [];
await sendEvent(completed({
  id: 'cs_test_order', mode: 'payment', amount_total: 2500,
  customer_details: { email: 'buyer@example.com', name: 'B Buyer', phone: '5175550100' },
  metadata: { order_type: 'merch', packing: '1x FMT T-Shirt/Navy/M', fulfilment: 'pickup' },
}));
const orderNote = calls.find((c) => c.url.endsWith('/interaction'))?.body;
check('shop order: subject and packing list', orderNote?.Subject === 'Website — shop order' && /1x FMT T-Shirt\/Navy\/M/.test(orderNote?.Note ?? ''));

// 5. Not set up yet: 503, and Stripe is not told it worked.
res = await sendEvent(completed({ id: 'cs_x' }), SECRET, { ...env, STRIPE_WEBHOOK_SECRET: undefined });
check('no webhook secret: 503', res.status === 503);

// 6. The form path refuses other websites.
res = await worker.fetch(new Request('https://www.fundingmichiganteachers.org/api/crm', {
  method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'a@b.co' }),
}), env);
check('/api/crm from another site: 403', res.status === 403);

console.log(failures ? `\n${failures} CRM check(s) FAILED.` : '\nAll CRM checks passed.');
process.exit(failures ? 1 : 0);
