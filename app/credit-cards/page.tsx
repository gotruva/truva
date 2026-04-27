import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  CreditCard,
  FileCheck2,
  FileSearch,
  Filter,
  Info,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { CreditCardCatalog } from '@/components/credit-cards/CreditCardCatalog';
import { CreditCardDeskVisual } from '@/components/credit-cards/CreditCardVisual';
import { ProductHubTemplate } from '@/components/layout/ProductHubTemplate';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { getCreditCards } from '@/lib/credit-cards';
import { PRODUCT_NAVIGATION_ITEMS } from '@/lib/product-navigation';
import type { CreditCard as CreditCardType } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Compare Credit Cards in the Philippines',
  description:
    'Compare Philippine credit-card fees, rewards, interest, and things to check in plain English before you visit a bank site.',
  alternates: {
    canonical: '/credit-cards',
  },
};

export default async function CreditCardsHub() {
  const cards = await getCreditCards();
  const issuers = Array.from(new Set(cards.map((card) => card.bank))).sort();

  return (
    <>
      <ProductHubTemplate
        title="Credit Card Desk"
        description="Compare credit cards in plain English before you visit a bank site."
        breadcrumbItems={[{ label: 'Credit Cards', href: '/credit-cards' }]}
        activeProductId="credit-cards"
        productNavigationItems={PRODUCT_NAVIGATION_ITEMS}
        sectionLinks={[
          { id: 'overview', label: 'Overview' },
          { id: 'start-here', label: 'Start here' },
          { id: 'browse', label: 'Browse' },
          { id: 'cards', label: 'Cards' },
          { id: 'editorial', label: 'Editorial' },
          { id: 'methodology', label: 'Scoring' },
        ]}
        hero={{
          eyebrow: 'Credit card desk',
          icon: CreditCard,
          title: 'Compare credit cards in the Philippines',
          directAnswer:
            'New to credit cards, or comparing your next one? See annual fees, rewards, interest, and things to check in simple terms.',
          marketFact: {
            label: 'Current coverage',
            value: `${cards.length} public card records from ${issuers.length} banks`,
            description:
              'Scores are not shown yet because some income, fee-waiver, and reward details still need checking.',
          },
          actions: [
            { href: '#cards', label: 'View card details', icon: ArrowRight },
            {
              href: '/methodology/credit-cards',
              label: 'How scores will work',
              icon: FileSearch,
              variant: 'secondary',
            },
          ],
        }}
        featuredSlot={<CreditCardDeskVisual cards={cards} />}
        trustBar={{
          eyebrow: 'Trust bar',
          title: 'Simple card facts, without pressure to choose too fast.',
          description:
            'Credit-card terms can be confusing. We keep the page calm, show what we know, and mark what still needs checking with the bank.',
          items: [
            {
              title: 'Checked from bank pages',
              description:
                'Card pages use the public listing view and keep bank source links nearby.',
              icon: ShieldCheck,
            },
            {
              title: 'Filters, not advice',
              description:
                'Use filters to narrow the list. They do not mean a bank will approve you.',
              icon: Filter,
            },
            {
              title: 'Missing data is visible',
              description:
                'Income, fee-waiver, and rewards gaps are shown instead of guessed.',
              icon: Info,
            },
            {
              title: 'Scores come later',
              description:
                'Scores wait until enough card details are complete and fair to compare.',
              icon: SlidersHorizontal,
              href: '/methodology/credit-cards',
              linkLabel: 'See scoring notes',
            },
          ],
        }}
        quickStart={{
          eyebrow: 'Start here',
          title: 'Start with the question you already have',
          description:
            'Whether this is your first credit card or your second, start with the basics: fees, interest, rewards, and what the bank may still require.',
          links: [
            {
              title: 'I want my next card',
              description:
                'Compare rewards, fees, and promos before adding another card to your wallet.',
              href: '#browse',
              icon: WalletCards,
              eyebrow: 'Browse',
              ctaLabel: 'Browse card types',
            },
            {
              title: 'I am new to credit cards',
              description:
                'Start with annual fee, income requirement, interest, and whether the rewards are easy to understand.',
              href: '#cards',
              icon: CreditCard,
              eyebrow: 'Compare',
              ctaLabel: 'Open catalog',
            },
            {
              title: 'I want to avoid surprises',
              description:
                'We mark what is missing instead of filling gaps with guesses.',
              href: '/methodology/credit-cards',
              icon: FileSearch,
              eyebrow: 'Trust',
              ctaLabel: 'See what we check',
            },
          ],
        }}
        methodologyCta={{
          eyebrow: 'Scoring and transparency',
          title: 'Scores are coming later, after the card details are complete.',
          description:
            'For now, Truva focuses on simple comparison. Scoring waits until income, fee-waiver, and rewards details are complete enough to compare fairly.',
          primaryAction: {
            href: '/methodology/credit-cards',
            label: 'See scoring notes',
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
        <DataReadinessCard cards={cards} />
        <FirstCardSpotlight cards={cards} />
        <CreditCardCatalog cards={cards} />

        <section id="editorial" className="space-y-5 scroll-mt-32">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Editorial support
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Understand the card before you visit the bank site
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Use Truva to read the basics first. Final approval, fees, promos, and requirements are still decided by the bank.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <DecisionSupportCard
              title="Card detail reviews"
              description="See each card's fees, rewards, interest, source link, and missing fields."
              href="/credit-cards/reviews"
              ctaLabel="Browse detail pages"
              icon={CreditCard}
            />
            <DecisionSupportCard
              title="Scoring notes"
              description="See why scores wait for complete income, fee-waiver, and rewards details."
              href="/methodology/credit-cards"
              ctaLabel="Open scoring notes"
              icon={FileSearch}
            />
            <DecisionSupportCard
              title="Compensation policy"
              description="Partner status does not decide what facts appear on a card page."
              href="/methodology/editorial-integrity"
              ctaLabel="Read trust policy"
              icon={ShieldCheck}
            />
          </div>
        </section>
      </ProductHubTemplate>
    </>
  );
}

function DataReadinessCard({ cards }: { cards: CreditCardType[] }) {
  const scoreReady = cards.filter((card) => card.score_ready).length;
  const incomeReady = cards.filter((card) => card.income_filter_ready).length;
  const recurringFeePresent = cards.filter((card) => card.annual_fee_recurring !== null).length;
  const fxPresent = cards.filter((card) => card.foreign_transaction_fee_pct !== null).length;

  return (
    <div className="rounded-[1.8rem] border border-brand-border bg-white p-6 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Data readiness
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Ready for browsing now. Scores come later.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Showing {cards.length} public card listings. Scores are not shown yet because some income, fee-waiver, and rewards details still need checking.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Cards" value={cards.length.toString()} detail="Public listings" icon={CreditCard} />
          <StatTile label="Scores" value={`${scoreReady}/${cards.length}`} detail="Ready cards" icon={SlidersHorizontal} />
          <StatTile label="Income" value={`${incomeReady}/${cards.length}`} detail="Income ready" icon={Info} />
          <StatTile label="Source" value="Bank" detail="Public source links" icon={FileCheck2} />
          <StatTile label="Annual fee" value={`${recurringFeePresent}/${cards.length}`} detail="Recurring fee present" icon={BadgeDollarSign} />
          <StatTile label="Foreign fee" value={`${fxPresent}/${cards.length}`} detail="Fee present" icon={Sparkles} />
        </div>

        <TrueValueScoreBadge showReason />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[1rem] border border-brand-border bg-brand-surface/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 text-brand-primary">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums text-brand-textPrimary dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-400">{detail}</p>
    </div>
  );
}

function DecisionSupportCard({
  title,
  description,
  href,
  ctaLabel,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xl font-bold tracking-tight text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-white">
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

function FirstCardSpotlight({ cards }: { cards: CreditCardType[] }) {
  const spotlightCards = cards
    .filter(
      (card) =>
        card.naffl === true ||
        card.annual_fee_recurring === 0 ||
        (card.min_income_monthly !== null && card.min_income_monthly <= 21000),
    )
    .slice(0, 3);

  if (spotlightCards.length === 0) return null;

  return (
    <section className="space-y-4 rounded-[1.8rem] border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-500/15 dark:bg-emerald-900/10 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <Star className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
            Starting with credit cards?
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            These cards have lower barriers to entry
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            No annual fee for life, or income requirements at entry level — common starting points in
            the Philippines.
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {spotlightCards.map((card) => (
          <Link
            key={card.id}
            href={`/credit-cards/reviews/${card.normalized_card_key}`}
            className="group flex w-64 shrink-0 flex-col gap-3 rounded-[1.2rem] border border-emerald-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 dark:border-emerald-500/15 dark:bg-white/[0.04] dark:hover:border-emerald-500/30"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-textPrimary group-hover:text-brand-primary dark:text-white">
                {card.card_name}
              </p>
              <p className="mt-0.5 truncate text-xs text-brand-textSecondary dark:text-gray-400">
                {card.bank}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-brand-border bg-brand-surface p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-textSecondary dark:text-gray-500">
                  Annual fee
                </p>
                <p className="mt-0.5 text-xs font-bold text-brand-textPrimary dark:text-white">
                  {card.naffl
                    ? 'PHP 0 NAFFL'
                    : card.annual_fee_recurring === 0
                      ? 'PHP 0'
                      : card.annual_fee_recurring !== null
                        ? `PHP ${card.annual_fee_recurring.toLocaleString('en-PH')}`
                        : 'Not disclosed'}
                </p>
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-surface p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-textSecondary dark:text-gray-500">
                  Min. income
                </p>
                <p className="mt-0.5 text-xs font-bold text-brand-textPrimary dark:text-white">
                  {card.min_income_monthly !== null
                    ? `PHP ${card.min_income_monthly.toLocaleString('en-PH')} / mo`
                    : 'No data'}
                </p>
              </div>
            </div>

            {card.naffl && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                No annual fee for life
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
              View details
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
