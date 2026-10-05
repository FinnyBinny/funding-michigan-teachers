/**
 * Shared by the donate page, the shop and the Worker: the processing-fee
 * formula and the list of things a gift can be designated to.
 *
 * The page uses these to SHOW the numbers; the Worker uses the same functions
 * to CHARGE them. Because both import this file, the total a donor is shown
 * and the total Stripe charges cannot drift apart — and the Worker never takes
 * a fee or a total from the browser, only a yes/no.
 *
 * Dependency-free so the Worker can bundle it.
 */
import { SCHOOLS, findSchool } from './schools';

// ── Processing fee ───────────────────────────────────────────────────────────
// Lives in shared/fees.ts so the shop can use it without the school registry.
export { CARD_FEE, coverFee, dollars } from './fees';

// ── Amount limits ───────────────────────────────────────────────────────────
// The page validates the typed amount against these and the Worker refuses
// anything outside them. In dollars.
export const MIN_GIFT = 1;
export const MAX_GIFT = 100000;

// ── Designation ─────────────────────────────────────────────────────────────

/**
 * Where a gift goes. A closed set of kinds, so the Worker can check every one
 * against something it trusts rather than printing whatever text arrived:
 *
 *   general  — where it's needed most (the default)
 *   school   — that school's Mid-Year Refill; checked against the school
 *              registry in shared/schools
 *   project  — one teacher's classroom project; checked by the Worker against
 *              the projects table
 */
export type Designation =
  | { kind: 'general' }
  | { kind: 'school'; slug: string }
  | { kind: 'project'; id: number };

export const GENERAL: Designation = { kind: 'general' };

/** 'general' | 'school:okemos' | 'project:3' — what travels in URLs and requests. */
export function encodeDesignation(d: Designation): string {
  if (d.kind === 'school') return `school:${d.slug}`;
  if (d.kind === 'project') return `project:${d.id}`;
  return 'general';
}

/**
 * The inverse. Anything malformed reads as null, never as a guess, so the
 * Worker can refuse it rather than mislabel a payment.
 */
export function decodeDesignation(raw: unknown): Designation | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (s === 'general' || s === '') return GENERAL;
  const school = /^school:([a-z0-9-]{1,40})$/.exec(s);
  if (school) return findSchool(school[1]) ? { kind: 'school', slug: school[1] } : null;
  const project = /^project:(\d{1,9})$/.exec(s);
  if (project) return { kind: 'project', id: Number(project[1]) };
  return null;
}

/** "Okemos Mid-Year Refill" — the label a school designation shows everywhere. */
export function schoolFundLabel(slug: string): string | null {
  const school = findSchool(slug);
  return school ? `${school.shortName} Mid-Year Refill` : null;
}

/** Every school fund, for building a picker. */
export function schoolFunds(): Array<{ slug: string; label: string }> {
  return SCHOOLS.map((s) => ({ slug: s.slug, label: `${s.shortName} Mid-Year Refill` }));
}

/**
 * Links written before designations existed say ?fund=Okemos%20Mid-Year%20Refill.
 * Those are on printed material and school pages, so they keep working: a
 * fund title that names a school's refill maps onto that school.
 */
export function designationFromLegacyFund(title: string | null): Designation | null {
  if (!title) return null;
  const t = title.trim().toLowerCase();
  const school = SCHOOLS.find((s) => t === `${s.shortName} mid-year refill`.toLowerCase());
  return school ? { kind: 'school', slug: school.slug } : null;
}
