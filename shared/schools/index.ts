/**
 * The partner school registry.
 *
 * ── Adding a fourth school ──────────────────────────────────────────────────
 *   1. Copy an existing file in this folder and fill it in.
 *   2. Import it below and add it to SCHOOLS, in display order.
 * That is the whole job. The route, the 404 behaviour, the sitemap, the
 * homepage section, the /schools index and the school page itself all read
 * from here.
 *
 * It is two steps rather than one because the Cloudflare Worker needs the slug
 * list at build time to answer an unknown /schools/... path with a real 404.
 * Vite could auto-discover these with import.meta.glob; wrangler's esbuild
 * bundle cannot, and a 404 that returns HTTP 200 is a worse bug than an import
 * line.
 *
 * Order matters: this is the order schools appear on the homepage and on
 * /schools. Okemos is first because it is FMT's home building.
 */
import type { School } from './types';
import { okemos } from './okemos';
import { eastLansing } from './east-lansing';
import { haslett } from './haslett';

export type { School, SchoolPhoto, SchoolHighlight, SchoolInitiative, SchoolSponsor, SchoolClub, BandStyle, SchoolColors } from './types';

export const SCHOOLS: readonly School[] = [okemos, eastLansing, haslett];

export const SCHOOL_SLUGS: readonly string[] = SCHOOLS.map((s) => s.slug);

/** Base path for every school page. */
export const SCHOOLS_BASE = '/schools';

export function schoolPath(slug: string): string {
  return `${SCHOOLS_BASE}/${slug}`;
}

export function findSchool(slug: string): School | undefined {
  return SCHOOLS.find((s) => s.slug === slug);
}

/**
 * True when a path is a real school page. Used by the router to pick the
 * template and by the Worker to decide 200 vs 404.
 */
export function schoolSlugFromPath(pathname: string): string | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (!p.startsWith(`${SCHOOLS_BASE}/`)) return null;
  const slug = p.slice(SCHOOLS_BASE.length + 1);
  return SCHOOL_SLUGS.includes(slug) ? slug : null;
}
