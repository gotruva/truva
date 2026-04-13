import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GitCompareArrows, SearchCheck, TrendingUp } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { getBankingArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Banking comparisons and decision briefs',
  description:
    'A comparison-first Banking shell for future head-to-head content, with current paths back into rates and review tools.',
};

const comparisonRoadmap = [
  'Maya vs GoTyme vs Tonik',
  'Best no-conditions savings accounts',
  'Best digital bank for ₱100K, ₱250K, and ₱500K balances',
];

export default function BankingComparePage() {
  const fallbackArticles = getBankingArticles().slice(0, 2);

  return (
    <SectionHub
      title="Banking comparisons"
      description="This shell is ready for the comparison content pipeline. Until the first head-to-head briefs land, it points users into the strongest live decision paths."
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
                Comparison briefs are next. The route is ready now.
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                This page stakes out the comparison surface so your future SEO articles and head-to-head pieces have a natural home without mixing them into the general Banking hub.
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
                href="/banking/reviews"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                Read reviews first
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

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Until then
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Start with these high-signal pages
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {fallbackArticles.map((article) => (
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
  );
}
