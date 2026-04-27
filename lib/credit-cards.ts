import { createSupabaseServerClient } from '@/lib/supabase';
import type { CreditCard } from '@/types';

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
