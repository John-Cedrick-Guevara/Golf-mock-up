export function formatDate(dateStr: string, format: 'full' | 'medium' | 'short' = 'medium'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    medium: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
    short: { month: 'short', day: 'numeric' },
  };
  return date.toLocaleDateString('en-US', opts[format]);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayString(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateToString(today);
}

export function isUpcoming(dateStr: string): boolean {
  const today = todayString();
  return dateStr >= today;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}
