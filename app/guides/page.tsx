import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHub } from '@/components/layout/SectionHub';
import { BookOpen, HelpCircle, FileText, ArrowRight, ShieldCheck, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Philippine Financial Guides & Literacy | Truva',
  description: 'Understand the mechanics of Philippine finance. Guides on Final Withholding Tax, PDIC Insurance limits, MP2 mechanics, and more.',
};

const guideCategories = [
  {
    title: 'Taxation & Laws',
    description: 'Learn about the 20% Final Withholding Tax and other fiscal rules.',
    href: '/guides/taxation',
    icon: Scale,
    color: 'text-brand-primary',
  },
  {
    title: 'Insurance & Safety',
    description: 'Understanding PDIC protection and how to keep your savings safe.',
    href: '/guides/safety',
    icon: ShieldCheck,
    color: 'text-brand-success',
  },
  {
    title: 'Product Mechanics',
    description: 'How Time Deposits, T-Bills, and UITFs actually work in the PH.',
    href: '/guides/mechanics',
    icon: HelpCircle,
    color: 'text-amber-500',
  },
];

export default function GuidesHub() {
  return (
    <SectionHub
      title="Financial Guides & Learning"
      description="We simplify the jargon and explain the mechanics of Philippine finance so you can invest with confidence."
      breadcrumbItems={[{ label: 'Guides', href: '/guides' }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {guideCategories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group relative p-8 rounded-3xl bg-white dark:bg-white/5 border border-brand-border dark:border-white/10 hover:shadow-2xl transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 ${category.color}`}>
                <category.icon className="w-8 h-8" />
              </div>
              <ArrowRight className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-brand-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-brand-textPrimary dark:text-gray-100 italic">
              {category.title}
            </h2>
            <p className="text-lg text-brand-textSecondary dark:text-gray-400">
              {category.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-slate-50 dark:bg-white/[0.02] border border-brand-border dark:border-white/10 rounded-3xl p-8 sm:p-12">
        <h2 className="text-3xl font-bold mb-8 italic flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-primary" />
          Latest Articles
        </h2>
        <div className="space-y-6">
          <article className="pb-6 border-b border-brand-border dark:border-white/5 last:border-0 last:pb-0">
             <Link href="/guides/final-withholding-tax-explained" className="group block">
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors">What is the 20% Final Withholding Tax?</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 line-clamp-2">
                  Every interest-bearing account in the Philippines is subject to tax. We explain how it’s calculated and which products are exempt.
                </p>
             </Link>
          </article>
          <article className="pb-6 border-b border-brand-border dark:border-white/5 last:border-0 last:pb-0">
             <Link href="/guides/pdic-insurance-guide" className="group block">
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors">PDIC Insurance: Is your money really safe?</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 line-clamp-2">
                  A deep dive into the ₱500,000 protection limit and how to maximize insurance across multiple bank accounts.
                </p>
             </Link>
          </article>
        </div>
      </div>
    </SectionHub>
  );
}
