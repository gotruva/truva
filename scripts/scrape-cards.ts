/**
 * scripts/scrape-cards.ts
 *
 * Scrapes credit card data from all major Philippine bank websites using Firecrawl,
 * then writes results to:
 *   1. data/credit-cards.json  — used by Next.js at build time (SSG)
 *   2. Supabase credit_cards   — source of truth for admin/future features
 *
 * Usage:
 *   npx tsx scripts/scrape-cards.ts
 *
 * Required env vars (in .env.local):
 *   FIRECRAWL_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import FirecrawlApp from '@mendable/firecrawl-js';
// Note: firecrawl's `extract` is flagged as deprecated in favour of `agent`,
// but the agent response type exposes `data` as `unknown` with no schema
// validation contract yet. We stay on `extract` until the new API stabilises
// and add a typed wrapper below to contain the ts hint in one place.
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env
// No Zod schema passed to Firecrawl — passing a Zod schema causes extract to
// return data:{} (empty). Instead we use a detailed prompt and parse the free-
// form response ourselves, mapping it to our CreditCard type.

// Prompt template — reused for every bank
const buildPrompt = (bank: string) => `
Extract ALL personal credit cards offered by ${bank} Philippines from the provided pages.
For each card return a JSON object with EXACTLY these fields:
- name: string (full product name)
- annualFee: number (PHP, 0 if free)
- annualFeeWaiverCondition: string | null (how to waive, or null)
- monthlyInterestRate: number (decimal, e.g. 0.03 for 3% — BSP cap is 3%)
- rewardType: "cashback" | "miles" | "points" | "none"
- minimumMonthlyIncome: number (PHP gross monthly income required)
- welcomePromo: string | null (current sign-up bonus or null)
- perks: string[] (up to 5 key benefits)
- bestFor: string (one sentence — who this card suits most)
- pros: string[] (2–4 genuine advantages)
- cons: string[] (2–4 real drawbacks)
- faqs: [{question: string, answer: string}] (2–3 common applicant questions)
- eligibilitySummary: string (age, income, citizenship, documents required)
- editorVerdict: string (2-sentence verdict: worth it, and for whom?)

Use the page data for hard numbers (fees, rates). Use your knowledge of Philippine
credit cards to fill in any missing qualitative fields (perks, pros, cons, eligibility).
Skip corporate or business cards — personal cards only.
Return the result as: { "cards": [ ...card objects ] }
`.trim();

// ---------------------------------------------------------------------------
// Target banks — all major Philippine credit card issuers
//
// `urls` — one or more pages passed to Firecrawl extract.
//   · Listing pages work when all card info is on one page (most banks).
//   · Individual card pages are used when listing pages are JS-heavy shells
//     with no extractable data (e.g. BPI renders cards via JS — we pass each
//     product page directly instead).
//   · Use `allowExternalLinks: true` in the extract call for listing pages
//     so Firecrawl can follow links to sub-pages automatically.
// ---------------------------------------------------------------------------

const TARGET_BANKS = [
  {
    bank: 'BPI',
    logo: '/logos/bpi.svg',
    // Listing page is a JS shell — pass individual product pages directly
    urls: [
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/bpi-blue-mastercard',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/bpi-gold-mastercard',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/bpi-platinum-rewards-mastercard',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/visa-signature',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/amore-visa-platinum',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/amore-visa-classic',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/bpi-edge-mastercard',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/robinsons-cashback-card',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/petron-bpi-mastercard',
      'https://www.bpi.com.ph/content/bpi/ph/en/personal/cards/credit-cards/bpi-ecredit-card',
    ],
  },
  {
    bank: 'UnionBank',
    logo: '/logos/unionbank.svg',
    urls: ['https://www.unionbankph.com/cards/credit-card'],
  },
  {
    bank: 'BDO',
    logo: '/logos/bdo.svg',
    urls: ['https://www.bdo.com.ph/personal/cards/credit-cards'],
  },
  {
    bank: 'Metrobank',
    logo: '/logos/metrobank.svg',
    urls: ['https://www.metrobank.com.ph/cards/credit-cards'],
  },
  {
    bank: 'Security Bank',
    logo: '/logos/security-bank.svg',
    urls: ['https://www.securitybank.com/personal/cards/credit-cards/'],
  },
  {
    bank: 'RCBC',
    logo: '/logos/rcbc.svg',
    urls: ['https://www.rcbc.com/personal-banking/credit-cards'],
  },
  {
    bank: 'EastWest Bank',
    logo: '/logos/eastwest.svg',
    urls: ['https://www.eastwestbanker.com/credit-cards'],
  },
  {
    bank: 'HSBC',
    logo: '/logos/hsbc.svg',
    urls: ['https://www.hsbc.com.ph/credit-cards/products/'],
  },
  {
    bank: 'Standard Chartered',
    logo: '/logos/standard-chartered.svg',
    urls: ['https://www.sc.com/ph/credit-cards/'],
  },
  {
    bank: 'PNB',
    logo: '/logos/pnb.svg',
    urls: ['https://www.pnb.com.ph/index.php/credit-cards'],
  },
  {
    bank: 'Maybank',
    logo: '/logos/maybank.svg',
    urls: ['https://www.maybank.com.ph/credit-cards.html'],
  },
  {
    bank: 'PSBank',
    logo: '/logos/psbank.svg',
    urls: ['https://www.psbank.com.ph/Personal/Cards/CreditCards'],
  },
  {
    bank: 'China Bank',
    logo: '/logos/china-bank.svg',
    urls: ['https://www.chinabank.ph/personal/credit-cards/'],
  },
  {
    bank: 'AUB',
    logo: '/logos/aub.svg',
    urls: ['https://www.aub.com.ph/personal/credit-card'],
  },
  {
    bank: 'Robinsons Bank',
    logo: '/logos/robinsons-bank.svg',
    urls: ['https://www.robinsonsbank.com.ph/personal-banking/credit-cards/'],
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CreditCard = {
  id: string;
  name: string;
  provider: string;
  logo: string;
  category: 'credit-cards';
  annualFee: number;
  annualFeeWaiverCondition: string | null;
  monthlyInterestRate: number;
  rewardType: 'cashback' | 'miles' | 'points' | 'none';
  minimumMonthlyIncome: number;
  welcomePromo: string | null;
  perks: string[];
  bestFor: string;
  pros: string[];
  cons: string[];
  faqs: { question: string; answer: string }[];
  eligibilitySummary: string;
  editorVerdict: string;
  isSponsored: boolean;
  sponsoredDisclosure?: string;
  affiliateUrl: string;
  trueValueScore: number;
};

// ---------------------------------------------------------------------------
// Typed extract wrapper — keeps the deprecation hint isolated
// ---------------------------------------------------------------------------

// Raw card shape from Firecrawl (unvalidated)
type RawCard = Record<string, unknown>;
type FirecrawlExtractResponse = {
  success?: boolean;
  data?: unknown;
};

type FirecrawlExtractApp = FirecrawlApp & {
  extract: (args: { urls: string[]; prompt: string }) => Promise<FirecrawlExtractResponse>;
};

async function extractCards(
  app: FirecrawlApp,
  urls: string[],
  bank: string,
): Promise<RawCard[]> {
  const response = await (app as FirecrawlExtractApp).extract({ urls, prompt: buildPrompt(bank) });
  if (!response?.success || !response.data) return [];
  // Firecrawl returns data as { someKey: [...] } — find the first array value
  const data = response.data as Record<string, unknown>;
  const arrayValue = Object.values(data).find(v => Array.isArray(v));
  return (arrayValue as RawCard[]) ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    console.error('FIRECRAWL_API_KEY is not set in your environment. Add it to .env.local and retry.');
    process.exit(1);
  }

  // --bank flag: scrape one bank at a time to conserve free-tier Firecrawl credits.
  // Usage:  npx tsx scripts/scrape-cards.ts --bank BPI
  // Omit flag to run all banks (uses more credits).
  const bankFilter = (() => {
    const idx = process.argv.indexOf('--bank');
    return idx !== -1 ? process.argv[idx + 1]?.toLowerCase() : null;
  })();

  const targets = bankFilter
    ? TARGET_BANKS.filter(t => t.bank.toLowerCase() === bankFilter)
    : TARGET_BANKS;

  if (bankFilter && !targets.length) {
    console.error(`No bank matched "${bankFilter}". Available: ${TARGET_BANKS.map(t => t.bank).join(', ')}`);
    process.exit(1);
  }

  // Seed from existing JSON so single-bank runs don't wipe cards from other banks.
  const cardMap = new Map<string, CreditCard>(loadExistingCards().map(c => [c.id, c]));

  const app = new FirecrawlApp({ apiKey: firecrawlKey });

  const failed: string[] = [];
  const succeeded: string[] = []; // banks that were scraped successfully (used for Supabase cleanup)
  let newCount = 0;

  console.log(`\nStarting scrape — ${targets.length} bank(s) targeted\n${'─'.repeat(50)}`);

  for (const target of targets) {
    console.log(`\n→ ${target.bank} (${target.urls.length} URL(s))`);

    try {
      const cards = await extractCards(app, target.urls, target.bank);

      if (!cards.length) {
        console.warn(`  ⚠ No cards extracted`);
        failed.push(target.bank);
        continue;
      }

      // Scrape succeeded — now safe to remove stale entries for this bank.
      // Doing this AFTER a successful scrape (not before) ensures that a
      // failed scrape never wipes existing data.
      Array.from(cardMap.entries()).forEach(([id, card]) => {
        if (card.provider === target.bank) cardMap.delete(id);
      });

      for (const card of cards) {
        const name = str(card.name);
        if (!name) continue; // skip cards with no name

        const mapped: CreditCard = {
          id: slugify(`${target.bank}-${stripBankPrefix(target.bank, name)}`),
          name,
          provider: target.bank,
          logo: target.logo,
          category: 'credit-cards',
          annualFee: num(card.annualFee, 0),
          annualFeeWaiverCondition: strOrNull(card.annualFeeWaiverCondition),
          monthlyInterestRate: clampInterestRate(num(card.monthlyInterestRate, 0.03)),
          rewardType: rewardType(card.rewardType),
          minimumMonthlyIncome: num(card.minimumMonthlyIncome, 0),
          welcomePromo: strOrNull(card.welcomePromo),
          perks: strArr(card.perks),
          bestFor: str(card.bestFor) || '',
          pros: strArr(card.pros),
          cons: strArr(card.cons),
          faqs: faqArr(card.faqs),
          eligibilitySummary: str(card.eligibilitySummary) || '',
          editorVerdict: str(card.editorVerdict) || '',
          isSponsored: false,
          affiliateUrl: '',
          trueValueScore: 3,
        };
        cardMap.set(mapped.id, mapped);
        console.log(`    · ${mapped.name}`);
        newCount++;
      }

      succeeded.push(target.bank);
      console.log(`  ✓ ${cards.length} card(s) extracted`);

    } catch (err) {
      console.error(`  ✗ Scrape failed:`, err);
      failed.push(target.bank);
    }

    // Polite delay — avoids hammering Firecrawl on free tier
    await delay(3000);
  }

  const allCards = Array.from(cardMap.values());

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`${newCount} new/updated card(s) | ${allCards.length} total in dataset`);
  console.log(`${targets.length - failed.length}/${targets.length} banks succeeded`);
  if (failed.length) console.warn(`Failed: ${failed.join(', ')}`);

  if (!allCards.length) {
    console.error('\nDataset is empty — aborting write.');
    process.exit(1);
  }

  // 1. Save to JSON (used by Next.js SSG build)
  saveJson(allCards);

  // 2. Sync to Supabase (source of truth for admin features)
  const providersToClear = succeeded.length ? succeeded : undefined;
  await syncToSupabase(allCards, providersToClear);

  console.log('\nDone.\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Safe cast helpers — RawCard values are `unknown`, these make mapping safe
// ---------------------------------------------------------------------------

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function strOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}
function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}
function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(item => str(item)).filter(Boolean);
}
function faqArr(v: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      question: str((item as Record<string, unknown>).question),
      answer: str((item as Record<string, unknown>).answer),
    }))
    .filter(faq => faq.question);
}
function rewardType(v: unknown): CreditCard['rewardType'] {
  const valid = ['cashback', 'miles', 'points', 'none'] as const;
  return valid.includes(v as CreditCard['rewardType']) ? (v as CreditCard['rewardType']) : 'none';
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripBankPrefix(bank: string, cardName: string): string {
  const escaped = bank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return cardName.replace(new RegExp(`^${escaped}[\\s\\-]+`, 'i'), '').trim();
}

/** BSP cap is 3% per month. If Firecrawl returns a clearly wrong value, clamp it. */
function clampInterestRate(rate: number): number {
  if (rate > 1) return rate / 100; // was passed as percentage e.g. 3 instead of 0.03
  return Math.min(rate, 0.03);
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadExistingCards(): CreditCard[] {
  const filePath = path.resolve(__dirname, '../data/credit-cards.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as CreditCard[];
  } catch {
    return [];
  }
}

function saveJson(cards: CreditCard[]) {
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const outputPath = path.join(dataDir, 'credit-cards.json');
  fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2));
  console.log(`\n✓ JSON saved → ${outputPath} (${cards.length} cards)`);
}

async function syncToSupabase(cards: CreditCard[], providersToClear?: string[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('\n⚠ Supabase env vars not set — skipping database sync.');
    console.warn('  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local to enable.');
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // Delete stale rows for re-scraped providers before upserting new ones.
  // This removes old IDs (e.g. bpi-bpi-gold-mastercard) that won't be overwritten
  // by the upsert because the new IDs are different strings.
  if (providersToClear?.length) {
    const { error: deleteError } = await supabase
      .from('credit_cards')
      .delete()
      .in('provider', providersToClear);
    if (deleteError) {
      console.warn(`\n⚠ Supabase delete failed for ${providersToClear.join(', ')}: ${deleteError.message}`);
    } else {
      console.log(`  → Deleted old rows for: ${providersToClear.join(', ')}`);
    }
  }

  // Map camelCase card fields to snake_case DB columns
  const rows = cards.map(c => ({
    id: c.id,
    name: c.name,
    provider: c.provider,
    logo: c.logo,
    category: c.category,
    annual_fee: c.annualFee,
    annual_fee_waiver_condition: c.annualFeeWaiverCondition,
    monthly_interest_rate: c.monthlyInterestRate,
    reward_type: c.rewardType,
    minimum_monthly_income: c.minimumMonthlyIncome,
    welcome_promo: c.welcomePromo,
    perks: c.perks,
    best_for: c.bestFor,
    pros: c.pros,
    cons: c.cons,
    faqs: c.faqs,
    eligibility_summary: c.eligibilitySummary,
    editor_verdict: c.editorVerdict,
    is_sponsored: c.isSponsored,
    sponsored_disclosure: c.sponsoredDisclosure ?? null,
    affiliate_url: c.affiliateUrl,
    true_value_score: c.trueValueScore,
    scraped_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('credit_cards')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('\n✗ Supabase sync failed:', error.message);
  } else {
    console.log(`✓ Supabase synced — ${rows.length} rows upserted into credit_cards`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
