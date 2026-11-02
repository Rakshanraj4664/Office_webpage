import { COMPANY_INFO } from '../data/protovoltData';

export async function submitInquiryRecord(payload) {
  let response;
  try {
    response = await fetch('/api/inquiries', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('Could not connect. Please try again or email the office directly.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.inquiry) throw new Error(result.error || 'Could not send your request. Please try again or email the office directly.');
  return result.inquiry;
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
    'STATUS:TENTATIVE',
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
