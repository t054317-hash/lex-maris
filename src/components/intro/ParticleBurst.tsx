'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

/**
 * Golden collision spray emitted at the moment of impact.
 *
 * Runs on a 2D canvas rather than in WebGL: ~220 additive sprites is well
 * inside 2D-canvas budget, and keeping it out of the R3F scene means the burst
 * can outlive the unmounting 3D canvas during the dissolve transition.
 */
export function ParticleBurst({
  trigger,
  originY = 0.62,
}: {
  /** Increment to fire a burst. */
  trigger: number;
  /** Impact point as a fraction of canvas height. */
  originY?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (trigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ox = w / 2;
    const oy = h * originY;

    particlesRef.current = Array.from({ length: 220 }, () => {
      // Bias the spray sideways and upward — debris off a struck surface.
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.55;
      const speed = 2.2 + Math.random() * 8.5;
      const maxLife = 46 + Math.random() * 46;
      return {
        x: ox + (Math.random() - 0.5) * 26,
        y: oy + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size: 0.7 + Math.random() * 2.1,
      };
    });

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      let alive = 0;
      for (const p of particlesRef.current) {
        if (p.life <= 0) continue;
        alive += 1;

        p.vy += 0.13; // gravity
        p.vx *= 0.985; // drag
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        const t = p.life / p.maxLife;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `rgba(255, 236, 170, ${(t * 0.95).toFixed(3)})`);
        grad.addColorStop(0.45, `rgba(212, 175, 55, ${(t * 0.5).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      if (alive > 0) rafRef.current = requestAnimationFrame(step);
      else ctx.clearRect(0, 0, w, h);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, originY]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
