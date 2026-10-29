import React, { useState } from 'react';
import { Download, Mail, X } from 'lucide-react';
import { downloadInquiriesCsv } from '../utils/inquiryStorage';

export default function InquiriesDrawer({ open, onClose, inquiries }) {
  const [previewItem, setPreviewItem] = useState(null);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setPreviewItem(null);
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-obsidian/60 backdrop-blur-sm"
    >
      <aside
        role="dialog"
        aria-label="Submitted Inquiries"
        className="flex h-full w-full max-w-lg flex-col bg-surface shadow-editorial"
      >
        <div className="flex items-center justify-between border-b border-line-light px-5 py-4">
          <h3 className="font-display text-[18px] font-bold text-ink">Submitted Inquiries</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadInquiriesCsv(inquiries)}
              disabled={!inquiries.length}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewItem(null);
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-light text-ink-secondary hover:bg-subtle"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {previewItem ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="font-display text-xs font-semibold text-volt hover:underline"
                >
                  &larr; Back to Inquiries
                </button>
                <span className="rounded-full bg-volt-soft px-2.5 py-0.5 font-display text-[11px] font-bold text-volt">
                  To: {previewItem.emailNotification?.to || 'tech@protovolt.io'}
                </span>
              </div>

              <div className="rounded-lg border border-line-light bg-canvas/70 px-3 py-2 text-xs text-ink-secondary">
                <strong className="font-display text-ink">Subject:</strong>{' '}
                {previewItem.emailNotification?.subject}
              </div>

              <iframe
                title="Office Email Notification Preview"
                sandbox=""
                srcDoc={previewItem.emailNotification?.htmlPreview || ''}
                className="h-[540px] w-full rounded-xl border border-line-light bg-canvas"
              />
            </div>
          ) : !inquiries.length ? (
            <div className="rounded-xl border border-line-light bg-canvas/70 p-4">
              <strong className="font-display text-sm text-ink">No Inquiries Yet</strong>
              <p className="mt-1 text-[13.5px] text-ink-secondary">
                Submitted inquiries and scheduled architecture reviews will appear here.
              </p>
            </div>
          ) : (
            inquiries.map((item) => {
              const mailMeta = item.emailNotification;
              return (
                <div
                  key={item.referenceId}
                  className="rounded-xl border border-line-light bg-canvas/60 p-4"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-volt">
                    <span>
                      {item.referenceId}
                      {item.inquiryType === 'Architecture Review' ? ' · ARCH REVIEW' : ''}
                    </span>
                    <span className="text-ink-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-1 font-display text-[15px] font-bold text-ink">
                    {item.name} &middot; {item.company}
                  </div>
                  <div className="text-[13px] text-ink-secondary">
                    {item.email}
                    {item.phone ? ` · ${item.phone}` : ''}
                  </div>

                  {item.booking?.dateLabel && (
                    <div className="mt-2 rounded bg-volt-soft px-2.5 py-1 text-xs font-semibold text-volt">
                      Scheduled: {item.booking.dateLabel} · {item.booking.timeSlot} (
                      {item.booking.format})
                    </div>
                  )}

                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
                    {item.overview}
                  </p>

                  {mailMeta && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-light/80 pt-2.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium text-ink-secondary">
                        <Mail className="h-3.5 w-3.5 text-volt" />
                        {mailMeta.sent
                          ? `Sent to ${mailMeta.to}`
                          : `Ready for ${mailMeta.to}`}
                      </span>
                      {mailMeta.htmlPreview && (
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="font-display text-xs font-semibold text-volt hover:underline"
                        >
                          View Office Email &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
