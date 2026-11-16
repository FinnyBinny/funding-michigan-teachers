/**
 * Writes a Markdown copy of every public page into dist/md/.
 *
 * These are what the Worker sends to a client that asks for
 * `Accept: text/markdown` (shared/markdown.ts explains why and the rules).
 * Each file is the page's own React tree, rendered here once and converted:
 * the same words a visitor reads, without the markup around them.
 *
 * What a file holds: a small front-matter block (title, description, url),
 * the page's main content, and a list of the site's other pages, since the
 * header and footer navigation are left out.
 *
 * Content comes from the built-in data (src/data/initialData.ts and
 * shared/schools). Anything changed only in the admin dashboard reaches the
 * web page at once but these files only on the next deploy.
 *
 * Run after `vite build` (it is part of `npm run build`). Fails the build if
 * a page cannot render or comes out empty, so a broken page cannot ship as a
 * blank Markdown file.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import TurndownService from 'turndown';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

/** Route -> the page component that renders it (src/main.tsx's table). */
const PAGE_FILES = {
  '/': '/src/App.tsx',
  '/about': '/src/pages/AboutPage.tsx',
  '/for-teachers': '/src/pages/ForTeachersPage.tsx',
  '/shop': '/src/pages/ShopPage.tsx',
  '/door-decorating': '/src/pages/DoorDecoratingPage.tsx',
  '/donate': '/src/pages/DonatePage.tsx',
  '/schools': '/src/pages/SchoolsIndexPage.tsx',
  '/for-schools': '/src/pages/ForSchoolsPage.tsx',
  '/sponsors': '/src/pages/SponsorsPage.tsx',
  '/returnables': '/src/pages/ReturnablesPage.tsx',
  '/internship': '/src/pages/InternshipPage.tsx',
  '/privacy': '/src/pages/PrivacyPage.tsx',
  '/accessibility': '/src/pages/AccessibilityPage.tsx',
};

// noDiscovery: see scripts/prerender-home.mjs.
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const [{ MARKDOWN_ROUTES, markdownAssetPath, estimateTokens }, { metaForPath, canonicalUrl, ORIGIN }, { findSchool, schoolSlugFromPath }, { MotionConfig }] =
    await Promise.all([
      vite.ssrLoadModule('/shared/markdown.ts'),
      vite.ssrLoadModule('/shared/pageMeta.ts'),
      vite.ssrLoadModule('/shared/schools/index.ts'),
      vite.ssrLoadModule('motion/react'),
    ]);

  const absolute = (href) => {
    if (!href) return '';
    if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
    if (href.startsWith('#')) return '';
    return ORIGIN + (href.startsWith('/') ? href : `/${href}`);
  };

  const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
  // Drawings, scripts and anything the page itself hides from screen readers.
  turndown.remove(['script', 'style', 'svg', 'noscript', 'iframe', 'source', 'input', 'select', 'textarea', 'option']);
  turndown.addRule('aria-hidden', {
    filter: (node) => node.getAttribute?.('aria-hidden') === 'true',
    replacement: () => '',
  });
  // A form is something to do on the web page, not something to read.
  turndown.addRule('form', {
    filter: 'form',
    replacement: () => '\n\n*(This part of the page is a form. Open the page in a browser to fill it in.)*\n\n',
  });
  turndown.addRule('img', {
    filter: 'img',
    replacement: (_content, node) => {
      const alt = (node.getAttribute('alt') || '').trim();
      const src = node.getAttribute('src') || '';
      // Decorative images (empty alt) and inline placeholders say nothing.
      if (!alt || !src || src.startsWith('data:')) return '';
      return `![${alt.replace(/[[\]]/g, '')}](${absolute(src)})`;
    },
  });
  turndown.addRule('link', {
    filter: (node) => node.nodeName === 'A',
    replacement: (content, node) => {
      const text = content.replace(/\s+/g, ' ').trim();
      const href = absolute(node.getAttribute('href'));
      if (!text) return '';
      return href ? `[${text}](${href})` : text;
    },
  });

  const yaml = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  function toMarkdown(route, html) {
    const meta = metaForPath(route);
    const main = /<main[\s\S]*<\/main>/i.exec(html)?.[0] ?? html;
    let body = turndown.turndown(main);
    // A picture that appears twice (one copy per screen size) is said once.
    const seen = new Set();
    body = body.replace(/!\[[^\]]*\]\([^)]*\)/g, (img) => (seen.has(img) ? '' : (seen.add(img), img)));
    body = body.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    const others = MARKDOWN_ROUTES.filter((r) => r !== route)
      .map((r) => `- [${metaForPath(r).title}](${canonicalUrl(r)})`)
      .join('\n');

    return [
      '---',
      `title: ${yaml(meta.title)}`,
      `description: ${yaml(meta.description)}`,
      `url: ${canonicalUrl(route)}`,
      '---',
      '',
      body,
      '',
      '---',
      '',
      '## Other pages on this site',
      '',
      'Every page below is also available as Markdown: request it with the header `Accept: text/markdown`.',
      '',
      others,
      '',
    ].join('\n');
  }

  let total = 0;
  for (const route of MARKDOWN_ROUTES) {
    let element;
    const slug = schoolSlugFromPath(route);
    if (slug) {
      const { default: SchoolPage } = await vite.ssrLoadModule('/src/pages/SchoolPage.tsx');
      element = createElement(SchoolPage, { school: findSchool(slug) });
    } else {
      const file = PAGE_FILES[route];
      if (!file) throw new Error(`no page component listed for ${route}: add it to PAGE_FILES in scripts/build-markdown.mjs`);
      const { default: Page } = await vite.ssrLoadModule(file);
      element = createElement(Page);
    }
    const html = renderToString(createElement(MotionConfig, { reducedMotion: 'user' }, element));
    const md = toMarkdown(route, html);
    const bodyLength = md.split('\n---\n')[1]?.trim().length ?? 0;
    if (!/^# /m.test(md) || bodyLength < 300) throw new Error(`${route} rendered without a heading or nearly empty (${bodyLength} characters)`);

    const out = DIST + markdownAssetPath(route);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, md);
    total += estimateTokens(md);
  }
  console.log(`Wrote Markdown for ${MARKDOWN_ROUTES.length} pages to dist/md (about ${total.toLocaleString('en-US')} tokens in all).`);
} finally {
  await vite.close();
}
