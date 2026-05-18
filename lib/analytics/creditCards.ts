'use client';

/**
 * Privacy-safe GA funnel tracking for the Credit Card Finder.
 *
 * Rules:
 *  - No PII, no free text, no exact income — only coarse quiz category ids.
 *  - Income is sent as a band id (e.g. "50-100"), never an exact figure.
 *  - Every emit is exception-safe: a missing/blocked GA never throws.
 *  - Event names are lowercase and prefixed with `cc_`.
 *
 * Prefer the typed helpers below over calling `sendGAEvent` directly.
 */

import { sendGAEvent } from '@next/third-parties/google';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';
import type { ResultRole } from '@/lib/creditCardFinder/rank';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type SourcePage =
  | 'credit-cards'
  | 'credit-card-results'
  | 'credit-card-detail'
  | string;

type Primitive = string | number | boolean;
type EventParams = Record<string, Primitive | null | undefined>;

/** Single choke point: strips empty values, guards SSR, never throws. */
function emit(event: string, params: EventParams): void {
  if (typeof window === 'undefined') return;
  try {
    const clean: Record<string, Primitive> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === undefined || v === '') continue;
      clean[k] = v;
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, clean);
      return;
    }
    sendGAEvent('event', event, clean);
  } catch {
    /* GA unavailable or blocked — tracking must never break the UX */
  }
}

/** Coarse, non-PII quiz metadata. Answer ids are already coarse categories. */
export function coarseAnswers(a: FinderAnswers) {
  return {
    first_card: a.first ?? 'na',
    income_band: a.income ?? 'na', // band id only, e.g. "50-100"
    spend: a.spend ?? 'na',
    priority: a.priority ?? 'na',
    avoid: a.avoid ?? 'na',
  };
}

// ── Finder funnel ────────────────────────────────────────────────────────────

export function trackFinderStarted(sourcePage: SourcePage = 'credit-cards') {
  emit('cc_finder_started', { source_page: sourcePage });
}

export function trackFinderBrowseAll(sourcePage: SourcePage = 'credit-cards') {
  emit('cc_finder_browse_all_clicked', { source_page: sourcePage });
}

export function trackFinderResume() {
  emit('cc_finder_resume_clicked', {});
}

export function trackFinderStepCompleted(args: {
  step: number;
  questionId: string;
  answerValue: string | null;
  skipped: boolean;
}) {
  emit('cc_finder_step_completed', {
    step: args.step,
    question_id: args.questionId,
    answer_value: args.skipped ? 'skip' : (args.answerValue ?? 'skip'),
    skipped: args.skipped,
  });
}

export function trackFinderCompleted(answers: FinderAnswers) {
  emit('cc_finder_completed', { ...coarseAnswers(answers) });
}

// ── Results ──────────────────────────────────────────────────────────────────

export function trackResultsViewed(args: {
  resultCount: number;
  topCardKey?: string;
  topBank?: string;
  answers: FinderAnswers;
}) {
  emit('cc_results_viewed', {
    result_count: args.resultCount,
    top_card_key: args.topCardKey,
    top_bank: args.topBank,
    ...coarseAnswers(args.answers),
  });
}

export function trackNoMatchViewed(args: { answers: FinderAnswers }) {
  emit('cc_no_match_viewed', { ...coarseAnswers(args.answers) });
}

export function trackResultDetailClicked(args: {
  cardKey: string;
  bank: string;
  rank: number;
  resultRole: ResultRole;
}) {
  emit('cc_result_detail_clicked', {
    card_key: args.cardKey,
    bank: args.bank,
    rank: args.rank,
    result_role: args.resultRole,
    source_page: 'credit-card-results',
  });
}

export function trackResultsEditAnswers() {
  emit('cc_results_edit_answers_clicked', {});
}

export function trackResultsBrowseAll() {
  emit('cc_results_browse_all_clicked', {});
}

// ── Apply + detail ───────────────────────────────────────────────────────────

export function trackApplyClick(args: {
  cardKey: string;
  bank: string;
  placement: string;
  sourcePage: SourcePage;
  rank?: number;
  resultRole?: ResultRole;
}) {
  emit('cc_apply_click', {
    card_key: args.cardKey,
    bank: args.bank,
    placement: args.placement,
    rank: args.rank,
    result_role: args.resultRole,
    source_page: args.sourcePage,
  });
}

export function trackDetailViewed(args: {
  cardKey: string;
  bank: string;
  sourcePage: SourcePage;
}) {
  emit('cc_detail_viewed', {
    card_key: args.cardKey,
    bank: args.bank,
    source_page: args.sourcePage,
  });
}
