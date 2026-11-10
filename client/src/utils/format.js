import { CURRENCY } from '../config';

const moneyCache = new Map();
export function money(amount, { decimals } = {}) {
  const n = Number(amount) || 0;
  const digits = decimals ?? (Number.isInteger(n) ? 0 : 2);
  const key = `${CURRENCY}-${digits}`;
  if (!moneyCache.has(key)) {
    moneyCache.set(key, new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY, minimumFractionDigits: digits, maximumFractionDigits: digits }));
  }
  return moneyCache.get(key).format(n);
}

// Stay dates are calendar dates (no time of day). The API stores them as UTC midnight, so format in UTC.
export const formatDate = (value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  value ? new Date(value).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' }) : '-';
export const formatDateLong = (value) => formatDate(value, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const pad = (n) => String(n).padStart(2, '0');
/** Today's date in the browser's timezone as YYYY-MM-DD (what <input type="date"> expects). */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function addDaysISO(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const nightsBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);
export const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  cancelled: 'Cancelled',
};
