import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, Landmark, SearchCheck, ShieldCheck, TrendingUp } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BASE_URL } from '@/lib/constants';
import { buildItemListSchema, getBankingArticles, getFeaturedBankingArticle } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Banking in the Philippines: compare rates, use tools, read guides',
  description:
    'Use Truva to compare live rates, calculate returns, and read practical Banking analysis built for Philippine savers.',
};

const utilityCards = [
  {
    title: 'Compare live rates',
    description: 'See the strongest current savings offers and the conditions behind the headline numbers.',
    href: '/#deposit-rates',
    icon: TrendingUp,
  },
  {
    title: 'Run the calculator',
    description: 'Model your balance, time horizon, and after-tax return before you move money.',
    href: '/calculator',
    icon: Calculator,
  },
  {
    title: 'Read product reviews',
    description: 'Get deeper context on specific banks before you trust a headline rate.',
    href: '/banking/reviews',
    icon: SearchCheck,
  },
];

const trustPoints = [
  'Compare rates first, then open the article if you need more context.',
  'Rates and conditions are checked regularly.',
  'Built to stay simple as more banking and card content gets added.',
];

export default function BankingHub() {
  const articles = getBankingArticles();
  const featuredArticle = getFeaturedBankingArticle();
  const supportingArticles = articles.filter((article) => article.slug !== featuredArticle?.slug);
  const itemListJsonLd = buildItemListSchema(articles, BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <SectionHub
        title="Banking"
        description="Compare rates, use the calculator, and open articles only when you want more context."
        breadcrumbItems={[{ label: 'Banking', href: '/banking' }]}
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-6 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-7">
            <div className="absolute -right-10 top-6 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
                <Landmark className="h-4 w-4" />
                Banking operating system
              </div>
              <div className="space-y-3">
                <h2 className="max-w-xl text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                  Start with the tools. Read the guide when the fine print matters.
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  Everything here is meant to help you make a better savings decision without making the page feel heavy.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/banking/rates"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  Explore Banking rates
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  Open calculator
                </Link>
              </div>
            </div>
          </div>

          {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Use Truva now
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Pick the action you need
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {utilityCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-[1.75rem] border border-brand-border/80 bg-white p-5 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-[0_26px_70px_-38px_rgba(0,82,255,0.3)] dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                      {card.title}
                    </h3>
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
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Editorial layer
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                Banking articles
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {supportingArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="compact" />
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Why this page works
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Simple flow, better decisions
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </SectionHub>
    </>
  );
}
