import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GitCompareArrows, SearchCheck, TrendingUp } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getBankingArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Banking comparisons and decision briefs',
  description:
    'A comparison-first Banking index with head-to-head briefs for the most useful Philippine savings questions.',
  alternates: {
    canonical: '/banking/compare',
  },
};

const comparisonRoadmap = [
  'Maya vs GoTyme vs Tonik',
  'Best no-conditions savings accounts',
  'Best digital bank for PHP 100K, PHP 250K, and PHP 500K balances',
];

export default function BankingComparePage() {
  const comparisonBriefs = getBankingArticles('compare');
  const featuredArticle = comparisonBriefs[0];
  const supportingArticles = comparisonBriefs.slice(1);
  const itemListJsonLd = buildItemListSchema(comparisonBriefs, BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Banking comparisons"
        description="Use this index when you want the head-to-head answer instead of a single bank review."
        breadcrumbItems={[
          { label: 'Banking', href: '/banking' },
          { label: 'Compare', href: '/banking/compare' },
        ]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-6 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-7">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
                <GitCompareArrows className="h-4 w-4" />
                Comparison layer
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                  Comparison briefs that answer the question, not just the query.
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  These pages compare real banking choices by balance, behavior, and product mechanics so the
                  reader can move straight to a decision.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/#deposit-rates"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
                >
                  Compare live rates now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  <TrendingUp className="h-4 w-4 text-brand-primary" />
                  Open calculator
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Coming next
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Comparison topics already worth structuring
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {comparisonRoadmap.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {featuredArticle && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <FeaturedArticleCard article={featuredArticle} />
            <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Why compare here
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                Start with the brief, then open the bank.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                The comparison page is for readers who already know they need the head-to-head answer. The
                deeper article pages handle the reasoning and the table.
              </p>
            </div>
          </section>
        )}

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              All briefs
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Open the comparison that matches the question
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {supportingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="compact" />
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {[
            {
              title: 'Rates hub',
              description: 'Use the live rate desk when you need the fastest answer right now.',
              href: '/banking/rates',
              icon: TrendingUp,
            },
            {
              title: 'Reviews hub',
              description: 'Use the review layer when you need product-by-product context before deciding.',
              href: '/banking/reviews',
              icon: SearchCheck,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[1.75rem] border border-brand-border/80 bg-white p-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      </SectionHub>
    </>
  );
}
