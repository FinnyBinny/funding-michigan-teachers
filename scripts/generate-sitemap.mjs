#!/usr/bin/env node
/**
 * Writes public/sitemap.xml from the route table and git history.
 *
 * It used to be edited by hand, so it drifted: every <lastmod> read
 * 2026-09-25 while five pages had changed since. Google uses <lastmod> only
 * when a site's dates have proven accurate, and a sitemap whose dates never
 * move — or all move together on every deploy — teaches it to ignore them.
 * Here each page's date is the most recent commit to the files that actually
 * render it.
 *
 * Refuses to run on a shallow clone. With one commit of history every page
 * would be stamped with that commit's date, which is the exact failure this
 * script exists to prevent; CI therefore checks out with fetch-depth: 0.
 *
 * Priority follows content type, as specified: the two pages every visitor
 * journey ends at are primary (1.0), the top-level sections in the site
 * navigation are hubs (0.8), and pages that sit inside a section are
 * individual pages (0.6). The privacy policy is outside that scheme and stays
 * at 0.3. Google ignores <priority> and <changefreq> entirely; Bing reads
 * them lightly. They are set honestly here, but <lastmod> is the field that
 * matters.
 *
 * Content that lives in the database — upcoming events, the sponsor list — is
 * not in git, so a page that changes only through the admin panel keeps its
 * code date until its source is next edited. That understates freshness
 * rather than inventing it.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ORIGIN = 'https://www.fundingmichiganteachers.org';
const OUT = 'public/sitemap.xml';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

if (git('rev-parse', '--is-shallow-repository') === 'true') {
  console.error(
    'generate-sitemap: this is a shallow clone, so every page would get the same\n' +
      'lastmod. Check out with full history (actions/checkout fetch-depth: 0).',
  );
  process.exit(1);
}

/** The latest commit date (YYYY-MM-DD) touching any of these paths. */
function lastModified(paths) {
  const date = git('log', '-1', '--format=%cs', '--', ...paths);
  if (!date) throw new Error(`no git history for: ${paths.join(', ')}`);
  return date;
}

const SCHOOL_DIR = 'shared/schools';
const schoolSlugs = readdirSync(SCHOOL_DIR)
  .filter((f) => f.endsWith('.ts') && !['types.ts', 'index.ts'].includes(f))
  .map((f) => ({
    file: join(SCHOOL_DIR, f),
    slug: /slug:\s*'([^']+)'/.exec(readFileSync(join(SCHOOL_DIR, f), 'utf8'))?.[1],
  }))
  .filter((s) => s.slug);

/**
 * Every indexable page, what kind of page it is, how often it realistically
 * changes, and the files whose edits change what a visitor sees on it.
 */
const PAGES = [
  // ── Primary: where every visitor journey ends ──────────────────────────
  {
    path: '/',
    type: 'primary',
    // Events, stories and donor wall rotate through the school year.
    changefreq: 'weekly',
    sources: ['src/App.tsx', 'src/components', 'src/data/initialData.ts', 'src/data/impactStats.ts'],
  },
  {
    path: '/donate',
    type: 'primary',
    changefreq: 'monthly',
    sources: ['src/pages/DonatePage.tsx', 'src/components/EmbeddedDonateCheckout.tsx'],
  },

  // ── Hubs: the top-level sections of the site navigation ────────────────
  { path: '/about', type: 'hub', changefreq: 'monthly', sources: ['src/pages/AboutPage.tsx'] },
  { path: '/for-teachers', type: 'hub', changefreq: 'monthly', sources: ['src/pages/ForTeachersPage.tsx'] },
  { path: '/for-schools', type: 'hub', changefreq: 'monthly', sources: ['src/pages/ForSchoolsPage.tsx'] },
  {
    path: '/sponsors',
    type: 'hub',
    changefreq: 'monthly',
    sources: ['src/pages/SponsorsPage.tsx', 'src/components/CorporateSponsors.tsx', 'src/data/initialData.ts'],
  },
  {
    path: '/schools',
    type: 'hub',
    changefreq: 'monthly',
    sources: ['src/pages/SchoolsIndexPage.tsx', SCHOOL_DIR],
  },

  // ── Individual pages inside a section ──────────────────────────────────
  ...schoolSlugs.map((s) => ({
    path: `/schools/${s.slug}`,
    type: 'page',
    // Events at the school are added through the year, several a month in
    // the busy stretches around October, February and May.
    changefreq: 'weekly',
    sources: ['src/pages/SchoolPage.tsx', s.file, 'src/data/initialData.ts'],
  })),
  { path: '/shop', type: 'page', changefreq: 'monthly', sources: ['src/pages/ShopPage.tsx', 'shared/merch.ts'] },
  { path: '/returnables', type: 'page', changefreq: 'monthly', sources: ['src/pages/ReturnablesPage.tsx'] },

  // ── Outside the scheme ─────────────────────────────────────────────────
  { path: '/privacy', type: 'legal', changefreq: 'yearly', sources: ['src/pages/PrivacyPage.tsx'] },
];

const PRIORITY = { primary: '1.0', hub: '0.8', page: '0.6', legal: '0.3' };

// Every route the app renders must be listed above or deliberately excluded,
// so a new page cannot go live without a sitemap entry.
const EXCLUDED = new Set(['/access', '/restricted']); // admin login and the block page
const routesSrc = readFileSync('shared/routes.ts', 'utf8');
const known = [...routesSrc.slice(routesSrc.indexOf('KNOWN_ROUTES')).matchAll(/'(\/[a-z0-9-]*)'/g)]
  .map((m) => m[1]);
const listed = new Set(PAGES.map((p) => p.path));
const unlisted = known.filter((r) => !listed.has(r) && !EXCLUDED.has(r));
if (unlisted.length) {
  console.error(`generate-sitemap: routes with no sitemap entry: ${unlisted.join(', ')}`);
  process.exit(1);
}

const urls = PAGES.map((p) => {
  const loc = ORIGIN + (p.path === '/' ? '/' : p.path);
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastModified(p.sources)}</lastmod>`,
    `    <changefreq>${p.changefreq}</changefreq>`,
    `    <priority>${PRIORITY[p.type]}</priority>`,
    '  </url>',
  ].join('\n');
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- Generated by scripts/generate-sitemap.mjs. Edit that, not this. -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');

writeFileSync(OUT, xml);
console.log(`Wrote ${OUT}: ${PAGES.length} URLs.`);
