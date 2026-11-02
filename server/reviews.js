// Architecture review decisions. Requires Node 22.13+ and persistent storage.
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const hash = token => createHash('sha256').update(token).digest('hex');
let database;
function db() {
  if (!database) {
    const filename = process.env.REVIEW_DB_PATH || './server/data/reviews.sqlite';
    fs.mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
    database = new DatabaseSync(filename);
    database.exec(`PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS reviews (
      token_hash TEXT PRIMARY KEY, record TEXT NOT NULL, status TEXT NOT NULL,
      expires INTEGER NOT NULL, event_id TEXT NOT NULL, updated INTEGER NOT NULL
    )`);
    try { fs.chmodSync(filename, 0o600); } catch { /* permissions depend on filesystem */ }
  }
  return database;
}
export function reviewConfigured() {
  try {
    const origin = new URL(process.env.SITE_ORIGIN);
    return origin.protocol === 'https:' && origin.origin === process.env.SITE_ORIGIN && !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET && !!process.env.GOOGLE_REFRESH_TOKEN;
  } catch { return false; }
}
export function createReview(record) {
  const token = randomBytes(32).toString('base64url');
  // Google event IDs allow lowercase hexadecimal and remain stable across retries.
  const eventId = randomBytes(16).toString('hex');
  db().prepare('INSERT INTO reviews VALUES (?, ?, ?, ?, ?, ?)').run(hash(token), JSON.stringify(record), 'pending', Date.now() + 30 * 86400000, eventId, Date.now());
  return { token, url: `${process.env.SITE_ORIGIN}/review-decision?token=${encodeURIComponent(token)}` };
}
export function deleteReview(token) { db().prepare('DELETE FROM reviews WHERE token_hash = ? AND status = ?').run(hash(token), 'pending'); }
export function getReview(token) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token || '')) return null;
  // Recover interrupted operations after two minutes. Google event IDs are stable across retries.
  db().prepare("UPDATE reviews SET status = 'retry', updated = ? WHERE token_hash = ? AND status = 'accepting' AND updated < ?").run(Date.now(), hash(token), Date.now() - 120000);
  return db().prepare('SELECT * FROM reviews WHERE token_hash = ?').get(hash(token)) || null;
}
export function claimReview(token, status) {
  if (status === 'accepting') return Number(db().prepare("UPDATE reviews SET status = ?, updated = ? WHERE token_hash = ? AND status IN ('pending', 'retry') AND expires > ?").run(status, Date.now(), hash(token), Date.now()).changes) === 1;
  return Number(db().prepare("UPDATE reviews SET status = ?, updated = ? WHERE token_hash = ? AND status = 'pending' AND expires > ?").run(status, Date.now(), hash(token), Date.now()).changes) === 1;
}
export function setReviewStatus(token, from, status) {
  return Number(db().prepare('UPDATE reviews SET status = ?, updated = ? WHERE token_hash = ? AND status = ?').run(status, Date.now(), hash(token), from).changes) === 1;
}
async function googleFetch(url, options) {
  if (process.env.NODE_ENV === 'test' && process.env.GOOGLE_TEST_BASE_URL) url = process.env.GOOGLE_TEST_BASE_URL + new URL(url).pathname + new URL(url).search;
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  return response;
}
export async function createGoogleEvent(row) {
  const record = JSON.parse(row.record), b = record.booking;
  const [year, month, day] = b.dateIso.split('-').map(Number);
  const start = Date.UTC(year, month - 1, day, b.hourIst, b.minIst) - 330 * 60000;
  if (start <= Date.now()) throw new Error('The requested time has passed.');
  const tokenResponse = await googleFetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: process.env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  if (!tokenResponse.ok) throw new Error('Google authorization failed.');
  const { access_token } = await tokenResponse.json();
  if (!access_token) throw new Error('Google authorization failed.');
  const event = {
    id: row.event_id,
    summary: `Architecture Review — ${record.name}`,
    description: `Reference: ${record.referenceId}\nFormat: ${b.format}\n${record.overview}`,
    start: { dateTime: new Date(start).toISOString(), timeZone: 'Asia/Kolkata' },
    end: { dateTime: new Date(start + b.durationMin * 60000).toISOString(), timeZone: 'Asia/Kolkata' },
    attendees: [{ email: record.email }],
    conferenceData: { createRequest: { requestId: row.event_id, conferenceSolutionKey: { type: 'hangoutsMeet' } } }
  };
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`;
  const response = await googleFetch(url, { method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
  // A timeout or process restart may have created the event already. Never create a second one.
  let result;
  if (response.status === 409) {
    const existing = await googleFetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${row.event_id}`, { headers: { Authorization: `Bearer ${access_token}` } });
    if (!existing.ok) throw new Error('Could not verify the existing calendar event.');
    result = await existing.json();
  } else {
    if (!response.ok) throw new Error('Google Calendar could not create the event.');
    result = await response.json();
  }
  // Meet provisioning can be asynchronous; do not claim success without a link.
  if (!result.hangoutLink) throw new Error('Google Meet is still provisioning. Please retry.');
  return result.hangoutLink;
}
