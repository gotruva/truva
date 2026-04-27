import {
  BadgePercent,
  CircleAlert,
  CircleDashed,
  FileCheck2,
  Gift,
  ReceiptText,
  SearchCheck,
  ShieldCheck,
  UserRoundX,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreditCard } from '@/types';

type BadgeTone = 'verified' | 'missing' | 'promo' | 'neutral';

type DataBadge = {
  icon: LucideIcon;
  label: string;
  tone: BadgeTone;
};

export function buildDataBadges(card: CreditCard): DataBadge[] {
  const badges: DataBadge[] = [];

  if (card.source_url) {
    badges.push({ icon: FileCheck2, label: 'Checked from bank page', tone: 'verified' });
  }

  if (card.min_income_monthly === null && card.min_income_annual === null) {
    badges.push({ icon: UserRoundX, label: 'Income not shown yet', tone: 'missing' });
  }

  if (card.annual_fee_waiver_condition === null || card.annual_fee_waiver_threshold === null) {
    badges.push({ icon: ReceiptText, label: 'Fee-waiver details missing', tone: 'missing' });
  }

  if (!hasRewardValue(card)) {
    badges.push({ icon: Gift, label: 'Reward value not ready', tone: 'neutral' });
  }

  if (card.active_promo_count > 0) {
    badges.push({ icon: BadgePercent, label: 'Promo-linked', tone: 'promo' });
  }

  if (card.score_ready !== true) {
    badges.push({ icon: CircleDashed, label: 'Score coming later', tone: 'neutral' });
  }

  return badges;
}

export function CreditCardTrustBadges({
  card,
  limit = 4,
  className,
}: {
  card: CreditCard;
  limit?: number;
  className?: string;
}) {
  const badges = buildDataBadges(card).slice(0, limit);

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {badges.map((badge) => (
        <DataBadgePill key={`${badge.label}-${badge.tone}`} badge={badge} />
      ))}
    </div>
  );
}

export function TheCatchPanel({ card, compact = false }: { card: CreditCard; compact?: boolean }) {
  const items = buildCatchItems(card);

  return (
    <div className="rounded-[1.15rem] border border-brand-border bg-brand-surface/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-primary dark:bg-slate-950/40">
          <SearchCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand-textPrimary dark:text-white">Things to check</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-300">
            These details can change whether a card is a good fit for you.
          </p>
        </div>
      </div>

      <div className={cn('mt-3 grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium leading-relaxed text-brand-textPrimary dark:bg-slate-950/40 dark:text-gray-100"
          >
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function DataBadgePill({ badge }: { badge: DataBadge }) {
  const Icon = badge.icon;
  const classes =
    badge.tone === 'verified'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/15 dark:text-emerald-300'
      : badge.tone === 'missing'
        ? 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/15 dark:text-amber-300'
        : badge.tone === 'promo'
          ? 'border-brand-primary/15 bg-brand-primary/10 text-brand-primary dark:border-brand-primary/25 dark:bg-brand-primary/15'
          : 'border-brand-border bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300';

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold', classes)}>
      <Icon className="h-3 w-3 shrink-0" />
      {badge.label}
    </span>
  );
}

function buildCatchItems(card: CreditCard): string[] {
  const items: string[] = [];

  if (card.min_income_monthly === null && card.min_income_annual === null) {
    items.push('Income requirement not shown yet');
  }

  if (card.annual_fee_waiver_condition === null || card.annual_fee_waiver_threshold === null) {
    items.push('Fee-waiver details need checking');
  }

  if (!hasRewardValue(card)) {
    items.push('Reward peso value is not ready yet');
  }

  if (card.foreign_transaction_fee_pct === null) {
    items.push('Foreign transaction fee is not shown yet');
  }

  if (card.active_promo_count > 0) {
    items.push('Promo may not apply to everyone');
  }

  return items.length > 0 ? items : ['No major warning is active yet; still check the bank terms before you continue'];
}

function hasRewardValue(card: CreditCard) {
  const formula = card.rewards_formula;
  if (!formula) return false;
  return Boolean(formula.redeem_rate || formula.redeem_unit);
}

export function MissingDataLabel({ children = 'Not yet verified' }: { children?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
      <CircleDashed className="h-3 w-3" />
      {children}
    </span>
  );
}

export function ScorePendingNotice() {
  return (
    <div className="rounded-[1.1rem] border border-brand-border bg-brand-surface/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
        <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          We only show a score when fees, rewards, income requirements, and source data are complete enough to compare fairly.
        </p>
      </div>
    </div>
  );
}
