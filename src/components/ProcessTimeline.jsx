import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { PROCESS_STAGES } from '../data/protovoltData';

export default function ProcessTimeline({ onOpenArchModal }) {
  const [activeStage, setActiveStage] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      const triggerY = window.innerHeight * 0.52;
      let bestIdx = 0;
      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY) {
          bestIdx = idx;
        }
      });
      setActiveStage(bestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pct = Math.round(((activeStage + 1) / PROCESS_STAGES.length) * 100);
  const current = PROCESS_STAGES[activeStage] || PROCESS_STAGES[0];

  return (
    <section id="process" className="bg-obsidian py-16 text-ink-onDark sm:py-20 lg:py-24">
      <div className="container-shell">
        <div className="grid items-start gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          {/* Left Sticky Summary */}
          <Reveal direction="left" className="lg:sticky lg:top-28">
            <span className="eyebrow-pill-dark">
              <span className="h-2 w-2 rounded-full bg-volt-bright" />
              Our Process
            </span>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-white sm:text-[36px]">
              A clear path from idea to deployed system.
            </h2>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-onDarkMuted">
              We test core ideas early with working prototypes so final engineering and site installation stay smooth
              and predictable.
            </p>

            {/* Live Progress Meter */}
            <div className="mt-7 rounded-xl border border-line-dark bg-obsidianCard p-5">
              <div className="flex items-center justify-between font-display text-xs font-bold uppercase tracking-wider">
                <span className="text-volt-bright">Stage {current.num}</span>
                <span className="text-ink-onDarkMuted">{pct}%</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-obsidian">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-volt to-volt-bright transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 font-display text-[16px] font-bold text-white">
                {current.title}
              </div>
            </div>

            <div className="mt-7">
              <button
                type="button"
                onClick={onOpenArchModal}
                className="btn-volt px-6 py-3.5 text-[14.5px]"
              >
                <span>Book Architecture Review</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>

          {/* Right 6-Stage Timeline */}
          <div className="relative space-y-5 pl-7 sm:pl-9">
            {/* Spine Line */}
            <div
              className="absolute bottom-4 left-[13px] top-4 w-[2px] bg-line-dark sm:left-[15px]"
              aria-hidden="true"
            />
            <div
              className="absolute left-[13px] top-4 w-[2px] bg-volt transition-all duration-300 sm:left-[15px]"
              style={{ height: `${Math.max(10, (activeStage / (PROCESS_STAGES.length - 1)) * 92)}%` }}
              aria-hidden="true"
            />

            {PROCESS_STAGES.map((stage, idx) => {
              const isLit = idx <= activeStage;
              const isCurrent = idx === activeStage;

              return (
                <div
                  key={stage.num}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  onClick={() => setActiveStage(idx)}
                  className={`relative cursor-pointer rounded-xl border p-5 transition-all sm:p-6 ${
                    isCurrent
                      ? 'border-volt bg-obsidianCard shadow-lg'
                      : isLit
                      ? 'border-line-dark bg-obsidianCard/80'
                      : 'border-line-dark/70 bg-obsidianCard/45 hover:bg-obsidianCard/70'
                  }`}
                >
                  {/* Node Circle */}
                  <div
                    className={`absolute -left-[28px] top-6 flex h-7 w-7 items-center justify-center rounded-full border font-display text-[11px] font-bold transition-colors sm:-left-[35px] ${
                      isLit
                        ? 'border-volt bg-volt text-white'
                        : 'border-line-dark bg-obsidian text-ink-onDarkMuted'
                    }`}
                  >
                    {stage.num}
                  </div>

                  <span className="inline-block rounded bg-volt/15 px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-volt-bright">
                    {stage.phase}
                  </span>

                  <h3 className="mt-2.5 font-display text-[19px] font-bold text-white">
                    {stage.title}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-onDarkMuted">
                    {stage.desc}
                  </p>
                  <div className="mt-3.5 border-t border-line-dark pt-3 text-[13px] text-ink-onDark">
                    <strong className="font-display text-volt-bright">Output:</strong> {stage.output}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
