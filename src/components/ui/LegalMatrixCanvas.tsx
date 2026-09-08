'use client';

import { useEffect, useRef } from 'react';
import { useIsVisible } from '@/hooks/useIsVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DISTANCE = 132; // px — max edge length
const POINTER_RADIUS = 190; // px — influence field
const DENSITY = 11_000; // one node per N css-pixels² (auto-scales to viewport)

/**
 * "Legal Matrix": an animated node mesh that reacts to the pointer, standing in
 * for interconnected counterparties, clauses and jurisdictions.
 *
 * Performance contract:
 * - O(n²) edge testing is bounded by a hard node cap (see `MAX_NODES`), so the
 *   frame cost stays flat regardless of viewport size.
 * - The canvas is DPR-aware but clamps to 2× — 3× on a 4K panel triples fill
 *   cost for no perceptible gain.
 * - The loop is cancelled when the section scrolls out of view or the tab is
 *   hidden, and never starts under `prefers-reduced-motion`.
 */
export function LegalMatrixCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ref: wrapRef, visible } = useIsVisible<HTMLDivElement>();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced || !visible) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const MAX_NODES = 90;
    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        MAX_NODES,
        Math.max(28, Math.round((width * height) / DENSITY)),
      );
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.9 + Math.random() * 1.5,
      }));
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerOut = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Soft wrap keeps the mesh seamless without visible respawns.
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        // Gentle pointer attraction — the mesh "leans" toward the cursor.
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS && dist > 0.5) {
            const pull = (1 - dist / POINTER_RADIUS) * 0.35;
            n.x += (dx / dist) * pull;
            n.y += (dy / dist) * pull;
          }
        }
      }

      // Edges first so nodes sit on top.
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;

          const proximity = 1 - dist / LINK_DISTANCE;
          // Edges near the cursor brighten to gold; the rest stay cool steel.
          const heat = pointer.active
            ? Math.max(
                0,
                1 -
                  Math.hypot(pointer.x - (a.x + b.x) / 2, pointer.y - (a.y + b.y) / 2) /
                    POINTER_RADIUS,
              )
            : 0;
          const alpha = proximity * (0.1 + heat * 0.5);
          ctx.strokeStyle = `rgba(${Math.round(150 + heat * 62)}, ${Math.round(
            168 + heat * 7,
          )}, ${Math.round(210 - heat * 155)}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const heat = pointer.active
          ? Math.max(0, 1 - Math.hypot(pointer.x - n.x, pointer.y - n.y) / POINTER_RADIUS)
          : 0;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + heat * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(196 + heat * 16)}, ${Math.round(
          202 - heat * 27,
        )}, ${Math.round(219 - heat * 164)}, ${(0.32 + heat * 0.55).toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerOut);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerOut);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced, visible]);

  return (
    <div ref={wrapRef} aria-hidden className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
