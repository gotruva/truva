import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { PortalHero } from '@/components/PortalHero';
import { BankLogoStrip } from '@/components/BankLogoStrip';
import { CategoryHub } from '@/components/CategoryHub';
import { TrustStrip } from '@/components/TrustStrip';

import { BASE_URL } from '@/lib/constants';

const NewsletterSignup = nextDynamic(() => import('@/components/NewsletterSignup').then((mod) => mod.NewsletterSignup));

export const metadata: Metadata = {
  title: "Truva — Philippines' Financial Comparison Platform",
  description:
    "The free comparison platform for Filipino savers. Compare savings accounts, money market funds, credit cards, and more — all after-tax.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Truva',
    url: BASE_URL,
    title: "Truva — Philippines' Financial Comparison Platform",
    description:
      'The free comparison platform for Filipino savers. Compare savings, funds, credit cards, and more — all after-tax.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Truva - Philippines Financial Comparison Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Truva — Philippines' Financial Comparison Platform",
    description:
      'Compare savings, funds, credit cards, and more after-tax. The free comparison platform for Filipino savers.',
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  const verifiedDate = 'May 2026';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Truva',
    url: BASE_URL,
    description:
      "Truva is the Philippines' free financial comparison platform. Compare savings accounts, money market funds, credit cards, and more — all after-tax.",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Truva',
    url: BASE_URL,
    logo: `${BASE_URL}/truva-logo-blue.png`,
    description:
      "Truva is the Philippines' leading after-tax financial comparison platform for savings, funds, credit cards, and loans.",
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'partners@truva.ph',
      contactType: 'partnerships',
    },
    areaServed: 'PH',
    knowsAbout: [
      'Philippine savings accounts',
      'Digital banking Philippines',
      'Treasury Bills Philippines',
      'MP2 savings',
      'UITF Philippines',
      'Money market funds Philippines',
      'Credit cards Philippines',
      'After-tax savings rates',
    ],
  };

  return (
    <>
      <script
        id="home-website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        id="home-org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <PortalHero verifiedDate={verifiedDate} />
      <BankLogoStrip />
      <CategoryHub />
      <TrustStrip verifiedDate={verifiedDate} />

      <div id="newsletter" className="bg-white dark:bg-slate-950 transition-colors duration-300">
        <NewsletterSignup />
      </div>
    </>
  );
}
