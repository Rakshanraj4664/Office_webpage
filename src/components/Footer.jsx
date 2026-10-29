import React from 'react';
import { COMPANY_INFO } from '../data/protovoltData';

export default function Footer({ inquiryCount, onOpenInbox }) {
  return (
    <footer className="border-t border-line-light bg-surface pt-14 pb-8">
      <div className="container-shell">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.85fr_1.2fr]">
          {/* Brand */}
          <div>
            <a href="#top" className="inline-flex items-center gap-3">
              <img
                src="/assets/protovolt-logo-dark.png"
                alt="Protovolt.io Logo"
                className="h-[38px] w-auto object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[19px] font-bold text-ink">
                  {COMPANY_INFO.name}
                </span>
                <span className="text-[11px] font-medium text-ink-muted">
                  Engineering &amp; Technology
                </span>
              </div>
            </a>
            <p className="mt-4 max-w-sm text-[14.2px] leading-relaxed text-ink-secondary">
              Custom industrial automation, robotics, AI, machine vision, IIoT, embedded hardware, and rapid
              prototyping.
            </p>
            <div className="mt-3 text-xs font-medium text-ink-muted">
              GST: <span className="font-display font-semibold text-ink">{COMPANY_INFO.gst}</span>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              Capabilities
            </span>
            <ul className="mt-3.5 space-y-2 text-[14px] text-ink-secondary">
              <li><a href="#capabilities" className="hover:text-volt">Industrial Automation</a></li>
              <li><a href="#capabilities" className="hover:text-volt">Robotics</a></li>
              <li><a href="#capabilities" className="hover:text-volt">AI &amp; Machine Vision</a></li>
              <li><a href="#capabilities" className="hover:text-volt">IIoT &amp; Embedded Systems</a></li>
              <li><a href="#capabilities" className="hover:text-volt">Prototyping &amp; Products</a></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              Explore
            </span>
            <ul className="mt-3.5 space-y-2 text-[14px] text-ink-secondary">
              <li><a href="#architecture" className="hover:text-volt">How It Works</a></li>
              <li><a href="#solutions" className="hover:text-volt">Solutions</a></li>
              <li><a href="#process" className="hover:text-volt">Our Process</a></li>
              <li><a href="#applications" className="hover:text-volt">Industries</a></li>
              <li><a href="#faq" className="hover:text-volt">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              Office &amp; Contact
            </span>
            <ul className="mt-3.5 space-y-2.5 text-[14px] text-ink-secondary">
              <li>
                <a href={COMPANY_INFO.emailHref} className="font-medium text-ink hover:text-volt">
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li>
                <a href={COMPANY_INFO.phoneHref} className="font-medium text-ink hover:text-volt">
                  {COMPANY_INFO.phoneDisplay}
                </a>
              </li>
              <li className="leading-relaxed text-[13.5px]">
                {COMPANY_INFO.address}
              </li>
              <li className="pt-1">
                <a href="#inquire" className="font-display font-semibold text-volt hover:underline">
                  Get in touch with us &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-light pt-6 text-[13.5px] text-ink-muted">
          <span>
            &copy; {new Date().getFullYear()} {COMPANY_INFO.name} &middot; GST: {COMPANY_INFO.gst}. All rights reserved.
          </span>
          <button
            type="button"
            onClick={onOpenInbox}
            className="inline-flex items-center gap-2 rounded-full border border-line-light bg-canvas px-3.5 py-1.5 font-display text-xs font-semibold text-ink hover:border-volt"
          >
            <span>Inquiries</span>
            <span className="rounded-full bg-volt px-2 py-0.5 text-[11px] font-bold text-white">
              {inquiryCount}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
