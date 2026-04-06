import { QuickMatchAnswers, LiquidityFilter, PayoutFilter } from '@/types';

export interface CalculatorPrefill {
  amount: number;
  months: number;
  liquidityFilter: LiquidityFilter;
  payoutFilter: PayoutFilter;
  includePdicOnly: boolean;
}

export function mapAnswersToFilters(a: QuickMatchAnswers): CalculatorPrefill {
  // timeline → months
  const monthsMap: Record<QuickMatchAnswers['timeline'], number> = {
    anytime: 3,
    '3mo': 3,
    '3-6mo': 6,
    '6-12mo': 12,
    '1yr+': 24,
  };

  // lockFlexibility → liquidityFilter
  const liquidityMap: Record<QuickMatchAnswers['lockFlexibility'], LiquidityFilter> = {
    'no-lock': 'liquid',
    'maybe': 'all',
    'yes-lock': 'locked',
  };

  // payoutPreference → payoutFilter
  const payoutMap: Record<QuickMatchAnswers['payoutPreference'], PayoutFilter> = {
    'no-preference': 'all',
    'monthly': 'monthly',
    'at-maturity': 'at_maturity',
  };

  return {
    amount: a.amount,
    months: monthsMap[a.timeline],
    liquidityFilter: liquidityMap[a.lockFlexibility],
    payoutFilter: payoutMap[a.payoutPreference],
    includePdicOnly: a.insurancePreference === 'insured-only',
  };
}

/** Human-readable summary of answers for the context bar */
export function summarizeAnswers(a: QuickMatchAnswers): string {
  const amountStr = `₱${a.amount.toLocaleString('en-PH')}`;

  const timelineLabels: Record<QuickMatchAnswers['timeline'], string> = {
    anytime: 'anytime',
    '3mo': '3 months',
    '3-6mo': '3–6 months',
    '6-12mo': '6–12 months',
    '1yr+': '1 year+',
  };

  const lockLabels: Record<QuickMatchAnswers['lockFlexibility'], string> = {
    'no-lock': 'Liquid',
    'maybe': 'Flexible lock-in',
    'yes-lock': 'OK to lock',
  };

  const payoutLabels: Record<QuickMatchAnswers['payoutPreference'], string> = {
    'no-preference': 'Any payout',
    'monthly': 'Monthly payouts',
    'at-maturity': 'Payout at maturity',
  };

  return [amountStr, timelineLabels[a.timeline], lockLabels[a.lockFlexibility], payoutLabels[a.payoutPreference]].join(' · ');
}
