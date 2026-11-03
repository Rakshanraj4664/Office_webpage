import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { SMTPServer } from 'smtp-server';

async function unusedPort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port;
}
async function startApi(port, smtpPort, password, extra = {}) {
  const proc = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, NODE_ENV: 'test', API_PORT: String(port), SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtpPort), SMTP_SECURE: 'false', SMTP_USER: 'test@example.com', SMTP_PASS: password, OFFICE_EMAIL: 'office@example.com', SITE_ORIGIN: 'https://example.test', GOOGLE_CLIENT_ID: 'test', GOOGLE_CLIENT_SECRET: 'test', GOOGLE_REFRESH_TOKEN: 'test', REVIEW_DB_PATH: path.join(os.tmpdir(), `reviews-test-${port}.sqlite`), ...extra }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  proc.stderr.on('data', chunk => { output += chunk; });
  await Promise.race([
    new Promise((resolve, reject) => { proc.stdout.on('data', chunk => { if (String(chunk).includes('listening')) resolve(); }); proc.once('exit', () => reject(new Error(output))); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('API startup timeout')), 5000))
  ]);
  return proc;
}
const sample = { name: 'Test User', email: 'test@example.com', overview: 'Project details' };
const json = data => ({ method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.test' }, body: JSON.stringify(data) });

test('API delivers submissions, validates inputs and does not expose an inbox', async t => {
  const received = [];
  const smtp = new SMTPServer({ disabledCommands: ['STARTTLS'], onAuth(_auth, _session, callback) { callback(null, { user: 'test' }); }, onData(stream, _session, callback) { let text = ''; stream.on('data', chunk => { text += chunk; }); stream.on('end', () => { received.push(text); callback(); }); } });
  await new Promise(resolve => smtp.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => smtp.close(resolve)));
  const port = await unusedPort(); const api = await startApi(port, smtp.server.address().port, 'test-password');
  t.after(() => { api.kill(); });
  const url = `http://127.0.0.1:${port}`;
  let res = await fetch(url + '/api/whatsapp', { redirect: 'manual' });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://wa.me/919626528585');
  res = await fetch(url + '/api/inquiries'); assert.equal(res.status, 404);
  res = await fetch(url + '/api/inquiries', json({})); assert.equal(res.status, 400);
  res = await fetch(url + '/api/inquiries', { ...json(sample), headers: { 'Content-Type': 'application/json', Origin: 'https://evil.test' } }); assert.equal(res.status, 403);
  res = await fetch(url + '/api/inquiries', json(sample)); assert.equal(res.status, 201);
  assert.equal((await res.json()).status, 'sent'); assert.match(received[0], /Project details/);
  res = await fetch(url + '/api/inquiries', json({ ...sample, inquiryType: 'Architecture Review', booking: {} })); assert.equal(res.status, 400);
  const future = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const booking = { dateIso: future, dateLabel: future, timeSlot: '03:00 AM IST', hourIst: 3, minIst: 0, durationMin: 45, format: 'Video Call (Meet / Teams)', track: 'System & Hardware Review' };
  res = await fetch(url + '/api/inquiries', json({ ...sample, inquiryType: 'Architecture Review', booking }));
  assert.equal(res.status, 201);
  assert.match(received[1], /03:00 AM IST/);
  res = await fetch(url + '/api/inquiries', json({ ...sample, inquiryType: 'Architecture Review', booking: { ...booking, dateIso: '2000-01-01' } }));
  assert.equal(res.status, 400);
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: 'Applicant', email: 'candidate@example.com', phone: '1234567890', role: 'Engineer', experience: 'Fresher', location: 'Chennai' })) form.set(key, value);
  form.set('resume', new Blob(['%PDF-1.4\nresume']), 'resume.pdf');
  res = await fetch(url + '/api/careers', { method: 'POST', headers: { Origin: 'https://example.test' }, body: form });
  assert.equal(res.status, 200); assert.equal(received.length, 3); assert.match(received[2], /resume.pdf/);
  form.set('resume', new Blob(['not a pdf']), 'resume.pdf');
  res = await fetch(url + '/api/careers', { method: 'POST', headers: { Origin: 'https://example.test' }, body: form }); assert.equal(res.status, 400);
});

test('unconfigured SMTP never reports inquiry success', async t => {
  const port = await unusedPort(); const api = await startApi(port, 12345, ''); t.after(() => { api.kill(); });
  const response = await fetch(`http://127.0.0.1:${port}/api/inquiries`, json(sample));
  assert.equal(response.status, 503);
});


test('review decision requires confirmation, decline is silent, and acceptance creates one Google invitation', async t => {
  const received = [], events = [];
  let failGoogle = false;
  const smtp = new SMTPServer({ disabledCommands: ['STARTTLS'], onAuth(_a, _s, cb) { cb(null, { user: 'test' }); }, onData(stream, _s, cb) { let text = ''; stream.on('data', c => { text += c; }); stream.on('end', () => { received.push(text); cb(); }); } });
  await new Promise(resolve => smtp.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => smtp.close(resolve)));
  const google = http.createServer((req, res) => {
    let body = ''; req.on('data', chunk => body += chunk); req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if (req.url === '/token') { if (failGoogle) { res.writeHead(503); return res.end('{}'); } return res.end(JSON.stringify({ access_token: 'test' })); }
      if (req.method === 'POST' && req.url.startsWith('/calendar/v3/')) { events.push({ event: JSON.parse(body), url: req.url }); return res.end(JSON.stringify({ hangoutLink: 'https://meet.google.com/test' })); }
      res.writeHead(404); res.end('{}');
    });
  });
  await new Promise(resolve => google.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => google.close(resolve)));
  const port = await unusedPort(), dbPath = path.join(os.tmpdir(), `review-flow-${port}.sqlite`);
  const api = await startApi(port, smtp.server.address().port, 'test-password', { REVIEW_DB_PATH: dbPath, GOOGLE_TEST_BASE_URL: `http://127.0.0.1:${google.address().port}` });
  t.after(() => { api.kill(); for (const suffix of ['', '-wal', '-shm']) try { fs.unlinkSync(dbPath + suffix); } catch {} });
  const url = `http://127.0.0.1:${port}`;
  const booking = { dateIso: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), dateLabel: 'Future date', timeSlot: '03:00 AM IST', hourIst: 3, minIst: 0, durationMin: 45, format: 'Video Call (Meet / Teams)', track: 'System & Hardware Review' };
  async function request() {
    const response = await fetch(url + '/api/inquiries', json({ ...sample, inquiryType: 'Architecture Review', booking }));
    assert.equal(response.status, 201);
    const payload = await response.json(); assert.equal(payload.inquiry.decisionUrl, undefined);
    const text = received.at(-1).replace(/=\r?\n/g, '').replace(/=3D/g, '=');
    const token = text.match(/review-decision\?token=([A-Za-z0-9_-]{43})/)[1];
    return token;
  }
  const token = await request();
  let response = await fetch(url + '/api/review-decision?token=' + token);
  assert.equal(response.status, 200); assert.equal(events.length, 0);
  const post = (token, decision) => fetch(url + '/api/review-decision', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://example.test' }, body: new URLSearchParams({ token, decision }) });
  response = await post(token, 'decline'); assert.equal(response.status, 200); assert.equal(events.length, 0); assert.equal(received.length, 1);
  response = await post(token, 'accept'); assert.equal(response.status, 409);
  const token2 = await request();
  failGoogle = true;
  response = await post(token2, 'accept'); assert.equal(response.status, 503);
  response = await post(token2, 'decline'); assert.equal(response.status, 409);
  failGoogle = false;
  response = await post(token2, 'accept'); assert.equal(response.status, 200); assert.equal(events.length, 1);
  assert.equal(events[0].event.attendees[0].email, sample.email);
  assert.equal(events[0].event.conferenceData.createRequest.conferenceSolutionKey.type, 'hangoutsMeet');
  assert.match(events[0].url, /sendUpdates=all/);
  response = await post(token2, 'accept'); assert.equal(response.status, 409); assert.equal(events.length, 1);
});

test('review configuration and storage failures are not reported as invalid form data', async t => {
  const booking = { dateIso: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), dateLabel: 'Future', timeSlot: '10:00 AM IST', hourIst: 10, minIst: 0, durationMin: 30, format: 'Video Call (Meet / Teams)', track: 'Concept & Feasibility Review' };
  const port = await unusedPort();
  const api = await startApi(port, 12345, 'test-password', { REVIEW_DB_PATH: '/dev/null/reviews.sqlite' });
  t.after(() => api.kill());
  const response = await fetch(`http://127.0.0.1:${port}/api/inquiries`, json({ ...sample, inquiryType: 'Architecture Review', booking }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /could not process/i);
});
