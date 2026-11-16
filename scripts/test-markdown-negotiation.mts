/**
 * Content negotiation for "Markdown for agents" (shared/markdown.ts).
 * Run: npx tsx scripts/test-markdown-negotiation.mts
 */
import { prefersMarkdown, markdownAssetPath, markdownRouteFor, MARKDOWN_ROUTES } from '../shared/markdown';

let failed = 0;
function check(name: string, got: unknown, want: unknown) {
  if (got !== want) { failed++; console.error(`FAIL ${name}: got ${String(got)}, want ${String(want)}`); }
}

const cases: [string | null, boolean][] = [
  ['text/markdown', true],
  ['text/markdown, text/html;q=0.9', true],
  ['text/markdown;q=0.9, text/html;q=0.8', true],
  ['text/*', true],
  ['TEXT/Markdown', true],
  ['text/markdown, */*', true],
  ['text/markdown;charset=utf-8', true],
  // HTML stays the default for everything a browser or plain curl sends.
  [null, false],
  ['', false],
  ['*/*', false],
  ['text/html', false],
  ['text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8', false],
  ['text/html, text/markdown;q=0.5', false],
  ['text/markdown;q=0', false],
  ['text/markdown;q=0, text/html', false],
  ['application/json', false],
  ['text/plain', false],
  // A tie goes to whichever is listed first.
  ['text/markdown, text/html', true],
  ['text/html, text/markdown', false],
  // text/* fills in for the one not named.
  ['text/html, text/*;q=0.5', false],
  ['text/markdown;q=0.4, text/*', false],
  ['text/*, text/html;q=0.5', true],
  ['text/markdown;q=bogus', false],
];
for (const [accept, want] of cases) check(`prefersMarkdown(${JSON.stringify(accept)})`, prefersMarkdown(accept), want);

check('home asset', markdownAssetPath('/'), '/md/home.md');
check('page asset', markdownAssetPath('/about'), '/md/about.md');
check('school asset', markdownAssetPath('/schools/okemos'), '/md/schools/okemos.md');
check('route /', markdownRouteFor('/'), '/');
check('route trailing slash', markdownRouteFor('/about/'), '/about');
check('admin has none', markdownRouteFor('/access'), null);
check('restricted has none', markdownRouteFor('/restricted'), null);
check('box has none', markdownRouteFor('/box/a1b2c3d4e5f6'), null);
check('unknown has none', markdownRouteFor('/nope'), null);
check('school route', markdownRouteFor('/schools/okemos'), '/schools/okemos');
check('no private page listed', MARKDOWN_ROUTES.some((r) => r === '/access' || r === '/restricted' || r.startsWith('/box')), false);
check('has the public pages', MARKDOWN_ROUTES.length >= 15, true);

if (failed) { console.error(`${failed} markdown negotiation check(s) failed.`); process.exit(1); }
console.log('All markdown negotiation checks passed.');
