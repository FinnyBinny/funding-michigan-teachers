#!/usr/bin/env node
/**
 * Every school color, checked against WCAG AA.
 *
 * shared/schools/types.ts promises that "every value in this repo is checked"
 * and that `secondary` is a fill color only. Nothing enforced either, so a
 * fourth school with a pale primary would ship a hero nobody can read, and the
 * failure would look like a design choice rather than a bug.
 *
 * The school pages use each color in exactly these places, so those are what
 * this checks:
 *   primary    — the hero field, under white display type and white body text
 *   primary    — as text and rules on the cream page
 *   secondary  — the pennant fill, under dark chalkboard type
 *
 * Dependency-free on purpose: it runs in CI next to check-seo.mjs, and reads
 * the hexes out of the school files rather than keeping a second copy here.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SCHOOL_DIR = 'shared/schools';
const CHALKBOARD = '#1a1c1d';
const PAPER = '#fcfaf5';
const WHITE = '#ffffff';
/** The hero's quietest text: white at 70% over the primary. */
const WHITE_70_ON_DARK = '#b3b3b3';

function toRgb(h) {
  let s = h.replace('#', '').trim();
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pulls `name`, `primary` and `secondary` out of a school file. */
function readSchool(file) {
  const src = readFileSync(join(SCHOOL_DIR, file), 'utf8');
  const name = src.match(/\bname:\s*'([^']+)'/)?.[1];
  const colors = src.slice(src.indexOf('colors:'));
  const primary = colors.match(/primary:\s*'(#[0-9a-fA-F]{3,8})'/)?.[1];
  const secondary = colors.match(/secondary:\s*'(#[0-9a-fA-F]{3,8})'/)?.[1];
  return name && primary && secondary ? { file, name, primary, secondary } : null;
}

const files = readdirSync(SCHOOL_DIR).filter(
  (f) => f.endsWith('.ts') && !['types.ts', 'index.ts'].includes(f),
);
const schools = files.map(readSchool).filter(Boolean);

if (!schools.length) {
  console.error('check-school-contrast: found no school files to check.');
  process.exit(1);
}

let failures = 0;

for (const s of schools) {
  const checks = [
    // 3:1 is the AA floor for large text; the school name is display-sized.
    ['hero — white school name on primary', ratio(WHITE, s.primary), 3],
    ['hero — white/70 supporting text on primary', ratio(WHITE_70_ON_DARK, s.primary), 4.5],
    ['page — primary as body text on paper', ratio(s.primary, PAPER), 4.5],
    ['page — primary rules and edges on paper', ratio(s.primary, PAPER), 3],
    ['pennant — chalkboard text on secondary', ratio(CHALKBOARD, s.secondary), 4.5],
  ];

  for (const [what, got, need] of checks) {
    if (got < need) {
      failures++;
      console.error(
        `FAIL  ${s.name} (${s.file})\n      ${what}\n      ${got.toFixed(2)}:1, needs ${need}:1`,
      );
    }
  }
}

if (failures) {
  console.error(
    `\n${failures} contrast failure(s) across ${schools.length} school(s).\n` +
      'Darken the primary, or pick a secondary that carries dark text.\n' +
      'See the contrast notes in shared/schools/types.ts.',
  );
  process.exit(1);
}

console.log(
  `School contrast passed: ${schools.length} schools, ${schools.length * 5} checks.`,
);
