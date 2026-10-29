import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Reveal from './Reveal';
import { FAQ_ITEMS } from '../data/protovoltData';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <Reveal direction="up" className="max-w-2xl">
          <span className="eyebrow-pill">
            <span className="h-2 w-2 rounded-full bg-volt" />
            FAQ
          </span>
          <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px]">
            Frequently asked questions.
          </h2>
        </Reveal>

        <Reveal direction="up" delay={70} className="mt-8 max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-line-light bg-surface transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-[16px] font-bold text-ink hover:bg-canvas/50 sm:px-6"
                >
                  <span>{item.q}</span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-volt transition-transform duration-200 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-line-light/80 px-5 py-4 text-[15px] leading-relaxed text-ink-secondary sm:px-6">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
