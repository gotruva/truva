'use client';

import { useEffect, useRef } from 'react';
import { trackDetailViewed, type SourcePage } from '@/lib/analytics/creditCards';

interface Props {
  cardKey: string;
  bank: string;
  sourcePage: SourcePage;
}

/**
 * Render-fire tracker for the credit-card detail/review page. Renders nothing.
 * useRef guard prevents React Strict Mode double-counting. Lets the server
 * review page stay a server component.
 */
export function DetailAnalytics({ cardKey, bank, sourcePage }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackDetailViewed({ cardKey, bank, sourcePage });
  }, [cardKey, bank, sourcePage]);

  return null;
}
