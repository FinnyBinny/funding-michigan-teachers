import { useEffect } from 'react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import PartnerSchools from '../components/PartnerSchools';
import { setPageMeta } from '../lib/seo';
import { SCHOOLS } from '../../shared/schools';

/**
 * /schools — the index. Lists every partner school in registry order, each
 * one a link to its own page.
 *
 * This is also where a school that is not yet a partner finds its way in,
 * which is why the recruitment page moved out of the top nav: a visitor
 * looking for "schools" lands here first, and the ask sits at the bottom
 * where it belongs rather than competing with the partners at the top.
 */

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function SchoolsIndexPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    setPageMeta({
      title: 'Partner Schools | Funding Michigan Teachers',
      description:
        'The Michigan high schools Funding Michigan Teachers works in — Okemos, East Lansing and Haslett. Staff appreciation, classroom supplies after the budget runs out, and the local businesses behind it.',
      path: '/schools',
    });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="px-4 sm:px-6 pt-28 sm:pt-36 pb-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-serif font-bold text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] tracking-tight mb-5 text-balance">
              Partner schools
            </h1>
            <p className="text-xl text-chalkboard/70 font-light leading-relaxed max-w-2xl text-pretty">
              We work in {SCHOOLS.length} high schools, supporting teachers, classroom aides and
              office staff. Each one has its own page — its own events, its own sponsors, its own
              teachers asking for what their rooms ran out of.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            <PartnerSchools />
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto border-t border-chalkboard/10 pt-10">
            <h2 className="font-serif font-bold text-2xl mb-3">Not on this list yet?</h2>
            <p className="text-chalkboard/75 font-light leading-relaxed max-w-2xl mb-5">
              If you work at a Michigan high school and want FMT in your building, we would like to
              hear from you. We are small and we would rather do a few schools properly than many
              badly, so we add them slowly.
            </p>
            <button
              onClick={() => navigate('/for-schools')}
              className="bg-chalkboard text-white font-bold px-6 py-3 rounded-xl hover:bg-apple transition-colors"
            >
              Bring FMT to your school
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
