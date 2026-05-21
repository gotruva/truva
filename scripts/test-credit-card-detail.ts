/**
 * Unit tests for lib/creditCardFinder/detail.ts
 *
 * Repo has no jest/vitest; scripts run via `tsx` (see package.json).
 * Run: `npm run test:detail`. Exits non-zero on first failure.
 */

import type { CreditCard } from '@/types';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import { EMPTY_ANSWERS } from '@/lib/creditCardFinder/questions';
import {
  assessApproval,
  deriveCardSummary,
  deriveCatchList,
  deriveCostRows,
  deriveFitLists,
  deriveMainBenefit,
  deriveMissingDataNote,
  deriveQuickTakeChips,
  isLimitedAcceptanceNetwork,
  normalizeRewardType,
} from '@/lib/creditCardFinder/detail';

let passed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean) {
  if (cond) {
    passed += 1;
  } else {
    failures.push(name);
    console.error(`  ✗ ${name}`);
  }
}

function eq(name: string, a: unknown, b: unknown) {
  check(`${name} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`, a === b);
}

const RECENT = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

function card(overrides: Partial<CreditCard> = {}): CreditCard {
  return {
    id: 'id-' + Math.random().toString(36).slice(2, 8),
    bank: 'Test Bank',
    card_name: 'Test Card',
    card_tier: null,
    card_network: 'Visa',
    normalized_card_key: 'test-card',
    logo: '/logos/default-bank.svg',
    annual_fee_first_year: null,
    annual_fee_recurring: null,
    annual_fee_currency: 'PHP',
    naffl: null,
    annual_fee_waiver_condition: null,
    annual_fee_waiver_threshold: null,
    interest_rate_pct: null,
    interest_rate_effective_annual: null,
    rewards_type: null,
    rewards_formula: null,
    min_income_monthly: null,
    min_income_annual: null,
    min_income_period: null,
    min_income_source_text: null,
    foreign_transaction_fee_pct: null,
    cash_advance_fee_amount: null,
    cash_advance_fee_pct: null,
    late_payment_fee_amount: null,
    overlimit_fee_amount: null,
    minimum_amount_due_formula: null,
    methodology_ready: true,
    income_filter_ready: true,
    score_ready: true,
    score_suppressed_reason: null,
    methodology_capture_score: null,
    badge_inputs: null,
    active_promo_count: 0,
    source_url: 'https://bank.example/apply',
    last_scraped_at: RECENT,
    ...overrides,
  };
}

function badgeInputs(
  overrides: Partial<NonNullable<CreditCard['badge_inputs']>> = {},
): NonNullable<CreditCard['badge_inputs']> {
  return {
    earn_cap: false,
    low_fx_fee: false,
    narrow_mcc: false,
    true_naffl: false,
    high_fx_fee: false,
    partner_card: false,
    no_ewallet_earn: false,
    rewards_devalued: false,
    full_medical_coverage: false,
    accident_only_insurance: false,
    ...overrides,
  };
}

const answers = (o: Partial<FinderAnswers> = {}): FinderAnswers => ({
  ...EMPTY_ANSWERS,
  ...o,
});

// ── 1. deriveCardSummary — whatItIs ──────────────────────────────────────────
const fullSummary = deriveCardSummary(
  card({ bank: 'BPI', card_tier: 'classic', card_network: 'Visa', rewards_type: 'cashback' }),
);
check(
  'whatItIs lists tier, network, rewards, bank',
  fullSummary.whatItIs === 'A classic Visa cashback credit card from BPI.',
);

const nafflSummary = deriveCardSummary(card({ naffl: true, rewards_type: 'cashback' }));
check('whatItIs mentions no yearly fee for naffl card', nafflSummary.whatItIs.includes('with no yearly fee'));

const conflictSummary = deriveCardSummary(card({ naffl: true, annual_fee_recurring: 1_550 }));
check(
  'whatItIs avoids no-fee claim on conflict card',
  !conflictSummary.whatItIs.toLowerCase().includes('no yearly fee'),
);

const sparseSummary = deriveCardSummary(card({ card_network: null }));
eq('whatItIs falls back cleanly', sparseSummary.whatItIs, 'A credit card from Test Bank.');
check('whatItIs has no double spaces', !sparseSummary.whatItIs.includes('  '));

// ── 2. deriveCardSummary — whoItsFor ─────────────────────────────────────────
check('whoItsFor describes cashback fit', fullSummary.whoItsFor.includes('cash back'));

const beginnerSummary = deriveCardSummary(card({ rewards_type: 'cashback', min_income_monthly: 15_000 }));
check(
  'whoItsFor adds first-card note for beginner rewards card',
  beginnerSummary.whoItsFor.includes('first credit card'),
);

const classicSummary = deriveCardSummary(card({ card_tier: 'classic' }));
check(
  'whoItsFor uses simple-starter base for classic no-rewards card',
  classicSummary.whoItsFor.includes('simple card to start'),
);

// ── 3. assessApproval ────────────────────────────────────────────────────────
const likely = assessApproval(card({ min_income_monthly: 30_000 }), '100+');
eq('high income vs low requirement → likely-meet', likely.verdict, 'likely-meet');
check('likely-meet detail points to the listed requirement', likely.detail.toLowerCase().includes('requirement'));

const tooLow = assessApproval(card({ min_income_monthly: 50_000 }), '15-30');
eq('low income vs high requirement → may-need-higher', tooLow.verdict, 'may-need-higher');

eq(
  'income skipped → cannot-confirm',
  assessApproval(card({ min_income_monthly: 30_000 }), 'skip').verdict,
  'cannot-confirm',
);
eq(
  'card with no income data → cannot-confirm',
  assessApproval(card(), '100+').verdict,
  'cannot-confirm',
);
eq(
  'income_filter_ready false → cannot-confirm',
  assessApproval(card({ min_income_monthly: 30_000, income_filter_ready: false }), '100+').verdict,
  'cannot-confirm',
);

for (const verdictCard of [
  assessApproval(card({ min_income_monthly: 30_000 }), '100+'),
  assessApproval(card({ min_income_monthly: 50_000 }), '15-30'),
  assessApproval(card(), 'skip'),
]) {
  const text = `${verdictCard.headline} ${verdictCard.detail}`.toLowerCase();
  check(
    `approval copy avoids banned words (${verdictCard.verdict})`,
    !text.includes('approved') && !text.includes('guaranteed'),
  );
  check(`approval copy keeps the bank in control (${verdictCard.verdict})`, text.includes('bank'));
}

// ── 4. deriveMissingDataNote ─────────────────────────────────────────────────
const completeCard = card({
  min_income_monthly: 30_000,
  annual_fee_recurring: 1_500,
  annual_fee_waiver_condition: 'Spend ₱250,000 a year',
  annual_fee_waiver_threshold: 250_000,
  foreign_transaction_fee_pct: 2.5,
  interest_rate_pct: 3.0,
  late_payment_fee_amount: 850,
  rewards_formula: { earn_unit: '1 point per ₱20' },
});
eq('complete card has no missing-data note', deriveMissingDataNote(completeCard), null);
check('sparse card returns a missing-data note', deriveMissingDataNote(card()) !== null);

// ── 5. isLimitedAcceptanceNetwork ────────────────────────────────────────────
check('JCB is a limited-acceptance network', isLimitedAcceptanceNetwork(card({ card_network: 'JCB' })));
check('Amex is a limited-acceptance network', isLimitedAcceptanceNetwork(card({ card_network: 'American Express' })));
check('Diners Club is a limited-acceptance network', isLimitedAcceptanceNetwork(card({ card_network: 'Diners Club International' })));
check('Visa is not limited', !isLimitedAcceptanceNetwork(card({ card_network: 'Visa' })));
check('null network is not limited', !isLimitedAcceptanceNetwork(card({ card_network: null })));

// ── 5b. normalizeRewardType (messy pipeline values → clean enum) ──────────────
eq('normalize clean cashback', normalizeRewardType('cashback'), 'cashback');
eq('normalize clean points', normalizeRewardType('points'), 'points');
eq('normalize clean miles', normalizeRewardType('miles'), 'miles');
eq('normalize verbose points label', normalizeRewardType('Points: AUB Rewards Points'), 'points');
eq('normalize membership rewards points', normalizeRewardType('Membership Rewards points'), 'points');
eq('normalize travel miles', normalizeRewardType('Travel Miles'), 'miles');
eq('normalize points_to_miles → miles', normalizeRewardType('points_to_miles'), 'miles');
eq('normalize rebate → cashback', normalizeRewardType('rebate'), 'cashback');
eq('normalize null', normalizeRewardType(null), null);
eq('normalize unknown → null', normalizeRewardType('loyalty stamps'), null);

// ── 6. deriveMainBenefit ─────────────────────────────────────────────────────
eq('cashback main benefit lead', deriveMainBenefit(card({ rewards_type: 'cashback' })).lead, 'Cash back.');
const pointsBenefit = deriveMainBenefit(card({ rewards_type: 'points' }));
eq('points main benefit lead', pointsBenefit.lead, 'Simple points.');
check('points main benefit avoids categories', pointsBenefit.body.includes('no categories'));
eq('miles main benefit lead', deriveMainBenefit(card({ rewards_type: 'miles' })).lead, 'Travel miles.');
eq('naffl no-rewards main benefit lead', deriveMainBenefit(card({ naffl: true })).lead, 'No yearly fee.');
eq('plain card main benefit lead', deriveMainBenefit(card()).lead, 'A basic card.');

// ── 7. deriveCatchList ───────────────────────────────────────────────────────
const jcbCatches = deriveCatchList(card({ card_network: 'JCB' }));
check('JCB catch leads the list', jcbCatches[0].includes('JCB') && jcbCatches[0].includes('Visa or Mastercard'));

const fxCatches = deriveCatchList(card({ badge_inputs: badgeInputs({ high_fx_fee: true }) }));
check('high-fx card surfaces a foreign-markup catch', fxCatches.some((c) => c.includes('foreign markup')));

const interestCatches = deriveCatchList(card({ interest_rate_pct: 3.5 }));
check('interest catch states the monthly rate', interestCatches.some((c) => c.includes('3.50% a month')));

const feeReturnCatches = deriveCatchList(card({ annual_fee_first_year: 0, annual_fee_recurring: 1_500 }));
check(
  'fee-returns catch is surfaced',
  feeReturnCatches.some((c) => c.includes('returns after the first year')),
);

const cleanCatches = deriveCatchList(card({ card_network: 'Visa' }));
eq('clean card returns a single reassuring catch line', cleanCatches.length, 1);
check('clean card catch is the no-major-catch fallback', cleanCatches[0].includes('No major catch'));

// ── 8. deriveFitLists ────────────────────────────────────────────────────────
const jcbFit = deriveFitLists(card({ card_network: 'JCB', rewards_type: 'points' }), answers(), false);
check(
  'JCB card warns about Visa/Mastercard-only checkouts',
  jcbFit.lookElsewhere.some((l) => l.includes('only accept Visa or Mastercard')),
);
check(
  'points card good-fit mentions simple rewards',
  jcbFit.goodFit.some((g) => g.includes('simple rewards without tracking categories')),
);
check(
  'points card look-elsewhere offers cashback alternative',
  jcbFit.lookElsewhere.some((l) => l.includes('straight cashback')),
);
check(
  'every fit list includes the pay-in-full reminder',
  jcbFit.goodFit.some((g) => g.includes('pay your balance in full')),
);
check('good-fit list is capped at 4', jcbFit.goodFit.length <= 4);
check('look-elsewhere list is capped at 4', jcbFit.lookElsewhere.length <= 4);

const cashbackFit = deriveFitLists(card({ rewards_type: 'cashback' }), answers(), false);
check(
  'cashback card look-elsewhere offers a miles alternative',
  cashbackFit.lookElsewhere.some((l) => l.includes('travel points or airline miles')),
);

// ── 9. deriveCostRows ────────────────────────────────────────────────────────
const fullCosts = deriveCostRows(completeCard);
check('complete card has no pending primary rows', fullCosts.primary.every((r) => !r.pending));
check('costs primary includes an annual fee row', fullCosts.primary.some((r) => r.label === 'Annual fee'));

const sparseCosts = deriveCostRows(card());
check(
  'sparse card marks the interest row pending',
  sparseCosts.primary.some((r) => r.label === 'Interest if unpaid' && r.pending),
);
check(
  'pending rows render the checking message',
  sparseCosts.primary.some((r) => r.pending && r.value.includes('Still being checked')),
);
check('costs table exposes long-tail fees', sparseCosts.more.length > 0);

// ── 10. deriveQuickTakeChips ─────────────────────────────────────────────────
const finderAnswers = answers({ first: 'yes', spend: 'online', priority: 'points', income: '100+' });
const likelyApproval = assessApproval(card({ min_income_monthly: 30_000 }), '100+');
const chips = deriveQuickTakeChips(finderAnswers, likelyApproval);
check('chips include first-card', chips.includes('First card'));
check('chips include the spend area', chips.includes('Online shopping'));
check('chips show a derived income status, not the raw bracket', chips.includes('Income above requirement'));
check('chips never echo the raw income bracket', !chips.some((c) => c.includes('100')));
check('chips are capped at 4', chips.length <= 4);

const tightApproval = assessApproval(card({ min_income_monthly: 80_000 }), '15-30');
check(
  'may-need-higher shows a tight income chip',
  deriveQuickTakeChips(answers({ income: '15-30' }), tightApproval).includes('Income may be tight'),
);
const unconfirmedChips = deriveQuickTakeChips(answers({ first: 'yes' }), assessApproval(card(), 'skip'));
check(
  'cannot-confirm shows no income chip',
  !unconfirmedChips.some((c) => c.toLowerCase().includes('income')),
);

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`\ncredit-card-detail: ${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error('FAILED:\n - ' + failures.join('\n - '));
  process.exit(1);
}
