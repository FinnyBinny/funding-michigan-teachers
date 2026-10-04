#!/usr/bin/env node
/**
 * Every school color, checked against WCAG AA where the school page uses it.
 *
 * A school page is built from the homepage's parts with the school's primary
 * standing in for FMT's red, so a fourth school with a pale primary would ship
 * unreadable buttons and labels — and it would look like a design choice
 * rather than a bug. This fails the deploy instead.
 *
 * The pairs below are the ones src/pages/SchoolPage.tsx actually renders. When
 * the page starts using a color somewhere new, add the pair here. Translucent
 * text (`text-white/60`) is composited onto its real background before it is
 * measured, rather than approximated: white at 60% over navy is not the same
 * color as white at 60% over maroon.
 *
 * Dependency-free on purpose — it runs in CI next to check-seo.mjs, and reads
 * the hexes out of the school files rather than keeping a second copy here.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SCHOOL_DIR = 'shared/schools';
const CHALKBOARD = '#1a1c1d';
const PAPER = '#fcfaf5';
const WHITE = '#ffffff';

const rgb = (h) => {
  let s = h.replace('#', '').trim();
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** `fg` at `alpha` laid over an opaque `bg`, the way the browser paints it. */
const over = (fg, alpha, bg) => {
  const f = rgb(fg);
  const b = rgb(bg);
  return hex(f.map((v, i) => v * alpha + b[i] * (1 - alpha)));
};

/** CSS color-mix(in srgb, a p%, b). */
const mix = (a, p, b) => over(a, p, b);

const luminance = (h) => {
  const [r, g, b] = rgb(h).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Pulls `name` and `primary` out of a school file. */
function readSchool(file) {
  const src = readFileSync(join(SCHOOL_DIR, file), 'utf8');
  const name = src.match(/\bname:\s*'([^']+)'/)?.[1];
  const colors = src.slice(src.indexOf('colors:'));
  const primary = colors.match(/primary:\s*'(#[0-9a-fA-F]{3,8})'/)?.[1];
  return name && primary ? { file, name, primary } : null;
}

const AA = 4.5; // normal text
const AA_LARGE = 3; // large text and meaningful graphics (icons)

/** [where on the page, foreground, background, minimum]. */
function pairs(p) {
  const eyebrowBg = mix(p, 0.1, PAPER); // pill: primary at 10% over cream
  const iconTile = mix(p, 0.1, WHITE); // feature-card icon tile
  return [
    ['h1 accent and stat numbers on cream', p, PAPER, AA],
    ['date labels and links on a white card', p, WHITE, AA],
    ['section eyebrow pill text on its tint', p, eyebrowBg, AA],
    ['feature-card icon on its tint', p, iconTile, AA_LARGE],
    ['white button text on the primary', WHITE, p, AA],
    ['school card caption eyebrow (white/65)', over(WHITE, 0.65, p), p, AA],
    ['club card body text (white/75)', over(WHITE, 0.75, p), p, AA],
    ['club advisor line (white/60)', over(WHITE, 0.6, p), p, AA],
  ];
}

/** The chalkboard cards don't depend on the school, but they ship on its page. */
const SHARED = [
  ['"Coming up" event body (white/60 on chalkboard)', over(WHITE, 0.6, CHALKBOARD), CHALKBOARD, AA],
  ['closing card body (white/65 on chalkboard)', over(WHITE, 0.65, CHALKBOARD), CHALKBOARD, AA],
];

const files = readdirSync(SCHOOL_DIR).filter(
  (f) => f.endsWith('.ts') && !['types.ts', 'index.ts'].includes(f),
);
const schools = files.map(readSchool).filter(Boolean);

if (!schools.length) {
  console.error('check-school-contrast: found no school files to check.');
  process.exit(1);
}

let failures = 0;
let checks = 0;

const run = (label, list) => {
  for (const [what, fg, bg, need] of list) {
    checks++;
    const got = ratio(fg, bg);
    if (got < need) {
      failures++;
      console.error(`FAIL  ${label}\n      ${what}\n      ${got.toFixed(2)}:1, needs ${need}:1`);
    }
  }
};

for (const s of schools) run(`${s.name} (${s.file})`, pairs(s.primary));
run('every school page', SHARED);

if (failures) {
  console.error(
    `\n${failures} contrast failure(s).\n` +
      "Darken the school's primary until it clears 4.5:1 under white text.\n" +
      'See the contrast notes in shared/schools/types.ts.',
  );
  process.exit(1);
}

console.log(`School contrast passed: ${schools.length} schools, ${checks} checks.`);
