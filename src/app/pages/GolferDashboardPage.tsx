import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatDate, formatTime, formatTimestamp, isUpcoming } from '../utils';

const SERIF = "'Playfair Display', Georgia, serif";
const GOLD = '#C9A84C';
const BORDER = '#E5E3DF';
const GREEN = '#2D5016';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function GolferDashboardPage() {
  const { currentUser, getMyReservations, notifications } = useApp();

  if (!currentUser) return null;

  const allReservations = getMyReservations();
  const upcoming = allReservations
    .filter(r => isUpcoming(r.preferredDate) && r.status !== 'cancelled' && r.status !== 'rejected')
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate))
    .slice(0, 3);

  const myNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const firstName = currentUser.name.split(' ')[0];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const EVENT_LABELS: Record<string, string> = {
    submitted: 'Reservation submitted',
    approved: 'Reservation approved',
    rejected: 'Reservation rejected',
    cancelled: 'Reservation cancelled',
    payment_confirmed: 'Payment confirmed',
  };

  return (
    <div style={{ backgroundColor: '#F8F7F4', minHeight: '100vh', paddingTop: '60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: '400', color: '#1A1A18', marginBottom: '4px' }}>
            {getGreeting()}, {firstName}.
          </h1>
          <p style={{ fontSize: '13px', color: '#6B6B67' }}>{today}</p>
        </div>

        {/* Upcoming Reservations */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500', marginBottom: '16px' }}>
            Upcoming
          </p>

          {upcoming.length === 0 ? (
            <div style={{ padding: '24px 20px', border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white' }}>
              <p style={{ fontSize: '15px', color: '#6B6B67', marginBottom: '12px' }}>
                No upcoming tee times.
              </p>
              <Link to="/booking" style={{ fontSize: '14px', color: GREEN, textDecoration: 'none', fontWeight: '500' }}>
                Book a round →
              </Link>
            </div>
          ) : (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden' }}>
              {upcoming.map((res, i) => {
                const date = new Date(res.preferredDate + 'T00:00:00');
                return (
                  <div key={res.id} style={{
                    padding: '14px 16px',
                    borderBottom: i < upcoming.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}>
                    {/* Top row: date + status + link */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '40px' }}>
                          <div style={{ fontFamily: SERIF, fontSize: '18px', color: '#1A1A18', lineHeight: 1 }}>
                            {date.getDate()}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6B6B67' }}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                        <div style={{ width: '1px', height: '28px', backgroundColor: BORDER }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18' }}>
                            Pradera Verde — {formatTime(res.preferredTime)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B6B67', marginTop: '1px' }}>
                            {res.playerNames.length} player{res.playerNames.length > 1 ? 's' : ''} · {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StatusBadge status={res.status} />
                        <Link to={`/my-reservations/${res.id}`} style={{ fontSize: '13px', color: GREEN, textDecoration: 'none', fontWeight: '500' }}>
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '36px' }}>
          <div style={{ padding: '24px', border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white' }}>
            <h3 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '400', color: '#1A1A18', marginBottom: '8px' }}>
              Book a Tee Time
            </h3>
            <p style={{ fontSize: '13px', color: '#6B6B67', lineHeight: '1.6', marginBottom: '18px' }}>
              Check available slots at Pradera Verde and submit a reservation.
            </p>
            <Link to="/booking" style={{
              display: 'inline-block', height: '44px', padding: '0 24px', lineHeight: '44px',
              backgroundColor: GREEN, color: 'white', borderRadius: '4px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '500',
            }}>
              Book Now →
            </Link>
          </div>

          <div style={{ padding: '24px', border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white' }}>
            <h3 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '400', color: '#1A1A18', marginBottom: '8px' }}>
              View All Reservations
            </h3>
            <p style={{ fontSize: '13px', color: '#6B6B67', lineHeight: '1.6', marginBottom: '18px' }}>
              Review upcoming and past tee times, track status, and manage payments.
            </p>
            <Link to="/my-reservations" style={{
              display: 'inline-block', height: '44px', padding: '0 24px', lineHeight: '44px',
              border: `1px solid ${GREEN}`, color: GREEN, borderRadius: '4px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '500',
            }}>
              View All →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <p style={{ fontSize: '11px', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500', marginBottom: '16px' }}>
            Recent Activity
          </p>

          {myNotifications.length === 0 ? (
            <div style={{ padding: '20px', border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white' }}>
              <p style={{ fontSize: '14px', color: '#6B6B67' }}>No recent activity.</p>
            </div>
          ) : (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden' }}>
              {myNotifications.map((n, i) => {
                const res = allReservations.find(r => r.id === n.reservationId);
                return (
                  <div key={n.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom: i < myNotifications.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6B6B67', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', color: '#1A1A18' }}>
                        {EVENT_LABELS[n.event] || n.event}
                        {res && <span style={{ color: '#6B6B67' }}> — {formatDate(res.preferredDate, 'short')}</span>}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9B9B97', flexShrink: 0, marginLeft: '16px' }}>
                      {formatTimestamp(n.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
