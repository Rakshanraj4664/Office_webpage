// India Standard Time is UTC+05:30 and does not observe daylight saving time.
const IST_OFFSET_MS = 330 * 60_000;
export function istDateIso(now = Date.now()) {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}
export function slotTimeUtc(iso, hour, minute) {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MS;
}
export function availableSlots(iso, slots, now = Date.now()) {
  return slots.filter(slot => slotTimeUtc(iso, slot.hour, slot.min) > now);
}
export function calendarDays(monthIso) {
  const [year, month] = monthIso.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: count }, (_, i) => `${monthIso}-${String(i + 1).padStart(2, '0')}`)];
}
export function moveMonth(monthIso, offset) {
  const [year, month] = monthIso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 7);
}
