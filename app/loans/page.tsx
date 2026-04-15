import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  Clock3,
  FileSearch,
  HandCoins,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { ProductHubTemplate } from '@/components/layout/ProductHubTemplate';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { PRODUCT_NAVIGATION_ITEMS } from '@/lib/product-navigation';

export const metadata: Metadata = {
  title: 'Loans in the Philippines: compare effective rates, timelines, and borrower tradeoffs',
  description:
    'Preview Truva’s loans hub for effective borrowing cost, approval friction, funding speed, and methodology-first comparison.',
  alternates: {
    canonical: '/loans',
  },
};

const comparisonFields = [
  {
    title: 'Effective annual cost',
    description:
      'Teaser monthly rates will be translated into a cost that reflects the actual borrowing structure, not the friendliest headline.',
  },
  {
    title: 'Fees and net proceeds',
    description:
      'Borrowers need to know how much cash actually lands in the account after processing, service, and origination deductions.',
  },
  {
    title: 'Approval friction',
    description:
      'Documentation, salary requirements, employer checks, and rejection risk matter almost as much as the nominal price.',
  },
  {
    title: 'Time to funding',
    description:
      'A slower cheap loan and a fast expensive loan solve different emergencies. The page should make that tension explicit.',
  },
];

const borrowerQuestions = [
  {
    title: 'Which loan is actually cheapest after fees?',
    description:
      'The comparison engine should answer this before the borrower ever sees a promotional banner.',
  },
  {
    title: 'How much money will I really receive?',
    description:
      'Net proceeds often matter more than the advertised principal when fees are deducted up front.',
  },
  {
    title: 'How painful is this loan if I need flexibility?',
    description:
      'Late-fee structure, early repayment rules, and rollover risk need visible treatment in the main comparison surface.',
  },
];

export default function LoansHubPage() {
  return (
    <ProductHubTemplate
      title="Loans"
      description="A methodology-first preview for Philippine borrowing comparisons: real cost, approval friction, and speed without pretending every teaser rate deserves equal weight."
      breadcrumbItems={[{ label: 'Loans', href: '/loans' }]}
      activeProductId="loans"
      productNavigationItems={PRODUCT_NAVIGATION_ITEMS}
      sectionLinks={[
        { id: 'overview', label: 'Overview' },
        { id: 'start-here', label: 'Start here' },
        { id: 'compare-preview', label: 'Compare preview' },
        { id: 'borrower-questions', label: 'Questions' },
        { id: 'methodology', label: 'Methodology' },
      ]}
      hero={{
        eyebrow: 'Loans preview desk',
        icon: HandCoins,
        title: 'Loans should be compared on total pain, not just on the teaser rate that got the ad click.',
        directAnswer:
          'The Truva loans hub is intentionally a preview right now because the right UX for borrowing is methodology first: effective annual cost, fees, approval friction, time to funding, and flexibility when the borrower’s situation changes.',
        marketFact: {
          label: 'Market truth',
          value: 'Two lenders can advertise the same monthly rate and still produce very different total repayment.',
          description:
            'That difference comes from fee structure, add-on pricing, disbursement deductions, and how long the money takes to reach the borrower.',
        },
        actions: [
          { href: '/methodology/loans', label: 'Read loan methodology', icon: FileSearch },
          {
            href: '/methodology/editorial-integrity',
            label: 'Read trust policy',
            icon: ShieldCheck,
            variant: 'secondary',
          },
        ],
      }}
      featuredSlot={<LoansPreviewCard />}
      trustBar={{
        eyebrow: 'Trust bar',
        title: 'Borrowing comparisons need stronger disclosure than deposit comparisons.',
        description:
          'Loan pages should explain what is still in preview, how Truva plans to normalize cost, and why speed and flexibility belong beside price.',
        items: [
          {
            title: 'APR over teaser rate',
            description:
              'The planned comparison will prioritize effective annual cost instead of whichever monthly add-on rate looks smallest.',
            icon: WalletCards,
          },
          {
            title: 'Funding-speed context',
            description:
              'Time to approval and time to cash-out are first-class comparison inputs, not footnotes.',
            icon: Clock3,
          },
          {
            title: 'Editorial independence',
            description:
              'The preview hub stays honest about what is not live yet and links directly to the trust policy.',
            icon: ShieldCheck,
            href: '/methodology/editorial-integrity',
            linkLabel: 'Read editorial integrity',
          },
          {
            title: 'Loan methodology',
            description:
              'See how fees, flexibility, late-payment risk, and borrower fit will feed future rankings and scorecards.',
            icon: FileSearch,
            href: '/methodology/loans',
            linkLabel: 'Open loan methodology',
          },
        ],
      }}
      quickStart={{
        eyebrow: 'Start here',
        title: 'The right next step depends on whether you want framework or future tools',
        description:
          'Because loans are still a preview category, the top of the page focuses on comparison logic and borrower questions rather than pretending the marketplace is already complete.',
        links: [
          {
            title: 'Inspect the methodology',
            description:
              'Start with the rules Truva will use to compare loans before you trust any future shortlist.',
            href: '/methodology/loans',
            icon: FileSearch,
            eyebrow: 'Methodology',
            ctaLabel: 'Open loan methodology',
          },
          {
            title: 'Model repayment math',
            description:
              'Use the calculator when you want a rough sense of repayment burden before live loan tools ship.',
            href: '/calculator',
            icon: Calculator,
            eyebrow: 'Utility',
            ctaLabel: 'Open calculator',
          },
          {
            title: 'Read the trust policy',
            description:
              'Understand how Truva will label ads, partner-supported content, and editorial recommendations.',
            href: '/methodology/editorial-integrity',
            icon: ShieldCheck,
            eyebrow: 'Trust',
            ctaLabel: 'Read integrity page',
          },
        ],
      }}
      methodologyCta={{
        eyebrow: 'Methodology and transparency',
        title: 'The loans hub should launch with visible rules before it launches with lender cards.',
        description:
          'This preview page exists to prove the information architecture and the trust model before a marketplace layer is allowed to ship.',
        primaryAction: {
          href: '/methodology/loans',
          label: 'Open loan methodology',
          icon: FileSearch,
        },
        secondaryAction: {
          href: '/methodology/editorial-integrity',
          label: 'Read editorial integrity',
          icon: ShieldCheck,
          variant: 'secondary',
        },
      }}
      containerClassName="max-w-6xl"
    >
      <section id="compare-preview" className="space-y-5 scroll-mt-32">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Compare preview
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            What Truva will compare before any lender earns a recommendation
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            This section is intentionally about fields and borrower outcomes, not lender thumbnails. The loans page should earn that marketplace feel only after the methodology is tight enough to defend.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {comparisonFields.map((field) => (
            <PreviewCard key={field.title} title={field.title} description={field.description} />
          ))}
        </div>
      </section>

      <section id="borrower-questions" className="space-y-5 scroll-mt-32">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Borrower questions
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            The future hub should answer these questions immediately
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {borrowerQuestions.map((question) => (
            <PreviewCard key={question.title} title={question.title} description={question.description} />
          ))}
        </div>
      </section>
    </ProductHubTemplate>
  );
}

function LoansPreviewCard() {
  return (
    <div className="rounded-[1.8rem] border border-brand-border bg-white p-6 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Preview stance
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            No fake marketplace, no fake ranking, no fake score.
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          Loans are the easiest category to make look complete before the logic is complete. This preview keeps the emphasis on methodology and borrower tradeoffs until the data model is ready.
        </p>

        <TrueValueScoreBadge />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/methodology/loans"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Read the framework
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/methodology/editorial-integrity"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-5 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
          >
            Review trust policy
          </Link>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.6rem] border border-brand-border/80 bg-white p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
