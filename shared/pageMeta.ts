/**
 * Every page's title and description, in one place.
 *
 * Read by the pages (setPageMeta) AND by the Worker, which writes them into
 * the HTML it sends. Before this, the server sent the homepage's head for
 * every URL: link previews, the AI crawlers robots.txt welcomes, and Google's
 * first pass all saw /donate titled and canonicalised as the homepage, and
 * JavaScript then changed the canonical, which Google advises against.
 *
 * scripts/check-seo.mjs measures these lengths in CI.
 *
 * Dependency-free apart from the school registry, so the Worker can bundle it.
 */
import { findSchool, schoolSlugFromPath } from './schools';

export interface RouteMeta {
  title: string;
  description: string;
  /** Pages search engines must not index (admin, restricted, 404). */
  noindex?: boolean;
}

export const SITE_NAME = 'Funding Michigan Teachers';
export const ORIGIN = 'https://www.fundingmichiganteachers.org';

export const PAGE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Funding Michigan Teachers | Student-Led 501(c)(3)',
    description:
      'A student-led 501(c)(3) funding classroom supplies, staff meals and teacher appreciation at Michigan high schools — so no teacher pays out of pocket.',
  },
  '/about': {
    title: 'About Us | Funding Michigan Teachers',
    description:
      "How a ninth grader's donut cart became a 501(c)(3). Funding Michigan Teachers is student-run, based in Okemos, and works in three Michigan high schools.",
  },
  '/donate': {
    title: 'Donate to Michigan Teachers | Funding Michigan Teachers',
    description:
      'Give to Michigan teachers directly. At least 80¢ of every dollar reaches a classroom — supplies, staff meals and thanks at three partner high schools.',
  },
  '/for-schools': {
    title: 'Bring FMT to Your School | Funding Michigan Teachers',
    description:
      'Bring Funding Michigan Teachers to your building: staff meals, Teacher of the Month, door decorating and classroom supplies, at no cost to the school.',
  },
  '/for-teachers': {
    title: 'Request Classroom Supplies | Funding Michigan Teachers',
    description:
      'Teach at Okemos, East Lansing or Haslett? Tell us what your classroom needs, from tissues to a whole project. No application, no committee, no grant cycle.',
  },
  '/internship': {
    title: 'Youth Internship Program | Funding Michigan Teachers',
    description:
      'A 2026–27 internship for students: storytelling, operations and school outreach for a nonprofit that supports Michigan teachers. About 5 hours a week.',
  },
  '/privacy': {
    title: 'Privacy Policy | Funding Michigan Teachers',
    description:
      'What Funding Michigan Teachers collects, why, who processes it, and how to have it removed. We do not sell data and we do not share donor details.',
  },
  '/accessibility': {
    title: 'Accessibility | Funding Michigan Teachers',
    description:
      'Our commitment to an accessible website: the standard we test against (WCAG 2.2 AA), what still falls short, and how to report a barrier to us.',
  },
  '/returnables': {
    title: 'Donate Your Returnables | Funding Michigan Teachers',
    description:
      'Free pickup of your Michigan returnables in the Greater Lansing area. We redeem the 10¢ deposits and turn them into support for local teachers.',
  },
  '/schools': {
    title: 'Partner Schools | Funding Michigan Teachers',
    description:
      'The Michigan high schools Funding Michigan Teachers works in — Okemos, East Lansing and Haslett. Each has its own page, events and local sponsors.',
  },
  '/shop': {
    title: 'Shop — FMT Merch | Funding Michigan Teachers',
    description:
      "FMT t-shirts, crewnecks and hoodies, printed locally and hand-pressed by our students. What's left after materials buys classroom supplies.",
  },
  '/sponsors': {
    title: 'Sponsor Local Teachers | Funding Michigan Teachers',
    description:
      'Partner with a student-led 501(c)(3) that feeds and thanks teachers in three mid-Michigan high schools. Local businesses back specific staff meetings.',
  },
  '/access': {
    title: 'Admin · Funding Michigan Teachers',
    description: 'Internal dashboard.',
    noindex: true,
  },
  '/restricted': {
    title: 'Access restricted · Funding Michigan Teachers',
    description: 'Access to this site is restricted from your network.',
    noindex: true,
  },
};

export const NOT_FOUND_META: RouteMeta = {
  title: 'Page not found · Funding Michigan Teachers',
  description: 'This page went missing.',
  noindex: true,
};

/** The meta for any path: a listed page, a partner school, or the 404. */
export function metaForPath(pathname: string): RouteMeta & { path: string } {
  const path = (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname) || '/';
  const listed = PAGE_META[path];
  if (listed) return { ...listed, path };
  const slug = schoolSlugFromPath(path);
  const school = slug ? findSchool(slug) : undefined;
  if (school) {
    return {
      path,
      title: `${school.name} | ${SITE_NAME}`,
      description: `What FMT does at ${school.name}: staff meals, teacher thanks and classroom supplies, with help from local businesses.`,
    };
  }
  return { ...NOT_FOUND_META, path };
}

export function canonicalUrl(path: string): string {
  return path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
}
