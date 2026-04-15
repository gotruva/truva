import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';

export const metadata: Metadata = {
  title: 'Editorial Integrity',
  description:
    'Learn how Truva labels sponsored content, how partner compensation works, and what commercial relationships can and cannot influence.',
  alternates: {
    canonical: '/methodology/editorial-integrity',
  },
};

const labelRules = [
  {
    title: 'Editorial',
    description:
      'Written to help readers make a decision with clearer math and clearer tradeoffs. Editorial content can still mention commercial relationships, but it should not be written to satisfy a sponsor.',
  },
  {
    title: 'Sponsored',
    description:
      'A placement or post paid for by a partner. It should carry a visible label near the content itself, not only in the footer or legal page.',
  },
  {
    title: 'Partner-supported',
    description:
      'A surface where Truva may earn compensation from partner actions. The relationship should be disclosed clearly, even if the surface itself is not a paid ad.',
  },
];

const compensationCan = [
  'Support operations, product maintenance, and advertising inventory.',
  'Affect whether a partner advertisement or sponsored placement appears on the site.',
  'Influence which offers are available to highlight as paid placements or partner-supported CTAs.',
];

const compensationCannot = [
  'Guarantee a favorable review, ranking, or editorial verdict.',
  'Override category methodology weighting once the methodology is published.',
  'Silently convert sponsored placement into unlabeled editorial content.',
];

export default function EditorialIntegrityPage() {
  return (
    <SectionHub
      title="Editorial Integrity"
      description="How Truva keeps editorial judgment, methodology, sponsorship labels, and partner compensation legible to the reader."
      breadcrumbItems={[
        { label: 'Methodology', href: '/methodology' },
        { label: 'Editorial Integrity', href: '/methodology/editorial-integrity' },
      ]}
      containerClassName="max-w-5xl"
      titleClassName="not-italic"
    >
      <section className="rounded-[1.9rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
            <ShieldCheck className="h-4 w-4" />
            Truva promise
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Readers come first when Truva is making editorial judgments. Compensation should help keep the business running, not decide the answer.
          </h2>
          <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Truva will not cover every financial product on the market. It will publish only what it can explain clearly and compare honestly. When a partner relationship exists, it should be disclosed plainly. When an opinion is editorial, it should stay editorial even if a partner would prefer a kinder conclusion.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Content labels
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            What the labels mean
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {labelRules.map((rule) => (
            <div
              key={rule.title}
              className="rounded-[1.6rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                {rule.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Compensation can
          </p>
          <div className="mt-4 space-y-3">
            {compensationCan.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.1rem] border border-brand-border bg-brand-surface/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Compensation cannot
          </p>
          <div className="mt-4 space-y-3">
            {compensationCannot.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.1rem] border border-brand-border bg-brand-surface/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            How recommendations are produced
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              Truva recommendations are built from independent product research, public terms, product math, and category-specific methodology. Editorial writers can explain that reasoning, challenge a product, or decline to recommend it.
            </p>
            <p>
              Partners cannot pay to rewrite that conclusion. If a sponsored or partner-supported surface exists, it should still be labeled and separated clearly from editorial judgment.
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Partner disclosure list
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              A public partner list should live here as Truva&apos;s commercial relationships expand. Until that list is maintained directly on the site, this section should remain visible as a reminder that commercial relationships are part of the trust story, not a hidden appendix.
            </p>
            <p>
              The intent is simple: if a reader wants to inspect who can compensate Truva, they should not need to guess where that information lives.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Related methodology
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Trust policy and scoring policy should sit next to each other
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Use these next if you want to see how category-specific comparison rules and disclosure rules fit together.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/methodology/banking"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            >
              <FileSearch className="h-4 w-4 text-brand-primary" />
              Banking methodology
            </Link>
            <Link
              href="/methodology/credit-cards"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            >
              <FileSearch className="h-4 w-4 text-brand-primary" />
              Card methodology
            </Link>
            <Link
              href="/methodology/loans"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              Loans methodology
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SectionHub>
  );
}
