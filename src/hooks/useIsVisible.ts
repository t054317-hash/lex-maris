'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reports whether an element is in the viewport. Used to suspend expensive
 * render loops (WebGL / particle canvases) once they scroll out of view —
 * the single biggest win for sustained 60 FPS on mid-range hardware.
 */
export function useIsVisible<T extends HTMLElement>(rootMargin = '120px') {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, visible } as const;
}
