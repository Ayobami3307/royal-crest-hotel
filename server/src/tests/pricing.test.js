import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDate,
  validateStay,
  calculateTotal,
  nightsBetween,
  rangesOverlap,
  todayInZone,
  MAX_NIGHTS,
} from '../utils/pricing.js';

const today = parseDate('2026-11-08');

test('parseDate accepts real dates and rejects impossible ones', () => {
  assert.ok(parseDate('2026-11-08'));
  assert.equal(parseDate('2026-02-31'), null);
  assert.equal(parseDate('08/11/2026'), null);
  assert.equal(parseDate(undefined), null);
});

test('validateStay rejects past check-in', () => {
  const r = validateStay({ checkIn: '2026-11-07', checkOut: '2026-11-09' }, { today });
  assert.equal(r.ok, false);
});

test('validateStay allows check-in today', () => {
  const r = validateStay({ checkIn: '2026-11-08', checkOut: '2026-11-09' }, { today });
  assert.equal(r.ok, true);
  assert.equal(r.nights, 1);
});

test('validateStay rejects check-out on or before check-in', () => {
  assert.equal(validateStay({ checkIn: '2026-11-10', checkOut: '2026-11-10' }, { today }).ok, false);
  assert.equal(validateStay({ checkIn: '2026-11-10', checkOut: '2026-11-09' }, { today }).ok, false);
});

test('validateStay enforces the maximum length of stay', () => {
  const ok = validateStay({ checkIn: '2026-11-10', checkOut: '2026-12-10' }, { today });
  assert.equal(ok.ok, true);
  assert.equal(ok.nights, MAX_NIGHTS);
  const tooLong = validateStay({ checkIn: '2026-11-10', checkOut: '2026-12-11' }, { today });
  assert.equal(tooLong.ok, false);
});

test('calculateTotal adds service charge then VAT', () => {
  const t = calculateTotal({ pricePerNight: 200, nights: 3 });
  assert.equal(t.subtotal, 600);
  assert.equal(t.serviceCharge, 30);
  assert.equal(t.vat, 47.25);
  assert.equal(t.total, 677.25);
});

test('nightsBetween counts nights', () => {
  assert.equal(nightsBetween(parseDate('2026-11-10'), parseDate('2026-11-14')), 4);
});

test('rangesOverlap allows same-day turnover but blocks real overlaps', () => {
  const d = parseDate;
  assert.equal(rangesOverlap(d('2026-11-10'), d('2026-11-12'), d('2026-11-12'), d('2026-11-14')), false);
  assert.equal(rangesOverlap(d('2026-11-10'), d('2026-11-13'), d('2026-11-12'), d('2026-11-14')), true);
  assert.equal(rangesOverlap(d('2026-11-10'), d('2026-11-20'), d('2026-11-12'), d('2026-11-14')), true);
});

test('todayInZone returns a UTC-midnight date', () => {
  const t = todayInZone('Africa/Lagos', new Date('2026-11-08T23:30:00Z'));
  // 23:30 UTC is already 00:30 on the 9th in Lagos (UTC+1)
  assert.equal(t.toISOString().slice(0, 10), '2026-11-09');
});
