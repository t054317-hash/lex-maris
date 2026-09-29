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
        // Theme-able: channels live in CSS variables (globals.css), so the
        // same classes (and their /opacity modifiers) serve dark and light.
        navy: {
          950: '#050A18', // intro and overlays stay dark in both themes
          900: 'rgb(var(--navy-900) / <alpha-value>)', // page ground
          800: 'rgb(var(--navy-800) / <alpha-value>)',
          700: 'rgb(var(--navy-700) / <alpha-value>)',
          600: 'rgb(var(--navy-600) / <alpha-value>)',
        },
        gold: {
          400: 'rgb(var(--gold-400) / <alpha-value>)',
          500: 'rgb(var(--gold-500) / <alpha-value>)', // brand accent
          600: 'rgb(var(--gold-600) / <alpha-value>)',
          700: 'rgb(var(--gold-700) / <alpha-value>)',
        },
        ink: {
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
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
        // Two identical lists side by side: moving by half the track loops seamlessly.
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRtl: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
        goldSweep: {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        marqueeRtl: 'marqueeRtl 48s linear infinite',
        goldSweep: 'goldSweep 7s ease-in-out infinite',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
