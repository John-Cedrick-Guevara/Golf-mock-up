import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { formatDate, formatTime } from '../utils';

type PaymentMethod = 'online_banking' | 'mobile_banking' | 'cash';

export function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, getReservationById, confirmMockPayment } = useApp();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!currentUser || !id) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6B6B67' }}>Please sign in to access this page.</p>
        <Link to="/sign-in" style={{ color: '#2D5016', fontWeight: '500' }}>Sign In</Link>
      </div>
    );
  }

  const reservation = getReservationById(id);
  if (!reservation) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6B6B67' }}>Reservation not found.</p>
        <Link to="/my-reservations" style={{ color: '#2D5016', fontWeight: '500' }}>← Back</Link>
      </div>
    );
  }

  async function handleConfirm() {
    if (!method || !id) return;
    setLoading(true);
    await confirmMockPayment(id, method);
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    const updated = getReservationById(id);
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ padding: '24px', border: '1px solid #2D5016', borderRadius: '12px', backgroundColor: '#F4F9F0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D5016', flexShrink: 0 }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#2D5016', margin: 0 }}>
              Payment recorded (mock)
            </p>
          </div>
          <p style={{ fontSize: '14px', color: '#4A4A46', lineHeight: '1.65', margin: 0 }}>
            Your reservation is confirmed. This was a mock payment — no real money was charged.
          </p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment state</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '14px', color: '#2D5016', fontWeight: '500' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2D5016' }} />
            Paid (Mock)
          </div>
        </div>
        <Link to={`/my-reservations/${id}`} style={{ fontSize: '14px', color: '#2D5016', textDecoration: 'none', fontWeight: '500' }}>
          ← View reservation
        </Link>
      </div>
    );
  }

  const methodOptions: Array<{ key: PaymentMethod; label: string; sub: string }> = [
    { key: 'online_banking', label: 'Online Banking', sub: 'Transfer via BDO, BPI, or UnionBank. Mock reference number provided.' },
    { key: 'mobile_banking', label: 'Mobile Banking / GCash', sub: 'Pay via GCash or Maya. Mock QR shown.' },
    { key: 'cash', label: 'Cash on Site', sub: 'Pay at the pro shop on your day of play.' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Banner */}
      <div style={{
        padding: '14px 18px', backgroundColor: '#E8D5A0',
        border: '1px solid #C9A84C', borderRadius: '12px', marginBottom: '32px',
      }}>
        <p style={{ fontSize: '14px', color: '#7A5800', margin: 0, lineHeight: '1.6' }}>
          Simulation mode — no real payment will be processed.
        </p>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: '32px', padding: '20px', border: '1px solid #E5E3DF', borderRadius: '12px' }}>
        <p style={{ fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '12px' }}>
          Reservation Summary
        </p>
        <div style={{ fontSize: '15px', color: '#1A1A18', lineHeight: '1.8' }}>
          <div><span style={{ color: '#6B6B67', width: '120px', display: 'inline-block' }}>Course</span> Pradera Verde Golf and Country Club</div>
          <div><span style={{ color: '#6B6B67', width: '120px', display: 'inline-block' }}>Date</span> {formatDate(reservation.preferredDate)}</div>
          <div><span style={{ color: '#6B6B67', width: '120px', display: 'inline-block' }}>Time</span> {formatTime(reservation.preferredTime)}</div>
          <div><span style={{ color: '#6B6B67', width: '120px', display: 'inline-block' }}>Players</span> {reservation.playerNames.join(', ')}</div>
        </div>
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E5E3DF' }}>
          <span style={{ fontSize: '14px', color: '#1A1A18' }}>
            Reservation deposit: <strong>PHP 1,500 — MOCK</strong>
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A18', marginBottom: '16px' }}>
        Select payment method
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {methodOptions.map(opt => {
          const isSelected = method === opt.key;
          return (
            <div key={opt.key}>
              <label style={{
                display: 'flex', gap: '12px', padding: '16px',
                border: `1px solid ${isSelected ? '#2D5016' : '#E5E3DF'}`,
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: isSelected ? '#F4F9F0' : 'white',
              }}>
                <input
                  type="radio" name="paymentMethod"
                  checked={isSelected}
                  onChange={() => setMethod(opt.key)}
                  style={{ marginTop: '2px', accentColor: '#2D5016', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18', marginBottom: '4px' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B6B67' }}>{opt.sub}</div>
                </div>
              </label>

              {isSelected && (
                <div style={{ marginTop: '8px', padding: '14px 16px', backgroundColor: '#F8F7F4', borderRadius: '8px', fontSize: '14px', color: '#1A1A18' }}>
                  {opt.key === 'online_banking' && (
                    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
                      Mock account: BDO 1234-5678-9012 | Reference: MOCK-{id}
                    </code>
                  )}
                  {opt.key === 'mobile_banking' && (
                    <div>
                      <div style={{ width: '200px', height: '200px', backgroundColor: '#E5E3DF', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B6B67', textAlign: 'center', padding: '8px' }}>
                          Mock QR Code — not functional
                        </span>
                      </div>
                    </div>
                  )}
                  {opt.key === 'cash' && (
                    <span>
                      Please present your reservation ID at the clubhouse:{' '}
                      <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</code>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!method || loading}
        style={{
          width: '100%', height: '48px',
          backgroundColor: !method || loading ? '#8BA87A' : '#2D5016',
          color: 'white', border: 'none', borderRadius: '6px',
          fontSize: '15px', fontWeight: '500',
          cursor: !method || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing…' : 'Confirm mock payment'}
      </button>

      <div style={{ marginTop: '16px' }}>
        <Link to={`/my-reservations/${id}`} style={{ fontSize: '13px', color: '#6B6B67', textDecoration: 'none' }}>
          ← Back to reservation
        </Link>
      </div>
    </div>
  );
}
