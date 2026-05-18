'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  trackResultDetailClicked,
  trackResultsBrowseAll,
  trackResultsEditAnswers,
} from '@/lib/analytics/creditCards';
import type { ResultRole } from '@/lib/creditCardFinder/rank';

type DetailParams = {
  cardKey: string;
  bank: string;
  rank: number;
  resultRole: ResultRole;
};

type TrackProp =
  | { event: 'cc_results_edit_answers_clicked' }
  | { event: 'cc_results_browse_all_clicked' }
  | { event: 'cc_result_detail_clicked'; detail: DetailParams };

type Props = TrackProp & {
  href: string;
  className?: string;
  children: ReactNode;
};

/**
 * Link that fires a `cc_` analytics event on click. Lets server components
 * (ResultsHeader / ResultsView / ResultCard) keep tracking without becoming
 * client components themselves. Tracking is exception-safe upstream, so a
 * GA failure never blocks navigation.
 */
export function TrackedLink({ href, className, children, ...track }: Props) {
  const handleClick = () => {
    if (track.event === 'cc_result_detail_clicked') {
      trackResultDetailClicked(track.detail);
    } else if (track.event === 'cc_results_browse_all_clicked') {
      trackResultsBrowseAll();
    } else {
      trackResultsEditAnswers();
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
