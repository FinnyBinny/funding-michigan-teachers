import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion, useInView, animate } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Award, Calendar, Check, Coffee, Heart, Mail,
  Package, Sparkles, Star, Store, Trophy, Users, UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { Button, ButtonTrailing } from '../components/ui/button';
import { breadcrumbs, setPageMeta, setPageStructuredData } from '../lib/seo';
import { metaForPath } from '../../shared/pageMeta';
import { useEvents } from '../hooks/useLocalData';
import { PAST_EVENTS } from '../data/initialData';
import { schoolPath, type School } from '../../shared/schools';

/**
 * One template, every partner school.
 *
 * Built from the same parts as the homepage, on purpose: the hero grid, the
 * pill eyebrow, the serif headline with one italic accent, the white feature
 * cards with a tinted icon tile, the dark call-to-action card. Earlier
 * versions invented a visual language of their own and read as a different
 * site bolted on. The school's own color stands in wherever the homepage uses
 * FMT's red, so each page is unmistakably that school and unmistakably ours.
 *
 * The colors ride in as CSS custom properties on the wrapper, so nothing here
 * knows a hex value and a fourth school needs no code.
 *
 * Every section renders only when it has something real in it. These pages are
 * read by the administrators of the building they describe, and an empty
 * heading reads worse than a shorter page.
 */

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** The homepage's easing curve, so motion here feels like the same hand. */
const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * What each program on the partnership menu actually is, in one plain line.
 * Taken from how the For Schools page already describes them, so the two
 * pages never disagree about what a principal signed.
 */
const PROGRAMS: Record<string, { icon: LucideIcon; line: string }> = {
  'Teacher of the Month': {
    icon: Award,
    line: 'One teacher each month, recognized at the staff meeting and featured on our website.',
  },
  'Teacher Lounge Decorating': {
    icon: Sparkles,
    line: 'We decorate the staff lounge for holidays and the change of seasons.',
  },
  'Post Office of Love': {
    icon: Mail,
    line: 'Students write letters to staff who matter to them. We deliver them in February.',
  },
  'Staff Meeting Catering': {
    icon: UtensilsCrossed,
    line: 'Meals from local restaurants at staff meetings.',
  },
  'End-of-Year Staff Breakfast': {
    icon: Coffee,
    line: 'Breakfast for the whole staff during the last week of school.',
  },
  'Door Decorating Competition': {
    icon: Trophy,
    line: 'A building-wide door decorating contest with prizes for the winners.',
  },
};

/**
 * A count that runs up the first time it is scrolled to. Years are shown
 * outright, and reduced motion gets the final number immediately.
 */
function Tally({ value, count }: { value: string; count: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Bottom inset only. A bare '-40px' shrinks every side, and a number sitting
  // 16px from the left edge of a phone never counts as visible at all.
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
  const reduce = useReducedMotion();
  const target = Number(value);
  const animatable = count && !reduce && Number.isFinite(target);
  const [shown, setShown] = useState(animatable ? 0 : target);

  useEffect(() => {
    if (!animatable || !inView) return;
    const controls = animate(0, target, {
      duration: Math.min(0.5 + target * 0.12, 1.4),
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [animatable, inView, target]);

  return <span ref={ref}>{animatable ? shown : value}</span>;
}

/**
 * The homepage's section header: a tinted pill, a serif headline with one
 * italic accent, and a muted line under it. Centered, like "Choose Your
 * Impact".
 */
function SectionHead({
  icon: Icon, eyebrow, lead, accent, sub,
}: { icon: LucideIcon; eyebrow: string; lead: string; accent: string; sub?: ReactNode }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.6875rem] font-bold mb-6 uppercase tracking-widest"
        style={{
          background: 'color-mix(in srgb, var(--school-primary) 10%, transparent)',
          color: 'var(--school-primary)',
        }}
      >
        <Icon size={14} />
        {eyebrow}
      </div>
      <h2 className="text-4xl md:text-5xl font-serif font-bold leading-[1.1] text-balance">
        {lead}{' '}
        <span className="italic font-normal" style={{ color: 'var(--school-primary)' }}>{accent}</span>
      </h2>
      {sub && (
        <p className="mt-5 text-lg text-chalkboard/70 font-light leading-relaxed text-pretty">{sub}</p>
      )}
    </div>
  );
}

/** The homepage's feature card: white, soft shadow, tinted icon tile. */
function FeatureCard({
  icon: Icon, title, children, delay = 0,
}: { icon: LucideIcon; title: string; children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className="group p-7 sm:p-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-shadow duration-500 flex gap-5 items-start"
    >
      <div
        className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 shadow-sm"
        style={{
          background: 'color-mix(in srgb, var(--school-primary) 10%, white)',
          color: 'var(--school-primary)',
        }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <h3 className="text-xl font-serif font-bold mb-2">{title}</h3>
        <div className="text-chalkboard/70 leading-relaxed font-light text-base">{children}</div>
      </div>
    </motion.div>
  );
}

/** The site's primary pill button, in the school's color instead of FMT red. */
const schoolButton =
  'bg-[var(--school-primary)] hover:bg-[var(--school-primary)] hover:brightness-110 ' +
  'shadow-[0_12px_30px_color-mix(in_srgb,var(--school-primary)_30%,transparent)] ' +
  'hover:shadow-[0_18px_40px_color-mix(in_srgb,var(--school-primary)_40%,transparent)]';

export default function SchoolPage({ school }: { school: School }) {
  const events = useEvents();
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta(metaForPath(schoolPath(school.slug)));
    // Breadcrumbs show in the search result in place of the bare URL, and
    // tell Google this page sits under the Partner Schools section.
    setPageStructuredData([
      breadcrumbs([['Partner Schools', '/schools'], [school.name, schoolPath(school.slug)]]),
      {
        '@context': 'https://schema.org',
        '@type': 'HighSchool',
        name: school.name,
        // The page is about FMT's work at this school, so the relationship
        // is stated rather than implying FMT is the school.
        sponsor: { '@type': 'NGO', name: 'Funding Michigan Teachers', url: 'https://www.fundingmichiganteachers.org/' },
        address: { '@type': 'PostalAddress', addressRegion: 'MI', addressCountry: 'US' },
      },
    ]);
    return () => setPageStructuredData(null);
  }, [school]);

  /**
   * Coming up, read from the live events feed. Events carry the school's name
   * in `location`, so one added in the admin panel appears here and on the
   * homepage calendar without being written twice.
   */
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events
      .filter((e) => !e.date || String(e.date).slice(0, 10) >= today)
      .filter((e) => e.location === school.name || e.location === 'All partner schools')
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(0, 3);
  }, [events, school.name]);

  /** What we have done here: the school file's own notes, then tagged events. */
  const history = useMemo(() => {
    const tagged = PAST_EVENTS
      .filter((e) => e.location === school.name)
      .map((e) => ({ when: e.month, title: e.title, body: e.description }));
    return [...school.pastHighlights, ...tagged];
  }, [school]);

  /**
   * The hero's numbers, built only from what is actually true of this school.
   * A number with nothing behind it is left out rather than shown as zero.
   */
  const stats = useMemo(() => {
    const out: { value: string; label: string; count: boolean }[] = [];
    if (school.partnership?.programs.length) {
      const n = school.partnership.programs.length;
      out.push({ value: String(n), label: n === 1 ? 'Program' : 'Programs', count: true });
    }
    if (history.length) {
      out.push({ value: String(history.length), label: history.length === 1 ? 'Event' : 'Events', count: true });
    }
    if (school.sponsors.length) {
      const n = school.sponsors.length;
      out.push({ value: String(n), label: n === 1 ? 'Local sponsor' : 'Local sponsors', count: true });
    }
    return out;
  }, [school, history]);

  const partnerYear = /^\d{4}$/.test(school.partnerSince) ? school.partnerSince : null;

  /**
   * The hero's right-hand card. A real photo when the school has one, exactly
   * like the homepage. Otherwise the same card in the school's color, carrying
   * the most recent thing that happened here as its caption.
   */
  const feature = history[0] ?? (school.sponsors[0]
    ? { when: 'Thank you', title: `${school.sponsors[0].name}: ${school.sponsors[0].note ?? ''}`.replace(/: $/, ''), body: '' }
    : null);

  const donateInitiative = school.initiatives.find((i) => i.ctaHref.startsWith('/donate'));
  const requestHref = `/for-teachers?school=${encodeURIComponent(school.name)}`;

  // The school's palette, handed to CSS. Nothing below reads a hex directly.
  const palette = {
    '--school-primary': school.colors.primary,
    '--school-secondary': school.colors.secondary,
    '--school-tertiary': school.colors.tertiary ?? school.colors.secondary,
  } as CSSProperties;

  const fmtDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-[100dvh] bg-paper flex flex-col overflow-x-clip" style={palette}>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* ── Hero: the homepage's grid, the school's color ─────────────── */}
        <section className="relative px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-24">
          <div
            className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px]"
            style={{ background: 'color-mix(in srgb, var(--school-primary) 6%, transparent)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'color-mix(in srgb, var(--school-tertiary) 14%, transparent)' }}
          />

          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative">
            {/* min-w-0: a grid column otherwise refuses to shrink below its
                widest unbreakable content, and at 320px the East Lansing
                hero clipped its text and button off the right edge. */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="lg:col-span-7 min-w-0"
            >
              <button
                onClick={() => navigate('/schools')}
                className="school-link inline-flex items-center gap-1.5 text-sm text-chalkboard/75 hover:text-chalkboard transition-colors mb-6"
              >
                <ArrowLeft size={14} /> All partner schools
              </button>

              <div className="flex">
                <div className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-xl ring-1 ring-chalkboard/10 px-3.5 py-1.5 rounded-full text-[0.625rem] font-bold mb-8 uppercase tracking-[0.24em] text-chalkboard/70 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--school-primary)' }} />
                  Partner school · {school.district}
                </div>
              </div>

              <h1 className="font-serif font-bold leading-[0.95] tracking-[-0.025em] text-[clamp(2.5rem,5.4vw,4.75rem)] text-balance">
                {school.name}
              </h1>
              <p
                className="font-serif italic text-[clamp(1.6rem,3vw,2.5rem)] leading-tight mt-3 mb-7"
                style={{ color: 'var(--school-primary)' }}
              >
                Home of the {school.mascot}
              </p>

              <p className="text-lg text-chalkboard/75 max-w-xl mb-10 leading-relaxed font-light text-pretty">
                {school.intro}
              </p>

              <div className="flex flex-wrap gap-3 items-center">
                {donateInitiative && (
                  <Button asChild variant="primary" size="lg" className={`group whitespace-normal text-center ${schoolButton}`}>
                    <a href={donateInitiative.ctaHref}>
                      Donate to {school.shortName}
                      <ButtonTrailing dark>
                        <ArrowRight size={14} />
                      </ButtonTrailing>
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="md">
                  <a href={requestHref}>Request supplies</a>
                </Button>
              </div>

              <p className="mt-4 text-[0.6875rem] text-chalkboard/70 font-bold uppercase tracking-widest flex flex-wrap items-center gap-2">
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
                {partnerYear ? `Partner since ${partnerYear}` : 'Where FMT started'} · No cost to the school
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
              </p>

              {stats.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                  {stats.map((s, i) => (
                    <div key={s.label} className="flex items-center gap-6">
                      {i > 0 && <div className="hidden sm:block w-px h-10 bg-chalkboard/10" />}
                      <div className="flex flex-col">
                        <span className="font-bold text-2xl leading-none" style={{ color: 'var(--school-primary)' }}>
                          <Tally value={s.value} count={s.count} />
                        </span>
                        <span className="text-[0.625rem] sm:text-xs uppercase tracking-widest font-bold text-muted mt-1">
                          {s.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* The homepage puts a real photo here. A school with one gets the
                same card; one without gets it in the school's own color. */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="relative lg:col-span-5"
            >
              {school.hero ? (
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-chalkboard/5">
                  <img
                    src={school.hero.src}
                    alt={school.hero.alt}
                    width={school.hero.width}
                    height={school.hero.height}
                    className="w-full h-[420px] sm:h-[480px] lg:h-[540px] xl:h-[600px] object-cover"
                    style={school.hero.position ? { objectPosition: school.hero.position } : undefined}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chalkboard/80 via-chalkboard/10 to-transparent" />
                  {school.hero.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                      <p className="text-white/70 text-[0.625rem] uppercase tracking-[0.2em] font-bold mb-1">
                        {school.shortName} · Funding Michigan Teachers
                      </p>
                      <p className="text-white font-serif text-xl sm:text-2xl font-bold leading-tight">
                        {school.hero.caption}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[360px] sm:h-[420px] lg:h-[540px] xl:h-[600px]"
                  style={{ background: 'var(--school-primary)' }}
                >
                  <div
                    className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-[100px]"
                    style={{ background: 'color-mix(in srgb, var(--school-secondary) 22%, transparent)' }}
                  />
                  <div
                    className="absolute -left-20 bottom-0 w-72 h-72 rounded-full blur-[90px]"
                    style={{ background: 'color-mix(in srgb, var(--school-tertiary) 14%, transparent)' }}
                  />
                  {/* The mascot as a large mark, the way the photo fills the
                      homepage card. aria-hidden: the h1 already names it. */}
                  <p
                    className="absolute inset-x-0 top-[18%] text-center font-serif italic font-bold leading-none text-white/[0.13] text-[clamp(4.5rem,11vw,9rem)] select-none"
                    aria-hidden="true"
                  >
                    {school.mascot}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  {feature && (
                    <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                      <p className="text-white/70 text-[0.625rem] uppercase tracking-[0.2em] font-bold mb-1">
                        {feature.when} · {school.shortName}
                      </p>
                      <p className="text-white font-serif text-xl sm:text-2xl font-bold leading-tight">
                        {feature.title}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px] -z-10"
                style={{ background: 'color-mix(in srgb, var(--school-primary) 5%, transparent)' }}
              />
            </motion.div>
          </div>
        </section>

        {/* ── What the school signed up for ─────────────────────────────── */}
        {school.partnership && (
          <section className="bg-white px-4 sm:px-6 py-20 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <SectionHead
                icon={Star}
                eyebrow="Partnership"
                lead={`What ${school.shortName}`}
                accent="signed up for."
                sub={`Each partner school picks its own programs from the same list. ${school.shortName} chose ${school.partnership.programs.length}, agreed in ${school.partnership.signed}.`}
              />
              <div className="grid md:grid-cols-2 gap-5">
                {school.partnership.programs.map((name, i) => {
                  const p = PROGRAMS[name] ?? { icon: Star, line: '' };
                  return (
                    <FeatureCard key={name} icon={p.icon} title={name} delay={i * 0.08}>
                      {p.line}
                    </FeatureCard>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── What happened here, and what's next ───────────────────────── */}
        {(history.length > 0 || upcoming.length > 0) && (
          <section className="px-4 sm:px-6 py-20 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <SectionHead
                icon={Calendar}
                eyebrow={`At ${school.shortName}`}
                lead="What we've"
                accent="done here."
              />
              <div className="grid lg:grid-cols-12 gap-10">
                {history.length > 0 && (
                  <ol className={`${upcoming.length ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-5`}>
                    {history.map((h, i) => (
                      <motion.li
                        key={`${h.when}-${h.title}`}
                        initial={reduce ? false : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                        transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
                        className="p-7 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5"
                      >
                        <p
                          className="text-[0.6875rem] uppercase tracking-widest font-bold mb-2"
                          style={{ color: 'var(--school-primary)' }}
                        >
                          {h.when}
                        </p>
                        <h3 className="text-xl font-serif font-bold mb-2">{h.title}</h3>
                        <p className="text-chalkboard/70 leading-relaxed font-light">{h.body}</p>
                      </motion.li>
                    ))}
                  </ol>
                )}

                {upcoming.length > 0 && (
                  <div className={history.length ? 'lg:col-span-5' : 'lg:col-span-12'}>
                    <div className="p-7 sm:p-8 bg-chalkboard text-white rounded-3xl shadow-2xl relative overflow-hidden lg:sticky lg:top-28">
                      <div
                        className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-[100px]"
                        style={{ background: 'color-mix(in srgb, var(--school-primary) 35%, transparent)' }}
                      />
                      <div className="relative">
                        <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
                          <Calendar size={22} className="text-white/70" />
                          Coming up
                        </h3>
                        <ul className="space-y-5">
                          {upcoming.map((e) => (
                            <li key={e.id} className="flex gap-4">
                              {e.date && (
                                <span className="shrink-0 w-14 text-center rounded-xl bg-white/10 py-2">
                                  <span className="block text-[0.625rem] uppercase tracking-widest text-white/70 font-bold">
                                    {fmtDate(String(e.date)).split(' ')[0]}
                                  </span>
                                  <span className="block text-xl font-bold leading-none mt-0.5">
                                    {fmtDate(String(e.date)).split(' ')[1]}
                                  </span>
                                </span>
                              )}
                              <span>
                                <span className="block font-bold leading-snug">{e.title}</span>
                                <span className="block text-sm text-white/70 font-light leading-relaxed mt-1">
                                  {e.description}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Photos ────────────────────────────────────────────────────── */}
        {school.photos.length > 0 && (
          <section className="bg-white px-4 sm:px-6 py-20 sm:py-24">
            <div className="max-w-6xl mx-auto">
              <SectionHead icon={Heart} eyebrow="Photos" lead="From" accent={`${school.shortName}.`} />
              <div className={`grid gap-5 ${school.photos.length > 1 ? 'sm:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
                {school.photos.map((p) => (
                  <figure key={p.src} className="rounded-3xl overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-chalkboard/5">
                    <img
                      src={p.src}
                      alt={p.alt}
                      width={p.width}
                      height={p.height}
                      className="w-full h-auto"
                      loading="lazy"
                      decoding="async"
                    />
                    {p.caption && (
                      <figcaption className="px-6 py-4 text-sm text-chalkboard/70 font-light">{p.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Ways to help: the initiatives and the club ────────────────── */}
        <section className={`${school.photos.length ? '' : 'bg-white'} px-4 sm:px-6 py-20 sm:py-24`}>
          <div className="max-w-6xl mx-auto">
            <SectionHead icon={Package} eyebrow="Get involved" lead="Ways to" accent="help." />
            <div className="grid md:grid-cols-2 gap-5">
              {school.initiatives.map((it, i) => (
                <FeatureCard
                  key={it.title}
                  icon={it.ctaHref.startsWith('/donate') ? Heart : Package}
                  title={it.title}
                  delay={i * 0.08}
                >
                  <p>{it.body}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <a
                      href={it.ctaHref}
                      className="school-btn inline-flex items-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-full transition-all hover:brightness-110"
                      style={{ background: 'var(--school-primary)' }}
                    >
                      {it.ctaLabel} <ArrowRight size={14} />
                    </a>
                    {it.secondaryLabel && it.secondaryHref && (
                      <a
                        href={it.secondaryHref}
                        className="school-link text-sm font-bold underline underline-offset-4"
                        style={{ color: 'var(--school-primary)' }}
                      >
                        {it.secondaryLabel}
                      </a>
                    )}
                  </div>
                </FeatureCard>
              ))}

              {school.club && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="md:col-span-2 p-8 sm:p-10 text-white rounded-3xl shadow-2xl relative overflow-hidden"
                  style={{ background: 'var(--school-primary)' }}
                >
                  <div
                    className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px]"
                    style={{ background: 'color-mix(in srgb, var(--school-secondary) 25%, transparent)' }}
                  />
                  <div className="relative sm:flex sm:items-center sm:justify-between gap-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-3 flex items-center gap-3">
                        <Users size={24} className="text-white/80" />
                        {school.club.name}
                      </h3>
                      <p className="text-white/75 font-light leading-relaxed max-w-xl">{school.club.body}</p>
                      {school.club.advisor && (
                        <p className="text-white/70 text-sm mt-3">Faculty advisor: {school.club.advisor}</p>
                      )}
                    </div>
                    <a
                      href={school.club.ctaHref}
                      className="school-btn mt-6 sm:mt-0 shrink-0 inline-flex items-center gap-2 bg-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      style={{ color: 'var(--school-primary)' }}
                    >
                      {school.club.ctaLabel} <ArrowRight size={14} />
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* ── Thank you ─────────────────────────────────────────────────── */}
        {school.sponsors.length > 0 && (
          <section className={`${school.photos.length ? 'bg-white' : ''} px-4 sm:px-6 py-20 sm:py-24`}>
            <div className="max-w-6xl mx-auto">
              <SectionHead
                icon={Heart}
                eyebrow="Thank you"
                lead="Local businesses"
                accent="who gave."
                sub={`These businesses donated to ${school.shortName} staff. Please support them.`}
              />
              <div
                className={`grid gap-5 mx-auto ${
                  school.sponsors.length === 1 ? 'max-w-md'
                    : school.sponsors.length === 2 ? 'sm:grid-cols-2 max-w-4xl'
                      : 'sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {school.sponsors.map((s, i) => (
                  <FeatureCard key={s.name} icon={Store} title={s.name} delay={i * 0.06}>
                    {s.note}
                  </FeatureCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Close: the homepage's dark call-to-action card ─────────────── */}
        <section className="px-4 sm:px-6 pb-20 sm:pb-24 pt-4">
          <div className="max-w-6xl mx-auto p-10 sm:p-14 bg-chalkboard text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
            <div
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full blur-[110px]"
              style={{ background: 'color-mix(in srgb, var(--school-primary) 45%, transparent)' }}
            />
            <div
              className="absolute -left-20 -top-20 w-72 h-72 rounded-full blur-[90px]"
              style={{ background: 'color-mix(in srgb, var(--school-tertiary) 18%, transparent)' }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight text-balance">
                Help {school.shortName} teachers{' '}
                <span className="italic font-normal text-white/80">this year.</span>
              </h2>
              <p className="mt-5 text-white/70 font-light text-lg max-w-xl mx-auto">
                At least 80¢ of every dollar goes to teachers. Funding Michigan Teachers is a 501(c)(3)
                nonprofit, EIN 93-4485967.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a
                  href={donateInitiative?.ctaHref ?? '/donate'}
                  className="school-btn inline-flex items-center gap-2 bg-white text-chalkboard px-8 py-4 rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Donate to {school.shortName} <ArrowRight size={14} />
                </a>
                <a
                  href="mailto:hello@fundingmichiganteachers.org"
                  className="school-btn inline-flex items-center gap-2 ring-1 ring-white/25 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  <Check size={14} /> Ask us a question
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
