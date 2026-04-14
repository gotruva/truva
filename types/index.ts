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
  type: 'spending' | 'promo' | 'balance_growth' | 'new_user' | 'none';
  description: string;
  expiresAt?: string | null;        // ISO date for promo expiry, null = permanent
  requiredMonthlySpend?: number;    // e.g. 500 for Maya
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
  tierType: 'blended' | 'threshold'; // blended = each band earns independently (Maya Goals), threshold = whole balance earns bracket rate (Salmon Bank)
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

  // --- Affiliate / monetization ---
  affiliateUrl: string;
  referralCode: string;
  payoutAmount: number;             // in PHP
  palagoScore: number;              // 1–5 (placeholder = 3 until Week 7)
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

export interface CreditCardProduct {
  id: string;
  name: string;
  provider: string; // The bank
  logo: string; // path to logo
  category: 'credit-cards';
  
  annualFee: number;
  annualFeeWaiverCondition: string | null;
  monthlyInterestRate: number; // e.g. 0.03 for 3%
  rewardType: 'cashback' | 'miles' | 'points' | 'none';
  minimumMonthlyIncome: number;
  
  welcomePromo: string | null;
  perks: string[]; // e.g. ['Lounge access', 'Free travel insurance']
  
  // --- SEO & Editorial ---
  bestFor: string;
  pros: string[];
  cons: string[];
  faqs: { question: string, answer: string }[];
  eligibilitySummary: string;
  editorVerdict: string;
  
  // --- SPONSORED / AFFILIATE ---
  isSponsored: boolean;
  sponsoredDisclosure?: string;
  
  affiliateUrl: string;
  palagoScore: number;
}

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
