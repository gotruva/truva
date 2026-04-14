import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, GitCompareArrows, Landmark, SearchCheck, ShieldCheck, TrendingUp } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BankPickCard } from '@/components/banking/BankPickCard';
import { BASE_URL } from '@/lib/constants';
import { getBankPicksFromRates } from '@/lib/banking';
import { buildItemListSchema, getBankingArticles, getFeaturedBankingArticle } from '@/lib/editorial';
import { formatVerifiedDate, getLatestVerifiedDate, getPublicRates } from '@/lib/rates';

export const metadata: Metadata = {
  title: 'Banking in the Philippines: compare rates, use tools, read guides',
  description:
    'Use Truva to compare live rates, calculate returns, and read practical Banking analysis built for Philippine savers.',
  alternates: {
    canonical: '/banking',
  },
};

const BANK_PICK_AMOUNT = 100000;
const BANK_PICK_MONTHS = 12;

const utilityCards = [
  {
    title: 'Compare bank rates',
    description: 'See after-tax rates, lock-in rules, and conditions in one clean rate desk.',
    href: '/banking/rates#rate-desk',
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
  {
    title: 'Compare bank choices',
    description: 'Open the head-to-head briefs when you already know what you want to compare.',
    href: '/banking/compare',
    icon: GitCompareArrows,
  },
];

export default async function BankingHub() {
  const rates = await getPublicRates();
  const formattedVerifiedDate = formatVerifiedDate(getLatestVerifiedDate(rates));
  const articles = getBankingArticles();
  const featuredArticle = getFeaturedBankingArticle();
  const supportingArticles = articles.filter((article) => article.slug !== featuredArticle?.slug);
  const latestArticles = [...supportingArticles]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 6);

  const bankPicks = getBankPicksFromRates(rates, BANK_PICK_AMOUNT, BANK_PICK_MONTHS, 6);
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
        containerClassName="max-w-6xl"
        titleClassName="not-italic"
      >
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-5 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:rounded-[2rem] sm:p-7">
            <div className="absolute -right-10 top-6 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
            <div className="relative space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15 sm:text-xs sm:tracking-[0.24em]">
                <Landmark className="h-4 w-4" />
                Banking hub
              </div>
              <div className="space-y-3">
                <h2 className="max-w-xl text-2xl font-bold leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                  Compare bank rates first. Read the guide when the fine print matters.
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
                  After-tax comparisons, conditions, and editorial context designed to get you to a better decision faster.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/banking/rates#rate-desk"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  Compare bank rates
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  Open calculator
                </Link>
              </div>

              {formattedVerifiedDate && (
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-brand-border bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-textSecondary shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse-status absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-positive"></span>
                  </span>
                  Rates verified on <span className="font-bold text-brand-textPrimary dark:text-white">{formattedVerifiedDate}</span>
                </div>
              )}
            </div>
          </div>

          {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Banking tools
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Start with the tool, then read the context
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {utilityCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-[1.75rem] border border-brand-border/80 bg-white p-4 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-[0_26px_70px_-38px_rgba(0,82,255,0.3)] dark:border-white/10 dark:bg-white/[0.04] sm:p-5"
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 sm:h-12 sm:w-12">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-xl">
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

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Top picks
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                Best banks right now (after tax)
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                Ranked using Truva rate snapshot for a PHP {BANK_PICK_AMOUNT.toLocaleString()} deposit over {BANK_PICK_MONTHS} months.
                Use the rate desk for your exact amount and filters.
              </p>
            </div>

            <Link
              href="/banking/rates#rate-desk"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
            >
              Open the rate desk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
            {bankPicks.map((pick) => (
              <BankPickCard
                key={pick.provider}
                pick={pick}
                amount={BANK_PICK_AMOUNT}
                months={BANK_PICK_MONTHS}
                className="min-w-[18rem] snap-start md:min-w-0"
              />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Latest posts
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                New banking reads from Truva
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {latestArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="compact" />
              ))}
            </div>

            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
            >
              Browse all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </SectionHub>
    </>
  );
}
