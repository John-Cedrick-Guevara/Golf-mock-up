import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// Hero: wide shot of golfer mid-swing on lush fairway (Andrew Rice / Unsplash)
const HERO_BG = 'https://images.unsplash.com/photo-1509586721451-a990371f8243?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600';
// About col 1: aerial view of golf course with pond
const ABOUT_IMG_1 = 'https://images.unsplash.com/photo-1775686318424-9987122d8402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900';
// About col 2: golf ball close-up on green
const ABOUT_IMG_2 = 'https://images.unsplash.com/photo-1621005569855-3a304a19198a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900';

const SERIF = "'Playfair Display', Georgia, serif";
const BG_DARK = '#141410';
const GOLD = '#C9A84C';
const GREEN = '#2D5016';

const FRONT_9 = [
  { hole: 1, yards: 349, hcp: 'H11' }, { hole: 2, yards: 170, hcp: 'H17' },
  { hole: 3, yards: 554, hcp: 'H1' }, { hole: 4, yards: 418, hcp: 'H5' },
  { hole: 5, yards: 405, hcp: 'H9' }, { hole: 6, yards: 446, hcp: 'H3' },
  { hole: 7, yards: 372, hcp: 'H13' }, { hole: 8, yards: 148, hcp: 'H15' },
  { hole: 9, yards: 536, hcp: 'H7' },
];
const BACK_9 = [
  { hole: 10, yards: 338, hcp: 'H12' }, { hole: 11, yards: 174, hcp: 'H18' },
  { hole: 12, yards: 486, hcp: 'H14' }, { hole: 13, yards: 376, hcp: 'H2' },
  { hole: 14, yards: 398, hcp: 'H6' }, { hole: 15, yards: 161, hcp: 'H16' },
  { hole: 16, yards: 383, hcp: 'H4' }, { hole: 17, yards: 295, hcp: 'H10' },
  { hole: 18, yards: 547, hcp: 'H8' },
];
const WALKTHROUGH = [
  { hole: 1, yards: 349, tip: 'Safe drive at 230y. Aim left of center on approach — sets up an uphill putt.' },
  { hole: 2, yards: 170, tip: '180y to the middle of the green. Left center avoids bunkers and leaves an uphill putt.' },
  { hole: 3, yards: 554, tip: 'Keep water completely out of play. Hit 200y off the tee, then lay up carefully — water extends far left on the second shot.' },
  { hole: 4, yards: 418, tip: 'Drive to 260y max. Avoid going over the green — front pin position leaves an easier up-and-down.' },
  { hole: 5, yards: 405, tip: 'Uphill tee box — play 200y straight to leave 130–140y on the approach.' },
  { hole: 6, yards: 446, tip: 'Drive 230y max. Aim left center on approach — water right, two bunkers guard the green.' },
  { hole: 7, yards: 372, tip: 'Trust the yardage. Aim right of the bunker off the tee. Right side of the green gives the better putt.' },
  { hole: 8, yards: 148, tip: 'Avoid the right side at all costs.' },
  { hole: 9, yards: 536, tip: 'Lay up 160–170y for ~150y in. Aim right — trouble on the left, severe uphill on the front left of the green.' },
  { hole: 10, yards: 338, tip: 'Aim past the left bunker off the tee. Right side of the green leaves an uphill putt.' },
  { hole: 11, yards: 174, tip: 'Play short if unsure — bunkers guard the green. Front left gives an uphill putt.' },
  { hole: 12, yards: 486, tip: 'Straightforward par 5. Never go over the green — not even slightly.' },
  { hole: 13, yards: 376, tip: 'Drive 220y max. Avoid the left side of the green — downhill putt is difficult from there.' },
  { hole: 14, yards: 398, tip: 'At 220y off the tee, ~140–150y remains. Aim at the front of the green — back putts are harder.' },
  { hole: 15, yards: 161, tip: 'Aim slightly left — a big bunker guards the right.' },
  { hole: 16, yards: 383, tip: 'Long hitters carry 230–250y past the left bunker. Creek is in play on the right.' },
  { hole: 17, yards: 295, tip: 'Short hole, well-guarded greens. Play conservative for a manageable par or bogey.' },
  { hole: 18, yards: 547, tip: 'Island green — play the middle. Going over means a very difficult recovery with bunkers and water surrounding.' },
];

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const INNER: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px)' };
const SEC_PAD = 'clamp(64px, 8vw, 96px) 0';

export function LandingPage() {
  const navigate = useNavigate();
  const [checkDate, setCheckDate] = useState('');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 200);
  }, []);

  return (
    <div style={{ backgroundColor: '#FFFFFF', overflowX: 'hidden' }}>

      {/* ──────────────────────────── HERO ──────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: '640px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover', backgroundPosition: 'center 35%',
        }} />
        {/* Layered gradient — strong left to transparent right, plus bottom vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'linear-gradient(105deg, rgba(10,10,8,0.90) 0%, rgba(10,10,8,0.55) 48%, rgba(10,10,8,0.10) 100%)',
            'linear-gradient(to top, rgba(10,10,8,0.60) 0%, transparent 40%)',
          ].join(', '),
        }} />

        {/* Top meta row */}
        <div style={{ position: 'absolute', top: '80px', left: 0, right: 0 }}>
          <div style={{ ...INNER, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hidden md:flex">
            <span style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: '500' }}>
              Pradera Verde · Clark, Pampanga
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              18 Holes · Par 72 · 6,156 Yards
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ ...INNER, paddingTop: '64px' }}>
            <div style={{ maxWidth: '580px' }}>
              <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: '500', marginBottom: '18px' }}>
                Championship Golf
              </p>
              <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(44px, 6.5vw, 76px)', fontWeight: '400', color: 'white', letterSpacing: '-0.025em', lineHeight: '1.07', margin: '0 0 24px' }}>
                The Course<br />
                <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.82)' }}>Awaits You.</em>
              </h1>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 16px)', color: 'rgba(255,255,255,0.60)', lineHeight: '1.7', marginBottom: '36px', maxWidth: '400px' }}>
                18 holes of championship golf in the heart of Pampanga. Precision, patience, and course management — all tested here.
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
                <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '48px', padding: '0 28px', backgroundColor: GREEN, color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  Book a Tee Time →
                </Link>
                <button onClick={() => document.getElementById('course')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ height: '48px', padding: '0 22px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.80)', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>
                  The Course ↓
                </button>
              </div>
              {/* Date quick-check */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="date" value={checkDate} onChange={e => setCheckDate(e.target.value)}
                  style={{ height: '38px', padding: '0 12px', backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '4px', fontSize: '13px', color: 'white', outline: 'none', colorScheme: 'dark' }} />
                <button onClick={() => navigate(checkDate ? `/booking?date=${checkDate}` : '/booking')}
                  style={{ height: '38px', padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '1px', height: '44px', backgroundColor: 'rgba(255,255,255,0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '100%', backgroundColor: 'rgba(255,255,255,0.55)', animation: 'scrollBar 2s ease-in-out infinite', height: '40%' }} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────── STATS ──────────────────────────── */}
      <div style={{ backgroundColor: BG_DARK }}>
        <div style={INNER}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { n: '18', l: 'Holes' }, { n: '72', l: 'Par' },
              { n: '6,156', l: 'Total Yards' }, { n: '<24h', l: 'Confirmation Time' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '26px 20px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: '28px', color: GOLD, lineHeight: 1, marginBottom: '5px' }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────── ABOUT ──────────────────────────── */}
      <section id="course" style={{ padding: SEC_PAD, backgroundColor: '#FFFFFF' }}>
        <div style={INNER}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <span style={{ display: 'inline-block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '500', color: '#6B6B67', border: '1px solid #D5D2CB', padding: '5px 16px', borderRadius: '20px', marginBottom: '18px' }}>
                The Course
              </span>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 3.2vw, 36px)', fontWeight: '400', color: '#1A1A18', letterSpacing: '-0.02em', lineHeight: '1.25', maxWidth: '560px', margin: '0 auto' }}>
                Championship golf carved through the highlands of Pampanga.
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '24px', alignItems: 'start' }}>
            <FadeUp delay={0}>
              <div style={{ borderRadius: '4px', overflow: 'hidden' }}>
                <ImageWithFallback src={ABOUT_IMG_1} alt="Aerial view of Pradera Verde"
                  style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }} />
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="md:mt-12" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                <ImageWithFallback src={ABOUT_IMG_2} alt="Golf green at Pradera Verde"
                  style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }} />
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div style={{ paddingLeft: '16px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {[
                  { label: 'The Layout', body: '18 holes of championship golf, 6,156 yards from the blue tees. Water hazards, elevated greens, and firm putting surfaces reward precision and patience.' },
                  { label: 'Our Promise', body: 'Every reservation is personally reviewed by the course team and confirmed within 24 hours.' },
                ].map(b => (
                  <div key={b.label}>
                    <div style={{ width: '28px', height: '2px', backgroundColor: GOLD, marginBottom: '14px' }} />
                    <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500', marginBottom: '10px' }}>{b.label}</p>
                    <p style={{ fontSize: '14px', color: '#4A4A46', lineHeight: '1.75' }}>{b.body}</p>
                  </div>
                ))}
                <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 22px', backgroundColor: GREEN, color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '13px', fontWeight: '500', width: 'fit-content' }}>
                  Book a Tee Time →
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ──────────────────────────── SCORECARD (dark) ──────────────────────────── */}
      <section style={{ backgroundColor: BG_DARK, padding: SEC_PAD }}>
        <div style={INNER}>
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '40px 64px', alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '500', marginBottom: '16px' }}>Blue Tees</p>
                <h2 style={{ fontFamily: SERIF, fontSize: '38px', fontWeight: '400', color: 'white', letterSpacing: '-0.02em', marginBottom: '28px', lineHeight: 1.1 }}>
                  18 Holes.<br />Par 72.
                </h2>
                <div style={{ display: 'flex', gap: '0', marginBottom: '36px' }}>
                  {[['Front 9', '2,998 yds'], ['Back 9', '3,158 yds'], ['Total', '6,156 yds']].map(([l, v], i) => (
                    <div key={i} style={{ flex: 1, paddingRight: i < 2 ? '18px' : 0, marginRight: i < 2 ? '18px' : 0, borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{l}</div>
                      <div style={{ fontFamily: SERIF, fontSize: '16px', color: GOLD }}>{v}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7', maxWidth: '320px' }}>
                  Strategic bunkering, water in play on six holes, and green speeds that reward patient approach play.
                </p>
              </div>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['Hole', 'Yds', 'HCP'].map(h => (
                        <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: '10px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FRONT_9.map((r, i) => (
                      <tr key={r.hole} style={{ opacity: i % 2 === 0 ? 1 : 0.62 }}>
                        <td style={{ padding: '5px 10px', color: 'rgba(255,255,255,0.88)' }}>H{r.hole}</td>
                        <td style={{ padding: '5px 10px', color: 'rgba(255,255,255,0.88)' }}>{r.yards}</td>
                        <td style={{ padding: '5px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{r.hcp}</td>
                      </tr>
                    ))}
                    <tr><td colSpan={3} style={{ padding: '5px 10px', fontSize: '10px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Back 9</td></tr>
                    {BACK_9.map((r, i) => (
                      <tr key={r.hole} style={{ opacity: i % 2 === 0 ? 1 : 0.62 }}>
                        <td style={{ padding: '5px 10px', color: 'rgba(255,255,255,0.88)' }}>H{r.hole}</td>
                        <td style={{ padding: '5px 10px', color: 'rgba(255,255,255,0.88)' }}>{r.yards}</td>
                        <td style={{ padding: '5px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{r.hcp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ──────────────────────────── CADDIE NOTES ──────────────────────────── */}
      <section id="caddie" style={{ backgroundColor: '#F8F7F4', padding: SEC_PAD }}>
        <div style={INNER}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '500', marginBottom: '12px' }}>Caddie Notes</p>
              <h2 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: '400', color: '#1A1A18', letterSpacing: '-0.02em', marginBottom: '8px' }}>Playing Pradera Verde</h2>
              <p style={{ fontSize: '13px', color: '#9B9B97' }}>Course walkthrough by Jerboa Go · All yardages from blue tees</p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '0 52px' }}>
            {[WALKTHROUGH.slice(0, 9), WALKTHROUGH.slice(9)].map((col, ci) => (
              <div key={ci}>
                {col.map((h, i) => (
                  <FadeUp key={h.hole} delay={i * 0.02}>
                    <div style={{ padding: '16px 0', borderBottom: '1px solid #E5E3DF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div style={{ width: '20px', height: '1.5px', backgroundColor: GOLD, flexShrink: 0 }} />
                        <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500', margin: 0 }}>
                          Hole {h.hole} — {h.yards} yds
                        </p>
                      </div>
                      <p style={{ fontSize: '14px', color: '#4A4A46', lineHeight: '1.65', margin: 0, paddingLeft: '30px' }}>{h.tip}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── PRACTICAL INFO ──────────────────────────── */}
      <section id="info" style={{ backgroundColor: '#FFFFFF', padding: SEC_PAD }}>
        <div style={INNER}>
          <FadeUp>
            <div style={{ marginBottom: '44px' }}>
              <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '500', marginBottom: '12px' }}>Plan Your Visit</p>
              <h2 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: '400', color: '#1A1A18', letterSpacing: '-0.02em' }}>Everything you need to know.</h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '40px 48px' }}>
            {[
              { label: 'Getting There', highlight: true, items: ['Pradera Verde Golf and Country Club', 'Clark, Pampanga, Philippines'], link: { href: 'https://maps.google.com/?q=Pradera+Verde+Golf+Clark+Pampanga', text: 'Open in Google Maps →' } },
              { label: 'Fees & Requirements', items: ['Green fee includes caddie service.', 'Caddie fee: PHP 500–600.', 'Visitors must carry a valid passport.', 'Lost passport fee: PHP 3,000.'] },
              { label: 'On the Course', items: ['Bring your own water and snacks — tee house food is limited.', 'Use an umbrella — open course, all weather.', 'Greens are firm: always carry the middle.', 'Sand is wet and heavy — add yardage.'] },
            ].map((col, i) => (
              <FadeUp key={col.label} delay={i * 0.07}>
                <div>
                  <div style={{ borderTop: `2px solid ${col.highlight ? GOLD : '#E5E3DF'}`, paddingTop: '16px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500', margin: 0 }}>{col.label}</p>
                  </div>
                  {col.items.map((item, j) => <p key={j} style={{ fontSize: '14px', color: '#4A4A46', lineHeight: '1.7', marginBottom: '3px' }}>{item}</p>)}
                  {col.link && <a href={col.link.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: GREEN, textDecoration: 'none', fontWeight: '500', display: 'inline-block', marginTop: '12px' }}>{col.link.text}</a>}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── CTA ──────────────────────────── */}
      <section style={{ backgroundColor: BG_DARK, padding: SEC_PAD }}>
        <div style={{ ...INNER, textAlign: 'center' }}>
          <FadeUp>
            <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: '500', marginBottom: '18px' }}>Ready to play?</p>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.8vw, 44px)', fontWeight: '400', color: 'white', letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: 1.15 }}>
              Book your round at<br />Pradera Verde.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7', marginBottom: '36px', maxWidth: '440px', margin: '0 auto 36px' }}>
              Check available tee times online. Confirmed within 24 hours by the course team.
            </p>
            <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', backgroundColor: GREEN, color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Book a Tee Time →
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#090908', padding: '24px' }}>
        <div style={{ ...INNER, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontFamily: SERIF, fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>Pradera Verde</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.18)' }}>© {new Date().getFullYear()} Pradera Verde Golf and Country Club · Clark, Pampanga</span>
        </div>
      </footer>

      <style>{`
        @keyframes scrollBar {
          0% { top: -40%; }
          100% { top: 140%; }
        }
      `}</style>
    </div>
  );
}
