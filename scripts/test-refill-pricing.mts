/**
 * Checks Mid-Year Refill pricing and the pieces that carry an order through
 * Stripe and back: what the page shows and the Worker charges are both
 * priceRefillOrder(), the webhook stores encodeRefillLines(), and the admin
 * panel's Amazon link is amazonCartUrl(). Run: npx tsx scripts/test-refill-pricing.mts
 */
import {
  REFILL_ITEMS, REFILL_LISTS, REFILL_SHOPS, priceRefillOrder, validateRefillCart, normalizeRefillLines,
  encodeRefillLines, decodeRefillLines, amazonCartUrl, aggregateRefillLines, missingFromList,
  findRefillItem, isAsin, MAX_QTY, MAX_LINES, type RefillLine,
} from '../shared/refill.ts';
import { coverFee } from '../shared/fees.ts';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : `\n      ${detail}`}`);
};
const pencils = (qty = 1): RefillLine => ({ itemId: 'pencils-72', qty });
const tissues = (qty = 1): RefillLine => ({ itemId: 'tissues-12', qty });
const charged = (r: ReturnType<typeof priceRefillOrder>) => r.items.reduce((n, i) => n + i.unitAmount * i.quantity, 0);
const PENCILS = findRefillItem('pencils-72')!.price;
const TISSUES = findRefillItem('tissues-12')!.price;

// ── Catalogue integrity ──
check('every item belongs to a shop that exists', REFILL_ITEMS.every((i) => REFILL_SHOPS.some((s) => s.id === i.shop)));
check('item ids are unique', new Set(REFILL_ITEMS.map((i) => i.id)).size === REFILL_ITEMS.length);
check('every item has a positive whole-cent price', REFILL_ITEMS.every((i) => Number.isInteger(i.price) && i.price > 0));
check('an ASIN is empty or ten characters', REFILL_ITEMS.every((i) => i.asin === '' || isAsin(i.asin)));
check('every list names only stocked items', REFILL_LISTS.every((l) => l.items.every((x) => findRefillItem(x.itemId))));
check('every shop stocks something', REFILL_SHOPS.every((s) => REFILL_ITEMS.some((i) => i.shop === s.id)));

// ── Pricing ──
let r = priceRefillOrder([pencils()], { coverFee: false });
check('one pack: its price, one line, no fee', r.total === PENCILS && r.items.length === 1 && r.fee === 0 && r.packs === 1);
check('the line says it is a donation', /^Donation:/.test(r.items[0].name));

r = priceRefillOrder([pencils(2), tissues()], { coverFee: false });
check('two items add up', r.subtotal === 2 * PENCILS + TISSUES && r.packs === 3);

r = priceRefillOrder([pencils()], { coverFee: true });
check('covered fee: grossed up, on its own line', r.total === coverFee(PENCILS).totalCents && r.fee === coverFee(PENCILS).feeCents && r.items.length === 2, `got ${r.total}`);

r = priceRefillOrder([{ itemId: 'nope', qty: 1 }, pencils()], { coverFee: true });
check('unknown item is never charged', r.subtotal === PENCILS && r.items.length === 2);

r = priceRefillOrder([pencils(999)], { coverFee: false });
check(`quantity is capped at ${MAX_QTY}`, r.packs === MAX_QTY);

r = priceRefillOrder([], { coverFee: true });
check('empty basket: nothing, and no fee on nothing', r.total === 0 && r.fee === 0 && r.items.length === 0);

for (const [label, lines] of [['plain', [pencils(), tissues(3)]], ['with fee', [pencils(4)]]] as const) {
  r = priceRefillOrder([...lines], { coverFee: label === 'with fee' });
  check(`${label}: line items add up to the total`, charged(r) === r.total, `${charged(r)} vs ${r.total}`);
}

// ── Validation (what the Worker refuses) ──
check('empty cart refused', validateRefillCart([]) !== null);
check('unknown item refused', validateRefillCart([{ itemId: 'nope', qty: 1 }]) !== null);
check('zero quantity refused', validateRefillCart([pencils(0)]) !== null);
check('fractional quantity refused', validateRefillCart([{ itemId: 'pencils-72', qty: 1.5 }]) !== null);
check('over the cap refused', validateRefillCart([pencils(MAX_QTY + 1)]) !== null);
check('duplicate line refused', validateRefillCart([pencils(), pencils()]) !== null);
check('too many lines refused', validateRefillCart(Array.from({ length: MAX_LINES + 1 }, (_, i) => ({ itemId: REFILL_ITEMS[i % REFILL_ITEMS.length].id, qty: 1 }))) !== null);
check('a good cart passes', validateRefillCart([pencils(2), tissues()]) === null);
check('not an array refused', validateRefillCart('pencils') !== null);

// ── Normalising what the page holds ──
const norm = normalizeRefillLines([pencils(1), pencils(2), { itemId: 'nope', qty: 1 }, tissues(0)]);
check('normalize merges duplicates and drops junk', norm.length === 1 && norm[0].qty === 3);

// ── Round trip through Stripe metadata ──
const enc = encodeRefillLines([pencils(2), tissues()]);
check('encodes compactly', enc === 'pencils-72:2;tissues-12:1', enc);
const dec = decodeRefillLines(enc);
check('decodes back', dec.length === 2 && dec[0].itemId === 'pencils-72' && dec[0].qty === 2 && dec[1].qty === 1);
check('decode ignores garbage', decodeRefillLines('x:1;pencils-72:abc;;tissues-12:2').length === 1);
check('decode of a non-string is empty', decodeRefillLines(undefined).length === 0 && decodeRefillLines(42).length === 0);
const biggest = REFILL_LISTS.reduce((a, b) => (a.items.length > b.items.length ? a : b));
check('the biggest list fits Stripe metadata', encodeRefillLines([...biggest.items]).length < 500);

// ── Lists ──
const list = REFILL_LISTS[0];
check('an empty basket misses the whole list', missingFromList(list, []).length === list.items.length);
check('a full basket misses nothing', missingFromList(list, [...list.items]).length === 0);
check('a partial basket reports the shortfall', missingFromList(list, [{ itemId: list.items[0].itemId, qty: list.items[0].qty - 1 }])[0].qty === 1);

// ── Amazon cart ──
// notebooks-12 has no ASIN yet (see shared/refill.ts); pencils-72 does.
const notebooks = (qty = 1): RefillLine => ({ itemId: 'notebooks-12', qty });
const noAsin = amazonCartUrl([notebooks()]);
check('items without an ASIN are skipped, and reported', noAsin.url === null && noAsin.skipped.length === 1);
const pencilAsin = findRefillItem('pencils-72')!.asin;
const withAsin = amazonCartUrl([pencils(3), notebooks()]);
check('cart link carries ASIN and quantity', withAsin.url === `https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=${pencilAsin}&Quantity.1=3` && withAsin.skipped.length === 1, withAsin.url ?? 'null');
check('cart link numbers several items in order', amazonCartUrl([pencils(2), tissues(1)]).url?.includes('ASIN.2=') === true);

const agg = aggregateRefillLines([[pencils(2), tissues()], [pencils(1)]]);
check('orders aggregate into one shopping list', agg.find((l) => l.itemId === 'pencils-72')?.qty === 3 && agg.find((l) => l.itemId === 'tissues-12')?.qty === 1);

console.log(failures ? `\n${failures} refill check(s) FAILED.` : '\nAll refill checks passed.');
process.exit(failures ? 1 : 0);
