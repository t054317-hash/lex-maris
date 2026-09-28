import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { ServiceRow } from '@/lib/database.types';
import { getServerT } from '@/i18n/server';

export function generateMetadata(): Metadata {
  const { t } = getServerT();
  return { title: t('checkout.title'), description: t('meta.checkout.description') };
}

/**
 * Contract Writing checkout.
 *
 * A server component so the price comes from the database, not from a constant
 * in the bundle -- a price a client can read out of JavaScript is a price they
 * can argue about. `services` is the one table readable by `anon`, so this
 * renders for a visitor who has not signed in yet.
 */
const FALLBACK: ServiceRow = {
  id: '00000000-0000-0000-0000-000000000000',
  slug: 'contract-writing',
  name_en: 'Contract Writing',
  name_ar: 'صياغة العقود',
  description_en: '',
  description_ar: '',
  base_price: 250000,
  currency: 'KWD',
  turnaround_days: 3,
  is_active: true,
  sort_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default async function ContractWritingCheckoutPage() {
  const { t } = getServerT();
  let service: ServiceRow = FALLBACK;
  let offline = false;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', 'contract-writing')
      .eq('is_active', true)
      .single();

    if (error || !data) offline = true;
    else service = data;
  } catch {
    // Env not configured yet. Render with the catalogue default rather than
    // crashing the page -- but say so, so nobody mistakes it for live pricing.
    offline = true;
  }

  return (
    <main id="main" className="px-6 py-14 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 text-[11px] uppercase tracking-[0.16em] text-ink-500">
          <Link href="/" data-cursor="hover" className="transition-colors hover:text-gold-400">
            {t('brand.name')}
          </Link>
          <span aria-hidden className="mx-2 opacity-40">
            /
          </span>
          <span className="text-ink-300">{t('checkout.breadcrumb')}</span>
        </nav>

        <header className="max-w-2xl">
          <p className="eyebrow">{t('checkout.eyebrow')}</p>
          <h1 className="mt-4 text-balance font-display text-3xl leading-tight sm:text-4xl">
            {t('checkout.title')}
          </h1>
          <p className="mt-5 text-base font-light leading-relaxed text-ink-300">
            {t('checkout.subtitle')}
          </p>
        </header>

        {offline && (
          <p
            role="status"
            className="mt-8 rounded-lg border border-status-watch/40 bg-status-watch/5 px-4 py-3 text-sm text-status-watch"
          >
            {t('checkout.offline')}
          </p>
        )}

        <div className="mt-12">
          <CheckoutForm service={service} />
        </div>

        <p className="mt-12 border-t border-ink-500/15 pt-6 text-xs leading-relaxed text-ink-500">
          {t('checkout.disclaimer')}
        </p>
      </div>
    </main>
  );
}
