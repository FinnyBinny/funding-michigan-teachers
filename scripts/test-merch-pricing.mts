/**
 * Checks shop pricing: what the page shows and the Worker charges are both
 * priceOrder(), so this tests the one function both sides call. Covers
 * educator pricing, the free-tee code, delivery and the covered card fee.
 * Run: npx tsx scripts/test-merch-pricing.mts
 */
import { priceOrder, type CartLine, type PricingOptions } from '../shared/merch.ts';
import { coverFee } from '../shared/fees.ts';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : `\n      ${detail}`}`);
};
const tee = (qty = 1): CartLine => ({ productId: 'tee', size: 'M', colorId: 'navy', qty });
const hoodie = (qty = 1): CartLine => ({ productId: 'hoodie', size: 'L', colorId: 'white', qty });
const opts = (o: Partial<PricingOptions> = {}): PricingOptions =>
  ({ fulfilment: 'pickup', educator: false, codeKind: null, coverFee: false, ...o });
const charged = (r: ReturnType<typeof priceOrder>) => r.items.reduce((n, i) => n + i.unitAmount * i.quantity, 0);

let r = priceOrder([tee()], opts());
check('one tee, pickup: $25, nothing else', r.total === 2500 && r.items.length === 1 && r.fee === 0);

r = priceOrder([tee()], opts({ coverFee: true }));
check('covered fee: $26.06, fee on its own line', r.total === 2606 && r.fee === 106 && r.items.length === 2, `got ${r.total}`);
check('fee line says what it is', /processing fee, covered by you/i.test(r.items[1].name));

r = priceOrder([tee()], opts({ educator: true }));
check('educator box: tee at cost ($14)', r.total === 1400 && /at our cost/.test(r.items[0].description));

r = priceOrder([tee()], opts({ codeKind: 'educator' }));
check('educator code: same as the box', r.total === 1400);

r = priceOrder([tee(2)], opts({ codeKind: 'free-tee' }));
check('free-tee code: one of two tees free', r.merchandise === 2500 && r.freeTeeSavings === 2500 && r.items.length === 2 && r.items[0].unitAmount === 0 && r.items[0].quantity === 1);

r = priceOrder([tee()], opts({ codeKind: 'free-tee', coverFee: true }));
check('free tee alone, pickup: $0 and no fee on nothing', r.total === 0 && r.fee === 0);

r = priceOrder([tee()], opts({ codeKind: 'free-tee', fulfilment: 'delivery', coverFee: true }));
check('free tee delivered: pays $5 delivery plus its fee', r.delivery === 500 && r.fee === coverFee(500).feeCents && r.total === 500 + coverFee(500).feeCents, `got ${r.total}`);

r = priceOrder([hoodie(2)], opts({ fulfilment: 'delivery' }));
check('$90 delivered: delivery free over $50', r.delivery === 0 && r.total === 9000);

r = priceOrder([tee()], opts({ fulfilment: 'delivery', coverFee: true }));
check('fee is grossed up on garments + delivery', r.total === coverFee(3000).totalCents, `got ${r.total}`);

r = priceOrder([{ productId: 'nope', size: 'M', colorId: 'navy', qty: 1 }, tee()], opts());
check('unknown product is never charged', r.total === 2500 && r.items.length === 1);

for (const [label, o, lines] of [
  ['plain', opts(), [tee(), hoodie()]],
  ['all options', opts({ fulfilment: 'delivery', educator: true, codeKind: 'free-tee', coverFee: true }), [tee(3), hoodie()]],
] as const) {
  r = priceOrder([...lines], o);
  check(`${label}: line items add up to the total`, charged(r) === r.total, `${charged(r)} vs ${r.total}`);
}

console.log(failures ? `\n${failures} shop pricing check(s) FAILED.` : '\nAll shop pricing checks passed.');
process.exit(failures ? 1 : 0);
