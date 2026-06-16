import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTimestamp } from '../../utils';
import type { NotificationEvent, NotificationChannel, NotificationStatus } from '../../types';

const EVENT_LABELS: Record<NotificationEvent, string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  payment_confirmed: 'Payment Confirmed',
};

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  in_app: 'In-App',
};

const STATUS_CONFIG: Record<NotificationStatus, { label: string; color: string }> = {
  queued: { label: 'Queued', color: '#B07D1A' },
  sent_mock: { label: 'Sent (mock)', color: '#2D5016' },
  failed: { label: 'Failed', color: '#A32D2D' },
};

export function NotificationsPage() {
  const { notifications, getUserById, getReservationById } = useApp();
  const [eventFilter, setEventFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = notifications.filter(n => {
    if (eventFilter && n.event !== eventFilter) return false;
    if (channelFilter && n.channel !== channelFilter) return false;
    if (statusFilter && n.status !== statusFilter) return false;
    if (dateFilter) {
      const d = new Date(n.createdAt).toISOString().split('T')[0];
      if (d !== dateFilter) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '4px' }}>
          Notification Log
        </h1>
        <p style={{ fontSize: '13px', color: '#6B6B67' }}>
          All reservation status notifications sent to golfers. Mock delivery only for MVP.
        </p>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
          style={selectStyle}>
          <option value="">All events</option>
          {(Object.entries(EVENT_LABELS) as Array<[NotificationEvent, string]>).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>

        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)}
          style={selectStyle}>
          <option value="">All channels</option>
          {(Object.entries(CHANNEL_LABELS) as Array<[NotificationChannel, string]>).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={selectStyle}>
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="sent_mock">Sent (mock)</option>
          <option value="failed">Failed</option>
        </select>

        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={selectStyle} />
      </div>

      <div style={{ border: '1px solid #E5E3DF', borderRadius: '8px', overflowX: 'auto', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F7F4', borderBottom: '1px solid #E5E3DF' }}>
              {['Reservation ID', 'Golfer', 'Event', 'Channel', 'Status', 'Timestamp'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: '#6B6B67', fontSize: '14px' }}>
                  No notifications yet. Notifications are logged when reservation statuses change.
                </td>
              </tr>
            ) : filtered.map(n => {
              const user = getUserById(n.userId);
              const statusConfig = STATUS_CONFIG[n.status];
              return (
                <tr key={n.id} style={{ borderBottom: '1px solid #E5E3DF' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <code style={{ fontSize: '11px', color: '#6B6B67', fontFamily: "'JetBrains Mono', monospace" }}>
                      {n.reservationId.slice(-8)}
                    </code>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#1A1A18', fontWeight: '500' }}>
                    {user?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46' }}>
                    {EVENT_LABELS[n.event]}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46' }}>
                    {CHANNEL_LABELS[n.channel]}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '500', color: statusConfig.color,
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: statusConfig.color }} />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#9B9B97', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(n.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  height: '36px', padding: '0 10px', border: '1px solid #E5E3DF',
  borderRadius: '6px', fontSize: '13px', color: '#1A1A18', backgroundColor: 'white',
};
