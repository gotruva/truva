import type { CreditCard } from '@/types';

// ── Public types ─────────────────────────────────────────────────────────────

export type SpendingCategory = 'groceries' | 'dining' | 'online' | 'fuel' | 'bills' | 'travel';
export type GoalId = 'no-annual-fee' | 'cashback' | 'travel' | 'first-card' | 'low-fee';
export type IncomeBracketId = '15k' | '21k' | '30k' | '31k' | '50k' | '51k' | '100k';

export interface CardMatchAnswers {
  goal: GoalId;
  income: IncomeBracketId;
  spending: SpendingCategory;
}

export interface CardValueEstimate {
  monthlySpend: number;
  yearlySpend: number;
  grossRewards: number;
  promoBonus: number;
  fee: number;
  netAnnual: number;
}

export interface CardScore {
  matchPct: number;
  value: CardValueEstimate;
  eligible: boolean;
}

// ── Income bracket → midpoint monthly peso value ─────────────────────────────

const INCOME_MONTHLY: Record<string, number> = {
  '15k':  17_500,
  '21k':  25_000,
  '30k':  35_000,  // legacy quiz ID
  '31k':  40_000,
  '50k':  65_000,  // legacy quiz ID
  '51k':  75_000,
  '100k': 150_000,
};

// ── Reward-rate derivation ────────────────────────────────────────────────────

/**
 * Derives a decimal effective reward rate (e.g. 0.005 = 0.5%) from the
 * card's rewards_formula JSON blob. Falls back by rewards_type.
 * We never fabricate rates; we use documented field values when available.
 */
function deriveBaseRewardRate(card: CreditCard): number {
  const formula = card.rewards_formula;

  if (formula && typeof formula === 'object') {
    const str = JSON.stringify(formula).toLowerCase();

    // Explicit "rate" field (e.g. { "rate": 0.5, "unit": "percent" })
    const rateField = (formula as Record<string, unknown>)['rate'];
    if (typeof rateField === 'number' && rateField > 0 && rateField <= 30) {
      return rateField / 100;
    }

    // Inline "X% cashback" pattern in stringified formula
    const pctMatch = str.match(/"([0-9]+(?:\.[0-9]+)?)%/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      if (pct > 0 && pct <= 30) return pct / 100;
    }
  }

  // Fallback by rewards type — conservative PH-market defaults
  switch (card.rewards_type) {
    case 'cashback': return 0.005;   // 0.5% base; many PH cashback cards
    case 'points':   return 0.008;   // ~1pt/₱20, ₱0.20 redemption value
    case 'miles':    return 0.012;   // ~1mi/₱30, ₱0.40 redemption value
    default:         return 0.005;
  }
}

// ── Category-match score derivation ──────────────────────────────────────────

/**
 * Returns a 30–100 score per spending category derived purely from existing
 * DB fields. 60 = neutral baseline; higher = better match for that category.
 */
export function deriveCategoryMatch(card: CreditCard): Record<SpendingCategory, number> {
  const base: Record<SpendingCategory, number> = {
    groceries: 60, dining: 60, online: 60, fuel: 60, bills: 60, travel: 60,
  };

  const formulaStr = card.rewards_formula
    ? JSON.stringify(card.rewards_formula).toLowerCase()
    : '';
  const name = card.card_name.toLowerCase();
  const rewardType = card.rewards_type ?? '';

  // Broad reward-type signals
  if (rewardType === 'cashback') {
    base.groceries += 8;
    base.dining    += 8;
    base.online    += 8;
  }
  if (rewardType === 'miles') {
    base.travel += 18;
  }
  if (card.card_tier === 'signature' || card.card_tier === 'infinite') {
    base.travel += 12;
  }

  // Formula keyword boosts
  if (formulaStr.includes('grocer') || formulaStr.includes('supermarket')) base.groceries += 15;
  if (formulaStr.includes('dining') || formulaStr.includes('restaurant') || formulaStr.includes('food')) base.dining += 15;
  if (formulaStr.includes('online') || formulaStr.includes('ecommerce') || formulaStr.includes('lazada') || formulaStr.includes('shopee')) base.online += 15;
  if (formulaStr.includes('fuel') || formulaStr.includes('petron') || formulaStr.includes('shell') || formulaStr.includes('caltex')) base.fuel += 20;
  if (formulaStr.includes('bill') || formulaStr.includes('utility') || formulaStr.includes('meralco')) base.bills += 15;
  if (formulaStr.includes('travel') || formulaStr.includes('airline') || formulaStr.includes('hotel') || formulaStr.includes('lounge')) base.travel += 15;

  // Card-name signals (stronger signals since name is intentional marketing)
  if (name.includes('petron') || name.includes('fuel')) base.fuel = Math.max(base.fuel, 90);
  if (name.includes('travel') || name.includes('miles') || name.includes('air')) base.travel = Math.max(base.travel, 85);
  if (name.includes('dining') || name.includes('restaurant')) base.dining = Math.max(base.dining, 85);

  // Clamp 30–100
  for (const k of Object.keys(base) as SpendingCategory[]) {
    base[k] = Math.min(100, Math.max(30, base[k]));
  }

  return base;
}

// ── Best-for derivation ───────────────────────────────────────────────────────

function deriveBestFor(card: CreditCard): GoalId[] {
  const goals: GoalId[] = [];
  const rewardType = card.rewards_type ?? '';
  const name = card.card_name.toLowerCase();

  if (rewardType === 'cashback') goals.push('cashback');
  if (rewardType === 'miles' || name.includes('miles') || name.includes('air')) goals.push('travel');
  if (rewardType === 'points' || rewardType === 'miles') goals.push('no-annual-fee'); // don't auto-add here
  if (card.naffl === true) goals.push('no-annual-fee', 'first-card', 'low-fee');
  if (
    card.annual_fee_recurring === null ||
    card.annual_fee_recurring === 0 ||
    card.annual_fee_first_year === 0
  ) {
    goals.push('low-fee');
  }
  if (card.annual_fee_recurring !== null && card.annual_fee_recurring <= 1_500) {
    goals.push('first-card', 'low-fee');
  }
  if (card.card_tier === 'classic') goals.push('first-card');
  if (card.min_income_monthly !== null && card.min_income_monthly <= 20_000) goals.push('first-card');

  return [...new Set(goals)];
}

// ── Core functions ────────────────────────────────────────────────────────────

export function estimateAnnualValue(
  card: CreditCard,
  monthlyIncome: number,
  primaryCategory: SpendingCategory,
): CardValueEstimate {
  const monthlySpend = Math.max(8_000, monthlyIncome * 0.3);
  const yearlySpend  = monthlySpend * 12;

  const catScore     = deriveCategoryMatch(card)[primaryCategory];
  const baseRate     = deriveBaseRewardRate(card);
  const effectiveRate = baseRate * (1 + (catScore - 60) / 200);
  const grossRewards = yearlySpend * effectiveRate;

  const fee = card.naffl === true ? 0 : (card.annual_fee_recurring ?? 0);

  return {
    monthlySpend,
    yearlySpend,
    grossRewards,
    promoBonus: 0,   // never fabricate a peso amount without real promo data
    fee,
    netAnnual: grossRewards - fee,
  };
}

export function scoreCard(card: CreditCard, answers: CardMatchAnswers): CardScore {
  const monthly   = INCOME_MONTHLY[answers.income] ?? 25_000;
  const minIncome = card.min_income_monthly;

  let score = 50;

  // 1. Eligibility
  if (minIncome === null) {
    score += 5; // income unknown → accessible, mild positive signal
  } else if (monthly >= minIncome) {
    score += 18;
  } else {
    score -= 30; // can't qualify → heavy penalty, card stays visible but ranked down
  }

  // 2. Goal match
  if (deriveBestFor(card).includes(answers.goal)) score += 22;

  // 3. Spending-category match
  const catScore = deriveCategoryMatch(card)[answers.spending];
  score += (catScore - 60) * 0.4;

  // 4. First-card seeker boost
  if (answers.goal === 'first-card') {
    if (card.naffl === true) score += 10;
    if (card.card_tier === 'classic') score += 5;
  }

  // 5. Net-value bonus
  const val = estimateAnnualValue(card, monthly, answers.spending);
  if (val.netAnnual > 3_000) score += 5;
  if (val.netAnnual > 6_000) score += 5;
  if (val.netAnnual < 0)     score -= 10;

  return {
    matchPct: Math.max(35, Math.min(99, Math.round(score))),
    value:    val,
    eligible: minIncome === null || monthly >= minIncome,
  };
}

export function rankCards(
  cards: CreditCard[],
  answers: CardMatchAnswers,
): Array<{ card: CreditCard } & CardScore> {
  return cards
    .map(card => ({ card, ...scoreCard(card, answers) }))
    .sort((a, b) => b.matchPct - a.matchPct);
}

// Default values used by the browse grid when no quiz answers are available
export const BROWSE_DEFAULT_INCOME    = 25_000;
export const BROWSE_DEFAULT_CATEGORY: SpendingCategory = 'groceries';
