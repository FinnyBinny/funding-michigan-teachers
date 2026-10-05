/**
 * Checks exactly what the Worker sends Stripe for a donation: line items,
 * amounts, recurring flags and metadata, for one-time and monthly gifts,
 * with and without the covered fee. Money code, so it is tested rather than
 * eyeballed. Run: npx tsx scripts/test-donation-session.mts
 */
import { donationSessionParams } from '../worker/index.ts';
import { coverFee } from '../shared/donations.ts';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : `\n      ${detail}`}`);
};
const base = { label: "Where it's needed most", teacher: '', verified: true, origin: 'https://www.fundingmichiganteachers.org' };
const sum = (p: ReturnType<typeof donationSessionParams>) =>
  (p.line_items ?? []).reduce((n, li) => n + (li.price_data?.unit_amount ?? 0) * (li.quantity ?? 1), 0);

// 1. One-time, general, no fee
let p = donationSessionParams({ ...base, giftCents: 2500, feeCents: 0, frequency: 'once', designation: { kind: 'general' } });
check('one-time: payment mode, one line, $25', p.mode === 'payment' && p.line_items?.length === 1 && sum(p) === 2500);
check('one-time: donate button and payment metadata', p.submit_type === 'donate' && p.payment_intent_data?.metadata?.designation === 'general' && !p.subscription_data);

// 2. One-time, school fund, fee covered
const fee = coverFee(2500).feeCents;
p = donationSessionParams({ ...base, giftCents: 2500, feeCents: fee, frequency: 'once', label: 'Okemos Mid-Year Refill', designation: { kind: 'school', slug: 'okemos' } });
check('covered fee is its own line and totals $26.06', p.line_items?.length === 2 && sum(p) === 2606, `got ${sum(p)}`);
check('fee line is named plainly', /processing fee, covered by you/i.test(p.line_items?.[1]?.price_data?.product_data?.name ?? ''));
check('metadata records gift, fee and fund', p.metadata?.gift_amount_cents === '2500' && p.metadata?.fee_covered_cents === String(fee) && p.metadata?.designation === 'school:okemos');
check('payment description names fund and covered fee', /Okemos Mid-Year Refill/.test(String(p.payment_intent_data?.description)) && /covered/.test(String(p.payment_intent_data?.description)));

// 3. Monthly, verified project, fee covered
p = donationSessionParams({ ...base, giftCents: 5000, feeCents: coverFee(5000).feeCents, frequency: 'monthly', label: 'Greenhouse & Life Science Lab Restock', teacher: 'Christina Abbott', designation: { kind: 'project', id: 3 } });
check('monthly: subscription mode', p.mode === 'subscription' && !p.submit_type && !p.payment_intent_data);
check('monthly: BOTH lines recur monthly', (p.line_items ?? []).every((li) => li.price_data?.recurring?.interval === 'month') && p.line_items?.length === 2);
check('monthly: metadata on the subscription too', p.subscription_data?.metadata?.designation === 'project:3' && p.subscription_data?.metadata?.teacher === 'Christina Abbott');
check('monthly: total $51.81', sum(p) === 5181, `got ${sum(p)}`);

// 4. Unverified project (database unreachable) still recorded honestly
p = donationSessionParams({ ...base, giftCents: 1000, feeCents: 0, frequency: 'once', label: 'Classroom project #9', verified: false, designation: { kind: 'project', id: 9 } });
check('unverified project flagged for manual routing', p.metadata?.designation_verified === 'false' && p.metadata?.designation === 'project:9');

console.log(failures ? `\n${failures} FAILED` : '\nAll donation session checks passed.');
process.exit(failures ? 1 : 0);
