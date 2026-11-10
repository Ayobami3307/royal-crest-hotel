// Pure date + pricing helpers. No database access, so they are easy to unit test.

export const VAT_RATE = 0.075; // 7.5% VAT
export const SERVICE_RATE = 0.05; // 5% service charge
export const MAX_NIGHTS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Parse "YYYY-MM-DD" into a UTC-midnight Date. Returns null for anything invalid (e.g. 2026-02-31). */
export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  if (d.toISOString().slice(0, 10) !== value) return null;
  return d;
}

/** "Today" as a UTC-midnight Date, according to the hotel's local timezone. */
export function todayInZone(timeZone = 'Africa/Lagos', now = new Date()) {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parseDate(iso);
}

export const addDays = (date, n) => new Date(date.getTime() + n * DAY_MS);
export const toISODate = (date) => date.toISOString().slice(0, 10);
export const nightsBetween = (checkIn, checkOut) => Math.round((checkOut - checkIn) / DAY_MS);

/** Two half-open ranges [aStart, aEnd) and [bStart, bEnd) overlap. Same-day turnover is allowed. */
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/**
 * Validate a requested stay.
 * @returns {{ok: true, checkIn: Date, checkOut: Date, nights: number} | {ok: false, error: string}}
 */
export function validateStay({ checkIn, checkOut }, { today = todayInZone() } = {}) {
  const ci = parseDate(checkIn);
  const co = parseDate(checkOut);
  if (!ci || !co) return { ok: false, error: 'Please choose valid check-in and check-out dates.' };
  if (ci < today) return { ok: false, error: 'Check-in date cannot be in the past.' };
  if (co <= ci) return { ok: false, error: 'Check-out must be at least one night after check-in.' };
  const nights = nightsBetween(ci, co);
  if (nights > MAX_NIGHTS) {
    return { ok: false, error: `Stays are limited to ${MAX_NIGHTS} nights. Please contact us for longer stays.` };
  }
  return { ok: true, checkIn: ci, checkOut: co, nights };
}

/** Price breakdown for a stay. The server is the single source of truth for totals. */
export function calculateTotal({ pricePerNight, nights }) {
  const subtotal = round2(pricePerNight * nights);
  const serviceCharge = round2(subtotal * SERVICE_RATE);
  const vat = round2((subtotal + serviceCharge) * VAT_RATE);
  const total = round2(subtotal + serviceCharge + vat);
  return { pricePerNight, nights, subtotal, serviceCharge, vat, total };
}
