import fs from 'node:fs';
import path from 'node:path';

import {
  compareBankingRateTableProducts,
  getBankingRateTableMetrics,
} from '@/lib/banking-rate-table';
import { normalizeRateProduct } from '@/lib/score';
import type { RateProduct } from '@/types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertClose(actual: number, expected: number, label: string, tolerance = 0.000001): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

function loadRates(): RateProduct[] {
  const ratesPath = path.join(process.cwd(), 'data', 'rates.json');
  const rawRates = JSON.parse(fs.readFileSync(ratesPath, 'utf8')) as unknown[];

  return rawRates.map((rate) => (
    normalizeRateProduct(rate as Parameters<typeof normalizeRateProduct>[0])
  ));
}

function findProduct(rates: RateProduct[], id: string): RateProduct {
  const product = rates.find((rate) => rate.id === id);
  assert(product, `Missing rate product ${id}`);
  return product;
}

const amount = 50_000;
const months = 12;
const rates = loadRates();

const salmon12 = findProduct(rates, 'salmon-td-12mo');
const tonik9 = findProduct(rates, 'tonik-td-9mo');

const salmonMetrics = getBankingRateTableMetrics(salmon12, amount, months);
const tonikMetrics = getBankingRateTableMetrics(tonik9, amount, months);

assertClose(salmonMetrics.amountFitGrossRate, 0.0613, 'Salmon 12-month amount-fit gross rate');
assertClose(salmonMetrics.grossInterest, 3_065, 'Salmon 12-month gross interest', 0.01);
assert(
  salmonMetrics.hasHigherHeadlineRate,
  'Salmon 12-month should disclose that its top listed rate is higher than the amount-fit rate',
);
assert(
  salmonMetrics.headlineGrossRate > salmonMetrics.amountFitGrossRate,
  'Salmon 12-month headline rate should not be used as the display rate at PHP 50,000',
);

assertClose(tonikMetrics.amountFitGrossRate, 0.07, 'Tonik 9-month amount-fit gross rate');
assertClose(tonikMetrics.grossInterest, 3_500, 'Tonik 9-month gross interest', 0.01);
assert(
  tonikMetrics.amountFitGrossRate > salmonMetrics.amountFitGrossRate,
  'Tonik 9-month should visibly show a higher amount-fit rate than Salmon 12-month at PHP 50,000',
);
assert(
  tonikMetrics.grossInterest > salmonMetrics.grossInterest,
  'Tonik 9-month should rank above Salmon 12-month by gross interest at PHP 50,000 / 12 months',
);

const ranked = [salmon12, tonik9].sort(compareBankingRateTableProducts(amount, months));
assert(
  ranked[0]?.id === tonik9.id,
  `Expected Tonik 9-month to sort above Salmon 12-month, received ${ranked.map((p) => p.id).join(', ')}`,
);

console.log(
  [
    'Banking rate table checks passed.',
    `Salmon 12-month amount-fit rate: ${formatPct(salmonMetrics.amountFitGrossRate)}.`,
    `Salmon 12-month gross interest: PHP ${salmonMetrics.grossInterest.toLocaleString('en-PH')}.`,
    `Top listed rate remains ${formatPct(salmonMetrics.headlineGrossRate)} for disclosure only.`,
  ].join(' '),
);
