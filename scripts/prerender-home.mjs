/**
 * Puts the homepage's HTML into dist/index.html at build time.
 *
 * Why: the site is drawn by JavaScript, so a phone showed a blank page until
 * about 150 KB of code had downloaded and run. With the homepage's markup
 * already in the file, the browser paints it as soon as the stylesheet
 * arrives; the app then takes over in place (src/main.tsx renders over it).
 * Nothing about the design changes: this is the same React tree, rendered
 * once here instead of first in the visitor's browser.
 *
 * index.html is the shell for every route, so the Worker removes this
 * markup again for any page that is not "/" (worker/index.ts).
 *
 * Run after `vite build`. Fails the build if the homepage cannot render.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const DIST_HTML = new URL('../dist/index.html', import.meta.url);
const OPEN = '<div id="root">';

// No fake `window`: libraries (Motion among them) take its existence to mean
// a real browser. Components must not touch browser globals while rendering;
// if one starts to, this fails the build with the offending line.

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const [{ default: App }, { MotionConfig }] = await Promise.all([
    vite.ssrLoadModule('/src/App.tsx'),
    vite.ssrLoadModule('motion/react'),
  ]);
  const html = renderToString(createElement(MotionConfig, { reducedMotion: 'user' }, createElement(App)));
  if (!html.includes('<h1') || html.length < 5000) throw new Error('the homepage rendered empty');

  const page = readFileSync(DIST_HTML, 'utf8');
  if (!page.includes(`${OPEN}</div>`)) throw new Error(`dist/index.html has no empty ${OPEN}</div> to fill`);
  writeFileSync(DIST_HTML, page.replace(`${OPEN}</div>`, `${OPEN}${html}</div>`));
  console.log(`Prerendered the homepage: ${(html.length / 1024).toFixed(0)} KB of HTML.`);
} finally {
  await vite.close();
}
