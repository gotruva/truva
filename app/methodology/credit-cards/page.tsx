import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';

export const metadata: Metadata = {
  title: 'Credit Cards Methodology',
  description:
    'See how Truva will evaluate credit cards using annual-fee economics, waiver realism, rewards usefulness, redemption friction, and approval fit.',
  alternates: {
    canonical: '/methodology/credit-cards',
  },
};

const pillars = [
  {
    title: 'Annual-fee economics',
    description:
      'A card should be judged on net value after annual fees, not on a welcome-promo screenshot that disappears after a quarter.',
  },
  {
    title: 'Waiver realism',
    description:
      'Fee-waiver rules matter only if normal users can actually meet them. Unrealistic waiver thresholds deserve less credit.',
  },
  {
    title: 'Rewards usefulness',
    description:
      'Rewards should map to something clear and valuable: cashback, transferable points, miles, or a redemption path that is easy to explain.',
  },
  {
    title: 'Redemption friction',
    description:
      'A high earn rate can still underperform if the rewards are hard to use, opaque, or buried behind thresholds that most cardholders never reach.',
  },
  {
    title: 'Approval fit',
    description:
      'Eligibility, minimum-income fit, and issuer positioning belong in the comparison because the best card on paper is useless if the reader is a poor fit.',
  },
];

const guardrails = [
  'A sponsored placement should never guarantee favorable editorial language.',
  'Promo windows can be referenced, but long-term value should carry more weight than temporary campaign copy.',
  'The same issuer should not dominate a ranking unless the underlying economics and usefulness justify it.',
];

export default function CreditCardsMethodologyPage() {
  return (
    <SectionHub
      title="Credit Cards Methodology"
      description="How Truva will score and compare Philippine credit cards once the category True Value Score becomes active."
      breadcrumbItems={[
        { label: 'Methodology', href: '/methodology' },
        { label: 'Credit Cards', href: '/methodology/credit-cards' },
      ]}
      containerClassName="max-w-5xl"
      titleClassName="not-italic"
    >
      <section className="rounded-[1.9rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
            <CreditCard className="h-4 w-4" />
            Credit card methodology
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            The right card is not the one with the loudest reward claim. It is the one whose economics still make sense after the fine print.
          </h2>
          <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Credit cards are especially vulnerable to bad comparison design because temporary promos, flashy categories, and vague reward marketing can make a weak long-term product look strong. Truva&apos;s card methodology is meant to punish that distortion, not reward it.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Core inputs
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            What the future card True Value Score will care about
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
            Why score activation is delayed
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              Card rankings are easy to get wrong when the framework quietly favors whichever products have the easiest marketing story. That is why Truva is publishing the methodology before publishing a live score.
            </p>
            <p>
              Once the methodology is stable, the card pages can expose a True Value Score with a clearer conscience because readers already know what is being rewarded and what is being penalized.
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
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
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
              Pair the scoring rules with the disclosure rules
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              The methodology explains how cards will be evaluated. The editorial-integrity page explains how sponsored placements and partner-supported content are labeled.
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
              href="/credit-cards"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              Open card desk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SectionHub>
  );
}
