/**
 * EDITORIAL STYLE GUIDE — READ BEFORE EDITING
 *
 * Voice: warm, factual, plain English. High-school reading level.
 * Rules:
 *   - Use "you" and "your" throughout
 *   - Peso amounts over percentages where possible ("₱500 back" not "0.5% cashback")
 *   - "Yearly fee" not "annual fee"; "foreign card fee" not "foreign transaction fee"
 *   - No marketing superlatives ("best", "amazing", "perfect") unless backed by data
 *   - Each `why` must be one sentence, audience-aware, grounded in real card fields
 *   - Each `pro` must be a real, verifiable benefit from the card's documented features
 *   - Each `con` must be a real trade-off (fee, narrow earn, income gate, FX) — never fabricate a weakness
 *   - If a field is unknown (null in DB), omit it — do not guess
 *
 * Keys: normalized_card_key from credit_card_listings (Supabase public view)
 * Fallback: if a key is missing here, callers should generate a generic line from
 *           the card's rewards_type + goal/spend answers — see getEditorialFor() in lib/credit-cards.ts
 */

export interface CardEditorial {
  why: string;
  pros: string[];
  cons: string[];
}

const editorial: Record<string, CardEditorial> = {
  // ── BPI ──────────────────────────────────────────────────────────────────

  'bpi amore cashback card': {
    why: 'If you spend a lot on everyday things like groceries and dining, this card quietly puts money back in your pocket every month.',
    pros: [
      'Earns cashback on everyday spending categories',
      'Accepted anywhere Mastercard or Visa is — including abroad',
      'Good starting card if you already bank with BPI',
    ],
    cons: [
      'Yearly fee details not publicly listed — confirm with BPI before applying',
      'Cashback rates may be capped or tiered per category',
    ],
  },

  'bpi amore platinum cashback card': {
    why: 'For higher spenders who want straightforward cashback without tracking points programs.',
    pros: [
      'Platinum tier means higher credit limits and more cashback potential',
      'Cashback rewards — no need to convert points or redeem manually',
      'Works worldwide wherever Mastercard or Visa is accepted',
    ],
    cons: [
      'Yearly fee of ₱5,000 — you need to spend enough to earn it back',
      'Higher income requirement typical for platinum cards',
    ],
  },

  'bpi corporate card': {
    why: 'Designed for business owners or employees who handle company expenses and want to consolidate spending.',
    pros: [
      'Points earned on business purchases',
      'Helps separate personal and business spending',
      'Backed by BPI\'s wide acceptance network',
    ],
    cons: [
      'Requires company sponsorship or business relationship with BPI',
      'Not designed for personal rewards optimization',
      'Yearly fee details not publicly listed',
    ],
  },

  'bpi edge card': {
    why: 'A solid mid-range card if you want to start earning points without paying a high yearly fee.',
    pros: [
      'Low yearly fee of ₱1,320 — easy to offset with regular spending',
      'Points earned on most purchases',
      'Good entry point into BPI\'s rewards ecosystem',
    ],
    cons: [
      'Points-to-peso conversion varies — check current redemption rates',
      'Not ideal if your primary goal is travel miles',
    ],
  },

  'bpi gold rewards card': {
    why: 'A mid-tier card suited for professionals who want rewards on their everyday and lifestyle spending.',
    pros: [
      'Gold tier — decent credit limit for regular use',
      'Yearly fee of ₱2,250 is reasonable for this card tier',
      'Accepted at millions of merchants globally',
    ],
    cons: [
      'Rewards type not fully documented — confirm earn rates with BPI directly',
      'Not a NAFFL card, so the fee must be earned back through spending',
    ],
  },

  'bpi platinum rewards card': {
    why: 'If you spend ₱20,000+ a month and want to build up points for gift cards, shopping, or travel, this card can pay for itself.',
    pros: [
      'Points earned on all purchases — online, in-store, and abroad',
      'Platinum benefits including concierge services at some merchants',
      'Wide acceptance as a Visa or Mastercard',
    ],
    cons: [
      'Yearly fee of ₱4,000 — works best if you charge most expenses to it',
      'NAFFL status not confirmed — fee may apply from year one',
      'Points programs can be complex; check if your favourite stores redeem well',
    ],
  },

  'bpi platinum rewards mastercard': {
    why: 'The Mastercard version of BPI\'s platinum rewards card — same rewards program, Mastercard acceptance everywhere.',
    pros: [
      'Points on every purchase across all spending categories',
      'Platinum card tier with higher limits',
      'Mastercard network — accepted in over 210 countries',
    ],
    cons: [
      'Yearly fee of ₱4,000 — needs consistent spending to break even',
      'Income requirement typical of platinum cards',
    ],
  },

  'bpi rewards card': {
    why: 'You never pay a yearly fee — ever — and you still earn rewards points on every purchase.',
    pros: [
      'No annual fee for life (NAFFL) — zero cost to keep the card',
      'Earns points on purchases',
      'Easy way to start building credit history without ongoing costs',
    ],
    cons: [
      'Base rewards rate is modest — not the top earner in the BPI lineup',
      'Points value depends on how you redeem (gift cards, miles, cashback)',
    ],
  },

  'bpi signature card': {
    why: 'BPI\'s signature tier with no yearly fee — you get premium benefits without the yearly cost that usually comes with this tier.',
    pros: [
      'Signature tier perks — higher limits, priority service, lounge access at select locations',
      'No annual fee for life (NAFFL)',
      'Strong prestige card for frequent travelers and high spenders',
    ],
    cons: [
      'Higher income requirement — typically ₱100,000+/month',
      'Rewards details not fully documented — verify earn rates with BPI',
    ],
  },

  'petron bpi card': {
    why: 'If you fuel up at Petron regularly, this card can give you 3% back on every fill — one of the better fuel rebates available from a PH bank.',
    pros: [
      '3% cashback at Petron stations — real peso savings on fuel',
      'No annual fee for life (NAFFL)',
      'Works as a regular credit card for all other purchases too',
    ],
    cons: [
      'Yearly fee of ₱1,550 despite NAFFL label — verify current terms',
      'Petron-specific bonus means lower value if you use other fuel brands',
      'Non-Petron spend earns at a lower base rate',
    ],
  },

  'robinsons cashback card': {
    why: 'If you shop at Robinsons malls or supermarkets often, this card gives you cashback where you already spend.',
    pros: [
      'Cashback tailored to Robinsons retail ecosystem (supermarket, mall)',
      'No annual fee for life (NAFFL)',
      'Good for people who do most of their grocery and lifestyle shopping at Robinsons',
    ],
    cons: [
      'Yearly fee of ₱2,500 despite NAFFL — confirm current terms with BPI',
      'Lower value outside of Robinsons stores',
      'Cashback rates and caps — check the current schedule before applying',
    ],
  },

  // ── HSBC ─────────────────────────────────────────────────────────────────

  'hsbc live credit card': {
    why: 'If dining and food delivery take up a big chunk of your monthly budget, the 8% cashback at restaurants is one of the highest dining rebates in the PH market right now.',
    pros: [
      '8% cashback on dining — very high rate for food spending',
      'Cashback on other everyday categories too',
      'HSBC is a globally recognized bank with strong card infrastructure',
    ],
    cons: [
      'Yearly fee details not publicly listed — confirm before applying',
      'High dining rate may have monthly or quarterly caps',
      'Best value only if dining is your primary spend category',
    ],
  },

  'hsbc red platinum mastercard': {
    why: 'If you want to earn bonus points across a wide range of spending and enjoy Mastercard\'s global acceptance, this is a solid all-rounder from HSBC.',
    pros: [
      '4x bonus points on qualifying spending categories',
      'First year free — no fee in year one, so you can try it at no cost',
      'Platinum Mastercard — widely accepted, good for travel and online purchases',
    ],
    cons: [
      'Yearly fee applies from year two — confirm the exact amount with HSBC',
      'Points programs require tracking; check which categories earn 4x vs base rate',
      'Minimum income and approval requirements typical of platinum cards',
    ],
  },
};

export default editorial;
