import type { School } from './types';

/**
 * East Lansing High School.
 *
 * PHOTO AND NAME POLICY: no student faces, no student names, and no staff
 * names without confirmed permission on file.
 *
 * Almost everything here is a placeholder. That is deliberate and visible —
 * empty sections hide themselves, so this page ships thin and honest rather
 * than padded with things FMT has not actually done here yet.
 */
export const eastLansing: School = {
  slug: 'east-lansing',
  name: 'East Lansing High School',
  shortName: 'East Lansing',
  mascot: 'Trojans',
  district: 'East Lansing Public Schools',
  partnerSince: '2026',

  // Every claim here is in src/data/initialData.ts (the Jamba Juice entry).
  intro:
    'East Lansing High School is our newest partner school. Jamba Juice donated 80 smoothies for the first staff meeting of the 2026–27 school year.',

  colors: {
    // TODO: verify against East Lansing Public Schools style guide. No
    // official hex values published; these approximate the navy and white on
    // the school's athletics materials.
    //
    // Deliberately a brighter, bluer navy than Haslett's #002858. The two
    // schools' navies are 1.05:1 against each other, which is to say
    // identical — so this page is told apart by the white band rule, the
    // Trojan mascot and the outline treatment, not by its color.
    primary: '#1D3C6E',   // navy — verified above 4.5:1 both on cream and under white
    secondary: '#FFFFFF', // white — FILL ONLY
    tertiary: '#C9CFD6',  // silver rule
  },
  band: 'outline',

  // TODO: confirm staff count with the East Lansing front office.
  staffCount: undefined,

  // From the signed School Partnership Program menu. East Lansing chose four
  // of the seven; the three it did not choose are not listed, because listing
  // them would read as a gap rather than a decision.
  partnership: {
    signed: 'August 2026',
    programs: [
      'Teacher of the Month',
      'Teacher Lounge Decorating',
      'Post Office of Love',
      'Staff Meeting Catering',
    ],
  },

  // TODO: add the hero photo from the smoothie delivery.
  hero: undefined,

  photos: [],

  // See okemos.ts — history is tagged on the events themselves. The smoothie
  // delivery is in PAST_EVENTS with this school's location and appears here.
  // CONFIRM any further East Lansing events with Finn before adding them.
  pastHighlights: [],

  initiatives: [
    {
      title: 'Mid-Year Refill',
      body: 'Classroom supply budgets usually run out by winter. In January we restock the classrooms that ask, and every refill is delivered the week of January 12th.',
      ctaLabel: 'Donate to the East Lansing refill',
      ctaHref: '/donate?designation=school:east-lansing',
      secondaryLabel: 'Teach here? Tell us what your room needs',
      secondaryHref: '/for-teachers?kind=mid-year-refill&school=East%20Lansing%20High%20School',
    },
    {
      title: 'Request classroom supplies',
      body: 'Teachers and staff at East Lansing can ask for supplies with one short form.',
      ctaLabel: 'Request supplies for your room',
      // This IS the teacher supply survey — it asks for the room, quantities,
      // a link, timing and permission to name the teacher when we ask a
      // business. It was never going to be a separate page: the same teacher
      // fills it in October and again in January.
      ctaHref: '/for-teachers?school=East%20Lansing%20High%20School',
    },
  ],

  sponsors: [
    { name: 'Jamba Juice', note: 'Smoothies for the first staff meeting of the year' },
    { name: "Auntie Anne's", note: 'Donated to an East Lansing staff appreciation event' },
  ],
};
