import { Eye, Lock, MapPin, Trophy } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Trophy,
    title: 'No paid rankings',
    body: 'Cards are sorted by the money you keep per year — not by commissions or paid placement. Every card gets the same math.',
  },
  {
    icon: Eye,
    title: 'We show our work',
    body: 'Every ₱/year estimate is explained. Our full methodology is public at gotruva.com/methodology/credit-cards.',
  },
  {
    icon: Lock,
    title: 'Your info stays private',
    body: 'No account required. We don\'t store your quiz answers. No spam — just honest comparisons.',
  },
  {
    icon: MapPin,
    title: 'Made for Filipinos',
    body: 'Peso-first numbers, PH banks only, plain English. Built for the way Filipinos actually bank.',
  },
];

export function CreditCardTrustGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Our promise
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
          Why Filipinos trust Truva
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-textPrimary dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                  {item.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
