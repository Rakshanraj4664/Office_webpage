import React from 'react';

// An original SVG illustration: a pathway from learning to building and leading.
export default function CareersBackground() {
  return (
    <div className="careers-background" aria-hidden="true">
      <svg className="careers-pathway" viewBox="0 0 960 580" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="career-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="#c5c3bb" strokeOpacity=".35" strokeWidth="1" /></pattern>
          <linearGradient id="career-route" x1="126" y1="450" x2="816" y2="145" gradientUnits="userSpaceOnUse"><stop stopColor="#e6a682" /><stop offset="1" stopColor="#df4b18" /></linearGradient>
        </defs>
        <rect width="960" height="580" fill="url(#career-grid)" />
        <circle cx="500" cy="286" r="205" stroke="#d9d6cc" strokeOpacity=".65" />
        <circle cx="500" cy="286" r="260" stroke="#d9d6cc" strokeOpacity=".4" strokeDasharray="3 10" />
        {/* An ascending route connects stages of a career. */}
        <path d="M62 505 C159 505 164 409 281 409 C397 409 347 287 489 287 C627 287 593 163 751 163 H901" stroke="#e8ddd5" strokeWidth="14" strokeLinecap="round" />
        <path className="career-route-flow" d="M62 505 C159 505 164 409 281 409 C397 409 347 287 489 287 C627 287 593 163 751 163 H901" stroke="url(#career-route)" strokeWidth="2.5" strokeDasharray="8 9" strokeLinecap="round" />
        <g className="career-node career-node-one">
          <circle cx="251" cy="408" r="8" fill="#df4b18" /><circle cx="251" cy="408" r="18" stroke="#df4b18" strokeOpacity=".28" />
          <rect x="134" y="301" width="214" height="82" rx="14" fill="#fff" fillOpacity=".9" stroke="#ddd9cf" />
          <rect x="151" y="318" width="47" height="47" rx="10" fill="#fcefe8" />
          <path d="M164 332c6-2 10-1 11 1 2-2 6-3 11-1v16c-5-2-9-1-11 1-1-2-5-3-11-1v-16Zm11 1v16" stroke="#df4b18" strokeWidth="1.8" strokeLinejoin="round" />
          <text x="211" y="337" fill="#111317" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">LEARN</text>
          <text x="211" y="356" fill="#727885" fontSize="11" fontFamily="Arial, sans-serif">Develop your skills</text>
        </g>
        <g className="career-node career-node-two">
          <circle cx="488" cy="287" r="8" fill="#df4b18" /><circle cx="488" cy="287" r="18" stroke="#df4b18" strokeOpacity=".28" />
          <rect x="374" y="178" width="220" height="82" rx="14" fill="#fff" fillOpacity=".92" stroke="#ddd9cf" />
          <rect x="391" y="195" width="47" height="47" rx="10" fill="#fcefe8" />
          <path d="m406 218 6-6-6-6m17 12-6-6 6-6m-7-3-4 19" stroke="#df4b18" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="451" y="214" fill="#111317" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">BUILD</text>
          <text x="451" y="233" fill="#727885" fontSize="11" fontFamily="Arial, sans-serif">Create real solutions</text>
        </g>
        <g className="career-node career-node-three">
          <circle cx="751" cy="163" r="8" fill="#df4b18" /><circle cx="751" cy="163" r="18" stroke="#df4b18" strokeOpacity=".28" />
          <rect x="650" y="54" width="214" height="82" rx="14" fill="#fff" fillOpacity=".94" stroke="#ddd9cf" />
          <rect x="667" y="71" width="47" height="47" rx="10" fill="#fcefe8" />
          <circle cx="690" cy="85" r="5" stroke="#df4b18" strokeWidth="1.8" /><path d="M680 106c1-6 5-9 10-9s9 3 10 9" stroke="#df4b18" strokeWidth="1.8" strokeLinecap="round" />
          <text x="727" y="90" fill="#111317" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">GROW</text>
          <text x="727" y="109" fill="#727885" fontSize="11" fontFamily="Arial, sans-serif">Make an impact</text>
        </g>
        <path d="M78 183h105m-105 10h70M760 397h110m-110 10h76" stroke="#c9c5b9" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="130" cy="250" r="3" fill="#df4b18" fillOpacity=".45" /><circle cx="702" cy="346" r="3" fill="#df4b18" fillOpacity=".45" />
      </svg>
    </div>
  );
}
