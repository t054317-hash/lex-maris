'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ParticleBurst } from './ParticleBurst';
import { useGavelAudio } from './useGavelAudio';
import type { GavelPhase } from './GavelScene';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useT } from '@/i18n/I18nProvider';

/**
 * The 3D scene is code-split and client-only: it must never reach the SSR
 * bundle, and users who skip the intro should never pay to download three.js.
 */
const GavelScene = dynamic(
  () => import('./GavelScene').then((m) => m.GavelScene),
  { ssr: false, loading: () => null },
);

const SESSION_KEY = 'lexmaris.intro.seen';
/** ms from impact until the overlay is fully dissolved and unmounted. */
const DISSOLVE_MS = 1150;

export function GavelIntro({ onComplete }: { onComplete?: () => void }) {
  const t = useT();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [phase, setPhase] = useState<GavelPhase>('idle');
  const [burst, setBurst] = useState(0);
  const { strike, prime } = useGavelAudio();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show the intro once per session, and never for reduced-motion users.
  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY) === '1';
    if (seen || reduced) {
      setOpen(false);
      onComplete?.();
    }
  }, [reduced, onComplete]);

  const finish = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setOpen(false);
    onComplete?.();
  }, [onComplete]);

  const handleStrike = useCallback(() => {
    if (phase !== 'idle') return;
    // Audio must be started synchronously inside the gesture (autoplay policy).
    prime();
    setPhase('strike');
  }, [phase, prime]);

  /** Fired by the 3D scene at the exact frame of contact. */
  const handleImpact = useCallback(() => {
    strike(0.85);
    setBurst((n) => n + 1);
    if (navigator.vibrate) navigator.vibrate(18);
    dismissTimer.current = setTimeout(finish, DISSOLVE_MS);
  }, [strike, finish]);

  // Keyboard parity: Enter/Space strikes, Escape skips.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if ((e.key === 'Enter' || e.key === ' ') && phase === 'idle') {
        e.preventDefault();
        handleStrike();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, phase, finish, handleStrike]);

  useEffect(
    () => () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    },
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro"
          role="dialog"
          aria-label={t('intro.label')}
          className="fixed inset-0 z-[80] bg-navy-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(14px)', scale: 1.06 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Full-bleed click target — the whole screen is the interaction. */}
          <button
            type="button"
            onClick={handleStrike}
            aria-label={t('intro.strike')}
            className="absolute inset-0 h-full w-full cursor-none focus:outline-none"
          >
            <span className="sr-only">
              {t('intro.strike')} — {t('brand.name')}
            </span>
          </button>

          <div className="pointer-events-none absolute inset-0">
            <GavelScene phase={phase} onImpact={handleImpact} />
          </div>

          <ParticleBurst trigger={burst} originY={0.58} />

          {/* Vignette + floor glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 45% at 50% 62%, rgba(212,175,55,0.13), transparent 70%), radial-gradient(120% 90% at 50% 50%, transparent 45%, rgba(5,10,24,0.92) 100%)',
            }}
          />

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-[16%] flex flex-col items-center gap-3 px-6 text-center"
            animate={{ opacity: phase === 'idle' ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="font-display text-3xl tracking-[0.34em] text-gold-500 sm:text-5xl">
              {t('brand.name')}
            </h1>
            <p className="eyebrow">{t('brand.tagline')}</p>
            <p className="mt-4 animate-floatSlow text-sm text-ink-300">
              {t('intro.convene')}
            </p>
          </motion.div>

          <button
            type="button"
            onClick={finish}
            data-cursor="hover"
            className="glass glass-interactive absolute bottom-6 end-6 z-10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink-300 hover:text-gold-400"
          >
            {t('intro.skip')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
