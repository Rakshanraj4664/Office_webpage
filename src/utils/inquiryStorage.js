import { COMPANY_INFO } from '../data/protovoltData';

const STORAGE_KEY = 'protovolt_inquiries_v2';
const memoryFallback = [];

function readLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Safe fallback when storage is restricted
  }
}

export async function fetchAllInquiries() {
  try {
    const res = await fetch('/api/inquiries');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.inquiries)) {
        writeLocal(data.inquiries);
        return data.inquiries;
      }
    }
  } catch {
    // Offline or static-host fallback
  }
  const local = readLocal();
  const seen = new Set(local.map((x) => x.referenceId));
  return [...local, ...memoryFallback.filter((m) => !seen.has(m.referenceId))];
}

export async function submitInquiryRecord(payload) {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.inquiry) {
        if (payload.booking) data.inquiry.booking = payload.booking;
        return data.inquiry;
      }
    }
  } catch {
    // Offline fallback below
  }

  const year = new Date().getFullYear();
  const code = Math.floor(1000 + Math.random() * 9000);
  const prefix = payload.inquiryType === 'Architecture Review' ? 'PV-ARCH' : 'PV-RFQ';
  const record = {
    referenceId: `${prefix}-${year}-${code}`,
    ...payload,
    company: payload.company || 'Independent / Unspecified',
    createdAt: new Date().toISOString()
  };

  memoryFallback.unshift(record);
  const list = readLocal();
  if (!list.some((x) => x.referenceId === record.referenceId)) {
    list.unshift(record);
    writeLocal(list);
  }
  return record;
}

export function downloadTextReceipt(record) {
  const txt = [
    '============================================================',
    `${COMPANY_INFO.name.toUpperCase()} — PROJECT INQUIRY BRIEF`,
    `Email: ${COMPANY_INFO.email} | Phone: ${COMPANY_INFO.phoneDisplay}`,
    `Address: ${COMPANY_INFO.address}`,
    `GST: ${COMPANY_INFO.gst}`,
    '============================================================',
    `Reference ID : ${record.referenceId}`,
    `Submitted At : ${new Date(record.createdAt).toLocaleString()}`,
    `Name         : ${record.name}`,
    `Email        : ${record.email}`,
    `Company      : ${record.company}`,
    `Phone        : ${record.phone || 'Not provided'}`,
    `Core Areas   : ${record.disciplines?.length ? record.disciplines.join(', ') : 'General Engineering'}`,
    `Project Stage: ${record.stage}`,
    `Timeline     : ${record.timeline}`,
    `Mutual NDA   : ${record.ndaRequested ? 'Requested' : 'Not requested'}`,
    '------------------------------------------------------------',
    'PROJECT DETAILS:',
    record.overview,
    '============================================================'
  ].join('\n');

  triggerDownload(txt, `${record.referenceId}.txt`, 'text/plain;charset=utf-8');
}

export function downloadInquiriesCsv(list) {
  if (!list.length) return;
  const headers = [
    'Reference ID',
    'Created At',
    'Type',
    'Name',
    'Email',
    'Company',
    'Phone',
    'Core Areas',
    'Stage',
    'Timeline',
    'NDA',
    'Details'
  ];
  const rows = list.map((r) => [
    r.referenceId,
    r.createdAt,
    r.inquiryType || 'RFQ Consultation',
    r.name,
    r.email,
    r.company,
    r.phone || '',
    (r.disciplines || []).join(' | '),
    r.stage,
    r.timeline,
    r.ndaRequested ? 'Yes' : 'No',
    r.overview
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  triggerDownload(csv, 'protovolt-inquiries.csv', 'text/csv;charset=utf-8');
}

export function downloadBookingIcs({ record, dateObj, bookingMeta, topic }) {
  const startUtcMs =
    Date.UTC(dateObj.year, dateObj.monthIdx, dateObj.day, bookingMeta.hourIst, bookingMeta.minIst, 0) -
    (5 * 60 + 30) * 60 * 1000;
  const endUtcMs = startUtcMs + bookingMeta.durationMin * 60 * 1000;

  const fmtUtc = (ms) => {
    const d = new Date(ms);
    const pad = (n) => String(n).padStart(2, '0');
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      '00Z'
    );
  };

  const escapeIcs = (str) =>
    String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Protovolt.io//Architecture Review//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${record.referenceId}@protovolt.io`,
    `DTSTAMP:${fmtUtc(Date.now())}`,
    `DTSTART:${fmtUtc(startUtcMs)}`,
    `DTEND:${fmtUtc(endUtcMs)}`,
    `SUMMARY:${escapeIcs(`${COMPANY_INFO.name} Architecture Review — ${bookingMeta.track}`)}`,
    `LOCATION:${escapeIcs(
      bookingMeta.format === 'On-Site Visit'
        ? `${COMPANY_INFO.name}, ${COMPANY_INFO.address}`
        : bookingMeta.format
    )}`,
    `DESCRIPTION:${escapeIcs(`Booking ID: ${record.referenceId}\nHost: ${COMPANY_INFO.name} (${COMPANY_INFO.email} / ${COMPANY_INFO.phoneDisplay})\nAttendee: ${record.name} (${record.email})\nTopic: ${topic}`)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  triggerDownload(lines, `${record.referenceId}.ics`, 'text/calendar;charset=utf-8');
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
