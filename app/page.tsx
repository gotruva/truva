import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import {
  LandingExperience,
  type CreditCardLandingSummary,
  type MmfLandingSummary,
} from '@/components/landing/LandingExperience';
import { BASE_URL } from '@/lib/constants';
import { getCreditCards } from '@/lib/credit-cards';
import { formatVerifiedDate, getLatestVerifiedDate, getPublicRates } from '@/lib/rates';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { MoneyMarketFund, RateProduct } from '@/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Truva - Philippines' Financial Comparison Platform",
  description:
    'Find the right Philippine financial product with the math already done. Compare savings, money market funds, credit cards, and loans by tax, fees, conditions, and methodology.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Truva',
    url: BASE_URL,
    title: "Truva - Philippines' Financial Comparison Platform",
    description:
      'Compare Philippine savings, funds, credit cards, and loans with after-tax math, transparent methodology, and product-specific decision tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Truva - Philippines Financial Comparison Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Truva - Philippines' Financial Comparison Platform",
    description:
      'Find the right Philippine financial product with after-tax math, fee context, and transparent methodology.',
    images: ['/og-image.png'],
  },
};

type MmfSummaryRow = Pick<
  MoneyMarketFund,
  'id' | 'currency' | 'net_yield' | 'redemption_days' | 'rate_date' | 'scraped_at'
>;

const EMPTY_MMF_SUMMARY: MmfLandingSummary = {
  totalFunds: 0,
  phpFunds: 0,
  usdFunds: 0,
  topNetYield: null,
  fastestRedemptionDays: null,
  latestDate: null,
  hasLiveData: false,
};

const EMPTY_CARD_SUMMARY: CreditCardLandingSummary = {
  totalCards: 0,
  banks: 0,
  noAnnualFeeCards: 0,
  methodologyReadyCards: 0,
  hasLiveData: false,
};

const getRatesForLanding = unstable_cache(async (): Promise<RateProduct[]> => {
  try {
    return await getPublicRates();
  } catch (error) {
    console.error('[home] Failed to load public rates', error);
    return [];
  }
}, ['landing-public-rates'], { revalidate: 300, tags: ['landing', 'rates'] });

const getCreditCardSummaryForLanding = unstable_cache(async (): Promise<CreditCardLandingSummary> => {
  try {
    const cards = await getCreditCards();
    if (!cards.length) return EMPTY_CARD_SUMMARY;

    return {
      totalCards: cards.length,
      banks: new Set(cards.map((card) => card.bank)).size,
      noAnnualFeeCards: cards.filter((card) => card.naffl === true).length,
      methodologyReadyCards: cards.filter((card) => card.methodology_ready).length,
      hasLiveData: true,
    };
  } catch (error) {
    console.error('[home] Failed to load credit card summary', error);
    return EMPTY_CARD_SUMMARY;
  }
}, ['landing-credit-card-summary'], { revalidate: 300, tags: ['landing', 'credit-cards'] });

const getMmfSummaryForLanding = unstable_cache(async (): Promise<MmfLandingSummary> => {
  try {
    const supabase = createSupabaseAdminClient('public');
    if (!supabase) return EMPTY_MMF_SUMMARY;

    const { data, error } = await supabase
      .from('mmf_current')
      .select('id,currency,net_yield,redemption_days,rate_date,scraped_at');

    if (error) {
      console.error('[home] Failed to load MMF summary', error);
      return EMPTY_MMF_SUMMARY;
    }

    const funds = (data ?? []) as MmfSummaryRow[];
    if (!funds.length) return EMPTY_MMF_SUMMARY;

    const netYields = funds
      .map((fund) => fund.net_yield)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    const redemptionDays = funds
      .map((fund) => fund.redemption_days)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    const latestDate = funds.reduce((latest, fund) => {
      const candidate = fund.rate_date ?? fund.scraped_at ?? '';
      return candidate > latest ? candidate : latest;
    }, '');

    return {
      totalFunds: funds.length,
      phpFunds: funds.filter((fund) => fund.currency === 'PHP').length,
      usdFunds: funds.filter((fund) => fund.currency === 'USD').length,
      topNetYield: netYields.length ? Math.max(...netYields) : null,
      fastestRedemptionDays: redemptionDays.length ? Math.min(...redemptionDays) : null,
      latestDate: latestDate || null,
      hasLiveData: true,
    };
  } catch (error) {
    console.error('[home] Failed to load MMF summary', error);
    return EMPTY_MMF_SUMMARY;
  }
}, ['landing-mmf-summary'], { revalidate: 300, tags: ['landing', 'money-market-funds'] });

export default async function HomePage() {
  const [rates, creditCardSummary, mmfSummary] = await Promise.all([
    getRatesForLanding(),
    getCreditCardSummaryForLanding(),
    getMmfSummaryForLanding(),
  ]);

  const latestVerified = formatVerifiedDate(getLatestVerifiedDate(rates)) || 'May 2026';

  return (
    <LandingExperience
      rates={rates}
      verifiedDate={latestVerified}
      mmfSummary={mmfSummary}
      creditCardSummary={creditCardSummary}
    />
  );
}
