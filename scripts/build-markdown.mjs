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

// Sections that hide content behind a carousel, tabs or "show all" print
// everything while this is set (src/lib/renderAll.ts). Before any page loads.
globalThis.__FMT_MARKDOWN__ = true;

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

  const BLOCKS = 'h1,h2,h3,h4,h5,h6,p,div,ul,ol,figure,blockquote,section,article';
  const oneLine = (text) => text.replace(/\s+/g, ' ').trim();
  // Per page: pictures already written, so one shown at two screen sizes is said once.
  let seenImages = new Set();

  const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
  // Drawings, scripts, form fields, and buttons: a button is something to
  // press on the web page, and its label alone ("Share", "Vote", "Next") is
  // noise in text. Real destinations are links, which are kept.
  turndown.remove(['script', 'style', 'svg', 'noscript', 'iframe', 'source', 'input', 'select', 'textarea', 'option', 'button']);
  // Anything the page hides from screen readers, and the phone-only twin of
  // content that also has a desktop copy (Tailwind's `lg:hidden` and friends),
  // which would otherwise be printed twice.
  turndown.addRule('hidden', {
    filter: (node) => {
      if (node.getAttribute?.('aria-hidden') === 'true') return true;
      const classes = (node.getAttribute?.('class') || '').split(/\s+/);
      return classes.some((c) => /^(sm|md|lg|xl|2xl):hidden$/.test(c));
    },
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
      if (!alt || !src || src.startsWith('data:') || seenImages.has(src)) return '';
      seenImages.add(src);
      // Parentheses in a file name would end the Markdown link early.
      const url = absolute(src).replace(/\(/g, '%28').replace(/\)/g, '%29');
      return `![${alt.replace(/[[\]]/g, '')}](${url})`;
    },
  });
  // A heading is one line: a <br> inside it must not cut it in half.
  turndown.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content, node) => {
      const text = oneLine(content);
      return text ? `\n\n${'#'.repeat(Number(node.nodeName[1]))} ${text}\n\n` : '';
    },
  });
  turndown.addRule('link', {
    filter: (node) => node.nodeName === 'A',
    replacement: (content, node) => {
      const href = absolute(node.getAttribute('href'));
      // A whole card wrapped in one link: keep its heading and paragraphs as
      // they are, and put the link on a line of its own underneath.
      if (node.querySelector?.(BLOCKS)) {
        const label = oneLine(node.querySelector('h1,h2,h3,h4,h5,h6')?.textContent || '') || 'Open';
        return href ? `\n\n${content.trim()}\n\n[${label}](${href})\n\n` : `\n\n${content.trim()}\n\n`;
      }
      const text = oneLine(content);
      if (!text) return '';
      return href ? `[${text}](${href})` : text;
    },
  });
  // Tables as pipe tables, with the caption as a line above.
  turndown.addRule('table', {
    filter: 'table',
    replacement: (_content, node) => {
      const cell = (c) => oneLine(c.textContent || '').replace(/\|/g, '\\|');
      const rows = Array.from(node.getElementsByTagName('tr')).map((tr) => Array.from(tr.children).map(cell));
      if (!rows.length) return '';
      const caption = oneLine(node.getElementsByTagName('caption')[0]?.textContent || '');
      const line = (cells) => `| ${cells.join(' | ')} |`;
      const [head, ...body] = rows;
      return `\n\n${caption ? `${caption}:\n\n` : ''}${line(head)}\n${line(head.map(() => '---'))}\n${body.map(line).join('\n')}\n\n`;
    },
  });

  const yaml = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  function toMarkdown(route, html) {
    const meta = metaForPath(route);
    const main = /<main[\s\S]*<\/main>/i.exec(html)?.[0] ?? html;
    seenImages = new Set();
    // Side-by-side pieces with no space in the markup (a number and its
    // label, two buttons in a row) would otherwise run together: "220+Teachers".
    const spaced = main
      .replace(/(<\/(?:span|a|div|li|dt|dd|strong|time)>)(?=<(?!\/)|[A-Za-z0-9$])/g, '$1 ');
    let body = turndown.turndown(spaced);
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
