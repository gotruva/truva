import { ClipboardList, ListOrdered, MousePointerClick } from 'lucide-react';

const STEPS = [
  {
    icon: ClipboardList,
    number: '1',
    title: 'Answer 3 quick questions',
    body: 'Tell us your goal, monthly income, and where you spend the most. No sign-up needed.',
  },
  {
    icon: ListOrdered,
    number: '2',
    title: 'See your top matches',
    body: 'We rank every card by the peso amount you keep per year — not by who pays us.',
  },
  {
    icon: MousePointerClick,
    number: '3',
    title: 'Click through to the bank',
    body: 'Apply directly on the bank\'s official site. Truva is always free.',
  },
];

export function CreditCardHowItWorks() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-2 pt-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-md shadow-brand-primary/25">
                <Icon className="h-5 w-5" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-primary ring-2 ring-brand-primary/20">
                  {step.number}
                </span>
              </div>
              <h3 className="text-sm font-bold text-brand-textPrimary dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                {step.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
