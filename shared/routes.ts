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
export const KNOWN_ROUTES = [
  '/',
  '/donate',
  '/for-schools',
  '/sponsors',
  '/returnables',
  '/access',
  '/restricted',
] as const;

/** True for a path the app actually renders (trailing slash tolerated). */
export function isKnownRoute(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return (KNOWN_ROUTES as readonly string[]).includes(p || '/');
}
