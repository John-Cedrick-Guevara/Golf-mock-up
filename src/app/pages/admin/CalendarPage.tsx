import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatTime, dateToString } from '../../utils';
import { COURSE_ID } from '../../mockData';
import type { TeeTimeSlot } from '../../types';
import { X } from 'lucide-react';

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  for (let i = 0; i < startPad; i++) {
    days.push(new Date(year, month, -startPad + 1 + i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return days;
}

function getSlotSummary(slots: TeeTimeSlot[]) {
  if (!slots.length) return null;
  const available = slots.filter(s => s.status === 'available' && s.availableSpots > 0).length;
  const blocked = slots.filter(s => s.status === 'blocked').length;
  if (blocked === slots.length) return { color: '#A32D2D', label: 'Blocked' };
  if (available === 0) return { color: '#A32D2D', label: 'Full' };
  if (available < slots.length / 2) return { color: '#B07D1A', label: `${available} avail` };
  return { color: '#2D5016', label: `${available} avail` };
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage() {
  const { teeTimeSlots, updateTeeTimeSlot, disableTeeTimeSlot, createTeeTimeSlot } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [addSlotData, setAddSlotData] = useState({ date: '', startTime: '08:00', capacity: 4, notes: '' });
  const [addSlotLoading, setAddSlotLoading] = useState(false);
  const [panelLoading, setPanelLoading] = useState<string | null>(null);

  const days = getDaysInMonth(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const selectedSlots = selectedDate
    ? teeTimeSlots.filter(s => s.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  async function handleAddSlot() {
    if (!addSlotData.date || !addSlotData.startTime) return;
    setAddSlotLoading(true);
    await createTeeTimeSlot({
      courseId: COURSE_ID,
      date: addSlotData.date,
      startTime: addSlotData.startTime,
      capacity: addSlotData.capacity,
      availableSpots: addSlotData.capacity,
      status: 'available',
      notes: addSlotData.notes || undefined,
    });
    setAddSlotLoading(false);
    setShowAddSlot(false);
    setAddSlotData({ date: '', startTime: '08:00', capacity: 4, notes: '' });
  }

  async function handleToggleSlot(slot: TeeTimeSlot) {
    setPanelLoading(slot.id);
    if (slot.status === 'disabled') {
      await updateTeeTimeSlot(slot.id, { status: 'available', availableSpots: slot.capacity });
    } else {
      await disableTeeTimeSlot(slot.id);
    }
    setPanelLoading(null);
  }

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 'normal', color: '#1A1A18' }}>
          Tee Time Calendar
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            style={{
              padding: '8px 16px', backgroundColor: '#2D5016', color: 'white',
              border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            }}
          >
            + Add tee time slot
          </button>
        </div>
      </div>

      {/* Add Slot Form */}
      {showAddSlot && (
        <div style={{ padding: '20px', border: '1px solid #E5E3DF', borderRadius: '8px', backgroundColor: 'white', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18', marginBottom: '16px' }}>Add tee time slot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label style={labelStyle2}>Date</label>
              <input type="date" value={addSlotData.date} onChange={e => setAddSlotData(d => ({ ...d, date: e.target.value }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle2}>Start time</label>
              <input type="time" value={addSlotData.startTime} onChange={e => setAddSlotData(d => ({ ...d, startTime: e.target.value }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle2}>Capacity</label>
              <input type="number" min={1} max={8} value={addSlotData.capacity} onChange={e => setAddSlotData(d => ({ ...d, capacity: Number(e.target.value) }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle2}>Notes (optional)</label>
              <input type="text" value={addSlotData.notes} onChange={e => setAddSlotData(d => ({ ...d, notes: e.target.value }))}
                placeholder="Optional" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
            <button onClick={handleAddSlot} disabled={addSlotLoading || !addSlotData.date}
              style={{ padding: '8px 18px', backgroundColor: addSlotLoading ? '#8BA87A' : '#2D5016', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              {addSlotLoading ? 'Adding…' : 'Add slot'}
            </button>
            <button onClick={() => setShowAddSlot(false)}
              style={{ padding: '8px 18px', backgroundColor: 'white', color: '#6B6B67', border: '1px solid #E5E3DF', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Calendar grid */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #E5E3DF', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #E5E3DF' }}>
              <button onClick={prevMonth} style={navBtn}>‹</button>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18' }}>{monthLabel}</span>
              <button onClick={nextMonth} style={navBtn}>›</button>
            </div>

            {/* Day labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E5E3DF' }}>
              {DAYS_OF_WEEK.map(d => (
                <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {days.map((day, i) => {
                const dateStr = dateToString(day);
                const isCurrentMonth = day.getMonth() === month;
                const isToday = dateStr === dateToString(today);
                const isSelected = dateStr === selectedDate;
                const slots = teeTimeSlots.filter(s => s.date === dateStr);
                const summary = getSlotSummary(slots);

                return (
                  <div
                    key={i}
                    onClick={() => isCurrentMonth && setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                      minHeight: '70px', padding: '6px', borderRight: '1px solid #E5E3DF',
                      borderBottom: '1px solid #E5E3DF',
                      backgroundColor: isSelected ? '#F4F9F0' : isToday ? '#FFFBF0' : 'white',
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                  >
                    <div style={{
                      fontSize: '12px', fontWeight: isToday ? '600' : 'normal',
                      color: isToday ? '#2D5016' : isCurrentMonth ? '#1A1A18' : '#C0C0BB',
                      marginBottom: '4px',
                    }}>
                      {day.getDate()}
                    </div>
                    {summary && isCurrentMonth && (
                      <div style={{
                        fontSize: '10px', color: summary.color,
                        backgroundColor: summary.color + '15',
                        padding: '2px 5px', borderRadius: '3px', fontWeight: '500',
                        display: 'inline-block',
                      }}>
                        {summary.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day panel */}
        {selectedDate && (
          <div style={{ width: '300px', flexShrink: 0, border: '1px solid #E5E3DF', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #E5E3DF' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A18' }}>
                {formatDate(selectedDate, 'medium')}
              </span>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B67', padding: '2px' }}>
                <X size={16} />
              </button>
            </div>

            {selectedSlots.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B6B67', fontSize: '13px' }}>
                No slots for this day.
              </div>
            ) : (
              <div>
                {selectedSlots.map(slot => (
                  <div key={slot.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A18' }}>
                        {formatTime(slot.startTime)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B6B67', marginTop: '2px' }}>
                        {slot.status === 'available'
                          ? `${slot.availableSpots}/${slot.capacity} spots`
                          : slot.status === 'blocked'
                          ? `Blocked: ${slot.blockReason || 'N/A'}`
                          : 'Disabled'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSlot(slot)}
                      disabled={panelLoading === slot.id || slot.status === 'blocked'}
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontWeight: '500',
                        borderRadius: '4px', cursor: slot.status === 'blocked' ? 'not-allowed' : 'pointer',
                        border: '1px solid',
                        ...(slot.status === 'disabled'
                          ? { color: '#2D5016', borderColor: '#2D5016', backgroundColor: 'white' }
                          : { color: '#6B6B67', borderColor: '#E5E3DF', backgroundColor: 'white' }
                        ),
                      }}
                    >
                      {panelLoading === slot.id ? '…' : slot.status === 'disabled' ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle2: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: '#6B6B67',
  textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', height: '36px', padding: '0 10px',
  border: '1px solid #E5E3DF', borderRadius: '6px',
  fontSize: '13px', color: '#1A1A18', boxSizing: 'border-box',
};

const navBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #E5E3DF', borderRadius: '6px',
  width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px',
  color: '#6B6B67', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
