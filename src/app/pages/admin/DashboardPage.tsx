import { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PaymentStateTag } from '../../components/shared/StatusBadge';
import { formatDate, formatTime } from '../../utils';
import type { ReservationStatus } from '../../types';

const SERIF = "'Playfair Display', Georgia, serif";
const BORDER = '#E5E3DF';

export function DashboardPage() {
  const { reservations, scheduleBlocks, getDashboardMetrics, getUserById, updateReservationStatus } = useApp();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const metrics = getDashboardMetrics();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const pending = [...reservations]
    .filter(r => r.status === 'pending')
    .sort((a, b) => a.createdAt - b.createdAt);

  const todayConfirmed = reservations.filter(r =>
    r.preferredDate === todayStr && (r.status === 'approved' || r.status === 'completed')
  ).sort((a, b) => a.preferredTime.localeCompare(b.preferredTime));

  const upcomingBlocks = scheduleBlocks
    .filter(b => new Date(b.startDate + 'T00:00:00') >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  const REASON_LABELS: Record<string, string> = {
    tournament: 'Tournament', maintenance: 'Maintenance',
    private_event: 'Private Event', holiday: 'Holiday', other: 'Other',
  };

  async function handleAction(id: string, status: ReservationStatus) {
    setActionLoading(id + status);
    await updateReservationStatus(id, status);
    setActionLoading(null);
  }

  return (
    <div>
      {/* Stat row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        backgroundColor: 'white', border: `1px solid ${BORDER}`, borderRadius: '4px',
        marginBottom: '32px', overflow: 'hidden',
      }}>
        {[
          { label: 'Pending Today', value: metrics.pendingToday },
          { label: 'Approved This Week', value: metrics.approvedThisWeek },
          { label: 'Active Slots', value: metrics.activeSlots },
          { label: 'Upcoming Blocks', value: metrics.upcomingBlocks },
        ].map((m, i) => (
          <div key={m.label} style={{
            padding: '20px 24px',
            borderRight: i < 3 ? `1px solid ${BORDER}` : 'none',
          }}>
            <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '6px' }}>
              {m.label}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: '32px', color: '#1A1A18', margin: 0, lineHeight: 1 }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Left: Pending reservations */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '400', color: '#1A1A18' }}>
                Awaiting Approval
              </h2>
              {pending.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: '500', color: '#B07D1A',
                  backgroundColor: '#FFF8E7', border: '1px solid #E8D5A0',
                  borderRadius: '12px', padding: '2px 8px',
                }}>
                  {pending.length}
                </span>
              )}
            </div>
            <Link to="/admin/reservations" style={{ fontSize: '13px', color: '#2D5016', textDecoration: 'none', fontWeight: '500' }}>
              View all →
            </Link>
          </div>

          <div style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', overflowX: 'auto', backgroundColor: 'white' }}>
            {pending.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B6B67', fontSize: '14px' }}>
                No pending reservations.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Golfer', 'Date', 'Time', 'Players', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map((res, i) => {
                    const user = getUserById(res.userId);
                    const isEven = i % 2 === 0;
                    return (
                      <tr key={res.id} style={{
                        borderBottom: `1px solid ${BORDER}`,
                        backgroundColor: isEven ? 'white' : '#FAFAF8',
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F1EC'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isEven ? 'white' : '#FAFAF8'}
                      >
                        <td style={{ padding: '13px 14px', color: '#1A1A18', fontWeight: '500' }}>
                          {user?.name || 'Unknown'}
                        </td>
                        <td style={{ padding: '13px 14px', color: '#4A4A46', whiteSpace: 'nowrap' }}>
                          {formatDate(res.preferredDate, 'short')}
                        </td>
                        <td style={{ padding: '13px 14px', color: '#4A4A46', whiteSpace: 'nowrap' }}>
                          {formatTime(res.preferredTime)}
                        </td>
                        <td style={{ padding: '13px 14px', color: '#4A4A46', textAlign: 'center' }}>
                          {res.playerNames.length}
                        </td>
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleAction(res.id, 'approved')}
                              disabled={!!actionLoading}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#2D5016', fontWeight: '500', padding: 0, opacity: actionLoading === res.id + 'approved' ? 0.5 : 1 }}>
                              {actionLoading === res.id + 'approved' ? '…' : 'Approve'}
                            </button>
                            <button onClick={() => handleAction(res.id, 'rejected')}
                              disabled={!!actionLoading}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#A32D2D', fontWeight: '500', padding: 0, opacity: actionLoading === res.id + 'rejected' ? 0.5 : 1 }}>
                              {actionLoading === res.id + 'rejected' ? '…' : 'Reject'}
                            </button>
                            <Link to={`/admin/reservations/${res.id}`} style={{ fontSize: '12px', color: '#6B6B67', textDecoration: 'none' }}>
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Today at a glance */}
        <div>
          <h2 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: '400', color: '#1A1A18', marginBottom: '14px' }}>
            Today at a Glance
          </h2>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>
                Confirmed tee times today
              </p>
            </div>
            {todayConfirmed.length === 0 ? (
              <div style={{ padding: '20px 16px', color: '#6B6B67', fontSize: '13px' }}>
                No confirmed tee times today.
              </div>
            ) : (
              <div>
                {todayConfirmed.map((res, i) => {
                  const user = getUserById(res.userId);
                  return (
                    <div key={res.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                      borderBottom: i < todayConfirmed.length - 1 ? `1px solid ${BORDER}` : 'none',
                    }}>
                      <span style={{
                        fontSize: '12px', fontWeight: '500', color: '#2D5016',
                        backgroundColor: '#F0F6EA', padding: '3px 8px', borderRadius: '3px', flexShrink: 0,
                      }}>
                        {formatTime(res.preferredTime)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: '#1A1A18', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B6B67' }}>{res.playerNames.length}p</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming blocks */}
          {upcomingBlocks.length > 0 && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>
                  Upcoming schedule blocks
                </p>
              </div>
              {upcomingBlocks.map((block, i) => (
                <div key={block.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: i < upcomingBlocks.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: '13px', color: '#1A1A18' }}>
                    {formatDate(block.startDate, 'short')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B6B67' }}>
                    {REASON_LABELS[block.reason] || block.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
