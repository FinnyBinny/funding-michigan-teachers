import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Business names are stored with a parenthetical — an address or the owners —
 * so two locations of one chain stay distinct in the admin panel:
 * "Chick-Fil-A (2075 W Grand River Ave. Okemos, MI)". Displayed whole, that
 * reads as a form field. Split it into the name and the detail.
 */
export function splitBusinessName(full: string): { name: string; detail: string | null } {
  const m = /^(.*?)\s*\((.+)\)\s*$/.exec(full);
  return m ? { name: m[1], detail: m[2] } : { name: full, detail: null };
}
