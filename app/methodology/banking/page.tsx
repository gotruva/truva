import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, WalletCards } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';

export const metadata: Metadata = {
  title: 'Banking Methodology',
  description:
    'See how Truva will compare banking products using after-tax yield, liquidity, condition complexity, insurance, and payout structure.',
  alternates: {
    canonical: '/methodology/banking',
  },
};

const pillars = [
  {
    title: 'After-tax yield',
    description:
      'Banking recommendations start with what the saver actually keeps after final tax, not with the gross headline alone.',
  },
  {
    title: 'Liquidity',
    description:
      'A liquid savings account and a locked time deposit are solving different problems. Ranking should reflect that instead of pretending yield exists in a vacuum.',
  },
  {
    title: 'Conditions complexity',
    description:
      'A rate that requires monthly spending, promo enrollment, or balance behavior should be harder to win with than a rate a saver can keep quietly.',
  },
  {
    title: 'Insurance and safety',
    description:
      'PDIC coverage, government backing, and product structure deserve visible treatment because safety is part of return, not separate from it.',
  },
  {
    title: 'Payout structure',
    description:
      'Daily, monthly, and maturity-only payout schedules change how useful a product is for different savings goals.',
  },
];

const guardrails = [
  'Partner compensation should not boost a banking product above a better after-tax alternative.',
  'A temporary promo should not outrank a durable product without an explicit caveat.',
  'Editorial articles can explain context, but they should not override the comparison logic.',
];

export default function BankingMethodologyPage() {
  return (
    <SectionHub
      title="Banking Methodology"
      description="How Truva will score and compare savings accounts, digital banks, and time deposits once the banking True Value Score goes live."
      breadcrumbItems={[
        { label: 'Methodology', href: '/methodology' },
        { label: 'Banking', href: '/methodology/banking' },
      ]}
      containerClassName="max-w-5xl"
      titleClassName="not-italic"
    >
      <section className="rounded-[1.9rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
            <WalletCards className="h-4 w-4" />
            Banking methodology
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            The first question is simple: what does the saver actually earn and how painful is it to keep earning it?
          </h2>
          <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Banking products often look deceptively easy to rank because the headline rate is visible. The actual saver outcome depends on tax, lock-in, insurance, payout timing, and whether the headline rate survives real-world behavior month after month.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Core inputs
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            What the future banking True Value Score will care about
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-[1.6rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            What this means in practice
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              A clean 4.0% after-tax account with no monthly behavior requirements may outrank a heavily conditional 4.2% account for many savers because the real-world keep rate is more reliable.
            </p>
            <p>
              A one-year time deposit may outrank a liquid account on return, but not for an emergency-fund use case. The methodology needs to reflect that context instead of flattening every product into one number.
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Guardrails
          </p>
          <div className="mt-4 space-y-3">
            {guardrails.map((guardrail) => (
              <div
                key={guardrail}
                className="flex items-start gap-3 rounded-[1.1rem] border border-brand-border bg-brand-surface/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  {guardrail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Related trust pages
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Pair the ranking rules with the disclosure rules
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              The methodology explains how banking products will be evaluated. The editorial-integrity page explains how commercial relationships are labeled and why they cannot buy favorable coverage.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/methodology/editorial-integrity"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            >
              <ShieldCheck className="h-4 w-4 text-brand-primary" />
              Editorial integrity
            </Link>
            <Link
              href="/banking"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              Open banking desk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SectionHub>
  );
}
