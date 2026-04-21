import type { Metadata } from 'next';
import { ArticleHubClient } from '@/components/editorial/ArticleHubClient';
import { getBankingArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Banking Articles & Guides | Truva',
  description:
    'Rate guides, bank reviews, and head-to-head comparisons. Everything a Filipino saver needs to make a sharper banking decision.',
  alternates: {
    canonical: '/banking/articles',
  },
};

const BANKING_CATEGORIES = [
  { label: 'Rate Guides', value: 'Rate Guide' },
  { label: 'Reviews', value: 'Review' },
  { label: 'Comparisons', value: 'Comparison' },
];

export default function BankingArticlesPage() {
  const articles = getBankingArticles();

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-10 px-4 sm:py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
            The Truva Banking Desk
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The sharpest takes on{' '}
            <span className="block sm:inline">Philippine banking.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100/70">
            Rate guides, bank reviews, and head-to-head comparisons — so your next banking decision is the right one.
          </p>
        </div>
      </section>

      <div className="bg-brand-surface dark:bg-slate-950 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ArticleHubClient
            articles={articles}
            categories={BANKING_CATEGORIES}
            featuredSlug="best-digital-bank-philippines"
            searchPlaceholder="Search banking articles..."
          />
        </div>
      </div>
    </div>
  );
}
