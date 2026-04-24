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
  TrendingUp,
} from 'lucide-react';
import { BankPickCard } from '@/components/banking/BankPickCard';
import { ProductHubTemplate } from '@/components/layout/ProductHubTemplate';
import { getProductPicksFromRates } from '@/lib/banking';
import { getPublicRates } from '@/lib/rates';
import {
  formatEstimatedAnnualEarnings,
  formatMmfMoney,
  formatMmfPercent,
  MMF_DEFAULT_AMOUNT,
  redemptionLabel,
} from '@/lib/mmf';
import { PRODUCT_NAVIGATION_ITEMS } from '@/lib/product-navigation';
import { createClient } from '@/utils/supabase/server';
import type { MoneyMarketFund } from '@/types';
import { ProviderLogo } from '@/components/mmf/ProviderLogo';

export const metadata: Metadata = {
  title: 'Banking in the Philippines: compare rates, use tools, read guides',
  description:
    'Compare live digital bank and time deposit rates with after-tax math, then move into Truva guides, reviews, and methodology only when the fine print matters.',
  alternates: {
    canonical: '/banking',
  },
};

export const dynamic = 'force-dynamic';

const BANK_PICK_AMOUNT = 100000;
const BANK_PICK_MONTHS = 12;

async function getMmfPreviewFunds() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mmf_current')
      .select('*')
      .eq('currency', 'PHP');

    if (error) {
      console.error('[banking] Failed to load MMF preview', error);
      return [];
    }

    return ((data ?? []) as MoneyMarketFund[])
      .sort((left, right) => (right.net_yield ?? -1) - (left.net_yield ?? -1))
      .slice(0, 3);
  } catch (error) {
    console.error('[banking] Failed to load MMF preview', error);
    return [];
  }
}

function MmfPreviewCard({ fund }: { fund: MoneyMarketFund }) {
  return (
    <article className="min-w-[18rem] snap-start rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.32)] dark:border-white/10 dark:bg-white/[0.04] md:min-w-0">
      <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <ProviderLogo provider={fund.provider} className="h-9 w-9 shrink-0" textClassName="text-sm" />
              <div className="min-w-0">
                <h3 className="text-base font-bold leading-tight text-brand-textPrimary dark:text-white">
                {fund.name}
              </h3>
              <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
                  {fund.provider}
                </p>
              </div>
            </div>
          <div className="shrink-0 rounded-xl bg-brand-primary/10 px-2.5 py-1.5 text-right">
            <p className="text-xs font-semibold tabular-nums text-brand-primary">
              {formatMmfPercent(fund.net_yield)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-primary/15 bg-brand-primaryLight/40 p-4 dark:border-brand-primary/20 dark:bg-brand-primary/10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Est. yearly earnings
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {formatEstimatedAnnualEarnings(fund, MMF_DEFAULT_AMOUNT)}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            on {formatMmfMoney(MMF_DEFAULT_AMOUNT, fund.currency)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-brand-textSecondary/55 dark:text-white/35">Minimum</p>
            <p className="mt-1 font-semibold text-brand-textPrimary dark:text-white">
              {formatMmfMoney(fund.min_initial, fund.currency)}
            </p>
          </div>
          <div>
            <p className="text-brand-textSecondary/55 dark:text-white/35">Cash access</p>
            <p className="mt-1 font-semibold text-brand-textPrimary dark:text-white">
              {redemptionLabel(fund.redemption_days)}
            </p>
          </div>
        </div>

        <Link
          href="/banking/money-market-funds"
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          View in MMF table
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default async function BankingHub() {
  const rates = await getPublicRates();
  const mmfPreviewFunds = await getMmfPreviewFunds();

  const bankPicks = getProductPicksFromRates(rates, BANK_PICK_AMOUNT, BANK_PICK_MONTHS, ['banks'], 3);

  // Schema building for just the page itself or top picks can go here, but we removed articles inline

  return (
    <>
      <ProductHubTemplate
        title="Banking"
        description="An editorial-first comparison desk for Philippine savers: start with after-tax reality, then go deeper only when the terms deserve it."
        breadcrumbItems={[{ label: 'Banking', href: '/banking' }]}
        activeProductId="banking"
        productNavigationItems={PRODUCT_NAVIGATION_ITEMS}
        sectionLinks={[
          { id: 'overview', label: 'Overview' },
          { id: 'start-here', label: 'Start here' },
          { id: 'digital-banks', label: 'Digital banks' },
          { id: 'money-market-funds', label: 'Money market funds' },
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
              href: '/banking/money-market-funds',
              label: 'Compare money market funds',
              icon: TrendingUp,
              variant: 'secondary',
            },
            {
              href: '/banking/articles',
              label: 'Read banking articles',
              icon: FileSearch,
              variant: 'secondary',
            },
          ],
        }}
        trustBar={{
          eyebrow: 'Trust bar',
          title: 'The page tells you how we compare before it asks you to click.',
          description:
            'Banking pages should surface update timing, tax treatment, editorial independence, and methodology in the first screen, not bury them in the footer.',
          items: [
            {
              title: 'Verified cadence',
              description: 'Rates are reviewed on a recurring verification cycle to ensure accuracy.',
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
          title: 'Four fast ways into the decision',
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
              title: 'Compare money market funds',
              description:
                'Open the live MMF table for net yield, estimated earnings, minimums, cash access, and update timing.',
              href: '/banking/money-market-funds',
              icon: TrendingUp,
              eyebrow: 'Funds',
              ctaLabel: 'Compare MMFs',
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
        {/* Digital Banks Section */}
        <section id="digital-banks" className="space-y-5 scroll-mt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-primary/20">
                <Landmark className="h-3.5 w-3.5" />
                Best for high-yield savings
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                Digital Bank Savings
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
              Open full digital bank desk
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

        {/* Money Market Funds Section */}
        {mmfPreviewFunds.length > 0 && (
          <section id="money-market-funds" className="space-y-5 scroll-mt-32">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-primary/20">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Best for liquid investing
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                  Money Market Funds
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  These PHP UITFs and mutual funds use Truva&apos;s live MMF dataset. Net yield is shown with fund-type adjustments ranked by performance.
                </p>
              </div>

              <Link
                href="/banking/money-market-funds"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
              >
                Open MMF comparison
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
              {mmfPreviewFunds.map((fund) => (
                <MmfPreviewCard key={fund.id} fund={fund} />
              ))}
            </div>
          </section>
        )}
      </ProductHubTemplate>
    </>
  );
}
