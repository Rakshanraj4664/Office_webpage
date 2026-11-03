# Protovolt.io

React/Vite website with a Node.js email API for project inquiries, architecture review requests and career applications.

## Development

Requires Node.js 22.13 or later (the built-in SQLite module is experimental in Node 22). Run `npm ci`, then `npm run dev` and open http://localhost:3000. The frontend proxies `/api` to the Node server. Run `npm test` for API integration tests with a local mock SMTP server and `npm run build` to check the production build.

## Email configuration

Copy `.env.example` to `.env` and configure the office SMTP account on the server. Never commit or share credentials. For Google Workspace, use an app password for an account with two-step verification. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `OFFICE_EMAIL`; the office address defaults to `rakshan4664@gmail.com`. Port 465 normally uses `SMTP_SECURE=true`; port 587 normally uses `SMTP_SECURE=false` with required STARTTLS. Only set `SITE_ORIGIN` to the exact public HTTPS origin when deploying (or to your local frontend origin for local testing).

Run `npm run test:email` to send a real test message **after** configuring SMTP. Confirm it arrives with its calendar attachment. The health endpoint only reports whether a password is configured; it does not verify SMTP connectivity or delivery.

## Submission and privacy behavior

* Inquiries, review requests and applications are sent to the configured office mailbox. The API reports success only when the SMTP server accepts the message. SMTP acceptance is not a guarantee of final delivery: monitor the mailbox, bounces and provider logs.
* There is no public inquiries inbox. Architecture review requests and decision states are stored in a private SQLite database; other inquiries and applications are email-only. If office mail delivery fails, the visitor sees an error and must retry or email the office. Old `server/data/inquiries.json` files are no longer used; securely remove or migrate any existing data as appropriate.
* Career resumes are limited to 5 MB and PDF, DOC or DOCX files with matching basic file signatures. Signature checks are not malware scanning; use mailbox attachment scanning and do not open untrusted files without appropriate protection.
* Review slots are **requests**, not confirmed bookings. Calendar files are tentative; there is no availability check or double-booking protection. Acceptance asks Google Calendar to send an invitation with a Meet link; Google and the recipient's mail provider determine final delivery. Decline sends no applicant email. A Meet is created for all meeting formats.

## Deployment checklist

1. Run `npm ci`, `npm test`, `npm run build`, then `npm start`. Serve the Node server behind a properly configured HTTPS reverse proxy. Set `NODE_ENV=production`, `PORT`, and `SITE_ORIGIN` in the hosting environment.
2. Provision SMTP credentials and verify a real inquiry, review request and career application from the deployed site. Configure SPF/DKIM/DMARC as appropriate for your mail provider and monitor delivery and bounces. Do not place credentials in the repository or browser code.
3. Configure request-size limits, rate limiting, bot/spam protection, logging, monitoring, alerting and backups at the hosting edge. The built-in per-connection IP rate limit is process-local and behind a proxy may treat all clients as one; it is not a distributed abuse-control solution. Restrict direct access to the Node service.
4. Review the privacy notice, data retention and access controls for the office mailbox and ensure your hosting supports the required Node version. File-signature validation is not antivirus scanning.
5. Test on the real domain and verify browser security headers, HTTPS and submission error handling. This project does not include authenticated administration, a durable message queue, automatic mail retry or an availability-checking booking system.


## Architecture review decisions

Review requests are disabled until SMTP and Google Calendar are configured. The office email contains accept and decline links; both open a confirmation page. Merely opening a link has no effect. Treat the email and links as private: anyone with a valid link can make the decision. Links expire after 30 days. Decline sends no message to the applicant. On acceptance the server creates an event in the connected Google account's primary calendar with a Google Meet link and asks Google to email an invitation to the applicant. Calendar event creation or Meet provisioning failures are reported on the decision page; retrying uses the same event ID to avoid duplicate events. Verify the calendar and mail delivery if a result is uncertain.

To configure:

1. Use Node 22.13+ on a persistent server. Set `SITE_ORIGIN` to the exact public HTTPS site origin (no trailing slash). Configure SMTP as above.
2. In Google Cloud, enable the Google Calendar API and configure the OAuth consent screen and an OAuth client. Authorize the **office Google account** for the `https://www.googleapis.com/auth/calendar.events` scope and obtain an offline refresh token using a trusted OAuth flow. For example, Google's OAuth 2.0 Playground supports using your own OAuth client credentials and exchanging an authorization code with offline access. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN` as server-only environment variables. A Google Workspace administrator may need to approve access. OAuth apps in testing mode can have refresh tokens expire; use an appropriate production configuration. Never put credentials or refresh tokens in client code, Git, chat or logs.
3. Set `REVIEW_DB_PATH` to a private persistent disk path outside the public web root. SQLite is suitable for a single server with a local persistent filesystem, not multiple independent server instances or ephemeral/serverless storage. Back up the database (including WAL files) securely, restrict filesystem access, and establish a retention/deletion policy for applicant data and old backups. Tokens are stored as hashes; the database still contains personal information.
4. Restart the server and make a real test request on the public domain. Test decline, acceptance, the actual Meet link and the applicant's invitation delivery. The `/api/health` configuration flag only checks that values exist; it does not validate Google or SMTP credentials. Protect the public decision endpoint with edge rate limits and monitor failures. Office email recipients must keep decision links private.
