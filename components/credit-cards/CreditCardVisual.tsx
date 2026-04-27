import { CreditCard, FileCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreditCard as CreditCardType } from '@/types';

const ISSUER_TONES: Record<string, { from: string; via: string; to: string; accent: string }> = {
  'Bank of the Philippine Islands': {
    from: 'from-red-600',
    via: 'via-orange-500',
    to: 'to-amber-400',
    accent: 'bg-red-50 text-red-700 border-red-100',
  },
  'HSBC Philippines': {
    from: 'from-red-700',
    via: 'via-slate-900',
    to: 'to-slate-500',
    accent: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export function CreditCardVisual({
  card,
  className,
  compact = false,
}: {
  card: CreditCardType;
  className?: string;
  compact?: boolean;
}) {
  const tone = ISSUER_TONES[card.bank] ?? {
    from: 'from-brand-primary',
    via: 'via-cyan-500',
    to: 'to-emerald-400',
    accent: 'bg-brand-primary/10 text-brand-primary border-brand-primary/15',
  };

  return (
    <div
      className={cn(
        'relative isolate aspect-[1.58] overflow-hidden rounded-[1.15rem] border border-white/70 bg-white shadow-inner dark:border-white/10 dark:bg-white/[0.04]',
        className,
      )}
      aria-label={`Generic visual representation of the ${card.card_name} credit card`}
      role="img"
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-95', tone.from, tone.via, tone.to)} />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_0,rgba(255,255,255,0.08)_32%,rgba(255,255,255,0)_33%)]" />
      <div className="absolute inset-x-4 top-16 h-px bg-white/20" />
      <div className="absolute bottom-14 right-4 h-px w-24 bg-white/20" />

      <div className={cn('relative flex h-full flex-col justify-between p-4 text-white', compact ? 'p-3' : '')}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/18 backdrop-blur">
            <CreditCard className="h-4 w-4" />
          </span>
          {card.naffl ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur">
              NAFFL
            </span>
          ) : (
            <span className="rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur">
              {card.card_network ?? 'Fact card'}
            </span>
          )}
        </div>

        <div>
          <p className="max-w-[12rem] truncate text-sm font-bold tracking-tight">
            {card.bank}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Annual fee
              </p>
              <p className="text-lg font-black tabular-nums">{formatAnnualFee(card)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreditCardDeskVisual({ cards }: { cards: CreditCardType[] }) {
  const first = cards[0];
  const second = cards[1] ?? cards[0];

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-brand-border bg-white p-5 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,82,255,0.08),transparent_34%),linear-gradient(0deg,rgba(16,185,129,0.06),transparent_44%)]" />
      <div className="relative space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Card check
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Plain-English details before the bank site.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            A card can look attractive, but fees, interest, and reward rules still matter.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_0.72fr] sm:items-end">
          {first ? <CreditCardVisual card={first} /> : null}
          {second ? <CreditCardVisual card={second} compact className="sm:-ml-8 sm:mb-5" /> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DeskMetric label="Source checked" value="Bank page" />
          <DeskMetric label="Fields visible" value="Fees + rewards" />
          <DeskMetric label="Score state" value="Coming later" />
        </div>

        <div className="rounded-[1.1rem] border border-brand-border bg-brand-surface/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Truva keeps bank source links, missing details, and score notes visible before you continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeskMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white/80 p-3 dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-brand-textPrimary dark:text-white">{value}</p>
    </div>
  );
}

function formatAnnualFee(card: CreditCardType): string {
  if (card.naffl) return 'PHP 0';
  if (card.annual_fee_recurring === 0) return 'PHP 0';
  if (card.annual_fee_recurring !== null) return `PHP ${card.annual_fee_recurring.toLocaleString('en-PH')}`;
  return 'Pending';
}
