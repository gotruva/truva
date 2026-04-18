import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpenText, Landmark } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import {
  getBankingArticles,
  getFeaturedBankingArticle,
  getGuideArticles,
} from '@/lib/editorial';
import type { EditorialArticle } from '@/types';

export const metadata: Metadata = {
  title: 'Banking Articles & Guides',
  description:
    'Read Truva banking guides, comparison briefs, bank reviews, and the core money methodology.',
  alternates: {
    canonical: '/banking/articles',
  },
};

export default function BankingArticlesIndexPage() {
  const featuredArticle = getFeaturedBankingArticle();
  const rateRoundups = getBankingArticles('rates').filter(
    (article) => article.slug !== featuredArticle?.slug
  );
  const reviewArticles = getBankingArticles('reviews');
  const compareArticles = getBankingArticles('compare');
  const explainers = getGuideArticles();

  return (
    <SectionHub
      title="Banking Articles"
      description="Start with the after-tax reality, then dive deep into our detailed bank reviews, direct head-to-head comparisons, and guides when the terms deserve a closer look."
      breadcrumbItems={[
        { label: 'Banking', href: '/banking' },
        { label: 'Articles', href: '/banking/articles' },
      ]}
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}
        </div>
        
        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] flex flex-col justify-center space-y-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Truva insight
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Editorial coverage driven by math
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <div className="flex gap-3">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p>Skip the fluff. We focus on real returns, hard lock-ins, and realistic cash requirement scenarios.</p>
            </div>
            <div className="flex gap-3">
              <BookOpenText className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p>Move from reading to action. Each guide directly ties into our calculators to prove the point.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <EditorialLane
            title="Best-rate roundups"
            description="Use these when you want the current shortlist, the balance math, and the fastest route to the right bank for your amount."
            href="/banking/rates"
            ctaLabel="Browse banking rate guides"
            articles={rateRoundups}
          />
          <EditorialLane
            title="Bank comparisons"
            description="Use these when you have two banks in mind and want the side-by-side peso math before you decide."
            href="/banking/compare"
            ctaLabel="Browse comparisons"
            articles={compareArticles}
          />
          <EditorialLane
            title="Bank reviews"
            description="Open the review layer when a product looks promising but the promo structure, cash-in conditions, or lock-in details need a closer read."
            href="/banking/reviews"
            ctaLabel="Browse reviews"
            articles={reviewArticles}
          />
          <EditorialLane
            title="Safety, tax, and mechanics"
            description="These explainers cover the parts most readers skip until they realize the rate table alone is not enough."
            href="/guides"
            ctaLabel="Browse guides"
            articles={explainers}
          />
        </div>
      </section>
    </SectionHub>
  );
}

function EditorialLane({
  title,
  description,
  href,
  ctaLabel,
  articles,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  articles: EditorialArticle[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {description}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.slug} article={article} variant="compact" />
        ))}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary group"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
