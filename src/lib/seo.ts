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

/**
 * Page-specific structured data, beside the organisation-wide graph that
 * index.html ships. Each call replaces the previous page's block, so moving
 * between pages in the app never leaves one page's data on another.
 *
 * Only mark up what is literally on the page. Google treats structured data
 * that describes something the visitor cannot see as spam, which is why the
 * staff-appreciation events are deliberately not marked up as Events: Event
 * markup is for things the public can attend.
 */
export function setPageStructuredData(data: object | null): void {
  const id = 'page-structured-data';
  document.getElementById(id)?.remove();
  if (!data) return;
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = id;
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

/** A BreadcrumbList for a page: [['Partner Schools', '/schools'], …]. */
export function breadcrumbs(trail: Array<[name: string, path: string]>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'] as [string, string], ...trail].map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`,
    })),
  };
}
