/**
 * The theme, defined once.
 *
 * Everything about color that changes between themes lives here, and nowhere
 * else. scripts/build-theme.mjs turns it into src/theme/theme.css, and
 * scripts/check-theme-contrast.mjs reads it directly to prove every pairing
 * in PAIRS clears WCAG AA in every theme. Because both read the same file,
 * the CSS that ships and the contrast that is checked cannot disagree.
 *
 * ── Three layers ────────────────────────────────────────────────────────────
 *   PALETTE   raw brand colors. Never referenced by components.
 *   THEMES    for each theme, what each semantic role resolves to.
 *   PAIRS     every foreground/background combination the site may use,
 *             with the contrast it must clear.
 *
 * ── Semantic names ──────────────────────────────────────────────────────────
 * Tokens are named for what they are for, never for what they look like.
 * "chalkboard" is a color; "fg" is the role of primary text. In a dark theme
 * primary text is light, and a token called chalkboard would then be lying.
 *
 *   canvas / canvas-alt   page background, and the alternating section band
 *   surface               cards and panels that sit on the canvas
 *   surface-sunken        inputs and wells set into a surface
 *   fg / fg-muted / fg-subtle   text, from primary to captions
 *   line / line-strong    hairline dividers; form-control borders
 *   accent / fg-on-accent the primary action and the text on it
 *   fg-accent             the accent used as text
 *   link                  link text
 *   inverse / fg-on-inverse   a band in the opposite scheme (the dark card
 *                         in light mode, a light card in dark mode)
 *   focus                 the keyboard focus ring
 *   focus-on-inverse      the focus ring on an inverse band, where the
 *                         ordinary ring would vanish into the background
 *   fg-danger / fg-success    status text
 *
 * ── Adding a theme ──────────────────────────────────────────────────────────
 * Add an entry to THEMES with the same keys. The build emits a
 * `.theme-<name>` class for it and the contrast guard checks every pair in it
 * automatically. Nothing else changes, which is the whole point of the
 * semantic layer.
 */

export const PALETTE = {
  cream50: '#fcfaf5',
  cream100: '#f5f0e6',
  cream200: '#ece5d6',
  white: '#ffffff',
  ink900: '#1a1c1d',
  ink700: '#46494e',
  ink600: '#5b5f65',
  ink500: '#6f737a',
  apple600: '#c0392b',
  apple500: '#cc4434',
  apple700: '#a8301f',
  apple300: '#f28b80',
  ruler700: '#1f5673',
  ruler300: '#8cc6e4',
  green700: '#2e6b45',
  green300: '#86d3a4',
  red700: '#b3261e',
  red300: '#f4938a',
  // Dark-theme neutrals: warm, from the same ink family as the chalkboard,
  // rather than a cold #000-based grey that would fight the cream accents.
  night950: '#121314',
  night900: '#18191b',
  night850: '#1f2123',
  night800: '#26292b',
  night700: '#34383b',
  night500: '#6c7177',
  mist100: '#f1ede4',
  mist300: '#cfcac0',
  mist400: '#aaa59c',
};

const P = PALETTE;

/**
 * `scheme` sets CSS color-scheme, so native form controls and scrollbars
 * match. Every theme must define every token in the light theme.
 */
export const THEMES = {
  light: {
    scheme: 'light',
    tokens: {
      canvas: P.cream50,
      'canvas-alt': P.cream100,
      surface: P.white,
      'surface-sunken': P.cream100,
      fg: P.ink900,
      'fg-muted': P.ink700,
      'fg-subtle': P.ink600,
      line: P.cream200,
      'line-strong': P.ink500,
      accent: P.apple600,
      'fg-on-accent': P.white,
      'fg-accent': P.apple700,
      link: P.ruler700,
      inverse: P.ink900,
      'fg-on-inverse': P.cream50,
      focus: P.ruler700,
      'focus-on-inverse': P.ruler300,
      'fg-danger': P.red700,
      'fg-success': P.green700,
    },
  },
  dark: {
    scheme: 'dark',
    tokens: {
      canvas: P.night950,
      'canvas-alt': P.night900,
      surface: P.night850,
      'surface-sunken': P.night900,
      fg: P.mist100,
      'fg-muted': P.mist300,
      'fg-subtle': P.mist400,
      line: P.night700,
      'line-strong': P.night500,
      // One step brighter than the light theme's red: the brand red sat at
      // 2.97:1 against a dark card. White on this still clears 4.5:1.
      accent: P.apple500,
      'fg-on-accent': P.white,
      'fg-accent': P.apple300,
      link: P.ruler300,
      inverse: P.mist100,
      'fg-on-inverse': P.ink900,
      focus: P.ruler300,
      'focus-on-inverse': P.ruler700,
      'fg-danger': P.red300,
      'fg-success': P.green300,
    },
  },
};

/** The theme a page gets with no class on <html> and no JavaScript. */
export const DEFAULT_THEME = 'light';

const TEXT = 4.5; // WCAG AA, normal text
const UI = 3; // WCAG AA, UI component boundaries and focus indicators

/**
 * [foreground, background, minimum ratio, what it is].
 * Every pair here is checked in every theme.
 */
export const PAIRS = [
  ...['canvas', 'canvas-alt', 'surface', 'surface-sunken'].flatMap((bg) => [
    ['fg', bg, TEXT, 'primary text'],
    ['fg-muted', bg, TEXT, 'secondary text'],
    ['fg-subtle', bg, TEXT, 'captions and meta text'],
    ['link', bg, TEXT, 'links'],
    ['fg-accent', bg, TEXT, 'accent-colored text'],
    ['fg-danger', bg, TEXT, 'error text'],
    ['fg-success', bg, TEXT, 'success text'],
    ['focus', bg, UI, 'focus ring'],
    ['line-strong', bg, UI, 'form control border'],
  ]),
  ['fg-on-accent', 'accent', TEXT, 'text on the primary button'],
  ['accent', 'canvas', UI, 'primary button against the page'],
  ['accent', 'surface', UI, 'primary button against a card'],
  ['fg-on-inverse', 'inverse', TEXT, 'text on an inverse band'],
  ['focus-on-inverse', 'inverse', UI, 'focus ring on an inverse band'],
];
