import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpenText, Calculator, CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { getFeaturedBankingArticle, getGuideArticles } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Editorial index and guides',
  description:
    'Browse Truva banking guides, comparison briefs, credit-card reviews, and the pages that explain the math behind each decision.',
  alternates: {
    canonical: '/articles',
  },
};

const indexCards = [
  {
    title: 'Banking',
    description: 'Live rates, reviews, compare briefs, and savings math for Philippine depositors.',
    href: '/banking',
    icon: Landmark,
  },
  {
    title: 'Credit cards',
    description: 'Cashback, rewards, and travel card reviews with direct paths into card discovery.',
    href: '/credit-cards',
    icon: CreditCard,
  },
  {
    title: 'Guides',
    description: 'Tax, PDIC, and product mechanics explained in plain language.',
    href: '/guides',
    icon: BookOpenText,
  },
];

const topicLinks = [
  { label: 'Best digital bank', href: '/banking/rates/best-digital-bank-philippines' },
  { label: 'Maya review', href: '/banking/reviews/maya-savings-review' },
  { label: 'Final withholding tax', href: '/guides/final-withholding-tax-explained' },
  { label: 'PDIC insurance', href: '/guides/pdic-insurance-guide' },
  { label: 'Balance-based comparison', href: '/banking/compare/best-digital-bank-100k-250k-500k' },
  { label: 'Calculator', href: '/calculator' },
];

export default function ArticlesIndexPage() {
  const featuredBankingArticle = getFeaturedBankingArticle();
  const featuredGuideArticles = getGuideArticles().slice(0, 2);

  return (
    <SectionHub
      title="Articles"
      description="Start from the decision you need, then move into the article, comparison, or tool that answers it."
      breadcrumbItems={[{ label: 'Articles', href: '/articles' }]}
    >
      <section className="grid gap-5 md:grid-cols-3">
        {indexCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[1.75rem] border border-brand-border/80 bg-white p-5 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                <card.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                  {card.title}
                </h2>
                <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  {card.description}
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          {featuredBankingArticle && <FeaturedArticleCard article={featuredBankingArticle} />}
        </div>

        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Why this index matters
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            One place to start, multiple ways to finish
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p>Go to the tool when the answer is numeric. Go to the article when the fine print matters.</p>
            </div>
            <div className="flex gap-3">
              <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p>Move from reading to action with the calculator instead of leaving the article tab open.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Featured guides
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Current high-intent reads
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {featuredGuideArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} variant="compact" />
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-center gap-3">
          {topicLinks.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </section>
    </SectionHub>
  );
}
