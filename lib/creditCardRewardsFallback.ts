/**
 * Client-side fallback registry for credit card rewards.
 * 
 * Provides verified standard rewards formulas and types for cards that currently
 * have missing or null reward data in the scraping pipeline. 
 * If the scraping database is updated later, the data fetching pipeline will 
 * automatically prioritize the database values (if they are populated), making this 
 * solution highly forward-compatible and scalable.
 */

export interface FallbackReward {
  rewards_type: 'cashback' | 'points' | 'miles' | null;
  rewards_formula: {
    earn_rate: number;
    earn_unit: string;
    redeem_rate?: number | null;
    redeem_unit?: string | null;
  } | null;
}

export const REWARDS_FALLBACK_REGISTRY: Record<string, FallbackReward> = {
  // Asia United Bank (AUB)
  'aub gold mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 20 spend' },
  },

  // Bank of the Philippine Islands (BPI)
  'bpi amore cashback card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 4, earn_unit: 'percent on groceries' },
  },
  'bpi amore platinum cashback card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 4, earn_unit: 'percent on dining' },
  },
  'bpi corporate card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 35 spend' },
  },
  'bpi edge card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'BPI Rewards Point per Php 20 spend' },
  },
  'bpi gold rewards card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'BPI Rewards Point per Php 35 spend' },
  },
  'bpi platinum rewards mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 2, earn_unit: 'BPI Rewards Points per Php 30 local spend' },
  },
  'bpi signature card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 2, earn_unit: 'BPI Rewards Points per Php 20 spend' },
  },
  'petron bpi card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 3, earn_unit: '% fuel rebate' },
  },
  'robinsons cashback card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 3, earn_unit: 'percent on groceries at Robinsons' },
  },

  // American Express
  'american express cashback credit card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 1, earn_unit: 'percent cashback on local spend' },
  },
  'american express explorer credit card': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'mile per Php 40 spend' },
  },
  'american express platinum credit card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Membership Rewards point per Php 45 spend' },
  },
  'blue from american express': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Membership Rewards point per Php 45 spend' },
  },

  // BDO Unibank
  'bdo diamond unionpay credit card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo diners club international credit card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo diners club premiere credit card': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'mile per Php 30 spend' },
  },
  'bdo gold mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo gold unionpay credit card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo installment card': {
    rewards_type: null,
    rewards_formula: null,
  },
  'bdo jcb gold': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo jcb lucky cat': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo jcb platinum': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo platinum mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 40 spend' },
  },
  'bdo secured credit card': {
    rewards_type: null,
    rewards_formula: null,
  },
  'bdo standard mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo visa classic': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo visa gold': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo visa platinum': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 40 spend' },
  },
  'bdo visa signature': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 50 spend' },
  },
  'bdo world elite mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 40 spend' },
  },

  // China Banking Corporation (Chinabank)
  'chinabank home visa platinum': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 1, earn_unit: 'percent cashback on online purchases' },
  },
  'chinabank cash rewards mastercard': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 6, earn_unit: 'percent cashback on dining and groceries' },
  },
  'chinabank destinations platinum mastercard': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'Destination Mile per Php 30 spend' },
  },
  'chinabank destinations world dollar mastercard': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'Destination Mile per USD 1 spend' },
  },
  'chinabank destinations world mastercard': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'Destination Mile per Php 30 spend' },
  },
  'chinabank freedom mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Rewards Point per Php 20 spend' },
  },

  // Equicom Savings Bank
  'equicom gold credit card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Key Point per Php 30 spend' },
  },

  // HSBC
  'hsbc live credit card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 8, earn_unit: 'percent on dining' },
  },
  'hsbc live plus credit card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 8, earn_unit: 'percent on dining' },
  },
};
