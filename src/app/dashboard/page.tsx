import type { Metadata } from 'next';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { LegalMatrixCanvas } from '@/components/ui/LegalMatrixCanvas';
import {
  ContractTimeline,
  type TimelineStage,
} from '@/components/dashboard/ContractTimeline';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/lib/database.types';
import { NUMBER_LOCALE } from '@/i18n/config';
import { getServerT } from '@/i18n/server';
import type { TranslationKey } from '@/i18n/dictionaries';

export function generateMetadata(): Metadata {
  return { title: getServerT().t('meta.dashboard.title') };
}

// Always read live: this page shows the visitor's own records.
export const dynamic = 'force-dynamic';

/**
 * "My files" -- the signed-in client's own instructions and where each one
 * has reached.
 *
 * Reads service_orders through the USER's session, so Row Level Security
 * returns only rows the visitor may see (their own, or their organisation's
 * if they are staff). Nothing here is sample data: an account with no
 * instructions sees an empty state, not a demo matter.
 */

const STAGES = ['received', 'quote', 'drafting', 'delivered'] as const;

/** Stages COMPLETED for each order status; the next stage is the current one. */
const REACHED: Record<OrderStatus, number> = {
  draft: 1, // received; review and quote under way
  awaiting_payment: 1, // quote issued, awaiting the client's approval
  paid: 2, // engagement confirmed; drafting
  in_progress: 2,
  delivered: 4,
  cancelled: 0,
  refunded: 0,
};

const CLOSED: Partial<Record<OrderStatus, TranslationKey>> = {
  cancelled: 'dash.status.cancelled',
  refunded: 'dash.status.refunded',
};

interface OrderRow {
  id: string;
  reference: string;
  status: OrderStatus;
  created_at: string;
  brief: { terms?: { type?: string } } | null;
}

export default async function DashboardPage() {
  const { t, locale } = getServerT();

  let orders: OrderRow[] = [];
  let failed = false;
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('service_orders')
      .select('id, reference, status, created_at, brief')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    orders = (data ?? []) as unknown as OrderRow[];
  } catch (err) {
    console.error('[dashboard] could not load orders', err);
    failed = true;
  }

  const date = new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stagesFor = (o: OrderRow): TimelineStage[] => {
    const reached = REACHED[o.status];
    return STAGES.map((id, i) => {
      const state: TimelineStage['state'] =
        i < reached ? 'done' : i === reached ? 'active' : 'pending';
      return {
        id,
        state,
        label: t(`dash.stage.${id}` as TranslationKey),
        meta:
          state === 'done'
            ? t('dash.stage.done')
            : state === 'active'
              ? t('dash.stage.current')
              : t('dash.stage.pending'),
      };
    });
  };

  const typeLabel = (o: OrderRow) => {
    const type = o.brief?.terms?.type;
    return type ? t(`opt.type.${type}` as TranslationKey) : t('checkout.title');
  };

  return (
    <main id="main" className="relative min-h-screen px-6 py-16 sm:px-10">
      <LegalMatrixCanvas className="opacity-25" />

      <div className="relative mx-auto max-w-4xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/"
              data-cursor="hover"
              className="eyebrow transition-colors hover:text-gold-400"
            >
              {t('brand.name')}
            </Link>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">{t('dash.heading')}</h1>
            <p className="mt-2 text-sm text-ink-500">{t('dash.lede')}</p>
          </div>
          <Link
            href="/checkout/contract-writing"
            data-cursor="hover"
            className="rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
          >
            {t('dash.new')}
          </Link>
        </header>

        {failed ? (
          <p role="alert" className="rounded-lg border border-status-risk/40 bg-status-risk/5 px-4 py-3 text-sm text-status-risk">
            {t('dash.error')}
          </p>
        ) : orders.length === 0 ? (
          <GlassCard interactive={false} className="p-8 text-center">
            <p className="font-display text-xl">{t('dash.empty.title')}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">{t('dash.empty.body')}</p>
            <Link
              href="/checkout/contract-writing"
              data-cursor="hover"
              className="mt-6 inline-block rounded-full border border-gold-500/50 bg-gold-500/12 px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500"
            >
              {t('hero.cta.primary')}
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => (
              <GlassCard key={o.id} interactive={false} className="p-6 sm:p-8">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-base text-ink-100">{typeLabel(o)}</p>
                  <p className="text-xs text-ink-500">
                    {t('dash.submitted', { date: date.format(new Date(o.created_at)) })}
                  </p>
                </div>
                {CLOSED[o.status] ? (
                  <p className="font-mono text-sm text-ink-300">
                    {o.reference} · {t(CLOSED[o.status]!)}
                  </p>
                ) : (
                  <ContractTimeline stages={stagesFor(o)} reference={o.reference} />
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
