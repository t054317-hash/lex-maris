/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content-Security-Policy.
 *
 * The browser may load scripts, styles, fonts and images from this origin
 * only, and talk only to this origin and the Supabase project (REST + realtime
 * websocket). That is what turns an injected <script src="https://evil..."> or
 * an exfiltrating fetch into a blocked request instead of a breach.
 *
 * 'unsafe-inline' for scripts is required by the Next 14 App Router, which
 * inlines its hydration payload; the alternative is a per-request nonce, which
 * forces every page to render dynamically. React escapes all interpolated text,
 * and no component uses dangerouslySetInnerHTML, so the inline allowance does
 * not open an injection path of its own. 'unsafe-eval' is dev-only (React
 * Refresh).
 *
 * Card details never touch this site -- checkout navigates away to the
 * gateway -- so no payment origin needs to appear here.
 */
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://${supabase} wss://${supabase}`,
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Three.js ships ESM; transpiling keeps tree-shaking predictable across Next versions.
  transpilePackages: ['three'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Authenticated JSON must never be cached by a shared proxy or CDN.
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
