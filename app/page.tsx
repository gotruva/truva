import { getLiveRates } from '@/lib/rates';
import { RateSection } from '@/components/RateSection';
import { YieldCalculator } from '@/components/YieldCalculator';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { HeroSection } from '@/components/HeroSection';

export default async function HomePage() {
  const rates = await getLiveRates();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': rates.map((rate, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'FinancialProduct',
        'name': rate.name,
        'brand': {
          '@type': 'Brand',
           'name': rate.provider
        },
        'feesAndCommissionsSpecification': '20% Final Withholding Tax applied unless tax-exempt',
      }
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <HeroSection />

      {/* Wrapping content with generic surface bg */}
      <div className="bg-[#F8F9FB] dark:bg-slate-950 pb-24 border-b border-brand-border dark:border-white/10 pt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <YieldCalculator rates={rates} />
          
          <div className="px-4 mt-8">
             <div className="max-w-3xl mb-8">
                <h2 className="text-2xl font-bold text-brand-textPrimary">Compare Today&apos;s Best Rates</h2>
             </div>
             <RateSection rates={rates} />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
        <NewsletterSignup />
      </div>
    </>
  );
}
