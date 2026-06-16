import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  User, Course, TeeTimeSlot, Reservation, ScheduleBlock, Notification,
  ReservationStatus, PaymentState, NotificationEvent, NotificationChannel,
} from '../types';
import {
  mockCourse, mockUsers, generateTeeTimeSlots, generateScheduleBlocks,
  generateSampleReservations, generateSampleNotifications,
  ADMIN_USER_ID, GOLFER_USER_ID,
} from '../mockData';
import { generateId } from '../utils';

interface AppState {
  currentUser: User | null;
  course: Course;
  teeTimeSlots: TeeTimeSlot[];
  reservations: Reservation[];
  scheduleBlocks: ScheduleBlock[];
  notifications: Notification[];
  users: User[];
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  submitReservation: (data: Omit<Reservation, 'id' | 'status' | 'paymentState' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  cancelReservation: (id: string) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus, adminNotes?: string, customerFacingNote?: string) => Promise<void>;
  confirmMockPayment: (id: string, method: string) => Promise<void>;
  saveReservationNotes: (id: string, adminNotes: string, customerFacingNote: string) => Promise<void>;
  createTeeTimeSlot: (data: Omit<TeeTimeSlot, 'id'>) => Promise<string>;
  updateTeeTimeSlot: (id: string, updates: Partial<TeeTimeSlot>) => Promise<void>;
  disableTeeTimeSlot: (id: string) => Promise<void>;
  createScheduleBlock: (data: Omit<ScheduleBlock, 'id'>) => Promise<string>;
  deleteScheduleBlock: (id: string) => Promise<void>;
  getAvailableSlotsForDate: (date: string) => TeeTimeSlot[];
  getMyReservations: () => Reservation[];
  getDashboardMetrics: () => { pendingToday: number; approvedThisWeek: number; activeSlots: number; upcomingBlocks: number };
  getUserById: (id: string) => User | undefined;
  getReservationById: (id: string) => Reservation | undefined;
  getNotificationsForReservation: (reservationId: string) => Notification[];
}

const AppContext = createContext<AppContextType | null>(null);

const CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'admin@praderaverde.com': { password: 'admin123', userId: ADMIN_USER_ID },
  'juan@example.com': { password: 'golfer123', userId: GOLFER_USER_ID },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialReservations = generateSampleReservations();

  const [state, setState] = useState<AppState>({
    currentUser: null,
    course: mockCourse,
    teeTimeSlots: generateTeeTimeSlots(),
    reservations: initialReservations,
    scheduleBlocks: generateScheduleBlocks(),
    notifications: generateSampleNotifications(initialReservations),
    users: [...mockUsers],
  });

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600));
    const cred = CREDENTIALS[email.toLowerCase().trim()];
    if (!cred || cred.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const user = mockUsers.find(u => u.id === cred.userId);
    if (!user) return { success: false, error: 'User not found.' };
    setState(prev => ({ ...prev, currentUser: user }));
    return { success: true, role: user.role };
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    await new Promise(r => setTimeout(r, 600));
    if (state.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: generateId('user'),
      clerkId: generateId('clerk'),
      name: data.name,
      email: data.email,
      role: 'golfer',
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser], currentUser: newUser }));
    return { success: true };
  }, [state.users]);

  const submitReservation = useCallback(async (data: Omit<Reservation, 'id' | 'status' | 'paymentState' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(r => setTimeout(r, 800));
    const id = generateId('res');
    const now = Date.now();
    const newReservation: Reservation = {
      ...data,
      id,
      status: 'pending',
      paymentState: 'not_required',
      createdAt: now,
      updatedAt: now,
    };
    const newNotif: Notification = {
      id: generateId('notif'),
      userId: data.userId,
      reservationId: id,
      event: 'submitted',
      channel: 'email',
      status: 'sent_mock',
      createdAt: now,
    };
    setState(prev => ({
      ...prev,
      reservations: [...prev.reservations, newReservation],
      teeTimeSlots: prev.teeTimeSlots.map(s =>
        s.id === data.teeTimeSlotId && s.availableSpots > 0
          ? { ...s, availableSpots: s.availableSpots - 1 }
          : s
      ),
      notifications: [...prev.notifications, newNotif],
    }));
    return id;
  }, []);

  const cancelReservation = useCallback(async (id: string) => {
    await new Promise(r => setTimeout(r, 500));
    const now = Date.now();
    setState(prev => {
      const res = prev.reservations.find(r => r.id === id);
      if (!res) return prev;
      const newNotif: Notification = {
        id: generateId('notif'),
        userId: res.userId,
        reservationId: id,
        event: 'cancelled',
        channel: 'email',
        status: 'sent_mock',
        createdAt: now,
      };
      return {
        ...prev,
        reservations: prev.reservations.map(r =>
          r.id === id ? { ...r, status: 'cancelled' as ReservationStatus, updatedAt: now } : r
        ),
        notifications: [...prev.notifications, newNotif],
      };
    });
  }, []);

  const updateReservationStatus = useCallback(async (
    id: string, status: ReservationStatus, adminNotes?: string, customerFacingNote?: string,
  ) => {
    await new Promise(r => setTimeout(r, 600));
    const now = Date.now();
    setState(prev => {
      const res = prev.reservations.find(r => r.id === id);
      if (!res) return prev;
      let paymentState = res.paymentState;
      if (status === 'approved' && res.paymentState === 'not_required') {
        paymentState = 'unpaid';
      }
      const eventMap: Partial<Record<ReservationStatus, NotificationEvent>> = {
        approved: 'approved',
        rejected: 'rejected',
        cancelled: 'cancelled',
        completed: 'payment_confirmed',
      };
      const event = eventMap[status];
      const newNotifs: Notification[] = event ? [{
        id: generateId('notif'),
        userId: res.userId,
        reservationId: id,
        event,
        channel: 'email' as NotificationChannel,
        status: 'sent_mock',
        createdAt: now,
      }] : [];
      return {
        ...prev,
        reservations: prev.reservations.map(r =>
          r.id === id ? {
            ...r, status, paymentState, updatedAt: now,
            ...(adminNotes !== undefined ? { adminNotes } : {}),
            ...(customerFacingNote !== undefined ? { customerFacingNote } : {}),
          } : r
        ),
        notifications: [...prev.notifications, ...newNotifs],
      };
    });
  }, []);

  const confirmMockPayment = useCallback(async (id: string, _method: string) => {
    await new Promise(r => setTimeout(r, 1000));
    const now = Date.now();
    setState(prev => {
      const res = prev.reservations.find(r => r.id === id);
      if (!res) return prev;
      const newNotif: Notification = {
        id: generateId('notif'),
        userId: res.userId,
        reservationId: id,
        event: 'payment_confirmed',
        channel: 'email',
        status: 'sent_mock',
        createdAt: now,
      };
      return {
        ...prev,
        reservations: prev.reservations.map(r =>
          r.id === id ? { ...r, paymentState: 'paid_mock' as PaymentState, updatedAt: now } : r
        ),
        notifications: [...prev.notifications, newNotif],
      };
    });
  }, []);

  const saveReservationNotes = useCallback(async (id: string, adminNotes: string, customerFacingNote: string) => {
    await new Promise(r => setTimeout(r, 300));
    setState(prev => ({
      ...prev,
      reservations: prev.reservations.map(r =>
        r.id === id ? { ...r, adminNotes, customerFacingNote, updatedAt: Date.now() } : r
      ),
    }));
  }, []);

  const createTeeTimeSlot = useCallback(async (data: Omit<TeeTimeSlot, 'id'>) => {
    await new Promise(r => setTimeout(r, 300));
    const id = generateId('slot');
    setState(prev => ({ ...prev, teeTimeSlots: [...prev.teeTimeSlots, { ...data, id }] }));
    return id;
  }, []);

  const updateTeeTimeSlot = useCallback(async (id: string, updates: Partial<TeeTimeSlot>) => {
    await new Promise(r => setTimeout(r, 300));
    setState(prev => ({
      ...prev,
      teeTimeSlots: prev.teeTimeSlots.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const disableTeeTimeSlot = useCallback(async (id: string) => {
    await new Promise(r => setTimeout(r, 300));
    setState(prev => ({
      ...prev,
      teeTimeSlots: prev.teeTimeSlots.map(s => s.id === id ? { ...s, status: 'disabled' } : s),
    }));
  }, []);

  const createScheduleBlock = useCallback(async (data: Omit<ScheduleBlock, 'id'>) => {
    await new Promise(r => setTimeout(r, 300));
    const id = generateId('sblock');
    setState(prev => ({ ...prev, scheduleBlocks: [...prev.scheduleBlocks, { ...data, id }] }));
    return id;
  }, []);

  const deleteScheduleBlock = useCallback(async (id: string) => {
    await new Promise(r => setTimeout(r, 300));
    setState(prev => ({ ...prev, scheduleBlocks: prev.scheduleBlocks.filter(b => b.id !== id) }));
  }, []);

  const getAvailableSlotsForDate = useCallback((date: string) => {
    return state.teeTimeSlots.filter(s => s.date === date);
  }, [state.teeTimeSlots]);

  const getMyReservations = useCallback(() => {
    if (!state.currentUser) return [];
    return state.reservations.filter(r => r.userId === state.currentUser!.id);
  }, [state.currentUser, state.reservations]);

  const getDashboardMetrics = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      pendingToday: state.reservations.filter(r => r.status === 'pending' && r.preferredDate === todayStr).length,
      approvedThisWeek: state.reservations.filter(r => {
        if (r.status !== 'approved') return false;
        const d = new Date(r.preferredDate + 'T00:00:00');
        return d >= weekStart && d <= weekEnd;
      }).length,
      activeSlots: state.teeTimeSlots.filter(s => s.status === 'available').length,
      upcomingBlocks: state.scheduleBlocks.filter(b => new Date(b.startDate + 'T00:00:00') >= today).length,
    };
  }, [state.reservations, state.teeTimeSlots, state.scheduleBlocks]);

  const getUserById = useCallback((id: string) => state.users.find(u => u.id === id), [state.users]);
  const getReservationById = useCallback((id: string) => state.reservations.find(r => r.id === id), [state.reservations]);
  const getNotificationsForReservation = useCallback((reservationId: string) =>
    state.notifications.filter(n => n.reservationId === reservationId),
    [state.notifications]);

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, register,
      submitReservation, cancelReservation, updateReservationStatus, confirmMockPayment, saveReservationNotes,
      createTeeTimeSlot, updateTeeTimeSlot, disableTeeTimeSlot,
      createScheduleBlock, deleteScheduleBlock,
      getAvailableSlotsForDate, getMyReservations, getDashboardMetrics,
      getUserById, getReservationById, getNotificationsForReservation,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
