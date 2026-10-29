import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { SYSTEM_FLOW_STEPS } from '../data/protovoltData';

const NODE_POSITIONS = [
  { x: 25, width: 170 },
  { x: 285, width: 170 },
  { x: 545, width: 170 },
  { x: 795, width: 145 }
];

export default function SystemFlow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentStep = SYSTEM_FLOW_STEPS[activeIdx];

  return (
    <>
      <section id="architecture" className="bg-subtle/65 py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <Reveal direction="up" className="max-w-2xl">
            <span className="eyebrow-pill">
              <span className="h-2 w-2 rounded-full bg-volt" />
              How It Works
            </span>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px]">
              Sensing, intelligence, and motion working together.
            </h2>
            <p className="mt-3 text-[16px] text-ink-secondary">
              Our systems combine industrial cameras and sensors with fast local processing, accurate robotic action,
              and live production tracking.
            </p>
          </Reveal>

          <Reveal direction="up" delay={80} className="mt-9">
            <div className="overflow-hidden rounded-2xl border border-line-light bg-surface shadow-card">
              {/* Dark Animated SVG Schematic Stage */}
              <div className="bg-obsidian px-5 py-5 sm:px-7 sm:py-6">
                <div className="mb-3 flex items-center justify-between text-[11.5px] font-semibold uppercase tracking-[0.09em] text-ink-onDarkMuted">
                  <span className="font-display">PROTOVOLT.IO SYSTEM FLOW</span>
                  <span className="inline-flex items-center gap-2 text-volt-bright">
                    <span className="h-2 w-2 rounded-full bg-volt-bright animate-pulseDot" />
                    Live Signal Loop
                  </span>
                </div>

                <svg
                  viewBox="0 0 960 185"
                  role="img"
                  aria-label="Protovolt.io system flow diagram"
                  className="w-full h-auto select-none"
                >
                  <defs>
                    <filter id="voltGlowReact" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path d="M 195 66 L 285 66" stroke="#262B35" strokeWidth="2" fill="none" />
                  <path d="M 455 66 L 545 66" stroke="#262B35" strokeWidth="2" fill="none" />
                  <path d="M 715 66 L 800 66" stroke="#262B35" strokeWidth="2" fill="none" />
                  <path
                    d="M 865 104 L 865 152 Q 865 166 848 166 L 112 166 Q 95 166 95 152 L 95 104"
                    stroke="#262B35"
                    strokeWidth="2"
                    fill="none"
                  />

                  <path className="svg-trace-forward" d="M 195 66 L 800 66" />
                  <path
                    className="svg-trace-return"
                    d="M 865 104 L 865 152 Q 865 166 848 166 L 112 166 Q 95 166 95 152 L 95 104"
                  />

                  <circle r="5" fill="#FF6B35" filter="url(#voltGlowReact)">
                    <animateMotion dur="2.8s" repeatCount="indefinite" path="M 195 66 L 800 66" />
                  </circle>
                  <circle r="5" fill="#FF6B35" filter="url(#voltGlowReact)">
                    <animateMotion dur="2.8s" begin="-1.4s" repeatCount="indefinite" path="M 195 66 L 800 66" />
                  </circle>
                  <circle r="4" fill="#38BDF8">
                    <animateMotion
                      dur="3.8s"
                      repeatCount="indefinite"
                      path="M 865 104 L 865 152 L 95 152 L 95 104"
                    />
                  </circle>

                  {SYSTEM_FLOW_STEPS.map((step, idx) => {
                    const pos = NODE_POSITIONS[idx];
                    const isActive = idx === activeIdx;
                    return (
                      <g
                        key={step.num}
                        onClick={() => setActiveIdx(idx)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={pos.x}
                          y="28"
                          width={pos.width}
                          height="76"
                          rx="8"
                          fill={isActive ? '#202531' : '#171A20'}
                          stroke={isActive ? '#DF4B18' : '#343B4C'}
                          strokeWidth={isActive ? '2.2' : '1.6'}
                        />
                        <text
                          x={pos.x + 16}
                          y="53"
                          fill="#FF8357"
                          fontFamily="Archivo, sans-serif"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {step.svgTag}
                        </text>
                        <text
                          x={pos.x + 16}
                          y="75"
                          fill="#FFFFFF"
                          fontFamily="Archivo, sans-serif"
                          fontSize="14"
                          fontWeight="700"
                        >
                          {step.svgTitle}
                        </text>
                        <text
                          x={pos.x + 16}
                          y="92"
                          fill="#9BA2B0"
                          fontFamily="IBM Plex Sans, sans-serif"
                          fontSize="10.5"
                        >
                          {step.svgSub}
                        </text>
                      </g>
                    );
                  })}

                  <rect x="355" y="153" width="250" height="22" rx="11" fill="#12151B" stroke="#2B3140" />
                  <text
                    x="480"
                    y="168"
                    textAnchor="middle"
                    fill="#7DD3FC"
                    fontFamily="Archivo, sans-serif"
                    fontSize="10.5"
                    fontWeight="700"
                    letterSpacing="0.06em"
                  >
                    &larr; CONTINUOUS FEEDBACK LOOP
                  </text>
                </svg>
              </div>

              {/* Interactive Step Cards */}
              <div className="grid divide-y divide-line-light sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                {SYSTEM_FLOW_STEPS.map((step, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`p-5 text-left transition-colors ${
                        isActive ? 'bg-volt-soft/60' : 'bg-surface hover:bg-canvas/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-volt">
                          {step.num}
                        </span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full transition-colors ${
                            isActive ? 'bg-volt' : 'bg-line-mid'
                          }`}
                        />
                      </div>
                      <div className="mt-2 font-display text-[16px] font-bold text-ink">
                        {step.title}
                      </div>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-secondary">
                        {step.shortDesc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Inspector Bar */}
              <div className="flex flex-col items-start justify-between gap-4 border-t border-line-light bg-canvas/75 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <p className="text-[14.5px] text-ink-secondary">
                  <strong className="font-display font-bold text-ink">
                    {currentStep.num} · {currentStep.title}:
                  </strong>{' '}
                  {currentStep.detail}
                </p>
                <a href="#inquire" className="btn-outline shrink-0 px-4 py-2 text-[13px]">
                  <span>Get in touch with us</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Subtle Kinetic Capability Ribbon */}
      <div className="overflow-hidden border-b border-line-light bg-obsidian py-3 text-center font-display text-[12px] font-semibold tracking-[0.14em] text-ink-onDarkMuted">
        <div className="container-shell truncate">
          INDUSTRIAL AUTOMATION <span className="text-volt mx-2">&bull;</span> ROBOTICS{' '}
          <span className="text-volt mx-2">&bull;</span> MACHINE VISION{' '}
          <span className="text-volt mx-2">&bull;</span> AI &amp; ML{' '}
          <span className="text-volt mx-2">&bull;</span> EMBEDDED SYSTEMS{' '}
          <span className="text-volt mx-2">&bull;</span> INDUSTRIAL IOT{' '}
          <span className="text-volt mx-2">&bull;</span> RAPID PROTOTYPING{' '}
          <span className="text-volt mx-2">&bull;</span> PRODUCT DEVELOPMENT
        </div>
      </div>
    </>
  );
}
