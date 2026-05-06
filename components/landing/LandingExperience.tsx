'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  HandCoins,
  Link2,
  SearchCheck,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { SavingsRouterCard } from '@/components/landing/SavingsRouterCard';
import type { RateProduct } from '@/types';
import { formatRate } from '@/utils/yieldEngine';

export interface MmfLandingSummary {
  totalFunds: number;
  phpFunds: number;
  usdFunds: number;
  topNetYield: number | null;
  fastestRedemptionDays: number | null;
  latestDate: string | null;
  hasLiveData: boolean;
}

export interface CreditCardLandingSummary {
  totalCards: number;
  banks: number;
  noAnnualFeeCards: number;
  methodologyReadyCards: number;
  hasLiveData: boolean;
}

interface LandingExperienceProps {
  rates: RateProduct[];
  mmfSummary: MmfLandingSummary;
  creditCardSummary: CreditCardLandingSummary;
}

const fallbackProviderLogos = [
  { provider: 'Maya', logo: '/logos/maya-mark.jpg' },
  { provider: 'GoTyme Bank', logo: '/logos/gotyme-mark.png' },
  { provider: 'Tonik', logo: '/logos/tonik.svg' },
  { provider: 'CIMB', logo: '/logos/cimb-mark.png' },
  { provider: 'BPI', logo: '/logos/bpi-mark.png' },
  { provider: 'BDO', logo: '/logos/bdo-mark.jpg' },
  { provider: 'RCBC', logo: '/logos/rcbc-mark.png' },
  { provider: 'OwnBank', logo: '/logos/ownbank-mark.png' },
  { provider: 'UNO Digital Bank', logo: '/logos/uno-mark.jpg' },
  { provider: 'UnionDigital Bank', logo: '/logos/uniondigital-mark.jpg' },
];

const logoDisplayOverrides: Record<string, string> = {
  '/logos/maya.svg': '/logos/maya-mark.jpg',
  '/logos/gotyme.svg': '/logos/gotyme-mark.png',
  '/logos/cimb.svg': '/logos/cimb-mark.png',
  '/logos/bpi.svg': '/logos/bpi-mark.png',
  '/logos/bdo.svg': '/logos/bdo-mark.jpg',
  '/logos/ownbank.svg': '/logos/ownbank-mark.png',
  '/logos/uno.svg': '/logos/uno-mark.jpg',
  '/logos/uniondigital.svg': '/logos/uniondigital-mark.jpg',
  '/logos/netbank.svg': '/logos/netbank-mark.webp',
  '/logos/komo.svg': '/logos/komo-mark.jpg',
  '/logos/diskartech.svg': '/logos/diskartech-mark.png',
  '/logos/banko.svg': '/logos/banko-mark.png',
  '/logos/landbank.svg': '/logos/landbank-mark.jpg',
  '/logos/dbp.svg': '/logos/dbp-mark.png',
  '/logos/maribank.svg': '/logos/maribank-mark.png',
  '/logos/btr.svg': '/logos/btr-mark.jpg',
  '/logos/hdmf.svg': '/logos/hdmf-mark.jpg',
};

function uniqueProviderLogos(rates: RateProduct[]) {
  const seen = new Set<string>();
  const logos: Array<{ provider: string; logo: string }> = [];

  for (const rate of rates) {
    if (!rate.logo || seen.has(rate.provider)) continue;
    seen.add(rate.provider);
    logos.push({ provider: rate.provider, logo: logoDisplayOverrides[rate.logo] ?? rate.logo });
    if (logos.length >= 18) break;
  }

  return logos.length ? logos : fallbackProviderLogos;
}

function formatMmfYield(value: number | null) {
  if (value === null || value === undefined) return 'Live yields';
  return `${(value * 100).toFixed(2)}%`;
}

function getTopBankRate(rates: RateProduct[]) {
  const banks = rates.filter((r) => r.category === 'banks' && r.headlineRate > 0);
  if (!banks.length) return null;
  const top = banks.reduce((best, r) => (r.headlineRate > best.headlineRate ? r : best), banks[0]);
  return { provider: top.provider, rate: top.headlineRate, lockInDays: top.lockInDays };
}

export function LandingExperience({
  rates,
  mmfSummary,
  creditCardSummary,
}: LandingExperienceProps) {
  const providerLogos = useMemo(() => uniqueProviderLogos(rates), [rates]);
  const topBankRate = useMemo(() => getTopBankRate(rates), [rates]);

  return (
    <main className="w-full overflow-x-hidden bg-brand-surface text-brand-textPrimary transition-colors duration-300 dark:bg-slate-950 dark:text-gray-100">
      <HeroSection topBankRate={topBankRate} />
      <ProblemSolutionWho />
      <HubAndSpokeSection
        mmfSummary={mmfSummary}
        creditCardSummary={creditCardSummary}
        rates={rates}
      />
      <BrandMarqueeSection logos={providerLogos} />
      <WhyTruvaSection />
      <HowItWorksAndPromise />
      <NewsletterBlock />
    </main>
  );
}

// ─── HERO ─────────────────────────────────────────────────────
function HeroSection({
  topBankRate,
}: {
  topBankRate: ReturnType<typeof getTopBankRate>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <div className="max-w-2xl px-4 pb-10 pt-10 md:px-8 lg:py-16">
          <h1 className="text-[34px] font-black leading-[1.04] tracking-tight text-brand-textPrimary dark:text-white sm:text-5xl lg:text-[52px]">
            Stop guessing where<br className="hidden sm:inline" /> your money{' '}
            <span className="text-brand-primary">works hardest.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-[17px]">
            Truva shows every savings account, fund, credit card, loan, and insurance option side
            by side — with the fine print already found. Free for every Filipino.
          </p>

          <div className="mt-7 grid grid-cols-3 gap-4 sm:gap-7">
            <HeroStat value="200+" label="products compared" />
            <HeroStat value="25+" label="providers tracked" />
            <HeroStat value="500+" label="data points checked" />
          </div>

          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-textSecondary dark:text-gray-400">
            Where do you want to start?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/banking/rates#rate-desk"
              className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              Savings & deposits
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/banking/money-market-funds"
              className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-white px-5 py-3 text-sm font-bold text-brand-textPrimary transition-colors hover:border-brand-primary/30 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-100 dark:focus-visible:ring-offset-slate-950"
            >
              Money market funds
            </Link>
            <a
              href="#hub-credit-cards"
              className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-white px-5 py-3 text-sm font-bold text-brand-textPrimary transition-colors hover:border-brand-primary/30 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-100 dark:focus-visible:ring-offset-slate-950"
            >
              Credit cards
            </a>
          </div>
          <p className="mt-3 text-xs text-brand-textSecondary dark:text-gray-400">
            No login. No account. Just the numbers.
          </p>
        </div>

        <HeroHumanPanel topBankRate={topBankRate} />
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-black tabular-nums text-brand-textPrimary dark:text-white sm:text-[26px]">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-brand-textSecondary dark:text-gray-400 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function HeroHumanPanel({
  topBankRate,
}: {
  topBankRate: ReturnType<typeof getTopBankRate>;
}) {
  return (
    <div className="relative px-4 pb-8 pt-0 md:px-8 lg:self-stretch lg:p-0">
      {/* No card chrome — image blends directly into the section */}
      <div className="relative h-64 overflow-hidden rounded-2xl bg-[#EAF0FF] dark:bg-slate-900 sm:h-80 lg:h-full lg:min-h-[520px] lg:rounded-l-3xl lg:rounded-r-none">
        {/* Gradient: left edge fades into the white hero background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent dark:from-slate-950 lg:w-32"
        />
        {/* Gradient: bottom edge fades into the section border on mobile */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-white to-transparent dark:from-slate-950 lg:hidden"
        />
        <Image
          src="/images/homepage_hero.png"
          alt="Woman comparing options on her phone at a desk"
          fill
          priority
          sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 48vw, (min-width: 768px) 70vw, 100vw"
          className="object-cover object-[70%_center] sm:object-[66%_center] lg:object-[70%_center] xl:object-[64%_center]"
        />
        {topBankRate && (
          <div className="absolute bottom-5 left-8 z-20 max-w-[240px] rounded-xl border border-brand-primary/20 bg-white/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,82,255,0.18)] backdrop-blur-md dark:border-blue-400/30 dark:bg-slate-900/90">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-textSecondary dark:text-gray-400">
              Top rate right now
            </p>
            <p className="mt-0.5 text-3xl font-black tabular-nums leading-none text-positive">
              {formatRate(topBankRate.rate)}
            </p>
            <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-300">
              {topBankRate.provider} ·{' '}
              {topBankRate.lockInDays === 0 ? 'No lock-in' : `${topBankRate.lockInDays}-day lock`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROBLEM / SOLUTION / WHO ─────────────────────────────────
function ProblemSolutionWho() {
  const blocks = [
    {
      eyebrow: 'The problem',
      eyebrowColor: 'text-danger',
      title: 'Financial products all look the same from the outside.',
      desc: 'A savings account is a savings account — until you read the fine print. Most people never do. They pick whatever their friend recommends, or whatever app they already use.',
    },
    {
      eyebrow: 'What Truva does',
      eyebrowColor: 'text-brand-primary',
      title: 'Every option in one place. Plain words. No jargon.',
      desc: 'We show every product — savings, funds, credit cards, insurance, loans — with the real rates, fees, and conditions already surfaced. So you can choose fast and choose right.',
    },
    {
      eyebrow: "Who it's for",
      eyebrowColor: 'text-positive',
      title: 'Every Filipino with a question about their money.',
      desc: 'Whether you have ₱5,000 or ₱500,000 — Truva gives you the same clear answer your banker won’t.',
    },
  ];

  return (
    <section className="border-b border-brand-border bg-brand-surface px-4 py-12 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {blocks.map((b) => (
          <div
            key={b.eyebrow}
            className="rounded-2xl border border-brand-border bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <p className={`text-[11px] font-bold uppercase tracking-[0.08em] ${b.eyebrowColor}`}>
              {b.eyebrow}
            </p>
            <h3 className="mt-2 text-lg font-bold leading-tight text-brand-textPrimary dark:text-white">
              {b.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HUB & SPOKE ──────────────────────────────────────────────
function HubAndSpokeSection({
  mmfSummary,
  creditCardSummary,
  rates,
}: {
  mmfSummary: MmfLandingSummary;
  creditCardSummary: CreditCardLandingSummary;
  rates: RateProduct[];
}) {
  return (
    <section className="px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-primary">
            Choose your path
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
            What financial decision are you making today?
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <SavingsRouterCard rates={rates} />

          <FundsHubCard mmfSummary={mmfSummary} />

          <CreditCardsTeaserCard creditCardSummary={creditCardSummary} />
        </div>

        <ComingSoonStrip />
      </div>
    </section>
  );
}

function FundsHubCard({ mmfSummary }: { mmfSummary: MmfLandingSummary }) {
  const fundCount = mmfSummary.hasLiveData ? mmfSummary.totalFunds : null;
  const metric = formatMmfYield(mmfSummary.topNetYield);

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_24px_70px_-55px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="absolute inset-x-0 top-0 h-1 bg-defi" aria-hidden="true" />
      <Link
        href="/banking/money-market-funds"
        className="group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-defi/10 text-defi">
            <TrendingUp className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="rounded-full bg-positive/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-positive">
            Live
          </span>
        </div>

        <h3 className="mt-5 text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
          Money Market Funds
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
          UITFs · Mutual funds · PHP &amp; USD · No lock-in
        </p>

        <div className="mt-5 rounded-xl bg-defi/10 p-4">
          <p className="text-[32px] font-black leading-none tabular-nums text-defi">{metric}</p>
          <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-400">
            top net yield · {fundCount !== null ? `${fundCount} funds tracked` : 'PHP funds'}
          </p>
        </div>

        <span className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-defi pt-3 pb-3 text-sm font-bold text-white transition-opacity group-hover:opacity-90">
          Compare funds
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}

function CreditCardsTeaserCard({
  creditCardSummary,
}: {
  creditCardSummary: CreditCardLandingSummary;
}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const cardCount = creditCardSummary.hasLiveData && creditCardSummary.totalCards > 0
    ? `${creditCardSummary.totalCards}+`
    : '40+';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <article
      id="hub-credit-cards"
      className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_24px_70px_-55px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-white/[0.04]"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-warning" aria-hidden="true" />
      <div className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <CreditCard className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning">
            Coming soon
          </span>
        </div>

        <h3 className="mt-5 text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
          Credit Cards
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
          Rewards · Annual fees · Eligibility signals
        </p>

        <div className="mt-5 rounded-xl bg-warning/10 p-4">
          <p className="text-[32px] font-black leading-none tabular-nums text-warning">{cardCount}</p>
          <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-400">
            cards being tracked
          </p>
        </div>

        {submitted ? (
          <div className="mt-5 rounded-lg border border-positive/30 bg-positive/10 px-3 py-3 text-center">
            <p className="text-xs font-bold text-positive">
              ✓ You&apos;re on the list. We&apos;ll email you first.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2">
            <label htmlFor="cards-early-access-email" className="sr-only">
              Email for early access
            </label>
            <input
              id="cards-early-access-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-11 rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-textPrimary outline-none placeholder:text-gray-400 focus:border-brand-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-warning px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Get early access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-[11px] text-brand-textSecondary dark:text-gray-400">
              One email when it launches. No spam.
            </p>
          </form>
        )}
      </div>
    </article>
  );
}

function ComingSoonStrip() {
  const items = [
    {
      icon: ShieldHalf,
      title: 'Insurance',
      sub: 'Travel · Health · Auto · Life',
      badge: 'After Credit Cards',
    },
    {
      icon: HandCoins,
      title: 'Loans',
      sub: 'Personal · Home · Auto · Business',
      badge: 'Coming in 2026',
    },
  ];
  return (
    <div className="mt-4 grid gap-2.5 md:grid-cols-2">
      {items.map(({ icon: Icon, title, sub, badge }) => (
        <div
          key={title}
          className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-border bg-brand-surface px-5 py-4 dark:border-white/15 dark:bg-white/[0.03]"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-brand-textSecondary dark:text-gray-400" aria-hidden="true" />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm font-bold text-brand-textPrimary dark:text-white">
                {title}
              </span>
              <span className="text-xs text-brand-textSecondary dark:text-gray-400">{sub}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-warning/15 px-2.5 py-0.5 text-[10px] font-bold text-warning">
            {badge}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── BRAND MARQUEE ────────────────────────────────────────────
function BrandMarqueeSection({ logos }: { logos: Array<{ provider: string; logo: string }> }) {
  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <section className="overflow-hidden border-y border-brand-border bg-[#07111F] px-4 py-12 text-white dark:border-white/10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-200">Listed on Truva</p>
            <h2 className="mt-1 max-w-3xl text-2xl font-black leading-tight sm:text-3xl">
              Familiar names. Cleaner comparisons.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-blue-100/80">
            Banks, funds, and card issuers appear where Truva has useful product coverage.
          </p>
        </div>
      </div>

      <div className="mt-8 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="truva-logo-marquee flex w-max gap-3 motion-reduce:animate-none">
          {marqueeLogos.map((item, index) => (
            <div
              key={`${item.provider}-${index}`}
              className="flex h-16 min-w-40 items-center gap-3 rounded-lg bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            >
              <Image
                src={item.logo}
                alt={`${item.provider} logo`}
                width={32}
                height={32}
                loading="eager"
                className="h-8 w-8 object-contain"
              />
              <span className="max-w-28 truncate text-sm font-bold text-[#07111F]">
                {item.provider}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY TRUVA — SCENARIO STRIPS ─────────────────────────────
function WhyTruvaSection() {
  return (
    <section className="border-b border-brand-border bg-brand-surface px-4 py-14 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-primary">
            Why Truva
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
            Your money has a better option.
            <br />
            We&apos;ll show you exactly what it is.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
            Most Filipinos never find the right product — not because they don&apos;t want to, but
            because comparing takes too long. Truva does the comparing for you. Free. No account.
            Just the answers.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <ScenarioStrip
            accentColor="text-brand-primary"
            accentBg="bg-brand-primaryLight dark:bg-brand-primary/15"
            icon={TrendingUp}
            situationEyebrow="For your idle savings"
            situation="You have money in a bank account earning less than 1%. You want more — without locking it away or switching banks."
            result="Every high-yield savings account available right now — live rates, minimums, and lock-in requirements — ranked by rate."
            ctaText="Browse savings rates"
            ctaHref="/banking/rates#rate-desk"
          />
          <ScenarioStrip
            accentColor="text-defi"
            accentBg="bg-defi/10"
            icon={SearchCheck}
            situationEyebrow="For money you won't touch soon"
            situation="You have a lump sum sitting idle. You're not sure if a time deposit or a fund makes more sense."
            result="PHP and USD money market funds side by side — net yields, minimum investments, and how fast you can get your money back."
            ctaText="Compare funds"
            ctaHref="/banking/money-market-funds"
          />
          <ScenarioStrip
            accentColor="text-positive"
            accentBg="bg-positive/10"
            icon={Sparkles}
            situationEyebrow="When you don't know where to start"
            situation="You know your money isn't working hard enough. But every product sounds the same and you don't know what's right for you."
            result="Answer 3 questions about your goal, amount, and timeline. Truva ranks every product that fits — and shows the catch before you apply."
            ctaText="Try the quiz"
            ctaHref="/banking/rates#rate-desk"
          />
        </div>
      </div>
    </section>
  );
}

function ScenarioStrip({
  accentColor,
  accentBg,
  icon: Icon,
  situationEyebrow,
  situation,
  result,
  ctaText,
  ctaHref,
}: {
  accentColor: string;
  accentBg: string;
  icon: LucideIcon;
  situationEyebrow: string;
  situation: string;
  result: string;
  ctaText: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-brand-border bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] lg:flex-row lg:items-start lg:gap-0">
      {/* Left — situation */}
      <div className="flex flex-col gap-3 lg:w-5/12 lg:pr-6">
        <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${accentColor}`}>
          {situationEyebrow}
        </p>
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentBg} ${accentColor}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {situation}
          </p>
        </div>
      </div>

      {/* Divider — desktop only */}
      <div
        className="hidden border-r border-brand-border dark:border-white/10 lg:block"
        aria-hidden="true"
      />

      {/* Right — what Truva surfaces */}
      <div className="flex flex-col gap-3 lg:w-7/12 lg:pl-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-primary">
          What Truva surfaces
        </p>
        <p className="text-sm leading-relaxed text-brand-textPrimary dark:text-white">{result}</p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary transition-opacity hover:opacity-75"
        >
          {ctaText}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS + OUR PROMISE ───────────────────────────────
function HowItWorksAndPromise() {
  const steps = [
    {
      n: '1',
      title: 'Enter your amount',
      body: 'No login. No account. Type how much you want to save or invest.',
    },
    {
      n: '2',
      title: 'See ranked options',
      body: 'Every product ranked by real numbers — rates, fees, and conditions already found.',
    },
    {
      n: '3',
      title: 'Go with confidence',
      body: 'We show the catch before you apply. What it costs, who qualifies, what to watch out for.',
    },
  ];

  const promise: Array<{ icon: LucideIcon; title: string; body: string }> = [
    {
      icon: BarChart3,
      title: 'Rates as advertised',
      body: 'We show the exact rate the bank or fund publishes. No hidden adjustments.',
    },
    {
      icon: SearchCheck,
      title: 'Fine print, upfront',
      body: 'Minimums, lock-ins, promo conditions — visible before you tap Apply.',
    },
    {
      icon: ShieldCheck,
      title: 'PDIC status on every product',
      body: 'Clearly marked: government-insured, government-guaranteed, or not insured.',
    },
    {
      icon: Link2,
      title: 'Transparent about how we earn',
      body: 'We earn a referral fee when you apply through our links. This never changes the rates we show.',
    },
  ];

  return (
    <section className="border-b border-brand-border bg-white px-4 py-14 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-primary">
            How Truva works
          </p>
          <h2 className="mt-2 max-w-md text-2xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-[28px]">
            From idle money to right product — in minutes.
          </h2>
          <ol className="mt-6 flex flex-col gap-5">
            {steps.map((s) => (
              <li key={s.n} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primaryLight text-base font-black text-brand-primary dark:bg-brand-primary/20 dark:text-blue-300">
                  {s.n}
                </div>
                <div>
                  <p className="text-base font-bold text-brand-textPrimary dark:text-white">
                    {s.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-primary">
            Our promise
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-[28px]">
            Always on your side.
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {promise.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 dark:text-blue-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-textPrimary dark:text-white">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-[13px]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────
function NewsletterBlock() {
  return (
    <section className="bg-white px-4 py-14 dark:bg-slate-950 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-primary">
            Weekly signal after the decision
          </p>
          <h2 className="mt-2 max-w-md text-2xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-[28px]">
            Rates move. Start from the useful update.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            One short email when rates change. Be the first to know when a better option opens up.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-brand-surface dark:border-white/10 dark:bg-white/[0.04]">
          <NewsletterSignup />
        </div>
      </div>
    </section>
  );
}

