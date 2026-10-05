/**
 * Fails the build on an image that would ship sideways.
 *
 * Phone photos store their pixels as the sensor saw them plus an EXIF note
 * saying which way is up. Browsers obey the note on a JPEG, so the photo
 * looks fine on the site, but anything made from those pixels without
 * turning them first is sideways. Two partner AVIFs and the social share
 * image shipped that way, and nobody saw it, because Chrome showed the
 * upright JPEG or the upright AVIF depending on the page.
 *
 * Checks every image in public/images:
 *   - no file may still carry a rotate-me note (orientation other than 1);
 *     bake it in with sharp(...).rotate() (scripts/optimize-images.mjs does);
 *   - an AVIF twin must have the same shape as its JPEG (X.avif vs X-opt.jpg).
 *
 * Run: node scripts/check-images.mjs
 */
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';

const dir = new URL('../public/images/', import.meta.url).pathname;
const files = (await readdir(dir, { recursive: true })).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
const meta = new Map();
for (const f of files) meta.set(f, await sharp(dir + f).metadata());

const problems = [];
for (const [f, m] of meta) {
  if (m.orientation && m.orientation !== 1) {
    problems.push(`${f}: EXIF orientation ${m.orientation} — its pixels are not upright`);
  }
}
for (const [f, m] of meta) {
  if (!f.endsWith('.avif')) continue;
  const stem = f.replace(/\.avif$/, '');
  const twin = [`${stem}-opt.jpg`, `${stem}.jpg`].find((t) => meta.has(t));
  if (!twin) continue;
  const t = meta.get(twin);
  const a = m.width / m.height;
  const b = t.width / t.height;
  if (Math.abs(a - b) > 0.02) {
    problems.push(`${f} is ${m.width}x${m.height} but ${twin} is ${t.width}x${t.height} — one of them is rotated`);
  }
}

if (problems.length) {
  console.error('Images that would ship sideways:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`Checked ${files.length} images: all upright, every AVIF matches its JPEG.`);
