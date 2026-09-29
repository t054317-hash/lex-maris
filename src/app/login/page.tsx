'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { LegalMatrixCanvas } from '@/components/ui/LegalMatrixCanvas';
import { useI18n } from '@/i18n/I18nProvider';
import { useSession } from '@/hooks/useSession';

/**
 * Dedicated /login route.
 *
 * The modal is the primary path -- it preserves a half-filled checkout form.
 * This page exists for the cases a modal cannot serve: an emailed deep link, a
 * bookmark, a redirect from a protected route, and anyone who arrives with
 * JavaScript-driven navigation unavailable.
 *
 * It reuses AuthDialog rather than duplicating the form, so there is exactly
 * one place where sign-in behaviour lives.
 */
export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session, loading } = useSession();
  const [open, setOpen] = useState(true);

  // /auth/callback sends failures back here as ?error=<code>. Say so, in the
  // visitor's language, instead of silently showing the form again.
  const errorCode = useSearchParams().get('error');
  const oauthError = errorCode
    ? errorCode === 'access_denied'
      ? t('auth.error.oauthCancelled')
      : t('auth.error.oauth')
    : null;

  // Already signed in? There is nothing to do here.
  useEffect(() => {
    if (!loading && session) router.replace('/dashboard');
  }, [loading, session, router]);

  return (
    <main id="main" className="relative flex min-h-[calc(100vh-4rem)] items-center px-6 py-16 sm:px-10">
      <LegalMatrixCanvas className="opacity-30" />

      <div className="relative mx-auto max-w-md text-center">
        <p className="eyebrow">{t('brand.tagline')}</p>
        <h1 className="mt-4 font-display text-3xl tracking-[0.2em] text-gold-500">
          {t('brand.name')}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-300">
          {t('auth.signIn.subtitle')}
        </p>

        {oauthError && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-status-risk/40 bg-status-risk/5 px-4 py-3 text-sm text-status-risk"
          >
            {oauthError}
          </p>
        )}

        {!open && (
          <button
            type="button"
            data-cursor="hover"
            onClick={() => setOpen(true)}
            className="mt-8 rounded-full border border-gold-500/50 bg-gold-500/12 px-7 py-3 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
          >
            {t('nav.signIn')}
          </button>
        )}

        <p className="mt-10 text-xs text-ink-500">
          <Link
            href="/"
            data-cursor="hover"
            className="underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-400"
          >
            {t('common.back')}
          </Link>
        </p>
      </div>

      {/* Dismissing on this route returns the visitor to the marketing site
          rather than leaving them on an empty page. */}
      <AuthDialog
        initialError={oauthError}
        open={open}
        onClose={() => {
          setOpen(false);
          router.push('/');
        }}
      />
    </main>
  );
}
