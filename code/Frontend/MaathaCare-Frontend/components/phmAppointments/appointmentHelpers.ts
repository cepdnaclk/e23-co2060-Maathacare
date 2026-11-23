import type { Appointment } from './appointmentTypes';

export const COLORS = {
  primary: '#0056B3',
  primaryLight: '#1E73E8',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
};

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDate = () => formatLocalDate(new Date());

export const getHeaderDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
  });
};

export const generateDateStrip = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 15; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);

    dates.push({
      dayName: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: String(nextDate.getDate()).padStart(2, '0'),
      monthName: nextDate.toLocaleDateString('en-US', { month: 'short' }),
      full: formatLocalDate(nextDate),
    });
  }

  return dates;
};

export const isTimePassed = (appointment: Appointment | null) => {
  if (!appointment?.fullDate || !appointment?.time) return false;

  const dateParts = appointment.fullDate.split('-');
  const [timeValue, periodValue] = appointment.time.split(' ');
  const [hourText, minuteText] = timeValue.split(':');

  let hours = parseInt(hourText, 10);
  const minutes = parseInt(minuteText, 10);
  const period = periodValue?.toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const appointmentDate = new Date(
    parseInt(dateParts[0], 10),
    parseInt(dateParts[1], 10) - 1,
    parseInt(dateParts[2], 10),
    hours,
    minutes,
  );

  return new Date() >= appointmentDate;
};

export const getStatusStyle = (status?: string) => {
  const normalized = status?.toUpperCase();

  switch (normalized) {
    case 'COMPLETED':
      return { label: 'Completed', bg: '#DCFCE7', color: '#15803D' };
    case 'MISSED':
      return { label: 'Missed', bg: '#FFEDD5', color: '#C2410C' };
    default:
      return { label: 'Upcoming', bg: '#DBEAFE', color: '#1D4ED8' };
  }
};
