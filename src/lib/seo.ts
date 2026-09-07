import { trackPageView } from './analytics';

/**
 * Per-route <head> management for the SPA.
 *
 * index.html ships the homepage's title/description/canonical, and before this
 * existed nothing ever changed them — so every subpage told Google "I am a
 * duplicate of the homepage" via the hardcoded canonical, and every search
 * snippet showed the homepage title. For a Google Ad Grant that is fatal: the
 * ad landing pages (e.g. /donate) would self-canonicalize away.
 *
 * Every page calls setPageMeta() in a mount effect. There is no unmount
 * cleanup on purpose: each route sets every field it cares about, so the last
 * mounted page always wins and nothing stale can linger.
 */

const ORIGIN = 'https://www.fundingmichiganteachers.org';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export interface PageMeta {
  /** Full document title, e.g. "Donate | Funding Michigan Teachers". */
  title: string;
  description: string;
  /** Route path starting with "/", used for the canonical URL and og:url. */
  path: string;
  /** true for pages search engines must not index (admin, restricted, 404). */
  noindex?: boolean;
}

export function setPageMeta({ title, description, path, noindex = false }: PageMeta): void {
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  const canonical = path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
  upsertCanonical(canonical);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  trackPageView(path, title);
}
