import { useEffect, useMemo, type CSSProperties } from 'react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/seo';
import { useEvents } from '../hooks/useLocalData';
import { PAST_EVENTS } from '../data/initialData';
import { schoolPath, type School } from '../../shared/schools';

/**
 * One template, every partner school.
 *
 * The school's colors ride in as CSS custom properties on the wrapper, so
 * nothing here knows a hex value and a fourth school needs no code. FMT stays
 * the frame — cream background, FMT header and footer, FMT text colors — and
 * the school is the accent: the band, its name, its rules, its buttons.
 *
 * Every section below renders only when it has something in it. An empty
 * "Photos" heading or a "coming soon" block reads worse than a shorter page,
 * and these pages are read by the administrators of the school they describe.
 */

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Heading style shared by every section, so the page has one rhythm. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight mb-6">
      {children}
    </h2>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

export default function SchoolPage({ school }: { school: School }) {
  const events = useEvents();

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: `${school.name} | Funding Michigan Teachers`,
      description: `What Funding Michigan Teachers does at ${school.name} — staff appreciation, classroom supplies after the budget runs out, and the local businesses who helped. ${school.intro}`.slice(0, 300),
      path: schoolPath(school.slug),
    });
  }, [school]);

  /**
   * Happening now, read from the live events feed rather than copied into the
   * school file. Events already carry the school's name in `location`, so an
   * event added once in the admin panel shows up here and on the homepage
   * calendar without being written twice and drifting apart.
   */
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events
      .filter((e) => !e.date || String(e.date).slice(0, 10) >= today)
      .filter((e) => e.location === school.name || e.location === 'All partner schools')
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(0, 4);
  }, [events, school.name]);

  /**
   * What we've done here, from the same history the homepage renders.
   *
   * A finished event used to live in exactly one place: it aged out of the
   * upcoming calendar and, having no location, could never appear on the page
   * of the school it happened in. Tagging the event is now the whole job —
   * it shows up in both, written once, and cannot drift.
   *
   * A school file may still add its own entries for something with no dated
   * event behind it; those come first.
   */
  const history = useMemo(() => {
    const tagged = PAST_EVENTS
      .filter((e) => e.location === school.name)
      .map((e) => ({ when: e.month, title: e.title, body: e.description }));
    return [...school.pastHighlights, ...tagged];
  }, [school]);

  // The school's palette, handed to CSS. Nothing below reads a hex directly.
  const palette = {
    '--school-primary': school.colors.primary,
    '--school-secondary': school.colors.secondary,
    '--school-tertiary': school.colors.tertiary ?? school.colors.secondary,
  } as CSSProperties;

  const fmtDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="min-h-[100dvh] bg-paper flex flex-col" style={palette}>
      {/* The band runs under the fixed header, so the header starts white. */}
      <SiteHeader onDark />

      <main className="flex-1">
        {/* The band. The one bold thing on the page. */}
        <header className={`school-band school-band--${school.band} pt-28 sm:pt-32 pb-10 px-4 sm:px-6`}>
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => navigate('/schools')}
              className="school-link text-sm text-white/75 hover:text-white underline underline-offset-4 mb-6 inline-block"
            >
              All partner schools
            </button>
            <h1 className="font-serif font-bold text-[clamp(2rem,6vw,3.25rem)] leading-[1.05] tracking-tight text-balance">
              {school.name}
            </h1>
            <p className="mt-3 text-lg text-white/85 font-light">
              Home of the {school.mascot}
            </p>
            <p className="mt-1 text-sm text-white/70">
              Partner school since {school.partnerSince}
              {school.staffCount ? ` — ${school.staffCount} staff supported` : ''}
            </p>
          </div>
        </header>

        {/* Opens on the most characteristic thing about this school: a real
            photo from an FMT event here. No photo yet means the intro carries
            it, rather than a placeholder frame. */}
        {school.hero && (
          <div className="px-4 sm:px-6 pt-8">
            <figure className="max-w-3xl mx-auto">
              <img
                src={school.hero.src}
                alt={school.hero.alt}
                width={school.hero.width}
                height={school.hero.height}
                className="w-full rounded-2xl"
                loading="eager"
                decoding="async"
              />
              {school.hero.caption && (
                <figcaption className="mt-2 text-sm text-chalkboard/60 font-light">
                  {school.hero.caption}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        <Section>
          <p className="text-xl leading-relaxed text-chalkboard/80 font-light text-pretty">
            {school.intro}
          </p>
        </Section>

        {upcoming.length > 0 && (
          <Section>
            <SectionHeading>Happening now</SectionHeading>
            <ul className="space-y-5">
              {upcoming.map((e) => (
                <li
                  key={e.id}
                  className="pl-4 border-l-[3px]"
                  style={{ borderColor: 'var(--school-primary)' }}
                >
                  <p className="font-bold text-base leading-snug">{e.title}</p>
                  {e.date && (
                    <p className="text-sm text-chalkboard/55 mt-0.5">{fmtDate(String(e.date))}</p>
                  )}
                  <p className="text-chalkboard/75 font-light leading-relaxed mt-1.5">
                    {e.description}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {history.length > 0 && (
          <Section>
            <SectionHeading>What we've done here</SectionHeading>
            <ul className="space-y-7">
              {history.map((h) => (
                <li key={h.title}>
                  <p className="text-sm text-chalkboard/55">{h.when}</p>
                  <p className="font-serif font-bold text-lg mt-0.5">{h.title}</p>
                  <p className="text-chalkboard/75 font-light leading-relaxed mt-1.5">{h.body}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {school.photos.length > 0 && (
          <Section>
            <SectionHeading>Photos</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              {school.photos.map((p) => (
                <figure key={p.src}>
                  <img
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded-xl"
                  />
                  {p.caption && (
                    <figcaption className="mt-1.5 text-xs text-chalkboard/60">{p.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Section>
        )}

        {school.initiatives.length > 0 && (
          <Section>
            <SectionHeading>Local initiatives</SectionHeading>
            <div className="space-y-8">
              {school.initiatives.map((i) => (
                <div key={i.title}>
                  <p className="font-serif font-bold text-lg">{i.title}</p>
                  <p className="text-chalkboard/75 font-light leading-relaxed mt-1.5 mb-4">{i.body}</p>
                  <a
                    href={i.ctaHref}
                    onClick={(ev) => {
                      if (i.ctaHref.startsWith('/')) {
                        ev.preventDefault();
                        navigate(i.ctaHref);
                      }
                    }}
                    className="school-btn inline-block text-white font-bold px-6 py-3 rounded-xl"
                    style={{ background: 'var(--school-primary)' }}
                  >
                    {i.ctaLabel}
                  </a>
                </div>
              ))}
            </div>
          </Section>
        )}

        {school.club && (
          <Section>
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'color-mix(in srgb, var(--school-secondary) 35%, #fff)' }}
            >
              <SectionHeading>{school.club.name}</SectionHeading>
              <p className="text-chalkboard/80 font-light leading-relaxed">{school.club.body}</p>
              {school.club.advisor && (
                <p className="text-sm text-chalkboard/65 mt-3">
                  Faculty advisor: {school.club.advisor}
                </p>
              )}
              <a
                href={school.club.ctaHref}
                className="school-btn inline-block mt-5 text-white font-bold px-6 py-3 rounded-xl"
                style={{ background: 'var(--school-primary)' }}
              >
                {school.club.ctaLabel}
              </a>
            </div>
          </Section>
        )}

        {school.sponsors.length > 0 && (
          <Section>
            <SectionHeading>Thank you to</SectionHeading>
            <p className="text-chalkboard/70 font-light leading-relaxed mb-5">
              These neighbors paid for something that happened inside {school.shortName}.
            </p>
            <ul className="space-y-3">
              {school.sponsors.map((s) => (
                <li
                  key={s.name}
                  className="pl-4 border-l-[3px]"
                  style={{ borderColor: 'var(--school-secondary)' }}
                >
                  <p className="font-bold">{s.name}</p>
                  {s.note && <p className="text-sm text-chalkboard/70 font-light">{s.note}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section>
          <SectionHeading>Get involved</SectionHeading>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/donate?fund=${encodeURIComponent(school.name)}`)}
              className="school-btn text-white font-bold px-6 py-3 rounded-xl"
              style={{ background: 'var(--school-primary)' }}
            >
              Donate to {school.shortName}
            </button>
            <a
              href={`mailto:hello@fundingmichiganteachers.org?subject=${encodeURIComponent(`Volunteering at ${school.name}`)}`}
              className="school-btn font-bold px-6 py-3 rounded-xl border-2 border-chalkboard/15 hover:bg-chalkboard/5 transition-colors"
            >
              Volunteer at {school.shortName}
            </a>
          </div>
          <p className="mt-6 text-chalkboard/70 font-light leading-relaxed">
            Questions about what we do here?{' '}
            <a href="mailto:hello@fundingmichiganteachers.org" className="school-link underline underline-offset-4 font-semibold">
              hello@fundingmichiganteachers.org
            </a>
            <br />
            <a href="tel:+15179276909" className="school-link underline underline-offset-4 font-semibold">
              (517) 927-6909
            </a>
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
