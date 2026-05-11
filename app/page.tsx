import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import {
  LandingExperience,
  type CreditCardLandingSummary,
  type MmfLandingSummary,
} from '@/components/landing/LandingExperience';
import { BASE_URL } from '@/lib/constants';
import { getPublicRates } from '@/lib/rates';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { MoneyMarketFund, RateProduct } from '@/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Truva - Philippines' Financial Comparison Platform",
  description:
    'Compare Philippine savings, money market funds, credit cards, loans, and insurance in plain words, with rates, fees, conditions, and requirements surfaced clearly.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Truva',
    url: BASE_URL,
    title: "Truva - Philippines' Financial Comparison Platform",
    description:
      'Compare Philippine savings, funds, credit cards, loans, and insurance with plain-language product details, transparent methodology, and clear decision tools.',
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
      'Find the right Philippine financial product with plain-language rates, fees, conditions, and transparent methodology.',
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
  const [rates, mmfSummary] = await Promise.all([
    getRatesForLanding(),
    getMmfSummaryForLanding(),
  ]);

  return (
    <LandingExperience
      rates={rates}
      mmfSummary={mmfSummary}
      creditCardSummary={EMPTY_CARD_SUMMARY}
    />
  );
}
