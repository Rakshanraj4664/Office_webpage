import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSmtpConfig, sendOfficeNotificationEmail } from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(
  process.env.API_PORT || (process.env.NODE_ENV === 'production' ? process.env.PORT || 3000 : 3001)
);
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'inquiries.json');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

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
  '.ico': 'image/x-icon'
};

function readInquiries() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeInquiries(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    const cfg = getSmtpConfig();
    return sendJson(res, 200, {
      status: 'ok',
      service: 'Protovolt.io React API',
      officeEmail: cfg.officeEmail,
      smtpConfigured: cfg.isConfigured
    });
  }

  if (pathname === '/api/inquiries' && req.method === 'GET') {
    return sendJson(res, 200, { inquiries: readInquiries() });
  }

  if (pathname === '/api/inquiries' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 250_000) req.destroy();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const name = String(data.name || '').trim();
        const email = String(data.email || '').trim();
        const overview = String(data.overview || '').trim();

        if (!name || !email || !overview) {
          return sendJson(res, 400, {
            error: 'Name, work email, and project details are required.'
          });
        }

        const inquiryType = String(data.inquiryType || 'RFQ Consultation').trim().slice(0, 80);
        const prefix = inquiryType === 'Architecture Review' ? 'PV-ARCH' : 'PV-RFQ';
        const year = new Date().getFullYear();
        const code = Math.floor(1000 + Math.random() * 9000);

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
          booking: data.booking && typeof data.booking === 'object' ? data.booking : null,
          overview: overview.slice(0, 4000),
          createdAt: new Date().toISOString()
        };

        // Send formatted notification email to tech@protovolt.io
        const mailResult = await sendOfficeNotificationEmail(record);

        record.emailNotification = {
          to: mailResult.to,
          sent: mailResult.sent,
          mode: mailResult.mode,
          subject: mailResult.subject,
          htmlPreview: mailResult.htmlPreview
        };

        const inquiries = readInquiries();
        inquiries.unshift(record);
        writeInquiries(inquiries);

        return sendJson(res, 201, {
          status: 'received',
          emailSent: mailResult.sent,
          emailMode: mailResult.mode,
          officeEmail: mailResult.to,
          inquiry: record
        });
      } catch {
        return sendJson(res, 400, { error: 'Invalid request payload.' });
      }
    });
    return;
  }

  // Serve built static assets in production mode
  if (fs.existsSync(DIST_DIR)) {
    const safeRel = pathname === '/' ? '/index.html' : pathname;
    const targetPath = path.normalize(path.join(DIST_DIR, safeRel));
    if (
      targetPath.startsWith(DIST_DIR) &&
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

server.listen(PORT, HOST, () => {
  const cfg = getSmtpConfig();
  console.log(
    `Protovolt.io API server listening on http://${HOST}:${PORT} | Office Mail: ${cfg.officeEmail} (SMTP ${
      cfg.isConfigured ? 'READY' : 'AWAITING .env SMTP_PASS'
    })`
  );
});
