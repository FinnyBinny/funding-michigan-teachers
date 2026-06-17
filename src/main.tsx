import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SponsorsPage from './pages/SponsorsPage.tsx';
import ForSchoolsPage from './pages/ForSchoolsPage.tsx';
import AccessPage from './pages/AccessPage.tsx';
import DonatePage from './pages/DonatePage.tsx';
import './index.css';

function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  if (path === '/sponsors') return <SponsorsPage />;
  if (path === '/for-schools') return <ForSchoolsPage />;
  if (path === '/donate') return <DonatePage />;
  if (path === '/access') return <AccessPage />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
