import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { COMPANY_INFO } from '../data/protovoltData';

const NAV_LINKS = [
  { href: '#architecture', label: 'How It Works' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#process', label: 'Process' },
  { href: '#applications', label: 'Industries' },
  { href: '#faq', label: 'FAQ' }
];

export default function Navbar({ scrollProgress }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line-light/90 bg-canvas/90 backdrop-blur-md">
      {/* Top Scroll Progress Laser */}
      <div className="h-[3px] w-full bg-transparent" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-volt to-volt-bright transition-[width] duration-75"
          style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      <div className="container-shell flex h-[72px] items-center justify-between gap-4">
        {/* Brand Logo */}
        <a href="#top" className="flex items-center gap-3 group" aria-label="Protovolt.io Home">
          <img
            src="/assets/protovolt-logo-dark.png"
            alt="Protovolt.io Logo"
            className="h-[38px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[19px] font-bold tracking-tight text-ink">
              {COMPANY_INFO.name}
            </span>
            <span className="text-[11px] font-medium tracking-wide text-ink-muted">
              Automation &amp; Smart Systems
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-[14px] font-medium text-ink-secondary transition-colors hover:text-volt"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href="#inquire"
            className="btn-primary hidden sm:inline-flex px-4 py-2 text-[13.5px]"
          >
            <span>Get in touch with us</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line-light bg-surface text-ink lg:hidden"
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-line-light bg-surface px-5 py-5 shadow-editorial lg:hidden">
          <div className="flex flex-col gap-3 pb-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-1.5 font-display text-[15px] font-semibold text-ink hover:bg-subtle"
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="#inquire"
            onClick={() => setMobileOpen(false)}
            className="btn-volt w-full py-3 text-[14px]"
          >
            <span>Get in touch with us</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </header>
  );
}
