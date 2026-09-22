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
    'Haslett was the first building outside Okemos to let us through the door. Staff meetings here have been fed by local restaurants more than once, and the room has never once been short.',

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
      body: 'Every January, after the classroom budget has run out and there is still half a school year to go, we restock the rooms that ask. Pencils, markers, tissues, paper — the things that quietly disappear by February.',
      ctaLabel: 'Donate to the Haslett refill',
      ctaHref: '/donate?fund=Haslett%20Mid-Year%20Refill',
    },
    {
      title: 'Tell us what your room ran out of',
      body: 'If you teach or work at Haslett, this is the whole process. No application, no committee, no grant cycle.',
      ctaLabel: 'Request supplies for your room',
      // TODO: replace with the dedicated teacher supply survey URL once it
      // exists. Points at the live supply request form in the meantime.
      ctaHref: '/for-teachers',
    },
  ],

  sponsors: [
    { name: "Ozzy's Kabob", note: '60 individually wrapped meals for a September staff meeting' },
    { name: 'Jamba Juice', note: 'Back-to-school smoothies for the staff' },
    { name: "Auntie Anne's", note: 'Donated to a Haslett staff appreciation event' },
  ],
};
