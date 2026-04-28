import { createSupabaseServerClient } from '@/lib/supabase';
import type { CreditCard } from '@/types';
import editorial, { type CardEditorial } from '@/lib/creditCardEditorial';
import { deriveCategoryMatch } from '@/lib/creditCardValue';
import type { SpendingCategory, GoalId } from '@/lib/creditCardValue';

const BANK_LOGO_MAP: Record<string, string> = {
  'Bank of the Philippine Islands': '/logos/bpi.svg',
  'RCBC': '/logos/rcbc.svg',
  'Rizal Commercial Banking Corporation (RCBC)': '/logos/rcbc.svg',
  'HSBC Philippines': '/logos/hsbc.svg',
};

function deriveLogo(bank: string): string {
  return BANK_LOGO_MAP[bank] ?? '/logos/default-bank.svg';
}

function attachLogo(row: Omit<CreditCard, 'logo'>): CreditCard {
  return { ...row, logo: deriveLogo(row.bank) };
}

export async function getCreditCards(): Promise<CreditCard[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('credit_card_listings')
    .select('*')
    .order('bank', { ascending: true })
    .order('card_name', { ascending: true });

  if (error) {
    console.error('getCreditCards error:', error.message);
    return [];
  }

  return (data ?? []).map(attachLogo);
}

export async function getCreditCardBySlug(slug: string): Promise<CreditCard | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('credit_card_listings')
    .select('*')
    .eq('normalized_card_key', slug)
    .maybeSingle();

  if (error) {
    console.error('getCreditCardBySlug error:', error.message);
    return null;
  }

  return data ? attachLogo(data) : null;
}

/**
 * Returns per-card editorial copy, or a generic data-driven fallback.
 * Never returns fabricated content — fallback is grounded in real DB fields.
 */
export function getEditorialFor(
  card: CreditCard,
  answers?: { goal?: GoalId; spending?: SpendingCategory },
): CardEditorial {
  const key = card.normalized_card_key;
  if (editorial[key]) return editorial[key];

  // Fallback: build a minimal-but-honest generic entry
  const goalLabel = answers?.goal
    ? { cashback: 'earning cashback', travel: 'travel and miles', 'no-annual-fee': 'avoiding a yearly fee', 'first-card': 'getting your first card', 'low-fee': 'keeping fees low' }[answers.goal]
    : 'getting value from your spending';

  const catMap = deriveCategoryMatch(card);
  const topCat = (Object.entries(catMap) as [SpendingCategory, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const topCatLabel = { groceries: 'grocery', dining: 'dining', online: 'online shopping', fuel: 'fuel', bills: 'bill payments', travel: 'travel' }[topCat];

  return {
    why: `This card suits your goal of ${goalLabel} and performs best on ${topCatLabel} spending.`,
    pros: [
      card.naffl === true ? 'No annual fee for life (NAFFL)' : card.annual_fee_recurring ? `Yearly fee of ₱${card.annual_fee_recurring.toLocaleString('en-PH')}` : 'Yearly fee — confirm with bank',
      card.rewards_type ? `Earns ${card.rewards_type} on purchases` : 'Rewards on eligible purchases',
      `Accepted wherever ${card.card_network ?? 'major networks'} is used`,
    ].filter(Boolean) as string[],
    cons: [
      card.min_income_monthly ? `Minimum monthly income of ₱${card.min_income_monthly.toLocaleString('en-PH')} required` : 'Income requirement — confirm with bank',
      card.foreign_transaction_fee_pct ? `Foreign card fee of ${card.foreign_transaction_fee_pct}% on overseas purchases` : 'Foreign card fee — confirm terms before travelling',
    ],
  };
}

export async function getCreditCardsByRubric(
  rubric: 'cashback' | 'travel' | 'grocery' | 'naffl' | 'beginner' | 'premium' | 'online'
): Promise<CreditCard[]> {
  const cards = await getCreditCards();

  const rubricFilters: Record<typeof rubric, (c: CreditCard) => boolean> = {
    cashback: (c) => c.rewards_type === 'cashback',
    travel:   (c) => c.rewards_type === 'miles' || (c.card_tier === 'signature' || c.card_tier === 'infinite'),
    grocery:  (c) => c.rewards_type === 'cashback' || c.rewards_type === 'points',
    naffl:    (c) => c.naffl === true,
    beginner: (c) => c.card_tier === 'classic' || (c.min_income_monthly !== null && c.min_income_monthly <= 20_000),
    premium:  (c) => c.card_tier === 'signature' || c.card_tier === 'infinite' || c.card_tier === 'platinum',
    online:   (c) => c.rewards_type === 'cashback' || c.rewards_type === 'points',
  };

  return cards.filter(rubricFilters[rubric]);
}
