import Link from 'next/link';
import { GavelIntro } from '@/components/intro/GavelIntro';
import { LegalMatrixCanvas } from '@/components/ui/LegalMatrixCanvas';
import { GlassCard } from '@/components/ui/GlassCard';
import { ContractWizard } from '@/components/wizard/ContractWizard';

/**
 * Landing page. Deliberately a *server* component: the marketing copy and
 * headings are in the initial HTML for crawlers, and only the intro, the matrix
 * canvas and the wizard hydrate on the client.
 */

const CAPABILITIES = [
  {
    eyebrow: 'Contract automation',
    title: 'Draft in minutes, not days',
    body: 'A declarative clause tree assembles supply, distribution, charterparty and shareholder instruments from validated inputs. Numbering, cross-references and schedules derive themselves.',
  },
  {
    eyebrow: 'Clause-level analysis',
    title: 'Exposure scored as you type',
    body: 'A deterministic rule set scores governing law, forum, caps, security, sanctions and laytime against a fixed model, so scores stay comparable across a portfolio and over time.',
  },
  {
    eyebrow: 'Maritime trade',
    title: 'Laytime and demurrage, handled',
    body: 'Notice of readiness, excepted periods, demurrage accrual and claim time bars are modelled as first-class terms rather than free-text riders.',
  },
  {
    eyebrow: 'Execution',
    title: 'Cryptographic signature trail',
    body: 'Every executed instrument carries a SHA-256 content hash, a signed audit record and a QR verification route that resolves without an account.',
  },
  {
    eyebrow: 'Real time',
    title: 'The client always knows where it is',
    body: 'Matter status streams over an authenticated socket channel. Drafting, review, counterparty comment and execution land on the client rail the moment they happen.',
  },
  {
    eyebrow: 'Custody',
    title: 'Encrypted at rest, per document',
    body: 'Documents are sealed with AES-256-GCM under per-document data keys, wrapped by a KMS master key. Plaintext never touches disk.',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <GavelIntro />

      <main id="main">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden px-6 py-24 sm:px-10">
          <LegalMatrixCanvas className="opacity-70" />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(70% 55% at 30% 40%, rgba(212,175,55,0.09), transparent 70%)',
            }}
          />

          <div className="relative mx-auto w-full max-w-6xl">
            <p className="eyebrow">Commercial · Corporate · Maritime</p>
            <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              The instrument,{' '}
              <span className="text-gold-500">drafted and scored</span> before
              the call ends.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-300">
              Lex Maris assembles commercial and maritime instruments from
              validated terms, scores every clause against a fixed exposure
              model, and executes them with a verifiable cryptographic trail.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="#builder"
                data-cursor="hover"
                className="rounded-full border border-gold-500/50 bg-gold-500/12 px-7 py-3 text-xs uppercase tracking-[0.18em] text-gold-400 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500/22"
              >
                Open the builder
              </Link>
              <Link
                href="/dashboard"
                data-cursor="hover"
                className="text-xs uppercase tracking-[0.18em] text-ink-300 underline decoration-gold-500/40 decoration-1 underline-offset-8 transition-colors duration-300 hover:text-gold-400"
              >
                View client dashboard
              </Link>
            </div>

            <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              {[
                ['12', 'clause rules per pass'],
                ['< 2s', 'draft to signed PDF'],
                ['AES-256', 'per-document sealing'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-gold-500">
                    {value}
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-500">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="rule-gold mx-auto max-w-6xl" />

        {/* ---------------------------------------------------------------- */}
        {/* Capabilities                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-2xl text-balance font-display text-3xl leading-tight sm:text-4xl">
              Built for counsel who carry the risk
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => (
                <GlassCard key={c.title} className="p-6">
                  <p className="eyebrow">{c.eyebrow}</p>
                  <h3 className="mt-3 font-display text-lg leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-300">
                    {c.body}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Live builder + scanner                                           */}
        {/* ---------------------------------------------------------------- */}
        <section id="builder" className="relative px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow">Risk scanner &amp; live contract builder</p>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl leading-tight sm:text-4xl">
              Change a term. Watch the exposure move.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-300">
              The draft on the right is assembled from the same inputs the
              scanner reads, so the document a client approves is the document
              the engine renders. Nothing below is legal advice.
            </p>
            <div className="mt-12">
              <ContractWizard />
            </div>
          </div>
        </section>

        <footer className="border-t border-ink-500/15 px-6 py-10 sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-ink-500">
            <p className="font-display tracking-[0.3em] text-gold-500/80">
              LEX MARIS
            </p>
            <p>
              Demonstration interface. Output is a triage signal for a qualified
              practitioner, not legal advice.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
