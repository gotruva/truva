import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getCreditCards, getCreditCardBySlug } from '@/lib/credit-cards';
import type { CreditCard } from '@/types';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const cards = await getCreditCards();
  const paths: { slug: string }[] = [];

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      paths.push({ slug: `${cards[i].normalized_card_key}-vs-${cards[j].normalized_card_key}` });
    }
  }

  return paths;
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> | { slug: string } }
): Promise<Metadata> {
  const params = await props.params;
  const slug = params?.slug ?? '';

  if (!slug.includes('-vs-')) return {};
  const mid = slug.indexOf('-vs-');
  const key1 = slug.slice(0, mid);
  const key2 = slug.slice(mid + 4);

  const [card1, card2] = await Promise.all([getCreditCardBySlug(key1), getCreditCardBySlug(key2)]);
  if (!card1 || !card2) return {};

  return {
    title: `${card1.card_name} vs ${card2.card_name} | Truva`,
    description: `Side-by-side comparison of the ${card1.card_name} and ${card2.card_name} — annual fees, interest rates, rewards, and income requirements.`,
    alternates: { canonical: `/credit-cards/compare/${slug}` },
  };
}

export default async function CreditCardComparePage(
  props: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const params = await props.params;
  const slug = params?.slug ?? '';

  if (!slug.includes('-vs-')) notFound();

  const mid = slug.indexOf('-vs-');
  const key1 = slug.slice(0, mid);
  const key2 = slug.slice(mid + 4);

  const [card1, card2] = await Promise.all([getCreditCardBySlug(key1), getCreditCardBySlug(key2)]);
  if (!card1 || !card2) notFound();

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${card1.card_name} vs ${card2.card_name} Comparison`,
    description: `Compare the ${card1.card_name} vs the ${card2.card_name} side-by-side.`,
    author: { '@type': 'Person', name: 'Beto' },
    publisher: { '@type': 'Organization', name: 'Truva', url: 'https://www.gotruva.com' },
  };

  const isEitherPartner =
    card1.badge_inputs?.partner_card === true || card2.badge_inputs?.partner_card === true;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <div className="bg-brand-surface dark:bg-slate-950 min-h-screen pb-24">
        <div className="bg-brand-primary text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <Link
              href="/credit-cards"
              className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6 transition-colors mx-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cards
            </Link>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-4 flex-wrap">
              <span>{card1.card_name}</span>
              <span className="text-xl md:text-2xl text-white/60 font-light px-2">vs</span>
              <span>{card2.card_name}</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Side-by-side comparison to help you choose the right fit.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl shadow-black/5 border border-brand-border dark:border-white/10 overflow-hidden mb-8">

            {/* Header row */}
            <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 border-b border-brand-border dark:border-white/10">
              {[card1, card2].map((card, idx) => (
                <div
                  key={card.id}
                  className={`p-4 md:p-8 flex flex-col items-center text-center ${idx === 0 ? 'border-r border-brand-border dark:border-white/10' : ''}`}
                >
                  <h2 className="text-xl md:text-2xl font-bold mb-1 leading-tight">
                    {card.card_name}
                  </h2>
                  <span className="text-brand-textSecondary text-xs md:text-sm mb-6">
                    {card.bank}
                  </span>
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex w-full sm:w-auto justify-center items-center py-2 md:py-3 px-4 md:px-6 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-bold text-sm md:text-base shadow-md shadow-brand-primary/20 mt-auto"
                  >
                    Apply now
                  </a>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <CompareRow label="Annual Fee">
              <CompareCell>{formatAnnualFee(card1)}</CompareCell>
              <CompareCell>{formatAnnualFee(card2)}</CompareCell>
            </CompareRow>

            <CompareRow label="Waiver condition">
              <CompareCell muted>{card1.annual_fee_waiver_condition ?? '—'}</CompareCell>
              <CompareCell muted>{card2.annual_fee_waiver_condition ?? '—'}</CompareCell>
            </CompareRow>

            <CompareRow label="Interest Rate">
              <CompareCell>
                {card1.interest_rate_pct !== null
                  ? `${card1.interest_rate_pct.toFixed(2)}% / mo`
                  : 'Not disclosed'}
              </CompareCell>
              <CompareCell>
                {card2.interest_rate_pct !== null
                  ? `${card2.interest_rate_pct.toFixed(2)}% / mo`
                  : 'Not disclosed'}
              </CompareCell>
            </CompareRow>

            <CompareRow label="Reward Type">
              <CompareCell className="capitalize">{card1.rewards_type ?? 'None'}</CompareCell>
              <CompareCell className="capitalize">{card2.rewards_type ?? 'None'}</CompareCell>
            </CompareRow>

            <CompareRow label="Min. Income">
              <CompareCell>
                {card1.min_income_monthly !== null
                  ? `₱${card1.min_income_monthly.toLocaleString()} / mo`
                  : 'No public data'}
              </CompareCell>
              <CompareCell>
                {card2.min_income_monthly !== null
                  ? `₱${card2.min_income_monthly.toLocaleString()} / mo`
                  : 'No public data'}
              </CompareCell>
            </CompareRow>

            <CompareRow label="FX Fee">
              <CompareCell>
                {card1.foreign_transaction_fee_pct !== null
                  ? `${card1.foreign_transaction_fee_pct}%`
                  : 'Not disclosed'}
              </CompareCell>
              <CompareCell>
                {card2.foreign_transaction_fee_pct !== null
                  ? `${card2.foreign_transaction_fee_pct}%`
                  : 'Not disclosed'}
              </CompareCell>
            </CompareRow>

            <CompareRow label="Active Promos">
              <CompareCell>{card1.active_promo_count > 0 ? `${card1.active_promo_count} active` : 'None'}</CompareCell>
              <CompareCell>{card2.active_promo_count > 0 ? `${card2.active_promo_count} active` : 'None'}</CompareCell>
            </CompareRow>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 md:p-8 border-t border-brand-border dark:border-white/10 text-center">
              <p className="text-[10px] md:text-xs text-brand-textSecondary">
                Truva is an independent comparison platform.
                {isEitherPartner
                  ? ' One or more products above may be partner placements — see individual card pages for disclosure details.'
                  : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CompareRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
      <div className="md:col-span-3 p-3 md:p-6 flex items-center border-b md:border-b-0 md:border-r border-brand-border dark:border-white/10 bg-slate-50/30 dark:bg-slate-900/30">
        <h3 className="font-bold text-brand-textSecondary group-hover:text-brand-primary transition-colors text-xs md:text-sm uppercase tracking-wider">
          {label}
        </h3>
      </div>
      <div className="md:col-span-9 grid grid-cols-2">{children}</div>
    </div>
  );
}

function CompareCell({
  children,
  muted,
  className,
}: {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-3 md:p-6 border-r border-brand-border dark:border-white/10 last:border-r-0 ${
        muted ? 'text-brand-textSecondary text-xs md:text-sm' : 'font-semibold text-sm md:text-base text-brand-textPrimary dark:text-gray-100'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

function formatAnnualFee(card: CreditCard): string {
  if (card.naffl) return '₱0 (NAFFL)';
  if (card.annual_fee_recurring === 0) return '₱0';
  if (card.annual_fee_recurring !== null) return `₱${card.annual_fee_recurring.toLocaleString()}`;
  if (card.annual_fee_first_year !== null) return `₱${card.annual_fee_first_year.toLocaleString()}`;
  return 'Not disclosed';
}
