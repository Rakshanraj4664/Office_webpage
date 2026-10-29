import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calendar, Check, X } from 'lucide-react';
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

const TIME_SLOTS = [
  { label: '10:00 AM', slot: '10:00 AM IST', hour: 10, min: 0 },
  { label: '11:30 AM', slot: '11:30 AM IST', hour: 11, min: 30 },
  { label: '02:30 PM', slot: '02:30 PM IST', hour: 14, min: 30 },
  { label: '04:30 PM', slot: '04:30 PM IST', hour: 16, min: 30 },
  { label: '06:00 PM', slot: '06:00 PM IST', hour: 18, min: 0 }
];

const FORMATS = [
  { value: 'Video Call (Meet / Teams)', label: 'Video Call' },
  { value: 'Phone / WhatsApp Call', label: 'Phone / WhatsApp' },
  { value: 'On-Site Visit', label: 'On-Site Visit' }
];

function computeBusinessDates() {
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dates = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  while (dates.length < 6) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() === 0) continue;
    const yyyy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getDate()).padStart(2, '0');
    const dow = dows[cursor.getDay()];
    const mon = months[cursor.getMonth()];
    dates.push({
      iso: `${yyyy}-${mm}-${dd}`,
      dow,
      shortDate: `${cursor.getDate()} ${mon}`,
      fullLabel: `${dow}, ${cursor.getDate()} ${mon} ${yyyy}`,
      year: yyyy,
      monthIdx: cursor.getMonth(),
      day: cursor.getDate()
    });
  }
  return dates;
}

export default function ArchReviewModal({
  open,
  onClose,
  selectedScopes,
  onBookingSaved
}) {
  const dates = useMemo(() => computeBusinessDates(), []);
  const [trackIdx, setTrackIdx] = useState(1);
  const [dateIdx, setDateIdx] = useState(0);
  const [slotIdx, setSlotIdx] = useState(2);
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
  const selectedDate = dates[dateIdx];
  const selectedSlot = TIME_SLOTS[slotIdx];

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
    setSubmitting(false);

    setBooked({
      record,
      dateObj: selectedDate,
      bookingMeta,
      topic: topic.trim()
    });
    onBookingSaved();
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

              {/* 2. Date Selection */}
              <div className="mt-5">
                <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  2. Select Date
                </span>
                <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {dates.map((d, idx) => {
                    const active = idx === dateIdx;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setDateIdx(idx)}
                        className={`flex flex-col items-center rounded-xl border py-2.5 transition-all ${
                          active
                            ? 'border-volt bg-volt text-white shadow-sm'
                            : 'border-line-light bg-canvas/60 text-ink hover:border-volt'
                        }`}
                      >
                        <span className="text-[11px] font-medium opacity-80">{d.dow}</span>
                        <span className="font-display text-[13px] font-bold">{d.shortDate}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Time Slot Selection */}
              <div className="mt-5">
                <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  3. Select Time (IST)
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {TIME_SLOTS.map((sl, idx) => {
                    const active = idx === slotIdx;
                    return (
                      <button
                        key={sl.slot}
                        type="button"
                        onClick={() => setSlotIdx(idx)}
                        className={`rounded-lg border px-3.5 py-2 font-display text-[13px] font-semibold transition-all ${
                          active
                            ? 'border-volt bg-volt text-white'
                            : 'border-line-light bg-canvas/60 text-ink hover:border-volt'
                        }`}
                      >
                        {sl.label}
                      </button>
                    );
                  })}
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
                  <span>{submitting ? 'Booking...' : 'Confirm Booking'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="text-right text-xs">
                  <span className="block text-ink-muted">Selected Slot</span>
                  <strong className="font-display text-ink">
                    {selectedDate.fullLabel} · {selectedSlot.slot}
                  </strong>
                </div>
              </div>
            </form>
          ) : (
            <div aria-live="polite">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emeraldBrand/10 px-3 py-1 font-display text-xs font-bold text-emeraldBrand">
                <Check className="h-3.5 w-3.5" />
                Review Scheduled
              </div>
              <h3 className="mt-3 font-display text-[22px] font-bold text-ink">
                Your architecture review is booked.
              </h3>
              <p className="mt-1 text-[14.5px] text-ink-secondary">
                We have reserved your slot and will send the meeting link to your email.
              </p>

              <div className="mt-5 grid gap-3 rounded-xl border border-line-light bg-canvas/70 p-4 sm:grid-cols-2">
                <div>
                  <small className="block text-xs text-ink-muted">Booking ID</small>
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
