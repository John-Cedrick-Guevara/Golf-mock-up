export type UserRole = 'golfer' | 'admin';

export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: number;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  address: string;
  mapUrl: string;
  teeInfo: string;
  notes: string;
}

export interface TeeTimeSlot {
  id: string;
  courseId: string;
  date: string;
  startTime: string;
  capacity: number;
  availableSpots: number;
  status: 'available' | 'disabled' | 'blocked';
  blockReason?: string;
  notes?: string;
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type PaymentState = 'not_required' | 'unpaid' | 'deposit_paid_mock' | 'paid_mock' | 'refunded_mock';

export interface Reservation {
  id: string;
  userId: string;
  courseId: string;
  teeTimeSlotId: string;
  preferredDate: string;
  preferredTime: string;
  alternateTime?: string;
  playerNames: string[];
  transportationNeeded: boolean;
  cityFrom: string;
  customerNotes?: string;
  adminNotes?: string;
  customerFacingNote?: string;
  status: ReservationStatus;
  paymentState: PaymentState;
  createdAt: number;
  updatedAt: number;
}

export type BlockReason = 'tournament' | 'maintenance' | 'private_event' | 'holiday' | 'other';

export interface ScheduleBlock {
  id: string;
  courseId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason: BlockReason;
  notes?: string;
  createdBy: string;
}

export type NotificationEvent = 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'payment_confirmed';
export type NotificationChannel = 'email' | 'sms' | 'in_app';
export type NotificationStatus = 'queued' | 'sent_mock' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  reservationId: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: number;
}
