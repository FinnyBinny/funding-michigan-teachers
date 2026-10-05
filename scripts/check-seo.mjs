/**
 * SEO guard — `npx tsx scripts/check-seo.mjs` (tsx, to read the shared .ts tables)
 *
 * Every page sets its own title and description through setPageMeta, which
 * makes an over-long one easy to write and impossible to notice: a search
 * result truncates silently, and the part that gets cut is the end of the
 * sentence, which is usually where the ask is. This fails the build instead.
 *
 * Deliberately static — it reads the source rather than driving a browser, so
 * it needs no dependencies and runs in CI in milliseconds. The structural
 * checks a browser is needed for (canonical target, one h1 per page, alt
 * text) are covered by the Playwright pass run before shipping.
 *
 * It also checks that every route in shared/routes.ts is in the sitemap,
 * which is the failure that actually costs traffic: a page nobody submitted.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Google truncates a title near 60 characters and a description near 155. */
const MAX_TITLE = 62;
const MAX_DESC = 158;
const MIN_DESC = 70;

const root = new URL('..', import.meta.url).pathname;
const problems = [];

// ── Titles and descriptions ────────────────────────────────────────────────
// Every page's meta lives in shared/pageMeta.ts (the Worker writes it into
// the HTML too), so this measures the real values, school pages included,
// rather than guessing at string literals in the page files.
const { PAGE_META, metaForPath } = await import('../shared/pageMeta.ts');
const { SCHOOL_SLUGS, schoolPath } = await import('../shared/schools/index.ts');

const metas = [
  ...Object.entries(PAGE_META).map(([path, m]) => ({ path, ...m })),
  ...SCHOOL_SLUGS.map((slug) => metaForPath(schoolPath(slug))),
];
for (const m of metas) {
  if (m.noindex) continue;
  if (m.title.length > MAX_TITLE) problems.push(`${m.path}: title is ${m.title.length} chars, truncates at ~60`);
  if (m.description.length > MAX_DESC) problems.push(`${m.path}: description is ${m.description.length} chars, truncates at ~155`);
  if (m.description.length < MIN_DESC) problems.push(`${m.path}: description is only ${m.description.length} chars — too thin to rank`);
}

// A page that sets its meta by hand would drift from what the Worker sends.
for (const rel of readdirSync(join(root, 'src/pages')).map((f) => `src/pages/${f}`)) {
  const src = readFileSync(join(root, rel), 'utf8');
  if (/setPageMeta\(\{\s*title:/.test(src)) problems.push(`${rel}: sets its title inline — add it to shared/pageMeta.ts instead`);
}

// ── Every real route is in the sitemap ─────────────────────────────────────
const routesSrc = readFileSync(join(root, 'shared/routes.ts'), 'utf8');
const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');

const NOINDEX = new Set(['/access', '/restricted']);
const known = [...routesSrc.matchAll(/'(\/[a-z0-9-]*)'/g)].map((m) => m[1]);

for (const route of new Set(known)) {
  if (NOINDEX.has(route)) continue;
  const loc = route === '/' ? '.org/</loc>' : `.org${route}</loc>`;
  if (!sitemap.includes(loc)) problems.push(`sitemap is missing ${route}`);
}

// School pages are derived, so check each slug is listed too.
const schoolDir = join(root, 'shared/schools');
for (const f of readdirSync(schoolDir)) {
  if (f === 'index.ts' || f === 'types.ts') continue;
  const slug = /slug:\s*'([^']+)'/.exec(readFileSync(join(schoolDir, f), 'utf8'))?.[1];
  if (slug && !sitemap.includes(`.org/schools/${slug}</loc>`)) {
    problems.push(`sitemap is missing /schools/${slug}`);
  }
}

if (problems.length) {
  console.error(`\nSEO check failed — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('');
  process.exit(1);
}
console.log('SEO check passed: titles, descriptions and sitemap coverage.');
