'use client';

import { useEffect, useRef } from 'react';
import { trackNoMatchViewed, trackResultsViewed } from '@/lib/analytics/creditCards';
import type { FinderAnswers } from '@/lib/creditCardFinder/questions';

type Props =
  | {
      kind: 'matched';
      answers: FinderAnswers;
      resultCount: number;
      topCardKey?: string;
      topBank?: string;
    }
  | { kind: 'fallback'; answers: FinderAnswers };

/**
 * Render-fire tracker for the results view. Renders nothing. A useRef guard
 * keeps React Strict Mode's double-mount from double-counting.
 */
export function ResultsAnalytics(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (props.kind === 'matched') {
      trackResultsViewed({
        resultCount: props.resultCount,
        topCardKey: props.topCardKey,
        topBank: props.topBank,
        answers: props.answers,
      });
    } else {
      trackNoMatchViewed({ answers: props.answers });
    }
  }, [props]);

  return null;
}
