import type { School } from './types';

/**
 * Okemos High School — FMT's home building.
 *
 * PHOTO AND NAME POLICY: no student faces, no student names, and no staff
 * names without confirmed permission on file. The club advisor below is
 * deliberately left unnamed until that teacher has agreed in writing.
 */
export const okemos: School = {
  slug: 'okemos',
  name: 'Okemos High School',
  shortName: 'Okemos',
  mascot: 'Wolves',
  district: 'Okemos Public Schools',
  // TODO: confirm the year FMT started at Okemos.
  partnerSince: '____',

  intro:
    'Okemos is where FMT was built. Finn started buying donuts and coffee for his teachers back in elementary school, wheeling a cart down the hallways so nobody got missed; by ninth grade that had become this. Okemos High School is our home building, and most of what we try anywhere else gets tried here first.',

  colors: {
    // TODO: verify against Okemos Public Schools style guide. No official hex
    // values published; these are close approximations of the maroon and
    // Carolina blue on the school's athletics materials.
    primary: '#7B2233',   // maroon — 9.50:1 on cream, 9.91:1 under white text
    secondary: '#7BAFD4', // Carolina blue — FILL ONLY, 2.26:1 on cream as text
  },
  band: 'block',

  // TODO: confirm staff count with the Okemos front office.
  staffCount: undefined,

  // Okemos has no signed partnership menu: it is the home building, where
  // everything runs. TODO: if OHS signs a menu like the other two, add it
  // here and the section appears by itself.
  partnership: undefined,

  // TODO: add the hero photo. Until one exists the page opens on the band,
  // which is a working state — it does not render an empty frame.
  hero: undefined,

  photos: [],

  // "What we've done here" reads PAST_EVENTS tagged with this school, so an
  // event is written once and shows up in the site history and on this page.
  // Anything here is extra, for a school-specific note with no dated event.
  pastHighlights: [],

  initiatives: [
    {
      title: 'Mid-Year Refill',
      body: 'Every January, after the classroom budget has run out and there is still half a school year to go, we restock the rooms that ask. Pencils, markers, tissues, paper — the things that quietly disappear by February.',
      ctaLabel: 'Donate to the Okemos refill',
      ctaHref: '/donate?fund=Okemos%20Mid-Year%20Refill',
    },
    {
      title: 'Tell us what your room ran out of',
      body: 'If you teach or work at Okemos, this is the whole process. No application, no committee, no grant cycle.',
      ctaLabel: 'Request supplies for your room',
      // TODO: replace with the dedicated teacher supply survey URL once it
      // exists. Points at the live supply request form in the meantime, which
      // works today rather than being a placeholder link that goes nowhere.
      ctaHref: '/for-teachers',
    },
  ],

  // Food sponsors vary meeting to meeting — a business backs a particular
  // staff meeting rather than the school for a year. Add each one as it
  // happens; a sponsor should be able to find their name on the building
  // they helped.
  sponsors: [
    { name: "Ozzy's Kabob", note: '70 individually wrapped meals for a September staff meeting' },
  ],

  club: {
    name: 'Wolves for Teachers',
    body: 'FMT now has an official student club at Okemos. Members plan the appreciation events here, write for the Post Office of Love, and carry supplies to the rooms that asked for them.',
    // CONFIRM: faculty advisor's name. Never publish a teacher's name until
    // they have said yes to appearing on a public website.
    advisor: undefined,
    ctaLabel: 'Join the club',
    ctaHref: 'mailto:hello@fundingmichiganteachers.org?subject=Wolves%20for%20Teachers',
  },
};
