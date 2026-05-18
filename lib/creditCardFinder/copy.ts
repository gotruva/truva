/**
 * Locked user-facing copy for the credit-card finder — Direction B (final).
 * Single source of truth. Do not paraphrase in components.
 *
 * Wording rules enforced here:
 *  - Prefer "yearly fee"; "(annual fee)" only as a parenthetical.
 *  - Allowed: "approval", "bank approval is still required".
 *  - Never: "approved", "guaranteed", "perfect card", "best card ever".
 *  - Prefer: "may fit", "worth checking", "based on your answers".
 *  - Missing data: "Check bank terms" / "Bank requirements may vary".
 */

export const LANDING = {
  eyebrow: 'Credit-card finder · about 2 min',
  h1: 'Find the best credit card for your lifestyle',
  sub: 'Answer a few simple questions. Truva will show cards that may fit your income, spending, and goals — with fees and catches explained before you apply.',
  primaryCta: 'Start card finder',
  secondaryCta: 'Browse all cards',
  resumeCta: 'Resume your finder',
  trustHeading: 'How Truva helps',
  trust: [
    {
      title: 'Plain-English comparisons',
      body: 'No jargon. We explain rewards, fees, and interest in normal words.',
    },
    {
      title: 'Catches shown up front',
      body: 'Yearly fees, conditions, and watch-outs before you tap Apply.',
    },
    {
      title: 'No pressure to apply',
      body: 'Truva is free. We may earn a fee from banks, but it doesn’t change our picks.',
    },
  ],
} as const;

export const REASSURANCE =
  'This is not a credit-card application. Your answers won’t affect your credit score.';

export const MATCHING = {
  h2: 'Finding cards that may fit your life',
  sub: 'We’re checking the catalog against your answers. Usually a couple of seconds.',
  checkoffs: [
    'Matching income requirements',
    'Checking yearly fees',
    'Looking for useful rewards',
    'Flagging things to watch out for',
  ],
} as const;

export const RESULTS = {
  h1: 'Here are cards that may fit you',
  sub: 'These matches are based on your answers and available card details. Bank approval is still required.',
  sections: [
    { label: 'Best first pick', sub: 'Closest fit to your answers' },
    { label: 'Best no-yearly-fee pick', sub: 'If you want to keep it free' },
    { label: 'Worth checking', sub: 'Higher rewards, more conditions' },
  ],
  fitLabels: ['Closest fit', 'Good fit', 'Worth checking'] as const,
  blockLabels: {
    why: 'Why this may fit you',
    yearlyFee: 'Yearly fee',
    minIncome: 'Min. income',
    bestFor: 'Best for',
    watchOut: 'What to watch out for',
  },
  ctaDetails: 'See details',
  ctaApply: 'Apply on bank site',
  browseHeading: 'Want to compare more?',
  browseSub: 'Open the full catalog with filters for yearly fee, rewards, and bank.',
  browseCta: 'Browse all credit cards',
  notAdvice: 'This is not financial advice.',
} as const;

export const CONFIDENCE_LABELS = {
  sourceChecked: 'Source checked',
  mayVary: 'Bank requirements may vary',
  notPublished: 'Not clearly published by bank',
  needsChecking: 'Needs checking',
} as const;

export type ConfidenceLabel =
  (typeof CONFIDENCE_LABELS)[keyof typeof CONFIDENCE_LABELS];

export const FALLBACK = {
  eyebrow: 'No strong match yet',
  h2: 'We don’t want to force a bad recommendation.',
  sub: 'Based on what you told us, no card in our catalog clearly fits all your answers. Try adjusting your answers or browse beginner-friendly cards.',
  optionsHeading: 'What you can do',
  options: [
    {
      title: 'Adjust your answers',
      body: 'Often a small tweak — like picking a different priority — opens up more cards.',
      cta: 'Edit my answers',
    },
    {
      title: 'See beginner-friendly cards',
      body: 'Cards with no yearly fee or lower income requirements. Good starting points.',
      cta: 'Show me beginner cards',
    },
    {
      title: 'Learn before you choose',
      body: 'Our short guide explains how Filipino credit cards actually work.',
      cta: 'Read the guide',
    },
  ],
  whyThisHappens:
    'Some banks don’t clearly publish their income or fee details. We’d rather say so than guess.',
} as const;

export const DETAIL = {
  youToldUs: 'You told us',
  sections: {
    why: 'Why this card may fit you',
    bestFor: 'What it’s best for',
    watchOut: 'What to watch out for',
    rewards: 'Rewards in simple words',
    fees: 'Fees to know',
    requirements: 'Requirements to check',
    confidence: 'Data confidence',
  },
  stickyCtaPrefix: 'Apply on', // "Apply on {Bank} site"
  stickyCtaSuffix: 'site',
} as const;

/** Affiliate disclosure — the single canonical wording. */
export const AFFILIATE_DISCLOSURE = {
  compact:
    'Truva may earn a fee if you apply through a partner link. This does not change your terms or our picks. Banks make the final approval decision.',
  cardLead: 'How we pay our bills:',
  cardBody:
    'Truva may earn a fee if you apply through a partner link. This does not change your terms or our picks. Banks make the final approval decision.',
  footer:
    'This is not financial advice. Truva may earn a fee if you apply through a partner link. This does not change our picks. Banks make the final approval decision.',
} as const;

/** Plain-language summary chips for the "You told us" rail. */
export const ANSWER_CHIP_LABELS: Record<string, string> = {
  // first
  yes: 'First card',
  no: 'Has a card',
  helping: 'Helping someone',
  // income
  '<15': 'Below ₱15K/mo',
  '15-30': '₱15K–₱30K/mo',
  '30-50': '₱30K–₱50K/mo',
  '50-100': '₱50K–₱100K/mo',
  '100+': '₱100K+/mo',
  skip: 'Income not shared',
  // spend
  groceries: 'Groceries',
  dining: 'Dining',
  online: 'Online shopping',
  bills: 'Bills',
  travel: 'Travel',
  general: 'General spending',
  unsure: 'Not sure',
  // priority
  naf: 'No yearly fee',
  cashback: 'Cashback',
  points: 'Rewards / points',
  easy: 'Beginner-friendly',
  simple: 'Simple card',
  // avoid
  fees: 'Avoid yearly fees',
  income: 'Avoid high income req.',
  complex: 'Avoid complex rewards',
  promo: 'Avoid promo-only value',
  forex: 'Avoid foreign fees',
};

export const CHIP_QUESTION_LABELS: Record<string, string> = {
  first: 'First card',
  income: 'Income',
  spend: 'Spends most on',
  priority: 'Priority',
  avoid: 'Avoid',
};
