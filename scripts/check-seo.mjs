/**
 * SEO guard — `node scripts/check-seo.mjs`
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
const files = [
  'src/App.tsx',
  ...readdirSync(join(root, 'src/pages')).map((f) => `src/pages/${f}`),
];

/** Pages that are meant to be short and are noindex anyway. */
const EXEMPT = /NotFoundPage|RestrictedPage|AccessPage/;

for (const rel of files) {
  if (EXEMPT.test(rel)) continue;
  const src = readFileSync(join(root, rel), 'utf8');
  if (!src.includes('setPageMeta(')) continue;

  // Only plain string literals are measured. A template literal is built at
  // runtime from a school's name, and its length is verified in the browser
  // pass instead of guessed at here.
  const title = /title:\s*'((?:[^'\\]|\\.)*)'/.exec(src);
  const desc = /description:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(src);

  if (title && title[1].length > MAX_TITLE) {
    problems.push(`${rel}: title is ${title[1].length} chars, truncates at ~60`);
  }
  if (desc) {
    const n = desc[1].replace(/\\'/g, "'").length;
    if (n > MAX_DESC) problems.push(`${rel}: description is ${n} chars, truncates at ~155`);
    if (n < MIN_DESC) problems.push(`${rel}: description is only ${n} chars — too thin to rank`);
  }
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
