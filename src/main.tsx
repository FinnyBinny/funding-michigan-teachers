import {
  Component, StrictMode, Suspense, lazy, useState, useEffect, useRef,
  type ComponentType, type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import SiteHeader from './components/SiteHeader';
import { isKnownRoute } from '../shared/routes';
import { findSchool, schoolSlugFromPath } from '../shared/schools';
import { initAnalytics } from './lib/analytics';
import './index.css';

// Every page except the homepage is code-split: the homepage bundle is what
// decides LCP for ad traffic, so it must not carry the other six pages
// (including the admin panel) the way it used to.
//
// ── Surviving a deploy that lands with a tab already open ───────────────────
//
// Each page below is a content-hashed chunk: /assets/SchoolsIndexPage-<hash>.js.
// The hash changes on every build, so a browser still holding build N — a tab
// left open, or a cached index.html — asks for a chunk name that build N+1 no
// longer has, and the import rejects. Without the recovery below that rejection
// reached nothing: React unmounted the root and the visitor sat looking at a
// blank paper-coloured page.
//
// A reload is the cure, because only a fresh index.html carries the current
// hashes. The guard is what makes a reload safe — a deploy that is genuinely
// broken must not reload for ever.

/** Stamp recording that this tab already reloaded to chase a missing chunk. */
const RELOAD_KEY = 'fmt:chunk-reload';

/**
 * How long that stamp counts as "already tried".
 *
 * Long enough to cover the reload and the re-fetch on a slow connection, short
 * enough that a second deploy later in the same session gets an attempt of its
 * own rather than inheriting a spent guard. Two deploys in a day is normal here.
 *
 * sessionStorage, not localStorage, and not a ?reload=1 query param: it has to
 * survive exactly one reload and nothing more. A localStorage stamp would still
 * be sitting there days later blocking recovery, and a query param would end up
 * bookmarked, shared, and counted as its own page in analytics.
 */
const RELOAD_WINDOW_MS = 30_000;

/**
 * True if this tab reloaded recently, false if it did not, and null if we
 * cannot tell — Safari private browsing and "block all cookies" both make
 * sessionStorage throw on access.
 *
 * null is treated as "do not reload": with no way to remember the attempt, an
 * automatic reload is an infinite loop, so a browser that blocks storage gets
 * the error screen and a button instead.
 */
function reloadedRecently(): boolean | null {
  try {
    const at = Number(sessionStorage.getItem(RELOAD_KEY));
    return at > 0 && Date.now() - at < RELOAD_WINDOW_MS;
  } catch {
    return null;
  }
}

function markReloaded(): void {
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Unreachable: we only get here after reloadedRecently() returned a
    // boolean, which means storage works.
  }
}

/**
 * Spends the guard once a chunk has actually loaded. Without this one recovered
 * deploy would leave the stamp in place, and the next deploy in the same
 * session would find the guard used and show the error screen instead.
 */
function clearReloadGuard(): void {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    /* nothing to clear */
  }
}

/**
 * React.lazy, with one retry and then at most one reload.
 *
 * The retry earns its place for a genuinely transient failure — a mobile
 * connection that dropped mid-fetch. It cannot fix a stale hash: the second
 * request goes to the same URL that just failed, and some browsers remember a
 * module's failure and reject without re-requesting at all. The reload is the
 * part that recovers from a deploy.
 */
function lazyPage<T extends ComponentType<unknown>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await load();
      clearReloadGuard();
      return mod;
    } catch {
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const mod = await load();
        clearReloadGuard();
        return mod;
      } catch (err) {
        // navigator.onLine is unreliable when true and trustworthy when false,
        // which is the direction that matters: an offline visitor has not hit a
        // stale deploy, and reloading would only land them on the browser's own
        // offline screen having thrown away the page they already had.
        if (reloadedRecently() === false && navigator.onLine !== false) {
          markReloaded();
          window.location.reload();
          // Stay suspended rather than reject — the reload is already in flight
          // and the error screen would flash for a single frame.
          await new Promise<never>(() => {});
        }
        throw err;
      }
    }
  });
}

/**
 * Vite's own signal that a preloaded chunk could not be fetched. It fires
 * before the import rejects, and left unhandled it surfaces as an unhandled
 * rejection in the console on top of everything else.
 */
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  if (reloadedRecently() === false && navigator.onLine !== false) {
    markReloaded();
    window.location.reload();
  }
});

/**
 * Catches a page that failed to render — in practice a code-split chunk that
 * could not be fetched after lazyPage() gave up.
 *
 * Deliberately a class (React still has no hook for this) and deliberately
 * inline in the entry bundle with no imports of its own: an error screen that
 * needs a network fetch to appear is no use when the network is what failed.
 *
 * This is worth having regardless of chunk loading. Before it existed, ANY
 * render error in ANY page produced the same permanent blank screen.
 */
class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-chalkboard mb-3">
            This page didn&rsquo;t load
          </h1>
          <p className="text-chalkboard/70 font-light mb-6">
            The site updated while you had it open. Refreshing will pick up the
            new version.
          </p>
          <button
            type="button"
            onClick={() => { clearReloadGuard(); window.location.reload(); }}
            className="bg-chalkboard text-paper px-6 py-3 rounded-lg font-medium"
          >
            Refresh the page
          </button>
        </div>
      </div>
    );
  }
}

const SponsorsPage = lazyPage(() => import('./pages/SponsorsPage.tsx'));
const ForSchoolsPage = lazyPage(() => import('./pages/ForSchoolsPage.tsx'));
const AccessPage = lazyPage(() => import('./pages/AccessPage.tsx'));
const DonatePage = lazyPage(() => import('./pages/DonatePage.tsx'));
const ReturnablesPage = lazyPage(() => import('./pages/ReturnablesPage.tsx'));
const AboutPage = lazyPage(() => import('./pages/AboutPage.tsx'));
const ForTeachersPage = lazyPage(() => import('./pages/ForTeachersPage.tsx'));
const ShopPage = lazyPage(() => import('./pages/ShopPage.tsx'));
const PrivacyPage = lazyPage(() => import('./pages/PrivacyPage.tsx'));
const AccessibilityPage = lazyPage(() => import('./pages/AccessibilityPage.tsx'));
const SchoolsIndexPage = lazyPage(() => import('./pages/SchoolsIndexPage.tsx'));
const SchoolPage = lazyPage(() => import('./pages/SchoolPage.tsx'));
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage.tsx'));
const RestrictedPage = lazyPage(() => import('./pages/RestrictedPage.tsx'));

/**
 * After an in-app page change, focus the new page's heading.
 *
 * A single-page app swaps the content without the browser loading a page, so
 * nothing tells a screen reader anything happened: a visitor who pressed
 * "About" heard silence and stayed wherever focus had been. Moving focus to
 * the new <h1> reads its name and starts the next Tab from the top of the new
 * page. Code-split pages arrive a moment later, so it waits for the heading.
 */
function useFocusOnNavigate(path: string) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let frame = 0;
    let tries = 0;
    const tick = () => {
      // While the next page's code loads, React keeps the previous page in
      // the DOM with display:none, h1 and all. Only a heading that is
      // actually rendered counts, or focus lands on the hidden old one.
      const h1 = [...document.querySelectorAll<HTMLElement>('main h1, h1')].find((h) => h.getClientRects().length > 0);
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
        return;
      }
      if (tries++ < 180) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [path]);
}

/**
 * On a phone, a .rail-sm row scrolls sideways and snaps. Tabbing to a button
 * on the second card used to leave that card off-screen; this brings the card
 * holding focus into view.
 */
document.addEventListener('focusin', (e) => {
  const card = (e.target as HTMLElement | null)?.closest?.('.rail-sm > *');
  if (card && window.matchMedia('(max-width: 767.98px)').matches) {
    card.scrollIntoView({ block: 'nearest', inline: 'start' });
  }
});

function Router() {
  const [rawPath, setRawPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setRawPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Trailing slashes are tolerated everywhere (QR scanners and some clients
  // append one; the Worker also 301s them away). Matching on the normalized
  // path means /donate/ renders the donate page instead of the homepage.
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  useFocusOnNavigate(path);

  // The site's only dynamic route. The slug is resolved from the school
  // registry, so an invented /schools/... falls through to the 404 below and
  // the Worker answers it with a real 404 status.
  const schoolSlug = schoolSlugFromPath(path);

  let page: React.ReactNode;
  if (schoolSlug) page = <SchoolPage school={findSchool(schoolSlug)!} />;
  else if (path === '/schools') page = <SchoolsIndexPage />;
  else if (path === '/sponsors') page = <SponsorsPage />;
  else if (path === '/for-schools') page = <ForSchoolsPage />;
  else if (path === '/donate') page = <DonatePage />;
  else if (path === '/access') page = <AccessPage />;
  else if (path === '/returnables') page = <ReturnablesPage />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/for-teachers') page = <ForTeachersPage />;
  else if (path === '/shop') page = <ShopPage />;
  else if (path === '/privacy') page = <PrivacyPage />;
  else if (path === '/accessibility') page = <AccessibilityPage />;
  else if (path === '/restricted') page = <RestrictedPage />;
  // Anything else is genuinely missing. The Worker pairs this with a real 404
  // status; previously every typo silently rendered the homepage at 200.
  else if (!isKnownRoute(path)) page = <NotFoundPage />;
  else return <App />;

  return (
    <PageErrorBoundary>
      {/* The header stays up while a page's code loads. The fallback used to
          be an empty paper-coloured screen, so for a third of a second on
          every page change the header vanished and the site looked blank. */}
      <Suspense fallback={<div className="min-h-screen bg-paper"><SiteHeader /></div>}>
        {page}
      </Suspense>
    </PageErrorBoundary>
  );
}

initAnalytics();

// reducedMotion="user": every Motion animation on the site respects the
// visitor's "reduce motion" setting. Without it only CSS animations did, and
// the blur-in heroes, slide-ins and scroll effects ran regardless.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Router />
    </MotionConfig>
  </StrictMode>,
);
