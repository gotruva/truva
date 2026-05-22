'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { CreditCardVisual } from './CreditCardVisual';
import { getCreditCardVisualAsset } from '@/lib/credit-card-visuals';
import { REASSURANCE } from '@/lib/creditCardFinder/copy';
import { cn } from '@/lib/utils';
import type { CreditCard as CreditCardType } from '@/types';

const BANK_PRIORITY = [
  ['bdo', 'bdo unibank'],
  ['bank of the philippine islands', 'bpi'],
  ['asia united bank', 'aub'],
  ['hsbc'],
  ['chinabank', 'china banking'],
  ['rcbc', 'rizal commercial banking'],
  ['metrobank'],
  ['security bank'],
  ['unionbank'],
] as const;

const MAX_HERO_CARDS = 8;
const AUTO_ADVANCE_MS = 2800;

type SlotStyle = {
  x: string;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  zIndex: number;
};

export function CreditCardHeroCarousel({ cards }: { cards: CreditCardType[] }) {
  const reduceMotion = useReducedMotion();
  const carouselCards = useMemo(() => selectHeroCards(cards), [cards]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeIndex > Math.max(carouselCards.length - 1, 0)) {
      setActiveIndex(0);
    }
  }, [activeIndex, carouselCards.length]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      carouselCards.length ? (current - 1 + carouselCards.length) % carouselCards.length : 0,
    );
  }, [carouselCards.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      carouselCards.length ? (current + 1) % carouselCards.length : 0,
    );
  }, [carouselCards.length]);

  useEffect(() => {
    if (reduceMotion || isPaused || carouselCards.length <= 1) return;

    const timer = window.setInterval(showNext, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [carouselCards.length, isPaused, reduceMotion, showNext]);

  if (carouselCards.length === 0) {
    return (
      <div className="relative mx-auto w-full max-w-[29rem] rounded-[2rem] border border-brand-border bg-brand-surface p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <ReassuranceCard />
      </div>
    );
  }

  const activeCard = carouselCards[activeIndex];

  return (
    <div
      className="relative mx-auto w-full max-w-[29rem] sm:max-w-[34rem] lg:max-w-[36rem]"
      aria-label="A rotating preview of Philippine bank credit cards"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      <div className="relative h-[20.5rem] overflow-hidden rounded-[2rem] border border-brand-border bg-[radial-gradient(circle_at_50%_0%,rgba(0,82,255,0.12),rgba(248,249,251,0.92)_42%,rgba(255,255,255,0.98)_100%)] shadow-[0_22px_70px_-52px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_50%_0%,rgba(0,82,255,0.22),rgba(15,23,42,0.95)_48%,rgba(2,6,23,0.98)_100%)] sm:h-[23rem] lg:h-[24rem]">
        <div className="pointer-events-none absolute inset-x-8 top-6 h-24 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/15" />
        <div className="pointer-events-none absolute inset-x-0 top-9 h-56">
          {carouselCards.map((card, index) => {
            const offset = getCircularOffset(index, activeIndex, carouselCards.length);
            const slot = getSlotStyle(offset);

            return (
              <motion.div
                key={card.id || card.normalized_card_key || card.card_name}
                aria-hidden={offset !== 0}
                animate={slot}
                className="absolute left-1/2 top-0 w-56 sm:w-64 lg:w-72"
                initial={false}
                style={{ pointerEvents: 'none' }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 92, damping: 24 }
                }
              >
                <CreditCardVisual card={card} compact />
              </motion.div>
            );
          })}
        </div>

        <div className="absolute right-4 top-4 z-30 flex gap-2">
          <CarouselButton
            label="Show previous card"
            onClick={showPrevious}
            disabled={carouselCards.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </CarouselButton>
          <CarouselButton
            label="Show next card"
            onClick={showNext}
            disabled={carouselCards.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </CarouselButton>
        </div>

        <div className="absolute inset-x-4 bottom-4 z-20">
          <ReassuranceCard />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
        {carouselCards.map((card, index) => (
          <span
            key={`${card.id || card.normalized_card_key || card.card_name}-dot`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              index === activeIndex
                ? 'w-6 bg-brand-primary'
                : 'w-1.5 bg-brand-border dark:bg-white/20',
            )}
          />
        ))}
      </div>

      <p className="sr-only">
        Showing {activeCard.card_name} from {activeCard.bank}.
      </p>
    </div>
  );
}

function CarouselButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white/90 text-brand-textPrimary shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-40 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
    >
      {children}
    </button>
  );
}

function ReassuranceCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <p className="text-xs leading-snug text-brand-textSecondary dark:text-gray-300">
        {REASSURANCE}
      </p>
    </div>
  );
}

function selectHeroCards(cards: CreditCardType[]): CreditCardType[] {
  const pool = cards.filter(isConsumerHeroCandidate);
  const selected: CreditCardType[] = [];
  const selectedKeys = new Set<string>();
  const selectedBanks = new Set<string>();

  const addCard = (card: CreditCardType | undefined, requireUniqueBank = false) => {
    if (!card || selected.length >= MAX_HERO_CARDS) return;

    const cardKey = getCardKey(card);
    const bankKey = normalize(card.bank);
    if (selectedKeys.has(cardKey)) return;
    if (requireUniqueBank && selectedBanks.has(bankKey)) return;

    selected.push(card);
    selectedKeys.add(cardKey);
    selectedBanks.add(bankKey);
  };

  for (const aliases of BANK_PRIORITY) {
    const officialMatch = pool.find(
      (card) => matchesBank(card, aliases) && hasUsableOfficialArt(card),
    );
    const fallbackMatch = pool.find((card) => matchesBank(card, aliases));
    addCard(officialMatch ?? fallbackMatch, true);
  }

  for (const card of pool.filter(hasUsableOfficialArt)) {
    addCard(card, true);
  }

  for (const card of pool.filter(hasUsableOfficialArt)) {
    addCard(card);
  }

  for (const card of pool) {
    addCard(card);
  }

  return selected.slice(0, MAX_HERO_CARDS);
}

function isConsumerHeroCandidate(card: CreditCardType): boolean {
  const name = normalize(card.card_name);
  return !name.includes('corporate') && !name.includes('discontinued');
}

function hasUsableOfficialArt(card: CreditCardType): boolean {
  const asset = getCreditCardVisualAsset(card);
  return Boolean(asset?.assetPath && asset.status !== 'truva-fallback');
}

function matchesBank(card: CreditCardType, aliases: readonly string[]): boolean {
  const bank = normalize(card.bank);
  const name = normalize(card.card_name);
  return aliases.some((alias) => bank.includes(alias) || name.includes(alias));
}

function getCardKey(card: CreditCardType): string {
  return card.id || card.normalized_card_key || `${card.bank}-${card.card_name}`;
}

function normalize(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getCircularOffset(index: number, activeIndex: number, total: number): number {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function getSlotStyle(offset: number): SlotStyle {
  if (offset === 0) {
    return { x: '-50%', y: 2, scale: 1, rotate: 0, opacity: 1, zIndex: 40 };
  }

  if (offset === -1) {
    return { x: '-116%', y: 34, scale: 0.78, rotate: -10, opacity: 0.72, zIndex: 28 };
  }

  if (offset === 1) {
    return { x: '16%', y: 34, scale: 0.78, rotate: 10, opacity: 0.72, zIndex: 28 };
  }

  if (offset === -2) {
    return { x: '-154%', y: 58, scale: 0.62, rotate: -14, opacity: 0.36, zIndex: 16 };
  }

  if (offset === 2) {
    return { x: '54%', y: 58, scale: 0.62, rotate: 14, opacity: 0.36, zIndex: 16 };
  }

  return {
    x: offset < 0 ? '-178%' : '78%',
    y: 76,
    scale: 0.56,
    rotate: offset < 0 ? -16 : 16,
    opacity: 0,
    zIndex: 0,
  };
}
