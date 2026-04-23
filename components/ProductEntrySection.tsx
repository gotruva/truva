import Link from 'next/link';
import { ArrowRight, BarChart2, Landmark } from 'lucide-react';

const PRODUCTS = [
  {
    icon: Landmark,
    title: 'Digital Bank Savings',
    subtitle: 'PDIC-insured · After-tax rates · Monthly payout',
    description:
      'Compare savings accounts and time deposits across Philippine digital banks. See what you actually keep after the 20% final withholding tax.',
    cta: 'Compare savings rates',
    href: '/banking/rates#rate-desk',
  },
  {
    icon: BarChart2,
    title: 'Money Market Funds',
    subtitle: 'Liquid investing · Higher potential yield · Not PDIC-insured',
    description:
      'Compare Philippine UITFs and mutual funds by source-aware net yield and published date. Typically redeemable within 1–5 business days.',
    cta: 'Compare money market funds',
    href: '/banking/money-market-funds',
  },
];

export function ProductEntrySection() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <p className="mb-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-brand-textSecondary dark:text-gray-500">
        What do you want to compare?
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          return (
            <Link
              key={product.href}
              href={product.href}
              className="group flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-6 transition-all duration-200 hover:border-brand-primary/40 hover:shadow-md dark:bg-slate-900 dark:border-white/10 dark:hover:border-brand-primary/40"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-brand-textPrimary dark:text-white">
                  {product.title}
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-brand-textSecondary dark:text-gray-500">
                  {product.subtitle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
                  {product.description}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-brand-primary transition-all group-hover:gap-2">
                {product.cta}
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
