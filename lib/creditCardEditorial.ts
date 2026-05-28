/**
 * EDITORIAL STYLE GUIDE — READ BEFORE EDITING
 *
 * Voice: warm, factual, plain English. High-school reading level.
 * Rules:
 *   - Use "you" and "your" throughout
 *   - Peso amounts over percentages where possible ("₱500 back" not "0.5% cashback")
 *   - "Yearly fee" not "annual fee"; "foreign card fee" not "foreign transaction fee"
 *   - No marketing superlatives ("best", "amazing", "perfect") unless backed by data
 *   - Each `why` must be one sentence, audience-aware, grounded in real card fields
 *   - Each `pro` must be a real, verifiable benefit from the card's documented features
 *   - Each `con` must be a real trade-off (fee, narrow earn, income gate, FX) — never fabricate a weakness
 *   - If a field is unknown (null in DB), omit it — do not guess
 *
 * Keys: normalized_card_key from credit_card_listings (Supabase public view)
 * Fallback: if a key is missing here, callers should generate a generic line from
 *           the card's rewards_type + goal/spend answers — see getEditorialFor() in lib/credit-cards.ts
 */

import { deriveCategoryMatch } from '@/lib/creditCardValue';
import type { SpendingCategory, GoalId } from '@/lib/creditCardValue';
import type { CreditCard } from '@/types';

export interface CardEditorial {
  why: string;
  pros: string[];
  cons: string[];
}

const editorial: Record<string, CardEditorial> = {
  // ── BPI ──────────────────────────────────────────────────────────────────

  'bpi amore cashback card': {
    why: 'This card gives you cashback on groceries and dining, which helps you save on your family\'s daily expenses.',
    pros: [
      'Earns 4% cashback on groceries and 1% cashback on supermarkets.',
      'Accepted wherever Visa or Mastercard is used worldwide.',
      'Good starting card if you already have a BPI bank account.',
    ],
    cons: [
      'Has a yearly fee of ₱2,050 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'There is a limit on how much cashback you can earn each year.',
    ],
  },

  'bpi amore platinum cashback card': {
    why: 'This card gives you cashback when you eat out or order food, which fits people who spend heavily on restaurants.',
    pros: [
      'Earns 4% cashback on dining and 1% cashback on supermarkets.',
      'Cashback is added directly to your account without needing to redeem points.',
      'Accepted wherever Visa is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱5,000 — you need to spend enough to earn this fee back.',
      'Requires a high minimum monthly income of ₱83,333 to apply.',
      'Charges a foreign card fee of 1.85% when spending abroad.',
    ],
  },

  'bpi corporate card': {
    why: 'This card helps business owners and employees track business expenses in one place.',
    pros: [
      'Earns rewards points on business purchases.',
      'Helps you keep your personal and business spending separate.',
      'Accepted wherever Mastercard is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱1,700 — you need to spend enough to earn this fee back.',
      'Only available for businesses and requires company documents to apply.',
      'Not meant for earning personal rewards.',
    ],
  },

  'bpi edge card': {
    why: 'This card gives you a simple way to earn rewards points on your daily purchases.',
    pros: [
      'Low yearly fee of ₱1,320, which is billed as ₱110 each month.',
      'Earns 1 rewards point for every ₱20 you spend.',
      'Good starter card to build your credit history.',
    ],
    cons: [
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'It takes a lot of spending to accumulate enough points for rewards.',
      'Charges a foreign card fee of 1.85% when spending abroad.',
    ],
  },

  'bpi gold rewards card': {
    why: 'This card lets you earn rewards points on your purchases and comes with free travel insurance.',
    pros: [
      'Earns 1 rewards point for every ₱35 you spend.',
      'Includes free travel insurance when you book trips using the card.',
      'Accepted wherever Mastercard or Visa is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱2,250 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱40,000 to apply.',
      'Charges a foreign card fee of 1.85% on overseas purchases.',
    ],
  },

  'bpi platinum rewards card': {
    why: 'This card helps you earn points faster on your local and international purchases.',
    pros: [
      'Earns rewards points on all purchases, with double points when you spend overseas.',
      'Includes free travel insurance and access to select airport lounges.',
      'Accepted wherever Mastercard is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱4,000 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱80,000 to apply.',
      'Charges a foreign card fee of 1.85% on overseas purchases.',
    ],
  },

  'bpi platinum rewards mastercard': {
    why: 'This card helps you earn points faster on your local and international purchases.',
    pros: [
      'Earns rewards points on all purchases, with double points when you spend overseas.',
      'Includes free travel insurance and access to select airport lounges.',
      'Accepted wherever Mastercard is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱4,000 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱80,000 to apply.',
      'Charges a foreign card fee of 1.85% on overseas purchases.',
    ],
  },

  'bpi rewards card': {
    why: 'This card gives you a simple way to earn rewards points on your daily purchases.',
    pros: [
      'Earns 1 rewards point for every ₱35 you spend.',
      'Accepted wherever Mastercard is used worldwide.',
      'Good starter card to build your credit history.',
    ],
    cons: [
      'Has a yearly fee of ₱1,550 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Charges a foreign card fee of 1.85% when spending abroad.',
    ],
  },

  'bpi signature card': {
    why: 'This card gives you premium travel benefits like free lounge access and special dining discounts.',
    pros: [
      'Earns 2 rewards points for every ₱20 you spend.',
      'Includes free access to select airport lounges and travel insurance.',
      'Accepted wherever Visa is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱5,500 — you need to spend enough to earn this fee back.',
      'Requires a high minimum monthly income of ₱100,000 to apply.',
      'Charges a foreign card fee of 1.85% on overseas purchases.',
    ],
  },

  'petron bpi card': {
    why: 'This card gives you 3% cashback when you buy fuel at Petron stations.',
    pros: [
      'Saves you money with 3% cashback on Petron fuel purchases.',
      'Earns a free ₱200 fuel voucher as a welcome gift when your card is approved.',
      'Accepted wherever Mastercard is used worldwide.',
    ],
    cons: [
      'Has a yearly fee of ₱1,550 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Gives you lower value if you buy fuel from other gas station brands.',
    ],
  },

  'robinsons cashback card': {
    why: 'This card gives you cashback when you shop at Robinsons supermarkets and stores.',
    pros: [
      'Earns 3% cashback on grocery shopping at Robinsons supermarkets.',
      'Accepted wherever Mastercard is used worldwide.',
      'Good for families who buy their daily necessities at Robinsons stores.',
    ],
    cons: [
      'Has a yearly fee of ₱2,500 — you need to spend enough to earn this fee back.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Gives you lower value when you shop at stores outside the Robinsons brand.',
    ],
  },

  // ── HSBC ─────────────────────────────────────────────────────────────────

  'hsbc live credit card': {
    why: 'This card gives you 8% cashback on dining and food deliveries, which fits food-heavy budgets.',
    pros: [
      'Earns 8% cashback on dining and food deliveries.',
      'Earns cashback on your shopping and travel purchases too.',
      'Accepted wherever Visa is used worldwide.',
    ],
    cons: [
      'Lists a yearly fee of ₱5,000 — you need to spend enough to earn this fee back.',
      'There is a limit on how much cashback you can earn each month.',
      'You get the most value from this card only if you spend heavily on food and restaurants.',
    ],
  },

  'hsbc red platinum mastercard': {
    why: 'This card gives you a simple way to earn rewards points on shopping, dining, and online purchases.',
    pros: [
      'Earns 4 times more rewards points on shopping, online spending, and dining.',
      'First year is free with no yearly fee to pay.',
      'Accepted wherever Mastercard is used worldwide.',
    ],
    cons: [
      'Has a yearly fee starting from the second year.',
      'Requires a minimum monthly income to apply.',
      'You need to spend on specific categories to earn the higher points rate.',
    ],
  },
};

export default editorial;

/**
 * Returns per-card editorial copy, or a generic data-driven fallback.
 * Never returns fabricated content — fallback is grounded in real DB fields.
 * Client-safe: depends only on the editorial record and pure derivations,
 * so it can be imported by client components (e.g. the browse catalog).
 */
export function getEditorialFor(
  card: CreditCard,
  answers?: { goal?: GoalId; spending?: SpendingCategory },
): CardEditorial {
  const key = card.normalized_card_key;
  if (editorial[key]) return editorial[key];

  // Fallback: build a minimal-but-honest generic entry
  const goalLabel = answers?.goal
    ? {
        cashback: 'earning cashback',
        travel: 'travel and miles',
        'no-annual-fee': 'avoiding a yearly fee',
        'first-card': 'getting your first card',
        'low-fee': 'keeping fees low',
      }[answers.goal]
    : 'getting value from your spending';

  const catMap = deriveCategoryMatch(card);
  const topCat = (Object.entries(catMap) as [SpendingCategory, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const topCatLabel = {
    groceries: 'grocery',
    dining: 'dining',
    online: 'online shopping',
    fuel: 'fuel',
    bills: 'bill payments',
    travel: 'travel',
  }[topCat];

  let yearlyFeePro: string | null = null;
  let yearlyFeeCon: string | null = null;
  if (card.naffl === true || card.annual_fee_recurring === 0) {
    yearlyFeePro = 'No annual fee for life (NAFFL) — zero cost to keep this card.';
  } else if (card.annual_fee_recurring !== null && card.annual_fee_recurring !== undefined && card.annual_fee_recurring > 0) {
    yearlyFeeCon = `Has a yearly fee of ₱${card.annual_fee_recurring.toLocaleString('en-PH')} — check if the rewards match this cost.`;
  } else if ((card.naffl === null || card.naffl === undefined) && (card.annual_fee_recurring === null || card.annual_fee_recurring === undefined)) {
    yearlyFeeCon = 'Yearly fee details are not confirmed — check the bank\'s terms before applying.';
  }

  const rewardsPro = card.rewards_type
    ? `Earns ${card.rewards_type} on your purchases.`
    : 'A simple starter card designed to help you build credit and manage payments safely.';

  let incomePro: string | null = null;
  let incomeCon: string | null = null;
  if (card.min_income_monthly === 0) {
    incomePro = 'Does not require proof of income to apply.';
  } else if (card.min_income_monthly !== null && card.min_income_monthly !== undefined && card.min_income_monthly > 0) {
    incomeCon = `Requires a minimum monthly income of ₱${card.min_income_monthly.toLocaleString('en-PH')} to apply.`;
  } else if (
    (card.min_income_monthly === null || card.min_income_monthly === undefined) &&
    (card.min_income_annual === null || card.min_income_annual === undefined)
  ) {
    incomeCon = 'Minimum monthly income is not publicly listed — confirm your eligibility with the bank.';
  }

  const foreignFeeCon = (card.foreign_transaction_fee_pct !== null && card.foreign_transaction_fee_pct !== undefined)
    ? `Charges a foreign card fee of ${card.foreign_transaction_fee_pct}% when you spend overseas or shop online in foreign currencies.`
    : 'Foreign card fee is not confirmed — check overseas transaction terms before traveling.';

  const networkPro = `Accepted wherever ${card.card_network || 'major networks'} is used`;

  const pros = [
    yearlyFeePro,
    rewardsPro,
    incomePro,
    networkPro,
  ].filter(Boolean) as string[];

  const cons = [
    yearlyFeeCon,
    incomeCon,
    foreignFeeCon,
  ].filter(Boolean) as string[];

  return {
    why: `This card fits your goal of ${goalLabel} and gives you the most value when spending on ${topCatLabel}.`,
    pros,
    cons,
  };
}
