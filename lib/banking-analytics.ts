'use client';

import { getPagePath, getPageViewId } from '@/lib/affiliate-analytics';

const ENDPOINT = '/api/banking-events';

export type BankingEventType =
  | 'landing_view'
  | 'form_started'
  | 'form_completed'
  | 'recommendation_view'
  | 'recommendation_apply_click'
  | 'list_scrolled'
  | 'list_apply_click'
  | 'faq_opened'
  | 'skip_to_list_click';

interface BankingEventPayload {
  event_type: BankingEventType;
  horizon?: string;
  liquidity?: string;
  amount?: number;
  question_id?: number;
  placement?: string;
}

export function trackBankingEvent(payload: BankingEventPayload) {
  const pagePath = getPagePath();
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      page_view_id: getPageViewId(pagePath),
      page_path: pagePath,
    }),
    keepalive: true,
  }).catch(() => {
    // silent — analytics failures must never affect the user
  });
}
