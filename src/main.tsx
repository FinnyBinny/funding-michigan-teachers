import { StrictMode, Suspense, lazy, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { isKnownRoute } from '../shared/routes';
import { initAnalytics } from './lib/analytics';
import './index.css';

// Every page except the homepage is code-split: the homepage bundle is what
// decides LCP for ad traffic, so it must not carry the other six pages
// (including the admin panel) the way it used to.
const SponsorsPage = lazy(() => import('./pages/SponsorsPage.tsx'));
const ForSchoolsPage = lazy(() => import('./pages/ForSchoolsPage.tsx'));
const AccessPage = lazy(() => import('./pages/AccessPage.tsx'));
const DonatePage = lazy(() => import('./pages/DonatePage.tsx'));
const ReturnablesPage = lazy(() => import('./pages/ReturnablesPage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.tsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'));
const RestrictedPage = lazy(() => import('./pages/RestrictedPage.tsx'));

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

  let page: React.ReactNode;
  if (path === '/sponsors') page = <SponsorsPage />;
  else if (path === '/for-schools') page = <ForSchoolsPage />;
  else if (path === '/donate') page = <DonatePage />;
  else if (path === '/access') page = <AccessPage />;
  else if (path === '/returnables') page = <ReturnablesPage />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/privacy') page = <PrivacyPage />;
  else if (path === '/restricted') page = <RestrictedPage />;
  // Anything else is genuinely missing. The Worker pairs this with a real 404
  // status; previously every typo silently rendered the homepage at 200.
  else if (!isKnownRoute(path)) page = <NotFoundPage />;
  else return <App />;

  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      {page}
    </Suspense>
  );
}

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
