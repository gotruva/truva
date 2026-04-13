import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getBankingArticles, getFeaturedBankingArticle } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Banking reviews and product deep dives',
  description:
    'Read practical Banking reviews from Truva before you pick a savings account or trust a promotional rate.',
  alternates: {
    canonical: '/banking/reviews',
  },
};

export default function BankingReviewsPage() {
  const reviewArticles = getBankingArticles('reviews');
  const featuredArticle = reviewArticles[0] ?? getFeaturedBankingArticle();
  const itemListJsonLd = buildItemListSchema(reviewArticles, BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Banking reviews"
        description="Read the product-level context before you decide whether a single bank really deserves your savings."
        breadcrumbItems={[
          { label: 'Banking', href: '/banking' },
          { label: 'Reviews', href: '/banking/reviews' },
        ]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}
          <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Use alongside
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Reviews should lead into a real comparison
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Use the live rate desk and calculator alongside these reviews so product-level impressions stay grounded in the current market.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/#deposit-rates"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
              >
                Compare live rates
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                <Calculator className="h-4 w-4 text-brand-primary" />
                Open calculator
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {reviewArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Reviews in this section are meant to sit underneath the utility layer, not replace it. That keeps the experience clean for users who just want a decision and strong for readers who need more confidence before acting.
            </p>
          </div>
        </section>
      </SectionHub>
    </>
  );
}
