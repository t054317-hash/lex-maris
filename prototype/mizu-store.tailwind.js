/**
 * Build config for `prototype/mizu-store.html` only.
 *
 * The storefront ships as a single self-contained file, so its Tailwind CSS is
 * compiled from this config and pasted into the page rather than pulled from a
 * CDN at runtime. Nothing here touches the LEX MARIS app, which has its own
 * `tailwind.config.ts` at the repository root.
 *
 * Rebuild (from this directory) after changing any utility class in the page:
 *
 *   npm i --no-save tailwindcss@3.4.16
 *   printf '@tailwind base;\n' > /tmp/base.css
 *   printf '@tailwind components;\n@tailwind utilities;\n' > /tmp/util.css
 *   npx tailwindcss -c mizu-store.tailwind.js -i /tmp/base.css -o /tmp/tw.base.css --minify
 *   npx tailwindcss -c mizu-store.tailwind.js -i /tmp/util.css -o /tmp/tw.util.css --minify
 *
 * Then paste `tw.base.css` into <style id="tw-base"> and `tw.util.css` into
 * <style id="tw-utilities">. The two blocks are deliberately split so the
 * page's own component CSS sits between them: base → components → utilities,
 * which is the cascade order Tailwind is designed around. Merge them and
 * `.icon-btn` starts beating `lg:hidden`.
 */
module.exports = {
  content: ['./mizu-store.html'],
  // Toggled from JS, so the scanner cannot always see them in an attribute.
  safelist: ['flex', 'hidden', 'grid'],
  theme: {
    extend: {
      colors: {
        porcelain: '#FFFFFF',
        linen: '#FAF9F6',
        mist: '#E3F2FD',
        sage: '#E8F5E9',
        charcoal: '#212121',
        gold: { DEFAULT: '#D4AF37', lit: '#E4C766', deep: '#A8862A' },
        stone: { 300: '#D8D4CC', 400: '#A9A49B', 500: '#6E6A63', 600: '#4A4741' },
        thermal: { hot: '#E2725B', cold: '#4A90C2' },
      },
      fontFamily: {
        display: ['Marcellus', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      maxWidth: { shell: '1200px' },
      transitionTimingFunction: { lux: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
};
