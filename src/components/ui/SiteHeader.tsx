'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { LanguageToggle } from './LanguageToggle';
import { useI18n } from '@/i18n/I18nProvider';
import { useSession } from '@/hooks/useSession';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Site header. Sticky, translucent, and the single home for the two global
 * controls the brief called for: the language toggle and the sign-in entry.
 *
 * Layout uses logical properties throughout (ms-/me-, start/end) so the whole
 * bar mirrors under dir="rtl" without a second stylesheet.
 */
export function SiteHeader() {
  const { t } = useI18n();
  const { session, loading } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  const signOut = async () => {
    await getSupabaseBrowserClient().auth.signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-[60] border-b border-ink-500/12 bg-navy-900/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6 sm:px-10">
          <Link
            href="/"
            data-cursor="hover"
            className="font-display text-sm tracking-[0.28em] text-gold-500 transition-colors hover:text-gold-400"
          >
            {t('brand.name')}
          </Link>

          <nav className="ms-auto hidden items-center gap-7 md:flex">
            <HeaderLink href="/#services">{t('nav.services')}</HeaderLink>
            <HeaderLink href="/#bench">{t('nav.bench')}</HeaderLink>
            {session && <HeaderLink href="/dashboard">{t('nav.dashboard')}</HeaderLink>}
          </nav>

          <div className="ms-auto flex items-center gap-3 md:ms-0">
            <LanguageToggle />

            {/* Reserve the button's width while the session resolves, so the
                header does not reflow a beat after load. */}
            {loading ? (
              <span aria-hidden className="h-8 w-[5.5rem] rounded-full bg-navy-800/40" />
            ) : session ? (
              <button
                type="button"
                data-cursor="hover"
                onClick={signOut}
                className="rounded-full border border-ink-500/30 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-ink-300 transition-colors duration-300 hover:border-gold-500/50 hover:text-gold-400"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <button
                type="button"
                data-cursor="hover"
                onClick={() => setAuthOpen(true)}
                className="rounded-full border border-gold-500/45 bg-gold-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/20"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-cursor="hover"
      className="text-[11px] uppercase tracking-[0.16em] text-ink-300 transition-colors duration-300 hover:text-gold-400"
    >
      {children}
    </Link>
  );
}
