import Image from 'next/image';
import { CreditCard, FileCheck2 } from 'lucide-react';
import { getCreditCardVisualAsset, normalizeCreditCardVisualKey } from '@/lib/credit-card-visuals';
import { cn } from '@/lib/utils';
import type { CreditCard as CreditCardType } from '@/types';

const ISSUER_TONES: Array<{
  match: string[];
  from: string;
  via: string;
  to: string;
  accent: string;
}> = [
  {
    match: ['bank of the philippine islands', 'bpi'],
    from: 'from-red-600',
    via: 'via-orange-500',
    to: 'to-amber-400',
    accent: 'bg-red-50 text-red-700 border-red-100',
  },
  {
    match: ['hsbc', 'hongkong and shanghai banking corporation'],
    from: 'from-red-700',
    via: 'via-slate-900',
    to: 'to-slate-500',
    accent: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    match: ['asia united bank', 'aub'],
    from: 'from-blue-700',
    via: 'via-blue-500',
    to: 'to-cyan-400',
    accent: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    match: ['bdo', 'bdo unibank'],
    from: 'from-blue-800',
    via: 'via-blue-600',
    to: 'to-indigo-400',
    accent: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    match: ['chinabank', 'china banking corporation'],
    from: 'from-teal-700',
    via: 'via-cyan-600',
    to: 'to-emerald-400',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
];

export function CreditCardVisual({
  card,
  className,
  compact = false,
}: {
  card: CreditCardType;
  className?: string;
  compact?: boolean;
}) {
  const tone = getIssuerTone(card.bank);
  const visualAsset = getCreditCardVisualAsset(card);
  const imagePath = visualAsset?.assetPath;
  const hasCardArtwork = Boolean(imagePath);

  return (
    <div
      className={cn(
        'relative isolate aspect-[1.58] rounded-[1.1rem]',
        hasCardArtwork
          ? 'overflow-visible bg-transparent'
          : 'overflow-hidden border border-slate-200/80 bg-white shadow-[0_16px_38px_-30px_rgba(15,23,42,0.75)] ring-1 ring-white/70 dark:border-white/10 dark:bg-slate-950 dark:ring-white/10',
        className,
      )}
      data-visual-status={visualAsset?.status ?? 'truva-fallback'}
      aria-label={`Visual representation of the ${card.card_name} credit card`}
      role="img"
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt={`${card.card_name} card artwork`}
          fill
          className="object-contain drop-shadow-[0_14px_18px_rgba(15,23,42,0.22)]"
          sizes={compact ? '(max-width: 768px) 45vw, 16vw' : '(max-width: 768px) 100vw, 24vw'}
          priority={false}
        />
      ) : (
        <FallbackCreditCardVisual card={card} compact={compact} tone={tone} />
      )}
    </div>
  );
}

/**
 * Compact card chip for the dense comparison rows (~64×40px). Deliberately
 * renders NO overlay text — the card-name heading carries the accessible label,
 * so this is `aria-hidden`. Uses real card art when available, otherwise the
 * issuer-tone gradient. Size is controlled by the caller via `className`.
 */
export function MiniCreditCardVisual({
  card,
  className,
}: {
  card: CreditCardType;
  className?: string;
}) {
  const tone = getIssuerTone(card.bank);
  const visualAsset = getCreditCardVisualAsset(card);
  const imagePath = visualAsset?.assetPath;
  const visualStatus = visualAsset?.status ?? 'truva-fallback';

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        className,
      )}
      data-visual-status={visualStatus}
      aria-hidden="true"
    >
      {imagePath ? (
        <Image src={imagePath} alt="" fill className="object-cover" sizes="96px" />
      ) : (
        <div className={cn('h-full w-full bg-gradient-to-br', tone.from, tone.via, tone.to)} />
      )}
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
            Clear, simple details before the bank site.
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
          <DeskMetric label="The catch" value="Shown upfront" />
        </div>

        <div className="rounded-[1.1rem] border border-brand-border bg-brand-surface/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Truva keeps bank source links and any missing details visible before you continue.
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

function FallbackCreditCardVisual({
  card,
  compact,
  tone,
}: {
  card: CreditCardType;
  compact: boolean;
  tone: { from: string; via: string; to: string; accent: string };
}) {
  return (
    <>
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-95', tone.from, tone.via, tone.to)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.26),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.20)_0,rgba(255,255,255,0.08)_34%,rgba(255,255,255,0)_35%)]" />
      <div className="absolute inset-x-4 top-16 h-px bg-white/20" />
      <div className="absolute bottom-14 right-4 h-px w-24 bg-white/20" />

      <div className={cn('relative flex h-full flex-col justify-between p-4 text-white', compact ? 'p-3' : '')}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/18 backdrop-blur">
            <CreditCard className="h-4 w-4" />
          </span>
          <span className="rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur">
            {card.card_network ?? 'Preview'}
          </span>
        </div>

        <div>
          <p className="max-w-[12rem] truncate text-sm font-bold tracking-tight">{card.bank}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Yearly fee
              </p>
              <p className="text-lg font-black tabular-nums">{formatAnnualFee(card)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getIssuerTone(bank: string) {
  const normalizedBank = normalizeCreditCardVisualKey(bank);
  const tone = ISSUER_TONES.find(({ match }) =>
    match.some((candidate) => normalizedBank.includes(candidate)),
  );

  return (
    tone ?? {
      from: 'from-brand-primary',
      via: 'via-cyan-500',
      to: 'to-emerald-400',
      accent: 'bg-brand-primary/10 text-brand-primary border-brand-primary/15',
    }
  );
}

function formatAnnualFee(card: CreditCardType): string {
  if (card.naffl) return 'PHP 0';
  if (card.annual_fee_recurring === 0) return 'PHP 0';
  
  if (card.annual_fee_recurring !== null) {
    if (card.normalized_card_key === 'chinabank_destinations_world_dollar_mastercard') {
      return `$${card.annual_fee_recurring.toLocaleString()}`;
    }
    return `PHP ${card.annual_fee_recurring.toLocaleString('en-PH')}`;
  }
  
  return 'Pending';
}
