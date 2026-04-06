'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Target, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PreQualAnswers {
  amount: number;
  lockIn: 'Liquid' | 'Short' | 'Long';
  risk: 'PDIC' | 'AllBanks';
}

interface PreQualFlowProps {
  onComplete: (answers: PreQualAnswers) => void;
  onCancel: () => void;
}

export function PreQualFlow({ onComplete, onCancel }: PreQualFlowProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>('100000');
  const [lockIn, setLockIn] = useState<'Liquid' | 'Short' | 'Long' | null>(null);
  const [risk, setRisk] = useState<'PDIC' | 'AllBanks' | null>(null);

  const handleNext = () => setStep((s) => s + 1);

  const finishFlow = () => {
    if (lockIn && risk) {
      onComplete({
        amount: Number(amount),
        lockIn,
        risk,
      });
    }
  };

  const wrapAnimate = (content: React.ReactNode, key: number) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-xl shadow-sm mb-6"
    >
      {content}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === 1 && wrapAnimate(
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-primaryLight text-brand-primary p-2 rounded-full">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-textPrimary dark:text-gray-100 text-lg">How much are you saving?</h3>
              <p className="text-sm text-brand-textSecondary dark:text-gray-400">We'll calculate your exact after-tax returns.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6 text-xl">
            <span className="font-bold text-brand-textSecondary">₱</span>
            <input
              type="number"
              className="w-full text-2xl font-bold p-3 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
            />
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
             <Button className="flex-1 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold" onClick={handleNext}>
               Next <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </>, 1
      )}

      {step === 2 && wrapAnimate(
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-primaryLight text-brand-primary p-2 rounded-full">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-textPrimary dark:text-gray-100 text-lg">How long can you lock it in?</h3>
              <p className="text-sm text-brand-textSecondary dark:text-gray-400">Longer lock-ins usually mean higher rates.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { id: 'Liquid', label: 'Liquid (Anytime)' },
              { id: 'Short', label: 'Up to 3 months' },
              { id: 'Long', label: '6 months or more' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLockIn(opt.id as any)}
                className={`p-4 border rounded-lg text-left flex justify-between items-center transition-colors ${
                  lockIn === opt.id ? 'border-brand-primary bg-brand-primaryLight text-brand-textPrimary' : 'border-brand-border hover:border-gray-300 dark:text-gray-200'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                {lockIn === opt.id && <Check className="w-5 h-5 text-brand-primary" />}
              </button>
            ))}
          </div>
          <Button 
            className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold" 
            onClick={handleNext}
            disabled={!lockIn}
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>, 2
      )}

      {step === 3 && wrapAnimate(
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-primaryLight text-brand-primary p-2 rounded-full">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-textPrimary dark:text-gray-100 text-lg">Which bank options do you want to see?</h3>
              <p className="text-sm text-brand-textSecondary dark:text-gray-400">Keep the results conservative or compare the full bank list.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { id: 'PDIC', label: 'PDIC-insured banks only' },
              { id: 'AllBanks', label: 'Show all bank options' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRisk(opt.id as any)}
                className={`p-4 border rounded-lg text-left flex justify-between items-center transition-colors ${
                  risk === opt.id ? 'border-brand-primary bg-brand-primaryLight text-brand-textPrimary' : 'border-brand-border hover:border-gray-300 dark:text-gray-200'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                {risk === opt.id && <Check className="w-5 h-5 text-brand-primary" />}
              </button>
            ))}
          </div>
          <Button 
            className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold" 
            onClick={finishFlow}
            disabled={!risk}
          >
            Show My Best Matches
          </Button>
        </>, 3
      )}
    </AnimatePresence>
  );
}
