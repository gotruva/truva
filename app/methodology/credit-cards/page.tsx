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
    abbrev: 'NPV',
    weight: '30%',
    title: 'Net Peso Value',
    description:
      'Three-year peso value after fees, FX costs, and rewards — computed across four Filipino spending profiles. Welcome bonus attainability is folded in. The single most impactful pillar for most card decisions.',
  },
  {
    abbrev: 'EEQ',
    weight: '18%',
    title: 'Earn Engine Quality',
    description:
      'How cleanly the earn structure maps to everyday Filipino spend: category breadth, earn-rate consistency, caps, MCC exclusions, and whether e-wallet loads earn anything at all.',
  },
  {
    abbrev: 'FSS',
    weight: '15%',
    title: 'Fee Structure Score',
    description:
      'Waiver realism, first-year fee treatment, cash-advance and late-payment mechanics, and FX fee competitiveness. A low sticker fee that is impossible to waive scores worse than a higher fee with a realistic threshold.',
  },
  {
    abbrev: 'PLF',
    weight: '10%',
    title: 'Philippine Lifestyle Fit',
    description:
      'How well the card aligns with the realities of everyday spending in the Philippines: GCash/Maya compatibility, acceptance network (Visa/MC/JCB), co-brand utility, and diaspora/OFW applicability.',
  },
  {
    abbrev: 'WBA',
    weight: '10%',
    title: 'Welcome Bonus Attainability',
    description:
      'Welcome bonuses are only valuable if the spend requirement is achievable. Truva scores attainability against Profile A (young professional, PHP 20K/month) and flags unrealistic thresholds as a catch.',
  },
  {
    abbrev: 'PS',
    weight: '8%',
    title: 'Protection Shield',
    description:
      'Travel insurance quality (full medical vs. accident-only), purchase protection breadth, and claims friction by underwriter. Chubb-backed policies score higher than generic accident-only coverage.',
  },
  {
    abbrev: 'IES',
    weight: '5%',
    title: 'Issuer Experience Score',
    description:
      'App quality, customer service responsiveness, and digital-first access. Weighted lower because experience data is harder to verify objectively — but a chronic service problem can override a good points rate.',
  },
  {
    abbrev: 'AA',
    weight: '4%',
    title: 'Approval Accessibility',
    description:
      'Minimum income requirements, document burden, and whether the card is realistically accessible to the income segment most likely to apply. Income ineligibility filters the card from view; AA penalizes extreme exclusivity.',
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
            Eight pillars, weighted by what actually moves the decision
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.abbrev}
              className="rounded-[1.6rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-brand-primary/10 px-2.5 py-1 text-xs font-bold tracking-wider text-brand-primary dark:bg-brand-primary/15">
                  {pillar.abbrev}
                </span>
                <span className="text-sm font-semibold tabular-nums text-brand-textSecondary dark:text-gray-400">
                  {pillar.weight}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
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
