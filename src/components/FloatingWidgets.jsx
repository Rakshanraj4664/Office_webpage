import React from 'react';
import { ArrowRight, ChevronUp } from 'lucide-react';

export default function FloatingWidgets({
  selectedCount,
  inquireVisible,
  scrollProgress
}) {
  const showFloatingScope = selectedCount > 0 && !inquireVisible;
  const showBackTop = scrollProgress > 0.14;
  const circumference = 125.66;
  const dashOffset = circumference - circumference * Math.min(1, Math.max(0, scrollProgress));

  return (
    <>
      {/* Floating Selected Scope Pill */}
      {showFloatingScope && (
        <div
          role="region"
          aria-label="Selected Capabilities"
          className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-full border border-line-dark bg-obsidian px-4 py-2 text-white shadow-editorial"
        >
          <span className="text-[13.5px]">
            <strong className="font-display text-volt-bright">{selectedCount}</strong> Selected
          </span>
          <a
            href="#inquire"
            className="btn-volt rounded-full px-4 py-1.5 text-xs"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Back to Top Circular Gauge */}
      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          title="Back to top"
          className="fixed bottom-5 right-5 z-30 flex h-[46px] w-[46px] items-center justify-center rounded-full border border-line-light bg-surface text-ink shadow-card transition-transform hover:-translate-y-0.5"
        >
          <svg
            viewBox="0 0 46 46"
            className="pointer-events-none absolute inset-0 -rotate-90"
            aria-hidden="true"
          >
            <circle cx="23" cy="23" r="20" fill="none" stroke="#EAE8E0" strokeWidth="2.5" />
            <circle
              cx="23"
              cy="23"
              r="20"
              fill="none"
              stroke="#DF4B18"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
