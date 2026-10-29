import React, { useEffect, useRef, useState } from 'react';

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = ''
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform = {
    up: 'translate-y-8 opacity-0',
    left: '-translate-x-8 opacity-0',
    right: 'translate-x-8 opacity-0',
    zoom: 'scale-[0.96] opacity-0'
  }[direction] || 'translate-y-8 opacity-0';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hiddenTransform
      } ${className}`}
    >
      {children}
    </div>
  );
}
