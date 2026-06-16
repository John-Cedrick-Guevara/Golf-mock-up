import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';

// Golf flag in hole on putting green — portrait orientation (Adrian Hernandez / Unsplash)
const BG_IMAGE = 'https://images.unsplash.com/photo-1627307884937-4a1d4f59064b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1080';

export function SignInPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.error || 'Sign in failed.');
    }
  }

  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: '100vh' }}>
      {/* Left column — full width on mobile */}
      <div className="w-full md:w-[55%]" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 56px) clamp(20px, 6vw, 64px)',
        backgroundColor: '#FFFFFF',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Link to="/" style={{
            display: 'block', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px',
            color: '#1A1A18', textDecoration: 'none', marginBottom: '48px',
          }}>
            Pradera Verde
          </Link>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '8px' }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: '14px', color: '#6B6B67', marginBottom: '36px' }}>
            Welcome back. Enter your credentials below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#1A1A18', marginBottom: '6px', fontWeight: '500' }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                style={{
                  width: '100%', height: '44px', padding: '0 12px',
                  border: '1px solid #E5E3DF', borderRadius: '8px',
                  fontSize: '15px', color: '#1A1A18', outline: 'none',
                  boxSizing: 'border-box', backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#1A1A18', marginBottom: '6px', fontWeight: '500' }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={{
                  width: '100%', height: '44px', padding: '0 12px',
                  border: '1px solid #E5E3DF', borderRadius: '8px',
                  fontSize: '15px', color: '#1A1A18', outline: 'none',
                  boxSizing: 'border-box', backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '14px', color: '#A32D2D', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                height: '44px', backgroundColor: loading ? '#5A7A3A' : '#2D5016',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '14px', backgroundColor: '#F8F7F4', borderRadius: '8px', border: '1px solid #E5E3DF' }}>
            <p style={{ fontSize: '11px', color: '#6B6B67', marginBottom: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Demo credentials — click to fill
            </p>
            {[
              { label: 'Golfer', email: 'juan@example.com', password: 'golfer123' },
              { label: 'Admin', email: 'admin@praderaverde.com', password: 'admin123' },
            ].map(cred => (
              <button
                key={cred.label}
                type="button"
                onClick={() => { setEmail(cred.email); setPassword(cred.password); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 10px', marginBottom: '6px',
                  backgroundColor: 'white', border: '1px solid #E5E3DF',
                  borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#2D5016'; el.style.backgroundColor = '#F4F9F0'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#E5E3DF'; el.style.backgroundColor = 'white'; }}
              >
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B6B67', minWidth: '44px' }}>{cred.label}</span>
                <span style={{ fontSize: '12px', color: '#4A4A46', fontFamily: "'JetBrains Mono', monospace" }}>{cred.email}</span>
                <span style={{ fontSize: '11px', color: '#9B9B97', marginLeft: '8px' }}>↑ click</span>
              </button>
            ))}
          </div>

          <p style={{ marginTop: '28px', fontSize: '14px', color: '#6B6B67' }}>
            Don't have an account?{' '}
            <Link to="/sign-up" style={{ color: '#2D5016', fontWeight: '500', textDecoration: 'none' }}>
              Create one
            </Link>
          </p>

          <p style={{ marginTop: '16px', fontSize: '13px', color: '#9B9B97' }}>
            Admin access is managed by the course team.
          </p>
        </div>
      </div>

      {/* Right column */}
      <div
        className="hidden md:flex"
        style={{
          flex: '0 0 45%', position: 'relative',
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(26,26,24,0.50)' }} />
        <div style={{
          position: 'relative', zIndex: 1, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px', textAlign: 'center',
        }}>
          <div>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 'normal',
              color: 'white', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '20px',
            }}>
              "The greens here are firm. Carry the middle and you'll be fine."
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.06em' }}>
              — Course walkthrough, Pradera Verde
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
