import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

type PublicCreditCardRow = {
  id: string;
  bank: string | null;
  card_name: string | null;
  normalized_card_key: string | null;
  annual_fee_first_year: number | string | null;
  annual_fee_recurring: number | string | null;
  naffl: boolean | null;
  annual_fee_waiver_condition: string | null;
  interest_rate_pct: number | string | null;
  foreign_transaction_fee_pct: number | string | null;
  cash_advance_fee_pct: number | string | null;
  cash_advance_fee_amount: number | string | null;
  late_payment_fee_amount: number | string | null;
  min_income_monthly: number | string | null;
  min_income_annual: number | string | null;
  source_url: string | null;
  last_scraped_at: string | null;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function supabaseKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

function num(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function describe(row: PublicCreditCardRow): string {
  return `${row.bank ?? 'Unknown bank'} - ${row.card_name ?? 'Unknown card'} (${row.normalized_card_key ?? 'missing-key'})`;
}

function addIf(condition: boolean, list: string[], message: string) {
  if (condition) list.push(message);
}

const CASH_ADVANCE_NOT_AVAILABLE_KEYS = new Set([
  'aub_easy_mastercard',
  'aub_classic_mastercard',
  'aub_gold_mastercard',
  'aub_platinum_mastercard',
]);
const INCOME_NOT_APPLICABLE_KEYS = new Set([
  'bdo_secured_credit_card',
  'bdo_world_elite_mastercard',
]);

async function main() {
  const supabase = createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), supabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('truva_credit_cards')
    .select(`
      id,
      bank,
      card_name,
      normalized_card_key,
      annual_fee_first_year,
      annual_fee_recurring,
      naffl,
      annual_fee_waiver_condition,
      interest_rate_pct,
      foreign_transaction_fee_pct,
      cash_advance_fee_pct,
      cash_advance_fee_amount,
      late_payment_fee_amount,
      min_income_monthly,
      min_income_annual,
      source_url,
      last_scraped_at
    `)
    .order('bank', { ascending: true })
    .order('card_name', { ascending: true });

  if (error) {
    throw new Error(`Unable to load public credit cards: ${error.message}`);
  }

  const rows = (data ?? []) as PublicCreditCardRow[];
  const issues: string[] = [];
  const warnings: string[] = [];
  const seenKeys = new Set<string>();

  for (const row of rows) {
    const label = describe(row);
    const key = row.normalized_card_key?.trim() ?? '';
    const waiver = row.annual_fee_waiver_condition?.trim() ?? '';
    const cashAdvanceNotApplicable = CASH_ADVANCE_NOT_AVAILABLE_KEYS.has(key);
    const incomeNotApplicable = INCOME_NOT_APPLICABLE_KEYS.has(key);

    addIf(!key, issues, `${label}: missing normalized_card_key`);
    if (key) {
      addIf(seenKeys.has(key), issues, `${label}: duplicate normalized_card_key`);
      seenKeys.add(key);
    }

    addIf(!row.source_url, issues, `${label}: missing source_url`);
    addIf(!row.last_scraped_at, issues, `${label}: missing last_scraped_at`);

    addIf(/\bNAFFL\b/i.test(waiver), issues, `${label}: raw NAFFL appears in fee waiver copy`);
    addIf(/^naffl$/i.test(waiver), issues, `${label}: raw fee waiver code appears in public copy`);

    const annualFee = num(row.annual_fee_recurring);
    addIf(row.naffl === true && annualFee !== null && annualFee > 0, issues, `${label}: marked no-yearly-fee but has recurring fee ${annualFee}`);

    const percentages: Array<[string, number | null]> = [
      ['interest_rate_pct', num(row.interest_rate_pct)],
      ['foreign_transaction_fee_pct', num(row.foreign_transaction_fee_pct)],
      ['cash_advance_fee_pct', num(row.cash_advance_fee_pct)],
    ];

    for (const [field, value] of percentages) {
      if (value === null) continue;
      addIf(value < 0, issues, `${label}: ${field} is negative (${value})`);
      addIf(value > 20, issues, `${label}: ${field} looks unnormalized (${value})`);
    }

    const moneyFields: Array<[string, number | null]> = [
      ['annual_fee_first_year', num(row.annual_fee_first_year)],
      ['annual_fee_recurring', num(row.annual_fee_recurring)],
      ['cash_advance_fee_amount', num(row.cash_advance_fee_amount)],
      ['late_payment_fee_amount', num(row.late_payment_fee_amount)],
      ['min_income_monthly', num(row.min_income_monthly)],
      ['min_income_annual', num(row.min_income_annual)],
    ];

    for (const [field, value] of moneyFields) {
      addIf(value !== null && value < 0, issues, `${label}: ${field} is negative (${value})`);
    }

    addIf(
      num(row.annual_fee_recurring) === null && num(row.annual_fee_first_year) === null,
      warnings,
      `${label}: annual fee not populated`,
    );
    addIf(num(row.interest_rate_pct) === null, warnings, `${label}: interest rate not populated`);
    addIf(num(row.foreign_transaction_fee_pct) === null, warnings, `${label}: foreign card fee not populated`);
    addIf(
      !cashAdvanceNotApplicable &&
        num(row.cash_advance_fee_pct) === null &&
        num(row.cash_advance_fee_amount) === null,
      warnings,
      `${label}: cash advance fee not populated`,
    );
    addIf(num(row.late_payment_fee_amount) === null, warnings, `${label}: late payment fee not populated`);
    addIf(
      !incomeNotApplicable &&
        num(row.min_income_monthly) === null &&
        num(row.min_income_annual) === null,
      warnings,
      `${label}: income requirement not populated`,
    );
  }

  console.log('Credit-card data quality verifier');
  console.log(`Rows checked: ${rows.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Issues: ${issues.length}`);

  if (warnings.length > 0) {
    console.log('\nWarnings for follow-up official-source work:');
    for (const warning of warnings) console.log(`  - ${warning}`);
  }

  if (issues.length > 0) {
    console.error('\nIssues:');
    for (const issue of issues) console.error(`  - ${issue}`);
    process.exit(1);
  }

  console.log('\nAll public credit-card data quality checks passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
