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
  '/door-decorating',
  '/donate',
  '/schools',
  '/for-schools',
  '/sponsors',
  '/returnables',
  '/internship',
  '/privacy',
  '/accessibility',
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
  if (BOX_PATH.test(p)) return true;
  return p.startsWith(`${SCHOOLS_BASE}/`) && SCHOOL_SLUGS.includes(p.slice(SCHOOLS_BASE.length + 1));
}

/**
 * /box/<code>: a returnables collection box's tap-to-request page, the link
 * written to its NFC tag and QR code. Codes are 12 hex characters
 * (SUPABASE_BOXES.sql). Whether a code is a real box is the database's
 * answer, so any well-formed code is a page; the page says if it is unknown.
 */
export const BOX_PATH = /^\/box\/[a-f0-9]{6,32}$/i;

export function boxCodeFromPath(pathname: string): string | null {
  const p = pathname.replace(/\/+$/, '');
  return BOX_PATH.test(p) ? p.slice('/box/'.length).toLowerCase() : null;
}
