'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CreditCardHero } from '../CreditCardHero';
import { QuizQuestion } from './QuizQuestion';
import { MatchingState } from './MatchingState';
import {
  EMPTY_ANSWERS,
  FINDER_STORAGE_KEY,
  FINDER_STORAGE_TTL_MS,
  QUESTIONS_FINAL,
  TOTAL_STEPS,
  type FinderAnswers,
  type QuestionId,
} from '@/lib/creditCardFinder/questions';
import { answersToQuery } from '@/lib/creditCardFinder/rank';
import {
  trackFinderBrowseAll,
  trackFinderCompleted,
  trackFinderResume,
  trackFinderStarted,
  trackFinderStepCompleted,
} from '@/lib/analytics/creditCards';
import type { CreditCard } from '@/types';

const DRAFT_KEY = 'truva.cards.finderDraft';
const MATCH_MIN_MS = 1200;

/**
 * Owns the finder. Navigation position lives in the URL `?step=` param so
 * refresh + browser back/forward never lose place. In-progress answers are
 * mirrored to sessionStorage; the completed run is saved to localStorage for
 * the "Resume your finder" affordance (30-day TTL).
 */
export function FinderFlow({ cards }: { cards: CreditCard[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');

  const [answers, setAnswers] = useState<FinderAnswers>(EMPTY_ANSWERS);
  const [resume, setResume] = useState<{ query: string } | null>(null);
  const matchFired = useRef(false);

  // Hydrate draft answers + resume affordance once on mount. Storage is an
  // external system, so the read happens here; the state update is deferred
  // out of the synchronous effect body (avoids cascading renders).
  useEffect(() => {
    let draftAnswers: FinderAnswers | null = null;
    let resumeQuery: string | null = null;

    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) draftAnswers = { ...EMPTY_ANSWERS, ...JSON.parse(draft) };
    } catch {
      /* ignore corrupt draft */
    }
    try {
      const raw = localStorage.getItem(FINDER_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { at: number; answers: FinderAnswers };
        if (saved?.at && Date.now() - saved.at < FINDER_STORAGE_TTL_MS) {
          resumeQuery = answersToQuery(saved.answers);
        } else {
          localStorage.removeItem(FINDER_STORAGE_KEY);
        }
      }
    } catch {
      /* ignore corrupt storage */
    }

    const raf = requestAnimationFrame(() => {
      if (draftAnswers) setAnswers(draftAnswers);
      if (resumeQuery) setResume({ query: resumeQuery });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const persistDraft = useCallback((next: FinderAnswers) => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const goToStep = useCallback(
    (oneBased: number | 'match' | null) => {
      const target =
        oneBased === null
          ? pathname
          : `${pathname}?step=${oneBased}`;
      router.replace(target, { scroll: false });
    },
    [pathname, router],
  );

  // Derive the current phase/step from the URL (single source of truth).
  const view = useMemo(() => {
    if (stepParam === 'match') return { phase: 'matching' as const };
    const n = Number(stepParam);
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL_STEPS) {
      return { phase: 'quiz' as const, stepIndex: n - 1 };
    }
    return { phase: 'landing' as const };
  }, [stepParam]);

  const handleStart = useCallback(() => {
    trackFinderStarted();
    goToStep(1);
  }, [goToStep]);
  const handleBrowse = useCallback(() => {
    trackFinderBrowseAll();
    router.push('/credit-cards/all');
  }, [router]);
  const handleResume = useCallback(() => {
    if (resume) {
      trackFinderResume();
      router.push(`/credit-cards/results?${resume.query}`);
    }
  }, [resume, router]);

  const finish = useCallback(
    (finalAnswers: FinderAnswers) => {
      try {
        localStorage.setItem(
          FINDER_STORAGE_KEY,
          JSON.stringify({ at: Date.now(), answers: finalAnswers }),
        );
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      trackFinderCompleted(finalAnswers);
      goToStep('match');
    },
    [goToStep],
  );

  const advanceFrom = useCallback(
    (stepIndex: number, next: FinderAnswers) => {
      if (stepIndex >= TOTAL_STEPS - 1) {
        finish(next);
      } else {
        goToStep(stepIndex + 2); // +1 next step, +1 one-based
      }
    },
    [finish, goToStep],
  );

  const handleSelect = useCallback(
    (stepIndex: number, value: string) => {
      const qid = QUESTIONS_FINAL[stepIndex].id as QuestionId;
      const next = { ...answers, [qid]: value } as FinderAnswers;
      setAnswers(next);
      persistDraft(next);
      trackFinderStepCompleted({
        step: stepIndex + 1,
        questionId: qid,
        answerValue: value,
        skipped: false,
      });
      window.setTimeout(() => advanceFrom(stepIndex, next), 250);
    },
    [answers, advanceFrom, persistDraft],
  );

  const handleSkip = useCallback(
    (stepIndex: number) => {
      const qid = QUESTIONS_FINAL[stepIndex].id as QuestionId;
      const next = { ...answers, [qid]: null } as FinderAnswers;
      setAnswers(next);
      persistDraft(next);
      trackFinderStepCompleted({
        step: stepIndex + 1,
        questionId: qid,
        answerValue: null,
        skipped: true,
      });
      advanceFrom(stepIndex, next);
    },
    [answers, advanceFrom, persistDraft],
  );

  const handleBack = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= 0) goToStep(null);
      else goToStep(stepIndex); // one-based prev = stepIndex (0-based prev +1)
    },
    [goToStep],
  );

  // Matching → navigate to results after the minimum calm delay.
  useEffect(() => {
    if (view.phase !== 'matching' || matchFired.current) return;
    matchFired.current = true;

    let effective = answers;
    if (!effective.first && !effective.income && !effective.priority) {
      try {
        const draft = sessionStorage.getItem(DRAFT_KEY);
        if (draft) effective = { ...EMPTY_ANSWERS, ...JSON.parse(draft) };
      } catch {
        /* ignore */
      }
    }
    const query = answersToQuery(effective);
    const timer = window.setTimeout(() => {
      // No answers at all (e.g. deep-linked ?step=match) → back to landing.
      if (!query) {
        router.replace('/credit-cards', { scroll: false });
        return;
      }
      router.push(`/credit-cards/results?${query}`);
    }, MATCH_MIN_MS);
    return () => window.clearTimeout(timer);
  }, [view.phase, answers, router]);

  if (view.phase === 'landing') {
    return (
      <CreditCardHero
        cards={cards}
        onStart={handleStart}
        onBrowse={handleBrowse}
        hasResume={Boolean(resume)}
        onResume={handleResume}
      />
    );
  }

  if (view.phase === 'matching') {
    return (
      <div className="bg-white py-6 dark:bg-slate-950">
        <MatchingState />
      </div>
    );
  }

  const stepIndex = view.stepIndex;
  const question = QUESTIONS_FINAL[stepIndex];
  const selectedId =
    (answers[question.id as QuestionId] as string | null) ?? null;

  return (
    <div className="bg-white py-6 dark:bg-slate-950">
      <QuizQuestion
        question={question}
        stepIndex={stepIndex}
        total={TOTAL_STEPS}
        selectedId={selectedId}
        onSelect={(v) => handleSelect(stepIndex, v)}
        onBack={() => handleBack(stepIndex)}
        onSkip={() => handleSkip(stepIndex)}
      />
    </div>
  );
}
