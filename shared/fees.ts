/**
 * The card-fee formula, shared by donations, the shop and the Worker.
 *
 * Dependency-free so anything can import it. shared/donations.ts re-exports
 * these, so existing imports from there keep working.
 */

/**
 * Stripe's standard US card rate, confirmed by the founder (October 2026).
 * If FMT moves to Stripe's discounted nonprofit rate, change these two numbers
 * and nothing else.
 */
export const CARD_FEE = { percent: 0.029, fixedCents: 30 } as const;

/**
 * What to charge so that, after Stripe takes its percentage and fixed fee
 * from the WHOLE charge, FMT is left with exactly `amountCents`.
 *
 * Grossing up is the only correct way: adding 2.9% of the amount falls short,
 * because Stripe's 2.9% is taken from the total, fee included. Rounded UP to
 * the cent so FMT is never a cent short.
 *
 *   $25.00 -> $26.06 (fee $1.06)    $50.00 -> $51.81 (fee $1.81)
 *   $100.00 -> $103.30 (fee $3.30)
 *
 * Cards from outside the US, and some card types, can cost more than the
 * standard rate, so on those the covered amount can fall slightly short. It
 * never overcharges.
 */
export function coverFee(amountCents: number): { totalCents: number; feeCents: number } {
  const totalCents = Math.ceil((amountCents + CARD_FEE.fixedCents) / (1 - CARD_FEE.percent));
  return { totalCents, feeCents: totalCents - amountCents };
}

/** $1.06, never $1.0600000000000001; whole dollars drop the cents. */
export function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;
}
