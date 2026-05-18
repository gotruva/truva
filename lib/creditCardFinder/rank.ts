/**
 * Finder ranking + plain-language derivations — Direction B (final).
 *
 * Pure module (no Supabase, no React) so it is fully unit-testable.
 * Implements the handoff §7 scoring pseudocode. Spec fields that do NOT
 * exist in `credit_card_listings` (tags, spending_categories,
 * data_confidence, fit/why/watch-out copy) are DERIVED from real DB
 * fields here — never invented.
 */

import type { CreditCard } from '@/types';
import type { CardEditorial } from '@/lib/creditCardEditorial';
import { deriveCategoryMatch, type SpendingCategory } from '@/lib/creditCardValue';
import { CONFIDENCE_LABELS, type ConfidenceLabel } from '@/lib/creditCardFinder/copy';
import type {
  AvoidAnswer,
  FinderAnswers,
  IncomeAnswer,
  PriorityAnswer,
} from '@/lib/creditCardFinder/questions';

export type FinderTag =
  | 'naffl'
  | 'cashback'
  | 'points'
  | 'travel'
  | 'beginner'
  | 'low-income'
  | 'high-forex'
  | 'promo-heavy';

export interface ScoredCard {
  card: CreditCard;
  score: number; // 0..1
  tags: FinderTag[];
  spendingCategories: SpendingCategory[];
  confidence: ConfidenceLabel;
  annualFeeLabel: string;
  minIncomeLabel: string;
  bestForLabel: string;
}

export type FinderResult =
  | { kind: 'matched'; sections: ScoredCard[] }
  | { kind: 'fallback' };

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

// ── Income bracket → minimum monthly peso the user clears ────────────────────

export function incomeBracketMin(income: IncomeAnswer | null): number | null {
  switch (income) {
    case '<15':
      return 0;
    case '15-30':
      return 15_000;
    case '30-50':
      return 30_000;
    case '50-100':
      return 50_000;
    case '100+':
      return 100_000;
    case 'skip':
    case null:
    default:
      return null;
  }
}

function cardMinIncomeMonthly(card: CreditCard): number | null {
  if (card.min_income_monthly !== null) return card.min_income_monthly;
  if (card.min_income_annual !== null) return Math.round(card.min_income_annual / 12);
  return null;
}

export function isNoYearlyFee(card: CreditCard): boolean {
  return (
    card.naffl === true ||
    card.badge_inputs?.true_naffl === true ||
    card.annual_fee_recurring === 0
  );
}

function hasYearlyFee(card: CreditCard): boolean {
  return card.naffl !== true && (card.annual_fee_recurring ?? 0) > 0;
}

// ── Tag derivation (fixed vocabulary, from real fields only) ─────────────────

export function deriveTags(card: CreditCard): FinderTag[] {
  const tags = new Set<FinderTag>();
  const name = card.card_name.toLowerCase();
  const minIncome = cardMinIncomeMonthly(card);

  if (isNoYearlyFee(card)) tags.add('naffl');
  if (card.rewards_type === 'cashback') tags.add('cashback');
  if (card.rewards_type === 'points') tags.add('points');
  if (
    card.rewards_type === 'miles' ||
    card.card_tier === 'signature' ||
    card.card_tier === 'infinite' ||
    name.includes('miles') ||
    name.includes('air') ||
    name.includes('travel')
  ) {
    tags.add('travel');
  }
  if (
    card.card_tier === 'classic' ||
    isNoYearlyFee(card) ||
    (minIncome !== null && minIncome <= 20_000)
  ) {
    tags.add('beginner');
  }
  if (minIncome !== null && minIncome <= 20_000) tags.add('low-income');
  if (
    card.badge_inputs?.high_fx_fee === true ||
    (card.foreign_transaction_fee_pct !== null &&
      card.foreign_transaction_fee_pct >= 2.75)
  ) {
    tags.add('high-forex');
  }
  if (card.active_promo_count >= 3) tags.add('promo-heavy');

  return [...tags];
}

export function deriveSpendingCategories(card: CreditCard): SpendingCategory[] {
  const scores = deriveCategoryMatch(card);
  return (Object.entries(scores) as [SpendingCategory, number][])
    .filter(([, v]) => v >= 75)
    .map(([k]) => k);
}

// ── Data-confidence derivation ───────────────────────────────────────────────

export function deriveDataConfidence(
  card: CreditCard,
  now: number = Date.now(),
): ConfidenceLabel {
  const hasFee = card.naffl === true || card.annual_fee_recurring !== null;
  const hasIncome =
    card.min_income_monthly !== null || card.min_income_annual !== null;
  const hasRewards = card.rewards_type !== null;
  const hasSource = Boolean(card.source_url);

  const present = [hasFee, hasIncome, hasRewards].filter(Boolean).length;

  const scrapedAt = card.last_scraped_at
    ? new Date(card.last_scraped_at).getTime()
    : NaN;
  const isStale =
    Number.isNaN(scrapedAt) || now - scrapedAt > NINETY_DAYS_MS;

  if (present === 0) return CONFIDENCE_LABELS.notPublished;
  if (present === 3 && hasSource && !isStale) return CONFIDENCE_LABELS.sourceChecked;
  if (isStale) return CONFIDENCE_LABELS.needsChecking;
  return CONFIDENCE_LABELS.mayVary;
}

// ── Display labels (plain language; missing → "Check bank terms") ────────────

export function deriveAnnualFeeLabel(card: CreditCard): string {
  if (card.naffl === true) return '₱0 — no yearly fee for life';
  if (card.annual_fee_recurring === 0) return '₱0 — no yearly fee';
  if (card.annual_fee_recurring !== null) {
    return `₱${card.annual_fee_recurring.toLocaleString('en-PH')}/yr`;
  }
  if (card.annual_fee_first_year === 0) return 'Waived first year';
  return 'Check bank terms';
}

export function deriveMinIncomeLabel(card: CreditCard): string {
  const monthly = cardMinIncomeMonthly(card);
  if (monthly === null) return 'Check bank terms';
  return `₱${monthly.toLocaleString('en-PH')}/mo`;
}

export function deriveBestForLabel(card: CreditCard): string {
  if (card.rewards_type === 'cashback') return 'Cashback on everyday spend';
  if (card.rewards_type === 'miles') return 'Travel and miles';
  if (card.rewards_type === 'points') return 'Points on everyday spend';
  if (isNoYearlyFee(card)) return 'Keeping it free, no yearly fee';
  if (
    card.card_tier === 'classic' ||
    (cardMinIncomeMonthly(card) ?? Infinity) <= 20_000
  ) {
    return 'A simple card to start with';
  }
  return 'Everyday rewards';
}

/** First editorial con, or a fact-grounded watch-out. Never fabricated. */
export function deriveWatchOut(
  card: CreditCard,
  editorial?: CardEditorial,
): string {
  if (editorial?.cons?.[0]) return editorial.cons[0];
  if (card.badge_inputs?.high_fx_fee) {
    return 'Higher foreign transaction fee — costs more on overseas or non-PHP spend.';
  }
  if (card.badge_inputs?.earn_cap) {
    return 'Rewards have a monthly or yearly earn cap — value is limited past the cap.';
  }
  if (hasYearlyFee(card) && card.annual_fee_recurring) {
    return `Has a yearly fee (₱${card.annual_fee_recurring.toLocaleString('en-PH')}) — you need enough spending to earn it back.`;
  }
  return 'Some details are not clearly published by the bank — confirm the terms before you apply.';
}

// ── Scoring (handoff §7) ─────────────────────────────────────────────────────

const PRIORITY_TAG: Record<PriorityAnswer, FinderTag> = {
  naf: 'naffl',
  cashback: 'cashback',
  points: 'points',
  travel: 'travel',
  easy: 'beginner',
  simple: 'beginner',
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function scoreFinderCard(card: CreditCard, answers: FinderAnswers): number {
  const tags = deriveTags(card);
  const spendingCategories = deriveSpendingCategories(card);
  let s = 0;

  // Hard floor — income
  const bracketMin = incomeBracketMin(answers.income);
  const cardMin = cardMinIncomeMonthly(card);
  if (bracketMin !== null && cardMin !== null) {
    if (bracketMin >= cardMin) s += 0.3;
    else s -= 0.4; // soft disqualify, stays visible but ranked down
  }

  // Priority match
  if (answers.priority && tags.includes(PRIORITY_TAG[answers.priority])) {
    s += 0.25;
  }

  // Spend match (skip "general" / "unsure" — no penalty)
  if (
    answers.spend &&
    answers.spend !== 'general' &&
    answers.spend !== 'unsure' &&
    spendingCategories.includes(answers.spend as SpendingCategory)
  ) {
    s += 0.15;
  }

  // Avoidance — penalize, never disqualify
  s += avoidPenalty(card, tags, answers.avoid);

  // First-card friendliness
  if (answers.first === 'yes' && tags.includes('beginner')) s += 0.15;

  // Slight bias toward cards we can stand behind
  if (deriveDataConfidence(card) === CONFIDENCE_LABELS.sourceChecked) s += 0.05;

  return clamp01(s);
}

function avoidPenalty(
  card: CreditCard,
  tags: FinderTag[],
  avoid: AvoidAnswer | null,
): number {
  switch (avoid) {
    case 'fees':
      return hasYearlyFee(card) ? -0.1 : 0;
    case 'income':
      return (cardMinIncomeMonthly(card) ?? 0) > 30_000 ? -0.1 : 0;
    case 'forex':
      return tags.includes('high-forex') ? -0.1 : 0;
    case 'promo':
      return tags.includes('promo-heavy') ? -0.1 : 0;
    case 'complex':
      return card.badge_inputs?.narrow_mcc === true ||
        card.rewards_type === 'miles' ||
        card.rewards_type === 'points'
        ? -0.1
        : 0;
    default:
      return 0;
  }
}

// ── Selection + fallback (handoff §7 top-K) ──────────────────────────────────

export const MATCH_THRESHOLD = 0.55;

export function buildScoredCard(
  card: CreditCard,
  answers: FinderAnswers,
): ScoredCard {
  return {
    card,
    score: scoreFinderCard(card, answers),
    tags: deriveTags(card),
    spendingCategories: deriveSpendingCategories(card),
    confidence: deriveDataConfidence(card),
    annualFeeLabel: deriveAnnualFeeLabel(card),
    minIncomeLabel: deriveMinIncomeLabel(card),
    bestForLabel: deriveBestForLabel(card),
  };
}

/**
 * Slot rules:
 *  1 = highest score
 *  2 = highest remaining with no yearly fee
 *  3 = next highest remaining
 * Fallback if fewer than 2 slots fill. Never silently shows a weak card.
 */
export function selectFinderResults(
  cards: CreditCard[],
  answers: FinderAnswers,
): FinderResult {
  try {
    const qualifying = cards
      .map((c) => buildScoredCard(c, answers))
      .filter((sc) => sc.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    if (qualifying.length === 0) return { kind: 'fallback' };

    const used = new Set<string>();
    const sections: ScoredCard[] = [];

    const slot1 = qualifying[0];
    sections.push(slot1);
    used.add(slot1.card.id);

    const slot2 = qualifying.find(
      (sc) => !used.has(sc.card.id) && isNoYearlyFee(sc.card),
    );
    if (slot2) {
      sections.push(slot2);
      used.add(slot2.card.id);
    }

    const slot3 = qualifying.find((sc) => !used.has(sc.card.id));
    if (slot3) {
      sections.push(slot3);
      used.add(slot3.card.id);
    }

    if (sections.length < 2) return { kind: 'fallback' };
    return { kind: 'matched', sections: sections.slice(0, 3) };
  } catch {
    return { kind: 'fallback' };
  }
}

// ── URL <-> answers (results route + resume) ─────────────────────────────────

const FIRST = new Set(['yes', 'no', 'helping']);
const INCOME = new Set(['<15', '15-30', '30-50', '50-100', '100+', 'skip']);
const SPEND = new Set([
  'groceries',
  'dining',
  'online',
  'bills',
  'travel',
  'general',
  'unsure',
]);
const PRIORITY = new Set(['naf', 'cashback', 'points', 'travel', 'easy', 'simple']);
const AVOID = new Set(['fees', 'income', 'complex', 'promo', 'forex', 'unsure']);

export function parseFinderAnswers(
  params: URLSearchParams | Record<string, string>,
): FinderAnswers {
  const get = (k: string): string | null =>
    params instanceof URLSearchParams ? params.get(k) : (params[k] ?? null);

  const pick = <T extends string>(
    raw: string | null,
    allowed: Set<string>,
  ): T | null => (raw && allowed.has(raw) ? (raw as T) : null);

  return {
    first: pick(get('first'), FIRST),
    income: pick(get('income'), INCOME),
    spend: pick(get('spend'), SPEND),
    priority: pick(get('priority'), PRIORITY),
    avoid: pick(get('avoid'), AVOID),
  };
}

export function answersToQuery(answers: FinderAnswers): string {
  const p = new URLSearchParams();
  if (answers.first) p.set('first', answers.first);
  if (answers.income) p.set('income', answers.income);
  if (answers.spend) p.set('spend', answers.spend);
  if (answers.priority) p.set('priority', answers.priority);
  if (answers.avoid) p.set('avoid', answers.avoid);
  return p.toString();
}
