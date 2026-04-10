'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuickMatchAnswers, QuickMatchCoreAnswers } from '@/types';
import { deriveQuickMatchAnswers } from '@/utils/quickMatchMapper';

interface QuickMatchWizardProps {
  onComplete: (answers: QuickMatchAnswers) => void;
  onSkip: () => void;
  initialAnswers?: Partial<QuickMatchAnswers>;
}

const AMOUNT_PRESETS = [
  { label: 'PHP 10,000', value: 10000 },
  { label: 'PHP 100,000', value: 100000 },
  { label: 'PHP 500,000', value: 500000 },
  { label: 'Custom', value: -1 },
];

const GOAL_OPTIONS: Array<{
  id: QuickMatchCoreAnswers['purpose'];
  label: string;
  sub: string;
}> = [
  {
    id: 'emergency',
    label: 'Easy access',
    sub: 'Best if you may need the money soon.',
  },
  {
    id: 'idle-cash',
    label: 'Best earnings',
    sub: 'Best if you want the strongest after-tax return.',
  },
  {
    id: 'monthly-income',
    label: 'Regular payouts',
    sub: 'Best if you want interest paid along the way.',
  },
];

const TIMELINE_OPTIONS: Array<{
  id: QuickMatchCoreAnswers['timeline'];
  label: string;
  sub: string;
}> = [
  {
    id: 'anytime',
    label: 'Anytime',
    sub: 'Show options I can access right away.',
  },
  {
    id: '3-6mo',
    label: 'In a few months',
    sub: 'I can wait a bit for a better rate.',
  },
  {
    id: '1yr+',
    label: 'In a year or more',
    sub: 'Include longer lock-ins that may pay more.',
  },
];

function normalizeInitialPurpose(
  value: Partial<QuickMatchAnswers>['purpose']
): QuickMatchCoreAnswers['purpose'] | null {
  if (!value) return null;
  if (value === 'short-term' || value === 'long-term') return 'idle-cash';
  return value;
}

function normalizeInitialTimeline(
  value: Partial<QuickMatchAnswers>['timeline']
): QuickMatchCoreAnswers['timeline'] | null {
  if (!value) return null;
  if (value === '3mo' || value === '6-12mo') return '3-6mo';
  return value;
}

export function QuickMatchWizard({ onComplete, onSkip, initialAnswers }: QuickMatchWizardProps) {
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<QuickMatchCoreAnswers['purpose'] | null>(
    normalizeInitialPurpose(initialAnswers?.purpose)
  );
  const [amountPreset, setAmountPreset] = useState<number | null>(
    initialAnswers?.amount
      ? (AMOUNT_PRESETS.find((preset) => preset.value === initialAnswers.amount) ? initialAnswers.amount : -1)
      : null
  );
  const [customAmount, setCustomAmount] = useState<string>(
    initialAnswers?.amount && !AMOUNT_PRESETS.find((preset) => preset.value === initialAnswers.amount)
      ? String(initialAnswers.amount)
      : ''
  );
  const [timeline, setTimeline] = useState<QuickMatchCoreAnswers['timeline'] | null>(
    normalizeInitialTimeline(initialAnswers?.timeline)
  );

  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (amountPreset === -1) {
      customInputRef.current?.focus();
    }
  }, [amountPreset]);

  const resolvedAmount = amountPreset === -1
    ? (parseInt(customAmount.replace(/,/g, ''), 10) || 0)
    : (amountPreset ?? 0);

  const canProceed: boolean[] = [
    purpose !== null,
    amountPreset !== null && (amountPreset !== -1 || resolvedAmount > 0),
    timeline !== null,
  ];

  const goBack = () => {
    if (step > 1) {
      setStep((current) => current - 1);
    }
  };

  const handlePurposeSelect = (selectedPurpose: QuickMatchCoreAnswers['purpose']) => {
    setPurpose(selectedPurpose);
    // Auto-advance to step 2 after selection
    setStep(2);
  };

  const handleAmountSelect = (preset: number) => {
    setAmountPreset(preset);
    // Auto-advance to step 3 after selection
    if (preset !== -1) {
      setStep(3);
    }
  };

  const handleTimelineSelect = (selectedTimeline: QuickMatchCoreAnswers['timeline']) => {
    setTimeline(selectedTimeline);
    // Auto-complete on final selection
    const finalAnswers = deriveQuickMatchAnswers({
      purpose: purpose!,
      amount: resolvedAmount,
      timeline: selectedTimeline,
    });
    onComplete(finalAnswers);
  };

  const handleComplete = () => {
    if (!purpose || !timeline || resolvedAmount <= 0) return;

    onComplete(deriveQuickMatchAnswers({
      purpose,
      amount: resolvedAmount,
      timeline,
    }));
  };

  const optionClass = (selected: boolean) =>
    `w-full min-h-14 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 sm:min-h-16 sm:rounded-2xl sm:py-4 ${
      selected
        ? 'border-brand-primary bg-brand-primaryLight text-brand-primary shadow-[0_8px_24px_rgba(0,82,255,0.08)] dark:border-blue-400/60 dark:bg-blue-500/10 dark:text-blue-300'
        : 'border-brand-border bg-white text-brand-textPrimary hover:border-brand-primary/35 hover:bg-brand-surface dark:border-white/10 dark:bg-slate-900 dark:text-gray-200 dark:hover:border-blue-400/30 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 rounded-2xl border border-brand-primary/15 bg-gradient-to-br from-brand-primaryLight via-white to-white p-4 shadow-sm dark:border-blue-500/20 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 sm:mb-6 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary dark:border-blue-400/20 dark:bg-slate-800 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              3 easy steps
            </div>
            <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-gray-100 sm:text-2xl">
              Find your best rate fast.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
              Answer 3 simple questions. We&apos;ll rank the bank options that fit you best.
            </p>
          </div>
          <button
            onClick={onSkip}
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/30 hover:text-brand-primary dark:border-white/10 dark:bg-slate-900 dark:text-gray-400 dark:hover:border-blue-400/30 dark:hover:text-blue-400"
          >
            Skip to all banks
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
            Step {step} of 3
          </span>
          <span className="hidden text-xs text-brand-textSecondary dark:text-gray-500 sm:inline">
            Your after-tax match
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-border dark:bg-white/10">
          <div
            className="h-full rounded-full bg-brand-primary transition-[width] duration-300 ease-in-out dark:bg-blue-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-brand-border bg-white shadow-[0_16px_50px_rgba(17,24,39,0.06)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:rounded-[28px]">
        <div className="p-5 sm:p-6 md:p-8">
            {step === 1 && (
              <div>
                <h3 className="mb-1 text-xl font-bold text-brand-textPrimary dark:text-gray-100">
                  What matters most?
                </h3>
                <p className="mb-6 text-sm text-brand-textSecondary dark:text-gray-400">
                  Pick the goal that fits this money.
                </p>
                <div className="space-y-2.5">
                  {GOAL_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePurposeSelect(option.id)}
                      className={optionClass(purpose === option.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[15px] font-semibold">{option.label}</div>
                          <div className="mt-1 text-[13px] font-normal leading-relaxed text-brand-textSecondary dark:text-gray-400 sm:text-sm">
                            {option.sub}
                          </div>
                        </div>
                        {purpose === option.id && <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="mb-1 text-xl font-bold text-brand-textPrimary dark:text-gray-100">
                  How much will you deposit?
                </h3>
                <p className="mb-6 text-sm text-brand-textSecondary dark:text-gray-400">
                  We use your amount to show your real after-tax earnings.
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {AMOUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleAmountSelect(preset.value)}
                      className={optionClass(amountPreset === preset.value)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[15px] font-semibold">{preset.label}</span>
                        {amountPreset === preset.value && <Check className="h-4 w-4 shrink-0 text-brand-primary dark:text-blue-400" />}
                      </div>
                    </button>
                  ))}
                </div>

                {amountPreset === -1 && (
                  <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-slate-950">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-400">
                      Custom amount
                    </label>
                    <p className="mb-3 text-xs text-brand-textSecondary dark:text-gray-500">
                      Press Enter to continue
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-brand-textSecondary dark:text-gray-400">
                        PHP
                      </span>
                      <Input
                        ref={customInputRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="Type your amount"
                        value={customAmount}
                        onChange={(event) => setCustomAmount(event.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && resolvedAmount > 0) {
                            setStep(3);
                          }
                        }}
                        className="h-12 rounded-xl border-brand-border bg-white pl-16 text-base font-bold focus-visible:ring-brand-primary dark:border-white/20 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="mb-1 text-xl font-bold text-brand-textPrimary dark:text-gray-100">
                  When will you need it?
                </h3>
                <p className="mb-6 text-sm text-brand-textSecondary dark:text-gray-400">
                  This helps us avoid lock-ins that are too long.
                </p>
                <div className="space-y-2.5">
                  {TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleTimelineSelect(option.id)}
                      className={optionClass(timeline === option.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[15px] font-semibold">{option.label}</div>
                          <div className="mt-1 text-[13px] font-normal leading-relaxed text-brand-textSecondary dark:text-gray-400 sm:text-sm">
                            {option.sub}
                          </div>
                        </div>
                        {timeline === option.id && <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {step > 1 && (
          <div className="flex justify-start border-t border-brand-border bg-[#FBFCFF] px-5 py-4 dark:border-white/10 dark:bg-slate-950/70 sm:px-6 sm:py-5 md:px-8">
            <Button
              variant="outline"
              onClick={goBack}
              className="gap-2 rounded-xl border-brand-border px-5 text-base font-semibold dark:border-white/10 dark:bg-slate-900 dark:text-gray-300 sm:px-4 sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
