const BANKS = [
  'Maya',
  'GCash',
  'Tonik',
  'GoTyme',
  'CIMB',
  'UNO',
  'Landbank',
  'DBP',
  'MariBank',
  'OwnBank',
  'DiskarTech',
  'Salmon',
];

export function BankLogoStrip() {
  return (
    <div className="bg-white dark:bg-slate-950 border-b border-brand-border dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-textSecondary dark:text-gray-500 shrink-0 pr-1">
            Tracking rates from
          </span>
          <div className="flex items-center gap-2 flex-nowrap">
            {BANKS.map((bank) => (
              <span
                key={bank}
                className="inline-flex shrink-0 items-center rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-[12px] font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 transition-colors"
              >
                {bank}
              </span>
            ))}
            <span className="inline-flex shrink-0 items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[12px] font-semibold text-brand-primary dark:bg-brand-primary/15 dark:text-blue-400">
              +more
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
