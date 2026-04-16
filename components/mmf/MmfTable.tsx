import { MoneyMarketFund } from '@/types';
import {
  formatEstimatedAnnualEarnings,
  formatMmfMoney,
  formatMmfPercent,
  redemptionLabel,
} from '@/lib/mmf';
import { MmfCtaButton } from './MmfCtaButton';
import { MMF_HELP_TEXT, MmfInfoLabel } from './MmfInfoLabel';

export function MmfTable({
  funds,
  amount,
}: {
  funds: MoneyMarketFund[];
  amount: number;
}) {
  return (
    <div className="overflow-x-auto rounded-[1.4rem] border border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.03]">
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="border-b border-brand-border bg-brand-surface/60 text-xs text-brand-textSecondary/70 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/45">
            <th className="px-4 py-3 text-left font-semibold">Fund</th>
            <th className="px-4 py-3 text-right font-semibold text-brand-primary">
              <MmfInfoLabel
                label="Net yield"
                description={MMF_HELP_TEXT.netYield}
                align="right"
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">Estimated yearly earnings</th>
            <th className="px-4 py-3 text-right font-semibold">Minimum</th>
            <th className="px-4 py-3 text-right font-semibold">
              <MmfInfoLabel
                label="Cash access"
                description={MMF_HELP_TEXT.cashAccess}
                align="right"
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">
              <MmfInfoLabel
                label="vs T-Bill"
                description={MMF_HELP_TEXT.vsTbill}
                align="right"
              />
            </th>
            <th className="px-4 py-3 text-right font-semibold">Gross</th>
            <th className="px-4 py-3 text-right font-semibold">
              <MmfInfoLabel
                label="Trust fee"
                description={MMF_HELP_TEXT.trustFee}
                align="right"
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

            return (
              <tr
                key={fund.id}
                className="border-b border-brand-border/50 transition-colors last:border-b-0 hover:bg-brand-surface/70 dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
              >
                <td className="px-4 py-4">
                  <p className="font-semibold leading-snug text-brand-textPrimary dark:text-white">
                    {fund.name}
                  </p>
                  <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
                    {fund.provider} | {fund.fund_type}
                  </p>
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
