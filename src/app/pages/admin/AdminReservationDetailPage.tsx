import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PaymentStateTag } from '../../components/shared/StatusBadge';
import { formatDate, formatTime, formatTimestamp } from '../../utils';
import type { ReservationStatus } from '../../types';

export function AdminReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getReservationById, getUserById, updateReservationStatus,
    saveReservationNotes, getNotificationsForReservation,
  } = useApp();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ReservationStatus | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const reservation = id ? getReservationById(id) : undefined;

  useEffect(() => {
    if (reservation?.adminNotes) setAdminNotes(reservation.adminNotes);
    if (reservation?.customerFacingNote) setCustomerNote(reservation.customerFacingNote);
  }, [id]);

  if (!reservation) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ color: '#6B6B67', marginBottom: '16px' }}>Reservation not found.</p>
        <Link to="/admin/reservations" style={{ color: '#2D5016', fontSize: '14px', textDecoration: 'none' }}>
          ← Back to reservations
        </Link>
      </div>
    );
  }

  const user = getUserById(reservation.userId);
  const notifications = getNotificationsForReservation(reservation.id);

  async function handleAction(status: ReservationStatus) {
    if (!id) return;
    setActionLoading(status);
    await updateReservationStatus(id, status, adminNotes || undefined, customerNote || undefined);
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function handleSaveNotes() {
    if (!id) return;
    setNotesSaving(true);
    await saveReservationNotes(id, adminNotes, customerNote);
    setNotesSaving(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  const STATUS_ACTIONS: Array<{ status: ReservationStatus; label: string; show: boolean; color: string }> = [
    { status: 'approved', label: 'Approve', show: reservation.status === 'pending', color: '#2D5016' },
    { status: 'rejected', label: 'Reject', show: reservation.status === 'pending', color: '#A32D2D' },
    { status: 'completed', label: 'Mark Completed', show: reservation.status === 'approved', color: '#185FA5' },
    { status: 'cancelled', label: 'Cancel', show: reservation.status === 'pending' || reservation.status === 'approved', color: '#6B6B67' },
  ];

  return (
    <div>
      <Link to="/admin/reservations" style={{ fontSize: '13px', color: '#6B6B67', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
        ← All reservations
      </Link>

      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '28px' }}>
        Reservation — {formatDate(reservation.preferredDate)} at {formatTime(reservation.preferredTime)}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
        {/* Left: Full info */}
        <div>
          <InfoSection title="Golfer">
            <InfoRow label="Name" value={user?.name || 'Unknown'} />
            <InfoRow label="Email" value={user?.email || '—'} />
            <InfoRow label="Phone" value={user?.phone || '—'} />
            <InfoRow label="City from" value={reservation.cityFrom} />
          </InfoSection>

          <InfoSection title="Reservation">
            <InfoRow label="Course" value="Pradera Verde Golf and Country Club" />
            <InfoRow label="Date" value={formatDate(reservation.preferredDate)} />
            <InfoRow label="Preferred time" value={formatTime(reservation.preferredTime)} />
            {reservation.alternateTime && (
              <InfoRow label="Alternate time" value={formatTime(reservation.alternateTime)} />
            )}
          </InfoSection>

          <InfoSection title="Players">
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {reservation.playerNames.map((name, i) => (
                <li key={i} style={{ fontSize: '15px', color: '#4A4A46', lineHeight: '1.8' }}>{name}</li>
              ))}
            </ol>
          </InfoSection>

          <InfoSection title="Details">
            <InfoRow label="Transportation" value={reservation.transportationNeeded ? 'Yes' : 'No'} />
            {reservation.customerNotes && (
              <div style={{ marginTop: '8px' }}>
                <p style={labelStyle}>Customer notes</p>
                <p style={{ fontSize: '14px', color: '#4A4A46', lineHeight: '1.65', marginTop: '4px' }}>{reservation.customerNotes}</p>
              </div>
            )}
          </InfoSection>

          <div style={{ fontSize: '12px', color: '#9B9B97', marginTop: '4px' }}>
            Created {formatTimestamp(reservation.createdAt)} · Updated {formatTimestamp(reservation.updatedAt)}
          </div>
        </div>

        {/* Right: Action Panel */}
        <div>
          <div style={{ border: '1px solid #E5E3DF', borderRadius: '12px', backgroundColor: 'white', padding: '20px', marginBottom: '16px' }}>
            {/* Current status */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E5E3DF' }}>
              <div style={{ marginBottom: '8px' }}>
                <StatusBadge status={reservation.status} />
              </div>
              <div>
                <PaymentStateTag state={reservation.paymentState} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {STATUS_ACTIONS.filter(a => a.show).map(action => {
                const isConfirming = confirmAction === action.status;
                return (
                  <div key={action.status}>
                    {!isConfirming ? (
                      <button
                        onClick={() => setConfirmAction(action.status)}
                        style={{
                          width: '100%', height: '38px', borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                          cursor: 'pointer', border: '1px solid',
                          ...(action.status === 'approved'
                            ? { backgroundColor: '#2D5016', color: 'white', borderColor: '#2D5016' }
                            : { backgroundColor: 'white', color: action.color, borderColor: action.color }
                          ),
                        }}
                      >
                        {action.label}
                      </button>
                    ) : (
                      <div style={{ padding: '12px', border: '1px solid #E5E3DF', borderRadius: '8px', backgroundColor: '#FAFAFA' }}>
                        <p style={{ fontSize: '13px', color: '#1A1A18', marginBottom: '10px' }}>
                          Confirm: {action.label}?
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleAction(action.status)}
                            disabled={actionLoading === action.status}
                            style={{ flex: 1, height: '32px', backgroundColor: action.color, color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                          >
                            {actionLoading === action.status ? '…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmAction(null)}
                            style={{ flex: 1, height: '32px', backgroundColor: 'white', color: '#1A1A18', border: '1px solid #E5E3DF', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div style={{ borderTop: '1px solid #E5E3DF', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#1A1A18', marginBottom: '6px', fontWeight: '500' }}>
                  Internal note (admin only)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={e => { setAdminNotes(e.target.value); setNotesSaved(false); }}
                  rows={3}
                  placeholder="Notes visible only to admins…"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E3DF', borderRadius: '6px', fontSize: '13px', color: '#1A1A18', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#1A1A18', marginBottom: '6px', fontWeight: '500' }}>
                  Note to golfer
                </label>
                <textarea
                  value={customerNote}
                  onChange={e => { setCustomerNote(e.target.value); setNotesSaved(false); }}
                  rows={3}
                  placeholder="Visible to the golfer on their reservation page…"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E3DF', borderRadius: '6px', fontSize: '13px', color: '#1A1A18', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleSaveNotes} disabled={notesSaving}
                  style={{
                    padding: '8px 16px', border: '1px solid #2D5016', color: '#2D5016',
                    backgroundColor: 'white', borderRadius: '6px', fontSize: '13px',
                    fontWeight: '500', cursor: notesSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {notesSaving ? 'Saving…' : 'Save notes'}
                </button>
                {notesSaved && <span style={{ fontSize: '12px', color: '#2D5016' }}>Saved</span>}
              </div>
            </div>
          </div>

          {/* Notification log */}
          {notifications.length > 0 && (
            <div style={{ border: '1px solid #E5E3DF', borderRadius: '12px', backgroundColor: 'white', padding: '16px' }}>
              <p style={{ fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', marginBottom: '12px' }}>
                Notification log
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ fontSize: '12px', color: '#4A4A46', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <span>
                      <span style={{ color: '#1A1A18', fontWeight: '500', textTransform: 'capitalize' }}>{n.event.replace('_', ' ')}</span>
                      {' — '}{n.channel}
                    </span>
                    <span style={{ color: '#9B9B97', flexShrink: 0 }}>{formatTimestamp(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: '500',
};

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F0EDE8' }}>
      <span style={{ fontSize: '14px', color: '#6B6B67' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#1A1A18', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}
