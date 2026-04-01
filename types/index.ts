export type RiskLevel = 'Low' | 'Medium' | 'DeFi';
export type FilterCategory = 'all' | 'banks' | 'govt' | 'uitfs' | 'defi';
export type LiquidityFilter = 'all' | 'liquid' | 'locked';

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
  tiers: RateTier[];                // ordered from lowest to highest balance
  conditions: RateCondition[];      // conditions to unlock higher tiers
  taxExempt: boolean;

  // --- Product metadata ---
  lockInDays: number;               // 0 = liquid
  riskLevel: RiskLevel;
  pdic: boolean;
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
