# Protovolt.io — React + Vite + Tailwind CSS + Google Workspace Email Backend

A modular, component-driven **React 18 + Vite + Tailwind CSS** website and **Node.js + Nodemailer** backend for **Protovolt.io**, pre-configured to send instant lead notifications for both **Project Consultation Briefs** and **Book Architecture Review** sessions directly to **`tech@protovolt.io`**.

---

## Project Architecture

```text
protovolt/
├── .env.example                # Google Workspace SMTP setup template for tech@protovolt.io
├── index.html                  # Vite HTML entry + Google Fonts (Archivo & IBM Plex Sans)
├── tailwind.config.js          # Protovolt.io theme tokens (colors, fonts, shadows, animations)
├── vite.config.js              # Vite config + /api proxy to Node backend
├── package.json                # Scripts & dependencies
├── public/
│   └── assets/                 # Official Protovolt.io logo, favicon & studio photography
├── server/
│   ├── index.js                # /api/inquiries REST backend & production static host
│   ├── mailer.js               # Google Workspace SMTP mailer + HTML template + .ics invite
│   ├── testEmail.js            # One-command SMTP verification script (`npm run test:email`)
│   └── data/inquiries.json     # Persistent JSON lead & booking storage
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Page composition & shared scope/modal state
    ├── index.css               # Tailwind layers & reusable button/input classes
    ├── data/protovoltData.js   # Centralized copy, office details & section data
    ├── utils/inquiryStorage.js # API client + offline fallback + .txt / .csv / .ics exporters
    └── components/             # Modular React + Tailwind UI components
```

---

## 1. Local Setup & Live Development

```bash
cd protovolt
npm install
npm run dev
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001` (automatically proxied via `/api`)

---

## 2. Activating Live Email Delivery to `tech@protovolt.io` (Google Workspace)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Generate a **16-character Google App Password** for `tech@protovolt.io`:
   - Sign in at `https://myaccount.google.com` as **`tech@protovolt.io`**
   - Open **Security** &rarr; ensure **2-Step Verification** is enabled
   - Search **App passwords** &rarr; create one named **`Protovolt Website`**
3. Paste the 16-character password into `.env`:
   ```env
   OFFICE_EMAIL=tech@protovolt.io
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=tech@protovolt.io
   SMTP_PASS=abcd efgh ijkl mnop
   ```
4. Test email delivery immediately with one command:
   ```bash
   npm run test:email
   ```

### What Arrives in `tech@protovolt.io`
- **Project Consultation Brief (`PV-RFQ-YYYY-XXXX`):** Formatted HTML + plain-text email with client name, clickable email, company, phone/WhatsApp button, selected Core Areas, project stage, timeline, NDA status, full project details, and `Reply-To` set directly to the client's email.
- **Book Architecture Review (`PV-ARCH-YYYY-XXXX`):** All client and topic details, highlighted session date/time/format banner, `Reply-To` set to the client, **plus an attached `.ics` calendar invite** so Google Calendar / Gmail displays an instant calendar card.

---

## 3. Production Deployment

```bash
npm run build
npm start
```
