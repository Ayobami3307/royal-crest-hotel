import { useEffect, useRef, useState } from 'react';

/** Counts up to `value` when scrolled into view. Respects reduced-motion settings. */
export default function CountUp({ value, suffix = '', decimals = 0, duration = 1600 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reduce) {
          setN(value);
          return;
        }
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setN(value * (1 - (1 - p) ** 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}
