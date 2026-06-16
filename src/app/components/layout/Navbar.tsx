import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Menu, X, BookOpen, User, ChevronDown } from 'lucide-react';

const BG_DARK = '#141410';
const GOLD = '#C9A84C';
const GREEN = '#2D5016';

function SmartHashLink({
  hash, label, style, onClose,
}: { hash: string; label: string; style?: React.CSSProperties; onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    onClose?.();
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${hash}`);
    }
  }
  return (
    <a href={`/#${hash}`} onClick={handleClick} style={style}>{label}</a>
  );
}

export function Navbar() {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!isLanding) { setScrolled(true); return; }
    function onScroll() { setScrolled(window.scrollY > 80); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const navBg = isLanding
    ? scrolled ? BG_DARK : 'transparent'
    : BG_DARK;

  const linkColor = 'rgba(255,255,255,0.78)';
  const linkStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: '500', color: linkColor,
    textDecoration: 'none', letterSpacing: '0.01em', padding: '4px 0',
    borderBottom: '1px solid transparent', transition: 'color 0.15s, border-color 0.15s',
  };
  const hoverIn = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.color = 'white';
    el.style.borderBottomColor = GOLD;
  };
  const hoverOut = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.color = linkColor;
    el.style.borderBottomColor = 'transparent';
  };

  return (
    <nav style={{
      backgroundColor: navBg,
      position: isLanding ? 'fixed' : 'sticky',
      top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background-color 0.3s ease',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }} className="px-5 md:px-12">

        {/* Logo */}
        <Link to="/" style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '17px', fontWeight: '400', fontStyle: 'italic',
          color: 'white', textDecoration: 'none', letterSpacing: '-0.01em',
          flexShrink: 0, lineHeight: 1,
        }}>
          Pradera Verde
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/booking" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            Book Now
          </Link>
          <SmartHashLink hash="course" label="The Course" style={linkStyle} />
          <SmartHashLink hash="caddie" label="Caddie Notes" style={linkStyle} />
          <SmartHashLink hash="info" label="Plan Your Visit" style={linkStyle} />
          {currentUser && (
            <Link
              to={currentUser.role === 'golfer' ? '/my-reservations' : '/admin/reservations'}
              style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
            >
              Reservations
            </Link>
          )}
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3" style={{ flexShrink: 0 }}>
          {!currentUser ? (
            <>
              <Link to="/sign-in" style={{
                fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.65)',
                textDecoration: 'none', padding: '0 4px',
              }}>
                Sign In
              </Link>
              <Link to="/sign-up" style={{
                fontSize: '13px', fontWeight: '500', color: 'white',
                border: `1px solid ${GOLD}`, padding: '7px 18px',
                borderRadius: '4px', textDecoration: 'none',
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,168,76,0.12)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                Book a Round
              </Link>
            </>
          ) : (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '100px', padding: '5px 14px 5px 8px',
                  cursor: 'pointer', color: 'white',
                }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  backgroundColor: GREEN, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700',
                }}>
                  {currentUser.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown size={13} color="rgba(255,255,255,0.55)" />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  minWidth: '210px', backgroundColor: '#1C1C18',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  padding: '6px 0', zIndex: 100,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{currentUser.role === 'admin' ? 'Administrator' : 'Golfer'}</div>
                  </div>
                  {currentUser.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={menuItemStyle}>Admin Panel</Link>
                  )}
                  {currentUser.role === 'golfer' && (
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} style={menuItemStyle}>My Dashboard</Link>
                  )}
                  <Link to="/my-reservations" onClick={() => setUserMenuOpen(false)} style={menuItemStyle}>Reservations</Link>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '6px 0' }} />
                  <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#F08080', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'block' }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '6px' }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: BG_DARK, borderTop: '1px solid rgba(255,255,255,0.08)' }} className="md:hidden">
          <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { href: '/booking', label: 'Book Now' },
            ].map(l => (
              <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} style={mobileItemStyle}>{l.label}</Link>
            ))}
            {[
              { hash: 'course', label: 'The Course' },
              { hash: 'caddie', label: 'Caddie Notes' },
              { hash: 'info', label: 'Plan Your Visit' },
            ].map(l => (
              <SmartHashLink key={l.hash} hash={l.hash} label={l.label} style={mobileItemStyle} onClose={() => setMobileOpen(false)} />
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '12px', paddingTop: '16px' }}>
              {!currentUser ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/sign-in" onClick={() => setMobileOpen(false)} style={{ flex: 1, padding: '10px', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
                    Sign In
                  </Link>
                  <Link to="/sign-up" onClick={() => setMobileOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: GREEN, color: 'white', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', padding: '4px 0', marginBottom: '4px' }}>
                    {currentUser.name}
                  </div>
                  {currentUser.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} style={mobileItemStyle}>Admin Panel</Link>}
                  {currentUser.role === 'golfer' && <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={mobileItemStyle}>My Dashboard</Link>}
                  <Link to="/my-reservations" onClick={() => setMobileOpen(false)} style={mobileItemStyle}>Reservations</Link>
                  <button onClick={handleLogout} style={{ ...mobileItemStyle, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#F08080' }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'block', padding: '9px 16px', fontSize: '13px',
  color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
  transition: 'color 0.1s',
};

const mobileItemStyle: React.CSSProperties = {
  display: 'block', padding: '11px 4px', fontSize: '15px',
  color: 'rgba(255,255,255,0.78)', textDecoration: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};
