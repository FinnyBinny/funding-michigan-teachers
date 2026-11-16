/**
 * "Markdown for agents": the same page as Markdown, for a client that asks.
 *
 * An AI agent reading the site gets its HTML: on every page but the homepage
 * an empty shell that JavaScript fills in, and on the homepage a few hundred
 * kilobytes of markup around a few kilobytes of words. A request that says
 * `Accept: text/markdown` now gets the page's content as Markdown instead.
 * Browsers never send that, so nothing changes for people.
 *
 * Cloudflare has a switch that does this conversion at its edge, but it is
 * for Pro plans and up and it converts whatever HTML the origin sends, which
 * here is the empty shell. So the Markdown is written at build time from the
 * real pages (scripts/build-markdown.mjs) and the Worker picks which form to
 * send using the rules below.
 *
 * Shared by the Worker, the build script and the tests. Dependency-free.
 */
import { ALL_ROUTES } from './routes';
import { metaForPath } from './pageMeta';

/** Every page that has a Markdown form: the public, indexable ones. */
export const MARKDOWN_ROUTES: readonly string[] = ALL_ROUTES.filter((p) => !metaForPath(p).noindex);

/** Where a route's Markdown file sits in the built site. */
export function markdownAssetPath(route: string): string {
  return route === '/' ? '/md/home.md' : `/md${route}.md`;
}

/** The route, without a trailing slash, if it has a Markdown form. */
export function markdownRouteFor(pathname: string): string | null {
  const p = (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname) || '/';
  return MARKDOWN_ROUTES.includes(p) ? p : null;
}

/**
 * Does this Accept header prefer Markdown to HTML?
 *
 * Standard content negotiation, matching what Cloudflare documents for its
 * own feature:
 *   text/markdown                      -> yes
 *   text/markdown, text/html;q=0.9     -> yes
 *   text/*                             -> yes
 *   * / *  (curl, and every browser's fallback) -> no: HTML stays the default
 *   text/html, text/markdown;q=0.5     -> no
 * On a tie between text/html and text/markdown the one listed first wins.
 * A missing or empty header is HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  let md: { q: number; at: number } | null = null;
  let html: { q: number; at: number } | null = null;
  let textAny: { q: number; at: number } | null = null;
  accept.split(',').forEach((part, at) => {
    const [range, ...params] = part.split(';').map((s) => s.trim().toLowerCase());
    let q = 1;
    for (const param of params) {
      const m = /^q\s*=\s*(.*)$/.exec(param);
      if (m) {
        const n = m[1] === '' ? NaN : Number(m[1]);
        q = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
      }
    }
    if (range === 'text/markdown') md ??= { q, at };
    else if (range === 'text/html' || range === 'application/xhtml+xml') html ??= { q, at };
    else if (range === 'text/*') textAny ??= { q, at };
  });
  // text/* stands in for whichever of the two was not named outright.
  const m: { q: number; at: number } | null = md ?? textAny;
  const h: { q: number; at: number } | null = html ?? (md ? textAny : null);
  if (!m || m.q <= 0) return false;
  if (!h) return true;
  if (m.q !== h.q) return m.q > h.q;
  // Same weight. text/* alone covers both: Cloudflare answers Markdown.
  if (!md && !html) return true;
  return m.at < h.at;
}

/** A rough token count, as Cloudflare's x-markdown-tokens gives: ~4 characters each. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
