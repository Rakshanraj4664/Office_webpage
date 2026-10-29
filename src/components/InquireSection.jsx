import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from './Reveal';
import { COMPANY_INFO, CORE_CAPABILITIES } from '../data/protovoltData';
import { downloadTextReceipt, submitInquiryRecord } from '../utils/inquiryStorage';

const PROJECT_STAGES = [
  { value: 'Early Idea / Concept', label: 'Early Idea / Concept' },
  { value: 'Rapid Prototype', label: 'Rapid Prototype' },
  { value: 'Full System / Product Build', label: 'Full System / Product' },
  { value: 'Factory Upgrade / Integration', label: 'Factory Upgrade' }
];

export default function InquireSection({
  selectedScopes,
  onToggleScope,
  onClearScopes,
  onInquirySaved
}) {
  const [stage, setStage] = useState('Early Idea / Concept');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [timeline, setTimeline] = useState('1–3 Months');
  const [overview, setOverview] = useState('');
  const [nda, setNda] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !overview.trim()) {
      setError('Please enter your full name, work email, and project details.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }

    setSubmitting(true);
    const record = await submitInquiryRecord({
      inquiryType: 'RFQ Consultation',
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      phone: phone.trim(),
      disciplines: selectedScopes,
      stage,
      timeline,
      ndaRequested: nda,
      overview: overview.trim()
    });
    setSubmitting(false);
    setReceipt(record);
    onInquirySaved();
  };

  const handleReset = () => {
    setReceipt(null);
    setName('');
    setEmail('');
    setCompany('');
    setPhone('');
    setOverview('');
    setNda(false);
    setStage('Early Idea / Concept');
    setTimeline('1–3 Months');
    onClearScopes();
  };

  return (
    <section id="inquire" className="border-y border-line-light bg-surface py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <Reveal direction="up" className="max-w-2xl">
          <span className="eyebrow-pill">
            <span className="h-2 w-2 rounded-full bg-volt" />
            Get in touch with us
          </span>
          <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px]">
            Tell us what you are building or automating.
          </h2>
          <p className="mt-3 text-[16px] text-ink-secondary">
            Share your requirements or idea below and speak directly with a {COMPANY_INFO.name} engineer.
          </p>
        </Reveal>

        {/* Exact Order: 1st Project Consultation Brief | 2nd Direct Engineering Desk | 3rd Engagement Models */}
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* 1st Element: Project Consultation Brief */}
          <Reveal direction="up">
            <div className="rounded-2xl border border-line-light bg-surface p-6 shadow-editorial sm:p-8">
              {!receipt ? (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="border-b border-line-light pb-4">
                    <h3 className="font-display text-[20px] font-bold text-ink">
                      Project Consultation Brief
                    </h3>
                  </div>

                  {/* 1. Core Areas */}
                  <div className="mt-5">
                    <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">
                      1. Core Areas
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {CORE_CAPABILITIES.map((cap) => {
                        const active = selectedScopes.includes(cap.id);
                        return (
                          <button
                            key={cap.id}
                            type="button"
                            onClick={() => onToggleScope(cap.id)}
                            aria-pressed={active}
                            className={`rounded-full border px-3.5 py-1.5 font-display text-[12.5px] font-semibold transition-all ${
                              active
                                ? 'border-volt bg-volt text-white shadow-sm'
                                : 'border-line-light bg-canvas text-ink-secondary hover:border-volt hover:text-volt'
                            }`}
                          >
                            {cap.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Project Stage */}
                  <div className="mt-5">
                    <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">
                      2. Project Stage
                    </span>
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {PROJECT_STAGES.map((st) => {
                        const checked = stage === st.value;
                        return (
                          <label
                            key={st.value}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${
                              checked
                                ? 'border-volt bg-volt-soft text-volt font-semibold'
                                : 'border-line-light bg-canvas/50 text-ink-secondary hover:bg-canvas'
                            }`}
                          >
                            <input
                              type="radio"
                              name="stage"
                              value={st.value}
                              checked={checked}
                              onChange={() => setStage(st.value)}
                              className="accent-volt"
                            />
                            <span>{st.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="inqName" className="mb-1.5 block font-display text-xs font-semibold text-ink">
                        Full Name <span className="text-volt">*</span>
                      </label>
                      <input
                        id="inqName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="inqEmail" className="mb-1.5 block font-display text-xs font-semibold text-ink">
                        Work Email <span className="text-volt">*</span>
                      </label>
                      <input
                        id="inqEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="inqCompany" className="mb-1.5 block font-display text-xs font-semibold text-ink">
                        Company
                      </label>
                      <input
                        id="inqCompany"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="inqPhone" className="mb-1.5 block font-display text-xs font-semibold text-ink">
                        Phone / WhatsApp
                      </label>
                      <input
                        id="inqPhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 / International"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="inqTimeline" className="mb-1.5 block font-display text-xs font-semibold text-ink">
                      Timeline
                    </label>
                    <select
                      id="inqTimeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="input-field"
                    >
                      <option value="Immediate (< 1 Month)">Immediate (&lt; 1 Month)</option>
                      <option value="1–3 Months">1–3 Months</option>
                      <option value="3–6 Months">3–6 Months</option>
                      <option value="Planning Stage">Planning Stage</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="inqOverview" className="mb-1.5 block font-display text-xs font-semibold text-ink">
                      Project Details <span className="text-volt">*</span>
                    </label>
                    <textarea
                      id="inqOverview"
                      rows={4}
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          handleSubmit(e);
                        }
                      }}
                      placeholder="Tell us what you want to build, automate, or inspect..."
                      className="input-field"
                      required
                    />
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink-secondary">
                    <input
                      type="checkbox"
                      checked={nda}
                      onChange={(e) => setNda(e.target.checked)}
                      className="h-4 w-4 rounded accent-volt"
                    />
                    <span>Request a Mutual NDA before sharing CAD files or technical details.</span>
                  </label>

                  {error && (
                    <div
                      role="alert"
                      className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] font-medium text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-volt px-7 py-3.5 text-[15px]"
                    >
                      <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div aria-live="polite">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emeraldBrand/10 px-3 py-1 font-display text-xs font-bold text-emeraldBrand">
                    <Check className="h-3.5 w-3.5" />
                    Inquiry Received
                  </div>
                  <h3 className="mt-3 font-display text-[22px] font-bold text-ink">
                    Thank you. We have received your inquiry.
                  </h3>
                  <p className="mt-1.5 text-[14.8px] text-ink-secondary">
                    A {COMPANY_INFO.name} engineer will review your details and reply within one business day.
                  </p>

                  <div className="mt-5 grid gap-3 rounded-xl border border-line-light bg-canvas/70 p-4 sm:grid-cols-2">
                    <div>
                      <small className="block text-xs text-ink-muted">Reference ID</small>
                      <strong className="font-display text-sm text-ink">{receipt.referenceId}</strong>
                    </div>
                    <div>
                      <small className="block text-xs text-ink-muted">Contact</small>
                      <strong className="font-display text-sm text-ink">
                        {receipt.name} ({receipt.email})
                      </strong>
                    </div>
                    <div>
                      <small className="block text-xs text-ink-muted">Core Areas</small>
                      <strong className="font-display text-sm text-ink">
                        {receipt.disciplines?.length
                          ? receipt.disciplines.join(', ')
                          : 'General Consultation'}
                      </strong>
                    </div>
                    <div>
                      <small className="block text-xs text-ink-muted">Stage &amp; NDA</small>
                      <strong className="font-display text-sm text-ink">
                        {receipt.stage} · {receipt.ndaRequested ? 'NDA Requested' : 'Standard'}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => downloadTextReceipt(receipt)}
                      className="btn-primary px-4 py-2 text-[13.5px]"
                    >
                      Download Copy (.txt)
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-outline px-4 py-2 text-[13.5px]"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* 2nd & 3rd Elements: Direct Engineering Desk -> Engagement Models */}
          <Reveal direction="right" delay={80} className="space-y-6">
            {/* 2nd Element */}
            <div className="rounded-2xl border border-line-light bg-canvas/75 p-6">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-volt">
                Direct Engineering Desk
              </span>
              <div className="mt-4 space-y-3.5 text-[14.5px]">
                <div>
                  <small className="block text-xs text-ink-muted">Company</small>
                  <strong className="font-display text-ink">{COMPANY_INFO.name}</strong>
                </div>
                <div>
                  <small className="block text-xs text-ink-muted">Office Email</small>
                  <strong className="font-display text-ink hover:text-volt">
                    <a href={COMPANY_INFO.emailHref}>{COMPANY_INFO.email}</a>
                  </strong>
                </div>
                <div>
                  <small className="block text-xs text-ink-muted">Office Phone</small>
                  <strong className="font-display text-ink hover:text-volt">
                    <a href={COMPANY_INFO.phoneHref}>{COMPANY_INFO.phoneDisplay}</a>
                  </strong>
                </div>
                <div>
                  <small className="block text-xs text-ink-muted">Office Address</small>
                  <strong className="block font-display text-[14px] leading-snug text-ink">
                    {COMPANY_INFO.address}
                  </strong>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <small className="block text-xs text-ink-muted">GST</small>
                    <strong className="font-display text-[13.5px] text-ink">
                      {COMPANY_INFO.gst}
                    </strong>
                  </div>
                  <div>
                    <small className="block text-xs text-ink-muted">Confidentiality</small>
                    <strong className="font-display text-[13.5px] text-ink">
                      Mutual NDA available
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3rd Element */}
            <div className="rounded-2xl border border-line-light bg-canvas/75 p-6">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-volt">
                Engagement Models
              </span>
              <ul className="mt-4 space-y-3.5 text-[14px]">
                <li className="border-b border-line-light pb-3">
                  <strong className="block font-display text-[15px] text-ink">
                    Rapid Prototype Sprint
                  </strong>
                  <span className="text-ink-secondary">
                    Test your idea quickly with a working benchtop prototype.
                  </span>
                </li>
                <li className="border-b border-line-light pb-3">
                  <strong className="block font-display text-[15px] text-ink">
                    Custom Machine Build
                  </strong>
                  <span className="text-ink-secondary">
                    Complete design, build, and setup of custom automation or inspection systems.
                  </span>
                </li>
                <li className="border-b border-line-light pb-3">
                  <strong className="block font-display text-[15px] text-ink">
                    Hardware Product Development
                  </strong>
                  <span className="text-ink-secondary">
                    Electronics, software, enclosure design, and pilot manufacturing support.
                  </span>
                </li>
                <li>
                  <strong className="block font-display text-[15px] text-ink">
                    Smart Factory Upgrade
                  </strong>
                  <span className="text-ink-secondary">
                    Add cameras, sensors, and live data tracking to existing machines.
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
