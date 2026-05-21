/**
 * Detail-page derivations — plain-language card summary, approval read, and a
 * single consolidated missing-data note.
 *
 * Pure module (no Supabase, no React) so it is fully unit-testable, mirroring
 * `rank.ts` / `explain.ts`. Every output is grounded in real DB fields — we
 * never invent a peso figure, a rate, or an approval promise.
 *
 * Wording rules (see `copy.ts`): never "approved" / "guaranteed". The bank
 * always makes the final decision.
 */

import type { CreditCard } from '@/types';
import type { FinderAnswers, IncomeAnswer } from '@/lib/creditCardFinder/questions';
import {
  cardMinIncomeMonthly,
  deriveAnnualFeeLabel,
  deriveTags,
  hasNoYearlyFeeConflict,
  incomeBracketMin,
  isNoYearlyFee,
} from '@/lib/creditCardFinder/rank';

// ── Plain-language card summary ──────────────────────────────────────────────

export interface CardSummary {
  /** One sentence: what kind of card this is. */
  whatItIs: string;
  /** One or two sentences: the kind of person it suits. */
  whoItsFor: string;
}

function whoItsForBase(card: CreditCard): string {
  if (card.rewards_type === 'cashback') {
    return 'Best if you want cash back on everyday spending';
  }
  if (card.rewards_type === 'miles') {
    return 'Best if you travel often and want to earn miles';
  }
  if (card.rewards_type === 'points') {
    return 'Best if you want to earn points on everyday spending';
  }
  if (isNoYearlyFee(card)) {
    return 'Best if you want a card you can keep without a yearly fee';
  }
  if (
    card.card_tier === 'classic' ||
    (cardMinIncomeMonthly(card) ?? Infinity) <= 20_000
  ) {
    return 'Best as a simple card to start with';
  }
  return 'Best for everyday rewards';
}

/**
 * Builds a plain "what this card is / who it's for" summary from real card
 * fields. Falls back gracefully when fields are null.
 */
export function deriveCardSummary(card: CreditCard): CardSummary {
  const adjectives = [card.card_tier, card.card_network, card.rewards_type]
    .filter((part): part is string => Boolean(part && part.trim()));

  const whatItIsCore = `A ${adjectives.join(' ')} credit card from ${card.bank}`
    .replace(/\s+/g, ' ')
    .trim();
  const whatItIs = isNoYearlyFee(card)
    ? `${whatItIsCore}, with no yearly fee.`
    : `${whatItIsCore}.`;

  let whoItsFor = `${whoItsForBase(card)}.`;
  // Only add the first-card note when the base sentence was about rewards —
  // the "simple card to start with" base already says it.
  if (card.rewards_type && deriveTags(card).includes('beginner')) {
    whoItsFor += ' It is also friendly for a first credit card.';
  }

  return { whatItIs, whoItsFor };
}

// ── Approval / eligibility read ──────────────────────────────────────────────

export type ApprovalVerdict = 'likely-meet' | 'may-need-higher' | 'cannot-confirm';

export interface ApprovalAssessment {
  verdict: ApprovalVerdict;
  headline: string;
  detail: string;
  cardMinIncomeMonthly: number | null;
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

/**
 * Compares the income range a user shared in the finder against the card's
 * listed minimum income. Honest by design: when anything is unknown, it
 * returns `cannot-confirm` rather than guessing. Never promises approval.
 */
export function assessApproval(
  card: CreditCard,
  income: IncomeAnswer | null,
): ApprovalAssessment {
  const cardMin = cardMinIncomeMonthly(card);
  const bracketMin = incomeBracketMin(income);

  if (bracketMin === null || cardMin === null || card.income_filter_ready === false) {
    return {
      verdict: 'cannot-confirm',
      headline: 'Not confirmed.',
      detail:
        "Truva can't confirm this card's income requirement yet. Check the bank's page before you apply.",
      cardMinIncomeMonthly: cardMin,
    };
  }

  if (bracketMin >= cardMin) {
    return {
      verdict: 'likely-meet',
      headline: 'Likely yes.',
      detail:
        'Your income appears above the listed requirement. The bank still makes the final approval decision.',
      cardMinIncomeMonthly: cardMin,
    };
  }

  return {
    verdict: 'may-need-higher',
    headline: 'It may be tight.',
    detail:
      "This card's listed income requirement is above the range you shared. You can still apply — the bank makes the final approval decision.",
    cardMinIncomeMonthly: cardMin,
  };
}

// ── Consolidated missing-data note ───────────────────────────────────────────

function formatList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * One calm sentence naming the key fields the bank has not clearly published,
 * or `null` when nothing important is missing. Replaces the scattered
 * "Not disclosed / No public data" repetition.
 */
export function deriveMissingDataNote(card: CreditCard): string | null {
  const missing: string[] = [];

  if (card.min_income_monthly === null && card.min_income_annual === null) {
    missing.push('the income requirement');
  }
  if (
    card.annual_fee_waiver_condition === null ||
    card.annual_fee_waiver_threshold === null
  ) {
    missing.push('fee-waiver details');
  }
  if (card.foreign_transaction_fee_pct === null) {
    missing.push('the foreign card fee');
  }
  if (card.interest_rate_pct === null) {
    missing.push('the interest rate');
  }
  if (!card.rewards_formula) {
    missing.push('the reward details');
  }

  if (missing.length === 0) return null;

  return `A few details are still being checked with the bank: ${formatList(missing)}. Confirm them on the bank's page before you apply.`;
}

// ── Card network acceptance ──────────────────────────────────────────────────

/** JCB, American Express and Diners Club have narrower merchant acceptance in PH. */
export function isLimitedAcceptanceNetwork(card: CreditCard): boolean {
  const n = (card.card_network ?? '').toLowerCase();
  return (
    n.includes('jcb') ||
    n.includes('amex') ||
    n.includes('american express') ||
    n.includes('diners')
  );
}

function networkName(card: CreditCard): string {
  const n = (card.card_network ?? '').toLowerCase();
  if (n.includes('jcb')) return 'JCB';
  if (n.includes('amex') || n.includes('american express')) return 'American Express';
  if (n.includes('diners')) return 'Diners Club';
  return card.card_network ?? 'This card network';
}

/**
 * Normalizes the raw `rewards_type` field into the three categories every
 * consumer expects. The data pipeline emits it inconsistently — "points",
 * "Points: AUB Rewards Points", "Membership Rewards points", "Travel Miles",
 * "points_to_miles", "rebate", "cashback". Applied once at the data boundary
 * (lib/credit-cards.ts) so finder ranking and detail derivations route every
 * card correctly regardless of how the source labelled it.
 */
export function normalizeRewardType(
  raw: string | null,
): 'cashback' | 'points' | 'miles' | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes('mile')) return 'miles';
  if (s.includes('cashback') || s.includes('cash back') || s.includes('rebate')) {
    return 'cashback';
  }
  if (s.includes('point')) return 'points';
  return null;
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}

// ── Quick Take: main benefit ─────────────────────────────────────────────────

/** A short bold lead + plain sentence — one decision-relevant idea, no jargon. */
export interface QuickTakeRow {
  lead: string;
  body: string;
}

export function deriveMainBenefit(card: CreditCard): QuickTakeRow {
  switch (card.rewards_type) {
    case 'cashback':
      return {
        lead: 'Cash back.',
        body: 'You earn money back on what you spend — no points to convert.',
      };
    case 'points':
      return {
        lead: 'Simple points.',
        body: 'You earn points on every purchase — no categories to track.',
      };
    case 'miles':
      return {
        lead: 'Travel miles.',
        body: 'Your spending earns miles you can put toward flights.',
      };
    default:
      if (isNoYearlyFee(card)) {
        return {
          lead: 'No yearly fee.',
          body: 'A card you can keep for free, even if you rarely use it.',
        };
      }
      return {
        lead: 'A basic card.',
        body: 'No rewards program is listed for this card yet.',
      };
  }
}

// ── The catch ────────────────────────────────────────────────────────────────

/**
 * Honest, one-sentence catches, ordered most-important first. Network
 * acceptance leads when it applies (a structural issue every PH user should
 * know). The first item doubles as the Quick Take "main catch".
 */
export function deriveCatchList(card: CreditCard): string[] {
  const catches: string[] = [];

  if (isLimitedAcceptanceNetwork(card)) {
    catches.push(
      `${networkName(card)} isn't accepted everywhere in the Philippines — keep a Visa or Mastercard as a backup.`,
    );
  }
  if (hasNoYearlyFeeConflict(card)) {
    catches.push(
      'Fee data is mixed — Truva sees both a no-fee signal and a listed fee. Confirm the yearly fee with the bank.',
    );
  }
  if (card.badge_inputs?.high_fx_fee) {
    catches.push(
      'Spending abroad or in foreign currency costs more — the foreign markup on this card is high.',
    );
  }
  if (card.badge_inputs?.earn_cap) {
    catches.push('Rewards stop earning once you hit a monthly or yearly cap.');
  }
  if (card.badge_inputs?.narrow_mcc) {
    catches.push(
      'Bonus rewards only apply to a narrow set of stores — check what counts before you rely on them.',
    );
  }
  if (card.badge_inputs?.rewards_devalued) {
    catches.push(
      'The rewards program lost value in the past year, so points may be worth less than before.',
    );
  }
  if (card.badge_inputs?.accident_only_insurance) {
    catches.push('Travel insurance covers accidents only — not medical emergencies abroad.');
  }

  const recurringFee = card.annual_fee_recurring;
  if (card.annual_fee_first_year === 0 && recurringFee !== null && recurringFee > 0) {
    catches.push(
      `The yearly fee returns after the first year (${formatPeso(recurringFee)}) unless the bank waives it.`,
    );
  }
  if (card.interest_rate_pct !== null && card.interest_rate_pct > 0) {
    catches.push(
      `Interest is steep if you don't pay in full — about ${card.interest_rate_pct.toFixed(2)}% a month.`,
    );
  }
  if (card.badge_inputs?.no_ewallet_earn) {
    catches.push('Loading GCash or Maya with this card earns no rewards.');
  }

  if (catches.length === 0) {
    catches.push(
      "No major catch stands out, but always check the bank's terms before you apply.",
    );
  }
  return catches;
}

// ── Good fit / Look elsewhere ────────────────────────────────────────────────

export interface FitLists {
  goodFit: string[];
  lookElsewhere: string[];
}

/**
 * "Good fit if" / "Look elsewhere if" bullets. Derived from real card traits
 * and — when the user came from the finder — lightly tuned to their answers.
 * Consistent with the results page by construction: both read the same finder
 * answers and the same card fields.
 */
export function deriveFitLists(
  card: CreditCard,
  answers: FinderAnswers,
  fromFinder: boolean,
): FitLists {
  const goodFit: string[] = [];
  const lookElsewhere: string[] = [];
  const tags = deriveTags(card);
  const minIncome = cardMinIncomeMonthly(card);

  // Good fit
  if (tags.includes('beginner')) {
    goodFit.push('You want a first credit card from a bank people recognize.');
  }
  if (card.rewards_type === 'cashback' || card.rewards_type === 'points') {
    goodFit.push('You want simple rewards without tracking categories.');
  } else if (card.rewards_type === 'miles') {
    goodFit.push('You travel often and want your spending to earn miles.');
  }
  if (isNoYearlyFee(card)) {
    goodFit.push('You want a card you can keep without a yearly fee.');
  }
  if (
    fromFinder &&
    answers.avoid === 'complex' &&
    (card.rewards_type === 'cashback' || isNoYearlyFee(card))
  ) {
    goodFit.push('You want a card that is easy to understand and compare.');
  }
  goodFit.push('You pay your balance in full each month to avoid interest.');

  // Look elsewhere
  if (isLimitedAcceptanceNetwork(card)) {
    lookElsewhere.push(
      'You often pay at merchants or checkout pages that only accept Visa or Mastercard.',
    );
  }
  if (card.rewards_type === 'points' || card.rewards_type === 'miles') {
    lookElsewhere.push("You'd rather earn straight cashback than points or miles.");
  } else if (card.rewards_type === 'cashback') {
    lookElsewhere.push("You'd rather earn travel points or airline miles.");
  }
  lookElsewhere.push('You expect to carry a balance from month to month.');
  if (minIncome !== null && minIncome > 40_000) {
    lookElsewhere.push(`You earn below ${formatPeso(minIncome)} a month.`);
  } else {
    lookElsewhere.push('You want the highest rewards rate on the market.');
  }

  return {
    goodFit: dedupe(goodFit).slice(0, 4),
    lookElsewhere: dedupe(lookElsewhere).slice(0, 4),
  };
}

// ── The numbers (costs table) ────────────────────────────────────────────────

export interface CostRow {
  label: string;
  value: string;
  /** True when the bank has not published this field — render as "checking". */
  pending: boolean;
}

export interface CostRows {
  /** Key numbers, always visible. */
  primary: CostRow[];
  /** Long-tail fees, shown behind a "More details" accordion. */
  more: CostRow[];
}

const PENDING_VALUE = 'Still being checked with the bank';

function costRow(label: string, value: string | null): CostRow {
  return value
    ? { label, value, pending: false }
    : { label, value: PENDING_VALUE, pending: true };
}

export function deriveCostRows(card: CreditCard): CostRows {
  const earnUnit =
    typeof card.rewards_formula?.earn_unit === 'string'
      ? (card.rewards_formula.earn_unit as string).trim()
      : '';

  const primary: CostRow[] = [
    costRow('Earn rate', earnUnit || null),
    { label: 'Annual fee', value: deriveAnnualFeeLabel(card), pending: false },
    costRow(
      'Interest if unpaid',
      card.interest_rate_pct !== null
        ? `${card.interest_rate_pct.toFixed(2)}% / month`
        : null,
    ),
    costRow(
      'Late payment fee',
      card.late_payment_fee_amount !== null
        ? formatPeso(card.late_payment_fee_amount)
        : null,
    ),
    costRow(
      'Foreign currency markup',
      card.foreign_transaction_fee_pct !== null
        ? `${card.foreign_transaction_fee_pct.toFixed(2)}%`
        : null,
    ),
  ];

  const cashAdvance = [
    card.cash_advance_fee_pct !== null ? `${card.cash_advance_fee_pct.toFixed(2)}%` : null,
    card.cash_advance_fee_amount !== null
      ? formatPeso(card.cash_advance_fee_amount)
      : null,
  ].filter(Boolean);

  const more: CostRow[] = [
    costRow('Cash advance fee', cashAdvance.length ? cashAdvance.join(' or ') : null),
    costRow(
      'Over-limit fee',
      card.overlimit_fee_amount !== null ? formatPeso(card.overlimit_fee_amount) : null,
    ),
    costRow(
      'Effective annual interest',
      card.interest_rate_effective_annual !== null
        ? `${card.interest_rate_effective_annual.toFixed(2)}%`
        : null,
    ),
    costRow('Fee waiver', card.annual_fee_waiver_condition),
  ];

  return { primary, more };
}

// ── Quick Take chips (finder mode) ───────────────────────────────────────────

const SPEND_CHIP: Record<string, string> = {
  groceries: 'Everyday spend',
  dining: 'Dining',
  online: 'Online shopping',
  bills: 'Bills',
  travel: 'Travel',
  general: 'General spend',
};

const PRIORITY_CHIP: Record<string, string> = {
  naf: 'No yearly fee',
  cashback: 'Cashback',
  points: 'Simple rewards',
  travel: 'Travel perks',
  easy: 'Beginner-friendly',
  simple: 'Simple rewards',
};

/**
 * Short chips echoing the finder answers. The income chip is a derived status,
 * never the user's raw bracket — keeps the page from exposing what they typed.
 */
export function deriveQuickTakeChips(
  answers: FinderAnswers,
  approval: ApprovalAssessment,
): string[] {
  const chips: string[] = [];
  if (answers.first === 'yes') chips.push('First card');
  if (answers.spend && SPEND_CHIP[answers.spend]) chips.push(SPEND_CHIP[answers.spend]);
  if (answers.priority && PRIORITY_CHIP[answers.priority]) {
    chips.push(PRIORITY_CHIP[answers.priority]);
  }
  if (approval.verdict === 'likely-meet') chips.push('Income above requirement');
  else if (approval.verdict === 'may-need-higher') chips.push('Income may be tight');
  return dedupe(chips).slice(0, 4);
}
