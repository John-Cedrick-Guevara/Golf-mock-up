import { createBrowserRouter } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { BookingPage } from './pages/BookingPage';
import { MyReservationsPage } from './pages/MyReservationsPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { PaymentPage } from './pages/PaymentPage';
import { GolferDashboardPage } from './pages/GolferDashboardPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ReservationsPage } from './pages/admin/ReservationsPage';
import { AdminReservationDetailPage } from './pages/admin/AdminReservationDetailPage';
import { CalendarPage } from './pages/admin/CalendarPage';
import { BlocksPage } from './pages/admin/BlocksPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';

function NotFound() {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: '400', color: '#1A1A18', marginBottom: '12px' }}>
        Page not found
      </h1>
      <a href="/" style={{ fontSize: '14px', color: '#2D5016', fontWeight: '500', textDecoration: 'none' }}>
        Go home
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'booking', Component: BookingPage },
      { path: 'dashboard', Component: GolferDashboardPage },
      { path: 'my-reservations', Component: MyReservationsPage },
      { path: 'my-reservations/:id', Component: ReservationDetailPage },
      { path: 'payment/:id', Component: PaymentPage },
      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/sign-in',
    Component: SignInPage,
  },
  {
    path: '/sign-up',
    Component: SignUpPage,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'reservations', Component: ReservationsPage },
      { path: 'reservations/:id', Component: AdminReservationDetailPage },
      { path: 'calendar', Component: CalendarPage },
      { path: 'blocks', Component: BlocksPage },
      { path: 'notifications', Component: NotificationsPage },
    ],
  },
]);
