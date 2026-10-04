#!/usr/bin/env node
/**
 * Proves every foreground/background pair in src/theme/tokens.mjs clears
 * WCAG AA in every theme, and that every theme defines every token.
 *
 * Reads the same file scripts/build-theme.mjs generates the CSS from, so a
 * passing check means the shipped CSS passes. Adding a theme to THEMES adds
 * it here automatically. Dependency-free; runs in CI.
 */
import { PAIRS, THEMES, DEFAULT_THEME } from '../src/theme/tokens.mjs';

const rgb = (h) => {
  let s = h.replace('#', '');
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
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

const reference = Object.keys(THEMES[DEFAULT_THEME].tokens).sort();
let failures = 0;
let checks = 0;
const verbose = process.argv.includes('--verbose');

for (const [name, theme] of Object.entries(THEMES)) {
  // Completeness: a theme missing a token would silently inherit the light
  // value through the cascade, which is how dark modes end up half-dark.
  const keys = Object.keys(theme.tokens).sort();
  const missing = reference.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !reference.includes(k));
  if (missing.length || extra.length) {
    failures++;
    console.error(`FAIL  theme "${name}" token set differs from "${DEFAULT_THEME}"`);
    if (missing.length) console.error(`      missing: ${missing.join(', ')}`);
    if (extra.length) console.error(`      extra:   ${extra.join(', ')}`);
  }

  for (const [fg, bg, need, what] of PAIRS) {
    const a = theme.tokens[fg];
    const b = theme.tokens[bg];
    if (!a || !b) continue; // reported above
    checks++;
    const got = ratio(a, b);
    const ok = got >= need;
    if (!ok) {
      failures++;
      console.error(
        `FAIL  ${name.padEnd(6)} ${fg} on ${bg}  (${what})\n` +
          `      ${a} on ${b} = ${got.toFixed(2)}:1, needs ${need}:1`,
      );
    } else if (verbose) {
      console.log(`ok    ${name.padEnd(6)} ${`${fg} on ${bg}`.padEnd(34)} ${got.toFixed(2)}:1`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} theme contrast failure(s) in src/theme/tokens.mjs.`);
  process.exit(1);
}
console.log(`Theme contrast passed: ${Object.keys(THEMES).length} themes, ${checks} pairs.`);
