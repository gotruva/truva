import type { Metadata } from 'next';
import Link from 'next/link';
import { getCreditCards } from '@/lib/credit-cards';
import { CreditCardProduct } from '@/types';
import { Check, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Credit Cards in the Philippines (2026 Comparison)',
  description: 'Compare the best Philippine credit cards for cashback, rewards, and travel. Expert reviews, hidden fees exposed, and clear "Best For" recommendations.',
  alternates: {
    canonical: '/credit-cards',
  },
};

export default async function CreditCardsHub() {
  const cards = await getCreditCards();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': cards.map((card, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'FinancialProduct',
        'name': card.name,
        'brand': {
          '@type': 'Brand',
          'name': card.provider,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      
      <div className="bg-brand-surface dark:bg-slate-950 min-h-screen text-brand-textPrimary dark:text-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Best Credit Cards in the Philippines
            </h1>
            <p className="text-xl text-brand-textSecondary max-w-2xl mx-auto">
              We compare the top cards to help you maximize your rewards, waive annual fees, and stretch your Peso further.
            </p>
          </header>

          <div className="space-y-8">
            {cards.map(card => (
              <CardOverviewItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CardOverviewItem({ card }: { card: CreditCardProduct }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border shadow-sm transition-all hover:shadow-md ${card.isSponsored ? 'border-amber-400 dark:border-amber-500/50' : 'border-brand-border dark:border-white/10'}`}>
      
      {card.isSponsored && (
        <div className="w-full bg-amber-400/10 border-b border-amber-400/20 py-2 px-6 flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Sponsored Placement</span>
          {card.sponsoredDisclosure && <span className="opacity-80 font-normal hidden sm:block">{card.sponsoredDisclosure}</span>}
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
        
        {/* Left Col: Art & Brand */}
        <div className="w-full sm:w-1/3 flex flex-col items-center sm:items-start text-center sm:text-left">
           <div className="w-full aspect-[1.58] bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-brand-border dark:border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner group">
             <span className="text-slate-400 font-medium text-sm tracking-widest">{card.provider.toUpperCase()}</span>
           </div>
           
           {card.bestFor && (
             <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium mb-3">
               <ShieldCheck className="w-3.5 h-3.5" />
               Best for {card.bestFor.toLowerCase().includes('best for') ? card.bestFor.replace(/^Best for /i, '') : card.bestFor}
             </div>
           )}
        </div>

        {/* Right Col: Details */}
        <div className="w-full sm:w-2/3 flex flex-col">
          <h2 className="text-2xl font-bold mb-1">{card.name}</h2>
          <p className="text-brand-textSecondary text-sm mb-6">{card.provider}</p>

          {/* Minimal Data Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-brand-border dark:border-white/5">
             <div>
               <p className="text-xs text-brand-textSecondary mb-1 font-medium uppercase tracking-wider">Annual Fee</p>
               <p className="font-semibold text-lg">
                 {card.annualFee === 0 ? 'Free' : `₱${card.annualFee.toLocaleString()}`}
               </p>
               {card.annualFeeWaiverCondition && (
                 <p className="text-xs text-brand-textSecondary mt-0.5 truncate">{card.annualFeeWaiverCondition}</p>
               )}
             </div>
             <div>
               <p className="text-xs text-brand-textSecondary mb-1 font-medium uppercase tracking-wider">Interest Rate</p>
               <p className="font-semibold text-lg text-brand-success">{card.monthlyInterestRate * 100}% / mo</p>
             </div>
          </div>

          <ul className="space-y-2 mb-8 flex-1">
            {card.perks.slice(0, 3).map((perk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-textSecondary">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <Link 
              href={`/credit-cards/reviews/${card.id}`}
              className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors font-medium"
            >
              Read Review
            </Link>
            <a 
              href={card.affiliateUrl || '#'} 
              target="_blank" 
              rel="nofollow noopener noreferrer"
              className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-medium shadow-sm shadow-brand-primary/20"
            >
              Apply Now <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
