import type { ArticleTocItem, EditorialArticle } from '@/types';

function compareArticles(a: EditorialArticle, b: EditorialArticle) {
  if (a.featured !== b.featured) {
    return a.featured ? -1 : 1;
  }

  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const BANKING_EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: 'best-digital-bank-philippines',
    path: '/banking/rates/best-digital-bank-philippines',
    title: 'Best digital bank Philippines 2026: rates, conditions & real peso math',
    seoTitle: 'Best digital banks Philippines 2026: rates & real peso math',
    description:
      'Compare 8 Philippine digital banks by real peso earnings. See what PHP 100K, 250K, and 500K actually earns per month. Find your best savings rate now.',
    subtitle:
      'A snapshot-based guide for savers who want the current rates, the conditions behind them, and the peso math for common balances.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'rates',
    articleType: 'Rate Guide',
    eyebrow: 'Featured rate guide',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Truva Research Team',
    readingTime: '11 min read',
    featured: true,
    keywords: ['digital bank philippines', 'best savings account philippines', 'digital bank rates'],
    verificationNote: 'Rates below are aligned to Truva’s verified snapshot.',
    disclosureNote:
      'Returns shown in articles may be gross or after-tax depending on context. Truva highlights after-tax math wherever possible.',
    toc: [
      { label: 'Digital bank rates Philippines 2026: the full picture' },
      { label: 'What you actually earn: peso math for PHP 100K, PHP 250K, and PHP 500K' },
      { label: 'Account conditions: what the headline rate does not tell you' },
      { label: 'Best digital bank for your situation' },
      { label: 'Is your money safe? PDIC insurance for digital banks Philippines' },
      { label: 'Digital bank vs traditional bank: why the rates are so different' },
      { label: 'Frequently asked questions' },
      { label: 'Conclusion: where to start this week' },
    ],
    faqItems: [
      {
        question: 'Which digital bank has the highest interest rate in the Philippines right now?',
        answer:
          'Maya Savings has the highest headline liquid rate in Truva’s current snapshot at 12% on the first PHP 100,000, but only if you meet the monthly spend and Easy Credit requirements. For a simpler liquid option, BanKo Savings pays 5% from PHP 5,000 to PHP 1,000,000.',
      },
      {
        question: "Is Maya's 12% interest rate real?",
        answer:
          'Yes, but only on the first PHP 100,000 of your balance, and only in months where you complete the required spend and Easy Credit activity. Miss the requirements and you fall back to Maya’s 2.5% base rate.',
      },
      {
        question: 'Can I open accounts at multiple digital banks at the same time?',
        answer:
          'Yes. There is no BSP rule against holding accounts at multiple digital banks simultaneously. Many Filipinos use one bank for spending, another for passive liquid savings, and a third for locked savings goals.',
      },
      {
        question: 'What happens to my money if a digital bank closes?',
        answer:
          'Your deposits are protected by PDIC up to PHP 1,000,000 per bank, per depositor. If a BSP-licensed digital bank closes, PDIC processes your claim and returns your money up to that limit.',
      },
      {
        question: 'Are all digital banks in the Philippines covered by PDIC?',
        answer:
          'All BSP-licensed digital banks are covered by PDIC. You should still verify that the institution is BSP-supervised before depositing money.',
      },
      {
        question: 'How do I know if a digital bank is BSP-licensed?',
        answer:
          "Check the BSP's official list of supervised financial institutions at bsp.gov.ph. Legitimate digital banks also display their BSP license number in their app and on their website.",
      },
    ],
    primaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'Jump straight to Truva’s main comparison table and current live rates.',
    },
    secondaryCta: {
      label: 'Use the savings calculator',
      href: '/calculator',
      description: 'Model what your balance could earn before you move money.',
    },
    relatedArticles: ['maya-savings-review'],
  },
  {
    slug: 'maya-savings-review',
    path: '/banking/reviews/maya-savings-review',
    title: 'Maya Savings Review (2026): Is it still the best digital bank?',
    seoTitle: 'Maya Savings Review 2026: missions, rates, and what the hype misses',
    description:
      'A closer review of Maya Savings, its mission-based boosts, and who should actually use it as a primary savings account.',
    subtitle:
      'A practical review for users deciding whether Maya is a genuine savings home or just a strong first PHP 100,000 account.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'reviews',
    articleType: 'Review',
    eyebrow: 'Product review',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Truva Research Team',
    readingTime: '6 min read',
    featured: false,
    keywords: ['maya savings review', 'maya savings interest rate', 'maya bank philippines'],
    verificationNote: 'Product details and rates are reviewed alongside Truva rate updates.',
    disclosureNote:
      'Mission-driven promo rates can change quickly. Always confirm the current boost rules before acting on the headline rate.',
    toc: [
      { label: 'Key Facts & Rates' },
      { label: 'Why it wins for many Filipinos' },
      { label: 'The Mission System Explained', depth: 3 },
      { label: 'What to watch out for' },
      { label: 'Final Verdict' },
    ],
    primaryCta: {
      label: 'Compare Maya against other banks',
      href: '/#deposit-rates',
      description: 'Jump to Truva’s main comparison table to see whether Maya still wins.',
    },
    secondaryCta: {
      label: 'Go back to Banking',
      href: '/banking',
      description: 'Browse more banking tools, guides, and reviews.',
    },
    relatedArticles: ['best-digital-bank-philippines'],
  },
];

export function getBankingArticles(section?: EditorialArticle['section']) {
  const articles = section
    ? BANKING_EDITORIAL_ARTICLES.filter((article) => article.section === section)
    : BANKING_EDITORIAL_ARTICLES;

  return [...articles].sort(compareArticles);
}

export function getFeaturedBankingArticle() {
  return getBankingArticles().find((article) => article.featured) ?? getBankingArticles()[0];
}

export function getBankingArticle(slug: string) {
  return BANKING_EDITORIAL_ARTICLES.find((article) => article.slug === slug);
}

export function getBankingArticlesBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => getBankingArticle(slug))
    .filter((article): article is EditorialArticle => Boolean(article))
    .sort(compareArticles);
}

export function buildItemListSchema(items: EditorialArticle[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        url: `${baseUrl}${article.path}`,
      },
    })),
  };
}

export function buildTocAnchors(items: ArticleTocItem[]) {
  return items.map((item) => ({
    ...item,
    href: `#${slugifyHeading(item.label)}`,
  }));
}
