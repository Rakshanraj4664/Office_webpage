import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { availableSlots, calendarDays, istDateIso, moveMonth, slotTimeUtc } from '../utils/reviewDates';
import { downloadBookingIcs, submitInquiryRecord } from '../utils/inquiryStorage';

const SESSION_TRACKS = [
  {
    value: 'Concept & Feasibility Review',
    title: 'Concept Check',
    sub: '30 Min · Idea & feasibility',
    duration: 30
  },
  {
    value: 'System & Hardware Review',
    title: 'System Architecture',
    sub: '45 Min · Hardware, robotics & AI',
    duration: 45
  },
  {
    value: 'Factory Upgrade Review',
    title: 'Factory Upgrade',
    sub: '45 Min · Vision, PLC & IIoT',
    duration: 45
  }
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2), min = (i % 2) * 30;
  const label = `${String(hour % 12 || 12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
  return { label, slot: `${label} IST`, hour, min };
});

function dateDetails(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { iso: '', year: 0, monthIdx: 0, day: 0, fullLabel: 'Select a date' };
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return { iso, year, monthIdx: month - 1, day, fullLabel: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date) };
}

const FORMATS = [
  { value: 'Video Call (Meet / Teams)', label: 'Video Call' },
  { value: 'Phone / WhatsApp Call', label: 'Phone / WhatsApp' },
  { value: 'On-Site Visit', label: 'On-Site Visit' }
];

export default function ArchReviewModal({
  open,
  onClose,
  selectedScopes
}) {
  const [trackIdx, setTrackIdx] = useState(1);
  const [dateIso, setDateIso] = useState(istDateIso);
  const [month, setMonth] = useState(() => istDateIso().slice(0, 7));
  const [slotIdx, setSlotIdx] = useState(null);
  const [now, setNow] = useState(Date.now);
  const [format, setFormat] = useState(FORMATS[0].value);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');
  const [nda, setNda] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (open && selectedScopes.length > 0 && !topic.trim()) {
      setTopic(`Architecture review covering: ${selectedScopes.join(', ')}. `);
    }
  }, [open, selectedScopes]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectedTrack = SESSION_TRACKS[trackIdx];
  const selectedDate = dateDetails(dateIso);
  const today = istDateIso(now);
  const slots = availableSlots(dateIso, TIME_SLOTS, now);
  const selectedSlot = slots.includes(TIME_SLOTS[slotIdx]) ? TIME_SLOTS[slotIdx] : slots[0];
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !topic.trim()) {
      setError('Please enter your name, work email, and what you would like to discuss.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }

    const selectedUtc = selectedSlot && slotTimeUtc(dateIso, selectedSlot.hour, selectedSlot.min);
    if (!dateIso || !selectedSlot || !Number.isFinite(selectedUtc) || selectedUtc <= Date.now()) {
      setError('Please select a future date and time in IST.');
      return;
    }

    const bookingMeta = {
      track: selectedTrack.value,
      durationMin: selectedTrack.duration,
      dateIso: selectedDate.iso,
      dateLabel: selectedDate.fullLabel,
      timeSlot: selectedSlot.slot,
      hourIst: selectedSlot.hour,
      minIst: selectedSlot.min,
      format
    };

    setSubmitting(true);
    try {
    const record = await submitInquiryRecord({
      inquiryType: 'Architecture Review',
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      phone: phone.trim(),
      disciplines: selectedScopes,
      stage: `${selectedTrack.duration}-Min ${selectedTrack.value}`,
      timeline: `${selectedDate.fullLabel} · ${selectedSlot.slot}`,
      ndaRequested: nda,
      booking: bookingMeta,
      overview: `[Architecture Review — ${selectedDate.fullLabel} at ${selectedSlot.slot} via ${format}] ${topic.trim()}`
    });
    setBooked({
      record,
      dateObj: selectedDate,
      bookingMeta,
      topic: topic.trim()
    });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/70 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="archModalTitle"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line-light bg-surface shadow-editorial"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line-light bg-surface/95 px-6 py-4 backdrop-blur">
          <div>
            <span className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-volt">
              <span className="h-2 w-2 rounded-full bg-volt animate-pulseDot" />
              1-on-1 Engineering Call
            </span>
            <h3 id="archModalTitle" className="font-display text-[20px] font-bold text-ink">
              Book Architecture Review
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Modal"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-light text-ink-secondary hover:bg-subtle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {!booked ? (
            <form onSubmit={handleSubmit} noValidate>
              {/* 1. Session Type */}
              <div>
                <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  1. Session Type
                </span>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
                  {SESSION_TRACKS.map((tr, idx) => {
                    const active = idx === trackIdx;
                    return (
                      <button
                        key={tr.value}
                        type="button"
                        onClick={() => setTrackIdx(idx)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          active
                            ? 'border-volt bg-volt-soft ring-1 ring-volt/25'
                            : 'border-line-light bg-canvas/50 hover:bg-canvas'
                        }`}
                      >
                        <strong className="block font-display text-[13.5px] text-ink">
                          {tr.title}
                        </strong>
                        <span className="mt-0.5 block text-[12px] text-ink-secondary">
                          {tr.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <span id="review-date-label" className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">2. Select Date (IST)</span>
                  <div className="mt-2.5 rounded-xl border border-line-light bg-canvas/60 p-3" role="group" aria-labelledby="review-date-label">
                    <div className="mb-3 flex items-center justify-between">
                      <button type="button" aria-label="Previous month" disabled={month <= today.slice(0, 7)} onClick={() => setMonth(moveMonth(month, -1))} className="rounded-md p-1.5 text-ink-secondary hover:bg-volt-soft hover:text-volt disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
                      <strong aria-live="polite" className="font-display text-sm text-ink">{monthLabel}</strong>
                      <button type="button" aria-label="Next month" onClick={() => setMonth(moveMonth(month, 1))} className="rounded-md p-1.5 text-ink-secondary hover:bg-volt-soft hover:text-volt"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day} className="py-1 text-[10px] font-bold uppercase text-ink-muted">{day}</span>)}
                      {calendarDays(month).map((day, index) => day ? (
                        <button key={day} type="button" disabled={day < today} aria-label={dateDetails(day).fullLabel} aria-pressed={dateIso === day} onClick={() => { setDateIso(day); setSlotIdx(null); }} className={`aspect-square rounded-lg text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-volt disabled:cursor-not-allowed disabled:text-ink-muted/40 ${dateIso === day ? 'bg-volt text-white' : 'text-ink hover:bg-volt-soft hover:text-volt'}`}>{Number(day.slice(-2))}</button>
                      ) : <span key={`empty-${index}`} aria-hidden="true" />)}
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="review-time" className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">3. Select Time (IST)</label>
                  <select id="review-time" value={selectedSlot ? TIME_SLOTS.indexOf(selectedSlot) : ''} onChange={(e) => setSlotIdx(Number(e.target.value))} className="input-field mt-2.5" disabled={!slots.length}>
                    {slots.length ? slots.map(slot => <option key={slot.slot} value={TIME_SLOTS.indexOf(slot)}>{slot.label}</option>) : <option value="">No times remaining today</option>}
                  </select>
                  {!slots.length && <p className="mt-2 text-xs text-ink-secondary">Please choose a later date.</p>}
                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">Only upcoming times are shown in India Standard Time. Your request is tentative until confirmed. If accepted, a Google Meet invitation will be sent.</p>
                </div>
              </div>

              {/* 4. Meeting Format */}
              <div className="mt-5">
                <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  4. Meeting Format
                </span>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {FORMATS.map((f) => {
                    const active = format === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFormat(f.value)}
                        className={`rounded-lg border px-3 py-2 font-display text-[13px] font-semibold transition-all ${
                          active
                            ? 'border-volt bg-volt-soft text-volt'
                            : 'border-line-light bg-canvas/60 text-ink-secondary hover:bg-canvas'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-display text-xs font-semibold text-ink">
                    Full Name <span className="text-volt">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-display text-xs font-semibold text-ink">
                    Work Email <span className="text-volt">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-display text-xs font-semibold text-ink">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-display text-xs font-semibold text-ink">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 / International"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-3.5">
                <label className="mb-1 block font-display text-xs font-semibold text-ink">
                  What would you like to discuss? <span className="text-volt">*</span>
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Briefly describe your project or automation requirement..."
                  className="input-field"
                  required
                />
              </div>

              <label className="mt-3.5 flex cursor-pointer items-center gap-2 text-[13.5px] text-ink-secondary">
                <input
                  type="checkbox"
                  checked={nda}
                  onChange={(e) => setNda(e.target.checked)}
                  className="h-4 w-4 rounded accent-volt"
                />
                <span>Send a Mutual NDA before the call.</span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line-light pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-volt px-6 py-3 text-[14.5px]"
                >
                  <span>{submitting ? 'Sending...' : 'Request Review'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="text-right text-xs">
                  <span className="block text-ink-muted">Selected Slot</span>
                  <strong className="font-display text-ink">
                    {selectedDate.fullLabel} · {selectedSlot?.slot || 'Select a later date'}
                  </strong>
                </div>
              </div>
            </form>
          ) : (
            <div aria-live="polite">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emeraldBrand/10 px-3 py-1 font-display text-xs font-bold text-emeraldBrand">
                <Check className="h-3.5 w-3.5" />
                Review Requested
              </div>
              <h3 className="mt-3 font-display text-[22px] font-bold text-ink">
                Your request has been sent. Our team will confirm availability with you.
              </h3>
              <p className="mt-1 text-[14.5px] text-ink-secondary">
                The date and time are tentative until our team confirms them.
              </p>

              <div className="mt-5 grid gap-3 rounded-xl border border-line-light bg-canvas/70 p-4 sm:grid-cols-2">
                <div>
                  <small className="block text-xs text-ink-muted">Request ID</small>
                  <strong className="font-display text-sm text-ink">
                    {booked.record.referenceId}
                  </strong>
                </div>
                <div>
                  <small className="block text-xs text-ink-muted">Date &amp; Time</small>
                  <strong className="font-display text-sm text-ink">
                    {booked.dateObj.fullLabel} · {booked.bookingMeta.timeSlot}
                  </strong>
                </div>
                <div>
                  <small className="block text-xs text-ink-muted">Session &amp; Format</small>
                  <strong className="font-display text-sm text-ink">
                    {booked.bookingMeta.durationMin} Min · {booked.bookingMeta.format}
                  </strong>
                </div>
                <div>
                  <small className="block text-xs text-ink-muted">Attendee</small>
                  <strong className="font-display text-sm text-ink">{booked.record.name}</strong>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => downloadBookingIcs(booked)}
                  className="btn-volt px-4 py-2.5 text-[13.5px]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Add to Calendar (.ics)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBooked(null)}
                  className="btn-outline px-4 py-2.5 text-[13.5px]"
                >
                  Book Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary px-4 py-2.5 text-[13.5px]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
