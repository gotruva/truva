/**
 * Unit tests for lib/creditCardFinder/rank.ts
 *
 * Repo has no jest/vitest; scripts run via `tsx` (see package.json).
 * Run: `npm run test:finder`. Exits non-zero on first failure.
 */

import type { CreditCard } from '@/types';
import type { CardEditorial } from '@/lib/creditCardEditorial';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import { EMPTY_ANSWERS } from '@/lib/creditCardFinder/questions';
import { CONFIDENCE_LABELS } from '@/lib/creditCardFinder/copy';
import { explainFinderResult } from '@/lib/creditCardFinder/explain';
import { estimateAnnualValue } from '@/lib/creditCardValue';
import {
  answersToQuery,
  buildScoredCard,
  deriveAnnualFeeLabel,
  incomeBracketMin,
  incomeBracketMax,
  deriveTags,
  deriveDataConfidence,
  hasNoYearlyFeeConflict,
  isNoYearlyFee,
  scoreFinderCard,
  selectFinderResults,
  parseFinderAnswers,
} from '@/lib/creditCardFinder/rank';

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
const OLD = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

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

// ── 1. Income bracket mapping ────────────────────────────────────────────────
eq('incomeBracketMin <15', incomeBracketMin('<15'), 0);
eq('incomeBracketMin 15-30', incomeBracketMin('15-30'), 15_000);
eq('incomeBracketMin 30-50', incomeBracketMin('30-50'), 30_000);
eq('incomeBracketMin 50-100', incomeBracketMin('50-100'), 50_000);
eq('incomeBracketMin 100+', incomeBracketMin('100+'), 100_000);
eq('incomeBracketMin skip', incomeBracketMin('skip'), null);
eq('incomeBracketMin null', incomeBracketMin(null), null);

eq('incomeBracketMax <15', incomeBracketMax('<15'), 15_000);
eq('incomeBracketMax 15-30', incomeBracketMax('15-30'), 30_000);
eq('incomeBracketMax 30-50', incomeBracketMax('30-50'), 50_000);
eq('incomeBracketMax 50-100', incomeBracketMax('50-100'), 100_000);
eq('incomeBracketMax 100+', incomeBracketMax('100+'), Infinity);
eq('incomeBracketMax skip', incomeBracketMax('skip'), null);
eq('incomeBracketMax null', incomeBracketMax(null), null);

// ── 2. Tag derivation ────────────────────────────────────────────────────────
const naffl = card({ naffl: true });
check('naffl card tagged naffl', deriveTags(naffl).includes('naffl'));
check('naffl card tagged beginner', deriveTags(naffl).includes('beginner'));
check(
  'cashback card tagged cashback',
  deriveTags(card({ rewards_type: 'cashback' })).includes('cashback'),
);
check(
  'miles card tagged travel',
  deriveTags(card({ rewards_type: 'miles' })).includes('travel'),
);
check(
  'low income tagged low-income',
  deriveTags(card({ min_income_monthly: 15_000 })).includes('low-income'),
);
check(
  'high fx tagged high-forex',
  deriveTags(card({ foreign_transaction_fee_pct: 3.0 })).includes('high-forex'),
);
check(
  'promo-heavy from active_promo_count',
  deriveTags(card({ active_promo_count: 4 })).includes('promo-heavy'),
);

// ── 3. Data confidence ───────────────────────────────────────────────────────
eq(
  'confidence: full + fresh → Source checked',
  deriveDataConfidence(
    card({ naffl: true, min_income_monthly: 25_000, rewards_type: 'cashback', last_scraped_at: RECENT }),
  ),
  CONFIDENCE_LABELS.sourceChecked,
);
eq(
  'confidence: nothing → Not clearly published',
  deriveDataConfidence(card({ naffl: null, last_scraped_at: RECENT })),
  CONFIDENCE_LABELS.notPublished,
);
eq(
  'confidence: full but stale → Needs checking',
  deriveDataConfidence(
    card({ naffl: true, min_income_monthly: 25_000, rewards_type: 'points', last_scraped_at: OLD }),
  ),
  CONFIDENCE_LABELS.needsChecking,
);
eq(
  'confidence: partial + fresh → Bank requirements may vary',
  deriveDataConfidence(card({ rewards_type: 'cashback', last_scraped_at: RECENT })),
  CONFIDENCE_LABELS.mayVary,
);

// ── 4. Score clamping ────────────────────────────────────────────────────────
const ineligible = scoreFinderCard(
  card({ min_income_monthly: 80_000 }),
  answers({ income: '<15' }),
);
check('ineligible score clamped >= 0', ineligible >= 0);
check('hard shortfall score is 0 due to heavy penalty', ineligible === 0);

const hardShortfallEligibleSignals = scoreFinderCard(
  card({
    naffl: true,
    rewards_type: 'cashback',
    min_income_monthly: 100_000,
    last_scraped_at: RECENT,
  }),
  answers({ first: 'yes', income: '<15', priority: 'naf', spend: 'groceries' }),
);
check('hard shortfall fails match threshold even with otherwise perfect signals', hardShortfallEligibleSignals < 0.35);
const stacked = scoreFinderCard(
  card({
    naffl: true,
    rewards_type: 'cashback',
    min_income_monthly: 15_000,
    last_scraped_at: RECENT,
  }),
  answers({ first: 'yes', income: '100+', priority: 'naf', spend: 'general' }),
);
check('stacked score clamped <= 1', stacked <= 1);
check('eligible relevant card scores above threshold', stacked >= 0.55);

const noRewardsValue = estimateAnnualValue(
  card({
    rewards_type: null,
    rewards_formula: { earn_rate: 0, earn_unit: 'No rewards program listed by the bank' },
    annual_fee_recurring: 1_000,
  }),
  30_000,
  'groceries',
);
eq('no-rewards card does not fabricate gross rewards', noRewardsValue.grossRewards, 0);

const explicitCashbackValue = estimateAnnualValue(
  card({
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 5, earn_unit: 'percent rebate on groceries' },
    annual_fee_recurring: 0,
  }),
  30_000,
  'groceries',
);
check('explicit percent earn rate feeds value estimate', explicitCashbackValue.grossRewards > 0);

const nearMissIncome = scoreFinderCard(
  card({
    naffl: true,
    rewards_type: 'cashback',
    rewards_formula: { bonus: 'cashback on groceries' },
    min_income_monthly: 33_000,
    last_scraped_at: RECENT,
  }),
  answers({ first: 'yes', income: '30-50', priority: 'cashback', spend: 'groceries' }),
);
check('near-miss income still qualifies when other signals are strong', nearMissIncome >= 0.35);

// ── 4b. First-card branch: "helping" is treated like a first-timer (A3) ───────
const helpingBeginnerScore = scoreFinderCard(
  card({ naffl: true, min_income_monthly: 15_000, last_scraped_at: RECENT }),
  answers({ first: 'helping', income: '100+' }),
);
const noFirstBeginnerScore = scoreFinderCard(
  card({ naffl: true, min_income_monthly: 15_000, last_scraped_at: RECENT }),
  answers({ first: 'no', income: '100+' }),
);
const yesBeginnerScore = scoreFinderCard(
  card({ naffl: true, min_income_monthly: 15_000, last_scraped_at: RECENT }),
  answers({ first: 'yes', income: '100+' }),
);
check('helping gets the first-card beginner boost', helpingBeginnerScore > noFirstBeginnerScore);
eq('helping and yes score the same first-card boost', helpingBeginnerScore, yesBeginnerScore);

// ── 5. Slot selection ────────────────────────────────────────────────────────
const strong = card({
  id: 'strong',
  rewards_type: 'cashback',
  annual_fee_recurring: 3500,
  min_income_monthly: 20_000,
  last_scraped_at: RECENT,
});
const freeCard = card({
  id: 'free',
  naffl: true,
  rewards_type: 'cashback',
  min_income_monthly: 20_000,
  last_scraped_at: RECENT,
});
const third = card({
  id: 'third',
  rewards_type: 'cashback',
  annual_fee_recurring: 1500,
  min_income_monthly: 20_000,
  last_scraped_at: RECENT,
});
const sel = selectFinderResults(
  [strong, freeCard, third],
  answers({ income: '50-100', priority: 'cashback', spend: 'groceries', first: 'no' }),
);
check('matched kind', sel.kind === 'matched');
if (sel.kind === 'matched') {
  check('max 3 sections', sel.sections.length <= 3);
  check(
    'slot 2 is a no-yearly-fee card',
    sel.sections.length >= 2 && sel.sections[1].card.id === 'free',
  );
}

// ── 6. Fallback ──────────────────────────────────────────────────────────────
const noneQualify = selectFinderResults(
  [card({ min_income_monthly: 200_000 })],
  answers({ income: '<15' }),
);
eq('no qualifying → fallback', noneQualify.kind, 'fallback');

const onlyOne = selectFinderResults(
  [
    card({
      id: 'lonely',
      naffl: true,
      rewards_type: 'cashback',
      min_income_monthly: 15_000,
      last_scraped_at: RECENT,
    }),
  ],
  answers({ income: '100+', priority: 'naf', first: 'yes' }),
);
check('single qualifying card → matched', onlyOne.kind === 'matched');
if (onlyOne.kind === 'matched') {
  eq('single qualifying card returns one section', onlyOne.sections.length, 1);
}

const suppressed = selectFinderResults(
  [
    card({
      id: 'suppressed',
      naffl: true,
      rewards_type: 'cashback',
      min_income_monthly: 15_000,
      score_ready: false,
      score_suppressed_reason: 'Incomplete methodology capture',
      last_scraped_at: RECENT,
    }),
  ],
  answers({ income: '100+', priority: 'naf', first: 'yes' }),
);
eq('score-suppressed card → fallback', suppressed.kind, 'fallback');

// ── 7. parseFinderAnswers validation ─────────────────────────────────────────
const parsed = parseFinderAnswers(
  new URLSearchParams('first=yes&income=bogus&priority=naf'),
);
eq('parse keeps valid first', parsed.first, 'yes');
eq('parse rejects invalid income', parsed.income, null);
eq('parse keeps valid priority', parsed.priority, 'naf');

// ── Report ───────────────────────────────────────────────────────────────────
// -- 8. Contextual explanations ---------------------------------------------
const emptyEditorial: CardEditorial = { why: '', pros: [], cons: [] };
const explainAnswers = answers({
  first: 'yes',
  income: '30-50',
  spend: 'groceries',
  priority: 'cashback',
  avoid: 'fees',
});
const explainCard = card({
  id: 'explain-card',
  naffl: true,
  rewards_type: 'cashback',
  rewards_formula: { bonus: 'cashback on groceries' },
  min_income_monthly: 20_000,
});
const explainScored = buildScoredCard(explainCard, explainAnswers);
const whyFirst = explainFinderResult(
  { ...explainScored, role: 'first' },
  explainAnswers,
  emptyEditorial,
).why;
const whyNoFee = explainFinderResult(
  { ...explainScored, role: 'no-fee' },
  explainAnswers,
  emptyEditorial,
).why;
const whyWorth = explainFinderResult(
  { ...explainScored, role: 'worth' },
  explainAnswers,
  emptyEditorial,
).why;
eq('role-specific why copy differs', new Set([whyFirst, whyNoFee, whyWorth]).size, 3);
check('why references answer signals', /cashback|grocery/.test(whyFirst));

const feeAnswers = answers({ avoid: 'fees' });
const feeWatch = explainFinderResult(
  {
    ...buildScoredCard(card({ annual_fee_recurring: 5_000 }), feeAnswers),
    role: 'first',
  },
  feeAnswers,
  emptyEditorial,
).watchOut;
check('avoid fees picks fee watch-out', feeWatch.includes('yearly fees') && feeWatch.includes('PHP 5,000'));

const forexAnswers = answers({ avoid: 'forex' });
const forexWatch = explainFinderResult(
  {
    ...buildScoredCard(
      card({
        badge_inputs: badgeInputs({ high_fx_fee: true }),
        foreign_transaction_fee_pct: 3,
      }),
      forexAnswers,
    ),
    role: 'first',
  },
  forexAnswers,
  emptyEditorial,
).watchOut;
check('avoid forex picks foreign-fee watch-out', forexWatch.includes('foreign card fees'));

const complexAnswers = answers({ avoid: 'complex' });
const complexWatch = explainFinderResult(
  {
    ...buildScoredCard(card({ rewards_type: 'points' }), complexAnswers),
    role: 'worth',
  },
  complexAnswers,
  emptyEditorial,
).watchOut;
check('avoid complex picks rewards-complexity watch-out', complexWatch.includes('simpler rewards'));

const fallbackExplanation = explainFinderResult(
  { ...buildScoredCard(card(), EMPTY_ANSWERS), role: 'worth' },
  EMPTY_ANSWERS,
  emptyEditorial,
);
check('missing answers use honest why fallback', fallbackExplanation.why.includes('available card details'));
check('missing answers use honest watch-out fallback', fallbackExplanation.watchOut.includes('not clearly published'));

const conflictCard = card({
  naffl: true,
  annual_fee_recurring: 1_550,
  badge_inputs: badgeInputs({ true_naffl: true }),
});
eq('fee conflict detected', hasNoYearlyFeeConflict(conflictCard), true);
eq('fee conflict is not treated as no-fee', isNoYearlyFee(conflictCard), false);
check(
  'fee conflict label avoids no-fee claim',
  !deriveAnnualFeeLabel(conflictCard).toLowerCase().includes('no yearly fee'),
);
const conflictExplanation = explainFinderResult(
  { ...buildScoredCard(conflictCard, feeAnswers), role: 'first' },
  feeAnswers,
  emptyEditorial,
);
check(
  'fee conflict why avoids no-fee claim',
  !conflictExplanation.why.toLowerCase().includes('no-yearly-fee') &&
    !conflictExplanation.why.toLowerCase().includes('no yearly fee'),
);
check('fee conflict watch-out calls out mixed data', conflictExplanation.watchOut.includes('mixed fee data'));

const resultBackQuery = answersToQuery(
  answers({
    first: 'yes',
    income: '30-50',
    spend: 'groceries',
    priority: 'cashback',
    avoid: 'fees',
  }),
);
eq(
  'answersToQuery preserves result state for back links',
  resultBackQuery,
  'first=yes&income=30-50&spend=groceries&priority=cashback&avoid=fees',
);

console.log(`\ncredit-card-finder: ${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error('FAILED:\n - ' + failures.join('\n - '));
  process.exit(1);
}
