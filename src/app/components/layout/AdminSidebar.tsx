import { Link, useLocation } from 'react-router';
import { LayoutDashboard, CalendarDays, ListOrdered, ShieldAlert, Bell, ArrowUpRight, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

const BG_DARK = '#141410';
const GOLD = '#B8962E';
const GOLD_FAINT = 'rgba(184,150,46,0.45)';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Reservations',
    items: [
      { href: '/admin/reservations', label: 'All Reservations', icon: ListOrdered },
      { href: '/admin/reservations?filter=pending', label: 'Pending Approval', icon: Clock },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
      { href: '/admin/blocks', label: 'Schedule Blocks', icon: ShieldAlert },
    ],
  },
  {
    label: 'Communications',
    items: [
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

function isActive(href: string, pathname: string, exact?: boolean): boolean {
  const path = href.split('?')[0];
  if (exact) return pathname === path;
  return pathname.startsWith(path);
}

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export function AdminSidebar({ collapsed, mobileOpen, onToggleCollapse, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const width = collapsed ? '64px' : '256px';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            zIndex: 38,
          }}
          className="md:hidden"
        />
      )}

      {/* Sidebar */}
      <div style={{
        width,
        minHeight: '100vh',
        backgroundColor: BG_DARK,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'width 0.22s ease, transform 0.25s ease',
        transform: mobileOpen ? 'translateX(0)' : undefined,
        overflow: 'hidden',
      }}
        className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Branding */}
        <div style={{
          padding: collapsed ? '20px 0' : '22px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '500', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.15em', lineHeight: 1.2 }}>
                Pradera Verde
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>Admin Panel</div>
            </div>
          )}
          {/* Mobile close / desktop collapse toggle */}
          <button
            onClick={mobileOpen ? onClose : onToggleCollapse}
            className="md:flex hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', padding: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={onClose}
            className="md:hidden flex"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', padding: '4px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginTop: collapsed ? '16px' : '20px' }}>
              {!collapsed && (
                <p style={{
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: GOLD_FAINT, fontWeight: '500',
                  padding: '0 20px', marginBottom: '2px',
                }}>
                  {group.label}
                </p>
              )}
              {collapsed && <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 12px 8px' }} />}
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, location.pathname, exact);
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={onClose}
                    title={collapsed ? label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? '0' : '10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '0' : '0 16px 0 20px',
                      height: '40px',
                      fontSize: '14px',
                      color: active ? 'white' : 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      borderLeft: active && !collapsed ? `2px solid ${GOLD}` : '2px solid transparent',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.06)'; el.style.color = 'white'; } }}
                    onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = 'rgba(255,255,255,0.65)'; } }}
                  >
                    <Icon size={collapsed ? 18 : 15} />
                    {!collapsed && label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* View site */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            to="/"
            onClick={onClose}
            title={collapsed ? 'View Site' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : '10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0' : '0 20px',
              height: '44px', fontSize: '13px',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}
          >
            <ArrowUpRight size={14} />
            {!collapsed && 'View Site'}
          </Link>
        </div>
      </div>
    </>
  );
}
