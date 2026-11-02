# Protovolt.io

React/Vite website with a Node.js email API for project inquiries, architecture review requests and career applications.

## Development

Requires Node.js 20 or later. Run `npm ci`, then `npm run dev` and open http://localhost:3000. The frontend proxies `/api` to the Node server. Run `npm test` for API integration tests with a local mock SMTP server and `npm run build` to check the production build.

## Email configuration

Copy `.env.example` to `.env` and configure the office SMTP account on the server. Never commit or share credentials. For Google Workspace, use an app password for an account with two-step verification. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `OFFICE_EMAIL`; the office address defaults to `tech@protovolt.io`. Port 465 normally uses `SMTP_SECURE=true`; port 587 normally uses `SMTP_SECURE=false` with required STARTTLS. Only set `SITE_ORIGIN` to the exact public HTTPS origin when deploying (or to your local frontend origin for local testing).

Run `npm run test:email` to send a real test message **after** configuring SMTP. Confirm it arrives with its calendar attachment. The health endpoint only reports whether a password is configured; it does not verify SMTP connectivity or delivery.

## Submission and privacy behavior

* Inquiries, review requests and applications are sent to the configured office mailbox. The API reports success only when the SMTP server accepts the message. SMTP acceptance is not a guarantee of final delivery: monitor the mailbox, bounces and provider logs.
* For privacy, there is no public inquiries inbox or server-side inquiry database. Submissions are not stored for retry; if mail delivery fails, the visitor sees an error and must retry or email the office. Old `server/data/inquiries.json` files are no longer used; securely remove or migrate any existing data as appropriate.
* Career resumes are limited to 5 MB and PDF, DOC or DOCX files with matching basic file signatures. Signature checks are not malware scanning; use mailbox attachment scanning and do not open untrusted files without appropriate protection.
* Review slots are **requests**, not confirmed bookings. The office must confirm availability. Calendar files are marked tentative; there is no calendar availability check or double-booking protection.

## Deployment checklist

1. Run `npm ci`, `npm test`, `npm run build`, then `npm start`. Serve the Node server behind a properly configured HTTPS reverse proxy. Set `NODE_ENV=production`, `PORT`, and `SITE_ORIGIN` in the hosting environment.
2. Provision SMTP credentials and verify a real inquiry, review request and career application from the deployed site. Configure SPF/DKIM/DMARC as appropriate for your mail provider and monitor delivery and bounces. Do not place credentials in the repository or browser code.
3. Configure request-size limits, rate limiting, bot/spam protection, logging, monitoring, alerting and backups at the hosting edge. The built-in per-connection IP rate limit is process-local and behind a proxy may treat all clients as one; it is not a distributed abuse-control solution. Restrict direct access to the Node service.
4. Review the privacy notice, data retention and access controls for the office mailbox and ensure your hosting supports the required Node version. File-signature validation is not antivirus scanning.
5. Test on the real domain and verify browser security headers, HTTPS and submission error handling. This project does not include authenticated administration, a durable message queue, automatic retry or a booking system.
