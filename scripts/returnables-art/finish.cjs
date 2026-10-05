// The drawn finish for a rendered still life.
//   1. Kuwahara filter: flat, brush-like patches of colour that keep the
//      folds and edges crisp, like gouache.
//   2. Ink: a fine dark-brown line on the outline, where one object overlaps
//      another, and on strong creases (not on the plastic, where every
//      highlight would get circled).
//   3. Paper grain on the paint, and the shadow laid under it as a wash.
const sharp = require('sharp');

async function rawRGBA(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
}

function kuwahara(P, W, H, r) {
  // P: premultiplied float RGBA. Summed-area tables of r, g, b, a and lum^2.
  const S = new Float64Array((W + 1) * (H + 1) * 5);
  const ix = (x, y) => (y * (W + 1) + x) * 5;
  for (let y = 1; y <= H; y++) {
    for (let x = 1; x <= W; x++) {
      const p = ((y - 1) * W + (x - 1)) * 4;
      const lum = 0.299 * P[p] + 0.587 * P[p + 1] + 0.114 * P[p + 2];
      const vals = [P[p], P[p + 1], P[p + 2], P[p + 3], lum * lum];
      const a = ix(x, y), l = ix(x - 1, y), u = ix(x, y - 1), ul = ix(x - 1, y - 1);
      for (let c = 0; c < 5; c++) S[a + c] = vals[c] + S[l + c] + S[u + c] - S[ul + c];
    }
  }
  const out = new Float32Array(W * H * 4);
  const q = [0, 0, 0, 0, 0];
  const rect = (x0, y0, x1, y1) => {
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W - 1, x1); y1 = Math.min(H - 1, y1);
    const n = (x1 - x0 + 1) * (y1 - y0 + 1);
    const A = ix(x1 + 1, y1 + 1), B = ix(x0, y1 + 1), C = ix(x1 + 1, y0), D = ix(x0, y0);
    for (let c = 0; c < 5; c++) q[c] = (S[A + c] - S[B + c] - S[C + c] + S[D + c]) / n;
    const ml = 0.299 * q[0] + 0.587 * q[1] + 0.114 * q[2];
    return q[4] - ml * ml;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const a0 = P[i * 4 + 3];
      if (a0 === 0) continue;
      let best = Infinity, br = 0, bg = 0, bb = 0, ba = 0;
      for (const [x0, y0, x1, y1] of [[x - r, y - r, x, y], [x, y - r, x + r, y], [x - r, y, x, y + r], [x, y, x + r, y + r]]) {
        const v = rect(x0, y0, x1, y1);
        if (v < best) { best = v; br = q[0]; bg = q[1]; bb = q[2]; ba = q[3]; }
      }
      const k = ba > 0 ? a0 / ba : 0; // keep the source silhouette
      out[i * 4] = br * k; out[i * 4 + 1] = bg * k; out[i * 4 + 2] = bb * k; out[i * 4 + 3] = a0;
    }
  }
  return out;
}

async function finish({ objects, ids, shadow, out, radius = 6, ink = 0.6, creaseInk = 0.5, outW, scale }) {
  const o = await rawRGBA(objects);
  const { W, H } = o;
  const N = W * H;
  const P = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const a = o.data[i * 4 + 3] / 255;
    P[i * 4] = (o.data[i * 4] / 255) * a; P[i * 4 + 1] = (o.data[i * 4 + 1] / 255) * a; P[i * 4 + 2] = (o.data[i * 4 + 2] / 255) * a; P[i * 4 + 3] = a;
  }
  const K = kuwahara(P, W, H, radius);
  const idImg = ids ? await rawRGBA(ids) : null;
  const sh = shadow ? await rawRGBA(shadow) : null;

  const A = new Float32Array(N), L = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = K[i * 4 + 3];
    A[i] = idImg ? idImg.data[i * 4 + 3] / 255 : a;
    L[i] = a > 0 ? (0.299 * K[i * 4] + 0.587 * K[i * 4 + 1] + 0.114 * K[i * 4 + 2]) / a : 0;
  }
  const at = (F, x, y) => F[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  const sobel = (F, x, y) => {
    const gx = -at(F, x - 1, y - 1) - 2 * at(F, x - 1, y) - at(F, x - 1, y + 1) + at(F, x + 1, y - 1) + 2 * at(F, x + 1, y) + at(F, x + 1, y + 1);
    const gy = -at(F, x - 1, y - 1) - 2 * at(F, x, y - 1) - at(F, x + 1, y - 1) + at(F, x - 1, y + 1) + 2 * at(F, x, y + 1) + at(F, x + 1, y + 1);
    return Math.hypot(gx, gy);
  };
  const idDiff = (i, j) => {
    if (!idImg) return 0;
    const d = idImg.data;
    if (d[i * 4 + 3] < 128 || d[j * 4 + 3] < 128) return 0;
    return Math.abs(d[i * 4] - d[j * 4]) + Math.abs(d[i * 4 + 1] - d[j * 4 + 1]) + Math.abs(d[i * 4 + 2] - d[j * 4 + 2]) > 90 ? 1 : 0;
  };
  const INK = [0.18, 0.12, 0.08];
  const res = Buffer.alloc(N * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const a = K[i * 4 + 3];
      const eSil = Math.min(1, sobel(A, x, y) * 0.85);
      const eId = x + 1 < W && y + 1 < H ? Math.max(idDiff(i, i + 1), idDiff(i, i + W)) : 0;
      const opaque = Math.min(1, Math.max(0, (a - 0.8) / 0.15));      // cans and labels, not plastic
      const eCr = Math.min(1, Math.max(0, sobel(L, x, y) - 0.42) * 1.2) * opaque * creaseInk;
      const e = Math.min(1, Math.max(eSil, eId * 0.9, eCr)) * ink;
      let r = a > 0 ? K[i * 4] / a : 0, g = a > 0 ? K[i * 4 + 1] / a : 0, b = a > 0 ? K[i * 4 + 2] / a : 0;
      r = r * (1 - e) + INK[0] * e; g = g * (1 - e) + INK[1] * e; b = b * (1 - e) + INK[2] * e;
      const grain = 1 + ((((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) + 1) % 1 - 0.5) * 0.06;
      r = Math.min(1, r * grain); g = Math.min(1, g * grain); b = Math.min(1, b * grain);
      let aOut = Math.min(1, a + eSil * ink * 0.6);
      // shadow wash underneath
      if (sh) {
        // fade the shadow out before the frame edge, so it never ends in a straight line
        const fx = Math.min(1, Math.min(x, W - 1 - x) / (0.08 * W)), fy = Math.min(1, Math.min(y, H - 1 - y) / (0.08 * H));
        const fall = fx * fx * (3 - 2 * fx) * fy * fy * (3 - 2 * fy);
        const sa = (sh.data[i * 4 + 3] / 255) * 0.85 * fall;
        const SH = [0.36, 0.27, 0.2];
        const ao = aOut + sa * (1 - aOut);
        if (ao > 0) {
          r = (r * aOut + SH[0] * sa * (1 - aOut)) / ao; g = (g * aOut + SH[1] * sa * (1 - aOut)) / ao; b = (b * aOut + SH[2] * sa * (1 - aOut)) / ao;
        }
        aOut = ao;
      }
      res[i * 4] = Math.round(r * 255); res[i * 4 + 1] = Math.round(g * 255); res[i * 4 + 2] = Math.round(b * 255); res[i * 4 + 3] = Math.round(aOut * 255);
    }
  }
  let img = sharp(res, { raw: { width: W, height: H, channels: 4 } }).png();
  const buf = await img.toBuffer();
  const trimmed = await sharp(buf).trim({ threshold: 2 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const w = scale ? Math.round(meta.width * scale) : outW ?? Math.round(meta.width / 1.5);
  const info = await sharp(trimmed).resize({ width: w, kernel: 'lanczos3' }).png().toFile(out);
  return info;
}
module.exports = { finish };
