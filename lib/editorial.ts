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
    seoTitle: 'Best digital banks Philippines 2026: rates and real peso math',
    description:
      'Compare 8 Philippine digital banks by real peso earnings. See what PHP 100K, 250K, and 500K actually earns per month.',
    subtitle:
      'A snapshot-based guide for savers who want the current rates, the conditions behind them, and the peso math for common balances.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'rates',
    articleType: 'Rate Guide',
    eyebrow: 'Featured rate guide',
    bannerUrl: '/images/banners/best-digital-bank-philippines.png',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '11 min read',
    featured: true,
    keywords: ['digital bank philippines', 'best savings account philippines', 'digital bank rates'],
    verificationNote: 'Rates below are aligned to Truva verified snapshot.',
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
          'Maya Savings has the highest headline liquid rate in Truva current snapshot at 12% on the first PHP 100,000, but only if you meet the monthly spend and Easy Credit requirements. For a simpler liquid option, BanKo Savings pays 5% from PHP 5,000 to PHP 1,000,000.',
      },
      {
        question: "Is Maya's 12% interest rate real?",
        answer:
          'Yes, but only on the first PHP 100,000 of your balance, and only in months where you complete the required spend and Easy Credit activity. Miss the requirements and you fall back to Maya base rate.',
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
    ],
    primaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'Jump straight to Truva main comparison table and current live rates.',
    },
    secondaryCta: {
      label: 'Use the savings calculator',
      href: '/calculator',
      description: 'Model what your balance could earn before you move money.',
    },
    relatedArticles: [
      'maya-savings-review',
      'maya-vs-gotyme-vs-tonik',
      'final-withholding-tax-explained',
      'pdic-insurance-guide',
    ],
  },
  {
    slug: 'digital-bank-interest-rates-philippines-2026',
    path: '/banking/rates/digital-bank-interest-rates-philippines-2026',
    title: 'Digital bank interest rates Philippines 2026: updated weekly with after-tax math',
    seoTitle: 'Digital bank interest rates Philippines 2026 | Truva',
    description:
      'Maya 12% (9.6% after tax). Tonik 8%. GoTyme 3%. Full digital bank interest rate table for Philippines 2026, updated every week. See what your balance earns.',
    subtitle:
      'A weekly-updated rate snapshot with real peso math for PHP 100K, PHP 250K, and PHP 500K balances, and a plain explanation of the 20% tax every saver needs to know.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'rates',
    articleType: 'Rate Guide',
    eyebrow: 'Rate guide',
    bannerUrl: '/images/banners/Digital-Bank-Interest-Rates-Philippines-2026.png',
    publishedAt: '2026-04-14',
    updatedAt: '2026-04-14',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '8 min read',
    featured: false,
    keywords: [
      'digital bank interest rates Philippines 2026',
      'digital bank rates',
      'highest interest digital bank Philippines',
      'after-tax savings rate Philippines',
    ],
    verificationNote: 'Rates verified April 14, 2026 on gotruva.com.',
    disclosureNote:
      'After-tax rates shown use the 20% Final Withholding Tax mandated under Philippine law. Rates subject to change; table updated weekly.',
    sectionPath: '/banking/rates',
    toc: [
      { label: 'Digital bank interest rates Philippines 2026: full table' },
      { label: 'What you actually earn: peso math for PHP 100K, PHP 250K, and PHP 500K' },
      { label: 'Withdraw anytime vs time locked: which suits you?' },
      { label: 'Why the after-tax number is smaller: the 20% FWT explained' },
      { label: 'Digital bank rate changes in early 2026: what you need to know' },
      { label: 'PDIC insurance: your money is protected up to PHP 1,000,000' },
      { label: 'Frequently asked questions' },
      { label: 'Which digital bank interest rate is right for you in 2026?' },
    ],
    faqItems: [
      {
        question: 'Which digital bank pays the highest interest right now?',
        answer:
          'Maya pays 12% (9.6% after tax), the highest available anytime-access rate in the Philippines as of April 2026. For locked savings, Tonik pays 8% on a 1-year time deposit.',
      },
      {
        question: 'Is 12% interest real or is there a catch?',
        answer:
          'The rate is real on the first PHP 100,000. After the 20% government tax, you take home 9.6%. On PHP 250,000, that is PHP 24,000 per year in your account.',
      },
      {
        question: 'Are digital banks safe? Will the government protect my money if a bank closes?',
        answer:
          'Yes. All BSP-licensed digital banks are covered by PDIC up to PHP 1,000,000 per bank. If a bank closes, PDIC processes your claim and returns your money up to that limit.',
      },
      {
        question: 'Why do digital banks pay more than traditional banks like BPI and BDO?',
        answer:
          'Lower overhead. Digital banks have no physical branches, fewer staff, lower rent. They pass those savings to depositors as higher interest rates.',
      },
      {
        question: 'Do I pay taxes on digital bank interest?',
        answer:
          'Yes. The 20% Final Withholding Tax (FWT) is automatically deducted before interest hits your account. The after-tax rates in the table above are what you actually receive.',
      },
      {
        question: 'How often do rates change?',
        answer:
          'Typically 2 to 4 times per year. Maya and GoTyme cut base rates in January 2026. This table is updated weekly.',
      },
    ],
    primaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'Jump straight to the Truva comparison table for current live rates.',
    },
    secondaryCta: {
      label: 'Use the savings calculator',
      href: '/calculator',
      description: 'Model what your balance earns after tax before you move money.',
    },
    relatedArticles: [
      'best-digital-bank-philippines',
      'maya-savings-review',
      'maya-vs-gotyme-vs-tonik',
      'pdic-insurance-guide',
      'final-withholding-tax-explained',
    ],
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
    author: 'Beto',
    authorUrl: '/authors/beto',
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
      description: 'Jump to Truva main comparison table to see whether Maya still wins.',
    },
    secondaryCta: {
      label: 'Go back to Banking',
      href: '/banking',
      description: 'Browse more banking tools, guides, and reviews.',
    },
    relatedArticles: ['best-digital-bank-philippines', 'maya-vs-gotyme-vs-tonik', 'pdic-insurance-guide'],
  },
  {
    slug: 'maya-vs-gotyme-vs-tonik',
    path: '/banking/compare/maya-vs-gotyme-vs-tonik',
    title: 'Maya vs GoTyme vs Tonik: which digital bank fits your savings style?',
    seoTitle: 'Maya vs GoTyme vs Tonik 2026: best digital bank by behavior',
    description:
      'Compare the three most useful Philippine digital banks by rate, conditions, and the type of saver they fit best.',
    subtitle:
      'A head-to-head brief for users choosing between a mission-based account, a no-conditions account, and a simple stash.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'compare',
    sectionPath: '/banking/compare',
    articleType: 'Comparison',
    eyebrow: 'Head-to-head brief',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '8 min read',
    featured: false,
    keywords: ['maya vs gotyme vs tonik', 'digital bank comparison philippines', 'best digital bank philippines'],
    verificationNote: 'Comparison uses Truva rate snapshots and account condition checks.',
    disclosureNote:
      'The right choice depends less on headline rate and more on whether you can live with the monthly conditions.',
    toc: [
      { label: 'The short answer' },
      { label: 'Rate and condition comparison' },
      { label: 'Which saver each bank fits' },
      { label: 'Decision matrix' },
      { label: 'Frequently asked questions' },
    ],
    faqItems: [
      {
        question: 'Which bank is best if I do nothing each month?',
        answer:
          'Tonik and GoTyme are the cleaner options if you want minimal behavior changes. Maya can win on headline rate, but only if you are already spending through the app each month.',
      },
      {
        question: 'Which bank is best for a spending-heavy user?',
        answer:
          'Maya can be the strongest pick if you already complete the monthly spend and mission requirements. If you do not, the base rate is easier to beat elsewhere.',
      },
    ],
    primaryCta: {
      label: 'Open the live rate desk',
      href: '/#deposit-rates',
      description: 'Check the current rates behind the comparison before you move money.',
    },
    secondaryCta: {
      label: 'Use the calculator',
      href: '/calculator',
      description: 'See how each account changes your take-home earnings.',
    },
    relatedArticles: ['best-digital-bank-philippines', 'maya-savings-review', 'final-withholding-tax-explained'],
  },
  {
    slug: 'maya-vs-gotyme-philippines',
    path: '/banking/compare/maya-vs-gotyme-philippines',
    bannerUrl: '/images/banners/maya-vs-gotyme-philippines.png',
    title: 'Maya vs GoTyme Philippines 2026: which digital bank should you choose?',
    seoTitle: 'Maya vs GoTyme Philippines 2026: Which Pays More?',
    description:
      'Comparing Maya and GoTyme Philippines in 2026? At ₱250,000 saved, Maya earns ₱10,200 more per year after tax. See full tables, boost guide, and the dual-bank strategy.',
    subtitle: 'A peso-math comparison of Maya and GoTyme for 2026, with real after-tax earnings at three balance levels and a scenario guide for every saver type.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'compare',
    sectionPath: '/banking/compare',
    articleType: 'Comparison',
    eyebrow: 'Bank comparison',
    publishedAt: '2026-04-15',
    updatedAt: '2026-04-15',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '10 min read',
    featured: false,
    keywords: ['Maya vs GoTyme Philippines', 'Maya vs GoTyme Philippines 2026', 'which digital bank Philippines'],
    verificationNote: 'Rates verified April 15, 2026. Maya base rate is 3.5% (April 2026 promo); GoTyme Go Save is 3.0%. Both banks are PDIC-insured up to ₱1,000,000 per depositor.',
    disclosureNote:
      'After-tax figures use the 20% Final Withholding Tax mandated under Philippine law. Rates subject to change.',
    toc: [
      { label: 'Maya vs GoTyme at a glance' },
      { label: 'The real peso math: what you actually earn after tax' },
      { label: "How Maya's savings rate actually works" },
      { label: 'How GoTyme Go Save actually works' },
      { label: 'Which bank fits your situation' },
      { label: 'Should you use both? Most savvy users do.' },
      { label: 'Frequently asked questions' },
      { label: 'The bottom line' },
    ],
    faqItems: [
      {
        question: 'Is Maya or GoTyme better for savings in the Philippines?',
        answer:
          "Maya earns more if you regularly use it for spending (bills, load, QR). Even the minimum ₱250/month spend unlocks 5%, more than GoTyme's 3%. If you want zero conditions and multiple named accounts, GoTyme is the cleaner choice.",
      },
      {
        question: 'Can I open both a Maya and GoTyme account?',
        answer:
          'Yes. Both require only a valid ID and a selfie. Neither has a minimum deposit. Many Filipinos use Maya for day-to-day transactions and GoTyme for passive savings goals.',
      },
      {
        question: "What do I need to do to get Maya's boosted interest?",
        answer:
          'Spend ₱250 or more per month on bills, load, stocks, funds, or payments to unlock the first boost tier (5%). Higher tiers require more spending. The boost applies only to your first ₱100,000.',
      },
      {
        question: 'Does GoTyme have a cap on the 3% rate?',
        answer:
          "No. GoTyme's 3.0% applies to your full balance with no upper limit. You can have up to 5 separate Go Save accounts, each earning the full 3.0%.",
      },
      {
        question: 'Are Maya and GoTyme PDIC insured?',
        answer:
          'Yes. Both are BSP-licensed digital banks. Both Maya and GoTyme are PDIC-insured up to ₱1,000,000 per depositor.',
      },
    ],
    primaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'See current Maya and GoTyme rates on the Truva comparison table.',
    },
    secondaryCta: {
      label: 'Use the savings calculator',
      href: '/calculator',
      description: 'Model what your balance earns after tax before you move money.',
    },
    relatedArticles: ['maya-savings-review', 'best-digital-bank-philippines', 'digital-bank-interest-rates-philippines-2026', 'pdic-insurance-guide'],
  },
  {
    slug: 'best-no-conditions-savings',
    path: '/banking/compare/best-no-conditions-savings',
    title: 'Best no-conditions savings accounts in the Philippines 2026',
    seoTitle: 'Best no-conditions savings accounts Philippines 2026',
    description:
      'Find the cleanest Philippine savings accounts when you want a solid rate without monthly spending chores or promo hoops.',
    subtitle: 'For savers who want a rate that is easy to keep, not just easy to market.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'compare',
    sectionPath: '/banking/compare',
    articleType: 'Comparison',
    eyebrow: 'No-conditions shortlist',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '7 min read',
    featured: false,
    keywords: ['no conditions savings account philippines', 'best savings account philippines', 'digital bank comparison'],
    verificationNote: 'Condition checks are based on Truva snapshots and product disclosures.',
    disclosureNote:
      'Some products still have balance floors or caps. No-conditions here means no monthly task requirement.',
    toc: [
      { label: 'The short answer' },
      { label: 'No-conditions comparison' },
      { label: 'Who should pick each account' },
      { label: 'When a conditional bank still wins' },
      { label: 'Frequently asked questions' },
    ],
    faqItems: [
      {
        question: 'What counts as a no-conditions savings account?',
        answer:
          'A no-conditions account pays its advertised rate without forcing you to hit a monthly spend target, use promo missions, or complete activity hoops.',
      },
      {
        question: 'Can a bank still have a balance floor and be no-conditions?',
        answer:
          'Yes. A balance floor is a product rule, but it is different from a monthly activity requirement. Truva separates those two so the comparison stays honest.',
      },
    ],
    primaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'Confirm the current rates before you choose the simplest option.',
    },
    secondaryCta: {
      label: 'Read the flagship guide',
      href: '/banking/rates/best-digital-bank-philippines',
      description: 'See the full balance-based ranking behind the shortlist.',
    },
    relatedArticles: ['best-digital-bank-philippines', 'pdic-insurance-guide', 'how-time-deposits-t-bills-uitfs-work'],
  },
  {
    slug: 'best-digital-bank-100k-250k-500k',
    path: '/banking/compare/best-digital-bank-100k-250k-500k',
    title: 'Best digital bank for PHP 100K, PHP 250K, and PHP 500K balances',
    seoTitle: 'Best digital bank for PHP 100K, 250K, and 500K balances',
    description:
      'Match your balance to the digital bank that gives you the best after-tax result without guessing from a headline rate.',
    subtitle: 'A balance-first comparison that turns rate hunting into a simple decision.',
    category: 'banking',
    categoryLabel: 'Banking',
    section: 'compare',
    sectionPath: '/banking/compare',
    articleType: 'Comparison',
    eyebrow: 'Balance-based brief',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '9 min read',
    featured: false,
    keywords: ['best digital bank 100k 250k 500k', 'best digital bank philippines', 'digital bank comparison'],
    verificationNote: 'Balance scenarios use the same verified snapshot as the flagship rate guide.',
    disclosureNote:
      'The winner changes once you cross a rate cap, balance floor, or monthly activity requirement.',
    toc: [
      { label: 'The short answer' },
      { label: 'PHP 100K balance' },
      { label: 'PHP 250K balance' },
      { label: 'PHP 500K balance' },
      { label: 'Decision rule' },
    ],
    faqItems: [
      {
        question: 'Why do balance bands matter so much?',
        answer:
          'Because many digital banks cap their highest rate or add a lower fallback rate above a certain balance. The best headline rate is not always the best effective rate.',
      },
      {
        question: 'Is PDIC coverage enough for a large balance?',
        answer:
          'PDIC covers up to PHP 1,000,000 per bank per depositor, so a PHP 500,000 balance is inside the insured range. Higher balances should be split across banks.',
      },
    ],
    primaryCta: {
      label: 'Open the calculator',
      href: '/calculator',
      description: 'Run your own balance through Truva before you choose a bank.',
    },
    secondaryCta: {
      label: 'Read the flagship guide',
      href: '/banking/rates/best-digital-bank-philippines',
      description: 'See the full bank-by-bank math behind the balance comparison.',
    },
    relatedArticles: ['best-digital-bank-philippines', 'maya-savings-review', 'pdic-insurance-guide'],
  },
];

export const GUIDE_EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: 'final-withholding-tax-explained',
    path: '/guides/final-withholding-tax-explained',
    title: 'Final Withholding Tax explained: the 20% cut on savings interest in the Philippines',
    seoTitle: 'What is the 20% Final Withholding Tax in the Philippines?',
    description:
      'Learn how the 20% final withholding tax reduces bank interest, what products are taxed, and what the tax-exempt exceptions mean.',
    subtitle: 'A practical guide for Filipino savers who want the math behind the headline rate.',
    category: 'guides',
    categoryLabel: 'Guides',
    section: 'guides',
    sectionPath: '/guides',
    articleType: 'Explainer',
    eyebrow: 'Tax explainer',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '8 min read',
    featured: true,
    keywords: ['final withholding tax philippines', '20% fwt', 'after tax savings philippines'],
    verificationNote: 'Tax treatment is aligned to current Philippine savings rules.',
    disclosureNote:
      'Truva shows after-tax math first because the gross headline is not the amount you keep.',
    toc: [
      { label: 'What the 20% Final Withholding Tax is' },
      { label: 'Which products are taxed' },
      { label: 'After-tax examples' },
      { label: 'Which products are exempt' },
      { label: 'Frequently asked questions' },
    ],
    faqItems: [
      {
        question: 'What is the final withholding tax on savings interest?',
        answer:
          'For ordinary peso deposits and time deposits in the Philippines, the bank withholds 20% of the interest you earn before it reaches your account.',
      },
      {
        question: 'Are all interest-bearing products taxed the same way?',
        answer:
          'No. Standard bank deposits are taxed, but some government products and tax-exempt structures have different treatment. That is why after-tax comparison matters.',
      },
    ],
    primaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'See how the tax changes the real return across banks and products.',
    },
    secondaryCta: {
      label: 'Use the calculator',
      href: '/calculator',
      description: 'Convert the tax rule into a number for your own balance.',
    },
    relatedArticles: ['pdic-insurance-guide', 'how-time-deposits-t-bills-uitfs-work', 'best-digital-bank-philippines'],
  },
  {
    slug: 'pdic-insurance-guide',
    path: '/guides/pdic-insurance-guide',
    title: 'PDIC insurance explained: how your deposits are protected',
    seoTitle: 'PDIC insurance guide: coverage limit and how it works',
    description:
      'Understand the PHP 1,000,000 PDIC coverage limit, what it protects, and how to split deposits above the cap.',
    subtitle: 'A plain-English guide to deposit protection for Filipino savers.',
    category: 'guides',
    categoryLabel: 'Guides',
    section: 'guides',
    sectionPath: '/guides',
    articleType: 'Explainer',
    eyebrow: 'Safety guide',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '7 min read',
    featured: false,
    keywords: ['pdic insurance philippines', 'pdic coverage limit', 'bank deposit insurance'],
    verificationNote: 'Coverage rules reflect the current PDIC framework.',
    disclosureNote:
      'PDIC protects deposits, not investments. The distinction matters when you compare bank products.',
    toc: [
      { label: 'What PDIC covers' },
      { label: 'Coverage limit' },
      { label: 'What is not covered' },
      { label: 'How to split large balances' },
      { label: 'Frequently asked questions' },
    ],
    faqItems: [
      {
        question: 'How much does PDIC insure per bank?',
        answer:
          'PDIC insures deposits up to PHP 1,000,000 per bank per depositor, which is enough for most everyday savings balances but not unlimited.',
      },
      {
        question: 'Does PDIC cover UITFs?',
        answer:
          'No. UITFs are investment products, not deposits. They can still be useful, but they need to be compared separately from insured savings accounts.',
      },
    ],
    primaryCta: {
      label: 'Read the flagship rate guide',
      href: '/banking/rates/best-digital-bank-philippines',
      description: 'See which accounts are worth holding once you understand the coverage limit.',
    },
    secondaryCta: {
      label: 'Compare live banking rates',
      href: '/#deposit-rates',
      description: 'Cross-check the account returns before you move money.',
    },
    relatedArticles: ['final-withholding-tax-explained', 'how-time-deposits-t-bills-uitfs-work', 'best-digital-bank-100k-250k-500k'],
  },
  {
    slug: 'how-time-deposits-t-bills-uitfs-work',
    path: '/guides/how-time-deposits-t-bills-uitfs-work',
    title: 'How time deposits, T-Bills, and UITFs work in the Philippines',
    seoTitle: 'Time deposits vs T-Bills vs UITFs: which works best?',
    description:
      'Learn the tradeoffs between locked bank deposits, tax-exempt government securities, and pooled investment funds.',
    subtitle: 'A comparison of liquidity, tax treatment, and risk for savers deciding where to park cash.',
    category: 'guides',
    categoryLabel: 'Guides',
    section: 'guides',
    sectionPath: '/guides',
    articleType: 'Explainer',
    eyebrow: 'Mechanics guide',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '9 min read',
    featured: false,
    keywords: ['time deposits philippines', 't-bills philippines', 'uitf philippines'],
    verificationNote: 'Product mechanics are framed around the current PH market structure.',
    disclosureNote:
      'Different products solve different problems. Truva compares mechanics first so you do not mix savings and investing.',
    toc: [
      { label: 'When to use each product' },
      { label: 'Liquidity and lock-in' },
      { label: 'Tax treatment' },
      { label: 'Risk and insurance' },
      { label: 'Frequently asked questions' },
    ],
    faqItems: [
      {
        question: 'Which is safest: time deposit, T-Bill, or UITF?',
        answer:
          'Time deposits are deposits and are covered by PDIC up to the insurance limit. T-Bills are government securities, and UITFs are investment products with different risk profiles.',
      },
      {
        question: 'Which one is most liquid?',
        answer:
          'A regular time deposit is usually the least liquid because of lock-in terms. T-Bills depend on the market and term, while UITFs can move with fund rules and market prices.',
      },
    ],
    primaryCta: {
      label: 'Open the calculator',
      href: '/calculator',
      description: 'Compare the tradeoff between lock-in and return before you choose.',
    },
    secondaryCta: {
      label: 'Read the PDIC guide',
      href: '/guides/pdic-insurance-guide',
      description: 'Understand how deposit protection changes the choice.',
    },
    relatedArticles: ['final-withholding-tax-explained', 'pdic-insurance-guide', 'best-no-conditions-savings'],
  },
];

const CREDIT_CARD_EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: 'best-credit-cards-philippines',
    path: '/credit-cards#top-picks',
    title: 'Best credit cards Philippines 2026: cashback, rewards, and real peso math',
    seoTitle: 'Best credit cards Philippines 2026: rates and real peso math',
    description:
      'Compare the top Philippine credit cards by cashback rate, annual fee, and reward value. See which card fits your spending pattern.',
    subtitle:
      'A spending-pattern guide for Filipinos choosing between cashback, rewards points, and no-annual-fee cards.',
    category: 'credit-cards',
    categoryLabel: 'Credit Cards',
    section: 'rates',
    articleType: 'Rate Guide',
    eyebrow: 'Featured rate guide',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '9 min read',
    featured: true,
    keywords: ['best credit cards philippines', 'credit card comparison philippines', 'cashback credit card philippines'],
    verificationNote: 'Card terms and fee structures are aligned to the latest issuer disclosures.',
    disclosureNote:
      'Truva earns a referral fee if you apply through our links. This does not affect our editorial recommendations.',
    toc: [
      { label: 'The quick ranking' },
      { label: 'Cashback vs rewards points' },
      { label: 'Annual fee math' },
      { label: 'Who can get approved' },
      { label: 'Frequently asked questions' },
      { label: 'Verdict' },
    ],
    faqItems: [
      {
        question: 'Is the annual fee worth it?',
        answer:
          'It depends on your spending. If you spend ₱50k+ monthly on the card categories that earn cashback, the rewards usually cover the annual fee. Use the calculator to see your math.',
      },
      {
        question: 'What is the best card for everyday use?',
        answer:
          'For pure simplicity, no-annual-fee cards with flat rewards points win. For cashback maximization, you need to pick a card that aligns with your top spending categories.',
      },
    ],
    primaryCta: {
      label: 'Compare all credit cards',
      href: '/credit-cards',
      description: 'See the full product list and apply with confidence.',
    },
    secondaryCta: {
      label: 'Read card reviews',
      href: '/credit-cards/reviews',
      description: 'Dig deeper into individual card perks and conditions.',
    },
    relatedArticles: ['bpi-amore-cashback-review', 'unionbank-rewards-visa-review'],
  },
  {
    slug: 'bpi-amore-cashback-review',
    path: '/credit-cards/reviews/bpi-amore-cashback',
    title: 'BPI Amore Cashback Card Review (2026): Is 4% grocery cashback worth it?',
    seoTitle: 'BPI Amore Cashback Card Review 2026: cashback, fees, and who it fits',
    description:
      'A practical review of the BPI Amore Cashback Card covering its 4% grocery cashback, annual fee, and who should actually apply.',
    subtitle:
      'A spending-pattern review for Filipinos deciding whether a cashback card tied to Ayala Malls is worth the PHP 3,000 annual fee.',
    category: 'credit-cards',
    categoryLabel: 'Credit Cards',
    section: 'reviews',
    articleType: 'Review',
    eyebrow: 'Product review',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '6 min read',
    featured: false,
    keywords: ['bpi amore cashback review', 'bpi credit card philippines', 'bpi amore cashback card'],
    verificationNote: 'Card terms reviewed alongside current BPI product disclosures.',
    disclosureNote:
      'Truva earns a referral fee if you apply through our links. This does not affect our editorial recommendations.',
    toc: [
      { label: 'Key facts and rates' },
      { label: 'What we like' },
      { label: 'What to watch out for' },
      { label: 'Who can get this card' },
      { label: 'Verdict' },
    ],
    primaryCta: {
      label: 'Apply for the BPI Amore Cashback Card',
      href: '/credit-cards',
      description: 'Ready to apply? Start here.',
    },
    secondaryCta: {
      label: 'Compare all credit cards',
      href: '/credit-cards',
      description: 'See how this card stacks up against others.',
    },
    relatedArticles: ['best-credit-cards-philippines', 'unionbank-rewards-visa-review'],
  },
  {
    slug: 'unionbank-rewards-visa-review',
    path: '/credit-cards/reviews/unionbank-rewards-visa',
    title: 'UnionBank Rewards Visa Review (2026): Is no annual fee for life worth it?',
    seoTitle: 'UnionBank Rewards Visa Review 2026: NAFFL promo, rewards, and who it fits',
    description:
      'A practical review of the UnionBank Rewards Visa covering its no-annual-fee-for-life promo, 3X points on dining and shopping, and who should apply.',
    subtitle:
      'A spending-pattern review for Filipinos considering a no-annual-fee card with flexible rewards redemption.',
    category: 'credit-cards',
    categoryLabel: 'Credit Cards',
    section: 'reviews',
    articleType: 'Review',
    eyebrow: 'Product review',
    publishedAt: '2026-04-13',
    updatedAt: '2026-04-13',
    author: 'Beto',
    authorUrl: '/authors/beto',
    readingTime: '6 min read',
    featured: false,
    keywords: ['unionbank rewards visa review', 'unionbank credit card philippines', 'unionbank naffl'],
    verificationNote: 'Card terms reviewed alongside current UnionBank product disclosures.',
    disclosureNote:
      'Truva earns a referral fee if you apply through our links. This does not affect our editorial recommendations.',
    toc: [
      { label: 'Key facts and rates' },
      { label: 'NAFFL promo explained' },
      { label: 'What to watch out for' },
      { label: 'Who can get this card' },
      { label: 'Verdict' },
    ],
    primaryCta: {
      label: 'Apply for the UnionBank Rewards Visa',
      href: '/credit-cards',
      description: 'Ready to apply? Start here.',
    },
    secondaryCta: {
      label: 'Compare all credit cards',
      href: '/credit-cards',
      description: 'See how this card stacks up against others.',
    },
    relatedArticles: ['best-credit-cards-philippines', 'bpi-amore-cashback-review'],
  },
];

export function getBankingArticles(section?: EditorialArticle['section']) {
  const articles = section
    ? BANKING_EDITORIAL_ARTICLES.filter((article) => article.section === section)
    : BANKING_EDITORIAL_ARTICLES;

  return [...articles].sort(compareArticles);
}

export function getFeaturedBankingArticle() {
  const nonCompareArticles = getBankingArticles().filter((article) => article.section !== 'compare');
  return nonCompareArticles.find((article) => article.featured) ?? nonCompareArticles[0];
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

export function getGuideArticles() {
  return [...GUIDE_EDITORIAL_ARTICLES].sort(compareArticles);
}

export function getFeaturedGuideArticle() {
  return getGuideArticles().find((article) => article.featured) ?? getGuideArticles()[0];
}

export function getGuideArticle(slug: string) {
  return GUIDE_EDITORIAL_ARTICLES.find((article) => article.slug === slug);
}

export function getGuideArticlesBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => getGuideArticle(slug))
    .filter((article): article is EditorialArticle => Boolean(article))
    .sort(compareArticles);
}

export function getCreditCardArticles(section?: EditorialArticle['section']) {
  const articles = section
    ? CREDIT_CARD_EDITORIAL_ARTICLES.filter((a) => a.section === section)
    : CREDIT_CARD_EDITORIAL_ARTICLES;
  return [...articles].sort(compareArticles);
}

export function getFeaturedCreditCardArticle() {
  const nonCompareArticles = getCreditCardArticles().filter((a) => a.section !== 'compare');
  return nonCompareArticles.find((a) => a.featured) ?? nonCompareArticles[0];
}

export function getCreditCardArticle(slug: string) {
  return CREDIT_CARD_EDITORIAL_ARTICLES.find((a) => a.slug === slug);
}

export function getCreditCardArticlesBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => getCreditCardArticle(slug))
    .filter((article): article is EditorialArticle => Boolean(article))
    .sort(compareArticles);
}

export function getEditorialArticleBySlug(slug: string) {
  return getBankingArticle(slug) ?? getCreditCardArticle(slug) ?? getGuideArticle(slug);
}

export function getEditorialArticlesBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => getEditorialArticleBySlug(slug))
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
