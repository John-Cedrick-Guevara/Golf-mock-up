import type { ReservationStatus, PaymentState } from '../../types';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#B07D1A' },
  approved: { label: 'Approved', color: '#2D5016' },
  rejected: { label: 'Rejected', color: '#A32D2D' },
  cancelled: { label: 'Cancelled', color: '#6B6B67' },
  completed: { label: 'Completed', color: '#185FA5' },
};

const PAYMENT_CONFIG: Record<PaymentState, { label: string; color: string }> = {
  not_required: { label: 'Not Required', color: '#6B6B67' },
  unpaid: { label: 'Unpaid', color: '#A32D2D' },
  deposit_paid_mock: { label: 'Deposit Paid', color: '#B07D1A' },
  paid_mock: { label: 'Paid (Mock)', color: '#2D5016' },
  refunded_mock: { label: 'Refunded', color: '#6B6B67' },
};

interface StatusBadgeProps {
  status: ReservationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '13px', color: config.color, fontWeight: '500',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: config.color, flexShrink: 0,
      }} />
      {config.label}
    </span>
  );
}

interface PaymentStateTagProps {
  state: PaymentState;
}

export function PaymentStateTag({ state }: PaymentStateTagProps) {
  const config = PAYMENT_CONFIG[state];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '13px', color: config.color, fontWeight: '500',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: config.color, flexShrink: 0,
      }} />
      {config.label}
    </span>
  );
}
