import React from 'react';
import {
  Bot,
  Box,
  Check,
  Cpu,
  Eye,
  Layers,
  Network,
  Sparkles,
  Workflow,
  ArrowUpRight
} from 'lucide-react';
import Reveal from './Reveal';
import { CORE_CAPABILITIES } from '../data/protovoltData';

const ICON_MAP = {
  automation: Workflow,
  robotics: Bot,
  ai: Sparkles,
  vision: Eye,
  iiot: Network,
  embedded: Cpu,
  prototyping: Layers,
  product: Box
};

export default function Capabilities({ selectedScopes, onToggleScope }) {
  return (
    <section id="capabilities" className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <Reveal direction="up" className="max-w-2xl">
          <span className="eyebrow-pill">
            <span className="h-2 w-2 rounded-full bg-volt" />
            Core Areas
          </span>
          <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px]">
            Six core capabilities under one roof.
          </h2>
          <p className="mt-3 text-[16px] text-ink-secondary">
            We bring mechanical design, electronics, software, and AI together so your project moves smoothly from
            start to finish.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_CAPABILITIES.map((cap, idx) => {
            const Icon = ICON_MAP[cap.icon] || Cpu;
            const isSelected = selectedScopes.includes(cap.id);

            return (
              <Reveal key={cap.id} direction="up" delay={(idx % 3) * 60}>
                <article
                  className={`flex h-full flex-col justify-between rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card ${
                    isSelected
                      ? 'border-volt bg-surface ring-2 ring-volt/20'
                      : 'border-line-light bg-surface hover:border-line-mid'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs font-bold tracking-wider text-ink-muted">
                        {cap.num}
                      </span>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-volt bg-volt text-white'
                            : 'border-line-light bg-canvas text-volt'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="mt-4 font-display text-[18.5px] font-bold text-ink">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-[14.2px] leading-relaxed text-ink-secondary">
                      {cap.summary}
                    </p>

                    <ul className="mt-4 space-y-1.5 border-t border-line-light/80 pt-3.5 text-[13.2px] text-ink-secondary">
                      {cap.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-volt" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleScope(cap.id)}
                    className={`mt-5 flex w-full items-center justify-between rounded-lg border px-3.5 py-2 font-display text-[12.5px] font-semibold transition-colors ${
                      isSelected
                        ? 'border-volt bg-volt-soft text-volt'
                        : 'border-line-light bg-canvas/70 text-ink hover:border-volt hover:text-volt'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {isSelected ? 'Added to Scope' : '+ Add to Scope'}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
