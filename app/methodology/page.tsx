import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CreditCard,
  HandCoins,
  Landmark,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';

export const metadata: Metadata = {
  title: 'Methodology & Trust',
  description:
    'See how Truva compares banking products, credit cards, and loans, how advertisements are labeled, and how editorial independence is protected.',
  alternates: {
    canonical: '/methodology',
  },
};

const methodologyCards = [
  {
    title: 'Banking methodology',
    description:
      'How Truva will weigh after-tax yield, liquidity, conditions complexity, insurance, and payout structure.',
    href: '/methodology/banking',
    icon: Landmark,
  },
  {
    title: 'Credit cards methodology',
    description:
      'How fees, fee-waiver realism, rewards usefulness, redemption friction, and approval fit will be handled.',
    href: '/methodology/credit-cards',
    icon: CreditCard,
  },
  {
    title: 'Loans methodology',
    description:
      'How effective annual cost, fees, funding speed, flexibility, and late-fee risk will shape future recommendations.',
    href: '/methodology/loans',
    icon: HandCoins,
  },
  {
    title: 'Editorial integrity',
    description:
      'How Truva labels sponsored content, what partner compensation can change, and what it cannot touch.',
    href: '/methodology/editorial-integrity',
    icon: ShieldCheck,
  },
];

export default function MethodologyHubPage() {
  return (
    <SectionHub
      title="Methodology & Trust"
      description="This is Truva's public trust layer: how comparison works, how we make money, how content is labeled, and why the upcoming True Value Score is still intentionally inactive."
      breadcrumbItems={[{ label: 'Methodology', href: '/methodology' }]}
      containerClassName="max-w-6xl"
      titleClassName="not-italic"
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-[1.9rem] border border-brand-border bg-white p-6 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
              <ShieldCheck className="h-4 w-4" />
              Trust promise
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand-textPrimary dark:text-white">
                Truva should earn trust by exposing its rules, not by asking for it.
              </h2>
              <p className="text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                Readers should be able to see how comparisons are framed, where compensation exists, how scores will eventually work, and why a partner cannot buy a favorable editorial conclusion.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-brand-primary/15 bg-brand-primary-light/40 p-4 dark:border-brand-primary/20 dark:bg-brand-primary/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
                Current stance
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-brand-textPrimary dark:text-white">
                True Value Score is coming soon, not quietly live in the background.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                Each category gets its own methodology first. Only after those pages are public and challengeable should scorecards become active on landing pages.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              The short version
            </p>
            <MethodBullet text="Comparison logic should be visible before the first major CTA." />
            <MethodBullet text="Partner compensation may affect advertisements and placements, but not editorial opinions or methodology weighting." />
            <MethodBullet text="Sponsored and partner-supported content should be labeled in plain language." />
            <MethodBullet text="Every category gets a separate methodology because bank deposits, cards, and loans are not the same product." />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Methodology index
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            Start with the category you want to challenge
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {methodologyCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[1.75rem] border border-brand-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {card.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                Open page
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            How comparison works
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            We compare products by the user outcome, not by the most marketable number.
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              Banking pages emphasize after-tax yield and liquidity. Credit-card pages emphasize fee drag, reward usefulness, and promo realism. Loan pages emphasize effective annual cost, net proceeds, and funding friction.
            </p>
            <p>
              That category separation matters because the wrong comparison framework can make a mediocre product look great. The methodology pages exist to keep that from happening.
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            How Truva makes money
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Compensation helps keep the product alive. It should not dictate the editorial answer.
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            <p>
              Truva may earn money when readers click through to a partner or complete an action on a partner website. That compensation can support business operations and advertising inventory.
            </p>
            <p>
              It should not guarantee a favorable review, distort a methodology page, or silently switch the order of editorial recommendations. Those boundaries are stated more directly in the editorial-integrity page.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Labeling rules
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              "Editorial," "Sponsored," and "Partner-supported" should never blur together.
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Truva should use plain labels that readers can understand at a glance. If a post or surface is sponsored, it should say so clearly. If a page is editorial, it should still disclose commercial relationships without pretending those relationships disappear.
            </p>
          </div>

          <Link
            href="/methodology/editorial-integrity"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Read editorial integrity
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SectionHub>
  );
}

function MethodBullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.1rem] border border-brand-border bg-brand-surface/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
      <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
        {text}
      </p>
    </div>
  );
}
