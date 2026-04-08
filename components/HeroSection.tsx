'use client';

import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  formattedDate?: string;
}

const TRUST_POINTS = [
  {
    icon: Calculator,
    title: 'After-tax comparisons',
    description: 'Cut through advertised rates and see what you\'ll really earn after tax.',
  },
  {
    icon: ShieldCheck,
    title: 'Conditions upfront',
    description: 'Know the lock-in, balance, and payout rules before you choose.',
  },
  {
    icon: CheckCircle2,
    title: 'Easy side-by-side view',
    description: 'Compare savings accounts and time deposits in one clean table.',
  },
];

export function HeroSection({ formattedDate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-brand-primary dark:bg-slate-950 text-white py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.1]">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-400 dark:to-blue-600">best savings rates</span> in the Philippines
          </h1>

          {formattedDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-sm font-semibold mb-6 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-blue-300" />
              <span className="text-blue-50">Rates last checked and verified on {formattedDate}</span>
            </div>
          )}
          
          <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl text-blue-100/90 dark:text-gray-300">
            Compare what you could really earn after tax, see important account conditions upfront, and know when rates were last checked and verified.
          </p>
        </motion.div>

        <motion.div 
          className="w-full max-w-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/#calculator"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-brand-primary shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
            >
              Find my best rate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#deposit-rates"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              Compare all bank rates
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {TRUST_POINTS.map((point) => {
              const Icon = point.icon;

              return (
                <div
                  key={point.title}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-md"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                    <Icon className="h-5 w-5 text-blue-100" />
                  </div>
                  <h2 className="text-base font-semibold text-white">{point.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-blue-100/85">{point.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
