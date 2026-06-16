import type { Course, TeeTimeSlot, User, ScheduleBlock, Notification, Reservation } from './types';
import { addDays, dateToString } from './utils';

export const COURSE_ID = 'course-pradera-verde';
export const ADMIN_USER_ID = 'user-admin-001';
export const GOLFER_USER_ID = 'user-golfer-001';

export const mockCourse: Course = {
  id: COURSE_ID,
  name: 'Pradera Verde Golf and Country Club',
  location: 'Pampanga, Philippines',
  address: 'Pradera Verde, Clark, Pampanga',
  mapUrl: 'https://maps.google.com/?q=Pradera+Verde+Golf+Clark+Pampanga',
  teeInfo: '18 holes, Blue Tees — 6,156 total yards. Championship layout with water hazards, elevated greens, and firm putting surfaces.',
  notes: '',
};

export const mockUsers: User[] = [
  {
    id: ADMIN_USER_ID,
    clerkId: 'clerk-admin-001',
    name: 'Course Admin',
    email: 'admin@praderaverde.com',
    phone: '+63 917 000 0001',
    role: 'admin',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: GOLFER_USER_ID,
    clerkId: 'clerk-golfer-001',
    name: 'Juan dela Cruz',
    email: 'juan@example.com',
    phone: '+63 917 555 0002',
    role: 'golfer',
    createdAt: Date.now() - 86400000 * 7,
  },
];

const TEE_TIMES = ['06:00', '07:00', '08:00', '10:00', '13:00', '15:00'];

export function generateTeeTimeSlots(): TeeTimeSlot[] {
  const slots: TeeTimeSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day7 = dateToString(addDays(today, 7));
  const day14 = dateToString(addDays(today, 14));

  for (let dayOffset = 0; dayOffset < 21; dayOffset++) {
    const date = dateToString(addDays(today, dayOffset));

    for (let timeIdx = 0; timeIdx < TEE_TIMES.length; timeIdx++) {
      const time = TEE_TIMES[timeIdx];
      const slotId = `slot-${date}-${time.replace(':', '')}`;

      let status: TeeTimeSlot['status'] = 'available';
      let blockReason: string | undefined;

      if (date === day7) {
        status = 'blocked';
        blockReason = 'Monthly club tournament';
      } else if (date === day14 && (time === '06:00' || time === '07:00')) {
        status = 'blocked';
        blockReason = 'Maintenance — greens aerification';
      } else {
        const rand = ((dayOffset * 31 + timeIdx * 17) * 1009) % 100;
        if (rand < 70) {
          status = 'available';
        } else if (rand < 85) {
          status = 'blocked';
          blockReason = 'Tournament';
        } else {
          status = 'disabled';
        }
      }

      slots.push({
        id: slotId,
        courseId: COURSE_ID,
        date,
        startTime: time,
        capacity: 4,
        availableSpots: status === 'available' ? 4 : 0,
        status,
        blockReason,
      });
    }
  }

  return slots;
}

export function generateScheduleBlocks(): ScheduleBlock[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day7 = dateToString(addDays(today, 7));
  const day14 = dateToString(addDays(today, 14));

  return [
    {
      id: 'sblock-001',
      courseId: COURSE_ID,
      startDate: day7,
      endDate: day7,
      reason: 'tournament',
      notes: 'Monthly club tournament — all tee times reserved for club members.',
      createdBy: ADMIN_USER_ID,
    },
    {
      id: 'sblock-002',
      courseId: COURSE_ID,
      startDate: day14,
      endDate: day14,
      startTime: '06:00',
      endTime: '07:59',
      reason: 'maintenance',
      notes: 'Greens aerification — morning slots restricted.',
      createdBy: ADMIN_USER_ID,
    },
  ];
}

export function generateSampleReservations(): Reservation[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = (n: number) => dateToString(addDays(today, n));

  return [
    {
      id: 'res-001',
      userId: GOLFER_USER_ID,
      courseId: COURSE_ID,
      teeTimeSlotId: `slot-${d(3)}-0800`,
      preferredDate: d(3),
      preferredTime: '08:00',
      playerNames: ['Juan dela Cruz', 'Maria Santos'],
      transportationNeeded: false,
      cityFrom: 'Makati City',
      customerNotes: 'First time at this course. Looking forward to it.',
      status: 'approved',
      paymentState: 'unpaid',
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'res-002',
      userId: GOLFER_USER_ID,
      courseId: COURSE_ID,
      teeTimeSlotId: `slot-${d(6)}-1000`,
      preferredDate: d(6),
      preferredTime: '10:00',
      alternateTime: '13:00',
      playerNames: ['Juan dela Cruz', 'Pedro Garcia', 'Jose Reyes'],
      transportationNeeded: true,
      cityFrom: 'BGC, Taguig',
      status: 'pending',
      paymentState: 'not_required',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'res-003',
      userId: GOLFER_USER_ID,
      courseId: COURSE_ID,
      teeTimeSlotId: `slot-${d(-3)}-0600`,
      preferredDate: d(-3),
      preferredTime: '06:00',
      playerNames: ['Juan dela Cruz'],
      transportationNeeded: false,
      cityFrom: 'Pasig City',
      adminNotes: 'VIP golfer, ensure caddie ready.',
      customerFacingNote: 'Please arrive 15 minutes before your tee time. Your caddie will be waiting.',
      status: 'completed',
      paymentState: 'paid_mock',
      createdAt: Date.now() - 86400000 * 10,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'res-004',
      userId: GOLFER_USER_ID,
      courseId: COURSE_ID,
      teeTimeSlotId: `slot-${d(-10)}-1500`,
      preferredDate: d(-10),
      preferredTime: '15:00',
      playerNames: ['Juan dela Cruz', 'Carlo Reyes'],
      transportationNeeded: false,
      cityFrom: 'Mandaluyong',
      status: 'rejected',
      paymentState: 'not_required',
      customerFacingNote: 'This slot is no longer available. Please try a different date.',
      createdAt: Date.now() - 86400000 * 15,
      updatedAt: Date.now() - 86400000 * 10,
    },
  ];
}

export function generateSampleNotifications(reservations: Reservation[]): Notification[] {
  const notifications: Notification[] = [];
  const channels: Array<'email' | 'sms' | 'in_app'> = ['email', 'sms', 'in_app'];

  for (const res of reservations) {
    notifications.push({
      id: `notif-${res.id}-submitted`,
      userId: res.userId,
      reservationId: res.id,
      event: 'submitted',
      channel: channels[0],
      status: 'sent_mock',
      createdAt: res.createdAt,
    });

    if (res.status === 'approved' || res.status === 'completed') {
      notifications.push({
        id: `notif-${res.id}-approved`,
        userId: res.userId,
        reservationId: res.id,
        event: 'approved',
        channel: channels[1],
        status: 'sent_mock',
        createdAt: res.updatedAt - 3600000,
      });
    }

    if (res.status === 'rejected') {
      notifications.push({
        id: `notif-${res.id}-rejected`,
        userId: res.userId,
        reservationId: res.id,
        event: 'rejected',
        channel: channels[0],
        status: 'sent_mock',
        createdAt: res.updatedAt,
      });
    }

    if (res.paymentState === 'paid_mock') {
      notifications.push({
        id: `notif-${res.id}-payment`,
        userId: res.userId,
        reservationId: res.id,
        event: 'payment_confirmed',
        channel: channels[2],
        status: 'sent_mock',
        createdAt: res.updatedAt,
      });
    }
  }

  return notifications;
}
