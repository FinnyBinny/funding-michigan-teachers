/**
 * One-off image optimizer (run: `node scripts/optimize-images.mjs`).
 *
 * Generates the display-sized variants the site actually renders, so the
 * originals (up to 6MB / 5712px photos, a 448KB 1080px logo shown at 40px)
 * stop being what visitors download. Outputs are committed; this script only
 * needs re-running when a new source photo is added.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const dir = new URL('../public/images/', import.meta.url).pathname;
await mkdir(dir, { recursive: true });

const jobs = [
  // Header/footer logo: rendered at 40-48px, so 96px covers 2x screens.
  { src: 'fmt-logo-lc.png', out: 'fmt-logo-96.avif', w: 96, h: 96, avif: { quality: 60 } },
  { src: 'fmt-logo-lc.png', out: 'fmt-logo-96.png', w: 96, h: 96, png: { compressionLevel: 9 } },
  // Structured-data logo (Google wants a reasonably sized square).
  { src: 'fmt-logo-lc.png', out: 'fmt-logo-512.png', w: 512, h: 512, png: { compressionLevel: 9 } },
  // Homepage hero (desktop-only, rendered ~600px tall in a 5/12 column).
  { src: 'finn-and-mrs-freeman-opt.jpg', out: 'finn-and-mrs-freeman-1280.avif', w: 1280, avif: { quality: 55 } },
  { src: 'finn-and-mrs-freeman-opt.jpg', out: 'finn-and-mrs-freeman-1280.jpg', w: 1280, jpeg: { quality: 74, mozjpeg: true } },
  // Social share image (og:image says 1200×630 — make that true).
  { src: 'finn-and-mrs-freeman-opt.jpg', out: 'finn-and-mrs-freeman-og.jpg', w: 1200, h: 630, jpeg: { quality: 78, mozjpeg: true } },
  // Below-fold photos still shipping at print resolution.
  { src: 'may-chick-fil-a-cards.jpg', out: 'may-chick-fil-a-cards-opt.jpg', w: 900, jpeg: { quality: 74, mozjpeg: true } },
  { src: 'may-staff-meeting.jpg', out: 'may-staff-meeting-opt.jpg', w: 900, jpeg: { quality: 74, mozjpeg: true } },
];

for (const j of jobs) {
  let img = sharp(dir + j.src).resize({
    width: j.w,
    height: j.h,
    fit: j.h ? 'cover' : 'inside',
    position: 'attention',
    withoutEnlargement: true,
  });
  if (j.avif) img = img.avif(j.avif);
  if (j.jpeg) img = img.jpeg(j.jpeg);
  if (j.png) img = img.png(j.png);
  const info = await img.toFile(dir + j.out);
  console.log(`${j.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`);
}
