import { createSupabaseServerClient } from '@/lib/supabase';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { CreditCard } from '@/types';
import { normalizeRewardType } from '@/lib/creditCardFinder/detail';
import editorial from '@/lib/creditCardEditorial';
import { REWARDS_FALLBACK_REGISTRY } from '@/lib/creditCardRewardsFallback';

// getEditorialFor now lives in the (client-safe) editorial module so client
// components can import it too. Re-exported here for existing server callers.
export { getEditorialFor, type CardEditorial } from '@/lib/creditCardEditorial';

const BANK_LOGO_MAP: Record<string, string> = {
  'Bank of the Philippine Islands': '/logos/bpi.svg',
  'Bank of the Philippine Islands (BPI)': '/logos/bpi.svg',
  'East West Banking Corporation': '/logos/eastwest-mark.png',
  'Metrobank': '/logos/metrobank-mark.png',
  'Metrobank Card Corporation': '/logos/metrobank-mark.png',
  'Metropolitan Bank and Trust Company': '/logos/metrobank-mark.png',
  'RCBC': '/logos/rcbc.svg',
  'Rizal Commercial Banking Corporation': '/logos/rcbc.svg',
  'Rizal Commercial Banking Corporation (RCBC)': '/logos/rcbc.svg',
  'Security Bank Corporation': '/logos/securitybank-mark.png',
  'HSBC Philippines': '/logos/hsbc.svg',
  'Asia United Bank': '/logos/aub.svg',
  'BDO Unibank, Inc.': '/logos/bdo.svg',
};

function deriveLogo(bank: string): string {
  return BANK_LOGO_MAP[bank] ?? '/logos/default-bank.svg';
}

/**
 * Collapses issuer name variants to one display name so the catalog bank
 * filter, finder, and analytics treat a bank as a single entity (assessment
 * C5). Code-level only — never written back to web_weaver (read-only data
 * boundary). Canonical targets stay keyed in BANK_LOGO_MAP and (in
 * creditCardEditorial) BANK_PROMO_TC_URL so logo and promo-T&C lookups keep
 * resolving.
 */
const BANK_NAME_CANONICAL: Record<string, string> = {
  'Bank of the Philippine Islands (BPI)': 'Bank of the Philippine Islands',
  'Metrobank Card Corporation': 'Metrobank',
  'Metropolitan Bank & Trust Company': 'Metrobank',
  'Metropolitan Bank and Trust Company': 'Metrobank',
};

function canonicalizeBankName(bank: string): string {
  return BANK_NAME_CANONICAL[bank] ?? bank;
}

/**
 * Canonical key for deduping rows that describe the same product but were
 * upserted under inconsistent `normalized_card_key` values (e.g. "hsbc live
 * credit card" vs "hsbc_live_plus_credit_card"). The WebWeaver v2 contract is
 * supposed to enforce snake_case keys (see docs/webweaver-credit-card-data-
 * contract.md), but live data still has mixed formats. We canonicalise by
 * lowercasing the card name, dropping "+" and other punctuation, then
 * collapsing whitespace. This is deliberately conservative — it only collides
 * rows whose product names match after that normalisation.
 */
function canonicalCardKey(card: Pick<CreditCard, 'card_name'>): string {
  return card.card_name
    .toLowerCase()
    .replace(/\+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPublicFeeWaiverCondition(raw: string | null): string | null {
  if (!raw) return raw;
  return raw
    .replace(/\bno unconditional NAFFL\b/gi, 'no automatic lifetime fee waiver')
    .replace(/\bNAFFL\b/gi, 'no yearly fee for life');
}

function attachLogo(row: Omit<CreditCard, 'logo'>): CreditCard {
  const normType = normalizeRewardType(row.rewards_type);
  const canonKey = canonicalCardKey(row);
  const fallback = REWARDS_FALLBACK_REGISTRY[canonKey];
  const bank = canonicalizeBankName(row.bank);

  const dbFormula = row.rewards_formula as Record<string, unknown> | null;
  const hasDbEarnRate = dbFormula && typeof dbFormula.earn_rate === 'number' && dbFormula.earn_rate > 0;
  
  const finalFormula = hasDbEarnRate
    ? dbFormula
    : (fallback?.rewards_formula ?? dbFormula);

  const finalType = normType || (fallback?.rewards_type ?? null);
  const finalWaiverCondition =
    row.annual_fee_waiver_condition ?? (fallback?.annual_fee_waiver_condition ?? null);

  return {
    ...row,
    bank,
    logo: deriveLogo(bank),
    rewards_type: finalType,
    rewards_formula: finalFormula,
    annual_fee_recurring: row.annual_fee_recurring ?? (fallback?.annual_fee_recurring ?? null),
    naffl: row.naffl ?? (fallback?.naffl ?? null),
    annual_fee_waiver_condition: cleanPublicFeeWaiverCondition(finalWaiverCondition),
    annual_fee_waiver_threshold:
      row.annual_fee_waiver_threshold ?? (fallback?.annual_fee_waiver_threshold ?? null),
    min_income_monthly: row.min_income_monthly ?? (fallback?.min_income_monthly ?? null),
    foreign_transaction_fee_pct: row.foreign_transaction_fee_pct ?? (fallback?.foreign_transaction_fee_pct ?? null),
  };
}

/** Counts populated, decision-relevant fields. Used to pick the "fuller" row. */
function completenessScore(card: CreditCard): number {
  let n = 0;
  if (card.naffl === true || card.annual_fee_recurring !== null) n++;
  if (card.min_income_monthly !== null || card.min_income_annual !== null) n++;
  if (card.interest_rate_pct !== null) n++;
  if (card.foreign_transaction_fee_pct !== null) n++;
  if (card.annual_fee_waiver_condition !== null) n++;
  if (card.rewards_formula !== null) n++;
  if (card.rewards_type !== null) n++;
  if (card.card_network !== null) n++;
  if (card.last_scraped_at) n++;
  return n;
}

/**
 * Merges two duplicate-product rows. `more` is the fuller row (its values win
 * on conflict); `less` only fills in fields the fuller row has as null. We bias
 * the kept `normalized_card_key` toward the variant that has a hand-written
 * editorial entry so per-card review URLs land on the richest copy.
 */
function mergeCards(more: CreditCard, less: CreditCard): CreditCard {
  const out: CreditCard = { ...less, ...more };
  // Field-by-field: if `more` has null/undefined and `less` has a real value,
  // borrow it from `less`. Cheap loop over a small, flat shape.
  const moreRecord = more as unknown as Record<string, unknown>;
  const lessRecord = less as unknown as Record<string, unknown>;
  const outRecord = out as unknown as Record<string, unknown>;
  (Object.keys(out) as Array<keyof CreditCard>).forEach((k) => {
    const mv = moreRecord[k as string];
    const lv = lessRecord[k as string];
    if ((mv === null || mv === undefined) && lv !== null && lv !== undefined) {
      outRecord[k as string] = lv;
    }
  });
  // Editorial-aware key choice.
  const moreHasEd = Boolean(editorial[more.normalized_card_key]);
  const lessHasEd = Boolean(editorial[less.normalized_card_key]);
  if (lessHasEd && !moreHasEd) {
    out.normalized_card_key = less.normalized_card_key;
  } else {
    out.normalized_card_key = more.normalized_card_key;
  }
  // Newest scrape date.
  if (more.last_scraped_at && less.last_scraped_at) {
    out.last_scraped_at =
      new Date(less.last_scraped_at).getTime() > new Date(more.last_scraped_at).getTime()
        ? less.last_scraped_at
        : more.last_scraped_at;
  }
  // Max active_promo_count (numbers should aggregate, not overwrite).
  out.active_promo_count = Math.max(more.active_promo_count, less.active_promo_count);
  // Prefer the shorter, more user-friendly bank name when both rows have one
  // (e.g. "HSBC Philippines" beats "The Hongkong and Shanghai Banking
  // Corporation Limited (HSBC Philippines)"). Re-derive the logo so the bank
  // mark still resolves through BANK_LOGO_MAP.
  if (more.bank && less.bank && less.bank.length < more.bank.length) {
    out.bank = less.bank;
  }
  out.logo = deriveLogo(out.bank);
  return out;
}

/**
 * Collapses rows that describe the same product into a single richer row.
 * Order of inputs doesn't matter — for each canonical key we keep the most
 * complete row and let any duplicates top up its null fields.
 */
function dedupeCards(cards: CreditCard[]): CreditCard[] {
  const byKey = new Map<string, CreditCard>();
  for (const c of cards) {
    const k = canonicalCardKey(c);
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, c);
      continue;
    }
    const [more, less] =
      completenessScore(c) > completenessScore(existing) ? [c, existing] : [existing, c];
    byKey.set(k, mergeCards(more, less));
  }
  return Array.from(byKey.values());
}

export async function getCreditCards(): Promise<CreditCard[]> {
  const supabase = createSupabaseAdminClient('public') ?? await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('truva_credit_cards')
    .select('*')
    .order('bank', { ascending: true })
    .order('card_name', { ascending: true });

  if (error) {
    console.error('getCreditCards error:', error.message);
    return [];
  }

  return dedupeCards((data ?? []).map(attachLogo));
}

export async function getCreditCardBySlug(slug: string): Promise<CreditCard | null> {
  // Resolve against the deduped list so the merged card answers for any of the
  // duplicate-row slugs (e.g. both `hsbc live credit card` and
  // `hsbc_live_plus_credit_card` should return the same merged card).
  const cards = await getCreditCards();
  const direct = cards.find((c) => c.normalized_card_key === slug);
  if (direct) return direct;
  // Fall back to canonical-name match for old/alternate slug shapes.
  const target = slug
    .toLowerCase()
    .replace(/\+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cards.find((c) => canonicalCardKey(c) === target) ?? null;
}

export async function getCreditCardsByRubric(
  rubric: 'cashback' | 'travel' | 'grocery' | 'naffl' | 'beginner' | 'premium' | 'online'
): Promise<CreditCard[]> {
  const cards = await getCreditCards();

  const rubricFilters: Record<typeof rubric, (c: CreditCard) => boolean> = {
    cashback: (c) => c.rewards_type === 'cashback',
    travel:   (c) => c.rewards_type === 'miles' || (c.card_tier === 'signature' || c.card_tier === 'infinite'),
    grocery:  (c) => c.rewards_type === 'cashback' || c.rewards_type === 'points',
    naffl:    (c) => c.naffl === true,
    beginner: (c) => c.card_tier === 'classic' || (c.min_income_monthly !== null && c.min_income_monthly <= 20_000),
    premium:  (c) => c.card_tier === 'signature' || c.card_tier === 'infinite' || c.card_tier === 'platinum',
    online:   (c) => c.rewards_type === 'cashback' || c.rewards_type === 'points',
  };

  return cards.filter(rubricFilters[rubric]);
}
