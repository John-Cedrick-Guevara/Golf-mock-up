import { Outlet, useNavigate, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useEffect, useState } from 'react';
import { LogOut, Menu } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/reservations': 'Reservations',
  '/admin/calendar': 'Calendar',
  '/admin/blocks': 'Schedule Blocks',
  '/admin/notifications': 'Notifications',
};

function AdminTopBar({
  userName,
  onLogout,
  onOpenMobile,
}: {
  userName: string;
  onLogout: () => void;
  onOpenMobile: () => void;
}) {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/').slice(1, 3).join('/');
  const title = PAGE_TITLES[basePath] || 'Admin Panel';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      height: '56px', backgroundColor: 'white',
      borderBottom: '1px solid #E5E3DF',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenMobile}
          className="md:hidden"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B6B67', padding: '4px', display: 'flex', alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A18' }}>{title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#6B6B67' }} className="hidden sm:block">{userName}</span>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: '#2D5016', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '600', flexShrink: 0,
        }}>
          {initials}
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'none', border: '1px solid #E5E3DF', borderRadius: '4px',
            padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
            color: '#6B6B67', transition: 'color 0.15s, border-color 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#A32D2D'; el.style.borderColor = '#A32D2D'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#6B6B67'; el.style.borderColor = '#E5E3DF'; }}
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
    } else if (currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const sidebarWidth = collapsed ? '64px' : '256px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(c => !c)}
        onClose={() => setMobileOpen(false)}
      />

      {/* Inline CSS: override margin-left to 0 on mobile (sidebar is overlay there) */}
      <style>{`@media (max-width: 767px) { .admin-main-content { margin-left: 0 !important; } }`}</style>

      {/* Main content */}
      <div
        className="admin-main-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8F7F4',
          minHeight: '100vh',
          minWidth: 0,
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.22s ease',
        }}
      >
        <AdminTopBar
          userName={currentUser.name}
          onLogout={() => { logout(); navigate('/'); }}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main style={{ flex: 1, overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', padding: '24px 20px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
