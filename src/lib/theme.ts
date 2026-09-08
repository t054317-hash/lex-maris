/**
 * Brand tokens for non-CSS consumers (WebGL materials, 2D canvas, PDF engine).
 * Mirror of `tailwind.config.ts`.
 */
export const THEME = {
  navy950: '#050A18',
  navy900: '#0A1128',
  navy800: '#101A3A',
  navy700: '#18244F',
  gold400: '#E7C765',
  gold500: '#D4AF37',
  gold700: '#8A6F1F',
  ink100: '#F3F5FA',
  ink300: '#C3CADB',
  ink500: '#8B93A8',
  status: {
    safe: '#3FBF8F',
    watch: '#D4AF37',
    risk: '#E0725A',
    critical: '#C0392B',
  },
} as const;

/** Numeric mirrors for three.js (avoids per-frame string parsing). */
export const THEME_HEX = {
  navy900: 0x0a1128,
  navy800: 0x101a3a,
  gold500: 0xd4af37,
  gold400: 0xe7c765,
  ink100: 0xf3f5fa,
} as const;

export type RiskBand = keyof typeof THEME.status;
