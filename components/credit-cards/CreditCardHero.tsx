'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { CreditCardDeskVisual } from './CreditCardVisual';
import type { CreditCard as CreditCardType } from '@/types';

interface CreditCardHeroProps {
  cards: CreditCardType[];
}

export function CreditCardHero({ cards }: CreditCardHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[60%] rounded-full bg-brand-primary/5 blur-[120px] dark:bg-brand-primary/10" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/10" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-1.5 text-sm font-semibold text-brand-primary dark:bg-brand-primary/10">
                <Sparkles className="h-4 w-4" />
                Plain-English comparison
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-brand-textPrimary dark:text-white md:text-5xl lg:text-6xl">
                Find the right card for your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">
                  income and spending
                </span>
              </h1>
              <p className="max-w-xl text-lg font-medium text-brand-textSecondary dark:text-gray-300 md:text-xl">
                We compare Philippine credit cards without the bank jargon. See fees, rewards, and requirements clearly before you apply.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#quiz"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 text-[15px] font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98]"
              >
                Find my card
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#cards"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-8 text-[15px] font-bold text-brand-textPrimary transition-all hover:bg-brand-surface dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Compare all cards
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-brand-textSecondary dark:text-gray-400">
                  Verified details
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-brand-textSecondary dark:text-gray-400">
                  No pressure to apply
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block"
          >
            <CreditCardDeskVisual cards={cards} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
