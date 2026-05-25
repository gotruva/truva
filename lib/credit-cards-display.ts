import type { CreditCard } from '@/types';

const CORPORATE_NAME_PATTERN = /(corporate|business|commercial)/i;

/**
 * Conservative v1 filter to keep obvious corporate / business cards off the
 * consumer catalog. CreditCard has no consumer/segment field today, so we look
 * only at `card_name` — never `bank` (avoids false-positives like
 * "Security Bank") and never tier/network strings.
 */
export function isLikelyConsumerCard(card: CreditCard): boolean {
  return !CORPORATE_NAME_PATTERN.test(card.card_name ?? '');
}
