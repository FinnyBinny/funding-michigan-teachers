/**
 * The site's real routes, in one place.
 *
 * Imported by BOTH the client router (src/main.tsx) and the Cloudflare Worker
 * (worker/index.ts). The Worker needs this list to answer unknown paths with a
 * real 404 status; the client needs it to render the 404 page. Keeping one
 * source of truth means a new page can't be live in the app while the Worker
 * still calls it missing.
 *
 * Deliberately dependency-free so both bundles can import it.
 */
import { SCHOOLS_BASE, SCHOOL_SLUGS, schoolPath } from './schools';

export const KNOWN_ROUTES = [
  '/',
  '/about',
  '/for-teachers',
  '/shop',
  '/donate',
  '/schools',
  '/for-schools',
  '/sponsors',
  '/returnables',
  '/privacy',
  '/access',
  '/restricted',
] as const;

/**
 * Every real path, including one per partner school.
 *
 * School pages are the site's only dynamic route, and they are derived rather
 * than listed so adding a school cannot leave the Worker calling a live page
 * missing. Used for the sitemap and for 404 decisions.
 */
export const ALL_ROUTES: readonly string[] = [
  ...KNOWN_ROUTES,
  ...SCHOOL_SLUGS.map(schoolPath),
];

/** True for a path the app actually renders (trailing slash tolerated). */
export function isKnownRoute(pathname: string): boolean {
  const p = (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname) || '/';
  if ((KNOWN_ROUTES as readonly string[]).includes(p)) return true;
  // /schools/<slug> for a school that exists. An invented slug is a real 404,
  // not a 200 that happens to render the 404 page.
  return p.startsWith(`${SCHOOLS_BASE}/`) && SCHOOL_SLUGS.includes(p.slice(SCHOOLS_BASE.length + 1));
}
