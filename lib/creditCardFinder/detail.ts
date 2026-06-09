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
    return 'Good if you want cash back on everyday spending';
  }
  if (card.rewards_type === 'miles') {
    return 'Good if you travel often and want to earn miles';
  }
  if (card.rewards_type === 'points') {
    return 'Good if you want to earn points on everyday spending';
  }
  if (isNoYearlyFee(card)) {
    return 'Good if you want a card you can keep without a yearly fee';
  }
  if (
    card.card_tier === 'classic' ||
    (cardMinIncomeMonthly(card) ?? Infinity) <= 20_000
  ) {
    return 'Good as a simple card to start with';
  }
  return 'Good for everyday rewards';
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

function isDepositHoldoutCard(card: CreditCard): boolean {
  return card.normalized_card_key === 'bdo_secured_credit_card';
}

function isInvitationOnlyCard(card: CreditCard): boolean {
  return card.normalized_card_key === 'bdo_world_elite_mastercard';
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

  if (isDepositHoldoutCard(card)) {
    return {
      verdict: 'cannot-confirm',
      headline: 'Deposit holdout.',
      detail:
        'BDO lists a deposit holdout instead of a salary requirement for this card. The bank still makes the final approval decision.',
      cardMinIncomeMonthly: cardMin,
    };
  }

  if (isInvitationOnlyCard(card)) {
    return {
      verdict: 'cannot-confirm',
      headline: 'By invitation only.',
      detail:
        'BDO lists this card as by invitation only, so Truva does not show a salary threshold. The bank still makes the final approval decision.',
      cardMinIncomeMonthly: cardMin,
    };
  }

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

function normalizedWaiverCondition(card: CreditCard): string | null {
  const raw = card.annual_fee_waiver_condition?.trim();
  return raw ? raw.toLowerCase().replace(/\s+/g, ' ') : null;
}

function hasKnownFeeWaiverDetails(card: CreditCard): boolean {
  if (isNoYearlyFee(card)) return true;

  const normalized = normalizedWaiverCondition(card);
  if (!normalized) return false;
  if (normalized === 'spend_threshold') {
    return card.annual_fee_waiver_threshold !== null;
  }
  return true;
}

/**
 * One calm sentence naming the key fields the bank has not clearly published,
 * or `null` when nothing important is missing. Replaces the scattered
 * "Not disclosed / No public data" repetition.
 */
export function deriveMissingDataNote(card: CreditCard): string | null {
  const missing: string[] = [];

  if (
    !isDepositHoldoutCard(card) &&
    !isInvitationOnlyCard(card) &&
    card.min_income_monthly === null &&
    card.min_income_annual === null
  ) {
    missing.push('the income requirement');
  }
  if (!hasKnownFeeWaiverDetails(card)) {
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

function rewardsFormulaText(card: CreditCard): string {
  return card.rewards_formula ? JSON.stringify(card.rewards_formula).toLowerCase() : '';
}

function hasCategoryRewardRules(card: CreditCard): boolean {
  const text = rewardsFormulaText(card);
  return /\b(supermarket|drugstore|gas|grocery|groceries|telecom|school|bookstore|online|gadget|internet|dining|restaurant|department|fuel|travel|hotel|airline|utilities|bonus|double points|after php|non-essential|categor(?:y|ies))\b/.test(
    text,
  );
}

// ── Quick Take: main benefit ─────────────────────────────────────────────────

/** A short bold lead + plain sentence — one decision-relevant idea, no jargon. */
export interface QuickTakeRow {
  lead: string;
  body: string;
}

function exactMainBenefit(card: CreditCard): QuickTakeRow | null {
  switch (card.normalized_card_key) {
    case 'aub_easy_mastercard':
      return {
        lead: 'Flexible payment setup.',
        body: 'AUB lets you choose your due date and payment cycle while keeping the yearly fee at zero.',
      };
    case 'aub_classic_mastercard':
      return {
        lead: 'No-fee AUB access.',
        body: 'You get a simple Mastercard with no yearly fee for life and AUB flexible billing controls.',
      };
    case 'aub_platinum_mastercard':
      return {
        lead: 'No-fee Platinum access.',
        body: 'You get AUB Platinum benefits, flexible billing, and lounge access without a yearly fee.',
      };
    case 'chinabank_prime_mastercard':
      return {
        lead: 'Simple Chinabank points.',
        body: 'You earn 1 Rewards Point per Php 30 qualified spend with a lower regular yearly fee than Chinabank Platinum.',
      };
    case 'chinabank_platinum_mastercard':
      return {
        lead: 'Points plus fuel rebate.',
        body: 'You earn Chinabank Rewards Points and can use the listed 5% local fuel rebate if your fuel spend fits the caps.',
      };
    case 'metrobank_travel_signature_visa':
      return {
        lead: 'Miles with lower forex.',
        body: 'You earn miles on every purchase while Metrobank lists a lower 1.68% foreign-currency fee.',
      };
    case 'metrobank_platinum_mastercard':
      return {
        lead: 'Lifestyle rewards.',
        body: 'You earn Metrobank Rewards Points with dining privileges, e-commerce protection, and a spend-based fee-waiver path.',
      };
    case 'metrobank_world_mastercard':
      return {
        lead: 'Travel and online points.',
        body: 'You earn higher points on foreign-currency, hotel, and online transactions with Metrobank travel privileges.',
      };
    case 'metrobank_toyota_platinum_card':
      return {
        lead: 'Toyota and driving rebates.',
        body: 'You get Toyota dealer benefits plus a Metrobank-listed 3% fuel and toll rebate.',
      };
    case 'metrobank_toyota_card':
      return {
        lead: 'Petron fuel rebates.',
        body: 'You get a lower-income-gate Toyota card with a Metrobank-listed 3% fuel rebate at Petron.',
      };
    case 'rcbc_classic_mastercard':
      return {
        lead: 'Lower-fee RCBC points.',
        body: 'You get RCBC Rewards on a simpler Mastercard with a Php 1,500 regular yearly fee.',
      };
    case 'rcbc_gold_mastercard':
      return {
        lead: 'Mid-tier RCBC rewards.',
        body: 'You get RCBC Rewards plus RCBC-listed travel and purchase-protection features.',
      };
    case 'rcbc_diamond_card_platinum_mastercard':
      return {
        lead: 'Donation-linked rewards.',
        body: 'You earn RCBC Rewards while eligible spend is linked to automatic Diamond Cares donations.',
      };
    case 'rcbc_airmiles_visa_signature':
      return {
        lead: 'Direct travel miles.',
        body: 'You earn Signature Airmiles on local and overseas spend with RCBC-listed 1:1 partner mileage conversion.',
      };
    case 'rcbc_flex_visa':
      return {
        lead: 'Choose-your-category points.',
        body: 'You can earn higher points in two preferred spend categories if they match your routine.',
      };
    case 'rcbc_black_card_platinum_mastercard':
      return {
        lead: 'Premium RCBC points.',
        body: 'You earn flexible RCBC Rewards with stronger earning on international spend.',
      };
    default:
      return null;
  }
}

export function deriveMainBenefit(card: CreditCard): QuickTakeRow {
  const exact = exactMainBenefit(card);
  if (exact) return exact;

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

function exactFitLists(card: CreditCard): FitLists | null {
  switch (card.normalized_card_key) {
    case 'aub_easy_mastercard':
      return {
        goodFit: [
          'You want a starter-friendly AUB card with no yearly fee for life.',
          'You meet AUB\'s Php 50,000 gross monthly income requirement for Easy, Classic, and Gold.',
          'You value choosing your due date and payment frequency more than premium perks.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You need a card with cash advance access.',
          'You want strong category rewards or cashback.',
          'You often spend in foreign currency and want a lower foreign-card fee than 2.50%.',
          'You want airport lounge access or premium travel benefits.',
        ],
      };
    case 'aub_classic_mastercard':
      return {
        goodFit: [
          'You want a simple Mastercard with no yearly fee for life.',
          'You meet AUB\'s Php 50,000 gross monthly income requirement for Easy, Classic, and Gold.',
          'You want supplementary-card flexibility without adding yearly fees.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You need a card with cash advance access.',
          'You want cashback or bonus-category rewards as the main value.',
          'You often spend in foreign currency and want a lower foreign-card fee than 2.50%.',
          'You want travel perks beyond basic Mastercard acceptance.',
        ],
      };
    case 'aub_platinum_mastercard':
      return {
        goodFit: [
          'You want a Platinum-tier AUB card with no yearly fee for life.',
          'You meet AUB\'s Php 100,000 gross monthly income requirement for Platinum.',
          'You can use lounge access and AUB Rewards Points.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You need a card with cash advance access.',
          'You want a lower income requirement than Php 100,000 a month.',
          'You want a dedicated miles card instead of flexible rewards points.',
          'You often spend in foreign currency and want a lower foreign-card fee than 2.50%.',
        ],
      };
    case 'chinabank_prime_mastercard':
      return {
        goodFit: [
          'You want a simple Chinabank points card with a lower regular yearly fee.',
          'You meet Chinabank\'s Php 250,000 gross annual income requirement.',
          'You already hold another principal credit card for at least 12 months.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want cashback or miles as the main reward.',
          'You want fuel rebate, travel insurance, or premium Mastercard benefits.',
          'You often spend in foreign currency and want a lower foreign-card fee than 2.50%.',
          'You are applying for your first credit card.',
        ],
      };
    case 'chinabank_platinum_mastercard':
      return {
        goodFit: [
          'You want Chinabank points plus a local fuel rebate.',
          'You meet Chinabank\'s Php 250,000 gross annual income requirement.',
          'You can use Platinum travel insurance or dining privileges.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want a lower regular yearly fee than Php 3,500.',
          'Your fuel spend is low or often exceeds the rebate caps.',
          'You want a dedicated miles card instead of regular rewards points.',
          'You are applying for your first credit card.',
        ],
      };
    case 'metrobank_travel_signature_visa':
      return {
        goodFit: [
          'You travel often enough to use miles, local lounge access, and travel insurance.',
          'You meet the published Php 700,000 annual income requirement.',
          'You already hold another principal credit card with at least Php 150,000 credit limit.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want cashback or simple points instead of miles.',
          'You want a lower regular yearly fee than Php 5,500.',
          'You do not expect to use airport or travel benefits.',
          'You are applying for your first credit card.',
        ],
      };
    case 'metrobank_platinum_mastercard':
      return {
        goodFit: [
          'You want Metrobank Rewards Points with dining and shopping privileges.',
          'You meet the published Php 700,000 annual income requirement.',
          'You can realistically spend Php 400,000 a year if you want the following year fee waived.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want miles or cashback as the main reward.',
          'You often spend in foreign currency and want a lower foreign-card fee.',
          'You want a lower regular yearly fee than Php 5,000.',
          'You are applying for your first credit card.',
        ],
      };
    case 'metrobank_world_mastercard':
      return {
        goodFit: [
          'You regularly spend on foreign-currency, hotel, or online transactions.',
          'You meet the published Php 700,000 annual income requirement.',
          'You can use lounge access and premium Mastercard travel benefits.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'Most of your spending is ordinary local spend without travel or online purchases.',
          'You want a lower regular yearly fee than Php 6,000.',
          'You prefer cashback over rewards points.',
          'You are applying for your first credit card.',
        ],
      };
    case 'metrobank_toyota_platinum_card':
      return {
        goodFit: [
          'You own or regularly maintain a Toyota vehicle.',
          'You can use fuel, toll, and Toyota dealer benefits often enough.',
          'You meet the published Php 350,000 annual income requirement.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You do not spend much on fuel, tolls, or Toyota dealer services.',
          'You want general cashback instead of car-related benefits.',
          'You want a lower regular yearly fee than Php 2,800.',
          'You are applying for your first credit card.',
        ],
      };
    case 'metrobank_toyota_card':
      return {
        goodFit: [
          'You want Petron fuel rebates and Toyota dealer discounts.',
          'You meet the published Php 180,000 annual income requirement.',
          'You want a Toyota card with a lower income requirement than Toyota Platinum.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You do not usually fuel up at Petron.',
          'You want travel, lounge, or premium insurance benefits.',
          'You prefer a no-yearly-fee card over car-related perks.',
          'You are applying for your first credit card.',
        ],
      };
    case 'rcbc_classic_mastercard':
      return {
        goodFit: [
          'You want a lower-fee RCBC Mastercard that still earns rewards points.',
          'You meet the published Php 180,000 annual income requirement.',
          'You can use the temporary lifetime yearly-fee waiver promo only if you meet RCBC\'s rules.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want cashback instead of rewards points.',
          'You want a card with stronger travel perks.',
          'You often spend in foreign currency and want a lower foreign card fee.',
          'You expect to carry a balance from month to month.',
        ],
      };
    case 'rcbc_gold_mastercard':
      return {
        goodFit: [
          'You want RCBC Rewards with a mid-tier Mastercard package.',
          'You meet the published Php 600,000 annual income requirement.',
          'You can benefit from RCBC-listed travel and purchase-protection features.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want the lower fee and lower income gate of RCBC Classic.',
          'You want cashback instead of rewards points.',
          'You often spend in foreign currency and want a lower foreign card fee.',
          'You expect to carry a balance from month to month.',
        ],
      };
    case 'rcbc_diamond_card_platinum_mastercard':
      return {
        goodFit: [
          'You want RCBC Rewards with a donation-linked card angle.',
          'You meet the published Php 1,000,000 annual income requirement.',
          'You value the Diamond Cares donation feature more than pure travel perks.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want a travel-first card with stronger miles mechanics.',
          'You prefer cashback over points and donation-linked benefits.',
          'You often spend in foreign currency and want a lower foreign card fee.',
          'You earn below Php 83,333 a month.',
        ],
      };
    case 'rcbc_airmiles_visa_signature':
      return {
        goodFit: [
          'You travel enough to use Signature Airmiles, lounge access, and travel insurance.',
          'You meet the published Php 1,000,000 annual income requirement.',
          'You can use direct miles better than general rewards points.',
          'You pay your balance in full each month to avoid interest.',
        ],
        lookElsewhere: [
          'You want cashback or simple points instead of airline-mile redemptions.',
          'You do not expect to use lounge access or travel insurance.',
          'You want a lower yearly fee than Php 5,500.',
          'You earn below Php 83,333 a month.',
        ],
      };
    default:
      return null;
  }
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
  const exact = exactFitLists(card);
  if (exact) return exact;

  const goodFit: string[] = [];
  const lookElsewhere: string[] = [];
  const tags = deriveTags(card);
  const minIncome = cardMinIncomeMonthly(card);
  const categoryRewardRules = hasCategoryRewardRules(card);

  // Good fit
  if (tags.includes('beginner')) {
    goodFit.push('You want a first credit card from a bank people recognize.');
  }
  if (card.rewards_type === 'cashback' || card.rewards_type === 'points') {
    goodFit.push(
      categoryRewardRules
        ? 'You spend in the bonus categories this card is built around.'
        : 'You want simple rewards without tracking categories.',
    );
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
  if (categoryRewardRules) {
    lookElsewhere.push('You do not want to track bonus categories or qualifying spend rules.');
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

export function normalizeCashAdvanceFeePct(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return value > 100 ? value / 100 : value;
}

function hasNoCashAdvanceFeature(card: Pick<CreditCard, 'bank' | 'normalized_card_key'>): boolean {
  return (
    card.normalized_card_key === 'aub_gold_mastercard' ||
    card.bank.toLowerCase().includes('asia united bank')
  );
}

export function formatCashAdvanceFeeLabel(
  card: Pick<
    CreditCard,
    'bank' | 'normalized_card_key' | 'cash_advance_fee_pct' | 'cash_advance_fee_amount'
  >,
): string | null {
  const pct = normalizeCashAdvanceFeePct(card.cash_advance_fee_pct);
  if (hasNoCashAdvanceFeature(card) && pct === null && card.cash_advance_fee_amount === null) {
    return 'Not available';
  }

  const pieces = [
    pct !== null ? `${pct.toFixed(2)}%` : null,
    card.cash_advance_fee_amount !== null ? formatPeso(card.cash_advance_fee_amount) : null,
  ].filter(Boolean);

  const isBpi =
    card.normalized_card_key.includes('bpi') ||
    card.bank.toLowerCase().includes('bank of the philippine islands');
  if (isBpi && pct !== null && card.cash_advance_fee_amount !== null) {
    return `${pct.toFixed(2)}% finance charge + ${formatPeso(card.cash_advance_fee_amount)} flat fee`;
  }

  return pieces.length > 0 ? pieces.join(' or ') : null;
}

function cleanPublishedFeeWaiverCopy(raw: string): string {
  if (/temporary\s+n(?:af){2}l\s+promo/i.test(raw)) {
    return raw
      .replace(/\bTemporary\s+NAFFL\s+promo\b/gi, 'Temporary no-yearly-fee-for-life promo')
      .replace(/\bPHP\b/g, 'Php');
  }

  return raw
    .replace(/\bno unconditional NAFFL\b/gi, 'no automatic lifetime fee waiver')
    .replace(/\bNAFFL\b/gi, 'no yearly fee for life')
    .replace(/\bunconditionally waived\b/gi, 'waived without spend requirement')
    .replace(/\bPHP\b/g, 'Php');
}

export function formatFeeWaiverCondition(card: CreditCard): string | null {
  const raw = card.annual_fee_waiver_condition?.trim();
  const normalized = normalizedWaiverCondition(card);

  if (
    card.naffl === true ||
    card.badge_inputs?.true_naffl === true ||
    normalized === 'naffl'
  ) {
    return 'No yearly fee for life.';
  }
  if (card.annual_fee_recurring === 0) {
    return 'No yearly fee.';
  }
  if (!raw) return null;

  if (normalized === 'first_year_new_to_bank_only') {
    return 'Waived for the first year for new-to-bank cardholders.';
  }
  if (normalized === 'spend_threshold') {
    return card.annual_fee_waiver_threshold !== null
      ? `Waived after ${formatPeso(card.annual_fee_waiver_threshold)} yearly spend.`
      : 'Waiver depends on yearly spend.';
  }

  return cleanPublishedFeeWaiverCopy(raw);
}

function formatEarnUnit(card: CreditCard): string {
  const formula = card.rewards_formula;
  const earnUnit =
    typeof formula?.earn_unit === 'string'
      ? (formula.earn_unit as string).trim()
      : '';
  const earnRate = typeof formula?.earn_rate === 'number' ? formula.earn_rate : null;

  if (!earnUnit || earnRate === null || earnRate <= 0) return earnUnit;

  const lower = earnUnit.toLowerCase();
  const perMatch = earnUnit.match(/per\s*(?:php|₱)\s*([\d,]+)/i);
  const perAmount = perMatch ? Number(perMatch[1].replace(/,/g, '')) : null;
  const perLabel = perAmount !== null && Number.isFinite(perAmount) ? ` / ${formatPeso(perAmount)}` : '';

  if (lower.includes('point')) {
    return `${earnRate} ${earnRate === 1 ? 'pt' : 'pts'}${perLabel}`;
  }
  if (lower.includes('mile')) {
    return `${earnRate} ${earnRate === 1 ? 'mile' : 'miles'}${perLabel}`;
  }
  if (lower.includes('percent') || lower.includes('%')) {
    return `${earnRate}%`;
  }

  return earnUnit;
}

export function deriveCostRows(card: CreditCard): CostRows {
  const earnUnit = formatEarnUnit(card);
  const noRewardsListed = earnUnit.toLowerCase().includes('no rewards program listed');

  const primary: CostRow[] = [
    costRow(noRewardsListed ? 'Rewards' : 'Earn rate', earnUnit || null),
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

  const more: CostRow[] = [
    costRow('Cash advance fee', formatCashAdvanceFeeLabel(card)),
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
    costRow('Fee waiver', formatFeeWaiverCondition(card)),
  ].filter((row) => !row.pending);

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
