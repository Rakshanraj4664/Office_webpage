import React from 'react';
import Reveal from './Reveal';
import { COMPANY_INFO, INDUSTRIES } from '../data/protovoltData';

const WHY_POINTS = [
  {
    num: '1',
    title: 'All Disciplines in One Team',
    desc: 'Mechanics, electronics, software, vision AI, and automation under one roof.'
  },
  {
    num: '2',
    title: 'Works With Existing Equipment',
    desc: 'Connects smoothly with major industrial PLCs, robots, cameras, and plant networks.'
  },
  {
    num: '3',
    title: 'Confidential & Clear Handover',
    desc: 'Mutual NDAs from day one, with complete CAD, circuit, and software documentation.'
  }
];

export default function Industries() {
  return (
    <section id="applications" className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <Reveal direction="up" className="max-w-2xl">
          <span className="eyebrow-pill">
            <span className="h-2 w-2 rounded-full bg-volt" />
            Industries
          </span>
          <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px]">
            Built for demanding factories and product teams.
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Why Protovolt.io Card */}
          <Reveal direction="left">
            <div className="rounded-2xl border border-line-light bg-surface p-6 shadow-card sm:p-8">
              <span className="eyebrow-pill">
                <span className="h-2 w-2 rounded-full bg-volt" />
                Why {COMPANY_INFO.name}
              </span>
              <h3 className="mt-3 font-display text-[23px] font-bold leading-snug text-ink">
                One engineering partner from prototype to 24/7 operation.
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
                Projects slow down when mechanics, electronics, vision, and software are split across separate vendors.{' '}
                {COMPANY_INFO.name} builds the complete system as one team.
              </p>

              <div className="mt-6 space-y-4 border-t border-line-light pt-5">
                {WHY_POINTS.map((item) => (
                  <div key={item.num} className="flex items-start gap-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-volt-soft font-display text-xs font-bold text-volt">
                      {item.num}
                    </span>
                    <div>
                      <strong className="block font-display text-[15px] font-bold text-ink">
                        {item.title}
                      </strong>
                      <span className="mt-0.5 block text-[13.8px] text-ink-secondary">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 6 Industry Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {INDUSTRIES.map((sec, idx) => (
              <Reveal key={sec.idx} direction="up" delay={(idx % 2) * 70}>
                <div className="h-full rounded-xl border border-line-light bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-line-mid hover:shadow-sm">
                  <span className="font-display text-xs font-bold text-volt">{sec.idx}</span>
                  <h4 className="mt-2 font-display text-[17px] font-bold text-ink">
                    {sec.title}
                  </h4>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
                    {sec.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
