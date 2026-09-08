import type { Metadata, Viewport } from 'next';
import { Cinzel, Inter, Tajawal } from 'next/font/google';
import './globals.css';
import { CursorSpotlight } from '@/components/ui/CursorSpotlight';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} ${tajawal.variable}`}
    >
      <body data-custom-cursor="on">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-gold-500"
        >
          Skip to content
        </a>
        <CursorSpotlight />
        {children}
      </body>
    </html>
  );
}
