/**
 * Unit tests for lib/creditCardFinder/rank.ts
 *
 * Repo has no jest/vitest; scripts run via `tsx` (see package.json).
 * Run: `npm run test:finder`. Exits non-zero on first failure.
 */

import type { CreditCard } from '@/types';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import { EMPTY_ANSWERS } from '@/lib/creditCardFinder/questions';
import { CONFIDENCE_LABELS } from '@/lib/creditCardFinder/copy';
import {
  incomeBracketMin,
  deriveTags,
  deriveDataConfidence,
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
    methodology_ready: false,
    income_filter_ready: false,
    score_ready: false,
    score_suppressed_reason: null,
    methodology_capture_score: null,
    badge_inputs: null,
    active_promo_count: 0,
    source_url: 'https://bank.example/apply',
    last_scraped_at: RECENT,
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
eq('single qualifying card → fallback (need >= 2)', onlyOne.kind, 'fallback');

// ── 7. parseFinderAnswers validation ─────────────────────────────────────────
const parsed = parseFinderAnswers(
  new URLSearchParams('first=yes&income=bogus&priority=naf'),
);
eq('parse keeps valid first', parsed.first, 'yes');
eq('parse rejects invalid income', parsed.income, null);
eq('parse keeps valid priority', parsed.priority, 'naf');

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`\ncredit-card-finder: ${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error('FAILED:\n - ' + failures.join('\n - '));
  process.exit(1);
}
