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
  // TODO: confirm the year FMT started at East Lansing.
  partnerSince: '____',

  // CONFIRM with Finn: this intro is written from the smoothie delivery and
  // should be replaced or approved before it goes live.
  intro:
    'We showed up at East Lansing on one of the first hot days of the school year with cold smoothies for the staff meeting. It is the newest of the three buildings we work in, and the one with the most still to come.',

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

  // TODO: add the hero photo from the smoothie delivery.
  hero: undefined,

  photos: [],

  // CONFIRM every East Lansing event with Finn before publishing. The
  // smoothie delivery is referenced in the intro above; it is not listed here
  // as a confirmed highlight until he signs off on the details.
  pastHighlights: [],

  initiatives: [
    {
      title: 'Mid-Year Refill',
      body: 'Every January, after the classroom budget has run out and there is still half a school year to go, we restock the rooms that ask.',
      ctaLabel: 'Donate to the East Lansing refill',
      ctaHref: '/donate?fund=East%20Lansing%20Mid-Year%20Refill',
    },
    {
      title: 'Tell us what your room ran out of',
      body: 'If you teach or work at East Lansing, this is the whole process. No application, no committee, no grant cycle.',
      ctaLabel: 'Request supplies for your room',
      // TODO: replace with the dedicated teacher supply survey URL once it
      // exists. Points at the live supply request form in the meantime.
      ctaHref: '/for-teachers',
    },
  ],

  // No sponsors have supported East Lansing specifically yet. The section
  // hides itself rather than printing an empty "Thank you to".
  sponsors: [],
};
