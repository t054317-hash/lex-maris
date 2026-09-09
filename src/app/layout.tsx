import type { Metadata, Viewport } from 'next';
import { Cinzel, Inter, Tajawal } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { CursorSpotlight } from '@/components/ui/CursorSpotlight';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { I18nProvider } from '@/i18n/I18nProvider';
import {
  DEFAULT_LOCALE,
  DIRECTION,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from '@/i18n/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LEX MARIS — Commercial, Corporate & Maritime Trade Law',
    template: '%s · LEX MARIS',
  },
  description:
    'Contract automation, clause-level risk analysis and cryptographic execution for commercial, corporate and maritime trade counsel.',
  openGraph: {
    title: 'LEX MARIS',
    description:
      'Contract automation, clause-level risk analysis and cryptographic execution.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A1128',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Locale is resolved on the SERVER from a cookie, so `lang` and `dir` are
 * correct in the very first byte of HTML. Doing it client-side would paint the
 * page left-to-right and then flip it, which is far more jarring in Arabic than
 * a normal hydration mismatch -- the whole layout jumps.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={`${inter.variable} ${cinzel.variable} ${tajawal.variable}`}
    >
      <body data-custom-cursor="on">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-gold-500"
        >
          Skip to content
        </a>
        <I18nProvider initialLocale={locale}>
          <CursorSpotlight />
          <SiteHeader />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
