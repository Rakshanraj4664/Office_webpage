import React from 'react';
import { COMPANY_INFO } from '../data/protovoltData';

export default function WhatsAppChat() {
  return (
    <a
      href={COMPANY_INFO.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Text us on WhatsApp at ${COMPANY_INFO.phoneDisplay} (opens in a new tab)`}
      className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-[#1da851] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emeraldBrand"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12.04 2a9.91 9.91 0 0 0-8.57 14.88L2 22l5.25-1.38A9.94 9.94 0 1 0 12.04 2Zm0 18.17a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.13c-.25-.12-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.24-.74-.65-1.24-1.46-1.39-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.55-1.33-.76-1.82-.2-.49-.41-.42-.55-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.04s.88 2.36 1 2.52c.12.17 1.73 2.65 4.19 3.71.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.45-.59 1.66-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.29Z" />
        </svg>
      </span>
      <span>Text with us on WhatsApp</span>
    </a>
  );
}
