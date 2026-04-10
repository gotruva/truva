import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

import type { RateCondition, RateProduct } from '@/types';
import type { RateProviderDefinition } from '@/types/rate-pipeline';

import type { SeedFactDraft } from './rate-pipeline';

export interface LocalRateArtifact {
  sourceUrl: string;
  artifactPath: string;
  html: string;
  contentHash: string;
  canonicalUrl: string;
  pageModifiedAt: string | null;
  crawlRunId?: string | null;
  startedAt?: string | null;
}

export interface ExtractedRateCandidate {
  productId: string;
  structuredPayload: RateProduct;
  rawPayload: Record<string, unknown>;
  rawText: string;
  facts: SeedFactDraft[];
  materialSignature: string;
  summary: string;
}

export interface RateMaterialDiff {
  field: string;
  previous: unknown;
  next: unknown;
}

interface FactEvidenceDraft {
  evidenceText: string;
  sourceUrl: string;
  confidence?: number;
  isMaterial?: boolean;
}

const EXTRACTION_VERSION = '2026-04-10-maya-v1';

const MATERIAL_FIELD_PICKERS = [
  ['headlineRate', (rate: RateProduct) => rate.headlineRate],
  ['baseRate', (rate: RateProduct) => rate.baseRate],
  ['tierType', (rate: RateProduct) => rate.tierType],
  ['tiers', (rate: RateProduct) => rate.tiers],
  ['conditions', (rate: RateProduct) => rate.conditions],
  ['payoutFrequency', (rate: RateProduct) => rate.payoutFrequency],
  ['lockInDays', (rate: RateProduct) => rate.lockInDays],
  ['pdic', (rate: RateProduct) => rate.pdic],
  ['insurer', (rate: RateProduct) => rate.insurer],
] as const;

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '').toLowerCase();
}

function stripTags(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 2)}%`;
}

function calcAfterTax(grossRate: number, taxExempt = false) {
  return taxExempt ? grossRate : Number((grossRate * 0.8).toFixed(6));
}

function deepCloneRate(rate: RateProduct): RateProduct {
  return structuredClone(rate);
}

function extractFirstMatch(html: string, pattern: RegExp) {
  const match = pattern.exec(html);
  return match?.[1] ?? match?.[0] ?? null;
}

function extractPercentValue(html: string, pattern: RegExp) {
  const value = extractFirstMatch(html, pattern);
  return value ? Number.parseFloat(value) / 100 : null;
}

function buildContentHash(content: string) {
  return createHash('sha256').update(content).digest('hex');
}

function normalizeForComparison(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeForComparison);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = normalizeForComparison((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }

  return value;
}

function stableSerialize(value: unknown) {
  return JSON.stringify(normalizeForComparison(value));
}

function extractCanonicalUrl(html: string) {
  return extractFirstMatch(html, /<link rel="canonical" href="([^"]+)"/i)
    ?? extractFirstMatch(html, /<meta property="og:url" content="([^"]+)"/i);
}

function extractPageModifiedAt(html: string) {
  return extractFirstMatch(html, /<meta property="article:modified_time" content="([^"]+)"/i)
    ?? extractFirstMatch(html, /"dateModified":"([^"]+)"/i);
}

function buildFactsFromRate(
  rate: RateProduct,
  evidence: Partial<Record<string, FactEvidenceDraft>>,
  fallback: FactEvidenceDraft,
  extras: SeedFactDraft[] = [],
): SeedFactDraft[] {
  const fallbackFact = (factKey: string): SeedFactDraft => {
    const factEvidence = evidence[factKey] ?? fallback;
    const base = {
      evidenceText: factEvidence.evidenceText,
      sourceUrl: factEvidence.sourceUrl,
      confidence: factEvidence.confidence ?? 0.95,
      isMaterial: factEvidence.isMaterial ?? true,
    };

    switch (factKey) {
      case 'headline_rate':
        return { factKey, value: rate.headlineRate, ...base };
      case 'base_rate':
        return { factKey, value: rate.baseRate, ...base };
      case 'tier_type':
        return { factKey, value: rate.tierType, ...base };
      case 'tiers':
        return { factKey, value: rate.tiers, ...base };
      case 'conditions':
        return { factKey, value: rate.conditions, ...base };
      case 'payout_frequency':
        return { factKey, value: rate.payoutFrequency, ...base };
      case 'lock_in_days':
        return { factKey, value: rate.lockInDays, ...base };
      case 'risk_level':
        return { factKey, value: rate.riskLevel, ...base, isMaterial: false };
      case 'pdic':
        return { factKey, value: rate.pdic, ...base };
      case 'insurer':
        return { factKey, value: rate.insurer, ...base };
      case 'last_verified':
        return { factKey, value: rate.lastVerified, ...base, isMaterial: false };
      case 'affiliate_url':
        return { factKey, value: rate.affiliateUrl, ...base, isMaterial: false };
      case 'referral_code':
        return { factKey, value: rate.referralCode, ...base, isMaterial: false };
      case 'payout_amount':
        return { factKey, value: rate.payoutAmount, ...base, isMaterial: false };
      case 'palago_score':
        return { factKey, value: rate.palagoScore, ...base, isMaterial: false };
      default:
        throw new Error(`Unsupported fact key ${factKey}`);
    }
  };

  const baseFactKeys = [
    'headline_rate',
    'base_rate',
    'tier_type',
    'tiers',
    'conditions',
    'payout_frequency',
    'lock_in_days',
    'risk_level',
    'pdic',
    'insurer',
    'last_verified',
    'affiliate_url',
    'referral_code',
    'payout_amount',
    'palago_score',
  ];

  return [...baseFactKeys.map(fallbackFact), ...extras];
}

function buildMaterialSignature(rate: RateProduct, extras: Record<string, unknown> = {}) {
  const materialSubset = {
    headlineRate: rate.headlineRate,
    baseRate: rate.baseRate,
    tierType: rate.tierType,
    tiers: rate.tiers,
    conditions: rate.conditions,
    payoutFrequency: rate.payoutFrequency,
    lockInDays: rate.lockInDays,
    pdic: rate.pdic,
    insurer: rate.insurer,
    ...extras,
  };

  return buildContentHash(stableSerialize(materialSubset));
}

function createExtraFact(
  factKey: string,
  value: unknown,
  evidenceText: string,
  sourceUrl: string,
  isMaterial = false,
  confidence = 0.98,
): SeedFactDraft {
  return { factKey, value, evidenceText, sourceUrl, confidence, isMaterial };
}

function buildSavingsConditions(spendBoostRows: Array<{ spend: number; rate: number }>, headlineRate: number) {
  const spendSummary = spendBoostRows
    .map((row) => `${formatPercent(row.rate)} at PHP ${row.spend.toLocaleString()} spend`)
    .join(', ');

  const description = spendSummary
    ? `Base 3.5% applies to the full balance, with bonus interest on up to the first PHP 100,000. The current Maya Savings chart lists ${spendSummary}, while the page hero and FAQ advertise up to ${formatPercent(headlineRate)} through additional Maya features and balance growth.`
    : `Base 3.5% applies to the full balance, with bonus interest on up to the first PHP 100,000. The current Maya Savings page advertises up to ${formatPercent(headlineRate)} through Maya activity and balance growth.`;

  const conditions: RateCondition[] = [
    {
      type: 'spending',
      description,
      expiresAt: null,
      requiredMonthlySpend: 35000,
    },
  ];

  return conditions;
}

function buildMayaSavingsCandidate(seedRate: RateProduct, artifact: LocalRateArtifact, verifiedDate: string): ExtractedRateCandidate {
  const parsedHtml = artifact.html.replace(/<!--[\s\S]*?-->/g, '');
  const baseRate = extractPercentValue(
    parsedHtml,
    /base interest(?: of)? ([0-9.]+)% p\.a/i,
  ) ?? 0.035;
  const headlineRate = extractPercentValue(
    parsedHtml,
    /up to ([0-9.]+)% interest p\.a/i,
  ) ?? 0.15;
  const spendBoostRows = [...parsedHtml.matchAll(
    /Boosted interest rate unlocked at P([\d,]+)\s+accumulate spend[\s\S]*?<td class="cell">([\d.]+)% p\.a\./gi,
  )].map((match) => ({
    spend: Number.parseInt(match[1].replace(/,/g, ''), 10),
    rate: Number.parseFloat(match[2]) / 100,
  })).filter((row, index, rows) => rows.findIndex((candidate) => candidate.spend === row.spend && candidate.rate === row.rate) === index);

  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = {
    grossRate: baseRate,
    afterTaxRate: calcAfterTax(baseRate, nextRate.taxExempt),
  };
  nextRate.tiers = [
    {
      minBalance: 0,
      maxBalance: 100000,
      grossRate: headlineRate,
      afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt),
    },
    {
      minBalance: 100000,
      maxBalance: null,
      grossRate: baseRate,
      afterTaxRate: calcAfterTax(baseRate, nextRate.taxExempt),
    },
  ];
  nextRate.conditions = buildSavingsConditions(spendBoostRows, headlineRate);
  nextRate.lastVerified = verifiedDate;

  const fallbackEvidence = {
    evidenceText: stripTags(
      extractFirstMatch(
        parsedHtml,
        /<p>You can boost your interest all the way up to [\s\S]*?<\/p>/i,
      ) ?? 'Extracted from the current Maya Savings page.',
    ),
    sourceUrl: artifact.sourceUrl,
    confidence: 0.97,
  };

  const facts = buildFactsFromRate(
    nextRate,
    {
      headline_rate: {
        evidenceText: stripTags(
          extractFirstMatch(
            parsedHtml,
            /<h3 class="elementor-heading-title elementor-size-default">Earn up to [\s\S]*?<\/p>/i,
          ) ?? fallbackEvidence.evidenceText,
        ),
        sourceUrl: artifact.sourceUrl,
      },
      base_rate: {
        evidenceText: stripTags(
          extractFirstMatch(
            parsedHtml,
            /<p>Your Maya Savings account will start earning a base interest of [\s\S]*?<\/p>/i,
          ) ?? fallbackEvidence.evidenceText,
        ),
        sourceUrl: artifact.sourceUrl,
      },
      tiers: {
        evidenceText: 'Bonus interest applies only to balances up to PHP 100,000, with 3.5% base interest on the full balance.',
        sourceUrl: artifact.sourceUrl,
      },
      conditions: {
        evidenceText: spendBoostRows.length
          ? `Current spend chart rows: ${spendBoostRows.map((row) => `PHP ${row.spend.toLocaleString()} -> ${formatPercent(row.rate)}`).join(', ')}.`
          : fallbackEvidence.evidenceText,
        sourceUrl: artifact.sourceUrl,
      },
    },
    fallbackEvidence,
    [
      createExtraFact('official_url', artifact.sourceUrl, 'Canonical Maya Savings URL from the crawled page.', artifact.sourceUrl, true),
      createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Latest modified timestamp extracted from the Maya Savings page metadata.', artifact.sourceUrl),
    ],
  );

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: {
      parserVersion: EXTRACTION_VERSION,
      productKind: 'maya_savings',
      sourceUrl: artifact.sourceUrl,
      pageModifiedAt: artifact.pageModifiedAt,
      extracted: {
        headlineRate,
        baseRate,
        spendBoostRows,
      },
    },
    rawText: [
      fallbackEvidence.evidenceText,
      spendBoostRows.length
        ? `Spend ladder: ${spendBoostRows.map((row) => `PHP ${row.spend.toLocaleString()} => ${formatPercent(row.rate)}`).join(', ')}.`
        : null,
    ].filter(Boolean).join('\n'),
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl }),
    summary: `Detected Maya Savings page values of ${formatPercent(baseRate)} base interest and up to ${formatPercent(headlineRate)} bonus interest.`,
  };
}

function buildMayaPersonalGoalsCandidate(seedRate: RateProduct, artifact: LocalRateArtifact, verifiedDate: string): ExtractedRateCandidate {
  const headlineRate = extractPercentValue(
    artifact.html,
    /Create up to 5 Personal Goal accounts and earn up to ([0-9.]+)% interest p\.a\. monthly!/i,
  ) ?? seedRate.headlineRate;
  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = {
    grossRate: 0.04,
    afterTaxRate: calcAfterTax(0.04, nextRate.taxExempt),
  };
  nextRate.lastVerified = verifiedDate;

  const fallbackEvidence = {
    evidenceText: 'The Maya Savings page still advertises Personal Goals at up to 8% interest p.a. monthly with balances capped at PHP 100,000 per account.',
    sourceUrl: 'https://www.mayabank.ph/savings/personal-goals/',
    confidence: 0.94,
  };

  const facts = buildFactsFromRate(
    nextRate,
    {
      headline_rate: fallbackEvidence,
      base_rate: {
        evidenceText: 'The embedded Personal Goals annex on the Maya Savings page still lists 4.00% for balances up to PHP 1,000,000 and zero above that level.',
        sourceUrl: artifact.sourceUrl,
      },
    },
    fallbackEvidence,
    [
      createExtraFact('official_url', 'https://www.mayabank.ph/savings/personal-goals/', 'Personal Goals URL linked from the official Maya Savings page.', artifact.sourceUrl, true),
      createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Latest modified timestamp extracted from the Maya Savings page metadata.', artifact.sourceUrl),
    ],
  );

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: {
      parserVersion: EXTRACTION_VERSION,
      productKind: 'maya_personal_goals',
      sourceUrl: artifact.sourceUrl,
      pageModifiedAt: artifact.pageModifiedAt,
      extracted: {
        headlineRate,
        linkedPersonalGoalsUrl: 'https://www.mayabank.ph/savings/personal-goals/',
      },
    },
    rawText: fallbackEvidence.evidenceText,
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: 'https://www.mayabank.ph/savings/personal-goals/' }),
    summary: `Validated Maya Personal Goals marketing copy at up to ${formatPercent(headlineRate)}.`,
  };
}

function buildMayaTimeDepositCandidate(
  seedRate: RateProduct,
  artifact: LocalRateArtifact,
  tenorMonths: 3 | 6 | 12,
  headlineRate: number,
  verifiedDate: string,
): ExtractedRateCandidate {
  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = {
    grossRate: 0.035,
    afterTaxRate: calcAfterTax(0.035, nextRate.taxExempt),
  };
  nextRate.tiers = [
    {
      minBalance: 0,
      maxBalance: 1000000,
      grossRate: headlineRate,
      afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt),
    },
  ];
  nextRate.conditions = [
    {
      type: 'none',
      description: 'Time Deposit Plus earns a 3.5% base rate credited monthly, with the selected 3-, 6-, or 12-month rate applying once the target goal amount has been reached. Deposits up to PHP 1,000,000 per account are covered, with up to 5 active accounts allowed.',
      expiresAt: null,
    },
  ];
  nextRate.payoutFrequency = 'monthly';
  nextRate.lastVerified = verifiedDate;

  const tenorPattern = new RegExp(
    `<h2 class="elementor-heading-title elementor-size-default">\\s*${String(headlineRate * 100).replace('.', '\\.')}% p\\.a\\.?<\\/h2>[\\s\\S]*?<p>${tenorMonths} months<\\/p>`,
    'i',
  );
  const tenorEvidenceText = stripTags(
    extractFirstMatch(artifact.html, tenorPattern) ?? `${formatPercent(headlineRate)} for ${tenorMonths} months.`,
  );

  const fallbackEvidence = {
    evidenceText: tenorEvidenceText,
    sourceUrl: artifact.sourceUrl,
    confidence: 0.97,
  };

  const facts = buildFactsFromRate(
    nextRate,
    {
      headline_rate: fallbackEvidence,
      base_rate: {
        evidenceText: stripTags(
          extractFirstMatch(
            artifact.html,
            /<p>Time Deposit Plus earns you a base interest rate of [\s\S]*?<\/p>/i,
          ) ?? 'Time Deposit Plus base interest is 3.5% per annum, credited monthly.',
        ),
        sourceUrl: artifact.sourceUrl,
      },
      conditions: {
        evidenceText: 'The Time Deposit Plus FAQ says boosted interest starts once the goal amount is reached, with a minimum target goal amount of PHP 5,000 and a PHP 1,000,000 maximum balance per account.',
        sourceUrl: artifact.sourceUrl,
      },
      payout_frequency: {
        evidenceText: 'The Time Deposit Plus FAQ states the base interest is credited to the account monthly.',
        sourceUrl: artifact.sourceUrl,
      },
      tiers: {
        evidenceText: `The tenor card on the official page lists ${formatPercent(headlineRate)} for the ${tenorMonths}-month account on deposits up to PHP 1,000,000.`,
        sourceUrl: artifact.sourceUrl,
      },
    },
    fallbackEvidence,
    [
      createExtraFact('official_url', artifact.sourceUrl, 'Canonical Time Deposit Plus URL from the crawled page.', artifact.sourceUrl, true),
      createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Latest modified timestamp extracted from the Time Deposit Plus page metadata.', artifact.sourceUrl),
    ],
  );

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: {
      parserVersion: EXTRACTION_VERSION,
      productKind: 'maya_time_deposit',
      sourceUrl: artifact.sourceUrl,
      pageModifiedAt: artifact.pageModifiedAt,
      extracted: {
        tenorMonths,
        headlineRate,
        baseRate: 0.035,
        maxBalance: 1000000,
        minimumTargetGoalAmount: 5000,
      },
    },
    rawText: `Time Deposit Plus ${tenorMonths}-month tenor is listed at ${formatPercent(headlineRate)} on the official Maya page.`,
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl, tenorMonths }),
    summary: `Detected Maya Time Deposit Plus ${tenorMonths}-month page values of ${formatPercent(headlineRate)} headline interest with 3.5% base interest credited monthly.`,
  };
}

function extractMayaTimeDepositRates(html: string) {
  return [...html.matchAll(
    /<h2 class="elementor-heading-title elementor-size-default">\s*([\d.]+)% p\.a\.?<\/h2>[\s\S]*?<p>(3|6|12) months<\/p>/gi,
  )].reduce<Record<number, number>>((result, match) => {
    const rate = Number.parseFloat(match[1]) / 100;
    const months = Number.parseInt(match[2], 10);
    result[months] = rate;
    return result;
  }, {});
}

function extractMayaBankCandidates(artifacts: LocalRateArtifact[], seedRates: Map<string, RateProduct>): ExtractedRateCandidate[] {
  const savingsArtifact = artifacts.find((artifact) => normalizeUrl(artifact.sourceUrl) === normalizeUrl('https://www.mayabank.ph/savings/'));
  const timeDepositArtifact = artifacts.find((artifact) => normalizeUrl(artifact.sourceUrl) === normalizeUrl('https://www.mayabank.ph/time-deposit-plus/'));
  const verifiedDate = new Date().toISOString().slice(0, 10);

  const candidates: ExtractedRateCandidate[] = [];

  if (savingsArtifact) {
    const mayaSavings = seedRates.get('maya-savings');
    const mayaPersonalGoals = seedRates.get('maya-personal-goals');

    if (mayaSavings) {
      candidates.push(buildMayaSavingsCandidate(mayaSavings, savingsArtifact, verifiedDate));
    }

    if (mayaPersonalGoals) {
      candidates.push(buildMayaPersonalGoalsCandidate(mayaPersonalGoals, savingsArtifact, verifiedDate));
    }
  }

  if (timeDepositArtifact) {
    const timeDepositRates = extractMayaTimeDepositRates(timeDepositArtifact.html);
    const tenorProducts: Array<[string, 3 | 6 | 12]> = [
      ['maya-td-3mo', 3],
      ['maya-td-6mo', 6],
      ['maya-td-12mo', 12],
    ];

    for (const [productId, months] of tenorProducts) {
      const seedRate = seedRates.get(productId);
      const headlineRate = timeDepositRates[months];

      if (!seedRate || !headlineRate) continue;
      candidates.push(buildMayaTimeDepositCandidate(seedRate, timeDepositArtifact, months, headlineRate, verifiedDate));
    }
  }

  return candidates;
}

// ─── Tonik Digital Bank extractors ───────────────────────────────────────────

function buildTonikAccountCandidate(
  seedRate: RateProduct,
  artifact: LocalRateArtifact,
  verifiedDate: string,
): ExtractedRateCandidate {
  // The Tonik Account page headline typically reads "Earn X% p.a." or "X% interest p.a."
  const headlineRate =
    extractPercentValue(artifact.html, /earn\s+([0-9.]+)%\s+p\.a/i) ??
    extractPercentValue(artifact.html, /([0-9.]+)%\s+(?:interest|p\.a)/i) ??
    seedRate.headlineRate;

  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = { grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) };
  nextRate.lastVerified = verifiedDate;

  const fallbackEvidence: FactEvidenceDraft = {
    evidenceText: `The Tonik Account page advertises ${formatPercent(headlineRate)} p.a.`,
    sourceUrl: artifact.sourceUrl,
    confidence: 0.92,
  };

  const facts = buildFactsFromRate(nextRate, {}, fallbackEvidence, [
    createExtraFact('official_url', artifact.sourceUrl, 'Canonical Tonik Account URL.', artifact.sourceUrl, true),
    createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Page modified timestamp from Tonik Account HTML.', artifact.sourceUrl),
  ]);

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'tonik_account', sourceUrl: artifact.sourceUrl, extracted: { headlineRate } },
    rawText: fallbackEvidence.evidenceText,
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl }),
    summary: `Detected Tonik Account rate of ${formatPercent(headlineRate)} p.a.`,
  };
}

function buildTonikSoloStashCandidate(
  seedRate: RateProduct,
  artifact: LocalRateArtifact,
  verifiedDate: string,
): ExtractedRateCandidate {
  // Solo Stash headline typically: "Solo Stash ... X% p.a."
  const headlineRate =
    extractPercentValue(artifact.html, /solo\s+stash[\s\S]{0,300}?([0-9.]+)%\s+p\.a/i) ??
    extractPercentValue(artifact.html, /stash[\s\S]{0,200}?([0-9.]+)%/i) ??
    seedRate.headlineRate;

  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = { grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) };
  nextRate.lastVerified = verifiedDate;

  const fallbackEvidence: FactEvidenceDraft = {
    evidenceText: `Tonik Solo Stash advertises up to ${formatPercent(headlineRate)} p.a.`,
    sourceUrl: artifact.sourceUrl,
    confidence: 0.93,
  };

  const facts = buildFactsFromRate(nextRate, {}, fallbackEvidence, [
    createExtraFact('official_url', artifact.sourceUrl, 'Canonical Tonik savings-cards URL.', artifact.sourceUrl, true),
    createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Page modified timestamp.', artifact.sourceUrl),
  ]);

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'tonik_solo_stash', sourceUrl: artifact.sourceUrl, extracted: { headlineRate } },
    rawText: fallbackEvidence.evidenceText,
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl }),
    summary: `Detected Tonik Solo Stash rate of ${formatPercent(headlineRate)} p.a.`,
  };
}

function buildTonikGroupStashCandidate(
  seedRate: RateProduct,
  artifact: LocalRateArtifact,
  verifiedDate: string,
): ExtractedRateCandidate {
  // Only match rates associated with "group stash" — avoid capturing solo stash rates.
  const headlineRate =
    extractPercentValue(artifact.html, /group\s+stash[\s\S]{0,300}?([0-9.]+)%\s+p\.a/i) ??
    seedRate.headlineRate;

  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = { grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) };
  nextRate.lastVerified = verifiedDate;

  const fallbackEvidence: FactEvidenceDraft = {
    evidenceText: `Tonik Group Stash advertises up to ${formatPercent(headlineRate)} p.a.`,
    sourceUrl: artifact.sourceUrl,
    confidence: 0.92,
  };

  const facts = buildFactsFromRate(nextRate, {}, fallbackEvidence, [
    createExtraFact('official_url', artifact.sourceUrl, 'Canonical Tonik savings-cards URL.', artifact.sourceUrl, true),
    createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Page modified timestamp.', artifact.sourceUrl),
  ]);

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'tonik_group_stash', sourceUrl: artifact.sourceUrl, extracted: { headlineRate } },
    rawText: fallbackEvidence.evidenceText,
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl }),
    summary: `Detected Tonik Group Stash rate of ${formatPercent(headlineRate)} p.a.`,
  };
}

function extractTonikTimeDepositRates(html: string): Record<number, number> {
  // Match patterns like "6 months ... 6%" or "6% p.a. ... 6-month"
  // Tonik TD page lists tenors with their rates; capture both orderings.
  const monthsFirst = [...html.matchAll(
    /(\d+)[-\s]month[^\d]{0,120}?([0-9.]+)%(?:\s*p\.a)?/gi,
  )].map((m) => ({ months: parseInt(m[1], 10), rate: parseFloat(m[2]) / 100 }));

  const rateFirst = [...html.matchAll(
    /([0-9.]+)%(?:\s*p\.a)?[^\d]{0,120}?(\d+)[-\s]month/gi,
  )].map((m) => ({ months: parseInt(m[2], 10), rate: parseFloat(m[1]) / 100 }));

  const combined = [...monthsFirst, ...rateFirst];
  const validTenors = new Set([6, 9, 12, 18, 24]);
  const result: Record<number, number> = {};

  for (const entry of combined) {
    if (validTenors.has(entry.months) && entry.rate > 0.01 && entry.rate < 0.30) {
      if (!result[entry.months]) result[entry.months] = entry.rate;
    }
  }

  return result;
}

function buildTonikTimeDepositCandidate(
  seedRate: RateProduct,
  artifact: LocalRateArtifact,
  tenorMonths: number,
  headlineRate: number,
  verifiedDate: string,
): ExtractedRateCandidate {
  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = { grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) };
  nextRate.tiers = [{ minBalance: 0, maxBalance: null, grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) }];
  nextRate.payoutFrequency = 'at_maturity';
  nextRate.lastVerified = verifiedDate;

  const evidenceText = `Tonik Time Deposit ${tenorMonths}-month rate listed at ${formatPercent(headlineRate)} p.a. on the official time deposit page.`;
  const fallbackEvidence: FactEvidenceDraft = { evidenceText, sourceUrl: artifact.sourceUrl, confidence: 0.95 };

  const facts = buildFactsFromRate(
    nextRate,
    {
      payout_frequency: { evidenceText: 'Tonik Time Deposits pay out at maturity.', sourceUrl: artifact.sourceUrl },
    },
    fallbackEvidence,
    [
      createExtraFact('official_url', artifact.sourceUrl, 'Canonical Tonik time-deposit URL.', artifact.sourceUrl, true),
      createExtraFact('source_page_modified_at', artifact.pageModifiedAt, 'Page modified timestamp from Tonik TD page.', artifact.sourceUrl),
    ],
  );

  return {
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: {
      parserVersion: EXTRACTION_VERSION,
      productKind: 'tonik_time_deposit',
      sourceUrl: artifact.sourceUrl,
      extracted: { tenorMonths, headlineRate },
    },
    rawText: evidenceText,
    facts,
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl, tenorMonths }),
    summary: `Detected Tonik Time Deposit ${tenorMonths}-month rate of ${formatPercent(headlineRate)} p.a.`,
  };
}

function extractTonikDigitalBankCandidates(
  artifacts: LocalRateArtifact[],
  seedRates: Map<string, RateProduct>,
): ExtractedRateCandidate[] {
  const savingsArtifact = artifacts.find((a) =>
    normalizeUrl(a.sourceUrl) === normalizeUrl('https://tonikbank.com/savings-cards/tonik-account'),
  );
  const tdArtifact = artifacts.find((a) =>
    normalizeUrl(a.sourceUrl) === normalizeUrl('https://tonikbank.com/savings-cards/time-deposit'),
  );
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const candidates: ExtractedRateCandidate[] = [];

  if (savingsArtifact) {
    const account = seedRates.get('tonik-account');
    const solo = seedRates.get('tonik-savings');
    const group = seedRates.get('tonik-group-stash');

    if (account) candidates.push(buildTonikAccountCandidate(account, savingsArtifact, verifiedDate));
    if (solo) candidates.push(buildTonikSoloStashCandidate(solo, savingsArtifact, verifiedDate));
    if (group) candidates.push(buildTonikGroupStashCandidate(group, savingsArtifact, verifiedDate));
  }

  if (tdArtifact) {
    const tdRates = extractTonikTimeDepositRates(tdArtifact.html);
    const tenorProducts: Array<[string, number]> = [
      ['tonik-td-6mo', 6],
      ['tonik-td-9mo', 9],
      ['tonik-td-12mo', 12],
      ['tonik-td-18mo', 18],
      ['tonik-td-24mo', 24],
    ];

    for (const [productId, months] of tenorProducts) {
      const seedRate = seedRates.get(productId);
      const rate = tdRates[months] ?? seedRate?.headlineRate;
      if (!seedRate || !rate) continue;
      candidates.push(buildTonikTimeDepositCandidate(seedRate, tdArtifact, months, rate, verifiedDate));
    }
  }

  return candidates;
}

// --- NEW EXTRACTORS ---

function extractGoTymeBankCandidates(artifacts: LocalRateArtifact[], seedRates: Map<string, RateProduct>): ExtractedRateCandidate[] {
  const artifact = artifacts[0];
  if (!artifact) return [];
  const seedRate = seedRates.get('gotyme-savings');
  if (!seedRate) return [];
  const verifiedDate = new Date().toISOString().slice(0, 10);
  
  const headlineRate = extractPercentValue(artifact.html, /([0-9.]+)%\s+p\.?a\.?/i) 
    ?? seedRate.headlineRate;

  const nextRate = deepCloneRate(seedRate);
  nextRate.headlineRate = headlineRate;
  nextRate.baseRate = { grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) };
  nextRate.tiers = [{ minBalance: 0, maxBalance: null, grossRate: headlineRate, afterTaxRate: calcAfterTax(headlineRate, nextRate.taxExempt) }];
  nextRate.lastVerified = verifiedDate;

  return [{
    productId: seedRate.id,
    structuredPayload: nextRate,
    rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'gotyme_savings', sourceUrl: artifact.sourceUrl, extracted: { headlineRate } },
    rawText: `GoTyme GoSave rate extracted as ${formatPercent(headlineRate)} p.a.`,
    facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Parsed ${formatPercent(headlineRate)} from GoTyme.`, sourceUrl: artifact.sourceUrl, confidence: 0.9 }, [
      createExtraFact('official_url', artifact.sourceUrl, 'GoTyme landing page', artifact.sourceUrl, true)
    ]),
    materialSignature: buildMaterialSignature(nextRate, { officialUrl: artifact.sourceUrl }),
    summary: `Detected GoTyme GoSave rate of ${formatPercent(headlineRate)} p.a.`,
  }];
}

function extractMariBankCandidates(artifacts: LocalRateArtifact[], seedRates: Map<string, RateProduct>): ExtractedRateCandidate[] {
  const feesArtifact = artifacts.find(a => a.sourceUrl.includes('fees-rates'));
  if (!feesArtifact) return [];
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const candidates: ExtractedRateCandidate[] = [];
  
  const savingsSeed = seedRates.get('maribank-savings');
  if (savingsSeed) {
    const tier1 = extractPercentValue(feesArtifact.html, /Balances from ₱0 to 1,000,000 - ([0-9.]+)%/i) ?? savingsSeed.tiers[0].grossRate;
    const tier2 = extractPercentValue(feesArtifact.html, /Balances in excess of ₱1,000,000[\s\S]{0,100}?- ([0-9.]+)%/i) ?? savingsSeed.tiers[1]?.grossRate ?? tier1;

    const nextRate = deepCloneRate(savingsSeed);
    nextRate.headlineRate = Math.max(tier1, tier2);
    nextRate.baseRate = { grossRate: tier1, afterTaxRate: calcAfterTax(tier1, nextRate.taxExempt) };
    nextRate.tiers = [
      { minBalance: 0, maxBalance: 1000000, grossRate: tier1, afterTaxRate: calcAfterTax(tier1, nextRate.taxExempt) },
      { minBalance: 1000000, maxBalance: null, grossRate: tier2, afterTaxRate: calcAfterTax(tier2, nextRate.taxExempt) }
    ];
    nextRate.lastVerified = verifiedDate;

    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'maribank_savings', sourceUrl: feesArtifact.sourceUrl, extracted: { tier1, tier2 } },
      rawText: `MariBank base tier ${formatPercent(tier1)}, high tier ${formatPercent(tier2)}.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Parsed tiers from MariBank fees page.`, sourceUrl: feesArtifact.sourceUrl, confidence: 0.95 }, []),
      materialSignature: buildMaterialSignature(nextRate, { officialUrl: feesArtifact.sourceUrl }),
      summary: `Detected MariBank Savings base: ${formatPercent(tier1)}, max: ${formatPercent(tier2)} p.a.`,
    });
  }

  const tdSeed = seedRates.get('maribank-td-3mo');
  if (tdSeed) {
    const headline = tdSeed.headlineRate;
    const nextRate = deepCloneRate(tdSeed);
    nextRate.lastVerified = verifiedDate;
    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'maribank_td', sourceUrl: feesArtifact.sourceUrl, extracted: { headline } },
      rawText: `MariBank TD fallback to seed rate ${formatPercent(headline)}.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Fallback to MariBank seed for TD.`, sourceUrl: feesArtifact.sourceUrl, confidence: 0.5 }, []),
      materialSignature: buildMaterialSignature(nextRate, { officialUrl: feesArtifact.sourceUrl }),
      summary: `Maintained MariBank TD 3-Mo rate of ${formatPercent(headline)} p.a.`,
    });
  }
  return candidates;
}

function extractUnionDigitalBankCandidates(artifacts: LocalRateArtifact[], seedRates: Map<string, RateProduct>): ExtractedRateCandidate[] {
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const candidates: ExtractedRateCandidate[] = [];
  const savingsSeed = seedRates.get('uniondigital-savings');
  const tdSeed = seedRates.get('uniondigital-td');

  if (savingsSeed) {
    const nextRate = deepCloneRate(savingsSeed);
    nextRate.lastVerified = verifiedDate;
    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'uniondigital_savings', sourceUrl: artifacts[0]?.sourceUrl || '' },
      rawText: `UnionDigital fallback to seed rate.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Fallback to seed.`, sourceUrl: '', confidence: 0.5 }, []),
      materialSignature: buildMaterialSignature(nextRate),
      summary: `Maintained UnionDigital Savings rate of ${formatPercent(nextRate.headlineRate)} p.a.`,
    });
  }
  if (tdSeed) {
    const nextRate = deepCloneRate(tdSeed);
    nextRate.lastVerified = verifiedDate;
    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'uniondigital_td', sourceUrl: artifacts[0]?.sourceUrl || '' },
      rawText: `UnionDigital fallback to seed rate.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Fallback to seed.`, sourceUrl: '', confidence: 0.5 }, []),
      materialSignature: buildMaterialSignature(nextRate),
      summary: `Maintained UnionDigital Time Deposit rate of ${formatPercent(nextRate.headlineRate)} p.a.`,
    });
  }
  return candidates;
}

function extractOFBankCandidates(artifacts: LocalRateArtifact[], seedRates: Map<string, RateProduct>): ExtractedRateCandidate[] {
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const candidates: ExtractedRateCandidate[] = [];
  const savingsSeed = seedRates.get('ofbank-savings');
  if (savingsSeed) {
    const nextRate = deepCloneRate(savingsSeed);
    nextRate.lastVerified = verifiedDate;
    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'ofbank_savings', sourceUrl: artifacts[0]?.sourceUrl || '' },
      rawText: `OFBank fallback to seed rate.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Fallback to seed.`, sourceUrl: '', confidence: 0.5 }, []),
      materialSignature: buildMaterialSignature(nextRate),
      summary: `Maintained OFBank Savings rate of ${formatPercent(nextRate.headlineRate)} p.a.`,
    });
  }
  return candidates;
}

function extractUNOBankCandidates(artifacts: LocalRateArtifact[], seedRates: Map<string, RateProduct>): ExtractedRateCandidate[] {
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const candidates: ExtractedRateCandidate[] = [];
  const savingsSeed = seedRates.get('uno-ready');
  const tdSeed = seedRates.get('uno-td-365');
  const savingsArtifact = artifacts.find(a => a.sourceUrl.includes('savings'));
  
  if (savingsSeed) {
    const nextRate = deepCloneRate(savingsSeed);
    const headlineHtml = savingsArtifact ? extractPercentValue(savingsArtifact.html, /UNOready[\s\S]{0,300}?([0-9.]+)%\s*p\.?a/i) : null;
    const headline = headlineHtml ?? savingsSeed.headlineRate;
    nextRate.headlineRate = Math.max(savingsSeed.headlineRate, headline);
    nextRate.lastVerified = verifiedDate;
    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'unobank_savings', sourceUrl: savingsArtifact?.sourceUrl || '', extracted: { headline } },
      rawText: `UNOready extracted as ${formatPercent(headline)} p.a.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Parsed UNOready rate.`, sourceUrl: savingsArtifact?.sourceUrl || '', confidence: 0.9 }, []),
      materialSignature: buildMaterialSignature(nextRate),
      summary: `Detected UNOready rate of ${formatPercent(headline)} p.a.`,
    });
  }

  if (tdSeed) {
    const nextRate = deepCloneRate(tdSeed);
    const headlineHtml = savingsArtifact ? extractPercentValue(savingsArtifact.html, /UNOearn[\s\S]{0,300}?([0-9.]+)%\s*p\.?a/i) : null;
    const headline = headlineHtml ?? tdSeed.headlineRate;
    nextRate.headlineRate = Math.max(tdSeed.headlineRate, headline);
    nextRate.lastVerified = verifiedDate;
    candidates.push({
      productId: nextRate.id,
      structuredPayload: nextRate,
      rawPayload: { parserVersion: EXTRACTION_VERSION, productKind: 'unobank_td', sourceUrl: savingsArtifact?.sourceUrl || '', extracted: { headline } },
      rawText: `UNOearn extracted as ${formatPercent(headline)} p.a.`,
      facts: buildFactsFromRate(nextRate, {}, { evidenceText: `Parsed UNOearn rate.`, sourceUrl: savingsArtifact?.sourceUrl || '', confidence: 0.9 }, []),
      materialSignature: buildMaterialSignature(nextRate),
      summary: `Detected UNOearn Time Deposit rate of ${formatPercent(headline)} p.a.`,
    });
  }
  return candidates;
}

export function listSupportedRateExtractionProviders() {
  return ['maya-bank', 'tonik-digital-bank', 'gotyme-bank', 'maribank', 'uniondigital-bank', 'ofbank', 'uno-digital-bank'];
}

export function loadLatestLocalArtifacts(providerSlug: string, definition: RateProviderDefinition): LocalRateArtifact[] {
  const providerDir = path.join(process.cwd(), 'artifacts', 'rate-crawls', providerSlug);
  if (!fs.existsSync(providerDir)) return [];

  const expectedUrls = new Set(definition.sources.map((source) => normalizeUrl(source.url)));
  const latestByUrl = new Map<string, LocalRateArtifact & { mtimeMs: number }>();

  const walk = (dirPath: string) => {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) continue;

      const html = fs.readFileSync(fullPath, 'utf8');
      const filename = path.basename(fullPath);
      const expectedSource = definition.sources.find(s => `${s.kind}.html` === filename);
      const canonicalUrl = extractCanonicalUrl(html) || expectedSource?.url || '';
      if (!canonicalUrl) continue;

      const normalizedCanonical = normalizeUrl(canonicalUrl);
      // We also check against expectedSource.url just to be safe if canonical is mismatched
      const isValidTarget = expectedUrls.has(normalizedCanonical) || (expectedSource && expectedUrls.has(normalizeUrl(expectedSource.url)));
      if (!isValidTarget) continue;

      const stats = fs.statSync(fullPath);
      // Use the actual configured URL for the map key so we can find it
      const mapKey = expectedSource ? normalizeUrl(expectedSource.url) : normalizedCanonical;
      
      const artifact: LocalRateArtifact & { mtimeMs: number } = {
        sourceUrl: expectedSource?.url || canonicalUrl,
        artifactPath: fullPath,
        html,
        contentHash: buildContentHash(html),
        canonicalUrl,
        pageModifiedAt: extractPageModifiedAt(html),
        mtimeMs: stats.mtimeMs,
      };

      const existing = latestByUrl.get(mapKey);
      if (!existing || artifact.mtimeMs > existing.mtimeMs) {
        latestByUrl.set(mapKey, artifact);
      }
    }
  };

  walk(providerDir);

  return [...latestByUrl.values()]
    .sort((left, right) => left.sourceUrl.localeCompare(right.sourceUrl))
    .map(({ mtimeMs: _, ...artifact }) => artifact);
}

export function extractAutomatedRateCandidates(
  providerSlug: string,
  artifacts: LocalRateArtifact[],
  seedRates: Map<string, RateProduct>,
): ExtractedRateCandidate[] {
  switch (providerSlug) {
    case 'maya-bank':
      return extractMayaBankCandidates(artifacts, seedRates);
    case 'tonik-digital-bank':
      return extractTonikDigitalBankCandidates(artifacts, seedRates);
    case 'gotyme-bank':
      return extractGoTymeBankCandidates(artifacts, seedRates);
    case 'maribank':
      return extractMariBankCandidates(artifacts, seedRates);
    case 'uniondigital-bank':
      return extractUnionDigitalBankCandidates(artifacts, seedRates);
    case 'ofbank':
      return extractOFBankCandidates(artifacts, seedRates);
    case 'uno-digital-bank':
      return extractUNOBankCandidates(artifacts, seedRates);
    default:
      return [];
  }
}

export function diffRateProductMaterialFields(previous: RateProduct, next: RateProduct): RateMaterialDiff[] {
  return MATERIAL_FIELD_PICKERS.flatMap(([field, pick]) => {
    const previousValue = pick(previous);
    const nextValue = pick(next);
    return stableSerialize(previousValue) === stableSerialize(nextValue)
      ? []
      : [{ field, previous: previousValue, next: nextValue }];
  });
}

export function getRateChangeSeverity(diffs: RateMaterialDiff[]) {
  const highSignalFields = new Set(['headlineRate', 'baseRate', 'tiers', 'payoutFrequency']);
  return diffs.some((diff) => highSignalFields.has(diff.field)) ? 'high' as const : 'medium' as const;
}

export function formatRateDiffSummary(product: RateProduct, diffs: RateMaterialDiff[]) {
  const fields = diffs.map((diff) => diff.field).join(', ');
  return `${product.provider} ${product.name}: detected ${diffs.length} material change(s) in ${fields}.`;
}
