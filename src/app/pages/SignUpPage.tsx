import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';

// Golf hole sitting in green grass (Scott Greer / Unsplash)
const BG_IMAGE = 'https://images.unsplash.com/photo-1751830188133-db2fd1d3a92f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1080';

export function SignUpPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await register({ name, email, password });
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Sign up failed.');
    }
  }

  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: '100vh' }}>
      <div className="w-full md:w-[55%]" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 56px) clamp(20px, 6vw, 64px)', backgroundColor: '#FFFFFF',
      }}
        className="w-full md:w-[55%]"
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Link to="/" style={{
            display: 'block', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px',
            color: '#1A1A18', textDecoration: 'none', marginBottom: '48px',
          }}>
            Pradera Verde
          </Link>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '8px' }}>
            Create an account
          </h1>
          <p style={{ fontSize: '14px', color: '#6B6B67', marginBottom: '36px' }}>
            Book tee times at Pradera Verde Golf and Country Club.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#1A1A18', marginBottom: '6px', fontWeight: '500' }}>
                Full name
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                required placeholder="Your full name"
                style={{
                  width: '100%', height: '44px', padding: '0 12px',
                  border: '1px solid #E5E3DF', borderRadius: '8px',
                  fontSize: '15px', color: '#1A1A18', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#1A1A18', marginBottom: '6px', fontWeight: '500' }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="At least 6 characters"
                style={{
                  width: '100%', height: '44px', padding: '0 12px',
                  border: '1px solid #E5E3DF', borderRadius: '8px',
                  fontSize: '15px', color: '#1A1A18', outline: 'none',
                  boxSizing: 'border-box',
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '28px', fontSize: '14px', color: '#6B6B67' }}>
            Already have an account?{' '}
            <Link to="/sign-in" style={{ color: '#2D5016', fontWeight: '500', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

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
          alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center',
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
