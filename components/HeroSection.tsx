import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';

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
    description: 'Compare savings accounts, time deposits, and money market funds in one view.',
  },
];

export function HeroSection({ formattedDate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-brand-primary px-4 py-20 text-white transition-colors duration-300 md:px-8 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.28),transparent_52%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_52%)]" />

      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center z-10">
        <div>
          <h1 className="mb-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-400 dark:to-blue-600">savings rates and money market funds</span> — after tax
          </h1>

          {formattedDate && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur-md dark:border-blue-700/50 dark:bg-blue-900/30">
              <CheckCircle2 className="w-4 h-4 text-blue-300" />
              <span className="text-blue-50">Rates last checked and verified on {formattedDate}</span>
            </div>
          )}

          <p className="mb-10 max-w-2xl text-lg font-medium text-blue-100/90 dark:text-gray-300 md:text-xl">
            Compare what you could really earn after tax, see important account conditions upfront, and know when rates were last checked and verified.
          </p>
        </div>

        <div className="w-full max-w-3xl">
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
        </div>
      </div>
    </section>
  );
}
