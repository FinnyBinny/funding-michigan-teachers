/**
 * The single source of truth for every impact number on this site.
 *
 * These figures used to be typed by hand in six different files, and they
 * drifted: the same card could read "1,000+ staff members" in its heading and
 * "Educators reached" in the stat directly beneath it, and the teacher count
 * appeared as both 200+ and 220+. Import from here instead of retyping — a
 * number that exists once cannot contradict itself.
 *
 * ── The distinction that keeps getting lost ──────────────────────────────
 * TEACHERS and STAFF are different counts of different people, and neither
 * word is a synonym for the other:
 *
 *   teachers — classroom teachers at our three partner high schools
 *   staff    — every employee at those same schools: teachers plus the
 *              secretaries, custodians, paraprofessionals, food service and
 *              everyone else who keeps a building running
 *
 * And REACH is different from PARTNERSHIP:
 *
 *   partnerSchools — ongoing relationships (Okemos, Haslett, East Lansing)
 *   tawStaff       — people handed a meal card during one week in May, across
 *                    nine buildings. A delivery, not a relationship. Never
 *                    describe these nine as "schools we support".
 *
 * Every number is rounded DOWN. False precision is worse than modesty, and
 * these have to survive a sponsor asking where they came from.
 */

export const STAT = {
  /** Classroom teachers at the three partner high schools (~222 actual). */
  teachers: { value: '220+', label: 'Teachers Reached' },

  /** All staff at those same three schools (~350 actual). Not teachers. */
  staff: { value: '350+', label: 'Staff Reached' },

  /** Ongoing partnerships. Not the nine buildings reached in May. */
  partnerSchools: { value: '3', label: 'Partner Schools' },

  /**
   * Donations plus in-kind fair market value for the 2025–26 school year:
   * roughly $6,500 documented in-kind plus at least $2,000 the founder paid
   * personally. "In support" rather than "raised" — most people hear "raised"
   * as cash in a bank account, and most of this was donated goods.
   */
  support: { value: '$8,500+', label: 'In Support, 2025–26' },

  /** Staff handed a meal card during Teacher Appreciation Week. */
  tawStaff: { value: '1,000+', label: 'Staff Reached in One Week' },

  /** Buildings that received those cards, across three districts. */
  tawBuildings: { value: '9', label: 'Buildings, 3 Districts' },
} as const;

/** Fair market value of the Chick-fil-A meal cards (500 breakfast, 500 lunch). */
export const TAW_CARD_VALUE = '$5,000';

/** Per-school headcounts behind `teachers` and `staff`, for the impact map. */
export const PARTNER_SCHOOL_COUNTS = {
  'Okemos High School': '~75–80 teachers · ~120 staff',
  'Haslett High School': '~50–60 teachers · ~100 staff',
  'East Lansing High School': '~90 teachers · 120–140 staff',
} as const;
