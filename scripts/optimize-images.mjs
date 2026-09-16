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
import { existsSync } from 'node:fs';

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
  // Shop product photos, all normalized to 800x1000 so the three cards hold
  // one shape. The committed versions were made from originals that are not
  // in the repo — public/ ships wholesale, and 15MB of source photos would be
  // downloadable dead weight — so these jobs are `optional` and skip when the
  // source is absent. Drop an original back in under the -src name to redo one.
  //
  // The tee came off a phone: EXIF-rotated upright to 4284x5712, then cropped
  // to the subject, because a full-length shot leaves the artwork unreadable
  // at card size. `rotate: true` reapplies the orientation tag; `crop` is that
  // framing in upright pixels.
  {
    src: 'shop-tee-src.jpg', out: 'shop-tee.jpg', w: 800, optional: true, rotate: true,
    crop: { left: 1118, top: 1885, width: 1919, height: 2399 },
    jpeg: { quality: 78, mozjpeg: true },
  },
  // The mockups arrive well framed at 1086x1448 — trimmed 3:4 to the card's 4:5.
  {
    src: 'shop-sweatshirt-src.png', out: 'shop-sweatshirt.jpg', w: 800, optional: true,
    crop: { left: 0, top: 30, width: 1086, height: 1357 },
    jpeg: { quality: 78, mozjpeg: true },
  },
  {
    src: 'shop-hoodie-src.png', out: 'shop-hoodie.jpg', w: 800, optional: true,
    crop: { left: 0, top: 30, width: 1086, height: 1357 },
    jpeg: { quality: 78, mozjpeg: true },
  },
];

for (const j of jobs) {
  // Originals are not kept in the repo — public/ ships wholesale, so a source
  // photo committed here is dead weight every visitor could download. Outputs
  // are committed instead, and a job whose source is absent simply skips. That
  // makes the script re-runnable for the one image you are redoing rather than
  // failing on the first original that was cleaned up months ago.
  if (!existsSync(dir + j.src)) {
    console.log(`${j.out}  skipped (no ${j.src})`);
    continue;
  }
  let img = sharp(dir + j.src);
  // Orientation first, then crop — the crop is expressed in upright pixels.
  if (j.rotate) img = img.rotate();
  if (j.crop) img = sharp(await img.toBuffer()).extract(j.crop);
  img = img.resize({
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
