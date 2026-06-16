import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Navbar } from '../components/layout/Navbar';

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const id = hash.replace('#', '');
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [hash, pathname]);
  return null;
}

export function PublicLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <ScrollToHash />
      {/* Landing page: Navbar is fixed/absolute over hero.
          All other pages: dark header bar above the sticky Navbar */}
      {isLanding ? (
        <main>
          <Navbar />
          <Outlet />
        </main>
      ) : (
        <>
          <Navbar />
          <main>
            <Outlet />
          </main>
        </>
      )}
    </div>
  );
}
