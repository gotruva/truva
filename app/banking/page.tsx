import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHub } from '@/components/layout/SectionHub';
import { Landmark, TrendingUp, Search, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Banking in the Philippines: Digital & Traditional Bank Comparison',
  description: 'Compare the best high-interest savings accounts from traditional giants and digital-native banks in the Philippines. See after-tax yields and current interest rates.',
};

const bankingSections = [
  {
    title: 'Current Interest Rates',
    description: 'See the latest verified rates from Maya, Tonik, GoTyme, BDO, and more.',
    href: '/banking/rates',
    icon: TrendingUp,
    color: 'text-brand-success',
    bg: 'bg-brand-success/10',
  },
  {
    title: 'Product Reviews',
    description: 'In-depth deep dives into account conditions, fees, and PDIC insurance status.',
    href: '/banking/reviews',
    icon: Search,
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
  },
  {
    title: 'Side-by-Side Comparisons',
    description: 'Can’t decide? Compare Maya vs. GoTyme and other top pairings.',
    href: '/banking/compare',
    icon: ShieldCheck,
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
  },
];

export default function BankingHub() {
  return (
    <SectionHub
      title="Banking & Yield Comparison"
      description="We track the best after-tax yields across every major Philippine institution so you can maximize your Peso."
      breadcrumbItems={[{ label: 'Banking', href: '/banking' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bankingSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-brand-border dark:border-white/10 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 transition-all hover:shadow-lg flex flex-col items-start"
          >
            <div className={`p-3 rounded-xl ${section.bg} ${section.color} mb-4 group-hover:scale-110 transition-transform`}>
              <section.icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-brand-textPrimary dark:text-gray-100">
              {section.title}
            </h2>
            <p className="text-brand-textSecondary dark:text-gray-400 mb-6 flex-1">
              {section.description}
            </p>
            <div className="flex items-center gap-1.5 text-brand-primary font-semibold text-sm group-hover:gap-2.5 transition-all">
              Explore <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-3xl bg-brand-primary text-white relative overflow-hidden shadow-xl shadow-brand-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:max-w-md">
            <h2 className="text-3xl font-bold mb-4 italic">Need consistent yield?</h2>
            <p className="text-white/80 text-lg mb-8">
              Check out our monthly tracking of Government Bonds and T-Bills alongside your favorite digital banks.
            </p>
            <Link 
              href="/banking/rates"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-brand-primary font-bold hover:bg-slate-100 transition-colors"
            >
              See All Rates
            </Link>
          </div>
          <div className="hidden lg:block">
             <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl absolute -right-20 -bottom-20" />
             <Landmark className="w-48 h-48 text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </SectionHub>
  );
}
