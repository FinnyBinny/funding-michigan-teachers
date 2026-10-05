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
    'Okemos High School is where Funding Michigan Teachers started. Finn began bringing donuts and coffee to his teachers in elementary school, and in ninth grade it became a registered nonprofit. Most of what we run at other schools, we try here first.',

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
  // Already published on the For Schools page. No people in frame: a hallway
  // decorated for the Post Office of Love, which only ran at Okemos before
  // the other two schools signed on in August 2026.
  hero: {
    src: '/images/IMG_6113-opt.jpg',
    alt: "A school hallway decorated for Valentine's Day, with a balloon arch, paper hearts and a Funding Michigan Teachers Post Office sign",
    width: 900,
    height: 1200,
    caption: "The Post Office of Love, set up for Valentine's Day.",
  },

  // The May 2026 OHS staff meeting, already published on the For Schools
  // page. No faces; the certificate names are this year's Teacher of the
  // Month honorees, which that program publishes by design.
  photos: [
    {
      src: '/images/may-staff-meeting-opt.jpg',
      alt: 'A whiteboard reading Happy Teacher Appreciation Week, signed Funding Michigan Teachers, with three Teacher of the Month certificates',
      width: 900,
      height: 675,
      caption: 'Teacher Appreciation Week at the May 2026 staff meeting.',
    },
  ],

  // "What we've done here" reads PAST_EVENTS tagged with this school, so an
  // event is written once and shows up in the site history and on this page.
  // Anything here is extra, for a school-specific note with no dated event.
  pastHighlights: [],

  initiatives: [
    {
      title: 'Mid-Year Refill',
      body: 'Classroom supply budgets usually run out by winter. In January we restock the classrooms that ask, and every refill is delivered the week of January 12th.',
      ctaLabel: 'Donate to the Okemos refill',
      ctaHref: '/donate?designation=school:okemos',
      secondaryLabel: 'Teach here? Tell us what your room needs',
      secondaryHref: '/for-teachers?kind=mid-year-refill&school=Okemos%20High%20School',
    },
    {
      title: 'Request classroom supplies',
      body: 'Teachers and staff at Okemos can ask for supplies with one short form.',
      ctaLabel: 'Request supplies for your room',
      // This IS the teacher supply survey — it asks for the room, quantities,
      // a link, timing and permission to name the teacher when we ask a
      // business. It was never going to be a separate page: the same teacher
      // fills it in October and again in January.
      ctaHref: '/for-teachers?school=Okemos%20High%20School',
    },
  ],

  // Food sponsors vary meeting to meeting — a business backs a particular
  // staff meeting rather than the school for a year. Add each one as it
  // happens; a sponsor should be able to find their name on the building
  // they helped.
  sponsors: [
    { name: "Ozzy's Kabob", note: '70 individually wrapped meals for a September staff meeting' },
    { name: 'Home Depot', note: "The Newman Rd store equipped Miss Abbott's botany garden with a dumping garden cart and a 5-tier shelving unit" },
  ],

  club: {
    name: 'Wolves for Teachers',
    body: "Wolves for Teachers is FMT's student club at Okemos. Members plan appreciation events, write letters for the Post Office of Love, and deliver supply requests.",
    // CONFIRM: faculty advisor's name. Never publish a teacher's name until
    // they have said yes to appearing on a public website.
    advisor: undefined,
    ctaLabel: 'Join the club',
    ctaHref: 'mailto:hello@fundingmichiganteachers.org?subject=Wolves%20for%20Teachers',
  },
};
