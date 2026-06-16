import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatTimestamp } from '../../utils';
import { COURSE_ID, ADMIN_USER_ID } from '../../mockData';
import type { BlockReason } from '../../types';

const REASON_LABELS: Record<BlockReason, string> = {
  tournament: 'Tournament',
  maintenance: 'Maintenance',
  private_event: 'Private Event',
  holiday: 'Holiday',
  other: 'Other',
};

export function BlocksPage() {
  const { scheduleBlocks, createScheduleBlock, deleteScheduleBlock, getUserById, currentUser } = useApp();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: 'tournament' as BlockReason,
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return;
    setSubmitting(true);
    await createScheduleBlock({
      courseId: COURSE_ID,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      reason: form.reason,
      notes: form.notes || undefined,
      createdBy: currentUser?.id || ADMIN_USER_ID,
    });
    setSubmitting(false);
    setSuccess(true);
    setForm({ startDate: '', endDate: '', startTime: '', endTime: '', reason: 'tournament', notes: '' });
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteScheduleBlock(id);
    setDeleting(null);
    setConfirmDelete(null);
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18', marginBottom: '6px' }}>
          Schedule Blocks
        </h1>
        <p style={{ fontSize: '14px', color: '#6B6B67', lineHeight: '1.5' }}>
          Block dates or time ranges for tournaments, maintenance, or private events.
          Blocked periods are hidden from golfer booking.
        </p>
      </div>

      {/* Active blocks table */}
      <div style={{ border: '1px solid #E5E3DF', borderRadius: '8px', overflowX: 'auto', backgroundColor: 'white', marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F7F4', borderBottom: '1px solid #E5E3DF' }}>
              {['Date range', 'Time range', 'Reason', 'Notes', 'Created by', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleBlocks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: '#6B6B67', fontSize: '14px' }}>
                  No schedule blocks. Add one to restrict golfer booking for specific dates.
                </td>
              </tr>
            ) : scheduleBlocks.map(block => {
              const creator = getUserById(block.createdBy);
              return (
                <tr key={block.id} style={{ borderBottom: '1px solid #E5E3DF' }}>
                  <td style={{ padding: '12px 14px', color: '#1A1A18', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    {formatDate(block.startDate, 'short')}
                    {block.endDate !== block.startDate && ` – ${formatDate(block.endDate, 'short')}`}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46', whiteSpace: 'nowrap' }}>
                    {block.startTime ? `${block.startTime}${block.endTime ? ` – ${block.endTime}` : ''}` : 'All day'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#4A4A46' }}>
                    {REASON_LABELS[block.reason]}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#6B6B67', maxWidth: '220px' }}>
                    {block.notes || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#6B6B67', fontSize: '12px' }}>
                    {creator?.name || 'Admin'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {confirmDelete === block.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleDelete(block.id)} disabled={deleting === block.id}
                          style={{ fontSize: '12px', color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 }}
                        >
                          {deleting === block.id ? '…' : 'Confirm'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          style={{ fontSize: '12px', color: '#6B6B67', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(block.id)}
                        style={{ fontSize: '12px', color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add block form */}
      <div style={{ border: '1px solid #E5E3DF', borderRadius: '8px', backgroundColor: 'white', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A18', marginBottom: '20px' }}>
          Add schedule block
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label style={lStyle}>Start date <span style={{ color: '#A32D2D' }}>*</span></label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                required style={iStyle} />
            </div>
            <div>
              <label style={lStyle}>End date <span style={{ color: '#A32D2D' }}>*</span></label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                required style={iStyle} />
            </div>
            <div>
              <label style={lStyle}>Start time <span style={{ color: '#6B6B67', fontWeight: '400' }}>(optional)</span></label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={iStyle} />
            </div>
            <div>
              <label style={lStyle}>End time <span style={{ color: '#6B6B67', fontWeight: '400' }}>(optional)</span></label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={iStyle} />
            </div>
          </div>

          <div>
            <label style={lStyle}>Reason <span style={{ color: '#A32D2D' }}>*</span></label>
            <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as BlockReason }))}
              style={{ ...iStyle, maxWidth: '300px' }}>
              {(Object.entries(REASON_LABELS) as Array<[BlockReason, string]>).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={lStyle}>Notes <span style={{ color: '#6B6B67', fontWeight: '400' }}>(optional)</span></label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Additional details about this block…"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E3DF', borderRadius: '6px', fontSize: '14px', color: '#1A1A18', resize: 'vertical', boxSizing: 'border-box', maxWidth: '600px' }} />
          </div>

          <div>
            <label style={lStyle}>Course</label>
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6B6B67' }}>
              Pradera Verde Golf and Country Club
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" disabled={submitting}
              style={{
                padding: '10px 24px', backgroundColor: submitting ? '#8BA87A' : '#2D5016',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '14px', fontWeight: '500', cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
              {submitting ? 'Adding…' : 'Add schedule block'}
            </button>
            {success && (
              <span style={{ fontSize: '13px', color: '#2D5016', fontWeight: '500' }}>Schedule block added.</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const lStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', color: '#1A1A18', fontWeight: '500', marginBottom: '6px',
};

const iStyle: React.CSSProperties = {
  width: '100%', height: '38px', padding: '0 10px',
  border: '1px solid #E5E3DF', borderRadius: '6px',
  fontSize: '14px', color: '#1A1A18', boxSizing: 'border-box', backgroundColor: 'white',
};
