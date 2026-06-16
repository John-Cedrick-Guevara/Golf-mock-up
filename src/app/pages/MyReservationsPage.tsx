import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { StatusBadge, PaymentStateTag } from '../components/shared/StatusBadge';
import { formatDate, formatTime, isUpcoming } from '../utils';

export function MyReservationsPage() {
  const { currentUser, getMyReservations } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '12px' }}>
          Sign in required
        </h1>
        <p style={{ fontSize: '15px', color: '#6B6B67', marginBottom: '28px' }}>
          Please sign in to view your reservations.
        </p>
        <Link to="/sign-in" style={{
          display: 'inline-block', padding: '12px 28px',
          backgroundColor: '#2D5016', color: 'white',
          borderRadius: '6px', textDecoration: 'none', fontSize: '15px', fontWeight: '500',
        }}>
          Sign In
        </Link>
      </div>
    );
  }

  const allReservations = getMyReservations();
  const upcoming = allReservations.filter(r =>
    isUpcoming(r.preferredDate) && r.status !== 'cancelled' && r.status !== 'rejected' && r.status !== 'completed'
  );
  const past = allReservations.filter(r =>
    !isUpcoming(r.preferredDate) || r.status === 'cancelled' || r.status === 'rejected' || r.status === 'completed'
  );

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '32px' }}>
        My Reservations
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #E5E3DF', marginBottom: '28px' }}>
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past', label: `Past (${past.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'upcoming' | 'past')}
            style={{
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '500',
              color: activeTab === tab.key ? '#1A1A18' : '#6B6B67',
              borderBottom: activeTab === tab.key ? '2px solid #C9A84C' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: '#6B6B67', marginBottom: '20px' }}>
            {activeTab === 'upcoming'
              ? 'You have no upcoming reservations. Book a tee time to get started.'
              : 'No past reservations found.'}
          </p>
          {activeTab === 'upcoming' && (
            <Link to="/booking" style={{
              display: 'inline-block', padding: '10px 24px',
              backgroundColor: '#2D5016', color: 'white',
              borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
            }}>
              Book a Tee Time
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block" style={{ border: '1px solid #E5E3DF', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F7F4', borderBottom: '1px solid #E5E3DF' }}>
                  {['Date', 'Time', 'Course', 'Players', 'Status', 'Payment', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(res => (
                  <tr key={res.id} style={{ borderBottom: '1px solid #E5E3DF' }}>
                    <td style={{ padding: '14px 16px', color: '#1A1A18', fontWeight: '500' }}>
                      {formatDate(res.preferredDate, 'short')}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#4A4A46' }}>
                      {formatTime(res.preferredTime)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#4A4A46' }}>Pradera Verde</td>
                    <td style={{ padding: '14px 16px', color: '#4A4A46' }}>{res.playerNames.length}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={res.status} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <PaymentStateTag state={res.paymentState} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link to={`/my-reservations/${res.id}`} style={{ fontSize: '13px', color: '#2D5016', textDecoration: 'none', fontWeight: '500' }}>
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayed.map(res => (
              <div key={res.id} style={{ border: '1px solid #E5E3DF', borderRadius: '12px', padding: '16px', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18' }}>
                      {formatDate(res.preferredDate, 'medium')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B6B67' }}>{formatTime(res.preferredTime)}</div>
                  </div>
                  <StatusBadge status={res.status} />
                </div>
                <div style={{ fontSize: '13px', color: '#6B6B67', marginBottom: '12px' }}>
                  {res.playerNames.length} player{res.playerNames.length > 1 ? 's' : ''} · <PaymentStateTag state={res.paymentState} />
                </div>
                <Link to={`/my-reservations/${res.id}`} style={{ fontSize: '13px', color: '#2D5016', textDecoration: 'none', fontWeight: '500' }}>
                  View details →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
