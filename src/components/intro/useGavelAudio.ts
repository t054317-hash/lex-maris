'use client';

import { useCallback, useRef } from 'react';

/**
 * Synthesises a gavel strike with the Web Audio API — no binary asset, no
 * network request, ~2 kB of code instead of a 60 kB sample.
 *
 * The strike is three layered voices:
 *   1. a filtered noise burst  → the wood-on-wood crack
 *   2. a fast-decaying sine    → the low body thump
 *   3. a short square blip     → the transient "click" that reads as impact
 *
 * The AudioContext is created lazily inside the user gesture handler, which is
 * what Chrome/Safari autoplay policy requires. Calling `prime()` from any
 * earlier gesture is optional but removes first-strike latency.
 */
export function useGavelAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null; // Graceful: the intro still works silently.
      ctxRef.current = new Ctor();
    }
    // Safari suspends contexts aggressively; resume on every gesture.
    void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /** Pre-renders the noise buffer so the strike has zero allocation cost. */
  const prime = useCallback(() => {
    const ctx = getContext();
    if (!ctx || noiseRef.current) return;
    const length = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      // Exponentially decaying white noise → percussive, not hissy.
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.4);
    }
    noiseRef.current = buffer;
  }, [getContext]);

  const strike = useCallback(
    (volume = 0.9) => {
      const ctx = getContext();
      if (!ctx) return;
      prime();

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = Math.min(Math.max(volume, 0), 1);
      master.connect(ctx.destination);

      // 1 — wood crack
      if (noiseRef.current) {
        const src = ctx.createBufferSource();
        src.buffer = noiseRef.current;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1750;
        bp.Q.value = 0.9;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.85, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        src.connect(bp).connect(g).connect(master);
        src.start(now);
        src.stop(now + 0.35);
      }

      // 2 — body thump
      const thump = ctx.createOscillator();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(180, now);
      thump.frequency.exponentialRampToValueAtTime(48, now + 0.22);
      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.9, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      thump.connect(thumpGain).connect(master);
      thump.start(now);
      thump.stop(now + 0.3);

      // 3 — impact transient
      const click = ctx.createOscillator();
      click.type = 'square';
      click.frequency.value = 2600;
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.22, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      click.connect(clickGain).connect(master);
      click.start(now);
      click.stop(now + 0.05);
    },
    [getContext, prime],
  );

  return { strike, prime } as const;
}
