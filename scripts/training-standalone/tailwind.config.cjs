/**
 * Tailwind config for the standalone training page.
 *
 * The training components are written against the app's semantic tokens:
 * `navy` = surfaces, `ink` = text, `gold` = accent. Remapping those three
 * families here re-skins the same components into the platform's official
 * light palette (ivory surfaces, navy ink, one green accent) without touching
 * a component or the LEX MARIS app, which keeps its own navy-and-gold config.
 */
const path = require('node:path');
const src = path.join(__dirname, '..', '..', 'src');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(src, 'components/training/**/*.tsx'),
    path.join(src, 'lib/training/**/*.ts'),
    path.join(__dirname, 'index.html'),
  ],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#ffffff', 900: '#f4f6f9', 800: '#ffffff', 700: '#e6eaf0', 600: '#d5dbe4' },
        gold: { 400: '#0b5e3f', 500: '#0b5e3f', 600: '#084d33', 700: '#063d28' },
        ink: { 100: '#0f2440', 300: '#34465f', 500: '#65738a' },
        status: { safe: '#1f7a57', watch: '#9a5f14', risk: '#b5541c', critical: '#b0362a' },
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
        sans: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      borderRadius: { glass: '16px' },
      boxShadow: { glass: '0 1px 2px rgba(15,36,64,0.06), 0 12px 32px -18px rgba(15,36,64,0.28)' },
      transitionTimingFunction: { lux: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
};
