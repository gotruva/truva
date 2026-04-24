import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  CreditCard,
  FileSearch,
  Plane,
  ShieldCheck,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { ProductHubTemplate } from '@/components/layout/ProductHubTemplate';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { BASE_URL } from '@/lib/constants';
import { getCreditCards } from '@/lib/credit-cards';
import { PRODUCT_NAVIGATION_ITEMS } from '@/lib/product-navigation';
import type { CreditCardProduct } from '@/types';

export const metadata: Metadata = {
  title: 'Best Credit Cards in the Philippines (2026 Comparison)',
  description:
    'Compare Philippine credit cards by cashback, rewards, annual-fee logic, and review coverage before you apply.',
  alternates: {
    canonical: '/credit-cards',
  },
};

type SegmentDefinition = {
  title: string;
  description: string;
  icon: LucideIcon;
  card: CreditCardProduct | null;
  fallback: string;
};

export default async function CreditCardsHub() {
  const cards = await getCreditCards();
  const cashbackCard = cards.find((card) => card.rewardType === 'cashback') ?? cards[0] ?? null;
  const rewardsCard = cards.find((card) => card.rewardType === 'points') ?? cards[0] ?? null;
  const noAnnualFeeCard =
    cards.find((card) =>
      normalizeCopy(card.annualFeeWaiverCondition ?? '').toLowerCase().includes('no annual fee')
    ) ?? rewardsCard;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'FinancialProduct',
        name: card.name,
        brand: {
          '@type': 'Brand',
          name: card.provider,
        },
        url: `${BASE_URL}/credit-cards/reviews/${card.id}`,
      },
    })),
  };

  const segmentCards: SegmentDefinition[] = [
    {
      title: 'Best cashback',
      description:
        'For spenders who want value to show up in statement credits, not a complicated redemption catalog.',
      icon: BadgeDollarSign,
      card: cashbackCard,
      fallback:
        'Cashback leaders should balance headline earn rates against fee drag, category caps, and how easy the rewards are to actually claim.',
    },
    {
      title: 'Best rewards',
      description:
        'For readers who want flexible points and are willing to optimize around transfer or redemption rules.',
      icon: WalletCards,
      card: rewardsCard,
      fallback:
        'Rewards cards earn their place only if the points map cleanly to cash, miles, or useful transfers without hidden redemption friction.',
    },
    {
      title: 'Best travel',
      description:
        'For readers who care about lounge access, miles conversion, and the real cost of premium perks.',
      icon: Plane,
      card: null,
      fallback:
        'Travel ranking is coming after Truva publishes a methodology for lounge value, miles transfer quality, foreign-transaction friction, and premium-fee tradeoffs.',
    },
    {
      title: 'Best low or no annual fee',
      description:
        'For first-card decisions where fee drag matters more than a flashy rewards banner.',
      icon: ShieldCheck,
      card: noAnnualFeeCard,
      fallback:
        'Fee-light picks should still clear the bar on reward usability and waiver realism instead of winning only because the sticker price looks low.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <ProductHubTemplate
        title="Credit Cards"
        description="A cleaner card-comparison landing page: start with the use case, keep fee logic visible, and surface trust signals before any apply button."
        breadcrumbItems={[{ label: 'Credit Cards', href: '/credit-cards' }]}
        activeProductId="credit-cards"
        productNavigationItems={PRODUCT_NAVIGATION_ITEMS}
        sectionLinks={[
          { id: 'overview', label: 'Overview' },
          { id: 'start-here', label: 'Start here' },
          { id: 'top-picks', label: 'Top picks' },
          { id: 'cards', label: 'All cards' },
          { id: 'editorial', label: 'Editorial' },
          { id: 'methodology', label: 'Methodology' },
        ]}
        hero={{
          eyebrow: 'Credit card desk',
          icon: CreditCard,
          title:
            'Choose the card by job-to-be-done first, not by whichever issuer buys the loudest placement.',
          directAnswer:
            "Truva's credit-card landing page leads with the tradeoffs that actually change the decision: annual-fee economics, waiver realism, reward usefulness, promo treatment, and the difference between a good card and a good card for you.",
          marketFact: {
            label: 'Market truth',
            value:
              'A strong welcome promo can still be a weak card if the annual-fee math breaks in year two.',
            description:
              'The right comparison surface needs to normalize fee waivers, promo windows, and reward friction before a card deserves a recommendation.',
          },
          actions: [
            { href: '#top-picks', label: 'See best-for segments', icon: ArrowRight },
            {
              href: '/credit-cards/reviews',
              label: 'Browse card reviews',
              icon: FileSearch,
              variant: 'secondary',
            },
          ],
        }}
        featuredSlot={<CreditCardMethodCard />}
        trustBar={{
          eyebrow: 'Trust bar',
          title:
            'Card pages should explain the fee math and the disclosure rules before they ask for a click-through.',
          description:
            'The strongest credit-card comparison experiences keep methodology, compensation, and promo caveats visible near the first recommendation surface.',
          items: [
            {
              title: 'Fee normalization',
              description:
                'Cards are compared with annual-fee drag and waiver realism in view, not just with the sign-up promo headline.',
              icon: BadgeDollarSign,
            },
            {
              title: 'Promo treatment',
              description:
                "Limited-time promos can support context, but they should not overwrite the card's long-term usefulness.",
              icon: Sparkles,
            },
            {
              title: 'Affiliate disclosure',
              description:
                'Partner relationships can affect where advertisements appear, but not the editorial opinion or future score weighting.',
              icon: ShieldCheck,
              href: '/methodology/editorial-integrity',
              linkLabel: 'Read editorial integrity',
            },
            {
              title: 'Card methodology',
              description:
                'The upcoming True Value Score will use fee economics, reward usefulness, redemption friction, and approval fit.',
              icon: FileSearch,
              href: '/methodology/credit-cards',
              linkLabel: 'Open card methodology',
            },
          ],
        }}
        quickStart={{
          eyebrow: 'Start here',
          title: 'Pick the entry point that matches the decision you are making',
          description:
            'Some readers need a quick shortlist. Others need to inspect waiver rules or disclosure logic before they trust the shortlist at all.',
          links: [
            {
              title: 'Compare by use case',
              description:
                'Start with the segment cards for cashback, rewards, travel, and low-fee decisions.',
              href: '#top-picks',
              icon: CreditCard,
              eyebrow: 'Compare',
              ctaLabel: 'Jump to top picks',
            },
            {
              title: 'Audit the full lineup',
              description:
                'Move below the fold when you want the full card list with provider, fee, perks, and review routes.',
              href: '#cards',
              icon: WalletCards,
              eyebrow: 'Catalog',
              ctaLabel: 'Browse all cards',
            },
            {
              title: 'Read the methodology',
              description:
                'See how Truva will treat fees, promos, and partner relationships before scores go live.',
              href: '/methodology/credit-cards',
              icon: FileSearch,
              eyebrow: 'Trust',
              ctaLabel: 'Open methodology',
            },
          ],
        }}
        methodologyCta={{
          eyebrow: 'Methodology and transparency',
          title:
            'True Value Score stays inactive until the card methodology is detailed enough to challenge.',
          description:
            'The category pages explain what will count in future scoring, how sponsored placements are labeled, and why partners cannot buy favorable reviews.',
          primaryAction: {
            href: '/methodology/credit-cards',
            label: 'Open card methodology',
            icon: FileSearch,
          },
          secondaryAction: {
            href: '/methodology/editorial-integrity',
            label: 'Read editorial integrity',
            icon: ShieldCheck,
            variant: 'secondary',
          },
        }}
        containerClassName="max-w-7xl"
      >
        <section id="top-picks" className="space-y-5 scroll-mt-32">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Best-for segments
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Start with the card job, then inspect the product
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              This is the structure strong comparison sites use because it matches reader intent. Users usually start with best cashback or best no-fee, not with an issuer alphabet.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {segmentCards.map((segment) => (
              <SegmentCard key={segment.title} segment={segment} />
            ))}
          </div>
        </section>

        <section id="cards" className="space-y-5 scroll-mt-32">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Full lineup
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Every live card, with the decision inputs kept visible
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              The long list moves lower on the page, but it still shows the core economics: annual fee, waiver logic, reward type, and the path into a fuller review.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {cards.map((card) => (
              <CardOverviewItem key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section id="editorial" className="space-y-5 scroll-mt-32">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Editorial by task
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Content should help the next question, not just add more volume
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <DecisionSupportCard
              title="Choosing your first card"
              description="Start with the review collection when you need plain-language verdicts and fewer issuer claims."
              href="/credit-cards/reviews"
              ctaLabel="Browse reviews"
            />
            <DecisionSupportCard
              title="Understanding fee math and promos"
              description="Read how Truva will normalize annual fees, fee waivers, reward value, and promo windows before a future ranking goes live."
              href="/methodology/credit-cards"
              ctaLabel="Open card methodology"
            />
            <DecisionSupportCard
              title="Knowing what is editorial and what is ads"
              description="See how partner-supported content is labeled and what compensation can change on Truva versus what it cannot touch."
              href="/methodology/editorial-integrity"
              ctaLabel="Read editorial integrity"
            />
          </div>
        </section>
      </ProductHubTemplate>
    </>
  );
}

function CreditCardMethodCard() {
  return (
    <div className="rounded-[1.8rem] border border-brand-border bg-white p-6 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            What matters before you apply
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            A better card landing page keeps the economic traps in the hero, not hidden below the fold.
          </h2>
        </div>

        <div className="space-y-3 rounded-[1.35rem] border border-brand-border bg-brand-surface/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <MethodRow
            title="Annual fee economics"
            description={'A card is not "best" if the fee eats the value after the welcome promo fades.'}
          />
          <MethodRow
            title="Reward usefulness"
            description="Points only matter if redemption is clear, attainable, and worth the effort."
          />
          <MethodRow
            title="Disclosure discipline"
            description="Sponsored placements need visible labels and a trust page readers can inspect."
          />
        </div>

        <TrueValueScoreBadge />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/methodology/credit-cards"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Open methodology
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/methodology/editorial-integrity"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-5 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
          >
            Read trust policy
          </Link>
        </div>
      </div>
    </div>
  );
}

function MethodRow({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-textPrimary dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}

function SegmentCard({ segment }: { segment: SegmentDefinition }) {
  const Icon = segment.icon;

  return (
    <div className="rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Top pick
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              {segment.title}
            </h3>
          </div>
        </div>

        <TrueValueScoreBadge compact />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
        {segment.description}
      </p>

      {segment.card ? (
        <>
          <div className="mt-5 rounded-[1.35rem] border border-brand-border bg-brand-surface/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-lg font-bold tracking-tight text-brand-textPrimary dark:text-white">
              {segment.card.name}
            </p>
            <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">
              {segment.card.provider}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricBlock
                label="Annual fee"
                value={
                  segment.card.annualFee === 0
                    ? 'PHP 0'
                    : formatPhpAmount(segment.card.annualFee)
                }
                detail={normalizeCopy(segment.card.annualFeeWaiverCondition ?? 'Check issuer waiver rules')}
              />
              <MetricBlock
                label="Reward type"
                value={formatRewardType(segment.card.rewardType)}
                detail={`Best for ${cleanBestFor(segment.card.bestFor)}`}
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {normalizeCopy(segment.card.editorVerdict)}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/credit-cards/reviews/${segment.card.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            >
              Read review
            </Link>
            <a
              href={segment.card.affiliateUrl || '#'}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              Apply on issuer site
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="mt-5 rounded-[1.35rem] border border-dashed border-brand-primary/30 bg-brand-primary/5 p-4 dark:border-brand-primary/25 dark:bg-brand-primary/10">
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {segment.fallback}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/methodology/credit-cards"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
            >
              View methodology
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/methodology/editorial-integrity"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            >
              Read trust policy
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function MetricBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1rem] border border-brand-border bg-white p-3 dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-brand-textPrimary dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
        {detail}
      </p>
    </div>
  );
}

function DecisionSupportCard({
  title,
  description,
  href,
  ctaLabel,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <p className="text-xl font-bold tracking-tight text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-white">
        {title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
        {description}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function CardOverviewItem({ card }: { card: CreditCardProduct }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.9rem] border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.03] ${
        card.isSponsored
          ? 'border-amber-400 dark:border-amber-500/50'
          : 'border-brand-border dark:border-white/10'
      }`}
    >
      {card.isSponsored ? (
        <div className="flex w-full items-center justify-between border-b border-amber-400/20 bg-amber-400/10 px-6 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Sponsored placement
          </span>
          <span className="hidden font-normal opacity-80 sm:block">
            {normalizeCopy(card.sponsoredDisclosure ?? 'Partner-supported card listing')}
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-8 p-6 sm:flex-row sm:p-8">
        <div className="flex w-full flex-col items-center text-center sm:w-1/3 sm:items-start sm:text-left">
          <div className="relative mb-4 aspect-[1.58] w-full overflow-hidden rounded-[1.25rem] border border-brand-border bg-white p-6 shadow-inner dark:border-white/5 dark:bg-white/5">
            {card.logo ? (
              <Image
                src={card.logo}
                alt={`${card.provider} logo`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-medium tracking-widest text-slate-400">
                  {card.provider.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {card.bestFor ? (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-brand-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Best for {cleanBestFor(card.bestFor)}
            </div>
          ) : null}

          <TrueValueScoreBadge compact className="justify-center sm:justify-start" />
        </div>

        <div className="flex w-full flex-col sm:w-2/3">
          <h2 className="mb-1 text-2xl font-bold text-brand-textPrimary dark:text-white">
            {card.name}
          </h2>
          <p className="mb-6 text-sm text-brand-textSecondary dark:text-gray-300">
            {card.provider}
          </p>

          <div className="mb-6 grid grid-cols-2 gap-4 rounded-[1.25rem] border border-brand-border bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-900/50">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-textSecondary">
                Annual fee
              </p>
              <p className="text-lg font-semibold tabular-nums text-brand-textPrimary dark:text-white">
                {card.annualFee === 0 ? 'Free' : formatPhpAmount(card.annualFee)}
              </p>
              {card.annualFeeWaiverCondition ? (
                <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-400">
                  {normalizeCopy(card.annualFeeWaiverCondition)}
                </p>
              ) : null}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-textSecondary">
                Reward type
              </p>
              <p className="text-lg font-semibold text-brand-success">
                {formatRewardType(card.rewardType)}
              </p>
              <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-400">
                {formatMonthlyRate(card.monthlyInterestRate)}
              </p>
            </div>
          </div>

          <ul className="mb-8 flex-1 space-y-2">
            {card.perks.slice(0, 3).map((perk) => (
              <li
                key={`${card.id}-${perk}`}
                className="flex items-start gap-2 text-sm text-brand-textSecondary dark:text-gray-300"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" />
                <span>{normalizeCopy(perk)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/credit-cards/reviews/${card.id}`}
              className="flex flex-1 items-center justify-center rounded-xl bg-brand-primary/10 px-4 py-3 font-medium text-brand-primary transition-colors hover:bg-brand-primary/20"
            >
              Read review
            </Link>
            <a
              href={card.affiliateUrl || '#'}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex flex-1 items-center justify-center rounded-xl bg-brand-primary px-4 py-3 font-medium text-white shadow-sm shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
            >
              Apply now
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function cleanBestFor(value: string) {
  const normalized = normalizeCopy(value);
  return normalized.toLowerCase().includes('best for')
    ? normalized.replace(/^Best for /i, '')
    : normalized;
}

function formatRewardType(rewardType: CreditCardProduct['rewardType']) {
  switch (rewardType) {
    case 'cashback':
      return 'Cashback';
    case 'miles':
      return 'Miles';
    case 'points':
      return 'Points';
    default:
      return 'None';
  }
}

function formatMonthlyRate(rate: number) {
  return `${(rate * 100).toFixed(1)}% / mo`;
}

function formatPhpAmount(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeCopy(value: string) {
  return [
    ['â‚±', 'PHP '],
    ['â€“', '-'],
    ['â€”', '-'],
    ['â€˜', "'"],
    ['â€™', "'"],
    ['â€œ', '"'],
    ['â€\u009d', '"'],
    ['âœ“', 'Check'],
  ].reduce((output, [before, after]) => output.split(before).join(after), value);
}
