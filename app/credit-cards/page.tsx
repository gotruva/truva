import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, CreditCard, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { FeaturedArticleCard } from '@/components/editorial/FeaturedArticleCard';
import { ArticleCard } from '@/components/editorial/ArticleCard';
import { getCreditCards } from '@/lib/credit-cards';
import { getCreditCardArticles, getFeaturedCreditCardArticle, buildItemListSchema } from '@/lib/editorial';
import { BASE_URL } from '@/lib/constants';
import type { CreditCardProduct } from '@/types';

export const metadata: Metadata = {
  title: 'Best Credit Cards in the Philippines (2026 Comparison)',
  description: 'Compare the best Philippine credit cards for cashback, rewards, and travel. Expert reviews, hidden fees exposed, and clear "Best For" recommendations.',
  alternates: {
    canonical: '/credit-cards',
  },
};

export default async function CreditCardsHub() {
  const cards = await getCreditCards();
  const creditCardArticles = getCreditCardArticles();
  const featuredCreditCardArticle = getFeaturedCreditCardArticle();
  const supportingArticles = creditCardArticles.filter((a) => a.slug !== featuredCreditCardArticle?.slug);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': cards.map((card, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'FinancialProduct',
        'name': card.name,
        'brand': {
          '@type': 'Brand',
          'name': card.provider,
        },
      },
    })),
  };

  const editorialItemListJsonLd = buildItemListSchema(creditCardArticles, BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(editorialItemListJsonLd) }}
      />

      <SectionHub
        title="Credit Cards"
        description="Compare the top Philippine credit cards by cashback, rewards, and annual fee — then apply with confidence."
        breadcrumbItems={[{ label: 'Credit Cards', href: '/credit-cards' }]}
      >
        {/* Section 1: Hero intro card + Featured article */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.14),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(235,240,255,0.88))] p-6 shadow-[0_28px_80px_-52px_rgba(0,82,255,0.48)] dark:border-brand-primary/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,82,255,0.24),_transparent_34%),linear-gradient(140deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] sm:p-7">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
                <CreditCard className="h-4 w-4" />
                Credit card hub
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                  Start with the comparison. Open the review when you need the fine print.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="#cards"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20"
                >
                  Explore all cards
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/credit-cards/reviews"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  <TrendingUp className="h-4 w-4 text-brand-primary" />
                  Read card reviews
                </Link>
              </div>
            </div>
          </div>

          {featuredCreditCardArticle && <FeaturedArticleCard article={featuredCreditCardArticle} />}
        </section>

        {/* Section 2: Card listings */}
        <section id="cards" className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Compare all cards
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Top Philippine credit cards
            </h2>
          </div>
          <div className="space-y-8">
            {cards.map((card) => (
              <CardOverviewItem key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* Section 3: Editorial articles */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                Editorial layer
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                Credit card articles
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
              Our approach
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Honest comparisons, no rank-stuffing
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {[
                'Card comparisons are based on publicly disclosed terms, not internal affiliate relationships.',
                'We expose hidden fees and conditions that banks hide in the fine print.',
                'Built to stay simple as more banking and card content gets added.',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
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

function CardOverviewItem({ card }: { card: CreditCardProduct }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border shadow-sm transition-all hover:shadow-md ${card.isSponsored ? 'border-amber-400 dark:border-amber-500/50' : 'border-brand-border dark:border-white/10'}`}
    >
      {card.isSponsored && (
        <div className="flex w-full items-center justify-between border-b border-amber-400/20 bg-amber-400/10 px-6 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Sponsored Placement
          </span>
          {card.sponsoredDisclosure && <span className="hidden font-normal opacity-80 sm:block">{card.sponsoredDisclosure}</span>}
        </div>
      )}

      <div className="flex flex-col gap-8 p-6 sm:flex-row sm:p-8">
        {/* Left Col: Logo & Badge */}
        <div className="flex w-full flex-col items-center text-center sm:w-1/3 sm:items-start sm:text-left">
          {card.logo ? (
            <div className="relative mb-4 w-full overflow-hidden rounded-xl border border-brand-border bg-white p-6 shadow-inner dark:border-white/5 dark:bg-white/5">
              <Image
                src={card.logo}
                alt={`${card.provider} logo`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="mb-4 flex w-full items-center justify-center rounded-xl border border-brand-border bg-slate-100 shadow-inner dark:border-white/5 dark:bg-slate-800" style={{ aspectRatio: '1.58' }}>
              <span className="text-sm font-medium tracking-widest text-slate-400">{card.provider.toUpperCase()}</span>
            </div>
          )}

          {card.bestFor && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-brand-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Best for {card.bestFor.toLowerCase().includes('best for') ? card.bestFor.replace(/^Best for /i, '') : card.bestFor}
            </div>
          )}
        </div>

        {/* Right Col: Details */}
        <div className="flex w-full flex-col sm:w-2/3">
          <h2 className="mb-1 text-2xl font-bold">{card.name}</h2>
          <p className="mb-6 text-sm text-brand-textSecondary">{card.provider}</p>

          {/* Data Grid */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-brand-border bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-900/50">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-textSecondary">Annual Fee</p>
              <p className="text-lg font-semibold">
                {card.annualFee === 0 ? 'Free' : `₱${card.annualFee.toLocaleString()}`}
              </p>
              {card.annualFeeWaiverCondition && <p className="mt-0.5 truncate text-xs text-brand-textSecondary">{card.annualFeeWaiverCondition}</p>}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-textSecondary">Interest Rate</p>
              <p className="text-lg font-semibold text-brand-success">{card.monthlyInterestRate * 100}% / mo</p>
            </div>
          </div>

          <ul className="mb-8 flex-1 space-y-2">
            {card.perks.slice(0, 3).map((perk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-textSecondary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/credit-cards/reviews/${card.id}`}
              className="flex flex-1 items-center justify-center rounded-xl bg-brand-primary/10 px-4 py-3 font-medium text-brand-primary transition-colors hover:bg-brand-primary/20"
            >
              Read Review
            </Link>
            <a
              href={card.affiliateUrl || '#'}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex flex-1 items-center justify-center rounded-xl bg-brand-primary px-4 py-3 font-medium text-white shadow-sm shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
            >
              Apply Now <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
