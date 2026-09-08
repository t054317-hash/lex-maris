import type { Config } from 'tailwindcss';

/**
 * Design tokens are the single source of truth for the LEX MARIS brand.
 * Keep them in sync with `src/lib/theme.ts`, which exposes the same values
 * to canvas / WebGL code that cannot read Tailwind classes.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050A18',
          900: '#0A1128', // brand background
          800: '#101A3A',
          700: '#18244F',
          600: '#22315F',
        },
        gold: {
          400: '#E7C765',
          500: '#D4AF37', // brand accent
          600: '#B4922B',
          700: '#8A6F1F',
        },
        ink: {
          100: '#F3F5FA',
          300: '#C3CADB',
          500: '#8B93A8',
        },
        status: {
          safe: '#3FBF8F',
          watch: '#D4AF37',
          risk: '#E0725A',
          critical: '#C0392B',
        },
      },
      fontFamily: {
        // English display / body
        display: ['var(--font-cinzel)', 'Cinzel', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        // Arabic display / body
        arabic: ['var(--font-tajawal)', 'Tajawal', 'Cairo', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { glass: '18px' },
      boxShadow: {
        glass: '0 24px 60px -24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
        goldGlow: '0 0 0 1px rgba(212,175,55,0.35), 0 0 32px -8px rgba(212,175,55,0.45)',
      },
      backdropBlur: { glass: '18px' },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
