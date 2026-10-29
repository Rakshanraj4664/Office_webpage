import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, FileText } from 'lucide-react';
import { COMPANY_INFO } from '../data/protovoltData';

const label = 'block font-display text-sm font-semibold text-ink';

export default function Careers() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('resume');
    if (!file || file.size > 5 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(file.name)) {
      setError('Please attach a PDF, DOC or DOCX resume no larger than 5 MB.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const response = await fetch('/api/careers', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your application. Please try again.');
      form.reset();
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Unable to send your application. Please try again.');
      setStatus('idle');
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line-light bg-canvas">
        <div className="container-shell flex h-[75px] items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3" aria-label="Protovolt.io home">
            <img src="/assets/protovolt-logo-dark.png" alt="" className="h-[38px] w-auto" />
            <span className="font-display text-lg font-bold">Protovolt.io</span>
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-volt"><ArrowLeft className="h-4 w-4" /> Back to home</a>
        </div>
      </header>
      <main className="container-shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <span className="eyebrow-pill"><span className="h-2 w-2 rounded-full bg-volt" /> Careers at Protovolt</span>
            <h1 className="mt-5 max-w-lg font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">Build what <span className="text-volt">moves industry.</span></h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-secondary">Interested in automation, robotics, AI, or building real-world hardware? Tell us about yourself and the work you would like to do.</p>
            <div className="mt-9 space-y-5 border-t border-line-light pt-7 text-sm text-ink-secondary">
              <div className="flex gap-3"><BriefcaseBusiness className="h-5 w-5 shrink-0 text-volt" /><p><strong className="text-ink">Share your interests</strong><br />Let us know which role or area fits you best.</p></div>
              <div className="flex gap-3"><FileText className="h-5 w-5 shrink-0 text-volt" /><p><strong className="text-ink">Attach your resume</strong><br />PDF, DOC or DOCX, up to 5 MB.</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-line-light bg-surface p-6 shadow-card sm:p-9">
            <h2 className="font-display text-2xl font-bold">Introduce yourself</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">Your application and resume will be emailed to {COMPANY_INFO.email}. Fields marked * are required.</p>
            {status === 'sent' && <div role="status" className="mt-6 rounded-lg border border-emeraldBrand/30 bg-emeraldBrand/10 p-4 text-sm text-emeraldBrand">Your application has been sent. Thank you for your interest in Protovolt.</div>}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={label}>Full name *<input className="input-field mt-2" name="name" autoComplete="name" maxLength="200" required /></label>
                <label className={label}>Email address *<input className="input-field mt-2" name="email" type="email" autoComplete="email" maxLength="200" required /></label>
                <label className={label}>Phone number *<input className="input-field mt-2" name="phone" type="tel" autoComplete="tel" maxLength="200" required /></label>
                <label className={label}>Current location *<input className="input-field mt-2" name="location" autoComplete="address-level2" maxLength="200" placeholder="City, country" required /></label>
                <label className={label}>Role or area of interest *<input className="input-field mt-2" name="role" maxLength="200" placeholder="e.g. Robotics engineer" required /></label>
                <label className={label}>Experience *<select className="input-field mt-2" name="experience" defaultValue="" required><option value="" disabled>Select experience</option><option>Student / Intern</option><option>Fresher</option><option>1–3 years</option><option>4–7 years</option><option>8+ years</option></select></label>
              </div>
              <label className={label}>Portfolio or LinkedIn <span className="font-normal text-ink-muted">(optional)</span><input className="input-field mt-2" name="portfolio" type="url" maxLength="200" placeholder="https://" /></label>
              <label className={label}>Tell us about yourself <span className="font-normal text-ink-muted">(optional)</span><textarea className="input-field mt-2" name="message" rows="4" maxLength="4000" placeholder="Share your skills, interests, or anything else you would like us to know." /></label>
              <label className={label}>Resume *<input className="input-field mt-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-subtle file:px-3 file:py-1.5 file:font-semibold" name="resume" type="file" accept=".pdf,.doc,.docx" required /><span className="mt-1 block text-xs font-normal text-ink-muted">PDF, DOC or DOCX · Maximum 5 MB</span></label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error} You can also email <a className="underline" href={COMPANY_INFO.emailHref}>{COMPANY_INFO.email}</a>.</p>}
              <button className="btn-primary w-full px-6 py-3.5 sm:w-auto" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Sending…' : 'Send application'} <ArrowRight className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </main>
      <footer className="border-t border-line-light py-6 text-center text-sm text-ink-muted">&copy; {new Date().getFullYear()} Protovolt.io · <a href={COMPANY_INFO.emailHref} className="hover:text-volt">{COMPANY_INFO.email}</a></footer>
    </div>
  );
}
