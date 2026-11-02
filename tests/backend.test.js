import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { SMTPServer } from 'smtp-server';

async function unusedPort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port;
}
async function startApi(port, smtpPort, password) {
  const proc = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, NODE_ENV: 'test', API_PORT: String(port), SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtpPort), SMTP_SECURE: 'false', SMTP_USER: 'test@example.com', SMTP_PASS: password, OFFICE_EMAIL: 'office@example.com', SITE_ORIGIN: 'https://example.test' }, stdio: ['ignore', 'pipe', 'pipe'] });
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
  let res = await fetch(url + '/api/inquiries'); assert.equal(res.status, 404);
  res = await fetch(url + '/api/inquiries', json({})); assert.equal(res.status, 400);
  res = await fetch(url + '/api/inquiries', { ...json(sample), headers: { 'Content-Type': 'application/json', Origin: 'https://evil.test' } }); assert.equal(res.status, 403);
  res = await fetch(url + '/api/inquiries', json(sample)); assert.equal(res.status, 201);
  assert.equal((await res.json()).status, 'sent'); assert.match(received[0], /Project details/);
  res = await fetch(url + '/api/inquiries', json({ ...sample, inquiryType: 'Architecture Review', booking: {} })); assert.equal(res.status, 400);
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: 'Applicant', email: 'candidate@example.com', phone: '1234567890', role: 'Engineer', experience: 'Fresher', location: 'Chennai' })) form.set(key, value);
  form.set('resume', new Blob(['%PDF-1.4\nresume']), 'resume.pdf');
  res = await fetch(url + '/api/careers', { method: 'POST', headers: { Origin: 'https://example.test' }, body: form });
  assert.equal(res.status, 200); assert.equal(received.length, 2); assert.match(received[1], /resume.pdf/);
  form.set('resume', new Blob(['not a pdf']), 'resume.pdf');
  res = await fetch(url + '/api/careers', { method: 'POST', headers: { Origin: 'https://example.test' }, body: form }); assert.equal(res.status, 400);
});

test('unconfigured SMTP never reports inquiry success', async t => {
  const port = await unusedPort(); const api = await startApi(port, 12345, ''); t.after(() => { api.kill(); });
  const response = await fetch(`http://127.0.0.1:${port}/api/inquiries`, json(sample));
  assert.equal(response.status, 503);
});
