'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PortalHeroProps {
  verifiedDate?: string;
}

export function PortalHero({ verifiedDate }: PortalHeroProps) {
  const prefersReduced = useReducedMotion();

  const fadeUp = (delay: number) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: 'easeOut' as const, delay },
        };

  return (
    <section className="relative overflow-hidden bg-brand-primary px-4 py-14 text-white transition-colors duration-300 md:px-8 md:py-20 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.28),transparent_52%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_52%)]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-600/10" />

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center z-10">

        {/* Trust pills */}
        <motion.div
          {...fadeUp(0)}
          className="flex flex-wrap items-center justify-center gap-2 mb-5"
        >
          {verifiedDate && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-blue-100 backdrop-blur-md">
              <span className="text-[#12B76A]">✓</span>
              Rates verified {verifiedDate}
            </div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-blue-100 backdrop-blur-md">
            Trusted by 2,000+ Filipino savers
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl"
        >
          See where every peso earns the most —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-300 dark:to-blue-500">
            after tax, after conditions.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          {...fadeUp(0.2)}
          className="mb-8 max-w-xl text-lg font-medium text-blue-100/90 md:text-xl dark:text-gray-300"
        >
          The free comparison platform for Filipino savers. Savings, funds, credit cards, and more.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp(0.3)}>
          <a
            href="#categories"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-[15px] font-bold text-brand-primary shadow-md shadow-black/10 hover:shadow-[0_4px_24px_rgba(0,0,0,0.18)] transition-shadow"
          >
            Find my best rate
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
