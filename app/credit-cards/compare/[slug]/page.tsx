import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCreditCards, getCreditCardById } from '@/lib/credit-cards';
import { Check, X, ChevronLeft, ArrowRight, Minus } from 'lucide-react';
import Image from 'next/image';

// To generate a reasonable number of static pages, we'll generate combinations
export async function generateStaticParams() {
  const cards = await getCreditCards();
  const paths = [];

  // Generate all unique pairs (A-vs-B) - this generates N*(N-1)/2 pages
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      paths.push({ slug: `${cards[i].id}-vs-${cards[j].id}` });
      // We also generate B-vs-A for user flexibility, though normally A-vs-B is preferred canonically
      paths.push({ slug: `${cards[j].id}-vs-${cards[i].id}` });
    }
  }

  return paths;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  // Await params for Next 15+ compatibility
  const params = await props.params;
  const slug = params?.slug || '';
  
  if (!slug.includes('-vs-')) return {};
  
  const [slug1, slug2] = slug.split('-vs-');
  if (!slug1 || !slug2) return {};

  const card1 = await getCreditCardById(slug1);
  const card2 = await getCreditCardById(slug2);
  
  if (!card1 || !card2) return {};
  
  return {
    title: `${card1.name} vs ${card2.name} | Truva Compare`,
    description: `Side-by-side comparison of ${card1.name} and ${card2.name}. Compare annual fees, interest rates, rewards, and eligibility requirements.`,
  };
}

export default async function CreditCardComparePage(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Await params for Next 15+ compatibility
  const params = await props.params;
  const slug = params?.slug || '';

  if (!slug.includes('-vs-')) {
    notFound();
  }

  const [slug1, slug2] = slug.split('-vs-');
  
  if (!slug1 || !slug2) {
    notFound();
  }

  const card1 = await getCreditCardById(slug1);
  const card2 = await getCreditCardById(slug2);
  
  if (!card1 || !card2) {
    notFound();
  }

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${card1.name} vs ${card2.name} Comparison`,
    description: `Compare the ${card1.name} vs the ${card2.name} side-by-side to find the best credit card for your needs.`,
    author: {
      '@type': 'Person',
      name: 'Beto',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Truva',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      
      <div className="bg-brand-surface dark:bg-slate-950 min-h-screen pb-24">
        
        {/* Banner */}
        <div className="bg-brand-primary text-white py-12 px-4 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
           <div className="max-w-5xl mx-auto relative z-10 text-center">
             <Link href="/credit-cards" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6 transition-colors mx-auto">
               <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cards
             </Link>
             
             <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-4 flex-wrap">
               <span>{card1.name}</span>
               <span className="text-xl md:text-2xl text-white/60 font-light px-2">vs</span>
               <span>{card2.name}</span>
             </h1>
             <p className="text-lg text-white/80 max-w-2xl mx-auto">
               Side-by-side comparison to help you choose the right fit.
             </p>
           </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
          
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl shadow-black/5 border border-brand-border dark:border-white/10 overflow-hidden mb-8">
            
            {/* Header row with cards */}
            <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 border-b border-brand-border dark:border-white/10">
               {/* Card 1 */}
               <div className="p-4 md:p-8 flex flex-col items-center text-center border-r border-brand-border dark:border-white/10">
                 <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-tight">{card1.name}</h2>
                 <span className="text-brand-textSecondary text-xs md:text-sm mb-4 md:mb-6">{card1.provider}</span>
                 <p className="text-xs md:text-sm font-medium mb-6 md:mb-8 text-brand-textPrimary dark:text-gray-300 max-w-sm">
                   "{card1.editorVerdict}"
                 </p>
                 <a 
                   href={card1.affiliateUrl || '#'} 
                   target="_blank" 
                   rel="nofollow noopener noreferrer"
                   className="inline-flex w-full sm:w-auto justify-center items-center py-2 md:py-3 px-4 md:px-6 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-bold text-sm md:text-base shadow-md shadow-brand-primary/20 mt-auto"
                 >
                   Apply <span className="hidden sm:inline ml-1">Now</span>
                 </a>
               </div>
               
               {/* Card 2 */}
               <div className="p-4 md:p-8 flex flex-col items-center text-center border-r border-brand-border dark:border-white/10">
                 <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-tight">{card2.name}</h2>
                 <span className="text-brand-textSecondary text-xs md:text-sm mb-4 md:mb-6">{card2.provider}</span>
                 <p className="text-xs md:text-sm font-medium mb-6 md:mb-8 text-brand-textPrimary dark:text-gray-300 max-w-sm">
                   "{card2.editorVerdict}"
                 </p>
                 <a 
                   href={card2.affiliateUrl || '#'} 
                   target="_blank" 
                   rel="nofollow noopener noreferrer"
                   className="inline-flex w-full sm:w-auto justify-center items-center py-2 md:py-3 px-4 md:px-6 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-bold text-sm md:text-base shadow-md shadow-brand-primary/20 mt-auto"
                 >
                   Apply <span className="hidden sm:inline ml-1">Now</span>
                 </a>
               </div>
            </div>

            {/* Comparison Table */}
            <div className="divide-y divide-brand-border dark:divide-white/10">
               
               {/* Feature 1: Best For */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Best For</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <p className="text-xs md:text-sm">{card1.bestFor}</p>
                   </div>
                   <div className="p-3 md:p-6">
                     <p className="text-xs md:text-sm">{card2.bestFor}</p>
                   </div>
                 </div>
               </div>

               {/* Feature: Annual Fee */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Annual Fee</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <p className="font-semibold text-base md:text-lg">{card1.annualFee === 0 ? '₱0' : `₱${card1.annualFee.toLocaleString()}`}</p>
                     {card1.annualFeeWaiverCondition && <p className="text-[10px] md:text-xs text-brand-textSecondary mt-1 leading-tight">{card1.annualFeeWaiverCondition}</p>}
                   </div>
                   <div className="p-3 md:p-6">
                     <p className="font-semibold text-base md:text-lg">{card2.annualFee === 0 ? '₱0' : `₱${card2.annualFee.toLocaleString()}`}</p>
                     {card2.annualFeeWaiverCondition && <p className="text-[10px] md:text-xs text-brand-textSecondary mt-1 leading-tight">{card2.annualFeeWaiverCondition}</p>}
                   </div>
                 </div>
               </div>

               {/* Feature: Interest Rate */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Interest Rate</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <p className="text-xs md:text-sm font-medium">{card1.monthlyInterestRate * 100}% per month</p>
                   </div>
                   <div className="p-3 md:p-6">
                     <p className="text-xs md:text-sm font-medium">{card2.monthlyInterestRate * 100}% per month</p>
                   </div>
                 </div>
               </div>

               {/* Feature: Minimum Income */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Min. Income</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <p className="text-xs md:text-sm font-medium">₱{card1.minimumMonthlyIncome.toLocaleString()} / month</p>
                   </div>
                   <div className="p-3 md:p-6">
                     <p className="text-xs md:text-sm font-medium">₱{card2.minimumMonthlyIncome.toLocaleString()} / month</p>
                   </div>
                 </div>
               </div>

               {/* Feature: Welcome Promo */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Welcome Promo</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <p className="text-xs md:text-sm font-medium text-brand-success">{card1.welcomePromo || 'None'}</p>
                   </div>
                   <div className="p-3 md:p-6">
                     <p className="text-xs md:text-sm font-medium text-brand-success">{card2.welcomePromo || 'None'}</p>
                   </div>
                 </div>
               </div>
               
               {/* Feature: Pros */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Pros</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <ul className="space-y-3">
                       {card1.pros?.map((pro, idx) => (
                         <li key={idx} className="flex gap-2 text-xs md:text-sm text-brand-textSecondary dark:text-gray-300">
                           <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 shrink-0 mt-0.5" />
                           <span className="leading-tight">{pro}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                   <div className="p-3 md:p-6">
                     <ul className="space-y-3">
                       {card2.pros?.map((pro, idx) => (
                         <li key={idx} className="flex gap-2 text-xs md:text-sm text-brand-textSecondary dark:text-gray-300">
                           <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 shrink-0 mt-0.5" />
                           <span className="leading-tight">{pro}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </div>
               </div>

               {/* Feature: Cons */}
               <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                 <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
                   <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">Cons</h3>
                 </div>
                 <div className="md:col-span-9 grid grid-cols-2">
                   <div className="p-3 md:p-6 border-r border-brand-border dark:border-white/10">
                     <ul className="space-y-3">
                       {card1.cons?.map((con, idx) => (
                         <li key={idx} className="flex gap-2 text-xs md:text-sm text-brand-textSecondary dark:text-gray-300">
                           <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 shrink-0 mt-0.5" />
                           <span className="leading-tight">{con}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                   <div className="p-3 md:p-6">
                     <ul className="space-y-3">
                       {card2.cons?.map((con, idx) => (
                         <li key={idx} className="flex gap-2 text-xs md:text-sm text-brand-textSecondary dark:text-gray-300">
                           <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 shrink-0 mt-0.5" />
                           <span className="leading-tight">{con}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </div>
               </div>
               
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 md:p-8 border-t border-brand-border dark:border-white/10 text-center">
              <p className="text-[10px] md:text-xs text-brand-textSecondary mb-2 md:mb-4">
                 Truva is an independent comparison platform. 
                 {card1.isSponsored || card2.isSponsored ? ' Some products shown above may be sponsored placements.' : ''}
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
