import nodemailer from 'nodemailer';

const COMPANY = {
  name: 'Protovolt.io',
  email: 'tech@protovolt.io',
  phone: '+91 96265 28585',
  address: '2/52, Sudha Rice Mill, Nathampalayam, Semnianallur, Avinashi - 641654',
  gst: '33ABJFP3401A1ZY'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeIcs(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE ?? 'true').toLowerCase() !== 'false';
  const user = (process.env.SMTP_USER || COMPANY.email).trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const officeEmail = (process.env.OFFICE_EMAIL || COMPANY.email).trim();

  const isConfigured =
    Boolean(pass) && pass !== 'your_16_char_google_app_password';

  return { host, port, secure, user, pass, officeEmail, isConfigured };
}

function buildBookingIcsAttachment(record) {
  const b = record.booking;
  if (!b || !b.dateIso) return null;

  const [yyyy, mm, dd] = String(b.dateIso).split('-').map(Number);
  if (!yyyy || !mm || !dd) return null;

  const hourIst = Number(b.hourIst ?? 14);
  const minIst = Number(b.minIst ?? 30);
  const durationMin = Number(b.durationMin || 45);

  const startUtcMs =
    Date.UTC(yyyy, mm - 1, dd, hourIst, minIst, 0) - (5 * 60 + 30) * 60 * 1000;
  const endUtcMs = startUtcMs + durationMin * 60 * 1000;

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

  const location =
    b.format === 'On-Site Visit'
      ? `${COMPANY.name}, ${COMPANY.address}`
      : b.format || 'Video Call';

  const content = [
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
    `SUMMARY:${escapeIcs(`${COMPANY.name} Architecture Review — ${record.name} (${record.company})`)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(
      `Booking ID: ${record.referenceId}\nClient: ${record.name} (${record.email}${record.phone ? ', ' + record.phone : ''})\nCompany: ${record.company}\nSession: ${durationMin} Min · ${b.track}\nDetails: ${record.overview}`
    )}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return {
    filename: `${record.referenceId}.ics`,
    content,
    contentType: 'text/calendar; charset=utf-8; method=PUBLISH'
  };
}

export function buildOfficeEmailContent(record) {
  const isBooking = record.inquiryType === 'Architecture Review';
  const b = record.booking || null;

  const submittedIst = new Date(record.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const subject = isBooking
    ? `[Protovolt.io Booking] ${record.referenceId} — ${b?.dateLabel || record.timeline} (${record.name})`
    : `[Protovolt.io Inquiry] ${record.referenceId} — ${record.name} (${record.company})`;

  const coreAreasText =
    record.disciplines && record.disciplines.length
      ? record.disciplines.join(', ')
      : 'Not specified (General Consultation)';

  const digitsOnlyPhone = String(record.phone || '').replace(/\D/g, '');
  const whatsappUrl =
    digitsOnlyPhone.length >= 10
      ? `https://wa.me/${digitsOnlyPhone.length === 10 ? '91' + digitsOnlyPhone : digitsOnlyPhone}`
      : null;

  const text = [
    '============================================================',
    isBooking
      ? `${COMPANY.name.toUpperCase()} — NEW ARCHITECTURE REVIEW BOOKING`
      : `${COMPANY.name.toUpperCase()} — NEW PROJECT CONSULTATION BRIEF`,
    '============================================================',
    `Reference ID   : ${record.referenceId}`,
    `Submitted (IST): ${submittedIst}`,
    `Type           : ${isBooking ? 'Book Architecture Review' : 'Project Consultation Brief'}`,
    '',
    'CLIENT DETAILS',
    '------------------------------------------------------------',
    `Full Name      : ${record.name}`,
    `Work Email     : ${record.email}`,
    `Company        : ${record.company}`,
    `Phone/WhatsApp : ${record.phone || 'Not provided'}`,
    `Mutual NDA     : ${record.ndaRequested ? 'YES — Mutual NDA Requested' : 'No'}`,
    '',
    ...(isBooking && b
      ? [
          'SCHEDULED SESSION',
          '------------------------------------------------------------',
          `Session Type   : ${b.track} (${b.durationMin} Min)`,
          `Date           : ${b.dateLabel}`,
          `Time Slot      : ${b.timeSlot}`,
          `Meeting Format : ${b.format}`,
          `Core Areas     : ${coreAreasText}`,
          ''
        ]
      : [
          'PROJECT SCOPE',
          '------------------------------------------------------------',
          `Core Areas     : ${coreAreasText}`,
          `Project Stage  : ${record.stage}`,
          `Timeline       : ${record.timeline}`,
          ''
        ]),
    isBooking ? 'DISCUSSION TOPIC' : 'PROJECT DETAILS',
    '------------------------------------------------------------',
    record.overview,
    '============================================================',
    `${COMPANY.name} | ${COMPANY.email} | ${COMPANY.phone} | GST: ${COMPANY.gst}`
  ].join('\n');

  const bookingBannerHtml =
    isBooking && b
      ? `
      <div style="margin:20px 0;padding:16px 18px;background:#FFF5F0;border:1px solid #F6C5B2;border-left:4px solid #DF4B18;border-radius:8px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#DF4B18;margin-bottom:6px;">
          Scheduled Architecture Review
        </div>
        <div style="font-size:16px;font-weight:700;color:#111317;margin-bottom:4px;">
          ${escapeHtml(b.dateLabel)} &middot; ${escapeHtml(b.timeSlot)}
        </div>
        <div style="font-size:13.5px;color:#4A4F5A;">
          <strong>Session:</strong> ${escapeHtml(b.durationMin)} Min &middot; ${escapeHtml(b.track)}<br/>
          <strong>Format:</strong> ${escapeHtml(b.format)}
        </div>
      </div>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#F5F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111317;">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #DFDDD4;border-radius:12px;overflow:hidden;">
    <!-- Top Header -->
    <div style="background:#101216;padding:22px 26px;border-bottom:3px solid #DF4B18;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#FF6B35;">
        ${isBooking ? 'New Architecture Review Booking' : 'New Project Consultation Brief'}
      </div>
      <div style="font-size:21px;font-weight:700;color:#FFFFFF;margin-top:4px;">
        ${escapeHtml(COMPANY.name)} &mdash; Lead Notification
      </div>
      <div style="font-size:12.5px;color:#9BA2B0;margin-top:4px;">
        Ref: <strong style="color:#F6F5F0;">${escapeHtml(record.referenceId)}</strong> &bull; Received ${escapeHtml(submittedIst)} IST
      </div>
    </div>

    <div style="padding:24px 26px;">
      ${bookingBannerHtml}

      <!-- Client Details Table -->
      <div style="font-size:11.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#727885;margin-bottom:8px;">
        Client &amp; Scope Details
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;border:1px solid #EAE8E0;border-radius:8px;overflow:hidden;">
        <tr style="background:#FAF9F6;">
          <td style="padding:10px 14px;width:34%;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Full Name</td>
          <td style="padding:10px 14px;font-weight:700;color:#111317;border-bottom:1px solid #EAE8E0;">${escapeHtml(record.name)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Work Email</td>
          <td style="padding:10px 14px;border-bottom:1px solid #EAE8E0;">
            <a href="mailto:${escapeHtml(record.email)}" style="color:#DF4B18;font-weight:600;text-decoration:none;">${escapeHtml(record.email)}</a>
          </td>
        </tr>
        <tr style="background:#FAF9F6;">
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Company</td>
          <td style="padding:10px 14px;color:#111317;border-bottom:1px solid #EAE8E0;">${escapeHtml(record.company)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Phone / WhatsApp</td>
          <td style="padding:10px 14px;color:#111317;border-bottom:1px solid #EAE8E0;">
            ${
              record.phone
                ? `<a href="tel:${escapeHtml(record.phone)}" style="color:#111317;font-weight:600;text-decoration:none;">${escapeHtml(record.phone)}</a>`
                : '<span style="color:#727885;">Not provided</span>'
            }
          </td>
        </tr>
        <tr style="background:#FAF9F6;">
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Core Areas</td>
          <td style="padding:10px 14px;color:#111317;border-bottom:1px solid #EAE8E0;">${escapeHtml(coreAreasText)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Stage</td>
          <td style="padding:10px 14px;color:#111317;border-bottom:1px solid #EAE8E0;">${escapeHtml(record.stage)}</td>
        </tr>
        <tr style="background:#FAF9F6;">
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;border-bottom:1px solid #EAE8E0;">Timeline / Slot</td>
          <td style="padding:10px 14px;color:#111317;border-bottom:1px solid #EAE8E0;">${escapeHtml(record.timeline)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;color:#4A4F5A;">Mutual NDA</td>
          <td style="padding:10px 14px;">
            ${
              record.ndaRequested
                ? '<span style="display:inline-block;padding:2px 8px;border-radius:99px;background:#FFF5F0;color:#DF4B18;font-size:12px;font-weight:700;">YES &mdash; NDA Requested</span>'
                : '<span style="color:#727885;">Not requested</span>'
            }
          </td>
        </tr>
      </table>

      <!-- Project Details Box -->
      <div style="margin-top:20px;">
        <div style="font-size:11.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#727885;margin-bottom:8px;">
          ${isBooking ? 'Discussion Topic &amp; Notes' : 'Project Details'}
        </div>
        <div style="padding:14px 16px;background:#F5F4EF;border:1px solid #DFDDD4;border-radius:8px;font-size:14.5px;line-height:1.65;color:#111317;white-space:pre-wrap;">${escapeHtml(record.overview)}</div>
      </div>

      <!-- Quick Action Buttons -->
      <div style="margin-top:22px;">
        <a href="mailto:${escapeHtml(record.email)}?subject=${encodeURIComponent(`Re: ${COMPANY.name} Inquiry (${record.referenceId})`)}" style="display:inline-block;padding:10px 18px;background:#DF4B18;color:#FFFFFF;font-size:13.5px;font-weight:700;border-radius:7px;text-decoration:none;margin-right:8px;">
          Reply to ${escapeHtml(record.name)}
        </a>
        ${
          whatsappUrl
            ? `<a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:10px 18px;background:#111317;color:#FFFFFF;font-size:13.5px;font-weight:700;border-radius:7px;text-decoration:none;">
                Message on WhatsApp
              </a>`
            : ''
        }
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:14px 26px;background:#FAF9F6;border-top:1px solid #EAE8E0;font-size:12px;color:#727885;">
      <strong>${escapeHtml(COMPANY.name)}</strong> &bull; ${escapeHtml(COMPANY.email)} &bull; ${escapeHtml(COMPANY.phone)}<br/>
      ${escapeHtml(COMPANY.address)} &bull; GST: ${escapeHtml(COMPANY.gst)}
    </div>
  </div>
</body>
</html>`;

  const icsAttachment = isBooking ? buildBookingIcsAttachment(record) : null;

  return {
    subject,
    text,
    html,
    attachments: icsAttachment ? [icsAttachment] : []
  };
}

export async function sendOfficeNotificationEmail(record) {
  const cfg = getSmtpConfig();
  const { subject, text, html, attachments } = buildOfficeEmailContent(record);

  if (!cfg.isConfigured) {
    console.log(
      `[Mailer] Inquiry ${record.referenceId} formatted for ${cfg.officeEmail}. Set SMTP_PASS in .env to enable live Google Workspace SMTP delivery.`
    );
    return {
      sent: false,
      mode: 'preview_queued',
      to: cfg.officeEmail,
      subject,
      htmlPreview: html
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass
      }
    });

    const info = await transporter.sendMail({
      from: `"${COMPANY.name} Website" <${cfg.user}>`,
      to: cfg.officeEmail,
      replyTo: `"${record.name}" <${record.email}>`,
      subject,
      text,
      html,
      attachments
    });

    console.log(
      `[Mailer] Sent ${record.referenceId} notification to ${cfg.officeEmail} (${info.messageId})`
    );
    return {
      sent: true,
      mode: 'smtp_live',
      to: cfg.officeEmail,
      messageId: info.messageId,
      subject,
      htmlPreview: html
    };
  } catch (err) {
    console.error(`[Mailer] Failed to send email to ${cfg.officeEmail}:`, err.message);
    return {
      sent: false,
      mode: 'smtp_error',
      to: cfg.officeEmail,
      error: err.message,
      subject,
      htmlPreview: html
    };
  }
}
