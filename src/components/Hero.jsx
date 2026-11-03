import React from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { COMPANY_INFO, MARQUEE_ITEMS } from '../data/protovoltData';

export default function Hero() {
  return (
    <section>
      <div className="relative isolate overflow-hidden">
        {/* A soft scrim keeps the copy legible over the scrolling 3D scene. */}
        <div className="hero-copy-scrim pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-shell relative py-10 sm:py-14 lg:py-16">
        <div className="lg:max-w-[590px]">
          {/* Left Copy */}
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-line-light bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-ink-secondary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-volt animate-pulseDot" />
              <span>Automation · Robotics · Vision · AI · IIoT</span>
            </div>

            <h1 className="mt-5 font-display text-[36px] font-bold leading-[1.09] tracking-[-0.025em] text-ink sm:text-[46px] lg:text-[54px]">
              Smart hardware and <span className="text-volt">automation</span> built for real industry.
            </h1>

            <p className="mt-5 max-w-2xl text-[16.5px] leading-[1.68] text-ink-secondary sm:text-[17.5px]">
              <strong className="font-semibold text-ink">{COMPANY_INFO.name}</strong> designs and builds custom automation systems,
              robotic cells, vision inspection stations, connected IIoT devices, embedded electronics, and AI-powered
              products—taking your project from early concept to reliable factory deployment.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <a href="#inquire" className="btn-primary px-6 py-3.5 text-[15px]">
                <span>Get in touch with us</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#capabilities" className="btn-outline px-6 py-3.5 text-[15px]">
                <span>View Capabilities</span>
              </a>
            </div>

            {/* Clean Stats */}
            <div className="mt-9 grid gap-4 border-t border-line-light pt-6 sm:grid-cols-3">
              <div>
                <strong className="block font-display text-[17px] font-bold text-ink">
                  6 Core Areas
                </strong>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-secondary">
                  Hardware, software, vision &amp; robotics in one team
                </span>
              </div>
              <div>
                <strong className="block font-display text-[17px] font-bold text-ink">
                  LightGuide Augmented Intelligence
                </strong>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-secondary">
                  Projected instructions for manual work
                </span>
              </div>
              <div>
                <strong className="block font-display text-[17px] font-bold text-ink">
                  End-to-End
                </strong>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-secondary">
                  Concept, development, testing &amp; site rollout
                </span>
              </div>
            </div>
          </Reveal>

        </div>
        </div>
      </div>

      {/* Infinite Capability Marquee */}
      <div className="overflow-hidden border-y border-line-light bg-surface py-3.5">
        <div className="flex w-max animate-marquee items-center">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              aria-hidden={dup === 1}
              className="flex items-center gap-8 pr-8"
            >
              {MARQUEE_ITEMS.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="inline-flex items-center gap-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-ink-secondary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
