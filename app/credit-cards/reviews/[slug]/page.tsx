import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, ChevronLeft, Info, Sparkles } from 'lucide-react';
import { getCreditCardBySlug } from '@/lib/credit-cards';
import type { BadgeInputs, CreditCard } from '@/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> | { slug: string } }
): Promise<Metadata> {
  const params = await props.params;
  const card = await getCreditCardBySlug(params?.slug ?? '');
  if (!card) return {};

  return {
    title: `${card.card_name} Review | Truva`,
    description: `Full breakdown of the ${card.card_name} by ${card.bank} — annual fee, interest rate, rewards, income requirements, and fine-print flags.`,
    alternates: { canonical: `/credit-cards/reviews/${card.normalized_card_key}` },
  };
}

export default async function CreditCardReviewPage(
  props: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const params = await props.params;
  const card = await getCreditCardBySlug(params?.slug ?? '');

  if (!card) notFound();

  const reviewJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${card.card_name} Review`,
    description: `Annual fee, rewards, and income requirements for the ${card.card_name}.`,
    author: { '@type': 'Person', name: 'Beto' },
    publisher: { '@type': 'Organization', name: 'Truva', url: 'https://www.gotruva.com' },
  };

  const isPartnerCard = card.badge_inputs?.partner_card === true;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />

      <div className="bg-brand-surface dark:bg-slate-950 min-h-screen pb-24">
        <div className="bg-brand-primary text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          <div className="max-w-4xl mx-auto relative z-10">
            <Link
              href="/credit-cards"
              className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cards
            </Link>

            {isPartnerCard ? (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-bold text-white mb-4 border border-amber-400">
                <Sparkles className="w-3 h-3 mr-2" /> Partner Placement
              </div>
            ) : null}

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              {card.card_name}
            </h1>
            <p className="text-xl text-white/80">{card.bank}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl shadow-black/5 border border-brand-border dark:border-white/10 p-6 md:p-10 mb-8">

            {card.badge_inputs ? (
              <section className="mb-10">
                <h2 className="text-lg font-bold mb-4 text-brand-textPrimary dark:text-white">
                  Fine-print surface
                </h2>
                <BadgeGrid badges={card.badge_inputs} />
              </section>
            ) : null}

            <h2 className="text-2xl font-bold mb-6 text-brand-textPrimary dark:text-white">
              Rates &amp; Fees
            </h2>
            <div className="border border-brand-border dark:border-white/10 rounded-xl overflow-hidden mb-10">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-brand-border dark:divide-white/10">
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary w-2/5">
                      Annual Fee
                    </th>
                    <td className="py-4 px-6 font-medium text-brand-textPrimary dark:text-gray-100">
                      {formatAnnualFee(card)}
                      {card.annual_fee_waiver_condition ? (
                        <span className="block text-xs font-normal text-brand-textSecondary mt-1">
                          {card.annual_fee_waiver_condition}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                      Interest Rate
                    </th>
                    <td className="py-4 px-6 font-medium text-brand-success">
                      {card.interest_rate_pct !== null
                        ? `${card.interest_rate_pct.toFixed(2)}% / month`
                        : 'Not disclosed'}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                      Reward Type
                    </th>
                    <td className="py-4 px-6 font-medium capitalize">
                      {card.rewards_type ?? 'None'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                      Minimum Income
                    </th>
                    <td className="py-4 px-6 font-medium">
                      {card.min_income_monthly !== null
                        ? `₱${card.min_income_monthly.toLocaleString()} / month`
                        : 'No public data'}
                    </td>
                  </tr>
                  {card.foreign_transaction_fee_pct !== null ? (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                      <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                        FX Fee
                      </th>
                      <td className="py-4 px-6 font-medium">
                        {card.foreign_transaction_fee_pct}%
                      </td>
                    </tr>
                  ) : null}
                  {card.cash_advance_fee_pct !== null ? (
                    <tr>
                      <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                        Cash Advance Fee
                      </th>
                      <td className="py-4 px-6 font-medium">
                        {card.cash_advance_fee_pct}%
                        {card.cash_advance_fee_amount !== null
                          ? ` or ₱${card.cash_advance_fee_amount.toLocaleString()} (whichever is higher)`
                          : ''}
                      </td>
                    </tr>
                  ) : null}
                  {card.late_payment_fee_amount !== null ? (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                      <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                        Late Payment Fee
                      </th>
                      <td className="py-4 px-6 font-medium">
                        ₱{card.late_payment_fee_amount.toLocaleString()}
                      </td>
                    </tr>
                  ) : null}
                  {card.overlimit_fee_amount !== null ? (
                    <tr>
                      <th className="py-4 px-6 font-semibold text-brand-textSecondary">
                        Overlimit Fee
                      </th>
                      <td className="py-4 px-6 font-medium">
                        ₱{card.overlimit_fee_amount.toLocaleString()}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-10 pt-8 border-t border-brand-border dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <span className="text-xs text-brand-textSecondary max-w-xs text-center">
                {isPartnerCard
                  ? 'Truva has an affiliate relationship with this issuer. This may affect placement, not editorial assessment.'
                  : 'Truva is an independent comparison platform.'}
              </span>
              <a
                href={card.source_url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex w-full sm:w-auto justify-center items-center py-4 px-8 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-bold text-lg shadow-lg shadow-brand-primary/20"
              >
                Apply on {card.bank}&apos;s website
                <span className="ml-2" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type BadgeEntry = {
  key: keyof BadgeInputs;
  label: string;
  type: 'positive' | 'catch' | 'info';
  detail: string;
};

const BADGE_GRID: BadgeEntry[] = [
  { key: 'true_naffl', label: 'True NAFFL', type: 'positive', detail: 'No annual fee for life — no spend threshold, no first-year-only waiver.' },
  { key: 'low_fx_fee', label: 'Low FX Fee', type: 'positive', detail: 'Foreign transaction fee is 1.85% or lower.' },
  { key: 'full_medical_coverage', label: 'Full Medical Coverage', type: 'positive', detail: 'Travel insurance covers medical expenses abroad, not just accidents.' },
  { key: 'high_fx_fee', label: 'High FX Fee', type: 'catch', detail: 'Foreign transaction fee is 2.75% or higher — meaningful drag on overseas spend.' },
  { key: 'earn_cap', label: 'Earn Cap', type: 'catch', detail: 'Rewards have a monthly or annual earn cap.' },
  { key: 'narrow_mcc', label: 'Narrow MCC', type: 'catch', detail: 'Bonus category earn rate is restricted to specific merchant category codes.' },
  { key: 'rewards_devalued', label: 'Rewards Devalued', type: 'catch', detail: 'This card\'s rewards program has been devalued in the past 12 months.' },
  { key: 'accident_only_insurance', label: 'Accident-Only Insurance', type: 'catch', detail: 'Travel insurance covers only on-aircraft accidents — not medical emergencies abroad.' },
  { key: 'no_ewallet_earn', label: 'No E-Wallet Earn', type: 'info', detail: 'GCash and Maya loads earn ₱0. This is standard across Philippine cards.' },
  { key: 'partner_card', label: 'Partner Card', type: 'info', detail: 'Truva has an affiliate relationship with this issuer.' },
];

function BadgeGrid({ badges }: { badges: BadgeInputs }) {
  const active = BADGE_GRID.filter((b) => badges[b.key]);
  if (active.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {active.map((b) => {
        const base = 'flex items-start gap-3 rounded-xl border p-4';
        const classes =
          b.type === 'positive'
            ? `${base} border-emerald-100 bg-emerald-50/60 dark:border-emerald-800/30 dark:bg-emerald-900/10`
            : b.type === 'catch'
              ? `${base} border-amber-100 bg-amber-50/60 dark:border-amber-800/30 dark:bg-amber-900/10`
              : `${base} border-brand-border bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.03]`;
        const Icon =
          b.type === 'positive' ? CheckCircle : b.type === 'catch' ? AlertTriangle : Info;
        const iconColor =
          b.type === 'positive'
            ? 'text-emerald-600 dark:text-emerald-400'
            : b.type === 'catch'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-gray-400';

        return (
          <div key={b.key} className={classes}>
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div>
              <p className="text-sm font-semibold text-brand-textPrimary dark:text-white">
                {b.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                {b.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatAnnualFee(card: CreditCard): string {
  if (card.naffl) return '₱0 (No annual fee for life)';
  if (card.annual_fee_recurring === 0) return '₱0';
  if (card.annual_fee_recurring !== null)
    return `₱${card.annual_fee_recurring.toLocaleString()}`;
  if (card.annual_fee_first_year !== null)
    return `₱${card.annual_fee_first_year.toLocaleString()}`;
  return 'Not disclosed';
}
