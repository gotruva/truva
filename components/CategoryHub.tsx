'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  CreditCard,
  Landmark,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { ComingSoonModal } from '@/components/ComingSoonModal';

type LiveTile = {
  kind: 'live';
  label: string;
  icon: LucideIcon;
  description: string;
  stat: string;
  href: string;
};

type SoonTile = {
  kind: 'soon';
  label: string;
  icon: LucideIcon;
  description: string;
  source: string;
};

type CategoryTile = LiveTile | SoonTile;

const TILES: CategoryTile[] = [
  {
    kind: 'live',
    label: 'Savings & Deposits',
    icon: Building2,
    description: 'Digital banks, time deposits, T-Bills & MP2',
    stat: '57 products compared',
    href: '/banking/rates',
  },
  {
    kind: 'live',
    label: 'Money Market Funds',
    icon: TrendingUp,
    description: 'UITFs and funds from top managers',
    stat: 'Updated weekly',
    href: '/banking/money-market-funds',
  },
  {
    kind: 'soon',
    label: 'Credit Cards',
    icon: CreditCard,
    description: 'Cashback, travel, and rewards cards',
    source: 'waitlist_credit_cards',
  },
  {
    kind: 'soon',
    label: 'Loans',
    icon: Landmark,
    description: 'Personal, home, and auto loans',
    source: 'waitlist_loans',
  },
  {
    kind: 'soon',
    label: 'Investing',
    icon: BarChart3,
    description: 'Stocks, UITFs, and PERA accounts',
    source: 'waitlist_investing',
  },
  {
    kind: 'soon',
    label: 'Insurance',
    icon: ShieldCheck,
    description: 'Health, life, and travel coverage',
    source: 'waitlist_insurance',
  },
];

export function CategoryHub() {
  const [activeSoon, setActiveSoon] = useState<SoonTile | null>(null);
  const prefersReduced = useReducedMotion();

  const tileVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const, delay: i * 0.06 },
    }),
  };

  return (
    <section
      id="categories"
      className="bg-brand-surface dark:bg-slate-950 py-16 px-4 md:px-8 scroll-mt-20 transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary mb-2">
          What are you looking for?
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white mb-8 sm:text-4xl">
          Compare what matters to you
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {TILES.map((tile, index) =>
            tile.kind === 'live' ? (
              <motion.div
                key={tile.label}
                custom={index}
                initial={prefersReduced ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true }}
                variants={tileVariants}
              >
                <Link
                  href={tile.href}
                  className="group flex flex-col h-full rounded-[1.6rem] border border-brand-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 mb-3 shrink-0">
                    <tile.icon className="w-5 h-5" />
                  </div>
                  <p className="text-base font-bold text-brand-textPrimary dark:text-white leading-snug">
                    {tile.label}
                  </p>
                  <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-1 leading-snug flex-1">
                    {tile.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border dark:border-white/10">
                    <span className="text-xs font-semibold text-brand-primary">{tile.stat}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={tile.label}
                custom={index}
                initial={prefersReduced ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true }}
                variants={tileVariants}
              >
                <button
                  type="button"
                  onClick={() => setActiveSoon(tile)}
                  className="group flex flex-col h-full w-full text-left rounded-[1.6rem] border border-brand-border/60 bg-brand-surface p-5 shadow-sm cursor-pointer transition-all hover:border-brand-primary/15 hover:shadow-md dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500 mb-3 shrink-0">
                    <tile.icon className="w-5 h-5" />
                  </div>
                  <p className="text-base font-bold text-brand-textPrimary/70 dark:text-white/60 leading-snug">
                    {tile.label}
                  </p>
                  <p className="text-sm text-brand-textSecondary/70 dark:text-gray-500 mt-1 leading-snug flex-1">
                    {tile.description}
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                      Soon
                    </span>
                  </div>
                </button>
              </motion.div>
            )
          )}
        </div>
      </div>

      {activeSoon && (
        <ComingSoonModal
          categoryLabel={activeSoon.label}
          source={activeSoon.source}
          onClose={() => setActiveSoon(null)}
        />
      )}
    </section>
  );
}
