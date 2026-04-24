import { AlertTriangle, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { MoneyMarketFund } from '@/types';
import {
  formatEstimatedAnnualEarnings,
  formatMmfMoney,
  formatMmfPercent,
  getFundDataIssue,
  getFundSourceDateLabel,
  redemptionLabel,
} from '@/lib/mmf';
import { MmfCtaButton } from './MmfCtaButton';
import { MMF_HELP_TEXT, MmfInfoLabel } from './MmfInfoLabel';
import { ProviderLogo } from './ProviderLogo';

export type MmfSortCol = 'net_yield' | 'min_initial' | 'trust_fee_pct' | 'redemption_days' | 'vs_benchmark';
export type MmfSortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: MmfSortDir }) {
  if (!active) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 opacity-35" aria-hidden="true" />;
  return dir === 'desc'
    ? <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
    : <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />;
}

type SortableHeaderProps = {
  col: MmfSortCol;
  label: string;
  sortCol: MmfSortCol;
  sortDir: MmfSortDir;
  onSort: (col: MmfSortCol) => void;
  tooltip?: string;
  align?: 'left' | 'right';
};

function SortableHeader({ col, label, sortCol, sortDir, onSort, tooltip, align = 'right' }: SortableHeaderProps) {
  const isActive = sortCol === col;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className={`inline-flex items-center gap-0.5 transition-colors hover:text-brand-primary ${align === 'right' ? 'ml-auto' : ''} ${isActive ? 'text-brand-primary' : ''}`}
      aria-label={`Sort by ${label}`}
    >
      {tooltip ? (
        <MmfInfoLabel label={label} description={tooltip} align={align} />
      ) : (
        <span>{label}</span>
      )}
      <SortIcon active={isActive} dir={sortDir} />
    </button>
  );
}

export function MmfTable({
  funds,
  amount,
  sortCol,
  sortDir,
  onSort,
}: {
  funds: MoneyMarketFund[];
  amount: number;
  sortCol: MmfSortCol;
  sortDir: MmfSortDir;
  onSort: (col: MmfSortCol) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[1.4rem] border border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.03]">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-brand-border bg-brand-surface/60 text-xs text-brand-textSecondary/70 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/45">
            <th className="px-4 py-3 text-left font-semibold">Fund</th>
            <th className="px-4 py-3 text-right font-semibold text-brand-primary">
              <SortableHeader
                col="net_yield"
                label="Net yield"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                tooltip={MMF_HELP_TEXT.netYield}
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <MmfInfoLabel
                label="Estimated yearly earnings"
                description={MMF_HELP_TEXT.estimatedEarnings}
                align="right"
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <SortableHeader
                col="min_initial"
                label="Minimum"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <SortableHeader
                col="redemption_days"
                label="Cash access"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                tooltip={MMF_HELP_TEXT.cashAccess}
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <SortableHeader
                col="vs_benchmark"
                label="vs T-Bill"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                tooltip={MMF_HELP_TEXT.vsTbill}
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <MmfInfoLabel
                label="Gross"
                description={MMF_HELP_TEXT.grossYield}
                align="right"
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <SortableHeader
                col="trust_fee_pct"
                label="Trust fee"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                tooltip={MMF_HELP_TEXT.trustFee}
              />
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {funds.map((fund) => {
            const deltaPositive = (fund.vs_benchmark ?? 0) >= 0;
            const deltaColor =
              fund.vs_benchmark === null || fund.vs_benchmark === undefined
                ? 'text-brand-textSecondary/40 dark:text-white/30'
                : deltaPositive
                  ? 'text-positive'
                  : 'text-danger';
            const dataIssue = getFundDataIssue(fund);

            return (
              <tr
                key={fund.id}
                className="border-b border-brand-border/50 transition-colors last:border-b-0 hover:bg-brand-surface/70 dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ProviderLogo provider={fund.provider} className="h-9 w-9" textClassName="text-sm" />
                    <div>
                      <p className="font-semibold leading-snug text-brand-textPrimary dark:text-white">
                        {fund.name}
                      </p>
                      <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
                        {fund.provider} | {fund.fund_type}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-brand-textSecondary/50 dark:text-white/35">
                        {getFundSourceDateLabel(fund)}
                      </p>
                      {dataIssue && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-warning/80">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {dataIssue}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-lg font-bold tabular-nums text-brand-textPrimary dark:text-white">
                    {formatMmfPercent(fund.net_yield)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-semibold tabular-nums text-brand-textPrimary dark:text-white">
                    {formatEstimatedAnnualEarnings(fund, amount)}
                  </p>
                  <p className="mt-1 text-xs text-brand-textSecondary/45 dark:text-white/30">
                    on {formatMmfMoney(amount, fund.currency)}
                  </p>
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-brand-textSecondary dark:text-white/70">
                  {formatMmfMoney(fund.min_initial, fund.currency)}
                </td>
                <td className="px-4 py-4 text-right text-brand-textSecondary dark:text-white/70">
                  {redemptionLabel(fund.redemption_days)}
                </td>
                <td className={`px-4 py-4 text-right font-semibold tabular-nums ${deltaColor}`}>
                  {fund.vs_benchmark === null || fund.vs_benchmark === undefined
                    ? '-'
                    : `${deltaPositive ? '+' : ''}${formatMmfPercent(fund.vs_benchmark)}`}
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-brand-textSecondary/70 dark:text-white/50">
                  {formatMmfPercent(fund.gross_yield_1y)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-brand-textSecondary/70 dark:text-white/50">
                  {formatMmfPercent(fund.trust_fee_pct)}/yr
                </td>
                <td className="px-4 py-4">
                  <MmfCtaButton
                    url={fund.fund_page_url}
                    provider={fund.provider}
                    compact
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
