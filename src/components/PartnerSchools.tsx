import type { CSSProperties } from 'react';
import { SCHOOLS, schoolPath, type School } from '../../shared/schools';

/**
 * The partner school list, shared by the homepage and /schools.
 *
 * One component, two sizes: the homepage passes `compact` so the section is a
 * small version of the full thing, with a way through to it. Adding a fourth
 * school changes nothing here — it reads SCHOOLS in order.
 *
 * Each school is a whole link. Clicking anywhere on it goes to that school's
 * own page; there is no expanding, no accordion, no second click.
 */

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function SchoolCard({ school, compact }: { school: School; compact: boolean }) {
  const palette = {
    '--school-primary': school.colors.primary,
    '--school-secondary': school.colors.secondary,
  } as CSSProperties;

  return (
    <a
      href={schoolPath(school.slug)}
      onClick={(e) => {
        // Plain left-click navigates in-app; ctrl/cmd-click and middle-click
        // keep working as real links, because this is an <a> with an href.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(schoolPath(school.slug));
      }}
      style={palette}
      className="school-link group block bg-white rounded-2xl overflow-hidden ring-1 ring-chalkboard/8 hover:ring-chalkboard/20 transition-[box-shadow,border-color] text-left"
    >
      {/* The school's color is the whole identity of the card. */}
      <div
        className={compact ? 'h-2' : 'h-3'}
        style={{ background: 'var(--school-primary)' }}
        aria-hidden="true"
      />
      <div className={compact ? 'p-5' : 'p-6'}>
        <h3
          className={`font-serif font-bold leading-snug ${compact ? 'text-lg' : 'text-xl'}`}
          style={{ color: 'var(--school-primary)' }}
        >
          {school.name}
        </h3>
        <p className="text-sm text-chalkboard/65 mt-1">Home of the {school.mascot}</p>
        {!compact && (
          <p className="text-chalkboard/75 font-light leading-relaxed mt-3">{school.intro}</p>
        )}
        <p className="mt-4 font-bold text-sm underline underline-offset-4 decoration-2 group-hover:decoration-[3px]"
           style={{ color: 'var(--school-primary)', textDecorationColor: 'var(--school-secondary)' }}>
          See what we do at {school.shortName}
        </p>
      </div>
    </a>
  );
}

export default function PartnerSchools({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-4 sm:grid-cols-3' : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'}>
      {SCHOOLS.map((school) => (
        <SchoolCard key={school.slug} school={school} compact={compact} />
      ))}
    </div>
  );
}
