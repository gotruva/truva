import type { CreditCard } from '@/types';
import type { CardEditorial } from '@/lib/creditCardEditorial';
import type { FinderAnswers, PriorityAnswer } from '@/lib/creditCardFinder/questions';
import {
  hasNoYearlyFeeConflict,
  incomeBracketMin,
  isNoYearlyFee,
  type FinderTag,
  type ResultRole,
  type ScoredSection,
} from '@/lib/creditCardFinder/rank';

export interface FinderResultExplanation {
  why: string;
  watchOut: string;
}

const PRIORITY_TAG: Record<PriorityAnswer, FinderTag> = {
  naf: 'naffl',
  cashback: 'cashback',
  points: 'points',
  travel: 'travel',
  easy: 'beginner',
  simple: 'beginner',
};

const SPEND_LABEL: Record<string, string> = {
  groceries: 'grocery',
  dining: 'dining',
  online: 'online shopping',
  bills: 'bill payment',
  travel: 'travel',
};

function cardMinIncomeMonthly(card: CreditCard): number | null {
  if (card.min_income_monthly !== null) return card.min_income_monthly;
  if (card.min_income_annual !== null) return Math.round(card.min_income_annual / 12);
  return null;
}

function hasYearlyFee(card: CreditCard): boolean {
  return !isNoYearlyFee(card) && (card.annual_fee_recurring ?? 0) > 0;
}

function formatFee(amount: number): string {
  return `PHP ${amount.toLocaleString('en-PH')}/yr`;
}

function joinReasons(reasons: string[]): string {
  const unique = [...new Set(reasons)].slice(0, 2);
  if (unique.length === 0) return '';
  if (unique.length === 1) return unique[0];
  return `${unique[0]} and ${unique[1]}`;
}

function cleanEditorialText(text: string): string {
  return text
    .replace(/\bannual fee\b/gi, (match) =>
      match[0] === 'A' ? 'Yearly fee' : 'yearly fee',
    )
    .replace(/\bBest value\b/g, 'Value is strongest')
    .replace(/\bbest value\b/g, 'value is strongest')
    .replace(/\bworks best\b/g, 'works better')
    .replace(/\s+\u2014\s+/g, ' - ')
    .trim();
}

function priorityReason(section: ScoredSection, answers: FinderAnswers): string | null {
  if (!answers.priority) return null;
  const tag = PRIORITY_TAG[answers.priority];
  if (!section.tags.includes(tag)) return null;

  switch (answers.priority) {
    case 'naf':
      return isNoYearlyFee(section.card)
        ? 'it matches your no-yearly-fee priority'
        : null;
    case 'cashback':
      return 'it matches your cashback priority';
    case 'points':
      return 'it matches your points priority';
    case 'travel':
      return 'it matches your travel priority';
    case 'easy':
    case 'simple':
      return 'it has first-card friendly signals';
    default:
      return null;
  }
}

function spendReason(section: ScoredSection, answers: FinderAnswers): string | null {
  if (!answers.spend || answers.spend === 'general' || answers.spend === 'unsure') {
    return null;
  }
  if (!section.spendingCategories.includes(answers.spend)) return null;
  return `it lines up with your ${SPEND_LABEL[answers.spend] ?? answers.spend} spending`;
}

function incomeReason(section: ScoredSection, answers: FinderAnswers): string | null {
  const bracketMin = incomeBracketMin(answers.income);
  const cardMin = cardMinIncomeMonthly(section.card);
  if (bracketMin === null || cardMin === null || section.card.income_filter_ready === false) {
    return null;
  }
  if (bracketMin >= cardMin) {
    return 'the listed income requirement fits your shared range';
  }
  return null;
}

function avoidReason(section: ScoredSection, answers: FinderAnswers): string | null {
  const { card } = section;
  switch (answers.avoid) {
    case 'fees':
      return isNoYearlyFee(card) ? 'it helps avoid yearly fees' : null;
    case 'income': {
      const cardMin = cardMinIncomeMonthly(card);
      return cardMin !== null && cardMin <= 30_000
        ? 'the published income requirement is on the lower side'
        : null;
    }
    case 'complex':
      return card.rewards_type === 'cashback' || isNoYearlyFee(card)
        ? 'the setup is simpler to compare'
        : null;
    case 'forex':
      return card.badge_inputs?.low_fx_fee === true ||
        (card.foreign_transaction_fee_pct !== null &&
          card.foreign_transaction_fee_pct <= 1.85)
        ? 'it has a lower foreign card fee signal'
        : null;
    default:
      return null;
  }
}

function firstCardReason(section: ScoredSection, answers: FinderAnswers): string | null {
  if (answers.first !== 'yes' || !section.tags.includes('beginner')) return null;
  return 'it has first-card friendly signals';
}

function buildWhyReasons(section: ScoredSection, answers: FinderAnswers): string[] {
  return [
    priorityReason(section, answers),
    spendReason(section, answers),
    incomeReason(section, answers),
    firstCardReason(section, answers),
    avoidReason(section, answers),
  ].filter((reason): reason is string => Boolean(reason));
}

function fallbackWhyForRole(role: ResultRole, card: CreditCard): string {
  switch (role) {
    case 'first':
      return 'This is the closest fit in your results based on the card details Truva has today.';
    case 'no-fee':
      return isNoYearlyFee(card)
        ? 'This gives you a no-yearly-fee option to compare with your closest fit.'
        : 'This gives you another option to compare with your closest fit.';
    case 'worth':
      return 'This is worth checking as another comparison point based on available card details.';
    default:
      return 'This may fit based on the card details Truva has today.';
  }
}

export function generateWhyThisFitsYou(
  section: ScoredSection,
  answers: FinderAnswers,
  editorial: CardEditorial,
): string {
  const reasonText = joinReasons(buildWhyReasons(section, answers));
  if (!reasonText) {
    if (hasNoYearlyFeeConflict(section.card)) {
      return fallbackWhyForRole(section.role, section.card);
    }
    return editorial.why
      ? cleanEditorialText(editorial.why)
      : fallbackWhyForRole(section.role, section.card);
  }

  switch (section.role) {
    case 'first':
      return `This is the closest fit in your results because ${reasonText}.`;
    case 'no-fee':
      if (isNoYearlyFee(section.card)) {
        return `This gives you a no-yearly-fee option because ${reasonText}.`;
      }
      return `This gives you another option to compare because ${reasonText}.`;
    case 'worth':
      return `This is worth checking because ${reasonText}.`;
    default:
      return `This may fit because ${reasonText}.`;
  }
}

function watchOutForAvoid(card: CreditCard, answers: FinderAnswers): string | null {
  switch (answers.avoid) {
    case 'fees':
      if (hasNoYearlyFeeConflict(card) && card.annual_fee_recurring !== null) {
        return `You wanted to avoid yearly fees, but this card has mixed fee data. Truva has a no-fee signal and a ${formatFee(card.annual_fee_recurring)} listed fee, so confirm with the bank.`;
      }
      if (hasYearlyFee(card) && card.annual_fee_recurring !== null) {
        return `You wanted to avoid yearly fees. This card lists a ${formatFee(card.annual_fee_recurring)} fee, so check if the rewards are worth that cost.`;
      }
      return null;
    case 'forex':
      if (
        card.badge_inputs?.high_fx_fee === true ||
        (card.foreign_transaction_fee_pct !== null &&
          card.foreign_transaction_fee_pct >= 2.75)
      ) {
        return 'You wanted to avoid foreign card fees. This card may cost more on overseas or non-PHP spend.';
      }
      return null;
    case 'complex':
      if (card.badge_inputs?.narrow_mcc === true) {
        return 'You wanted simpler rewards. This card may need category tracking, so check which purchases count.';
      }
      if (card.rewards_type === 'miles' || card.rewards_type === 'points') {
        return 'You wanted simpler rewards. Points or miles can take more tracking than straightforward cashback.';
      }
      return null;
    case 'promo':
      if (card.active_promo_count >= 3) {
        return 'You wanted to avoid promo-only value. Check the regular fees and rewards too, because promos can change.';
      }
      return null;
    case 'income': {
      const cardMin = cardMinIncomeMonthly(card);
      if (cardMin !== null && cardMin > 30_000) {
        return 'You wanted to avoid high income requirements. Confirm the listed income requirement before applying.';
      }
      return null;
    }
    default:
      return null;
  }
}

function pickEditorialCon(
  cons: string[],
  answers: FinderAnswers,
  role: ResultRole,
): string | null {
  if (cons.length === 0) return null;

  const keywordGroups: string[][] = [];
  if (answers.avoid === 'fees') keywordGroups.push(['fee', 'yearly', 'annual']);
  if (answers.avoid === 'forex' || answers.spend === 'travel') {
    keywordGroups.push(['foreign', 'overseas', 'travel']);
  }
  if (answers.avoid === 'complex') {
    keywordGroups.push(['points', 'miles', 'complex', 'category', 'cap', 'redeem']);
  }
  if (answers.avoid === 'income' || answers.first === 'yes') {
    keywordGroups.push(['income', 'requirement', 'fee', 'points']);
  }
  if (role === 'worth') {
    keywordGroups.push(['fee', 'cap', 'condition', 'points', 'income']);
  }

  const found = keywordGroups
    .flatMap((group) =>
      cons.filter((con) => group.some((keyword) => con.toLowerCase().includes(keyword))),
    )
    .at(0);

  return cleanEditorialText(found ?? cons[0]);
}

function factBasedWatchOut(card: CreditCard): string {
  if (hasNoYearlyFeeConflict(card) && card.annual_fee_recurring !== null) {
    return `Fee data is mixed for this card. Truva has a no-fee signal and a ${formatFee(card.annual_fee_recurring)} listed fee, so confirm with the bank.`;
  }
  if (
    card.badge_inputs?.high_fx_fee === true ||
    (card.foreign_transaction_fee_pct !== null &&
      card.foreign_transaction_fee_pct >= 2.75)
  ) {
    return 'Higher foreign card fee may cost more on overseas or non-PHP spend.';
  }
  if (card.badge_inputs?.earn_cap === true) {
    return 'Rewards have a monthly or yearly earn cap, so value is limited past the cap.';
  }
  if (card.badge_inputs?.narrow_mcc === true) {
    return 'Bonus rewards may apply only to narrow spending categories. Check which purchases count.';
  }
  if (hasYearlyFee(card) && card.annual_fee_recurring !== null) {
    return `This card lists a ${formatFee(card.annual_fee_recurring)} yearly fee, so check if the rewards are worth that cost.`;
  }
  return 'Some details are not clearly published by the bank. Confirm the terms before you apply.';
}

export function generateWatchOut(
  section: ScoredSection,
  answers: FinderAnswers,
  editorial: CardEditorial,
): string {
  return (
    watchOutForAvoid(section.card, answers) ??
    (hasNoYearlyFeeConflict(section.card) ? factBasedWatchOut(section.card) : null) ??
    pickEditorialCon(editorial.cons, answers, section.role) ??
    factBasedWatchOut(section.card)
  );
}

export function explainFinderResult(
  section: ScoredSection,
  answers: FinderAnswers,
  editorial: CardEditorial,
): FinderResultExplanation {
  return {
    why: generateWhyThisFitsYou(section, answers, editorial),
    watchOut: generateWatchOut(section, answers, editorial),
  };
}
