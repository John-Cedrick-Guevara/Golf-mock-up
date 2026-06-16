import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import type { TeeTimeSlot } from '../types';
import { addDays, dateToString, formatDate, formatTime } from '../utils';
import { COURSE_ID } from '../mockData';
import { Check } from 'lucide-react';

const SERIF = "'Playfair Display', Georgia, serif";
const GREEN = '#2D5016';
const GOLD = '#C9A84C';
const BORDER = '#E5E3DF';

// -- Date strip generation (21 days)
function generateDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 21 }, (_, i) => {
    const d = addDays(today, i);
    return {
      date: dateToString(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate().toString(),
      monthLabel: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });
}

// -- Step indicator
function StepIndicator({ step }: { step: number }) {
  const steps = ['Select Date', 'Select Time', 'Your Details', 'Review & Pay'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '48px' }}>
      {steps.map((label, idx) => {
        const num = idx + 1;
        const isPast = num < step;
        const isCurrent = num === step;
        const isFuture = num > step;
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '600',
                backgroundColor: isPast || isCurrent ? GREEN : 'transparent',
                border: isFuture ? `1.5px solid ${BORDER}` : 'none',
                color: isPast || isCurrent ? 'white' : '#9B9B97',
              }}>
                {isPast ? <Check size={13} /> : num}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: isCurrent ? '500' : '400',
                color: isCurrent ? GREEN : isFuture ? '#9B9B97' : '#6B6B67',
                whiteSpace: 'nowrap',
              }} className="hidden md:block">
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                flex: 1, height: '1px', margin: '0 8px', marginBottom: '28px',
                backgroundColor: isPast ? GREEN : BORDER,
              }} className="hidden md:block" />
            )}
            {idx < steps.length - 1 && (
              <div style={{ width: '16px', height: '1px', backgroundColor: isPast ? GREEN : BORDER, margin: '0 4px', marginBottom: '0' }} className="md:hidden" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// -- Form data
interface FormData {
  fullName: string; email: string; phone: string; cityFrom: string;
  player1: string; extraPlayers: string[];
  transportationNeeded: boolean; notes: string;
  alternateTime: string;
}

const EMPTY_FORM: FormData = {
  fullName: '', email: '', phone: '', cityFrom: '',
  player1: '', extraPlayers: [],
  transportationNeeded: false, notes: '', alternateTime: '',
};

// Payment options
type PaymentOption = 'pay_now' | 'pay_venue';
type PaymentMethod = 'online_banking' | 'gcash' | 'credit_card';

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const { currentUser, getAvailableSlotsForDate, submitReservation } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(searchParams.get('date') ? 2 : 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(searchParams.get('date'));
  const [selectedSlot, setSelectedSlot] = useState<TeeTimeSlot | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [paymentOption, setPaymentOption] = useState<PaymentOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const dates = generateDates();
  const slots = selectedDate ? getAvailableSlotsForDate(selectedDate) : [];
  const availableAltSlots = slots.filter(s => s.status === 'available' && s.availableSpots > 0 && s.id !== selectedSlot?.id);

  useEffect(() => {
    if (currentUser) {
      setForm(f => ({
        ...f,
        fullName: f.fullName || currentUser.name,
        email: f.email || currentUser.email,
        phone: f.phone || currentUser.phone || '',
        player1: f.player1 || currentUser.name,
      }));
    }
  }, [currentUser]);

  // Auto-advance when date selected
  useEffect(() => {
    if (selectedDate && step === 1) {
      const t = setTimeout(() => setStep(2), 420);
      return () => clearTimeout(t);
    }
  }, [selectedDate]);

  // Auto-advance when slot selected
  useEffect(() => {
    if (selectedSlot && step === 2) {
      const t = setTimeout(() => setStep(3), 420);
      return () => clearTimeout(t);
    }
  }, [selectedSlot]);

  function validateStep3(): boolean {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) errors.fullName = 'Required';
    if (!form.email.trim()) errors.email = 'Required';
    if (!form.phone.trim()) errors.phone = 'Required';
    if (!form.cityFrom.trim()) errors.cityFrom = 'Required';
    if (!form.player1.trim()) errors.player1 = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNextStep() {
    if (step === 1 && selectedDate) setStep(2);
    else if (step === 2 && selectedSlot) setStep(3);
    else if (step === 3) {
      if (!currentUser) { navigate('/sign-in'); return; }
      if (validateStep3()) setStep(4);
    }
  }

  async function handleConfirm() {
    if (!selectedSlot || !selectedDate || !currentUser) return;
    setSubmitting(true);
    try {
      const playerNames = [form.player1, ...form.extraPlayers].filter(Boolean);
      const id = await submitReservation({
        userId: currentUser.id,
        courseId: COURSE_ID,
        teeTimeSlotId: selectedSlot.id,
        preferredDate: selectedDate,
        preferredTime: selectedSlot.startTime,
        alternateTime: form.alternateTime || undefined,
        playerNames,
        transportationNeeded: form.transportationNeeded,
        cityFrom: form.cityFrom,
        customerNotes: form.notes || undefined,
      });
      setConfirmedId(id);
    } catch {
      setSubmitting(false);
    }
  }

  // CONFIRMATION STATE
  if (confirmedId && selectedSlot && selectedDate) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#F0F6EA', border: `2px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={24} color={GREEN} />
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: '30px', fontWeight: '400', color: '#1A1A18', marginBottom: '12px' }}>
            You're booked.
          </h1>
          <p style={{ fontSize: '15px', color: '#6B6B67', lineHeight: '1.7' }}>
            Your tee time request has been received. The course team will confirm within 24 hours.
          </p>
        </div>

        <div style={{ border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '24px', marginBottom: '28px' }}>
          <InfoRow label="Course" value="Pradera Verde Golf and Country Club" />
          <InfoRow label="Date" value={formatDate(selectedDate)} />
          <InfoRow label="Time" value={formatTime(selectedSlot.startTime)} />
          <InfoRow label="Payment" value={paymentOption === 'pay_venue' ? 'Pay at venue' : 'Mock payment'} />
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Reservation ID
            </div>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#1A1A18' }}>
              {confirmedId}
            </code>
          </div>
          <div style={{ marginTop: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#B07D1A', fontWeight: '500' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B07D1A' }} />
              Pending
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/my-reservations" style={{ fontSize: '14px', color: GREEN, textDecoration: 'none', fontWeight: '500' }}>
            View reservation →
          </Link>
          <Link to="/" style={{ fontSize: '14px', color: '#6B6B67', textDecoration: 'none' }}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '56px 24px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: '400', color: '#1A1A18' }}>
          Book a Tee Time
        </h1>
      </div>

      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
      {/* ── STEP 1: Date ── */}
      {step === 1 && (
        <motion.div key="step1" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18', marginBottom: '20px' }}>
            Select a date
          </h2>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '32px' }}>
            {dates.map(d => {
              const active = selectedDate === d.date;
              return (
                <button key={d.date} onClick={() => setSelectedDate(d.date)}
                  style={{
                    flexShrink: 0, minWidth: '64px', padding: '12px 10px',
                    borderRadius: '4px', border: `1px solid ${active ? GREEN : BORDER}`,
                    backgroundColor: active ? GREEN : 'white',
                    color: active ? 'white' : '#1A1A18',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.1s',
                  }}>
                  <div style={{ fontSize: '10px', marginBottom: '4px', color: active ? 'rgba(255,255,255,0.7)' : '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.dayName}</div>
                  <div style={{ fontSize: '18px', fontWeight: '500', lineHeight: 1 }}>{d.dayNum}</div>
                  <div style={{ fontSize: '10px', marginTop: '3px', color: active ? 'rgba(255,255,255,0.65)' : '#9B9B97' }}>{d.monthLabel}</div>
                </button>
              );
            })}
          </div>
          <NextButton active={!!selectedDate} onClick={handleNextStep} />
        </motion.div>
      )}

      {/* ── STEP 2: Time ── */}
      {step === 2 && selectedDate && (
        <motion.div key="step2" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18', marginBottom: '6px' }}>
            Available times on {formatDate(selectedDate)}
          </h2>
          <button onClick={() => setStep(1)} style={{ fontSize: '13px', color: '#6B6B67', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', textDecoration: 'underline' }}>
            ← Change date
          </button>

          {slots.length === 0 ? (
            <p style={{ fontSize: '15px', color: '#6B6B67' }}>No tee times available. Try another day.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '32px' }}>
              {slots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id;
                const isAvailable = slot.status === 'available' && slot.availableSpots > 0;
                const isBlocked = slot.status === 'blocked';
                const isDisabled = slot.status === 'disabled' || (slot.status === 'available' && slot.availableSpots === 0);

                return (
                  <div key={slot.id} style={{
                    display: 'flex', alignItems: 'center', padding: '14px 16px',
                    borderBottom: `1px solid ${BORDER}`,
                    backgroundColor: isSelected ? '#F4F9F0' : isDisabled || isBlocked ? '#FAFAF8' : 'white',
                    borderLeft: `2px solid ${isSelected ? GREEN : 'transparent'}`,
                    opacity: isDisabled || isBlocked ? 0.6 : 1,
                    gap: '16px',
                  }}>
                    <div style={{ flex: '0 0 80px' }}>
                      <span style={{
                        fontSize: '15px', fontWeight: '500', color: '#1A1A18',
                        textDecoration: isDisabled ? 'line-through' : 'none',
                      }}>
                        {formatTime(slot.startTime)}
                      </span>
                    </div>
                    <div style={{ flex: 1, fontSize: '13px', color: '#6B6B67' }}>
                      {isBlocked ? `Blocked — ${slot.blockReason}` :
                        isDisabled ? 'Unavailable' :
                          `${slot.availableSpots} of ${slot.capacity} spots`}
                    </div>
                    <div style={{ flex: '0 0 80px', textAlign: 'right', fontSize: '12px', color: isAvailable ? GREEN : '#9B9B97', fontWeight: '500' }}>
                      {isAvailable ? (slot.availableSpots < slot.capacity ? 'Limited' : 'Available') : isBlocked ? 'Blocked' : 'Full'}
                    </div>
                    <div style={{ flex: '0 0 80px', textAlign: 'right' }}>
                      {isAvailable && (
                        <button onClick={() => setSelectedSlot(isSelected ? null : slot)}
                          style={{
                            padding: '6px 14px', fontSize: '12px', fontWeight: '500',
                            borderRadius: '4px', cursor: 'pointer', border: `1px solid ${GREEN}`,
                            backgroundColor: isSelected ? GREEN : 'white',
                            color: isSelected ? 'white' : GREEN,
                          }}>
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <NextButton active={!!selectedSlot} onClick={handleNextStep} />
        </motion.div>
      )}

      {/* ── STEP 3: Details ── */}
      {step === 3 && (
        <motion.div key="step3" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <button onClick={() => setStep(2)} style={{ fontSize: '13px', color: '#6B6B67', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 24px', textDecoration: 'underline' }}>
            ← Back to time selection
          </button>

          {!currentUser && (
            <div style={{ padding: '14px 16px', backgroundColor: '#FFF8E7', border: '1px solid #C9A84C', borderRadius: '4px', marginBottom: '28px', fontSize: '14px', color: '#7A5800' }}>
              <Link to="/sign-in" style={{ color: GREEN, fontWeight: '500' }}>Sign in</Link> or{' '}
              <Link to="/sign-up" style={{ color: GREEN, fontWeight: '500' }}>create an account</Link> to complete your booking.
            </div>
          )}

          {/* Contact */}
          <FormSection title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {([
                { key: 'fullName', label: 'Full name', type: 'text', placeholder: 'Your full name' },
                { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
                { key: 'phone', label: 'Phone number', type: 'tel', placeholder: '+63 917 000 0000' },
                { key: 'cityFrom', label: 'Visiting from (city)', type: 'text', placeholder: 'Makati City' },
              ] as const).map(field => (
                <div key={field.key}>
                  <FieldLabel required>{field.label}</FieldLabel>
                  <input type={field.type}
                    value={form[field.key] as string}
                    onChange={e => { setForm(f => ({ ...f, [field.key]: e.target.value })); setFormErrors(e2 => ({ ...e2, [field.key]: undefined })); }}
                    placeholder={field.placeholder}
                    style={{ ...inputStyle, borderColor: formErrors[field.key] ? '#A32D2D' : BORDER }}
                  />
                  {formErrors[field.key] && <p style={errorStyle}>{formErrors[field.key]}</p>}
                </div>
              ))}
            </div>
          </FormSection>

          {/* Players */}
          <FormSection title="Players">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
              <div>
                <FieldLabel required>Player 1</FieldLabel>
                <input type="text" value={form.player1}
                  onChange={e => { setForm(f => ({ ...f, player1: e.target.value })); setFormErrors(e2 => ({ ...e2, player1: undefined })); }}
                  placeholder="Full name"
                  style={{ ...inputStyle, borderColor: formErrors.player1 ? '#A32D2D' : BORDER }}
                />
                {formErrors.player1 && <p style={errorStyle}>{formErrors.player1}</p>}
              </div>
              {form.extraPlayers.map((name, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <FieldLabel>Player {idx + 2}</FieldLabel>
                    <input type="text" value={name}
                      onChange={e => { const u = [...form.extraPlayers]; u[idx] = e.target.value; setForm(f => ({ ...f, extraPlayers: u })); }}
                      placeholder="Full name" style={{ ...inputStyle, borderColor: BORDER }} />
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, extraPlayers: f.extraPlayers.filter((_, i) => i !== idx) }))}
                    style={{ height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#A32D2D', padding: '0 6px', flexShrink: 0 }}>
                    Remove
                  </button>
                </div>
              ))}
              {form.extraPlayers.length < 3 && (
                <button onClick={() => setForm(f => ({ ...f, extraPlayers: [...f.extraPlayers, ''] }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: GREEN, textAlign: 'left', padding: '4px 0', fontWeight: '500', width: 'fit-content' }}>
                  + Add player
                </button>
              )}
            </div>
          </FormSection>

          {/* Preferences */}
          <FormSection title="Preferences">
            <div style={{ marginBottom: '20px' }}>
              <FieldLabel>Transportation needed?</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '500px', marginTop: '8px' }}>
                {[
                  { val: true, label: 'Yes — arrange transport', sub: 'We\'ll coordinate your pickup.' },
                  { val: false, label: 'No — self-transport', sub: 'I\'ll arrange my own transport.' },
                ].map(opt => (
                  <label key={String(opt.val)} onClick={() => setForm(f => ({ ...f, transportationNeeded: opt.val }))}
                    style={{
                      display: 'block', padding: '16px', cursor: 'pointer',
                      border: `1px solid ${form.transportationNeeded === opt.val ? GREEN : BORDER}`,
                      borderRadius: '4px',
                      backgroundColor: form.transportationNeeded === opt.val ? '#F4F9F0' : 'white',
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18', marginBottom: '4px' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: '#6B6B67' }}>{opt.sub}</div>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ maxWidth: '500px' }}>
              <FieldLabel>Alternate time (optional)</FieldLabel>
              <select value={form.alternateTime} onChange={e => setForm(f => ({ ...f, alternateTime: e.target.value }))}
                style={{ ...inputStyle, borderColor: BORDER }}>
                <option value="">None</option>
                {availableAltSlots.map(s => <option key={s.id} value={s.startTime}>{formatTime(s.startTime)}</option>)}
              </select>
            </div>
            <div style={{ maxWidth: '500px', marginTop: '20px' }}>
              <FieldLabel>Other notes (optional)</FieldLabel>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3} placeholder="Anything the course team should know?"
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: '4px', fontSize: '14px', color: '#1A1A18', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </FormSection>

          <NextButton active={true} label="Review & Pay →" onClick={handleNextStep} />
        </motion.div>
      )}

      {/* ── STEP 4: Review & Pay ── */}
      {step === 4 && selectedDate && selectedSlot && (
        <motion.div key="step4" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <button onClick={() => setStep(3)} style={{ fontSize: '13px', color: '#6B6B67', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 24px', textDecoration: 'underline' }}>
            ← Edit details
          </button>

          {/* Summary */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '20px', marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '14px' }}>Summary</p>
            <InfoRow label="Course" value="Pradera Verde Golf and Country Club" />
            <InfoRow label="Date" value={formatDate(selectedDate)} />
            <InfoRow label="Time" value={formatTime(selectedSlot.startTime)} />
            <InfoRow label="Players" value={[form.player1, ...form.extraPlayers].filter(Boolean).join(', ')} />
            <InfoRow label="Transport" value={form.transportationNeeded ? 'Yes' : 'No'} />
          </div>

          {/* Payment section */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '20px', marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '16px' }}>Payment</p>

            {/* Mock banner */}
            <div style={{ backgroundColor: '#E8D5A0', border: `1px solid ${GOLD}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#141410' }}>
              Simulation mode — no real payment will be processed.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                { key: 'pay_now' as PaymentOption, label: 'Pay Now (Mock)', sub: 'Complete a simulated payment today to secure your slot.' },
                { key: 'pay_venue' as PaymentOption, label: 'Pay at Venue', sub: 'Confirm your reservation now, pay at the pro shop on arrival.' },
              ]).map(opt => (
                <div key={opt.key}>
                  <label onClick={() => setPaymentOption(opt.key)}
                    style={{
                      display: 'block', padding: '16px', cursor: 'pointer',
                      border: `1px solid ${paymentOption === opt.key ? GREEN : BORDER}`,
                      borderRadius: '4px',
                      backgroundColor: paymentOption === opt.key ? '#F4F9F0' : 'white',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${paymentOption === opt.key ? GREEN : BORDER}`,
                        backgroundColor: paymentOption === opt.key ? GREEN : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {paymentOption === opt.key && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18' }}>{opt.label}</div>
                        <div style={{ fontSize: '13px', color: '#6B6B67' }}>{opt.sub}</div>
                      </div>
                    </div>
                  </label>

                  {/* Pay Now sub-options */}
                  {opt.key === 'pay_now' && paymentOption === 'pay_now' && (
                    <div style={{ marginTop: '8px', padding: '16px', backgroundColor: '#F8F7F4', borderRadius: '4px', border: `1px solid ${BORDER}` }}>
                      <p style={{ fontSize: '12px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: '500' }}>Choose method</p>
                      {([
                        { key: 'online_banking' as PaymentMethod, label: 'Online Banking', detail: 'Mock account: BDO 1234-5678-9012' },
                        { key: 'gcash' as PaymentMethod, label: 'GCash / Maya', detail: null },
                        { key: 'credit_card' as PaymentMethod, label: 'Credit Card (Demo)', detail: 'DEMO ONLY' },
                      ]).map(m => (
                        <div key={m.key} style={{ marginBottom: '8px' }}>
                          <label onClick={() => setPaymentMethod(m.key)}
                            style={{ display: 'flex', gap: '10px', padding: '12px', cursor: 'pointer', border: `1px solid ${paymentMethod === m.key ? GREEN : BORDER}`, borderRadius: '4px', backgroundColor: paymentMethod === m.key ? '#F4F9F0' : 'white' }}>
                            <input type="radio" checked={paymentMethod === m.key} onChange={() => setPaymentMethod(m.key)} style={{ accentColor: GREEN, marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18' }}>{m.label}</div>
                              {m.detail && <div style={{ fontSize: '12px', color: '#6B6B67', marginTop: '2px' }}>{m.detail}</div>}
                              {m.key === 'gcash' && paymentMethod === 'gcash' && (
                                <div style={{ width: '120px', height: '120px', backgroundColor: '#E5E3DF', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                  <span style={{ fontSize: '11px', color: '#6B6B67', textAlign: 'center', padding: '8px' }}>Mock QR — not functional</span>
                                </div>
                              )}
                              {m.key === 'credit_card' && paymentMethod === 'credit_card' && (
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {['Card number', 'Expiry', 'CVV'].map(f => (
                                    <input key={f} disabled placeholder={f + ' — DEMO ONLY'}
                                      style={{ width: '100%', height: '36px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '4px', fontSize: '12px', color: '#9B9B97', backgroundColor: '#F8F7F4', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pay at venue detail */}
                  {opt.key === 'pay_venue' && paymentOption === 'pay_venue' && (
                    <div style={{ marginTop: '8px', padding: '14px 16px', backgroundColor: '#F8F7F4', borderRadius: '4px', fontSize: '14px', color: '#4A4A46', border: `1px solid ${BORDER}` }}>
                      Your reservation will be marked as confirmed. Payment is due at the clubhouse on your day of play.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleConfirm}
            disabled={submitting || !paymentOption || (paymentOption === 'pay_now' && !paymentMethod)}
            style={{
              width: '100%', height: '48px', backgroundColor: GREEN,
              opacity: (submitting || !paymentOption || (paymentOption === 'pay_now' && !paymentMethod)) ? 0.4 : 1,
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '14px', fontWeight: '500',
              cursor: (submitting || !paymentOption || (paymentOption === 'pay_now' && !paymentMethod)) ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Confirming…' : 'Confirm Reservation'}
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// -- Reusable sub-components
function NextButton({ active, label = 'Next →', onClick }: { active: boolean; label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={!active}
      style={{
        height: '44px', padding: '0 32px',
        backgroundColor: GREEN, color: 'white',
        border: 'none', borderRadius: '4px',
        fontSize: '14px', fontWeight: '500',
        cursor: active ? 'pointer' : 'not-allowed',
        opacity: active ? 1 : 0.4,
      }}>
      {label}
    </button>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <p style={{ fontSize: '11px', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500', marginBottom: '16px' }}>{title}</p>
      {children}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6B6B67', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
      {children}{required && <span style={{ color: '#A32D2D', marginLeft: '2px' }}>*</span>}
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F0EDE8' }}>
      <span style={{ fontSize: '13px', color: '#6B6B67' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#1A1A18', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: '44px', padding: '0 12px',
  border: `1px solid #E5E3DF`, borderRadius: '4px',
  fontSize: '14px', color: '#1A1A18', outline: 'none',
  boxSizing: 'border-box', backgroundColor: 'white',
};

const errorStyle: React.CSSProperties = {
  fontSize: '12px', color: '#A32D2D', marginTop: '4px',
};
