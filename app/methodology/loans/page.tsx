import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  HandCoins,
  ShieldCheck,
  Timer,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';

export const metadata: Metadata = {
  title: 'Loans Methodology',
  description:
    'See how Truva will compare loans using effective annual cost, fees, net proceeds, funding speed, flexibility, and late-fee risk.',
  alternates: {
    canonical: '/methodology/loans',
  },
};

const pillars = [
  {
    title: 'Effective annual cost',
    description:
      'Loan comparisons should normalize teaser rates into a cost that reflects the actual borrowing structure, not just the headline monthly number.',
  },
  {
    title: 'Fees and net proceeds',
    description:
      'Origination, service, and processing fees matter because they change the amount of money the borrower really receives.',
  },
  {
    title: 'Funding speed',
    description:
      'The value of a loan depends partly on whether it lands when the borrower needs it. Speed belongs in the main comparison.',
  },
  {
    title: 'Borrower flexibility',
    description:
      'Prepayment rules, restructuring options, and rigid repayment structures can materially change whether a loan is safe for the reader.',
  },
  {
    title: 'Late-fee and rollover risk',
    description:
      'The downside scenario matters. Borrowers should see how painful the product becomes if things go wrong.',
  },
];

const guardrails = [
  'A lower teaser rate should not win automatically if the fee structure or disbursement deductions make the real cost worse.',
  'Fast-funding products should not be rewarded for speed alone if the penalty structure is materially harsher.',
  'The methodology should stay explicit about what is still a preview and what is already supported by verified product data.',
];

export default function LoansMethodologyPage() {
  return (
    <SectionHub
      title="Loans Methodology"
      description="How Truva will score and compare loan products before a live loans marketplace or scorecard goes active."
      breadcrumbItems={[
        { label: 'Methodology', href: '/methodology' },
        { label: 'Loans', href: '/methodology/loans' },
      ]}
      containerClassName="max-w-5xl"
      titleClassName="not-italic"
    >
      <section className="rounded-[1.9rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
            <HandCoins className="h-4 w-4" />
            Loans methodology
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Loan comparison should protect borrowers from the parts of the pricing story that marketing usually hides.
          </h2>
          <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Loans are harder than deposits because the downside matters more. Truva's methodology should compare the real borrowing cost, the amount actually disbursed, the time to funding, and the pain of falling behind.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Core inputs
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            What the future loans True Value Score will care about
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
            Preview-only discipline
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              Truva should not present a polished loan leaderboard before the data and methodology are strong enough to survive scrutiny. That is why the loans landing page is a methodology-led preview first.
            </p>
            <p>
              When the comparison engine is ready, this page becomes the public explanation of what the engine optimizes for and what it intentionally refuses to optimize for.
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
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard
            icon={WalletCards}
            title="Normalize cost"
            description="Translate teaser pricing into comparable effective annual cost."
          />
          <InfoCard
            icon={Timer}
            title="Expose speed"
            description="Keep funding-time expectations visible alongside pricing."
          />
          <InfoCard
            icon={ShieldCheck}
            title="Protect downside"
            description="Surface late-fee and flexibility risk, not just the happy-path repayment."
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Related trust pages
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Keep the methodology close to the disclosure policy
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              The methodology explains how loans will be compared. The editorial-integrity page explains how Truva labels partner-supported content and protects editorial judgment.
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
              href="/loans"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              Open loans desk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SectionHub>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-brand-border bg-brand-surface/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
