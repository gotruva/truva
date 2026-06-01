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
  annual_fee_recurring?: number | null;
  naffl?: boolean | null;
  annual_fee_waiver_condition?: string | null;
  annual_fee_waiver_threshold?: number | null;
  min_income_monthly?: number | null;
  foreign_transaction_fee_pct?: number | null;
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
    annual_fee_recurring: 2050,
    naffl: false,
    min_income_monthly: 15000,
    foreign_transaction_fee_pct: 1.85,
  },
  'bpi amore platinum cashback card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 4, earn_unit: 'percent on dining' },
    annual_fee_recurring: 5000,
    naffl: false,
    min_income_monthly: 83333,
    foreign_transaction_fee_pct: 1.85,
  },
  'bpi corporate card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'point per Php 35 spend' },
    annual_fee_recurring: 1700,
    naffl: false,
    min_income_monthly: null,
    foreign_transaction_fee_pct: 1.85,
  },
  'bpi edge card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'BPI Rewards Point per Php 20 spend' },
    annual_fee_recurring: 1320,
    naffl: false,
    min_income_monthly: 15000,
    foreign_transaction_fee_pct: 1.85,
  },
  'bpi gold rewards card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'BPI Rewards Point per Php 35 spend' },
    annual_fee_recurring: 2250,
    naffl: false,
    min_income_monthly: 40000,
    foreign_transaction_fee_pct: 1.85,
  },
  'bpi platinum rewards mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 2, earn_unit: 'BPI Rewards Points per Php 30 local spend' },
    annual_fee_recurring: 4000,
    naffl: false,
    min_income_monthly: 80000,
    foreign_transaction_fee_pct: 1.85,
  },
  'bpi signature card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 2, earn_unit: 'BPI Rewards Points per Php 20 spend' },
    annual_fee_recurring: 5500,
    naffl: false,
    min_income_monthly: 100000,
    foreign_transaction_fee_pct: 1.85,
  },
  'petron bpi card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 3, earn_unit: '% fuel rebate' },
    annual_fee_recurring: 1550,
    naffl: false,
    min_income_monthly: 15000,
    foreign_transaction_fee_pct: 1.85,
  },
  'robinsons cashback card': {
    rewards_type: 'cashback',
    rewards_formula: { earn_rate: 3, earn_unit: 'percent on groceries at Robinsons' },
    annual_fee_recurring: 2500,
    naffl: false,
    min_income_monthly: 15000,
    foreign_transaction_fee_pct: 1.85,
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
    annual_fee_recurring: 1800,
    naffl: false,
    min_income_monthly: 15000,
    foreign_transaction_fee_pct: 2.50,
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
    rewards_formula: { earn_rate: 0, earn_unit: 'No rewards program listed by the bank' },
    annual_fee_recurring: 1000,
    naffl: false,
    min_income_monthly: 15000,
    foreign_transaction_fee_pct: 2.50,
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
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Peso Point per Php 50 spend' },
    annual_fee_recurring: 1000,
    naffl: false,
    min_income_monthly: 0,
    foreign_transaction_fee_pct: 2.50,
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
    annual_fee_recurring: 85000,
    naffl: false,
    min_income_monthly: null,
    foreign_transaction_fee_pct: 2.50,
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
    annual_fee_waiver_condition: 'Rewards points can be converted to annual membership fee waiver.',
  },
  'chinabank destinations world dollar mastercard': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'Destination Mile per USD 1 spend' },
    annual_fee_waiver_condition: 'Rewards points can be converted to annual membership fee waiver.',
  },
  'chinabank destinations world mastercard': {
    rewards_type: 'miles',
    rewards_formula: { earn_rate: 1, earn_unit: 'Destination Mile per Php 30 spend' },
    annual_fee_waiver_condition: 'Rewards points can be converted to annual membership fee waiver.',
  },
  'chinabank freedom mastercard': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Rewards Point per Php 20 spend' },
  },

  // EastWest
  'eastwest everyday titanium mastercard': {
    rewards_type: 'cashback',
    rewards_formula: {
      earn_rate: 5,
      earn_unit:
        'percent cash rebate on supermarket, drugstore, and gas purchases after Php 10,000 non-essential spend in a statement period',
    },
  },
  'eastwest platinum mastercard': {
    rewards_type: 'points',
    rewards_formula: {
      earn_rate: 1,
      earn_unit: 'Platinum Rewards Point per Php 40 spend',
    },
  },

  // Equicom Savings Bank
  'equicom gold credit card': {
    rewards_type: 'points',
    rewards_formula: { earn_rate: 1, earn_unit: 'Key Point per Php 300 spend' },
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

  // Metrobank
  'metrobank cashback visa': {
    rewards_type: 'cashback',
    rewards_formula: {
      earn_rate: 5,
      earn_unit:
        'percent rebate on groceries, telecom, school, and bookstore spend; 0.2 percent on other spend',
    },
  },
  'metrobank rewards plus visa': {
    rewards_type: 'points',
    rewards_formula: {
      earn_rate: 1,
      earn_unit:
        'point per Php 20 spend; double points on gadgets, internet, and online spend',
    },
  },

  // Security Bank
  'security bank wave mastercard': {
    rewards_type: 'cashback',
    rewards_formula: {
      earn_rate: 1,
      earn_unit: 'percent cashback on online spend, capped at Php 3,000 per year',
    },
  },
};
