import type { ReservationStatus } from '../../types';

const STEPS: { key: string; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
];

function getActiveStep(status: ReservationStatus): number {
  switch (status) {
    case 'pending': return 1;
    case 'approved': return 2;
    case 'completed': return 3;
    case 'rejected':
    case 'cancelled': return -1;
    default: return 0;
  }
}

export function StatusTimeline({ status }: { status: ReservationStatus }) {
  const activeStep = getActiveStep(status);
  const isTerminal = status === 'rejected' || status === 'cancelled';

  if (isTerminal) {
    return (
      <div style={{
        padding: '16px 20px', borderRadius: '8px',
        border: '1px solid #E5E3DF', backgroundColor: '#fff8f8',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%',
          backgroundColor: '#A32D2D', flexShrink: 0,
        }} />
        <span style={{ fontSize: '14px', color: '#A32D2D', fontWeight: '500' }}>
          Reservation {status === 'rejected' ? 'Rejected' : 'Cancelled'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {STEPS.map((step, idx) => {
        const isPast = idx < activeStep;
        const isCurrent = idx === activeStep;
        const isFuture = idx > activeStep;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: isPast || isCurrent ? '#2D5016' : 'transparent',
                border: isFuture ? '2px solid #E5E3DF' : 'none',
              }} />
              <span style={{
                fontSize: '12px',
                color: isCurrent ? '#2D5016' : isPast ? '#6B6B67' : '#B0B0AA',
                fontWeight: isCurrent ? '500' : 'normal',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                height: '1px', flex: 1, margin: '0 8px', marginBottom: '22px',
                backgroundColor: isPast ? '#2D5016' : '#E5E3DF',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
