// Draw each returnable in items.json on its own and write it to
// public/images/returnables/ as AVIF and WebP.
//
// Every item is rendered with the same orthographic camera at 4 px/mm, given
// the painted-and-inked finish (finish.cjs), trimmed to the drawing, and
// delivered at 2 px/mm. One scale for all, so their sizes on the page stay
// true to each other. See README.md for how to run it.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { finish } = require('./finish.cjs');

const PORT = process.env.PORT || 8990;
const PUBLIC = path.join(__dirname, '../../public/images/returnables');
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'returnables-art-'));
const ITEMS = JSON.parse(fs.readFileSync(path.join(__dirname, 'items.json'), 'utf8'));
const only = process.argv.slice(2);
const PX = 4, FRAME = { w: 150, h: 280 };

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e));
  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  for (const it of ITEMS) {
    if (only.length && !only.includes(it.name)) continue;
    const sc = { ortho: true, pxPerMm: PX, w: FRAME.w * PX, h: FRAME.h * PX, elev: 11, target: [0, FRAME.h / 2 - 18, 0], items: [it] };
    const files = {};
    for (const pass of ['objects', 'ids']) {
      const url = await page.evaluate(([s, p]) => window.renderScene(s, p), [sc, pass]);
      files[pass] = path.join(WORK, `${it.name}.${pass}.png`);
      fs.writeFileSync(files[pass], Buffer.from(url.split(',')[1], 'base64'));
    }
    const png = path.join(WORK, `${it.name}.png`);
    const info = await finish({ objects: files.objects, ids: files.ids, shadow: null, out: png, radius: 5, ink: 0.6, scale: 0.5 });
    await sharp(png).webp({ quality: 86, alphaQuality: 100, effort: 6, smartSubsample: true }).toFile(path.join(PUBLIC, `${it.name}.webp`));
    await sharp(png).avif({ quality: 64, effort: 6 }).toFile(path.join(PUBLIC, `${it.name}.avif`));
    // Copy these into ITEMS in src/components/ReturnableCans.tsx.
    console.log(`${it.name}: w ${info.width}, h ${info.height}`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
