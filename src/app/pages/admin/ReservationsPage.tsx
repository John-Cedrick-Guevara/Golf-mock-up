import { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PaymentStateTag } from '../../components/shared/StatusBadge';
import { formatDate, formatTime, formatTimestamp } from '../../utils';
import type { ReservationStatus } from '../../types';

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'completed', label: 'Completed' },
];

const PAGE_SIZE = 10;

export function ReservationsPage() {
  const { reservations, getUserById } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = reservations.filter(r =>
    activeTab === 'all' || r.status === activeTab
  );
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
  const total = sorted.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const displayed = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '4px' }}>
          Reservations
        </h1>
        <p style={{ fontSize: '13px', color: '#6B6B67' }}>{total} total</p>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', overflowX: 'auto' }}>
        {STATUS_TABS.map(tab => {
          const count = tab.key === 'all' ? reservations.length : reservations.filter(r => r.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
                color: activeTab === tab.key ? '#1A1A18' : '#6B6B67',
                borderBottom: activeTab === tab.key ? '2px solid #C9A84C' : '2px solid transparent',
              }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Export placeholder */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          disabled
          style={{
            padding: '7px 14px', border: '1px solid #E5E3DF', borderRadius: '6px',
            fontSize: '13px', color: '#9B9B97', backgroundColor: '#F8F7F4', cursor: 'not-allowed',
          }}
        >
          Export CSV — coming soon
        </button>
      </div>

      <div style={{ border: '1px solid #E5E3DF', borderRadius: '8px', overflowX: 'auto', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F7F4', borderBottom: '1px solid #E5E3DF' }}>
              {['ID', 'Golfer', 'Date', 'Time', 'Players', 'Status', 'Payment', 'Updated', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px 14px', textAlign: 'center', color: '#6B6B67', fontSize: '14px' }}>
                  No reservations found.
                </td>
              </tr>
            ) : displayed.map((res, i) => {
              const user = getUserById(res.userId);
              const isEven = i % 2 === 0;
              return (
                <tr key={res.id} style={{ borderBottom: '1px solid #E5E3DF', backgroundColor: isEven ? 'white' : '#FAFAF8' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F1EC'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isEven ? 'white' : '#FAFAF8'}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <code style={{ fontSize: '11px', color: '#6B6B67', fontFamily: "'JetBrains Mono', monospace" }}>
                      {res.id.slice(-8)}
                    </code>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#1A1A18', fontWeight: '500' }}>
                    {user?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46', whiteSpace: 'nowrap' }}>
                    {formatDate(res.preferredDate, 'short')}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46', whiteSpace: 'nowrap' }}>
                    {formatTime(res.preferredTime)}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46', textAlign: 'center' }}>
                    {res.playerNames.length}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={res.status} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <PaymentStateTag state={res.paymentState} />
                  </td>
                  <td style={{ padding: '12px 14px', color: '#9B9B97', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(res.updatedAt)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link to={`/admin/reservations/${res.id}`} style={{ fontSize: '12px', color: '#2D5016', textDecoration: 'none', fontWeight: '500' }}>
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px', color: '#6B6B67' }}>
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', border: '1px solid #E5E3DF', borderRadius: '6px', backgroundColor: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#C0C0BB' : '#1A1A18', fontSize: '13px' }}
            >
              Previous
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: '6px 10px', border: '1px solid', borderColor: p === page ? '#2D5016' : '#E5E3DF', borderRadius: '6px', backgroundColor: p === page ? '#2D5016' : 'white', cursor: 'pointer', color: p === page ? 'white' : '#1A1A18', fontSize: '13px' }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              style={{ padding: '6px 12px', border: '1px solid #E5E3DF', borderRadius: '6px', backgroundColor: 'white', cursor: page === pages ? 'not-allowed' : 'pointer', color: page === pages ? '#C0C0BB' : '#1A1A18', fontSize: '13px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
