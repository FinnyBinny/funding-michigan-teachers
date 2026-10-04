import type { School } from './types';

/**
 * Haslett High School.
 *
 * PHOTO AND NAME POLICY: no student faces, no student names, and no staff
 * names without confirmed permission on file.
 */
export const haslett: School = {
  slug: 'haslett',
  name: 'Haslett High School',
  shortName: 'Haslett',
  mascot: 'Vikings',
  district: 'Haslett Public Schools',
  partnerSince: '2026',

  intro:
    "Haslett High School was the first school outside Okemos to partner with us. Local restaurants have donated food for Haslett staff meetings, including 60 meals from Ozzy's Kabob and 60 smoothies from Jamba Juice.",

  colors: {
    // Official values from the Haslett Public Schools style guide.
    primary: '#002858',   // Haslett Blue — 13.94:1 on cream, 14.54:1 under white
    secondary: '#FFC04A', // Haslett Yellow — FILL ONLY, 1.56:1 on cream as text
    tertiary: '#D0D4E3',  // Haslett Gray — FILL ONLY
  },
  band: 'rule',

  // TODO: confirm staff count with the Haslett front office.
  staffCount: undefined,

  // From the signed School Partnership Program menu.
  partnership: {
    signed: 'August 2026',
    programs: ['End-of-Year Staff Breakfast', 'Staff Meeting Catering'],
  },

  // TODO: add the hero photo from a Haslett staff meeting.
  hero: undefined,

  photos: [],

  // See okemos.ts — history is tagged on the events themselves.
  pastHighlights: [],

  initiatives: [
    {
      title: 'Mid-Year Refill',
      body: 'Classroom supply budgets usually run out by winter. In January we restock the classrooms that ask, and every refill is delivered the week of January 12th.',
      ctaLabel: 'Donate to the Haslett refill',
      ctaHref: '/donate?fund=Haslett%20Mid-Year%20Refill',
      secondaryLabel: 'Teach here? Tell us what your room needs',
      secondaryHref: '/for-teachers?kind=mid-year-refill&school=Haslett%20High%20School',
    },
    {
      title: 'Request classroom supplies',
      body: 'Teachers and staff at Haslett can ask for supplies with one short form.',
      ctaLabel: 'Request supplies for your room',
      // This IS the teacher supply survey — it asks for the room, quantities,
      // a link, timing and permission to name the teacher when we ask a
      // business. It was never going to be a separate page: the same teacher
      // fills it in October and again in January.
      ctaHref: '/for-teachers?school=Haslett%20High%20School',
    },
  ],

  sponsors: [
    { name: "Ozzy's Kabob", note: '60 individually wrapped meals for a September staff meeting' },
    { name: 'Jamba Juice', note: 'Back-to-school smoothies for the staff' },
    { name: "Auntie Anne's", note: 'Donated to a Haslett staff appreciation event' },
  ],
};
