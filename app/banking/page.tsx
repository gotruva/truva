import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  FileSearch,
  GitCompareArrows,
  Landmark,
  SearchCheck,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { BankPickCard } from '@/components/banking/BankPickCard';
import { ProductHubTemplate } from '@/components/layout/ProductHubTemplate';
import { BASE_URL } from '@/lib/constants';
import { getBankPicksFromRates } from '@/lib/banking';
import {
  buildItemListSchema,
  getBankingArticles,
  getFeaturedBankingArticle,
  getGuideArticles,
} from '@/lib/editorial';
import { PRODUCT_NAVIGATION_ITEMS } from '@/lib/product-navigation';
import { formatVerifiedDate, getLatestVerifiedDate, getPublicRates } from '@/lib/rates';
import type { EditorialArticle } from '@/types';

export const metadata: Metadata = {
  title: 'Banking in the Philippines: compare rates, use tools, read guides',
  description:
    'Compare live digital bank and time deposit rates with after-tax math, then move into Truva guides, reviews, and methodology only when the fine print matters.',
  alternates: {
    canonical: '/banking',
  },
};

const BANK_PICK_AMOUNT = 100000;
const BANK_PICK_MONTHS = 12;

export default async function BankingHub() {
  const rates = await getPublicRates();
  const latestVerifiedDate = getLatestVerifiedDate(rates);
  const formattedVerifiedDate = formatVerifiedDate(latestVerifiedDate);

  const featuredArticle = getFeaturedBankingArticle();
  const bankPicks = getBankPicksFromRates(rates, BANK_PICK_AMOUNT, BANK_PICK_MONTHS, 3);
  const rateRoundups = getBankingArticles('rates')
    .filter((article) => article.slug !== featuredArticle?.slug)
    .slice(0, 2);
  const reviewArticles = getBankingArticles('reviews').slice(0, 2);
  const explainers = getGuideArticles().slice(0, 2);

  const editorialForSchema = [
    featuredArticle,
    ...rateRoundups,
    ...reviewArticles,
    ...explainers,
  ].filter((article): article is EditorialArticle => Boolean(article));

  const itemListJsonLd = buildItemListSchema(
    Array.from(new Map(editorialForSchema.map((article) => [article.slug, article])).values()),
    BASE_URL
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <ProductHubTemplate
        title="Banking"
        description="An editorial-first comparison desk for Philippine savers: start with after-tax reality, then go deeper only when the terms deserve it."
        breadcrumbItems={[{ label: 'Banking', href: '/banking' }]}
        activeProductId="banking"
        productNavigationItems={PRODUCT_NAVIGATION_ITEMS}
        sectionLinks={[
          { id: 'overview', label: 'Overview' },
          { id: 'start-here', label: 'Start here' },
          { id: 'top-picks', label: 'Top picks' },
          { id: 'editorial', label: 'Editorial' },
          { id: 'methodology', label: 'Methodology' },
        ]}
        hero={{
          eyebrow: 'Banking desk',
          icon: Landmark,
          title: 'See the after-tax answer first, then decide whether the headline rate is still worth chasing.',
          directAnswer:
            'Truva compares bank accounts the way savers experience them in real life: after-tax yield, rate conditions, lock-in tradeoffs, and the practical question of whether the advertised rate survives your actual behavior.',
          marketFact: {
            label: 'Market truth',
            value: 'A 5.0% advertised savings rate usually lands as 4.0% after final tax.',
            description:
              'The Philippine 20% Final Withholding Tax is not edge-case fine print. It changes the ranking, so Truva leads with the take-home number.',
          },
          actions: [
            { href: '/banking/rates#rate-desk', label: 'Compare live rates', icon: GitCompareArrows },
            {
              href: featuredArticle?.path ?? '/banking/rates',
              label: 'Read the flagship guide',
              icon: FileSearch,
              variant: 'secondary',
            },
          ],
        }}
        featuredSlot={featuredArticle ? <FeaturedArticleCard article={featuredArticle} /> : undefined}
        trustBar={{
          eyebrow: 'Trust bar',
          title: 'The page tells you how we compare before it asks you to click.',
          description:
            'Banking pages should surface freshness, tax treatment, editorial independence, and methodology in the first screen, not bury them in the footer.',
          items: [
            {
              title: 'Verified cadence',
              description: formattedVerifiedDate
                ? `Rates in this desk were last verified on ${formattedVerifiedDate}.`
                : 'Rates are reviewed on a recurring verification cycle.',
              icon: ShieldCheck,
            },
            {
              title: 'After-tax first',
              description:
                'Bank interest is framed using take-home yield wherever the tax materially changes the decision.',
              icon: WalletCards,
            },
            {
              title: 'Editorial independence',
              description:
                'Sponsored or partner relationships do not buy placement in Truva editorial verdicts or future rankings.',
              icon: SearchCheck,
              href: '/methodology/editorial-integrity',
              linkLabel: 'Read the trust policy',
            },
            {
              title: 'Banking methodology',
              description:
                'See how yield, liquidity, insurance, and condition complexity will feed the future True Value Score.',
              icon: FileSearch,
              href: '/methodology/banking',
              linkLabel: 'Open banking methodology',
            },
          ],
        }}
        quickStart={{
          eyebrow: 'Start here',
          title: 'Three fast ways into the decision',
          description:
            'The landing page should help both users who want the answer now and users who want to audit the logic before they move cash.',
          links: [
            {
              title: 'Compare bank rates',
              description:
                'Open the live rate desk for after-tax returns, lock-in details, and real condition checks.',
              href: '/banking/rates#rate-desk',
              icon: GitCompareArrows,
              eyebrow: 'Compare',
              ctaLabel: 'Open rate desk',
            },
            {
              title: 'Run the savings math',
              description:
                'Model your own balance and time horizon before a promotional rate talks you into the wrong product.',
              href: '/calculator',
              icon: Calculator,
              eyebrow: 'Model',
              ctaLabel: 'Use calculator',
            },
            {
              title: 'Check the methodology',
              description:
                'Review how Truva treats tax, liquidity, insurance, and product conditions before scorecards go live.',
              href: '/methodology/banking',
              icon: FileSearch,
              eyebrow: 'Trust',
              ctaLabel: 'Read methodology',
            },
          ],
        }}
        methodologyCta={{
          eyebrow: 'Methodology and transparency',
          title: 'The banking score should only go live after the methodology is easy to inspect.',
          description:
            'True Value Score is intentionally inactive for now. The methodology pages explain what will count, what partner compensation can influence, and what it cannot touch.',
          primaryAction: {
            href: '/methodology/banking',
            label: 'Open banking methodology',
            icon: FileSearch,
          },
          secondaryAction: {
            href: '/methodology/editorial-integrity',
            label: 'Read editorial integrity',
            icon: ShieldCheck,
            variant: 'secondary',
          },
        }}
        containerClassName="max-w-6xl"
      >
        <section id="top-picks" className="space-y-5 scroll-mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Best banks right now
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                A fast preview before you open the full comparison desk
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                These picks use Truva&apos;s current verified snapshot for a PHP {BANK_PICK_AMOUNT.toLocaleString()} balance over{' '}
                {BANK_PICK_MONTHS} months. The full rate desk stays one click away for your own amount and filters.
              </p>
            </div>

            <Link
              href="/banking/rates#rate-desk"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              Open full rate desk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
            {bankPicks.map((pick) => (
              <BankPickCard
                key={`${pick.provider}-${pick.bestProduct.id}`}
                pick={pick}
                amount={BANK_PICK_AMOUNT}
                months={BANK_PICK_MONTHS}
                className="min-w-[18rem] snap-start md:min-w-0"
              />
            ))}
          </div>
        </section>

        <section id="editorial" className="space-y-6 scroll-mt-32">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Editorial coverage
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Content grouped by the task a saver is actually trying to solve
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Strong comparison sites do not dump a reverse-chronological feed under the hero. They group content by the decision that sent the reader there in the first place.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <EditorialLane
              title="Best-rate roundups"
              description="Use these when you want the current shortlist, the balance math, and the fastest route to the right bank for your amount."
              href="/banking/rates"
              ctaLabel="Browse banking rate guides"
              articles={[featuredArticle, ...rateRoundups].filter(
                (article): article is EditorialArticle => Boolean(article)
              )}
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
      </ProductHubTemplate>
    </>
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
    <section className="overflow-hidden rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {description}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} variant="compact" />
        ))}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
