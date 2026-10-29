import 'dotenv/config';
import { getSmtpConfig, sendOfficeNotificationEmail } from './mailer.js';

async function main() {
  const cfg = getSmtpConfig();
  console.log('Checking Protovolt.io SMTP configuration...');
  console.log(`  SMTP Host   : ${cfg.host}:${cfg.port} (SSL=${cfg.secure})`);
  console.log(`  SMTP User   : ${cfg.user}`);
  console.log(`  Office Email: ${cfg.officeEmail}`);

  if (!cfg.isConfigured) {
    console.error(
      '\n[!] SMTP_PASS is not set yet. Copy `.env.example` to `.env` and add your 16-character Google App Password for tech@protovolt.io.'
    );
    process.exit(1);
  }

  const sampleRecord = {
    referenceId: `PV-TEST-${new Date().getFullYear()}-1001`,
    inquiryType: 'Architecture Review',
    name: 'Protovolt.io SMTP Test',
    email: cfg.officeEmail,
    company: 'Protovolt.io',
    phone: '+91 96265 28585',
    disciplines: ['Industrial Automation', 'Machine Vision', 'Robotics'],
    stage: '45-Min System & Hardware Review',
    timeline: 'Test Verification Slot · 02:30 PM IST',
    ndaRequested: true,
    booking: {
      track: 'System & Hardware Review',
      durationMin: 45,
      dateIso: new Date().toISOString().slice(0, 10),
      dateLabel: 'SMTP Verification Day',
      timeSlot: '02:30 PM IST',
      hourIst: 14,
      minIst: 30,
      format: 'Video Call (Meet / Teams)'
    },
    overview:
      'This is an automated test email confirming that your Protovolt.io website backend is connected to Google Workspace SMTP and delivering inquiries & bookings to tech@protovolt.io.',
    createdAt: new Date().toISOString()
  };

  const result = await sendOfficeNotificationEmail(sampleRecord);
  if (result.sent) {
    console.log(`\n✓ Success! Test email delivered to ${cfg.officeEmail} (Message ID: ${result.messageId})`);
  } else {
    console.error(`\n✗ Delivery failed: ${result.error}`);
    process.exit(1);
  }
}

main();
