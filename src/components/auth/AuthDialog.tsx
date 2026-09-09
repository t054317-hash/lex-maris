'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useI18n } from '@/i18n/I18nProvider';

type Mode = 'signIn' | 'signUp';

/**
 * Visitor sign-in / registration modal.
 *
 * Deliberately a modal rather than a route: a visitor part-way through the
 * checkout form must be able to sign in without losing what they typed. The
 * dedicated /login route exists too, for deep links and for anyone who lands
 * there directly.
 *
 * Accessibility: role="dialog" + aria-modal, Escape closes, focus moves to the
 * first field on open and returns to the trigger on close, and a Tab cycle is
 * held inside the panel. Without the focus return, keyboard users get dumped at
 * the top of the document every time they dismiss it.
 */
export function AuthDialog({
  open,
  onClose,
  initialMode = 'signIn',
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}) {
  const { t, dir, locale } = useI18n();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Remember the trigger so focus can go back to it on close.
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      // Defer: the panel is not mounted until after the animation begins.
      const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    returnFocusRef.current?.focus();
    return undefined;
  }, [open]);

  // Escape to dismiss, Tab confined to the panel.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href]',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    // Stop the page scrolling behind the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      setNotice(null);

      try {
        /**
         * Routed through /api/auth/* rather than calling supabase.auth from
         * here, for three reasons the client cannot handle itself:
         *
         *  - the duplicate-email check needs privileged read access to
         *    profiles, which an anonymous browser client does not have;
         *  - login signs out any existing session server-side FIRST, so
         *    switching accounts cannot leave a half-replaced cookie set;
         *  - Supabase returns a success-shaped response for a duplicate
         *    signup (empty `identities`) as anti-enumeration. Detecting that
         *    belongs in one place, not in every form.
         */
        const endpoint = mode === 'signIn' ? '/api/auth/login' : '/api/auth/register';
        const payload =
          mode === 'signIn'
            ? { email, password }
            : { email, password, fullName, organisationName: organisation, locale };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = (await res.json()) as {
          ok?: boolean;
          error?: string;
          confirmationRequired?: boolean;
        };

        if (!res.ok) {
          // 409 on register carries the "already exists, please log in"
          // message. Offer the fix as well as the error: flip to sign-in and
          // keep the address they already typed.
          if (res.status === 409 && mode === 'signUp') {
            setError(result.error ?? t('auth.duplicate'));
            setMode('signIn');
            setPassword('');
            return;
          }
          throw new Error(result.error ?? `Request failed (${res.status})`);
        }

        if (result.confirmationRequired) {
          setNotice(t('auth.confirm.sent'));
          return;
        }

        // The cookie is set; refresh the client's own view of the session
        // before closing so the header does not lag a beat behind.
        await getSupabaseBrowserClient().auth.getSession();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [mode, email, password, fullName, organisation, locale, onClose, t],
  );

  const resetPassword = useCallback(async () => {
    if (!email) {
      setError(t('auth.email'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account/reset`,
      });
      if (resetError) throw resetError;
      setNotice(t('auth.reset.sent'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [email, t]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label={t('auth.close')}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            dir={dir}
            className="glass relative w-full max-w-md p-7 sm:p-9"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">{t('brand.name')}</p>
            <h2 id="auth-title" className="mt-3 font-display text-2xl">
              {mode === 'signIn' ? t('auth.signIn.title') : t('auth.signUp.title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              {mode === 'signIn' ? t('auth.signIn.subtitle') : t('auth.signUp.subtitle')}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === 'signUp' && (
                <>
                  <AuthField
                    ref={firstFieldRef}
                    label={t('auth.fullName')}
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={setFullName}
                    required
                  />
                  <AuthField
                    label={t('auth.organisation')}
                    type="text"
                    autoComplete="organization"
                    value={organisation}
                    onChange={setOrganisation}
                  />
                </>
              )}

              <AuthField
                ref={mode === 'signIn' ? firstFieldRef : undefined}
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                required
              />
              <AuthField
                label={t('auth.password')}
                type="password"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                value={password}
                onChange={setPassword}
                required
                minLength={8}
              />

              {error && (
                <p role="alert" className="text-sm leading-relaxed text-status-risk">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="text-sm leading-relaxed text-status-safe">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                data-cursor="hover"
                className="w-full rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-3 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22 disabled:opacity-50"
              >
                {busy
                  ? t('auth.working')
                  : mode === 'signIn'
                    ? t('auth.submit.signIn')
                    : t('auth.submit.signUp')}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                data-cursor="hover"
                onClick={() => {
                  setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                  setError(null);
                  setNotice(null);
                }}
                className="text-ink-300 underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-400"
              >
                {mode === 'signIn' ? t('auth.toggle.toSignUp') : t('auth.toggle.toSignIn')}
              </button>
              {mode === 'signIn' && (
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={resetPassword}
                  className="text-ink-500 transition-colors hover:text-ink-100"
                >
                  {t('auth.forgot')}
                </button>
              )}
            </div>

            <p className="mt-6 border-t border-ink-500/15 pt-4 text-[11px] leading-relaxed text-ink-500">
              {t('auth.privilegeNotice')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */

interface AuthFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, type, value, onChange, autoComplete, required, minLength },
  ref,
) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input
        ref={ref}
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-500/25 bg-navy-800/70 px-3.5 py-2.5 text-sm text-ink-100 transition-colors duration-300 hover:border-gold-500/50 focus:border-gold-500"
      />
    </label>
  );
});
