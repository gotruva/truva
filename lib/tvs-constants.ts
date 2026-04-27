// True Value Score (TVS) — authoritative constants from methodology v1.0
// Source: docs/Truva_CreditCard_Methodology_v1.0.pdf
// Reviewed quarterly: Jan / Apr / Jul / Oct
// Last updated: April 2026

export const POINTS_VALUATION: Record<string, number> = {
  'getgo': 1.00,
  'mabuhay-premium': 1.50,
  'mabuhay-economy': 0.75,
  'bdo-peso-rewards': 1.00,
  'airasia-big': 0.65,
  'bpi-points-mabuhay': 0.75,
  'bpi-points-cash': 0.25,
  'unionbank-miles-turkish': 0.60,
  'unionbank-miles-cash': 0.22,
  'metrobank-mabuhay': 0.40,
  'metrobank-cash': 0.18,
  'hsbc-bonus-accelerator': 0.60,
  'hsbc-bonus-base': 0.12,
  'rcbc-preferred-airmiles': 0.40,
  'rcbc-standard': 0.08,
  'security-bank': 0.07,
  'aub-mabuhay': 0.09,
  'sm-advantage': 0.95,
  'cashback': 1.00,
};

export const WAIVER_PROBABILITY = {
  BELOW_240K: 0.95,
  BETWEEN_240K_360K: 0.65,
  BETWEEN_360K_600K: 0.30,
  FIXED_AF: 0.00,
  NAFFL: 1.00,
} as const;

export const INCOME_THRESHOLDS = {
  classic: 15_000,
  gold: 30_000,
  platinum: 83_000,
  signature: 166_000,
} as const;

// FX fee badge thresholds (%)
export const LOW_FX_THRESHOLD = 1.85;
export const HIGH_FX_THRESHOLD = 2.75;

// Lounge value per visit (PHP), capped at 4 visits/year for base tiers
export const LOUNGE_VALUE_PER_VISIT = 1_600;
export const LOUNGE_VISIT_CAP_BASE = 4;

// Claims friction factors by underwriter
export const CLAIMS_FRICTION: Record<string, number> = {
  'chubb': 0.85,   // HSBC, EastWest, PNB
  'aig': 0.75,
  'starr': 0.75,
  'default': 0.65,
};

// Annual fee waiver threshold bands (PHP/year)
export const WAIVER_BANDS = [
  { maxSpend: 240_000, probability: WAIVER_PROBABILITY.BELOW_240K },
  { maxSpend: 360_000, probability: WAIVER_PROBABILITY.BETWEEN_240K_360K },
  { maxSpend: 600_000, probability: WAIVER_PROBABILITY.BETWEEN_360K_600K },
] as const;

// Eight card-type rubric weights (pillar order matches TVS_PILLARS)
// Pillars: NPV, EEQ, FSS, PLF, WBA, PS, IES, AA
export const TVS_RUBRIC_WEIGHTS = {
  overall:   [0.30, 0.18, 0.15, 0.10, 0.10, 0.08, 0.05, 0.04],
  cashback:  [0.40, 0.25, 0.10, 0.08, 0.08, 0.03, 0.03, 0.03],
  travel:    [0.25, 0.18, 0.10, 0.08, 0.15, 0.18, 0.04, 0.02],
  grocery:   [0.40, 0.30, 0.10, 0.08, 0.05, 0.03, 0.02, 0.02],
  naffl:     [0.35, 0.20, 0.20, 0.08, 0.05, 0.05, 0.03, 0.04],
  beginner:  [0.20, 0.10, 0.20, 0.15, 0.15, 0.05, 0.03, 0.12],
  premium:   [0.20, 0.15, 0.08, 0.10, 0.12, 0.25, 0.08, 0.02],
  online:    [0.40, 0.30, 0.10, 0.08, 0.05, 0.03, 0.02, 0.02],
} as const;

export const TVS_PILLARS = [
  'NPV', 'EEQ', 'FSS', 'PLF', 'WBA', 'PS', 'IES', 'AA',
] as const;

export type TvsPillar = typeof TVS_PILLARS[number];
export type CardRubric = keyof typeof TVS_RUBRIC_WEIGHTS;

// Standard Filipino Spending Profiles (PHP/month)
export const SPENDING_PROFILES = {
  A: {
    label: 'Young Professional',
    monthlyTotal: 20_000,
    categories: {
      groceries: 5_000,
      dining: 3_000,
      onlineShopping: 2_500,
      onlineShoppingOverseas: 500,
      fuel: 2_000,
      utilities: 2_000,
      digitalSubscriptions: 500,
      travel: 2_000,
      retail: 1_500,
      other: 1_000,
    },
  },
  B: {
    label: 'Premium Spender',
    monthlyTotal: 50_000,
    categories: {
      groceries: 12_500,
      dining: 7_500,
      onlineShopping: 6_250,
      onlineShoppingOverseas: 1_250,
      fuel: 5_000,
      utilities: 5_000,
      digitalSubscriptions: 1_250,
      travel: 10_000,
      retail: 3_750,
      other: 2_500,
    },
  },
  C: {
    label: 'OFW / Frequent Traveler',
    monthlyTotal: 30_000,
    overseasPct: 0.40,
  },
  D: {
    label: 'Homebody',
    monthlyTotal: 15_000,
    categories: {
      groceries: 6_000,
      utilities: 3_000,
      fuel: 1_500,
      dining: 1_500,
      other: 3_000,
    },
  },
} as const;

export type SpendingProfileId = keyof typeof SPENDING_PROFILES;
