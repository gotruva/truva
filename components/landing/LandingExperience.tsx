import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  CreditCard,
  HandCoins,
  LineChart,
  SearchCheck,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { SavingsRouterCard } from '@/components/landing/SavingsRouterCard';
import type { RateProduct } from '@/types';

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
  verifiedDate: string;
  mmfSummary: MmfLandingSummary;
  creditCardSummary: CreditCardLandingSummary;
}

const authorityPoints = [
  {
    icon: Calculator,
    title: 'Net return',
    description: 'Savings previews show what lands after withholding tax.',
  },
  {
    icon: SearchCheck,
    title: 'Fine print',
    description: 'Lock-ins, promo rules, fees, and minimums stay close to the CTA.',
  },
  {
    icon: WalletCards,
    title: 'Right vertical',
    description: 'A visitor can jump to deposits, MMFs, cards, or loan guidance fast.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear disclosure',
    description: 'Partner relationships are visible without pretending every score is live.',
  },
];

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
  {
    provider: 'UnionDigital Bank',
    logo: '/logos/uniondigital-mark.jpg',
  },
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

function formatMmfRate(value: number | null) {
  if (value === null || value === undefined) return 'Live table';
  return `${(value * 100).toFixed(2)}% net`;
}

function formatRedemption(days: number | null) {
  if (days === null || days === undefined) return '1-5 days';
  if (days === 0) return 'same day';
  if (days === 1) return 'next day';
  return `T+${days}`;
}

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

export function LandingExperience({
  rates,
  verifiedDate,
  mmfSummary,
  creditCardSummary,
}: LandingExperienceProps) {
  const providerLogos = uniqueProviderLogos(rates);
  const providerCount = new Set(rates.map((rate) => rate.provider)).size;

  return (
    <main className="w-full overflow-x-hidden bg-[#F6F8FC] text-brand-textPrimary transition-colors duration-300 dark:bg-slate-950 dark:text-gray-100">
      <section className="relative overflow-hidden px-4 pb-12 pt-8 md:px-8 md:pb-20 lg:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,82,255,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(0,82,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] dark:opacity-20" />

        <div className="relative mx-auto grid max-w-7xl gap-9 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.9fr)] xl:items-center">
          <div className="max-w-3xl pt-2 lg:pt-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-brand-primary/15 bg-white/90 px-3 py-2 text-sm font-semibold text-brand-primary shadow-[0_14px_42px_-32px_rgba(0,82,255,0.45)] dark:border-white/10 dark:bg-white/[0.06] dark:text-blue-300">
                <LineChart className="h-4 w-4" aria-hidden="true" />
                Philippine comparison desk
              </div>
              <h1 className="max-w-5xl text-4xl font-black leading-[1.02] text-[#07111f] text-balance dark:text-white sm:text-5xl lg:text-6xl">
                Compare Philippine money products in minutes.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-textSecondary dark:text-gray-300">
                See net returns, fees, and conditions before you choose a path.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/banking/rates#rate-desk"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-primary px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                Compare savings
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/credit-cards"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-brand-border bg-white px-5 text-sm font-semibold text-brand-textPrimary transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-100 dark:focus-visible:ring-offset-slate-950"
              >
                Find a card
              </Link>
            </div>
          </div>

          <HeroHumanPanel />
        </div>

        <div
          className="relative mx-auto mt-8 grid max-w-7xl gap-3 sm:grid-cols-3"
          aria-label="Live Truva coverage"
        >
          <MetricBlock value={rates.length || 57} label="rate products" />
          <MetricBlock value={providerCount || 19} label="providers checked" />
          <MetricBlock value={verifiedDate} label="latest review" />
        </div>

        <div className="relative mx-auto mt-10 max-w-7xl">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-primary">Choose a path</p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                Start where your decision starts.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
              Live tools for savings, funds, and cards. Loans stay marked as preview.
            </p>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-4">
            <SavingsRouterCard rates={rates} />

            <RouteCard
              href="/banking/money-market-funds"
              icon={TrendingUp}
              title="Money market funds"
              status="Live"
              metric={formatMmfRate(mmfSummary.topNetYield)}
              metricLabel={mmfSummary.hasLiveData ? `${mmfSummary.totalFunds} funds listed` : 'Net-yield table'}
              description={`Net yield, minimums, and access speed. Fastest tracked access: ${formatRedemption(mmfSummary.fastestRedemptionDays)}.`}
              cta="Compare MMFs"
            />

            <RouteCard
              href="/credit-cards"
              icon={CreditCard}
              title="Credit cards"
              status="Live"
              metric={creditCardSummary.hasLiveData ? `${creditCardSummary.totalCards} cards` : 'Card finder'}
              metricLabel={creditCardSummary.hasLiveData ? `${creditCardSummary.banks} banks listed` : 'Fees and fit'}
              description="Rewards, fees, promos, and eligibility signals in one place."
              cta="Find card fit"
            />

            <RouteCard
              href="/loans"
              icon={HandCoins}
              title="Loans"
              status="Preview"
              metric="Framework"
              metricLabel="Cost, speed, and borrower friction"
              description="A borrowing checklist while the live lender catalog is being built."
              cta="Open loans"
            />
          </div>
        </div>
      </section>

      <BrandMarqueeSection logos={providerLogos} />

      <section className="border-y border-brand-border bg-white px-4 py-14 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-brand-primary">What makes it useful</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                The details that change the choice stay visible.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                Truva keeps net returns, conditions, and disclosure close to the action.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {authorityPoints.map((point) => (
                <AuthorityCard key={point.title} {...point} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-border bg-white px-4 py-14 dark:border-white/10 dark:bg-slate-950 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-primary">Weekly signal after the decision</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-brand-textPrimary dark:text-white sm:text-4xl">
              Rates move. Start from the useful update.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
              A short note when rates, funds, or card coverage changes.
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-[#F6F8FC] dark:border-white/10 dark:bg-white/[0.04]">
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroHumanPanel() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] xl:max-w-[680px]">
      <div className="overflow-hidden rounded-[2rem] bg-white p-2 shadow-[0_34px_90px_-58px_rgba(0,82,255,0.65)] ring-1 ring-brand-primary/10 dark:bg-white/[0.06] dark:ring-white/10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.55rem] bg-[#EAF0FF] dark:bg-slate-900 sm:aspect-[16/10] lg:aspect-[5/4] xl:aspect-[16/10]">
          <Image
            src="/images/homepage_hero.png"
            alt="Woman comparing options on her phone at a desk"
            fill
            priority
            sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 48vw, (min-width: 768px) 70vw, 100vw"
            className="object-cover object-[70%_center] sm:object-[66%_center] lg:object-[70%_center] xl:object-[64%_center]"
          />
        </div>
      </div>
    </div>
  );
}

function BrandMarqueeSection({ logos }: { logos: Array<{ provider: string; logo: string }> }) {
  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <section className="overflow-hidden border-y border-brand-border bg-[#07111F] px-4 py-12 text-white dark:border-white/10 md:px-8 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-200">Listed on Truva</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              Familiar names. Cleaner comparisons.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-blue-100/80">
            Banks, funds, and card issuers appear where Truva has useful product coverage.
          </p>
        </div>
      </div>

      <div className="mt-10 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="truva-logo-marquee flex w-max gap-3 motion-reduce:animate-none">
          {marqueeLogos.map((item, index) => (
            <div
              key={`${item.provider}-${index}`}
              className="flex h-20 min-w-44 items-center gap-3 rounded-lg bg-white px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            >
              <Image
                src={item.logo}
                alt={`${item.provider} logo`}
                width={36}
                height={36}
                loading="eager"
                className="h-9 w-9 object-contain"
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

function MetricBlock({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-brand-border bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-2xl font-black tabular-nums text-brand-textPrimary dark:text-white">{value}</p>
      <p className="mt-1 text-sm leading-snug text-brand-textSecondary dark:text-gray-400">{label}</p>
    </div>
  );
}

function RouteCard({
  href,
  icon: Icon,
  title,
  status,
  metric,
  metricLabel,
  description,
  cta,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  status: string;
  metric: string;
  metricLabel: string;
  description: string;
  cta: string;
}) {
  return (
    <article className="rounded-lg border border-brand-border bg-white shadow-[0_24px_70px_-55px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-white/[0.04]">
      <Link
        href={href}
        className="group flex h-full flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 dark:text-blue-300">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-primary">{status}</p>
              <h2 className="text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
                {title}
              </h2>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>

        <div className="mt-6">
          <p className="text-3xl font-black tabular-nums text-brand-textPrimary dark:text-white">{metric}</p>
          <p className="mt-1 text-sm font-semibold text-brand-primary">{metricLabel}</p>
          <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">{description}</p>
        </div>

        <span className="mt-6 inline-flex h-11 items-center justify-center rounded-md border border-brand-border bg-brand-surface px-4 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/30 hover:text-brand-primary dark:border-white/10 dark:bg-slate-950 dark:text-gray-100">
          {cta}
        </span>
      </Link>
    </article>
  );
}

function AuthorityCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-brand-border bg-[#F6F8FC] p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15 dark:text-blue-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold leading-tight text-brand-textPrimary dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">{description}</p>
    </article>
  );
}
