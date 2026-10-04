import { THEMES } from '../theme/tokens.mjs';

/**
 * Switching theme from the page.
 *
 * The class on <html> is the whole switch — see scripts/build-theme.mjs. The
 * cookie exists only so the Worker can put the same class on the next page
 * before it is sent, which is how a saved choice survives a reload without
 * any JavaScript running on the initial load.
 *
 * 'auto' follows the operating system through a media query; the other
 * choices are the themes defined in src/theme/tokens.mjs, so a theme added
 * there is selectable here with no change to this file.
 */
export type ThemeChoice = keyof typeof THEMES | 'auto';

export const THEME_CHOICES = [...Object.keys(THEMES), 'auto'] as ThemeChoice[];

const COOKIE = 'fmt-theme';
const PREFIX = 'theme-';

/** The theme class currently on <html>, or null for the default. */
export function currentTheme(): ThemeChoice | null {
  const cls = [...document.documentElement.classList].find((c) => c.startsWith(PREFIX));
  const name = cls?.slice(PREFIX.length);
  return name && (THEME_CHOICES as string[]).includes(name) ? (name as ThemeChoice) : null;
}

function applyClass(choice: ThemeChoice | null): void {
  const root = document.documentElement;
  for (const c of [...root.classList]) if (c.startsWith(PREFIX)) root.classList.remove(c);
  if (choice) root.classList.add(PREFIX + choice);
}

/** Switch now, and remember it for the next page load. */
export function setTheme(choice: ThemeChoice): void {
  if (!THEME_CHOICES.includes(choice)) return;
  applyClass(choice);
  document.cookie = `${COOKIE}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
}

/** Forget the saved choice and go back to the default theme. */
export function clearTheme(): void {
  applyClass(null);
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}
