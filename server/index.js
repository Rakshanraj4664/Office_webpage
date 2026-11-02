import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { getSmtpConfig, sendOfficeNotificationEmail, sendCareerApplication } from './mailer.js';
import Busboy from 'busboy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(
  process.env.API_PORT || (process.env.NODE_ENV === 'production' ? process.env.PORT || 3000 : 3001)
);
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const DIST_DIR = path.resolve(__dirname, '..', 'dist');


const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(payload));
}

// In-process limits are a safety net, not a replacement for an edge rate limiter.
const requests = new Map();
function rateLimited(req) {
  const now = Date.now();
  for (const [key, entry] of requests) if (entry.reset <= now) requests.delete(key);
  const key = req.socket.remoteAddress || 'unknown';
  const entry = requests.get(key) || { count: 0, reset: now + 10 * 60_000 };
  entry.count++;
  requests.set(key, entry);
  return entry.count > 10;
}
function validResume(resume) {
  if (!resume?.content?.length) return false;
  const ext = path.extname(resume.filename).toLowerCase();
  const b = resume.content;
  if (ext === '.pdf') return b.subarray(0, 5).toString() === '%PDF-';
  if (ext === '.docx') return b.length >= 4 && b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (ext === '.doc') return b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return false;
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if ((pathname === '/api/inquiries' || pathname === '/api/careers') && req.method === 'POST') {
    const origin = req.headers.origin;
    const siteOrigin = process.env.SITE_ORIGIN;
    if (req.headers['sec-fetch-site'] === 'cross-site' || (siteOrigin && origin && origin !== siteOrigin)) {
      return sendJson(res, 403, { error: 'Request origin is not allowed.' });
    }
    if (rateLimited(req)) {
      res.setHeader('Retry-After', '600');
      return sendJson(res, 429, { error: 'Too many requests. Please try again later.' });
    }
  }

  // A server-side redirect keeps the office WhatsApp destination in one place.
  if (pathname === '/api/whatsapp' && req.method === 'GET') {
    res.writeHead(302, { Location: 'https://wa.me/919626528585', 'Cache-Control': 'no-store' });
    return res.end();
  }

  if (pathname === '/api/health' && req.method === 'GET') {
    const cfg = getSmtpConfig();
    return sendJson(res, 200, {
      status: 'ok',
      service: 'Protovolt.io React API',
      officeEmail: cfg.officeEmail,
      smtpConfigured: cfg.isConfigured
    });
  }

  if (pathname === '/api/careers' && req.method === 'POST') {
    if (Number(req.headers['content-length'] || 0) > 5 * 1024 * 1024 + 64_000) return sendJson(res, 413, { error: 'Request too large.' });
    let parser;
    try {
      parser = Busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 8, fieldSize: 4000, parts: 9 } });
    } catch {
      return sendJson(res, 400, { error: 'Please submit the application form with a resume.' });
    }
    const fields = {};
    let resume = null;
    let invalid = false;
    parser.on('field', (name, value, info) => {
      if (info.valueTruncated || !['name', 'email', 'phone', 'role', 'experience', 'location', 'portfolio', 'message'].includes(name)) invalid = true;
      else if (Object.hasOwn(fields, name)) invalid = true;
      else fields[name] = value.trim();
    });
    parser.on('file', (name, stream, info) => {
      const chunks = [];
      if (name !== 'resume' || !/\.(pdf|doc|docx)$/i.test(info.filename)) invalid = true;
      stream.on('limit', () => { invalid = true; });
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => { resume = { filename: path.basename(info.filename).replace(/[\r\n]/g, ''), content: Buffer.concat(chunks) }; });
    });
    parser.on('filesLimit', () => { invalid = true; });
    parser.on('fieldsLimit', () => { invalid = true; });
    parser.on('partsLimit', () => { invalid = true; });
    parser.on('error', () => { if (!res.headersSent) sendJson(res, 400, { error: 'Could not read application.' }); });
    parser.on('close', async () => {
      if (res.headersSent) return;
      if (invalid || Object.entries(fields).some(([key, value]) => key !== 'message' && /[\r\n]/.test(value)) || !validResume(resume) || !fields.name || !fields.email || !fields.phone || !fields.role || !fields.experience || !fields.location ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
          ['name', 'email', 'phone', 'role', 'experience', 'location', 'portfolio'].some(key => (fields[key] || '').length > 200)) {
        return sendJson(res, 400, { error: 'Please complete the required fields and attach a PDF, DOC or DOCX resume of up to 5 MB.' });
      }
      try {
        await sendCareerApplication(fields, resume);
        return sendJson(res, 200, { status: 'sent' });
      } catch (err) {
        console.error('[Careers] Email delivery failed:', err.message);
        return sendJson(res, 503, { error: 'We could not send your application right now. Please try again later or email the office directly.' });
      }
    });
    let uploadBytes = 0;
    req.on('data', chunk => {
      uploadBytes += chunk.length;
      if (uploadBytes > 5 * 1024 * 1024 + 64_000 && !res.headersSent) {
        sendJson(res, 413, { error: 'Request too large.' });
        req.unpipe(parser); parser.destroy(); req.resume();
      }
    });
    req.on('error', () => { if (!res.headersSent) sendJson(res, 400, { error: 'Upload interrupted.' }); });
    req.pipe(parser);
    return;
  }

  if (pathname === '/api/inquiries' && req.method === 'POST') {
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return sendJson(res, 415, { error: 'Expected JSON.' });
    let body = '', tooLarge = false, size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 16_000) { tooLarge = true; return; }
      body += chunk;
    });
    req.on('end', async () => {
      try {
        if (tooLarge) return sendJson(res, 413, { error: 'Request too large.' });
        const data = JSON.parse(body || '{}');
        const name = String(data.name || '').trim();
        const email = String(data.email || '').trim();
        const overview = String(data.overview || '').trim();

        if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160 || !overview || overview.length > 4000 || /[\r\n]/.test(name + email)) {
          return sendJson(res, 400, {
            error: 'Name, work email, and project details are required.'
          });
        }

        const inquiryType = String(data.inquiryType || 'RFQ Consultation').trim();
        if (!['RFQ Consultation', 'Architecture Review'].includes(inquiryType)) return sendJson(res, 400, { error: 'Invalid request type.' });
        if (inquiryType === 'Architecture Review') {
          const b = data.booking;
          const date = typeof b?.dateIso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.dateIso) ? new Date(b.dateIso + 'T00:00:00Z') : null;
          const validDate = date && !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === b.dateIso;
          if (!validDate || ![30, 45].includes(b.durationMin) || ![[10, 0], [11, 30], [14, 30], [16, 30], [18, 0]].some(([h, m]) => b.hourIst === h && b.minIst === m) ||
            !['Video Call (Meet / Teams)', 'Phone / WhatsApp Call', 'On-Site Visit'].includes(b.format) ||
            !['Concept & Feasibility Review', 'System & Hardware Review', 'Factory Upgrade Review'].includes(b.track) ||
            typeof b.dateLabel !== 'string' || b.dateLabel.length > 100 || typeof b.timeSlot !== 'string' || b.timeSlot.length > 80) {
            return sendJson(res, 400, { error: 'Invalid review request details.' });
          }
        }
        const prefix = inquiryType === 'Architecture Review' ? 'PV-ARCH' : 'PV-RFQ';
        const year = new Date().getFullYear();
        const code = randomUUID().slice(0, 8).toUpperCase();

        const record = {
          referenceId: `${prefix}-${year}-${code}`,
          inquiryType,
          name: name.slice(0, 120),
          email: email.slice(0, 160),
          company: String(data.company || 'Independent / Unspecified').trim().slice(0, 160),
          phone: String(data.phone || '').trim().slice(0, 60),
          disciplines: Array.isArray(data.disciplines)
            ? data.disciplines.map((d) => String(d).slice(0, 80)).slice(0, 10)
            : [],
          stage: String(data.stage || 'Early Idea / Concept').trim().slice(0, 100),
          timeline: String(data.timeline || '1–3 Months').trim().slice(0, 100),
          ndaRequested: Boolean(data.ndaRequested),
          booking: inquiryType === 'Architecture Review' ? data.booking : null,
          overview: overview.slice(0, 4000),
          createdAt: new Date().toISOString()
        };

        const mailResult = await sendOfficeNotificationEmail(record);
        if (!mailResult.sent) return sendJson(res, 503, { error: 'We could not send your request. Please try again later or email the office directly.' });
        return sendJson(res, 201, { status: 'sent', inquiry: record });
      } catch {
        return sendJson(res, 400, { error: 'Invalid request payload.' });
      }
    });
    return;
  }

  if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Not found' });

  // Serve built static assets in production mode
  if (fs.existsSync(DIST_DIR)) {
    const safeRel = pathname === '/' ? '/index.html' : pathname;
    const targetPath = path.normalize(path.join(DIST_DIR, safeRel));
    if (
      targetPath.startsWith(DIST_DIR + path.sep) &&
      fs.existsSync(targetPath) &&
      fs.statSync(targetPath).isFile()
    ) {
      const ext = path.extname(targetPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(targetPath).pipe(res);
      return;
    }
    const spaFallback = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(spaFallback)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(spaFallback).pipe(res);
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.listen(PORT, HOST, () => {
  const cfg = getSmtpConfig();
  console.log(
    `Protovolt.io API server listening on http://${HOST}:${PORT} | Office Mail: ${cfg.officeEmail} (SMTP ${
      cfg.isConfigured ? 'READY' : 'AWAITING .env SMTP_PASS'
    })`
  );
});
