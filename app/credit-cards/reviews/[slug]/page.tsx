import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCreditCards, getCreditCardById } from '@/lib/credit-cards';
import { Check, X, Sparkles, ChevronLeft, ArrowRight, ShieldAlert } from 'lucide-react';

export async function generateStaticParams() {
  const cards = await getCreditCards();
  return cards.map(c => ({ slug: c.id }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const params = await props.params;
  const card = await getCreditCardById(params?.slug || '');
  if (!card) return {};
  
  return {
    title: `${card.name} Review | Truva`,
    description: card.editorVerdict,
  };
}

export default async function CreditCardReviewPage(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  const params = await props.params;
  const card = await getCreditCardById(params?.slug || '');
  
  if (!card) {
    notFound();
  }

  const reviewJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${card.name} Review`,
    description: card.editorVerdict,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      
      <div className="bg-brand-surface dark:bg-slate-950 min-h-screen pb-24">
        
        {/* Banner */}
        <div className="bg-brand-primary text-white py-12 px-4 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
           <div className="max-w-4xl mx-auto relative z-10">
             <Link href="/credit-cards" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6 transition-colors">
               <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cards
             </Link>
             
             {card.isSponsored && (
               <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-bold text-white mb-4 border border-amber-400">
                 <Sparkles className="w-3 h-3 mr-2" /> Sponsored Placement
               </div>
             )}
             
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{card.name}</h1>
             <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl">{card.bestFor}</p>
           </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl shadow-black/5 border border-brand-border dark:border-white/10 p-6 md:p-10 mb-8">
            
            {/* Editor's Verdict Header */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-white/5 mb-10 relative">
               <div className="absolute top-0 left-6 -translate-y-1/2 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-bold tracking-widest text-brand-primary uppercase">
                 Editor's Verdict
               </div>
               <p className="text-lg md:text-xl font-medium leading-relaxed mt-2 text-brand-textPrimary dark:text-gray-200">
                 "{card.editorVerdict}"
               </p>
            </div>

            {/* Pros / Cons Flex Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-2xl bg-green-50/50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4 flex items-center">
                  <Check className="w-5 h-5 mr-2" /> What We Like
                </h3>
                 <ul className="space-y-4">
                  {card.pros?.map((pro, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-brand-textSecondary dark:text-gray-300 font-medium">
                      <div className="mt-0.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                         <span className="text-[10px] font-bold">✓</span>
                      </div>
                      {pro}
                    </li>
                  ))}
                 </ul>
              </div>

              <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 flex items-center">
                  <X className="w-5 h-5 mr-2" /> What To Watch Out For
                </h3>
                 <ul className="space-y-4">
                  {card.cons?.map((con, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-brand-textSecondary dark:text-gray-300 font-medium">
                      <div className="mt-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                         <span className="text-[10px] font-bold">×</span>
                      </div>
                      {con}
                    </li>
                  ))}
                 </ul>
              </div>
            </div>

            {/* Facts Table */}
            <h3 className="text-2xl font-bold mb-6">Rates & Fees</h3>
            <div className="border border-brand-border dark:border-white/10 rounded-xl overflow-hidden mb-12">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-brand-border dark:divide-white/10">
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary w-1/3">Annual Fee</th>
                    <td className="py-4 px-6 font-medium text-brand-textPrimary dark:text-gray-100">
                      {card.annualFee === 0 ? '₱0 (No Annual Fee)' : `₱${card.annualFee.toLocaleString()}`}
                      {card.annualFeeWaiverCondition && <span className="block text-xs font-normal text-brand-textSecondary mt-1">{card.annualFeeWaiverCondition}</span>}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary">Interest Rate (Finance Charge)</th>
                    <td className="py-4 px-6 font-medium text-brand-success">{card.monthlyInterestRate * 100}% per month</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary">Reward Type</th>
                    <td className="py-4 px-6 font-medium capitalize">{card.rewardType}</td>
                  </tr>
                  <tr>
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary">Minimum Income</th>
                    <td className="py-4 px-6 font-medium">₱{card.minimumMonthlyIncome.toLocaleString()} / month</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Eligibility & FAQs */}
            <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl p-6 md:p-8 mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center text-blue-900 dark:text-blue-400">
                <ShieldAlert className="w-5 h-5 mr-2" /> Who Can Get This Card?
              </h3>
              <p className="text-brand-textSecondary dark:text-gray-300 leading-relaxed font-medium">
                {card.eligibilitySummary}
              </p>
            </div>

            {card.faqs && card.faqs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                <div className="space-y-6">
                  {card.faqs?.map((faq, idx) => (
                    <div key={idx} className="border-b border-brand-border dark:border-white/10 pb-6 last:border-0">
                      <h4 className="font-bold text-lg mb-2">{faq.question}</h4>
                      <p className="text-brand-textSecondary dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* CTA */}
            <div className="mt-12 pt-8 border-t border-brand-border dark:border-white/10 flex justify-center flex-col sm:flex-row gap-4 items-center">
               <span className="text-xs text-brand-textSecondary max-w-xs text-center">
                 {card.isSponsored ? `${card.sponsoredDisclosure || 'This placement is sponsored'}` : 'Truva is an independent comparison platform.'}
               </span>
               <a 
                 href={card.affiliateUrl || '#'} 
                 target="_blank" 
                 rel="nofollow noopener noreferrer"
                 className="inline-flex w-full sm:w-auto justify-center items-center py-4 px-8 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-bold text-lg shadow-lg shadow-brand-primary/20"
               >
                 Apply securely on {card.provider}'s website <ArrowRight className="w-5 h-5 ml-2" />
               </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
