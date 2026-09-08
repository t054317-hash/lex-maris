'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks `prefers-reduced-motion` reactively. JS animation loops (canvas, WebGL)
 * must consult this in addition to the CSS media query, otherwise they keep
 * burning frames for users who asked us not to animate.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
