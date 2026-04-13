import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getBankingArticles, getBankingArticlesBySlugs, getFeaturedBankingArticle } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Digital Bank Interest Rates Philippines 2026',
  description:
    'Compare the highest digital bank savings rates in the Philippines and use Banking guides that help you interpret the fine print.',
};

const utilityActions = [
  {
    title: 'Run your rate math',
    description: 'Use the calculator for your exact balance before you chase a promo.',
    href: '/calculator',
  },
  {
    title: 'See the methodology',
    description: 'Understand how Truva verifies rates, taxes, and product conditions.',
    href: '/methodology',
  },
];

export default function BankingRatesHub() {
  const featuredArticle = getFeaturedBankingArticle();
  const rateArticles = getBankingArticles('rates');
  const reviewArticles = getBankingArticles('reviews');
  const supportingArticles = getBankingArticlesBySlugs([
    ...rateArticles.map((article) => article.slug),
    ...reviewArticles.map((article) => article.slug),
  ]).filter((article) => article.slug !== featuredArticle?.slug);

  const itemListJsonLd = buildItemListSchema([...rateArticles, ...reviewArticles], BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Digital Bank Rates"
        description="Lead with the rate desk, then move into the explainers and reviews that tell you whether the headline number is actually worth chasing."
        breadcrumbItems={[
          { label: 'Banking', href: '/banking' },
          { label: 'Rates', href: '/banking/rates' },
        ]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <div className="rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-6 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-7">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
                <Sparkles className="h-4 w-4" />
                Live rate desk + editorial support
              </div>
              <div className="space-y-3">
                <h2 className="max-w-xl text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                  Use the utility layer first. Reach for the article when the fine print matters.
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  This hub is designed to keep the free decision tools front and center, while still surfacing premium editorial content when you need the context behind a rate.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-brand-border bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                    Current focus
                  </p>
                  <p className="text-lg font-semibold text-brand-textPrimary dark:text-white">
                    Best digital bank guide
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    The flagship article for understanding which bank actually wins for your balance and behavior.
                  </p>
                </div>
                <div className="rounded-3xl border border-brand-border bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                    Verification rhythm
                  </p>
                  <p className="text-lg font-semibold text-brand-textPrimary dark:text-white">
                    Updated weekly
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    Truva checks the live rate environment regularly so this hub stays decision-useful, not stale.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={featuredArticle?.path ?? '/banking'}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  Read the featured guide
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  <Calculator className="h-4 w-4 text-brand-primary" />
                  Open calculator
                </Link>
              </div>
            </div>
          </div>

          {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {utilityActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[1.75rem] border border-brand-border/80 bg-white p-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-full flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                  Utility action
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                  {action.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  {action.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Editorial support
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Guides and reviews that explain whether the rate is actually good
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {supportingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="compact" />
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Rates are verified on a regular cadence so the guide layer stays tied to reality.',
              'After-tax framing and product conditions stay visible so articles support decisions, not just rankings.',
              'The same system can expand into card content later without rebuilding the experience.',
            ].map((point) => (
              <div key={point} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </section>
      </SectionHub>
    </>
  );
}
