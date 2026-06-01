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
  trackFinderAbandoned,
  trackFinderBrowseAll,
  trackFinderCompleted,
  trackFinderResume,
  trackFinderStarted,
  trackFinderStepCompleted,
  trackFinderStepViewed,
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
  // Live ref to the latest answers so the abandon handler (running in an
  // effect cleanup / visibilitychange listener) can read the partial profile
  // without the effect re-binding on every keystroke.
  const answersRef = useRef(answers);
  // Track which step we've already fired `step_viewed` for, so StrictMode
  // double-invokes (and quick back-and-forth) don't produce duplicates.
  const viewedStepRef = useRef<number | null>(null);
  // Live ref for the abandon handler — reads the current step without making
  // the effect re-bind on every navigation.
  const currentStepRef = useRef<number | null>(null);
  // Set to true the moment the quiz finishes (or the user explicitly leaves
  // via Cancel). Suppresses the page-hide abandon ping in those cases.
  const finishedOrLeftRef = useRef(false);

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

  // Keep the live answers ref in sync — read by the abandon handler.
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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

  // Fire `step_viewed` whenever the user arrives at a new quiz step. Paired
  // with `step_completed`, this gives a per-step drop-off funnel
  // (viewed_N - completed_N = users who saw step N but did not answer it).
  useEffect(() => {
    if (view.phase !== 'quiz') {
      currentStepRef.current = null;
      return;
    }
    const stepNumber = view.stepIndex + 1;
    currentStepRef.current = stepNumber;
    if (viewedStepRef.current === stepNumber) return;
    viewedStepRef.current = stepNumber;
    const qid = QUESTIONS_FINAL[view.stepIndex]?.id ?? 'unknown';
    trackFinderStepViewed({ step: stepNumber, questionId: qid });
  }, [view]);

  // Catch mid-quiz abandonment: the user closed the tab, switched away, or
  // navigated off the quiz without completing it. Uses `visibilitychange`
  // (which fires reliably on mobile tab close, unlike `beforeunload`) and the
  // unmount cleanup to cover SPA navigations.
  useEffect(() => {
    const fireAbandon = (reason: 'page_hidden' | 'navigated_away') => {
      if (finishedOrLeftRef.current) return;
      const step = currentStepRef.current;
      if (step === null) return; // not in the quiz
      const qid = QUESTIONS_FINAL[step - 1]?.id ?? 'unknown';
      trackFinderAbandoned({
        step,
        questionId: qid,
        reason,
        partialAnswers: answersRef.current, // user profile so far
      });
      finishedOrLeftRef.current = true; // don't double-fire
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') fireAbandon('page_hidden');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      // SPA route change away from the finder → component unmount.
      fireAbandon('navigated_away');
    };
  }, []);

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
      finishedOrLeftRef.current = true; // legitimate finish — suppress abandon
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
      if (stepIndex <= 0) {
        // Leaving Q1 back to the landing = explicit cancel.
        const qid = QUESTIONS_FINAL[stepIndex]?.id as QuestionId | undefined;
        trackFinderAbandoned({
          step: stepIndex + 1,
          questionId: qid ?? 'unknown',
          reason: 'cancel',
          partialAnswers: answersRef.current, // any answers given so far
        });
        finishedOrLeftRef.current = true; // suppress the unmount/page-hide ping
        goToStep(null);
      } else {
        goToStep(stepIndex); // one-based prev = stepIndex (0-based prev +1)
      }
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
