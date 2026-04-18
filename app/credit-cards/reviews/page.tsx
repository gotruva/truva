import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { getCreditCardArticles, buildItemListSchema } from '@/lib/editorial';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Credit card reviews in the Philippines',
  description:
    'Browse Truva credit card reviews for cashback, rewards, and travel cards with practical verdicts and fee context.',
  alternates: {
    canonical: '/credit-cards/reviews',
  },
};

export default function CreditCardReviewsPage() {
  const reviewArticles = getCreditCardArticles('reviews');
  const featuredArticle = reviewArticles[0];
  const gridArticles = reviewArticles.filter((a) => a.slug !== featuredArticle?.slug);
  const itemListJsonLd = buildItemListSchema(reviewArticles, BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Credit card reviews"
        description="Read the product-level context before you decide whether a card's perks justify the annual fee."
        breadcrumbItems={[
          { label: 'Credit Cards', href: '/credit-cards' },
          { label: 'Reviews', href: '/credit-cards/reviews' },
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
                href="/credit-cards"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
              >
                Compare all cards
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/credit-cards/compare/bpi-amore-cashback-vs-unionbank-rewards-visa"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                <Calculator className="h-4 w-4 text-brand-primary" />
                Side-by-side comparison
              </Link>
            </div>
          </div>
        </section>

        {gridArticles.length > 0 && (
          <section className="grid gap-5 md:grid-cols-2">
            {gridArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </section>
        )}

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
