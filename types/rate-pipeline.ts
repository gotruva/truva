import type { RateProduct } from '@/types';

export type RateSnapshotChannel = 'staging' | 'production';

export type InstitutionLicenseType =
  | 'digital_bank'
  | 'rural_bank'
  | 'thrift_bank'
  | 'commercial_bank'
  | 'government_agency'
  | 'fund_manager'
  | 'defi_protocol'
  | 'unknown';

export type InstitutionMarketLabel =
  | 'digital-bank'
  | 'neobank'
  | 'government'
  | 'uitf'
  | 'defi'
  | 'legacy-manual';

export type ProductSourceMode =
  | 'approved_seed'
  | 'automated'
  | 'manual_annual'
  | 'inactive_pending_automation';

export type ReviewStatus = 'approved' | 'pending_review' | 'rejected';

export type SourceKind =
  | 'landing_page'
  | 'product_page'
  | 'fees_page'
  | 'help_center'
  | 'terms_pdf';

export type ParseStrategy = 'html' | 'pdf' | 'playwright';

export type AutomationPhase = 'phase1_digital' | 'manual_seed' | 'inactive';

export interface RateSourceDefinition {
  kind: SourceKind;
  url: string;
  parseStrategy: ParseStrategy;
  notes?: string;
}

export interface RateProviderDefinition {
  institutionSlug: string;
  providerDisplayName: string;
  legalName: string;
  officialDomain: string;
  licenseType: InstitutionLicenseType;
  marketLabel: InstitutionMarketLabel;
  automationPhase: AutomationPhase;
  defaultSourceMode: ProductSourceMode;
  publishAllowed: boolean;
  sources: RateSourceDefinition[];
  aliases?: string[];
  notes?: string;
}

export interface SeedProductClassification {
  institutionSlug: string;
  providerDisplayName: string;
  productType: string;
  sourceMode: ProductSourceMode;
  publishAllowed: boolean;
  reviewStatus: ReviewStatus;
  keepInPublishedSnapshot: boolean;
  automationPhase: AutomationPhase;
}

export interface PublishedRateSnapshot {
  snapshotChannel: RateSnapshotChannel;
  generatedAt: string;
  productCount: number;
  providerCount: number;
  payload: RateProduct[];
  sourceProductIds: string[];
}

export interface BaselineManifest {
  generatedAt: string;
  gitRef: string;
  seedProductCount: number;
  seedProviderCount: number;
  seedProviders: string[];
  publicSeedProductCount: number;
  publishedCandidateProductCount: number;
  publishedCandidateProviderCount: number;
  publishedCandidateProviders: string[];
  removedProductIds: string[];
  manualAnnualProductIds: string[];
  maxLastVerified: string;
  exportedSupabaseTables: string[];
}

