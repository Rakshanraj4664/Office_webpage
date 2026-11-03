import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableSlots, calendarDays, istDateIso, moveMonth, slotTimeUtc } from '../src/utils/reviewDates.js';

test('only future half-hour slots are offered, using IST irrespective of visitor time zone', () => {
  const slots = [{ hour: 17, min: 0 }, { hour: 17, min: 30 }, { hour: 18, min: 0 }];
  const now = Date.parse('2026-11-02T11:52:00Z'); // 17:22 IST
  assert.equal(istDateIso(now), '2026-11-02');
  assert.deepEqual(availableSlots('2026-11-02', slots, now), slots.slice(1));
  assert.deepEqual(availableSlots('2026-11-03', slots, now), slots);
  assert.deepEqual(availableSlots('2026-11-01', slots, now), []);
  assert.deepEqual(availableSlots('2026-11-02', slots, slotTimeUtc('2026-11-02', 18, 0)), []);
});

test('calendar handles IST midnight, month boundaries and leap years', () => {
  assert.equal(istDateIso(Date.parse('2026-11-02T18:30:00Z')), '2026-11-03');
  assert.equal(moveMonth('2026-12', 1), '2027-01');
  assert.equal(moveMonth('2027-01', -1), '2026-12');
  const feb = calendarDays('2028-02');
  assert.equal(feb.filter(Boolean).length, 29);
  assert.equal(feb[2], '2028-02-01');
  assert.equal(feb.at(-1), '2028-02-29');
});
