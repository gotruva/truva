export type RiskLevel = 'Low' | 'Medium' | 'DeFi';
export type FilterCategory = 'all' | 'banks' | 'govt' | 'uitfs' | 'defi';

export interface RateProduct {
  id: string;
  name: string;
  provider: string;
  logo: string;           // path to /public/logos/
  category: FilterCategory;
  grossRate: number;      // e.g. 0.15 for 15%
  afterTaxRate: number;   // grossRate * 0.80 (or grossRate if taxExempt)
  taxExempt: boolean;
  conditions: string;
  balanceCap: number | null;
  lockInDays: number;     // 0 = liquid
  riskLevel: RiskLevel;
  pdic: boolean;
  affiliateUrl: string;
  referralCode: string;
  payoutAmount: number;   // in PHP
  palagoScore: number;    // 1–5 (placeholder = 3 until Week 7)
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
