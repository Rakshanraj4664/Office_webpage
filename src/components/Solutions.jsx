import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from './Reveal';
import { SOLUTIONS_TABS } from '../data/protovoltData';

const AUTO_INTERVAL_MS = 5000;

export default function Solutions({ onSelectSolutionScopes }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeIdxRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(null);
  const barRefs = useRef([]);

  activeIdxRef.current = activeIdx;

  // Zero-rerender 60fps progress bar + 5-second idle auto-advance
  useEffect(() => {
    let rafId;

    const syncBars = (pct) => {
      barRefs.current.forEach((barEl, idx) => {
        if (!barEl) return;
        barEl.style.width = idx === activeIdxRef.current ? `${pct}%` : '0%';
      });
    };

    const tick = (now) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!isPaused) {
        elapsedRef.current += delta;
        if (elapsedRef.current >= AUTO_INTERVAL_MS) {
          elapsedRef.current = 0;
          syncBars(0);
          setActiveIdx((prev) => (prev + 1) % SOLUTIONS_TABS.length);
        } else {
          syncBars((elapsedRef.current / AUTO_INTERVAL_MS) * 100);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPaused]);

  const handleSelectTab = (idx) => {
    elapsedRef.current = 0;
    lastTickRef.current = null;
    barRefs.current.forEach((barEl) => {
      if (barEl) barEl.style.width = '0%';
    });
    setActiveIdx(idx);
  };

  const handleDiscuss = (scopes) => {
    onSelectSolutionScopes(scopes);
    const el = document.getElementById('inquire');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="solutions" className="bg-subtle/65 py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <Reveal direction="up" className="max-w-2xl">
          <span className="eyebrow-pill">
            <span className="h-2 w-2 rounded-full bg-volt" />
            Solutions
          </span>
          <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px]">
            Custom systems built for daily industrial use.
          </h2>
        </Reveal>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            lastTickRef.current = null;
            setIsPaused(false);
          }}
        >
          {/* Tab Bar with Smooth 5s Progress Line */}
          <Reveal direction="up" delay={60} className="mt-8">
            <div role="tablist" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {SOLUTIONS_TABS.map((tab, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectTab(idx)}
                    className={`group relative flex flex-col items-start overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? '-translate-y-0.5 border-volt bg-surface shadow-card ring-1 ring-volt/20'
                        : 'border-line-light bg-surface/70 hover:border-line-mid hover:bg-surface'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`font-display text-xs font-bold transition-colors duration-300 ${
                          isActive ? 'text-volt' : 'text-ink-muted group-hover:text-ink-secondary'
                        }`}
                      >
                        {tab.idx}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          isActive ? 'scale-100 bg-volt' : 'scale-75 bg-line-mid opacity-50'
                        }`}
                      />
                    </div>

                    <span
                      className={`mt-1 font-display text-[14.5px] font-bold transition-colors duration-300 ${
                        isActive ? 'text-ink' : 'text-ink-secondary group-hover:text-ink'
                      }`}
                    >
                      {tab.tabName}
                    </span>

                    {/* Smooth 5-Second Auto-Cycle Progress Bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-line-light/40"
                      aria-hidden="true"
                    >
                      <div
                        ref={(el) => {
                          barRefs.current[idx] = el;
                        }}
                        className={`h-full bg-gradient-to-r from-volt to-volt-bright transition-opacity duration-300 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ width: '0%' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Active Solution Stage — Zero-Jump Crossfade + Subtle Scale/Glide */}
          <Reveal direction="up" delay={100} className="mt-6">
            <div className="grid items-center gap-8 rounded-2xl border border-line-light bg-surface p-5 shadow-card sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Left: Stacked Crossfade + Depth-Settle Image Stage */}
              <div className="overflow-hidden rounded-xl border border-line-light bg-canvas p-2.5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-obsidian">
                  {SOLUTIONS_TABS.map((sol, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <img
                        key={sol.key}
                        src={sol.img}
                        alt={sol.alt}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 h-full w-full object-cover will-change-transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isActive
                            ? 'z-10 scale-100 opacity-100'
                            : 'z-0 scale-[1.05] opacity-0 pointer-events-none'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Smoothly Animated Image Caption Bar */}
                <div className="grid [grid-template-areas:'caption'] px-2 pt-3 pb-1 text-[13px]">
                  {SOLUTIONS_TABS.map((sol, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <div
                        key={sol.key}
                        aria-hidden={!isActive}
                        className={`[grid-area:caption] flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isActive
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-1.5 opacity-0 pointer-events-none'
                        }`}
                      >
                        <span className="font-medium text-ink-secondary">{sol.caption}</span>
                        <strong className="font-display text-xs font-bold text-volt">
                          {sol.badge}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Stacked Editorial Content Stage (Locks Height & Glides Smoothly) */}
              <div className="grid [grid-template-areas:'panel'] items-center">
                {SOLUTIONS_TABS.map((sol, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <div
                      key={sol.key}
                      role="tabpanel"
                      aria-hidden={!isActive}
                      className={`[grid-area:panel] will-change-transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive
                          ? 'z-10 translate-y-0 scale-100 opacity-100'
                          : 'z-0 translate-y-3 scale-[0.985] opacity-0 pointer-events-none'
                      }`}
                    >
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-volt">
                        {sol.eyebrow}
                      </span>
                      <h3 className="mt-1.5 font-display text-[24px] font-bold leading-snug text-ink sm:text-[28px]">
                        {sol.heading}
                      </h3>
                      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-secondary">
                        {sol.copy}
                      </p>

                      {/* Workflow Steps with Staggered Entrance */}
                      <div className="mt-5 rounded-xl border border-line-light bg-canvas/70 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-muted">
                          <span className="font-display">System Workflow</span>
                          <span className="font-display text-volt">{sol.loopLabel}</span>
                        </div>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {sol.steps.map((step, sIdx) => (
                            <div
                              key={step.num}
                              style={{
                                transitionDelay: isActive ? `${80 + sIdx * 45}ms` : '0ms'
                              }}
                              className={`rounded-lg border border-line-light bg-surface px-3 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                isActive
                                  ? 'translate-y-0 opacity-100'
                                  : 'translate-y-2 opacity-0'
                              }`}
                            >
                              <span className="block font-display text-[11px] font-bold uppercase text-volt">
                                {step.num}
                              </span>
                              <span className="mt-0.5 block font-display text-[13.5px] font-semibold text-ink">
                                {step.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Checkmarks */}
                      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                        {sol.checks.map((chk, cIdx) => (
                          <li
                            key={chk}
                            style={{
                              transitionDelay: isActive ? `${160 + cIdx * 35}ms` : '0ms'
                            }}
                            className={`flex items-start gap-2 text-[14px] text-ink-secondary transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isActive
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-1.5 opacity-0'
                            }`}
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                            <span>{chk}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6">
                        <button
                          type="button"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => handleDiscuss(sol.scopes)}
                          className="btn-primary px-5 py-3 text-[14.5px]"
                        >
                          <span>Discuss a Similar System</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
