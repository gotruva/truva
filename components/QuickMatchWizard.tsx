'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuickMatchAnswers } from '@/types';

interface QuickMatchWizardProps {
  onComplete: (answers: QuickMatchAnswers) => void;
  onSkip: () => void;
  initialAnswers?: Partial<QuickMatchAnswers>;
}

const AMOUNT_PRESETS = [
  { label: '₱10,000', value: 10000 },
  { label: '₱50,000', value: 50000 },
  { label: '₱100,000', value: 100000 },
  { label: '₱500,000', value: 500000 },
  { label: '₱1,000,000+', value: 1000000 },
  { label: 'Custom', value: -1 },
];

type Direction = 1 | -1;

export function QuickMatchWizard({ onComplete, onSkip, initialAnswers }: QuickMatchWizardProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>(1);

  const [purpose, setPurpose] = useState<QuickMatchAnswers['purpose'] | null>(
    initialAnswers?.purpose ?? null
  );
  const [amountPreset, setAmountPreset] = useState<number | null>(
    initialAnswers?.amount ? (
      AMOUNT_PRESETS.find(p => p.value === initialAnswers.amount) ? initialAnswers.amount : -1
    ) : null
  );
  const [customAmount, setCustomAmount] = useState<string>(
    initialAnswers?.amount && !AMOUNT_PRESETS.find(p => p.value === initialAnswers.amount)
      ? String(initialAnswers.amount)
      : ''
  );
  const [timeline, setTimeline] = useState<QuickMatchAnswers['timeline'] | null>(
    initialAnswers?.timeline ?? null
  );
  const [lockFlexibility, setLockFlexibility] = useState<QuickMatchAnswers['lockFlexibility'] | null>(
    initialAnswers?.lockFlexibility ?? null
  );
  const [payoutPreference, setPayoutPreference] = useState<QuickMatchAnswers['payoutPreference'] | null>(
    initialAnswers?.payoutPreference ?? null
  );
  const [insurancePreference, setInsurancePreference] = useState<QuickMatchAnswers['insurancePreference'] | null>(
    initialAnswers?.insurancePreference ?? null
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
    lockFlexibility !== null,
    payoutPreference !== null,
    insurancePreference !== null,
  ];

  const goNext = () => {
    if (step < 6) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleComplete = () => {
    if (purpose && resolvedAmount > 0 && timeline && lockFlexibility && payoutPreference && insurancePreference) {
      onComplete({ purpose, amount: resolvedAmount, timeline, lockFlexibility, payoutPreference, insurancePreference });
    }
  };

  const slideVariants = {
    enter: (dir: Direction) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: Direction) => ({ x: dir * -40, opacity: 0 }),
  };

  const optionClass = (selected: boolean) =>
    `w-full min-h-14 px-4 py-3.5 border rounded-xl text-left flex items-center justify-between gap-3 font-medium text-[15px] transition-all duration-150 cursor-pointer ${
      selected
        ? 'border-brand-primary bg-brand-primaryLight text-brand-primary dark:border-blue-400/60 dark:bg-blue-500/10 dark:text-blue-300'
        : 'border-brand-border bg-white dark:bg-slate-800 dark:border-white/10 text-brand-textPrimary dark:text-gray-200 hover:border-brand-primary/40 hover:bg-brand-surface dark:hover:border-blue-400/30 dark:hover:bg-slate-700'
    }`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-brand-textSecondary dark:text-gray-400 uppercase tracking-wider">
            Step {step} of 6
          </span>
          <button
            onClick={onSkip}
            className="text-xs font-medium text-brand-textSecondary dark:text-gray-500 hover:text-brand-primary dark:hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
          >
            Compare manually
          </button>
        </div>
        <div className="h-1.5 w-full bg-brand-border dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-primary dark:bg-blue-500 rounded-full"
            animate={{ width: `${(step / 6) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="p-6 md:p-8"
          >
            {/* Step 1 — Purpose */}
            {step === 1 && (
              <div>
                <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-1">What is this money for?</h3>
                <p className="text-sm text-brand-textSecondary dark:text-gray-400 mb-5">We&apos;ll match you with options that fit your goal.</p>
                <div className="space-y-2.5">
                  {([
                    { id: 'emergency', label: 'Emergency fund', sub: 'Keep it safe, access it anytime' },
                    { id: 'short-term', label: 'Short-term savings', sub: 'Saving up for something specific' },
                    { id: 'idle-cash', label: 'Growing idle cash', sub: 'Money sitting, make it work harder' },
                    { id: 'long-term', label: 'Long-term savings', sub: 'Park it and grow it over years' },
                    { id: 'monthly-income', label: 'Regular interest / monthly income', sub: 'I want interest paid out regularly' },
                  ] as const).map(opt => (
                    <button key={opt.id} onClick={() => setPurpose(opt.id)} className={optionClass(purpose === opt.id)}>
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs font-normal text-brand-textSecondary dark:text-gray-400 mt-0.5">{opt.sub}</div>
                      </div>
                      {purpose === opt.id && <Check className="w-5 h-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Amount */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-1">How much are you depositing?</h3>
                <p className="text-sm text-brand-textSecondary dark:text-gray-400 mb-5">We&apos;ll calculate your exact after-tax returns.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                  {AMOUNT_PRESETS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAmountPreset(opt.value)}
                      className={optionClass(amountPreset === opt.value)}
                    >
                      <span>{opt.label}</span>
                      {amountPreset === opt.value && <Check className="w-4 h-4 shrink-0 text-brand-primary dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
                {amountPreset === -1 && (
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-brand-textSecondary dark:text-gray-400">₱</span>
                    <Input
                      ref={customInputRef}
                      type="text"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      className="pl-8 h-12 text-base font-bold bg-brand-surface dark:bg-slate-950 border-brand-border dark:border-white/20 rounded-xl focus-visible:ring-brand-primary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3 — Timeline */}
            {step === 3 && (
              <div>
                <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-1">When might you need the money?</h3>
                <p className="text-sm text-brand-textSecondary dark:text-gray-400 mb-5">This helps us filter options by their lock-in period.</p>
                <div className="space-y-2.5">
                  {([
                    { id: 'anytime', label: 'Anytime', sub: 'I need to be able to withdraw immediately' },
                    { id: '3mo', label: 'Within 3 months', sub: 'Short window before I might need it' },
                    { id: '3-6mo', label: '3–6 months', sub: 'A few months away' },
                    { id: '6-12mo', label: '6–12 months', sub: 'About half a year to a year' },
                    { id: '1yr+', label: '1 year or more', sub: 'I won\'t touch this for a long time' },
                  ] as const).map(opt => (
                    <button key={opt.id} onClick={() => setTimeline(opt.id)} className={optionClass(timeline === opt.id)}>
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs font-normal text-brand-textSecondary dark:text-gray-400 mt-0.5">{opt.sub}</div>
                      </div>
                      {timeline === opt.id && <Check className="w-5 h-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 — Lock flexibility */}
            {step === 4 && (
              <div>
                <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-1">Can you lock the money for better returns?</h3>
                <p className="text-sm text-brand-textSecondary dark:text-gray-400 mb-5">Locking your money in a fixed deposit often means higher rates.</p>
                <div className="space-y-2.5">
                  {([
                    { id: 'no-lock', label: 'No, I need access anytime', sub: 'Show me only liquid accounts' },
                    { id: 'maybe', label: 'Maybe, if the return is worth it', sub: 'I\'m open to some lock-in' },
                    { id: 'yes-lock', label: 'Yes, I\'m okay locking it', sub: 'Maximize returns, I won\'t need it soon' },
                  ] as const).map(opt => (
                    <button key={opt.id} onClick={() => setLockFlexibility(opt.id)} className={optionClass(lockFlexibility === opt.id)}>
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs font-normal text-brand-textSecondary dark:text-gray-400 mt-0.5">{opt.sub}</div>
                      </div>
                      {lockFlexibility === opt.id && <Check className="w-5 h-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 — Payout preference */}
            {step === 5 && (
              <div>
                <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-1">Do you want regular interest payouts?</h3>
                <p className="text-sm text-brand-textSecondary dark:text-gray-400 mb-5">Some accounts pay you monthly, others only when you withdraw.</p>
                <div className="space-y-2.5">
                  {([
                    { id: 'no-preference', label: 'No preference', sub: 'Show me the best rates regardless' },
                    { id: 'monthly', label: 'Monthly payouts', sub: 'I want interest credited every month' },
                    { id: 'at-maturity', label: 'At maturity is okay', sub: 'I don\'t mind waiting for the full payout' },
                  ] as const).map(opt => (
                    <button key={opt.id} onClick={() => setPayoutPreference(opt.id)} className={optionClass(payoutPreference === opt.id)}>
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs font-normal text-brand-textSecondary dark:text-gray-400 mt-0.5">{opt.sub}</div>
                      </div>
                      {payoutPreference === opt.id && <Check className="w-5 h-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6 — Insurance preference */}
            {step === 6 && (
              <div>
                <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-1">How safe do you want your money to be?</h3>
                <p className="text-sm text-brand-textSecondary dark:text-gray-400 mb-5">PDIC insures bank deposits up to ₱500,000. Government bonds are backed by the Bureau of Treasury.</p>
                <div className="space-y-2.5">
                  {([
                    { id: 'insured-only', label: 'Insured options only', sub: 'PDIC banks and government bonds only' },
                    { id: 'show-both', label: 'Show me both', sub: 'Include UITFs and other options, no crypto' },
                    { id: 'open-all', label: 'I\'m open to non-bank options too', sub: 'Include DeFi and all yield sources' },
                  ] as const).map(opt => (
                    <button key={opt.id} onClick={() => setInsurancePreference(opt.id)} className={optionClass(insurancePreference === opt.id)}>
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs font-normal text-brand-textSecondary dark:text-gray-400 mt-0.5">{opt.sub}</div>
                      </div>
                      {insurancePreference === opt.id && <Check className="w-5 h-5 shrink-0 text-brand-primary dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation footer */}
        <div className="px-6 pb-6 md:px-8 md:pb-8 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={goBack}
              className="h-12 gap-1 border-brand-border dark:border-white/10 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            onClick={goNext}
            disabled={!canProceed[step - 1]}
            className="flex-1 h-12 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold gap-2 disabled:opacity-50"
          >
            {step < 6 ? (
              <>Next <ArrowRight className="w-4 h-4" /></>
            ) : (
              'Find my best deposit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
