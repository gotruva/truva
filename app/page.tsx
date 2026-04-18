import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { formatVerifiedDate, getLatestVerifiedDate, getPublicRates } from '@/lib/rates';
import { HeroSection } from '@/components/HeroSection';
import { CompareHub } from '@/components/CompareHub';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gotruva.com';
const NewsletterSignup = nextDynamic(() => import('@/components/NewsletterSignup').then((mod) => mod.NewsletterSignup));

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const rates = await getPublicRates();

  const rateListJsonLd = {
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
          'name': rate.provider,
        },
        'feesAndCommissionsSpecification': '20% Final Withholding Tax applied unless tax-exempt',
        'url': `${BASE_URL}/go/${rate.id}`,
      },
    })),
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Truva',
    'url': BASE_URL,
    'description': 'Philippine financial product comparison platform showing after-tax savings yields from digital banks, T-Bills, UITFs, and DeFi.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Truva',
    'url': BASE_URL,
    'logo': `${BASE_URL}/truva-logo-blue.png`,
    'description': 'Truva is the Philippines\' leading after-tax savings rate comparison platform.',
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'partners@truva.ph',
      'contactType': 'partnerships',
    },
    'areaServed': 'PH',
    'knowsAbout': [
      'Philippine savings accounts',
      'Digital banking Philippines',
      'Treasury Bills Philippines',
      'MP2 savings',
      'UITF Philippines',
      'After-tax savings rates',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is the best savings account in the Philippines?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The best savings account depends on your balance and goals. Maya Savings offers up to 12% p.a. gross (9.6% after tax) on the first PHP 100,000. For larger amounts, GoTyme and CIMB offer competitive rates. Truva shows all rates after the 20% Final Withholding Tax so you can compare true returns.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How much tax is charged on savings interest in the Philippines?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Philippine banks automatically deduct 20% Final Withholding Tax (FWT) on interest earned from peso savings and time deposits. For example, a 5% gross rate becomes 4% after tax. Truva shows all rates after this tax is applied.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How are T-Bills taxed in the Philippines?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Treasury Bill discount income is generally subject to 20% Final Withholding Tax for taxable investors. Truva compares T-Bill benchmarks on an after-tax basis unless a product is explicitly marked tax-exempt.',
        },
      },
      {
        '@type': 'Question',
        'name': 'What is after-tax yield and why does it matter?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'After-tax yield is the actual return you keep after the government deducts Final Withholding Tax. A 5% gross savings rate is only 4% after the 20% FWT. Truva is the only Philippine comparison platform that shows after-tax rates as the primary figure, making it easier to compare products fairly.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Is MP2 better than a digital bank savings account?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'MP2 (Modified Pag-IBIG II) is tax-exempt and has historically paid 6-7% p.a. dividend rates, making it one of the highest-yielding safe investments in the Philippines. However, it has a 5-year lock-in period. Digital bank savings accounts offer lower rates but instant liquidity. Use Truva\'s calculator to compare both side by side.',
        },
      },
    ],
  };

  const formattedDate = formatVerifiedDate(getLatestVerifiedDate(rates));
  const jsonLdScripts = [
    { id: 'home-rate-list-jsonld', content: rateListJsonLd },
    { id: 'home-website-jsonld', content: websiteJsonLd },
    { id: 'home-org-jsonld', content: organizationJsonLd },
    { id: 'home-faq-jsonld', content: faqJsonLd },
  ];

  return (
    <>
      {jsonLdScripts.map((script) => (
        <script
          key={script.id}
          id={script.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(script.content) }}
        />
      ))}

      <HeroSection formattedDate={formattedDate} />

      {/* Wrapping content with generic surface bg */}
      <div className="bg-[#F8F9FB] dark:bg-slate-950 pb-24 border-b border-brand-border dark:border-white/10 pt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto scroll-mt-28" id="calculator">
          <CompareHub rates={rates} formattedDate={formattedDate} />
        </div>
      </div>
      
      <div id="newsletter" className="bg-white dark:bg-slate-950 transition-colors duration-300">
        <NewsletterSignup />
      </div>
    </>
  );
}
