'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Calculator, Layers, CheckCircle2 } from 'lucide-react';

interface TrustStripProps {
  verifiedDate?: string;
}

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) {
      const frame = window.requestAnimationFrame(() => setCount(target));
      return () => window.cancelAnimationFrame(frame);
    }
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration, prefersReduced]);

  return { count, ref };
}

export function TrustStrip({ verifiedDate }: TrustStripProps) {
  const prefersReduced = useReducedMotion();
  const { count: productCount, ref: productRef } = useCountUp(57);

  const verifiedValue = verifiedDate ? `Verified ${verifiedDate}` : 'Regularly verified';
  const verifiedTitle = verifiedDate ? `As of ${verifiedDate}` : 'Updated regularly';

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' as const, delay: i * 0.1 },
    }),
  };

  return (
    <section className="bg-white dark:bg-slate-950 border-y border-brand-border dark:border-white/10 py-14 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

          {/* After-tax card */}
          <motion.div
            custom={0}
            initial={prefersReduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardVariants}
            className="rounded-[1.6rem] border border-brand-border bg-brand-surface p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 mb-4">
              <Calculator className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-brand-textPrimary dark:text-white tracking-tight">
              After-tax always
            </p>
            <p className="text-sm font-semibold text-brand-textPrimary dark:text-white mt-1">
              No gross-rate tricks
            </p>
            <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-2 leading-relaxed">
              Every rate shown net of 20% Final Withholding Tax. What you see is what you keep.
            </p>
          </motion.div>

          {/* Products tracked card — animated counter */}
          <motion.div
            custom={1}
            initial={prefersReduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardVariants}
            className="rounded-[1.6rem] border border-brand-border bg-brand-surface p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-brand-textPrimary dark:text-white tracking-tight tabular-nums">
              <span ref={productRef}>{productCount}</span> products
            </p>
            <p className="text-sm font-semibold text-brand-textPrimary dark:text-white mt-1">
              Tracked and compared
            </p>
            <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-2 leading-relaxed">
              Across digital banks, T-Bills, government bonds, UITFs, and money market funds.
            </p>
          </motion.div>

          {/* Verified card */}
          <motion.div
            custom={2}
            initial={prefersReduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardVariants}
            className="rounded-[1.6rem] border border-brand-border bg-brand-surface p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-brand-textPrimary dark:text-white tracking-tight">
              {verifiedValue}
            </p>
            <p className="text-sm font-semibold text-brand-textPrimary dark:text-white mt-1">
              {verifiedTitle}
            </p>
            <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-2 leading-relaxed">
              Not crowdsourced. Rates are manually verified on a regular cadence.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
