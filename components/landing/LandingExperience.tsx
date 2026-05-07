'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileSearch,
  HandCoins,
  SearchCheck,
  ShieldCheck,
  ShieldHalf,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
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

interface CategoryItem {
  id: string;
  title: string;
  summary: string;
  detail: string;
  href: string;
  cta: string;
  statusLabel: string;
  statusTone: 'live' | 'active' | 'soon';
  icon: LucideIcon;
  image?: string;
  imageAlt?: string;
  metric: string;
  metricLabel: string;
  priority: 'primary' | 'standard' | 'future';
}

const heroImage = {
  src: '/images/home/hero-comparison.png',
  alt: 'Filipino woman comparing financial products on a phone and laptop',
};

const fallbackProviderLogos = [
  { provider: 'Maya', logo: '/logos/maya-mark.jpg' },
  { provider: 'GoTyme Bank', logo: '/logos/gotyme-mark.png' },
  { provider: 'Tonik', logo: '/logos/tonik.svg' },
  { provider: 'CIMB', logo: '/logos/cimb-mark.png' },
  { provider: 'OwnBank', logo: '/logos/ownbank-mark.png' },
  { provider: 'UNO Digital Bank', logo: '/logos/uno-mark.jpg' },
  { provider: 'UnionDigital Bank', logo: '/logos/uniondigital-mark.jpg' },
  { provider: 'Landbank', logo: '/logos/landbank-mark.jpg' },
  { provider: 'Salmon', logo: '/logos/salmon.svg' },
  { provider: 'Netbank', logo: '/logos/netbank-mark.webp' },
];

const creditCardIssuers = [
  { provider: 'BPI', logo: '/logos/bpi-mark.png' },
  { provider: 'RCBC', logo: '/logos/rcbc-mark.png' },
  { provider: 'Metrobank', logo: '/logos/metrobank-mark.png' },
  { provider: 'Security Bank', logo: '/logos/securitybank-mark.png' },
  { provider: 'PNB', logo: '/logos/pnb-mark.png' },
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

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950';

const surfaceInteraction =
  'transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100';

function uniqueProviderLogos(rates: RateProduct[]) {
  const seen = new Set<string>();
  const logos: Array<{ provider: string; logo: string }> = [];

  for (const rate of rates) {
    if (!rate.logo || seen.has(rate.provider)) continue;
    seen.add(rate.provider);
    logos.push({ provider: rate.provider, logo: logoDisplayOverrides[rate.logo] ?? rate.logo });
    if (logos.length >= 10) break;
  }

  const base = logos.length ? logos : fallbackProviderLogos.slice();

  for (const issuer of creditCardIssuers) {
    if (!seen.has(issuer.provider)) {
      seen.add(issuer.provider);
      base.push(issuer);
    }
  }

  return base;
}

function getTopBankRate(rates: RateProduct[]) {
  const banks = rates.filter((rate) => rate.category === 'banks' && rate.headlineRate > 0);
  if (!banks.length) return null;
  const top = banks.reduce((best, rate) => (rate.headlineRate > best.headlineRate ? rate : best), banks[0]);
  return { provider: top.provider, rate: top.headlineRate, lockInDays: top.lockInDays };
}

function countBankProducts(rates: RateProduct[]) {
  return rates.filter((rate) => rate.category === 'banks').length;
}

function buildCategories({
  rates,
  mmfSummary,
  creditCardSummary,
}: LandingExperienceProps): CategoryItem[] {
  const topBankRate = getTopBankRate(rates);
  const bankCount = countBankProducts(rates);

  return [
    {
      id: 'savings',
      title: 'Savings & deposits',
      summary: 'Find bank accounts and time deposits that fit your amount and timeline.',
      detail: 'Compare advertised rates, lock-ins, minimums, and conditions before you choose.',
      href: '/banking/rates#rate-desk',
      cta: 'Compare savings',
      statusLabel: 'Live',
      statusTone: 'live',
      icon: Banknote,
      image: '/images/home/savings-category.png',
      imageAlt: 'Filipino professional comparing savings products on a laptop',
      metric: topBankRate ? formatRate(topBankRate.rate) : `${bankCount || 'Live'}`,
      metricLabel: topBankRate ? 'top listed rate' : 'bank products',
      priority: 'primary',
    },
    {
      id: 'funds',
      title: 'Money market funds',
      summary: 'Compare PHP and USD funds when your money can sit for longer.',
      detail: 'See fund coverage, redemption timing, minimums, and provider context in one place.',
      href: '/banking/money-market-funds',
      cta: 'Compare funds',
      statusLabel: 'Live',
      statusTone: 'live',
      icon: TrendingUp,
      image: '/images/home/funds-category-v2.png',
      imageAlt: 'Filipino professional reviewing fund options on a laptop',
      metric: mmfSummary.hasLiveData ? `${mmfSummary.totalFunds}` : 'PHP & USD',
      metricLabel: mmfSummary.hasLiveData ? 'funds tracked' : 'fund coverage',
      priority: 'standard',
    },
    {
      id: 'cards',
      title: 'Credit cards',
      summary: 'Match cards to your spending, annual fees, and approval requirements.',
      detail: 'Start with plain comparisons for rewards, fees, eligibility, and the catch.',
      href: '#truva-brief',
      cta: 'Get updates',
      statusLabel: 'Coming soon',
      statusTone: 'soon',
      icon: CreditCard,
      image: '/images/home/cards-category.png',
      imageAlt: 'Filipino woman comparing credit card options on a phone and laptop',
      metric: 'Next',
      metricLabel: 'after savings & funds',
      priority: 'standard',
    },
    {
      id: 'insurance',
      title: 'Insurance',
      summary: 'Travel comes first, then health, auto, and life coverage.',
      detail: 'Built for plain comparisons of coverage, exclusions, price, and claims friction.',
      href: '#truva-brief',
      cta: 'Get updates',
      statusLabel: 'Coming soon',
      statusTone: 'soon',
      icon: ShieldHalf,
      image: '/images/home/insurance-category.jpg',
      imageAlt: 'Filipino family — the reason to protect what matters',
      metric: 'Next',
      metricLabel: 'after cards',
      priority: 'future',
    },
    {
      id: 'loans',
      title: 'Loans',
      summary: 'Compare borrowing by total cost, fees, speed, and flexibility.',
      detail: 'The preview explains how Truva will compare borrowing without hiding the painful parts.',
      href: '#truva-brief',
      cta: 'Get updates',
      statusLabel: 'Coming soon',
      statusTone: 'soon',
      icon: HandCoins,
      image: '/images/home/loans-category.jpg',
      imageAlt: 'Filipino family in front of their new home',
      metric: 'Preview',
      metricLabel: 'methodology ready',
      priority: 'future',
    },
  ];
}

function getProductTotal(
  rates: RateProduct[],
  mmfSummary: MmfLandingSummary,
  creditCardSummary: CreditCardLandingSummary
) {
  return (
    rates.length +
    (mmfSummary.hasLiveData ? mmfSummary.totalFunds : 0) +
    (creditCardSummary.hasLiveData ? creditCardSummary.totalCards : 0)
  );
}

export function LandingExperience({
  rates,
  mmfSummary,
  creditCardSummary,
}: LandingExperienceProps) {
  const providerLogos = useMemo(() => uniqueProviderLogos(rates), [rates]);
  const categories = useMemo(
    () => buildCategories({ rates, mmfSummary, creditCardSummary }),
    [rates, mmfSummary, creditCardSummary]
  );
  const providerCount = useMemo(
    () => new Set(rates.map((rate) => rate.provider).filter(Boolean)).size,
    [rates]
  );
  const productTotal = getProductTotal(rates, mmfSummary, creditCardSummary);

  return (
    <main className="w-full overflow-x-hidden bg-white text-brand-textPrimary transition-colors duration-300 dark:bg-slate-950 dark:text-gray-100">
      <HeroSection categories={categories} productTotal={productTotal} providerCount={providerCount} />
      <BrandMarqueeSection logos={providerLogos} />
      <CategoryGatewaySection categories={categories} />
      <ClaritySection />
      <TrustPromiseSection />
      <NewsletterBlock />
    </main>
  );
}

function HeroSection({
  categories,
  productTotal,
  providerCount,
}: {
  categories: CategoryItem[];
  productTotal: number;
  providerCount: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 md:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-center lg:py-16">
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">
            Truva comparison hub
          </p>
          <h1 className="mt-3 max-w-3xl text-[38px] font-black leading-[1.02] tracking-tight text-brand-textPrimary dark:text-white sm:text-5xl lg:text-[58px]">
            Compare financial products in the Philippines.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-[17px]">
            Savings, funds, credit cards, insurance, and loans in one place, with rates, fees,
            requirements, and catches shown clearly.
          </p>

          <div className="mt-7 grid grid-cols-3 gap-3 sm:max-w-xl sm:gap-5">
            <HeroStat value={productTotal ? `${productTotal}+` : 'Live'} label="products compared" />
            <HeroStat value={providerCount ? `${providerCount}+` : 'Tracked'} label="providers tracked" />
            <HeroStat value="5" label="product paths" />
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-textSecondary dark:text-gray-400">
                What do you want to compare?
              </p>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {categories.map((category) => (
                <HeroCategoryTile key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        <HeroImagePanel />
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-brand-border pl-3 first:border-l-0 first:pl-0 dark:border-white/10">
      <p className="text-2xl font-black tabular-nums text-brand-textPrimary dark:text-white sm:text-[28px]">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-brand-textSecondary dark:text-gray-400 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function HeroCategoryTile({ category }: { category: CategoryItem }) {
  const Icon = category.icon;
  const isPrimary = category.priority === 'primary';

  return (
    <Link
      href={category.href}
      className={`${focusRing} ${surfaceInteraction} group relative flex min-h-[104px] items-start gap-3 rounded-xl border bg-white p-4 shadow-[0_18px_46px_-36px_rgba(15,23,42,0.42)] hover:border-brand-primary/30 hover:shadow-[0_20px_48px_-34px_rgba(0,82,255,0.42)] dark:bg-white/[0.04] ${
        isPrimary
          ? 'border-brand-primary/25 bg-brand-primaryLight/65 dark:bg-brand-primary/15'
          : 'border-brand-border dark:border-white/10'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isPrimary ? 'bg-brand-primary text-white' : 'bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-black leading-tight text-brand-textPrimary dark:text-white">
            {category.title}
          </span>
          <StatusBadge tone={category.statusTone}>{category.statusLabel}</StatusBadge>
        </span>
        <span className="mt-1 block text-[12px] leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {category.summary}
        </span>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-brand-primary">
          {category.cta}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  );
}

function HeroImagePanel() {
  return (
    <div className="relative lg:self-stretch">
      <div className="relative h-[320px] overflow-hidden rounded-2xl bg-brand-primaryLight shadow-[0_30px_80px_-52px_rgba(0,82,255,0.6)] sm:h-[440px] lg:h-full lg:min-h-[610px]">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="(min-width: 1280px) 44vw, (min-width: 1024px) 46vw, 100vw"
          className="object-cover object-[58%_8%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/60 to-transparent dark:from-slate-950 dark:via-slate-950/60 sm:w-36"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white/85 to-transparent dark:from-slate-950/75"
        />
        <div className="absolute bottom-5 left-5 max-w-[270px] rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_18px_44px_-28px_rgba(0,82,255,0.75)] backdrop-blur-sm dark:border-white/15 dark:bg-slate-950/90">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-textSecondary dark:text-gray-400">
            Start with the need
          </p>
          <p className="mt-1 text-sm font-black leading-tight text-brand-textPrimary dark:text-white">
            Then compare the product that fits it.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: CategoryItem['statusTone'];
}) {
  const toneClass =
    tone === 'live'
      ? 'bg-positive/12 text-positive'
      : tone === 'active'
        ? 'bg-brand-primary/10 text-brand-primary'
        : 'bg-warning/12 text-warning';

  return (
    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${toneClass}`}>
      {children}
    </span>
  );
}

function BrandMarqueeSection({ logos }: { logos: Array<{ provider: string; logo: string }> }) {
  const row1 = [...logos, ...logos, ...logos];
  const row2 = [...logos.slice().reverse(), ...logos.slice().reverse(), ...logos.slice().reverse()];

  const LogoChip = ({ item, index }: { item: { provider: string; logo: string }; index: number }) => (
    <div
      key={`${item.provider}-${index}`}
      className="flex h-[68px] min-w-[176px] items-center gap-3 rounded-xl border border-brand-border bg-white px-4 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/[0.05]"
    >
      <Image
        src={item.logo}
        alt={`${item.provider} logo`}
        width={40}
        height={40}
        loading="eager"
        className="h-10 w-10 rounded-lg object-contain"
      />
      <span className="max-w-28 truncate text-sm font-bold text-brand-textPrimary dark:text-white">
        {item.provider}
      </span>
    </div>
  );

  return (
    <section className="overflow-hidden border-b border-brand-border bg-brand-surface px-4 py-12 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
          Providers we track
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-brand-textPrimary dark:text-white sm:text-3xl">
          Banks, funds, and card issuers — in one place.
        </h2>
      </div>

      <div className="mt-8 space-y-3">
        <div className="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="truva-logo-marquee flex w-max gap-3 motion-reduce:animate-none">
            {row1.map((item, index) => (
              <LogoChip key={`r1-${item.provider}-${index}`} item={item} index={index} />
            ))}
          </div>
        </div>
        <div className="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="truva-logo-marquee-reverse flex w-max gap-3 motion-reduce:animate-none">
            {row2.map((item, index) => (
              <LogoChip key={`r2-${item.provider}-${index}`} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGatewaySection({ categories }: { categories: CategoryItem[] }) {
  const liveCategories = categories.filter((category) => category.priority !== 'future');
  const futureCategories = categories.filter((category) => category.priority === 'future');

  return (
    <section className="bg-white px-4 py-14 dark:bg-slate-950 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
            Choose your path
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
            Pick the product you need now.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
            Start with the decision in front of you. Truva keeps the comparison focused on what
            changes the choice: rates, fees, requirements, timing, and the catch.
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <FeaturedCategoryCard category={liveCategories[0]} />
          <div className="grid gap-4">
            {liveCategories.slice(1).map((category) => (
              <CategoryImageCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {futureCategories.map((category) => (
            <FutureCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCategoryCard({ category }: { category: CategoryItem }) {
  const Icon = category.icon;

  return (
    <Link
      href={category.href}
      className={`${focusRing} ${surfaceInteraction} group relative min-h-[520px] overflow-hidden rounded-2xl border border-brand-primary/20 bg-brand-primaryLight shadow-[0_26px_70px_-48px_rgba(0,82,255,0.65)] hover:border-brand-primary/35 hover:shadow-[0_30px_76px_-48px_rgba(0,82,255,0.75)] dark:bg-brand-primary/15`}
    >
      {category.image && (
        <Image
          src={category.image}
          alt={category.imageAlt ?? category.title}
          fill
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/0 dark:from-slate-950 dark:via-slate-950/65"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <div className="max-w-xl rounded-xl border border-white/80 bg-white/92 p-5 shadow-[0_18px_44px_-28px_rgba(0,82,255,0.7)] backdrop-blur-md dark:border-white/15 dark:bg-slate-950/90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <StatusBadge tone={category.statusTone}>{category.statusLabel}</StatusBadge>
                <h3 className="mt-2 text-2xl font-black leading-tight text-brand-textPrimary dark:text-white">
                  {category.title}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tabular-nums text-brand-primary">{category.metric}</p>
              <p className="text-[11px] text-brand-textSecondary dark:text-gray-400">
                {category.metricLabel}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {category.detail}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand-primary">
            {category.cta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CategoryImageCard({ category }: { category: CategoryItem }) {
  const Icon = category.icon;

  return (
    <Link
      href={category.href}
      className={`${focusRing} ${surfaceInteraction} group grid min-h-[252px] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_22px_58px_-44px_rgba(15,23,42,0.45)] hover:border-brand-primary/30 hover:shadow-[0_26px_62px_-44px_rgba(0,82,255,0.48)] dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[0.95fr_1.05fr]`}
    >
      <div className="relative min-h-[220px] sm:min-h-full">
        {category.image && (
          <Image
            src={category.image}
            alt={category.imageAlt ?? category.title}
            fill
            sizes="(min-width: 1024px) 38vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <StatusBadge tone={category.statusTone}>{category.statusLabel}</StatusBadge>
        </div>
        <h3 className="mt-5 text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
          {category.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {category.detail}
        </p>
        <div className="mt-auto pt-5">
          <p className="text-2xl font-black tabular-nums text-brand-primary">{category.metric}</p>
          <p className="text-[11px] text-brand-textSecondary dark:text-gray-400">
            {category.metricLabel}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-primary">
            {category.cta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FutureCategoryCard({ category }: { category: CategoryItem }) {
  const Icon = category.icon;

  if (category.image) {
    return (
      <Link
        href={category.href}
        className={`${focusRing} ${surfaceInteraction} group grid min-h-[252px] overflow-hidden rounded-2xl border border-dashed border-brand-border bg-white shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)] hover:border-warning/40 hover:shadow-[0_22px_52px_-38px_rgba(247,144,9,0.28)] dark:border-white/15 dark:bg-white/[0.04] sm:grid-cols-[0.95fr_1.05fr]`}
      >
        <div className="relative min-h-[200px] sm:min-h-full">
          <Image
            src={category.image}
            alt={category.imageAlt ?? category.title}
            fill
            sizes="(min-width: 1024px) 38vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/12 text-warning">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <StatusBadge tone={category.statusTone}>{category.statusLabel}</StatusBadge>
          </div>
          <h3 className="mt-5 text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
            {category.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {category.summary}
          </p>
          <div className="mt-auto pt-5">
            <span className="inline-flex items-center gap-2 text-sm font-black text-brand-primary">
              {category.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={category.href}
      className={`${focusRing} ${surfaceInteraction} group flex items-start justify-between gap-4 rounded-2xl border border-dashed border-brand-border bg-brand-surface p-5 hover:border-brand-primary/30 hover:bg-white hover:shadow-[0_18px_48px_-38px_rgba(15,23,42,0.42)] dark:border-white/15 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]`}
    >
      <span className="flex min-w-0 items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/12 text-warning">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <StatusBadge tone={category.statusTone}>{category.statusLabel}</StatusBadge>
          <span className="mt-2 block text-lg font-black leading-tight text-brand-textPrimary dark:text-white">
            {category.title}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {category.summary}
          </span>
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-sm font-black text-brand-primary sm:inline-flex">
        {category.cta}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function ClaritySection() {
  const steps: Array<{
    title: string;
    body: string;
    icon: LucideIcon;
  }> = [
    {
      title: 'Pick a product',
      body: 'Start with the decision you need to make today.',
      icon: SearchCheck,
    },
    {
      title: 'See the catch',
      body: 'Compare rates, fees, requirements, lock-ins, and limits upfront.',
      icon: FileSearch,
    },
    {
      title: 'Choose with confidence',
      body: 'Move forward knowing what fits your situation and what to watch for.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="border-y border-brand-border bg-brand-surface px-4 py-14 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-52px_rgba(15,23,42,0.5)] dark:bg-white/[0.04] sm:min-h-[420px]">
          <Image
            src="/images/home/trust-clarity.png"
            alt="Financial fine print becoming simple comparison cards"
            fill
            loading="eager"
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="object-cover object-[76%_center] md:object-[58%_center]"
          />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
            Less reading, clearer choices
          </p>
          <h2 className="mt-2 max-w-xl text-3xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
            Truva turns the fine print into the parts that matter.
          </h2>
          <div className="mt-7 grid gap-3">
            {steps.map(({ title, body, icon: Icon }, index) => (
              <div
                key={title}
                className="grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-brand-border bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-textSecondary dark:text-gray-400">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-brand-textPrimary dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
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

function TrustPromiseSection() {
  const promises: Array<{ icon: LucideIcon; title: string; body: string }> = [
    {
      icon: BarChart3,
      title: 'Rates as advertised',
      body: 'We show the rate the bank, fund, or company publishes, with the conditions beside it.',
    },
    {
      icon: Clock3,
      title: 'Updated regularly',
      body: 'Rates and terms can change. Check with the provider before applying.',
    },
    {
      icon: ShieldCheck,
      title: 'Clear disclosures',
      body: 'This is not financial advice. We may earn a fee if you apply through a link, and that does not change what you are offered.',
    },
  ];

  return (
    <section className="bg-white px-4 py-14 dark:bg-slate-950 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
              Why people can trust it
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
              Plain words. Visible tradeoffs. No hidden agenda.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
            Truva is built for people who do not want to open ten tabs or decode product terms. The
            page should show what the product is, who it is for, and what the catch is before any
            application link.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {promises.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-brand-border bg-brand-surface p-5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-black leading-tight text-brand-textPrimary dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterBlock() {
  return (
    <section
      id="truva-brief"
      className="border-t border-brand-border bg-brand-surface px-4 py-16 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-primary">
          The Truva Brief
        </p>
        <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
          Stay in the loop on all things Truva.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
          New products, new providers, coverage updates — one short email when something
          on Truva is worth your attention.
        </p>
        <div className="mt-8">
          <NewsletterSignup />
        </div>
      </div>
    </section>
  );
}
