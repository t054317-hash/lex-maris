'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Soft-glowing spotlight ring that replaces the native cursor.
 *
 * Implementation notes:
 * - Position is written directly to `style.transform` inside a single rAF loop
 *   and lerped toward the raw pointer. React state is deliberately *not* used:
 *   a setState per mousemove would re-render the tree ~120×/s.
 * - Hover growth is driven by `[data-cursor="hover"]` on any element, so new
 *   components opt in declaratively without touching this file.
 * - Disabled for coarse pointers (touch) and for reduced-motion users; in both
 *   cases the native cursor is restored via the `data-custom-cursor` attribute.
 */
export function CursorSpotlight() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduced) {
      document.body.dataset.customCursor = 'off';
      return;
    }
    document.body.dataset.customCursor = 'on';

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y, scale: 1, alpha: 0 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      ring.alpha = 1;

      // Grow when the pointer is over anything interactive.
      const el = e.target as HTMLElement | null;
      const interactive = el?.closest(
        'a,button,[role="button"],input,select,textarea,[data-cursor="hover"]',
      );
      ring.scale = interactive ? 2.15 : 1;
    };

    const onLeave = () => {
      ring.alpha = 0;
    };

    const tick = () => {
      // Critically-damped follow: ring trails, dot is near-instant.
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${ring.scale})`;
        ringRef.current.style.opacity = String(ring.alpha * 0.9);
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity = String(ring.alpha);
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.body.dataset.customCursor = 'off';
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-10 w-10 rounded-full opacity-0 will-change-transform"
        style={{
          border: '1px solid rgba(212,175,55,0.65)',
          background:
            'radial-gradient(circle, rgba(212,175,55,0.16), rgba(212,175,55,0) 70%)',
          boxShadow: '0 0 24px rgba(212,175,55,0.28)',
          transition: 'opacity 220ms linear',
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold-400 opacity-0 will-change-transform"
      />
    </div>
  );
}
