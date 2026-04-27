export type RiskLevel = 'Low' | 'Medium' | 'DeFi';
export type FilterCategory = 'all' | 'banks' | 'govt' | 'uitfs' | 'defi' | 'credit-cards';
export type LiquidityFilter = 'all' | 'liquid' | 'locked';
export type PayoutFilter = 'all' | 'monthly' | 'at_maturity';

export interface ComparisonState {
  amount: number;
  months: number;
  liquidityFilter: LiquidityFilter;
  payoutFilter: PayoutFilter;
  includePdicOnly: boolean;
}

/** A single rate tier with balance bounds */
export interface RateTier {
  minBalance: number;        // ₱0 for first tier
  maxBalance: number | null; // null = unlimited
  grossRate: number;         // e.g. 0.15 for 15%
  afterTaxRate: number;      // grossRate * 0.80 (or grossRate if taxExempt)
}

/** A condition that must be met for a tier to apply */
export interface RateCondition {
  type: 'spending' | 'promo' | 'balance_growth' | 'new_user' | 'none' | 'time_limited';
  description: string;
  expiresAt?: string | null;        // ISO date for promo expiry, null = permanent
  requiredMonthlySpend?: number;    // e.g. 500 for Maya
}

export interface ProductLimit {
  maxDepositPerProduct?: number;    // e.g. 250000 for ₱250k max per time deposit
  maxProductsPerUser?: number;      // e.g. 5 for max 5 time deposits per user
}

export interface RateProduct {
  id: string;
  name: string;
  provider: string;
  logo: string;                     // path to /public/logos/
  category: FilterCategory;

  // --- Tiered rate system ---
  headlineRate: number;             // the rate the bank advertises (gross), e.g. 0.15
  baseRate: {                       // guaranteed rate with NO conditions met
    grossRate: number;
    afterTaxRate: number;
  };
  tierType: 'flat' | 'blended' | 'threshold'; // flat = one rate, blended = each band earns independently, threshold = whole balance earns bracket rate
  tiers: RateTier[];                // ordered from lowest to highest balance
  conditions: RateCondition[];      // conditions to unlock higher tiers
  taxExempt: boolean;

  // --- Payout schedule ---
  payoutFrequency: 'daily' | 'monthly' | 'quarterly' | 'annually' | 'at_maturity';

  // --- Product metadata ---
  lockInDays: number;               // 0 = liquid
  riskLevel: RiskLevel;
  pdic: boolean;
  insurer: string;                  // e.g. "PDIC", "Bureau of Treasury", "Pag-IBIG Fund", "Not Insured"
  lastVerified: string;             // ISO date — when we last confirmed these rates
  limits?: ProductLimit;             // max deposit per product, max products per user, etc.

  // --- Affiliate / monetization ---
  affiliateUrl: string;
  referralCode: string;
  payoutAmount: number;             // in PHP
  trueValueScore: number;              // 1–5 (placeholder = 3 until Week 7)
}

export const AFFILIATE_PLACEMENTS = [
  'rate_table_expanded',
  'rate_card',
  'quick_match_results',
  'yield_calculator',
  'bank_pick_card',
] as const;

export type AffiliatePlacement = (typeof AFFILIATE_PLACEMENTS)[number];

export interface AffiliateTrackingPayload {
  productId: string;
  provider: string;
  category: string;
  placement: AffiliatePlacement;
}

export interface AffiliateLink {
  bank: string;
  referralCode: string;
  baseUrl: string;
  payoutAmount: number;
  utmSource: 'tool' | 'newsletter' | 'article';
  utmMedium: 'comparison-table' | 'calculator' | 'pdic-optimizer';
  utmCampaign: string;
}

export interface DefiRate {
  apy: number;
  apyMean30d: number;
  tvlUsd: number;
}

export interface NewsletterPayload {
  email: string;
}

// ─── Quick Match ───

export interface QuickMatchAnswers {
  purpose: 'emergency' | 'short-term' | 'idle-cash' | 'long-term' | 'monthly-income';
  amount: number;
  timeline: 'anytime' | '3mo' | '3-6mo' | '6-12mo' | '1yr+';
  lockFlexibility: 'no-lock' | 'maybe' | 'yes-lock';
  payoutPreference: 'no-preference' | 'monthly' | 'at-maturity';
  insurancePreference: 'insured-only' | 'all-banks';
}

export interface QuickMatchCoreAnswers {
  purpose: QuickMatchAnswers['purpose'];
  amount: number;
  timeline: QuickMatchAnswers['timeline'];
}

// ─── Credit Cards ───

/** Fine-print surface badges — computed by data manager, stored in web_weaver.credit_cards.badge_inputs */
export interface BadgeInputs {
  earn_cap: boolean;              // catch:   rewards have a monthly/annual earn cap
  low_fx_fee: boolean;            // badge:   FX fee ≤ 1.85%
  narrow_mcc: boolean;            // catch:   bonus category restricted to narrow MCCs
  true_naffl: boolean;            // badge:   no annual fee for life, no spend threshold
  high_fx_fee: boolean;           // catch:   FX fee ≥ 2.75%
  partner_card: boolean;          // neutral: Truva has affiliate relationship with issuer
  no_ewallet_earn: boolean;       // info:    GCash/Maya loads earn ₱0 (universal in PH)
  rewards_devalued: boolean;      // catch:   points/miles program devalued in past 12 months
  full_medical_coverage: boolean; // badge:   travel insurance covers illness abroad
  accident_only_insurance: boolean; // catch: travel insurance covers on-aircraft accidents only
}

/** Credit card product — maps 1:1 to public.credit_card_listings view */
export interface CreditCard {
  id: string;
  bank: string;
  card_name: string;
  card_tier: string | null;
  card_network: string | null;
  normalized_card_key: string;
  logo: string;                        // derived in lib/credit-cards.ts, not from DB

  // Fees
  annual_fee_first_year: number | null;
  annual_fee_recurring: number | null;
  annual_fee_currency: string | null;
  naffl: boolean | null;
  annual_fee_waiver_condition: string | null;
  annual_fee_waiver_threshold: number | null;

  // Interest (BPS already divided by 100 in the view — 3.00 means 3%)
  interest_rate_pct: number | null;
  interest_rate_effective_annual: number | null;

  // Rewards
  rewards_type: string | null;
  rewards_formula: Record<string, unknown> | null;

  // Income eligibility (null → display "No Public Data")
  min_income_monthly: number | null;
  min_income_annual: number | null;
  min_income_period: string | null;
  min_income_source_text: string | null;

  // Detailed fees
  foreign_transaction_fee_pct: number | null;
  cash_advance_fee_amount: number | null;
  cash_advance_fee_pct: number | null;
  late_payment_fee_amount: number | null;
  overlimit_fee_amount: number | null;
  minimum_amount_due_formula: string | null;

  // Methodology readiness gates
  methodology_ready: boolean;
  income_filter_ready: boolean;
  score_ready: boolean;
  score_suppressed_reason: string | null;
  methodology_capture_score: number | null;

  // Fine-print badges
  badge_inputs: BadgeInputs | null;

  // Active promos
  active_promo_count: number;

  // Provenance
  source_url: string;
  last_scraped_at: string;
}

/** @deprecated Use CreditCard — kept temporarily for any remaining reference sites */
export type CreditCardProduct = CreditCard;

export interface EditorialCta {
  label: string;
  href: string;
  description?: string;
}

export interface ArticleTocItem {
  label: string;
  depth?: 2 | 3;
}

export interface EditorialFaqItem {
  question: string;
  answer: string;
}

export interface EditorialArticle {
  slug: string;
  path: string;
  title: string;
  seoTitle?: string;
  description: string;
  subtitle: string;
  category: 'banking' | 'credit-cards' | 'guides';
  categoryLabel: string;
  section: 'rates' | 'reviews' | 'compare' | 'guides';
  articleType: 'Rate Guide' | 'Review' | 'Comparison' | 'Explainer';
  eyebrow: string;
  bannerUrl?: string;
  bannerFocus?: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  authorUrl?: string;
  readingTime: string;
  featured: boolean;
  keywords?: string[];
  verificationNote?: string;
  disclosureNote?: string;
  sectionPath?: string;
  toc: ArticleTocItem[];
  faqItems?: EditorialFaqItem[];
  primaryCta: EditorialCta;
  secondaryCta?: EditorialCta;
  relatedArticles: string[];
}

// ─── Money Market Funds ───

export interface MoneyMarketFund {
  id: string;
  slug: string;
  name: string;
  provider: string;
  fund_type: 'UITF' | 'Mutual Fund';
  currency: 'PHP' | 'USD';
  trust_fee_pct: number | null;
  min_initial: number;
  min_additional: number | null;
  redemption_days: number;
  holding_period_days: number;
  early_redemption_fee: string | null;
  benchmark_label: string | null;
  benchmark_key: string | null;
  risk_class: string | null;
  pdic_insured: boolean;
  access_channels: string[];
  fund_page_url: string;
  rate_date: string | null;
  navpu: number | null;
  gross_yield_1y: number | null;
  after_tax_yield: number | null;
  net_yield: number | null;
  benchmark_rate: number | null;
  vs_benchmark: number | null;
  data_source?: string | null;
  scraped_at?: string | null;
}

export interface BenchmarkRate {
  key: string;
  label: string;
  date: string;
  rate: number;
}
