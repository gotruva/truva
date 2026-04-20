import type { RateProduct } from '@/types';
import type {
  RateProviderDefinition,
  SeedProductClassification,
} from '@/types/rate-pipeline';

export const MANUAL_ANNUAL_PRODUCT_IDS = new Set(['pagibig-mp2']);

export const INACTIVE_PRODUCT_IDS = new Set([
  'tbill-91',
  'tbill-182',
  'tbill-364',
  'rtb-27',
  'bdo-mmf-uitf',
  'bpi-mmf-uitf',
  'aave-v3-usdc-base',
]);

const PROVIDER_DEFINITIONS: RateProviderDefinition[] = [
  {
    institutionSlug: 'maya-bank',
    providerDisplayName: 'Maya Bank',
    legalName: 'Maya Bank, Inc.',
    officialDomain: 'mayabank.ph',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.mayabank.ph/savings/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.mayabank.ph/time-deposit-plus/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'tonik-digital-bank',
    providerDisplayName: 'Tonik Digital Bank',
    legalName: 'Tonik Digital Bank, Inc.',
    officialDomain: 'tonikbank.com',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://tonikbank.com/savings-cards/tonik-account', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://tonikbank.com/savings-cards/time-deposit', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'uno-digital-bank',
    providerDisplayName: 'UNO Digital Bank',
    legalName: 'UNObank, Inc.',
    officialDomain: 'uno.bank',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.uno.bank/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.uno.bank/savings-account/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.uno.bank/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'gotyme-bank',
    providerDisplayName: 'GoTyme Bank',
    legalName: 'GoTyme Bank Corporation',
    officialDomain: 'gotyme.com.ph',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.gotyme.com.ph/save-and-invest/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'maribank',
    providerDisplayName: 'MariBank',
    legalName: 'MariBank Philippines, Inc.',
    officialDomain: 'maribank.ph',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.maribank.ph/product/savings', parseStrategy: 'html' },
      { kind: 'fees_page', url: 'https://www.maribank.ph/fees-rates', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'uniondigital-bank',
    providerDisplayName: 'UnionDigital Bank',
    legalName: 'UnionDigital Bank, Inc.',
    officialDomain: 'uniondigitalbank.io',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://uniondigitalbank.io/en/products/savings-account', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://uniondigitalbank.io/en/products/time-deposit', parseStrategy: 'html' },
    ],
    notes: 'Use a conservative crawl path; public product pages can be sparse.',
  },
  {
    institutionSlug: 'ofbank',
    providerDisplayName: 'Overseas Filipino Bank',
    legalName: 'Overseas Filipino Bank, Inc.',
    officialDomain: 'ofbank.com.ph',
    licenseType: 'digital_bank',
    marketLabel: 'digital-bank',
    automationPhase: 'phase1_digital',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'landing_page', url: 'https://www.ofbank.com.ph/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'cimb-gsave',
    providerDisplayName: 'CIMB / GCash',
    legalName: 'CIMB Bank Philippines, Inc.',
    officialDomain: 'cimbbank.com.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'neobank',
    automationPhase: 'manual_seed',
    defaultSourceMode: 'approved_seed',
    publishAllowed: true,
    sources: [
      { kind: 'landing_page', url: 'https://www.cimbbank.com.ph/en/products.html', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'cimb-bank-ph',
    providerDisplayName: 'CIMB Bank Philippines',
    legalName: 'CIMB Bank Philippines, Inc.',
    officialDomain: 'cimbbank.com.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'neobank',
    automationPhase: 'manual_seed',
    defaultSourceMode: 'approved_seed',
    publishAllowed: true,
    sources: [
      { kind: 'landing_page', url: 'https://www.cimbbank.com.ph/en/products.html', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'salmon-bank',
    providerDisplayName: 'Salmon Bank',
    legalName: 'Rural Bank of Sta. Rosa (Laguna), Inc. d.b.a. Salmon Bank',
    officialDomain: 'salmon.ph',
    licenseType: 'rural_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://salmon.ph/savings-account/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://salmon.ph/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'netbank',
    providerDisplayName: 'Netbank',
    legalName: 'Netbank, Inc. (A Rural Bank)',
    officialDomain: 'netbank.ph',
    licenseType: 'rural_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://netbank.ph/savings/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://netbank.ph/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'komo-eastwest',
    providerDisplayName: 'Komo by EastWest Bank',
    legalName: 'East West Banking Corporation',
    officialDomain: 'komo.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.komo.ph/savings-account/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.komo.ph/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'diskartech-rcbc',
    providerDisplayName: 'DiskarTech by RCBC',
    legalName: 'Rizal Commercial Banking Corporation',
    officialDomain: 'diskartech.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://diskartech.ph/savings/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://diskartech.ph/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'ownbank',
    providerDisplayName: 'OwnBank',
    legalName: 'Own Bank (A Rural Bank), Inc.',
    officialDomain: 'ownbank.com',
    licenseType: 'rural_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.ownbank.com/savings/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.ownbank.com/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'landbank',
    providerDisplayName: 'Landbank of the Philippines',
    legalName: 'Land Bank of the Philippines',
    officialDomain: 'landbank.com',
    licenseType: 'commercial_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.landbank.com/personal/savings-account/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.landbank.com/personal/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'dbp',
    providerDisplayName: 'Development Bank of the Philippines',
    legalName: 'Development Bank of the Philippines',
    officialDomain: 'dbp.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.dbp.ph/savings-account/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.dbp.ph/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'banko-bpi',
    providerDisplayName: 'BanKo (by BPI)',
    legalName: 'BPI Direct BanKo, Inc., A Savings Bank',
    officialDomain: 'bpi.com.ph',
    licenseType: 'thrift_bank',
    marketLabel: 'neobank',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.bpi.com.ph/banko/savings/', parseStrategy: 'html' },
      { kind: 'product_page', url: 'https://www.bpi.com.ph/banko/time-deposit/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'pagibig-fund',
    providerDisplayName: 'HDMF (Pag-IBIG Fund)',
    legalName: 'Home Development Mutual Fund',
    officialDomain: 'pagibigfund.gov.ph',
    licenseType: 'government_agency',
    marketLabel: 'government',
    automationPhase: 'phase2_neobanks',
    defaultSourceMode: 'automated',
    publishAllowed: true,
    sources: [
      { kind: 'product_page', url: 'https://www.pagibigfund.gov.ph/mp2/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'bureau-of-treasury',
    providerDisplayName: 'Bureau of Treasury',
    legalName: 'Bureau of the Treasury',
    officialDomain: 'treasury.gov.ph',
    licenseType: 'government_agency',
    marketLabel: 'government',
    automationPhase: 'inactive',
    defaultSourceMode: 'inactive_pending_automation',
    publishAllowed: false,
    sources: [
      { kind: 'landing_page', url: 'https://www.treasury.gov.ph/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'bdo-uitf',
    providerDisplayName: 'BDO Unibank',
    legalName: 'BDO Unibank, Inc.',
    officialDomain: 'bdo.com.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'uitf',
    automationPhase: 'inactive',
    defaultSourceMode: 'inactive_pending_automation',
    publishAllowed: false,
    sources: [
      { kind: 'landing_page', url: 'https://www.bdo.com.ph/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'bpi-uitf',
    providerDisplayName: 'Bank of the Philippine Islands',
    legalName: 'Bank of the Philippine Islands',
    officialDomain: 'bpi.com.ph',
    licenseType: 'commercial_bank',
    marketLabel: 'uitf',
    automationPhase: 'inactive',
    defaultSourceMode: 'inactive_pending_automation',
    publishAllowed: false,
    sources: [
      { kind: 'landing_page', url: 'https://www.bpi.com.ph/', parseStrategy: 'html' },
    ],
  },
  {
    institutionSlug: 'aave-v3',
    providerDisplayName: 'Aave V3',
    legalName: 'Aave V3',
    officialDomain: 'aave.com',
    licenseType: 'defi_protocol',
    marketLabel: 'defi',
    automationPhase: 'inactive',
    defaultSourceMode: 'inactive_pending_automation',
    publishAllowed: false,
    sources: [
      { kind: 'landing_page', url: 'https://aave.com/', parseStrategy: 'html' },
    ],
  },
];

const PROVIDER_MAP = new Map<string, RateProviderDefinition>();

for (const definition of PROVIDER_DEFINITIONS) {
  PROVIDER_MAP.set(definition.providerDisplayName.toLowerCase(), definition);
  for (const alias of definition.aliases ?? []) {
    PROVIDER_MAP.set(alias.toLowerCase(), definition);
  }
}

function fallbackInstitutionSlug(provider: string): string {
  return provider
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getRateProviderDefinition(provider: string): RateProviderDefinition {
  return PROVIDER_MAP.get(provider.toLowerCase()) ?? {
    institutionSlug: fallbackInstitutionSlug(provider),
    providerDisplayName: provider,
    legalName: provider,
    officialDomain: '',
    licenseType: 'unknown',
    marketLabel: 'legacy-manual',
    automationPhase: 'manual_seed',
    defaultSourceMode: 'approved_seed',
    publishAllowed: true,
    sources: [],
    notes: 'Fallback definition generated from the current approved site dataset.',
  };
}

export function getSeedProductClassification(rate: RateProduct): SeedProductClassification {
  const definition = getRateProviderDefinition(rate.provider);
  const manualAnnual = MANUAL_ANNUAL_PRODUCT_IDS.has(rate.id);
  const inactive = INACTIVE_PRODUCT_IDS.has(rate.id) || definition.defaultSourceMode === 'inactive_pending_automation';

  const keepInPublishedSnapshot = manualAnnual || (!inactive && definition.publishAllowed);

  return {
    institutionSlug: definition.institutionSlug,
    providerDisplayName: definition.providerDisplayName,
    productType: inferSeedProductType(rate),
    sourceMode: manualAnnual
      ? 'manual_annual'
      : inactive
        ? 'inactive_pending_automation'
        : definition.defaultSourceMode,
    publishAllowed: definition.publishAllowed || manualAnnual,
    reviewStatus: 'approved',
    keepInPublishedSnapshot,
    automationPhase: definition.automationPhase,
  };
}

export function inferSeedProductType(rate: RateProduct): string {
  if (rate.id === 'pagibig-mp2') return 'government_savings';
  if (rate.category === 'uitfs') return 'money_market_fund';
  if (rate.category === 'defi') return 'defi_pool';
  if (rate.category === 'govt') return rate.lockInDays > 0 ? 'government_fixed_income' : 'government_savings';
  return rate.lockInDays > 0 ? 'time_deposit' : 'savings';
}

export function listRateProviderDefinitions(): RateProviderDefinition[] {
  return [...PROVIDER_DEFINITIONS];
}
