'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Sparkles, CreditCard, Wallet, Plane, ShoppingCart, Utensils, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizStep {
  id: string;
  question: string;
  description: string;
}

const STEPS: QuizStep[] = [
  {
    id: 'goal',
    question: 'What matters most to you?',
    description: 'We will prioritize cards that match your primary financial goal.',
  },
  {
    id: 'income',
    question: 'What is your monthly income?',
    description: 'Banks use this to determine which cards you are eligible for.',
  },
  {
    id: 'spending',
    question: 'Where do you spend the most?',
    description: 'We will find cards that give you the best rewards for these categories.',
  },
];

const INCOME_OPTIONS = [
  { id: '15k', label: '₱15,000+', sub: 'Entry-level cards' },
  { id: '30k', label: '₱30,000+', sub: 'Mid-tier cards' },
  { id: '50k', label: '₱50,000+', sub: 'Premium & Travel cards' },
  { id: '100k', label: '₱100,000+', sub: 'Elite & Infinite cards' },
];

const GOAL_OPTIONS = [
  { id: 'no-annual-fee', label: 'No Annual Fee', sub: 'Save on yearly costs forever.', icon: Wallet },
  { id: 'cashback', label: 'Cashback', sub: 'Get a percentage of your spend back.', icon: Zap },
  { id: 'travel', label: 'Travel & Miles', sub: 'Earn points for flights and hotels.', icon: Plane },
  { id: 'first-card', label: 'My First Card', sub: 'High approval for beginners.', icon: CreditCard },
];

const SPENDING_OPTIONS = [
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart },
  { id: 'dining', label: 'Dining & Food', icon: Utensils },
  { id: 'online', label: 'Online Shopping', icon: ShoppingCart },
  { id: 'travel', label: 'Travel & Gas', icon: Plane },
];

export function CreditCardQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Goals where spend category doesn't meaningfully change results —
  // NAFFL filters on fee flag, first-card filters on income tier.
  const SKIP_SPEND_GOALS = new Set(['no-annual-fee', 'first-card']);

  const handleSelect = (stepId: string, optionId: string) => {
    const newAnswers = { ...answers, [stepId]: optionId };
    setAnswers(newAnswers);

    const isLastStep = step === STEPS.length - 1;
    // After income step (step 1), skip spend step for certain goals
    const skipSpend = step === 1 && SKIP_SPEND_GOALS.has(newAnswers.goal ?? '');

    if (!isLastStep && !skipSpend) {
      setStep(step + 1);
    } else {
      const params = new URLSearchParams({
        goal:     newAnswers.goal     ?? '',
        income:   newAnswers.income   ?? '',
        spending: newAnswers.spending ?? 'groceries',
      });
      router.push(`/credit-cards/results?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div id="quiz" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
              <Sparkles className="h-3 w-3" />
              Step {step + 1} of {STEPS.length}
            </div>
            <h2 className="text-2xl font-bold text-brand-textPrimary dark:text-white">{currentStep.question}</h2>
            <p className="text-sm text-brand-textSecondary dark:text-gray-400">{currentStep.description}</p>
          </div>
          {step > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 gap-1 rounded-lg px-2 text-brand-textSecondary hover:text-brand-textPrimary"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <div className="h-1.5 w-full rounded-full bg-brand-surface dark:bg-white/5">
          <motion.div
            className="h-full rounded-full bg-brand-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {step === 0 &&
                GOAL_OPTIONS.map((opt) => (
                  <QuizOption
                    key={opt.id}
                    label={opt.label}
                    sub={opt.sub}
                    icon={opt.icon}
                    selected={answers.goal === opt.id}
                    onClick={() => handleSelect('goal', opt.id)}
                  />
                ))}
              {step === 1 &&
                INCOME_OPTIONS.map((opt) => (
                  <QuizOption
                    key={opt.id}
                    label={opt.label}
                    sub={opt.sub}
                    selected={answers.income === opt.id}
                    onClick={() => handleSelect('income', opt.id)}
                  />
                ))}
              {step === 2 &&
                SPENDING_OPTIONS.map((opt) => (
                  <QuizOption
                    key={opt.id}
                    label={opt.label}
                    icon={opt.icon}
                    selected={answers.spending === opt.id}
                    onClick={() => handleSelect('spending', opt.id)}
                  />
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function QuizOption({
  label,
  sub,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]',
        selected
          ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary dark:bg-brand-primary/10'
          : 'border-brand-border bg-white hover:border-brand-primary/30 dark:border-white/10 dark:bg-white/5'
      )}
    >
      <div className="flex w-full items-start justify-between">
        {Icon && (
          <div className={cn(
            "mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            selected ? "bg-brand-primary text-white" : "bg-brand-surface text-brand-textSecondary group-hover:bg-brand-primary/10 group-hover:text-brand-primary dark:bg-white/5"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        {selected && <Check className="h-5 w-5 text-brand-primary" />}
      </div>
      <span className="text-lg font-bold text-brand-textPrimary dark:text-white">{label}</span>
      {sub && <span className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">{sub}</span>}
    </button>
  );
}
