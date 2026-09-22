/**
 * The shape of a partner school.
 *
 * One file per school under this folder, one template renders all of them.
 * Adding a fourth school is a new file here plus a single import line in
 * index.ts — no page code, no route code, no sitemap edit.
 *
 * Deliberately dependency-free: the Cloudflare Worker imports the registry
 * (via shared/routes.ts) so it can answer /schools/not-a-real-school with a
 * real 404 instead of a 200 that happens to render a 404 page.
 *
 * ── Photo policy, and it is not negotiable ──────────────────────────────────
 * No student faces and no student names without confirmed permission on file.
 * This applies to every `photos` entry and every name in `pastHighlights`,
 * `club.advisor` and `sponsors`. Staff are people too: a teacher's name goes
 * up only when that teacher has said yes. When in doubt the photo does not
 * ship — a page with three photos is better than a page with a complaint.
 */

/** A real photograph from an FMT event. Never stock photography. */
export interface SchoolPhoto {
  /** Path under public/, e.g. "/images/okemos-staff-meeting.jpg". */
  src: string;
  /** Required. Describes what is happening, not "image of school". */
  alt: string;
  width: number;
  height: number;
  /** Optional caption shown under the photo. */
  caption?: string;
}

/** Something FMT already did at this school. */
export interface SchoolHighlight {
  /** When, in human words: "September 2025", "Last winter". */
  when: string;
  title: string;
  body: string;
}

/** Current fundraising or a live ask for this school. */
export interface SchoolInitiative {
  title: string;
  body: string;
  /** Says exactly what happens. Never "Learn more" or "Submit". */
  ctaLabel: string;
  ctaHref: string;
}

/** A local business or family that supported THIS school specifically. */
export interface SchoolSponsor {
  name: string;
  /** What they gave, in plain words. Optional. */
  note?: string;
}

/** An FMT student club housed at this school. */
export interface SchoolClub {
  name: string;
  body: string;
  /** Left undefined until the advisor has agreed to be named publicly. */
  advisor?: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * The school's own colors, which are the accent — never the frame.
 *
 * `primary` must clear WCAG AA both as text on the cream background and
 * under white button text; every value in this repo is checked. `secondary`
 * is a fill, border and band color only — gold, carolina blue and silver all
 * fail as text on cream and must never be used for type. Dark chalkboard text
 * on top of `secondary` does pass, which is how the secondary earns a band.
 */
export interface SchoolColors {
  primary: string;
  secondary: string;
  /** Optional third color, used sparingly for rules and dividers. */
  tertiary?: string;
}

/**
 * How the header band is drawn. Haslett and East Lansing have nearly
 * identical navies — 1.05:1 against each other — so color alone cannot tell
 * the two pages apart. The band treatment, the mascot and the secondary
 * color do that work instead.
 */
export type BandStyle = 'rule' | 'outline' | 'block';

export interface School {
  /** URL segment: /schools/<slug>. Lowercase, hyphenated, never changes. */
  slug: string;
  /** Full official name, used as the page heading. */
  name: string;
  /** Short form for buttons and running text: "Okemos". */
  shortName: string;
  /** Plural team name: "Wolves". */
  mascot: string;
  district: string;
  /** Year FMT started working here. Placeholder until confirmed. */
  partnerSince: string;
  /** One or two plain sentences. This is the page's voice, not a tagline. */
  intro: string;
  colors: SchoolColors;
  band: BandStyle;
  /** Staff supported here. Undefined hides the line rather than guessing. */
  staffCount?: string;
  /** Opens the page. A real photo beats a stat block. */
  hero?: SchoolPhoto;
  photos: SchoolPhoto[];
  pastHighlights: SchoolHighlight[];
  initiatives: SchoolInitiative[];
  sponsors: SchoolSponsor[];
  club?: SchoolClub;
}
