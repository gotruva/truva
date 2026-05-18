/**
 * Locked finder question set — Direction B (final).
 *
 * Copy is locked per the design handoff. The ONLY intentional change from
 * `direction-b-final.jsx → QUESTIONS_FINAL` is the Q4 priority option `easy`,
 * relabelled from "Easier approval" to "Beginner-friendly card" to follow
 * Truva's plain-language trust rules (no "easier approval" promise).
 *
 * Never inline these strings in components — import from here.
 */

export type FirstAnswer = 'yes' | 'no' | 'helping';
export type IncomeAnswer = '<15' | '15-30' | '30-50' | '50-100' | '100+' | 'skip';
export type SpendAnswer =
  | 'groceries'
  | 'dining'
  | 'online'
  | 'bills'
  | 'travel'
  | 'general'
  | 'unsure';
export type PriorityAnswer = 'naf' | 'cashback' | 'points' | 'travel' | 'easy' | 'simple';
export type AvoidAnswer = 'fees' | 'income' | 'complex' | 'promo' | 'forex' | 'unsure';

export type QuestionId = 'first' | 'income' | 'spend' | 'priority' | 'avoid';

export interface QuizOption {
  id: string;
  label: string;
  /** Subtle styling for "Prefer not to say" / "I'm not sure" — no penalty. */
  subtle?: boolean;
}

export interface QuizQuestionDef {
  id: QuestionId;
  title: string;
  helper: string | null;
  options: QuizOption[];
}

export interface FinderAnswers {
  first: FirstAnswer | null;
  income: IncomeAnswer | null;
  spend: SpendAnswer | null;
  priority: PriorityAnswer | null;
  avoid: AvoidAnswer | null;
}

export const EMPTY_ANSWERS: FinderAnswers = {
  first: null,
  income: null,
  spend: null,
  priority: null,
  avoid: null,
};

export const QUESTIONS_FINAL: readonly QuizQuestionDef[] = [
  {
    id: 'first',
    title: 'Is this your first credit card?',
    helper: null,
    options: [
      { id: 'yes', label: 'Yes, this is my first card' },
      { id: 'no', label: 'No, I already have a card' },
      { id: 'helping', label: 'I’m helping someone choose' },
    ],
  },
  {
    id: 'income',
    title: 'What is your monthly income?',
    helper:
      'Rough range is fine. Banks use income as one factor when reviewing applications.',
    options: [
      { id: '<15', label: 'Below ₱15,000' },
      { id: '15-30', label: '₱15,000 – ₱29,999' },
      { id: '30-50', label: '₱30,000 – ₱49,999' },
      { id: '50-100', label: '₱50,000 – ₱99,999' },
      { id: '100+', label: '₱100,000+' },
      { id: 'skip', label: 'Prefer not to say', subtle: true },
    ],
  },
  {
    id: 'spend',
    title: 'Where do you spend most?',
    helper:
      'Pick the closest one. This helps us avoid recommending rewards you won’t use.',
    options: [
      { id: 'groceries', label: 'Groceries / daily spending' },
      { id: 'dining', label: 'Dining / food delivery' },
      { id: 'online', label: 'Online shopping' },
      { id: 'bills', label: 'Bills / subscriptions' },
      { id: 'travel', label: 'Travel' },
      { id: 'general', label: 'General spending' },
      { id: 'unsure', label: 'I’m not sure', subtle: true },
    ],
  },
  {
    id: 'priority',
    title: 'What matters most to you?',
    helper: null,
    options: [
      { id: 'naf', label: 'No yearly fee' },
      { id: 'cashback', label: 'Cashback' },
      { id: 'points', label: 'Rewards / points' },
      { id: 'travel', label: 'Travel perks' },
      // Locked-copy override: "Easier approval" -> plain-language, no promise.
      { id: 'easy', label: 'Beginner-friendly card' },
      { id: 'simple', label: 'Simple card for beginners' },
    ],
  },
  {
    id: 'avoid',
    title: 'What do you want to avoid?',
    helper: null,
    options: [
      { id: 'fees', label: 'Yearly fees' },
      { id: 'income', label: 'High income requirement' },
      { id: 'complex', label: 'Complicated rewards' },
      { id: 'promo', label: 'Promo-only value' },
      { id: 'forex', label: 'Foreign transaction fees' },
      { id: 'unsure', label: 'I’m not sure', subtle: true },
    ],
  },
] as const;

export const TOTAL_STEPS = QUESTIONS_FINAL.length;

/** Stable storage key for resume-finder (30-day TTL handled by reader). */
export const FINDER_STORAGE_KEY = 'truva.cards.lastFinderRun';
export const FINDER_STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
