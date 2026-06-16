import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { StatusBadge, PaymentStateTag } from '../components/shared/StatusBadge';
import { StatusTimeline } from '../components/shared/StatusTimeline';
import { formatDate, formatTime, formatTimestamp } from '../utils';

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, getReservationById, cancelReservation } = useApp();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState('');

  if (!currentUser) {
    navigate('/sign-in');
    return null;
  }

  const reservation = id ? getReservationById(id) : undefined;

  if (!reservation) {
    return (
      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '12px' }}>
          Reservation not found
        </h1>
        <Link to="/my-reservations" style={{ color: '#2D5016', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
          ← Back to reservations
        </Link>
      </div>
    );
  }

  if (reservation.userId !== currentUser.id && currentUser.role !== 'admin') {
    navigate('/my-reservations');
    return null;
  }

  async function handleCancel() {
    if (!reservation) return;
    setCancelling(true);
    setCancelError('');
    try {
      await cancelReservation(reservation.id);
      setConfirmCancel(false);
    } catch {
      setCancelError('Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  const canCancel = reservation.status === 'pending' || reservation.status === 'approved';
  const canPay = reservation.status === 'approved' && reservation.paymentState === 'unpaid';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
      <Link to="/my-reservations" style={{ fontSize: '14px', color: '#6B6B67', textDecoration: 'none', marginBottom: '24px', display: 'inline-block' }}>
        ← My reservations
      </Link>

      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '8px' }}>
        {formatDate(reservation.preferredDate)} at {formatTime(reservation.preferredTime)}
      </h1>

      {/* Timeline */}
      <div style={{ margin: '28px 0', maxWidth: '600px' }}>
        <StatusTimeline status={reservation.status} />
      </div>

      <div style={{ borderTop: '1px solid #E5E3DF', paddingTop: '32px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {/* Left column */}
          <div>
            <Section title="Course">
              <p style={bodyStyle}>Pradera Verde Golf and Country Club</p>
              <p style={{ ...bodyStyle, color: '#6B6B67' }}>Clark, Pampanga, Philippines</p>
            </Section>

            <Section title="Date & Time">
              <Row label="Preferred date" value={formatDate(reservation.preferredDate)} />
              <Row label="Preferred time" value={formatTime(reservation.preferredTime)} />
              {reservation.alternateTime && (
                <Row label="Alternate time" value={formatTime(reservation.alternateTime)} />
              )}
            </Section>

            <Section title="Players">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {reservation.playerNames.map((name, i) => (
                  <li key={i} style={{ fontSize: '15px', color: '#4A4A46', lineHeight: '1.65', paddingBottom: '4px' }}>
                    <span style={{ color: '#6B6B67', marginRight: '8px', fontSize: '13px' }}>{i + 1}.</span>
                    {name}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Details">
              <Row label="Transportation" value={reservation.transportationNeeded ? 'Yes, needed' : 'Not needed'} />
              <Row label="Traveling from" value={reservation.cityFrom} />
              {reservation.customerNotes && (
                <div style={{ marginTop: '8px' }}>
                  <span style={labelStyle}>Notes</span>
                  <p style={{ ...bodyStyle, marginTop: '4px' }}>{reservation.customerNotes}</p>
                </div>
              )}
            </Section>

            <div style={{ fontSize: '12px', color: '#9B9B97', marginTop: '8px' }}>
              Submitted {formatTimestamp(reservation.createdAt)}
              {reservation.updatedAt !== reservation.createdAt && (
                <span> · Updated {formatTimestamp(reservation.updatedAt)}</span>
              )}
            </div>
          </div>

          {/* Right column */}
          <div>
            <div style={{ padding: '20px', border: '1px solid #E5E3DF', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={labelStyle}>Status</span>
                <div style={{ marginTop: '6px' }}>
                  <StatusBadge status={reservation.status} />
                </div>
              </div>
              <div>
                <span style={labelStyle}>Payment</span>
                <div style={{ marginTop: '6px' }}>
                  <PaymentStateTag state={reservation.paymentState} />
                </div>
              </div>
            </div>

            {reservation.customerFacingNote && (
              <div style={{
                padding: '16px 16px 16px 20px',
                backgroundColor: '#F8F7F4',
                borderLeft: '2px solid #C9A84C',
                borderRadius: '0 8px 8px 0',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '8px' }}>
                  Note from the course
                </p>
                <p style={{ fontSize: '14px', color: '#1A1A18', lineHeight: '1.65', margin: 0 }}>
                  {reservation.customerFacingNote}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {canPay && (
                <Link
                  to={`/payment/${reservation.id}`}
                  style={{
                    display: 'inline-block', padding: '10px 20px',
                    border: '1px solid #2D5016', color: '#2D5016',
                    borderRadius: '6px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: '500', textAlign: 'center',
                  }}
                >
                  Complete mock payment →
                </Link>
              )}

              {canCancel && !confirmCancel && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#A32D2D', padding: 0, textAlign: 'left' }}
                >
                  Cancel reservation
                </button>
              )}

              {confirmCancel && (
                <div style={{ padding: '14px', border: '1px solid #E5E3DF', borderRadius: '8px', backgroundColor: '#fff8f8' }}>
                  <p style={{ fontSize: '14px', color: '#1A1A18', marginBottom: '12px' }}>
                    Are you sure you want to cancel this reservation?
                  </p>
                  {cancelError && <p style={{ fontSize: '13px', color: '#A32D2D', marginBottom: '8px' }}>{cancelError}</p>}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleCancel} disabled={cancelling}
                      style={{ padding: '7px 16px', backgroundColor: '#A32D2D', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: cancelling ? 'not-allowed' : 'pointer' }}
                    >
                      {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      style={{ padding: '7px 16px', backgroundColor: 'white', color: '#1A1A18', border: '1px solid #E5E3DF', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Keep reservation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const bodyStyle: React.CSSProperties = {
  fontSize: '15px', color: '#4A4A46', lineHeight: '1.65', margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: '500',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F0EDE8' }}>
      <span style={{ fontSize: '14px', color: '#6B6B67' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#1A1A18', fontWeight: '500', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
    </div>
  );
}
