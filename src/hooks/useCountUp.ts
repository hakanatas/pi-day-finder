import { useEffect, useState } from 'react';

/**
 * Animates an integer from 0 to `target` with an ease-out curve.
 * Returns the current animated value and whether the animation finished.
 */
export function useCountUp(target: number, duration = 1600, delay = 350) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      setDone(true);
      return;
    }

    let rafId = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
      setValue(Math.round(target * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    const timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, delay]);

  return { value, done };
}
