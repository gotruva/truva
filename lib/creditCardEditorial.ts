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

import { deriveCategoryMatch } from '@/lib/creditCardValue';
import type { SpendingCategory, GoalId } from '@/lib/creditCardValue';
import type { CreditCard } from '@/types';

export interface CardEditorial {
  why: string;
  targetUser?: string;
  valueAdd?: string;
  welcomePromo?: string;
  pros: string[];
  cons: string[];
}

/**
 * Verified bank-level promotions / T&C hub URLs.
 * These are the canonical pages where users can read the current terms
 * for welcome offers — independently verified May 2026.
 * Do NOT use card source_url for this purpose (that is the apply/product page).
 */
export const BANK_PROMO_TC_URL: Record<string, string> = {
  'HSBC Philippines': 'https://www.hsbc.com.ph/credit-cards/promotions/',
  'Bank of the Philippine Islands': 'https://www.bpi.com.ph/personal/rewards-and-promotions/promos',
  'Bank of the Philippine Islands (BPI)': 'https://www.bpi.com.ph/personal/rewards-and-promotions/promos',
  'BDO Unibank, Inc.': 'https://www.deals.bdo.com.ph',
  'China Banking Corporation (Chinabank)': 'https://www.chinabank.ph/credit-cards',
  'Asia United Bank': 'https://www.aub.com.ph/creditcards/no-annual-fee',
  'East West Banking Corporation': 'https://www.eastwestbanker.com/promos',
  'Metrobank': 'https://www.metrobank.com.ph/promos',
  'Metrobank Card Corporation': 'https://www.metrobank.com.ph/promos',
  'Metropolitan Bank & Trust Company': 'https://www.metrobank.com.ph/promos',
  'Metropolitan Bank and Trust Company': 'https://www.metrobank.com.ph/promos',
  'Equicom Savings Bank': 'https://www.equicomsavings.com/product-and-services/card-products/',
  'Rizal Commercial Banking Corporation': 'https://rcbccredit.com/promos/welcomegifts',
};

const BPI_BACK_TO_BACK_PERKS_URL = 'https://www.bpi.com.ph/personal/rewards-and-promotions/promos/back-to-back-perks';

export const CARD_PROMO_TC_URL: Record<string, string> = {
  'petron_bpi_card': BPI_BACK_TO_BACK_PERKS_URL,
  'bpi_rewards_card': BPI_BACK_TO_BACK_PERKS_URL,
  'bpi_gold_rewards_card': BPI_BACK_TO_BACK_PERKS_URL,
  'bpi_amore_cashback_card': BPI_BACK_TO_BACK_PERKS_URL,
  'bpi_platinum_rewards_mastercard': BPI_BACK_TO_BACK_PERKS_URL,
  'bpi_signature_card': BPI_BACK_TO_BACK_PERKS_URL,
  'bdo_visa_classic': 'https://www.bdo.com.ph/personal/cards/credit-cards/visa/classic',
  'bdo_visa_gold': 'https://www.bdo.com.ph/personal/cards/credit-cards/visa/gold',
  'bdo_visa_platinum': 'https://www.bdo.com.ph/personal/cards/credit-cards/visa/platinum',
  'bdo_visa_signature': 'https://www.bdo.com.ph/personal/cards/credit-cards/visa/signature',
  'bdo_standard_mastercard': 'https://www.bdo.com.ph/personal/cards/credit-cards/mastercard/standard',
  'bdo_gold_mastercard': 'https://www.bdo.com.ph/personal/cards/credit-cards/mastercard/gold',
  'bdo_platinum_mastercard': 'https://www.bdo.com.ph/personal/cards/credit-cards/mastercard/platinum',
  'bdo_world_elite_mastercard': 'https://www.bdo.com.ph/personal/cards/credit-cards/mastercard/world-elite',
  'bdo_secured_credit_card': 'https://www.bdo.com.ph/personal/cards/credit-cards/secured-credit-card',
  'bdo_jcb_lucky_cat': 'https://www.bdo.com.ph/personal/cards/credit-cards/jcb/lucky-cat',
  'bdo_jcb_gold': 'https://www.bdo.com.ph/personal/cards/credit-cards/jcb/gold',
  'bdo_jcb_platinum': 'https://www.bdo.com.ph/personal/cards/credit-cards/jcb/platinum',
  'bdo_diners_club_international': 'https://www.bdo.com.ph/personal/cards/credit-cards/diners-club/international',
  'bdo_diners_club_premiere': 'https://www.bdo.com.ph/personal/cards/credit-cards/diners-club/premiere',
  'bdo_diamond_unionpay': 'https://www.bdo.com.ph/personal/cards/credit-cards/unionpay/diamond',
  'bdo_gold_unionpay': 'https://www.bdo.com.ph/personal/cards/credit-cards/unionpay/gold',
  'bdo_american_express_cashback_credit_card': 'https://www.bdo.com.ph/personal/cards/credit-cards/american-express',
  'bdo_american_express_explorer_credit_card': 'https://www.bdo.com.ph/personal/cards/credit-cards/american-express',
  'bdo_american_express_platinum_credit_card': 'https://www.bdo.com.ph/personal/cards/credit-cards/american-express',
  'bdo_blue_from_american_express': 'https://www.bdo.com.ph/personal/cards/credit-cards/american-express',
  'chinabank_freedom_mastercard': 'https://www.chinabank.ph/credit-cards-freedom',
  'chinabank_cash_rewards_mastercard': 'https://www.chinabank.ph/credit-cards-cash-rewards',
  'chinabank_athome_visa_platinum': 'https://www.chinabank.ph/credit-cards-at-home-visa-platinum',
  'chinabank_destinations_platinum_mastercard': 'https://www.chinabank.ph/credit-cards-destinations-platinum',
  'chinabank_destinations_world_dollar_mastercard': 'https://www.chinabank.ph/credit-cards-destinations-world-dollar',
  'chinabank_destinations_world_mastercard': 'https://www.chinabank.ph/credit-cards-destinations-world',
  'aub_gold_mastercard': 'https://online.aub.ph/creditcards/goldandplatinum',
  'equicom_gold_credit_card': 'https://www.equicomsavings.com/product-and-services/card-products/',
  'm_free_credit_card': 'https://www.metrobank.com.ph/personal/cards/credit-cards/mfree',
  'metrobank_titanium_mastercard': 'https://www.metrobank.com.ph/promos/mastercard-welcome-gift-2026',
  'metrobank_travel_signature_visa': 'https://www.metrobank.com.ph/promos/unlock-free-worldwide-lounge-access',
  'metrobank_platinum_mastercard': 'https://www.metrobank.com.ph/promos/unlock-free-worldwide-lounge-access',
  'metrobank_world_mastercard': 'https://www.metrobank.com.ph/promos',
  'rcbc_flex_visa': 'https://rcbccredit.com/promos/welcomegifts',
  'rcbc_black_card_platinum_mastercard': 'https://rcbccredit.com/promos/welcomegifts',
  'rcbc_classic_mastercard': 'https://rcbccredit.com/promos/welcomegifts',
  'rcbc_gold_mastercard': 'https://rcbccredit.com/promos/welcomegifts',
  'rcbc_diamond_card_platinum_mastercard': 'https://rcbccredit.com/promos/welcomegifts',
  'rcbc_airmiles_visa_signature': 'https://rcbccredit.com/promos/welcome-gift-up-to-15-000-signature-airmiles-3466',
};

/**
 * Returns the verified promotions/T&C hub URL for the given bank name.
 * Falls back to a generic search URL if the bank is not in our map.
 * Use this instead of card.source_url for welcome promo T&C links.
 */
export function getPromoTCUrlFor(bank: string, key?: string): string {
  if (key && CARD_PROMO_TC_URL[key]) {
    return CARD_PROMO_TC_URL[key];
  }
  return BANK_PROMO_TC_URL[bank] ?? `https://www.google.com/search?q=${encodeURIComponent(bank + ' credit card welcome promo terms Philippines')}`;
}

const editorial: Record<string, CardEditorial> = {
  // ── Asia United Bank ──────────────────────────────────────────────────────

  'aub_gold_mastercard': {
    why: 'This card helps you build your credit profile with zero yearly fees and a lower ongoing cost.',
    targetUser: 'Suited for everyday buyers who want a straightforward card without worrying about recurring ownership costs.',
    valueAdd: 'Its unique benefit is having no yearly fee for life without any minimum spending rules.',
    pros: [
      'No yearly fee for life means you never pay to keep the card active.',
      'Low foreign card fee of 1.50% makes buying items from overseas websites cheaper.',
      'Gives you the freedom to choose your own monthly due date to match your pay day.',
    ],
    cons: [
      'Requires a minimum monthly income of ₱50,000 to apply.',
      'Rewards program earns points slowly with only 1 point for every ₱20 spent.',
      'Cash advance option charges high fees if you need quick emergency cash.',
    ],
  },

  // ── American Express ─────────────────────────────────────────────────────

  'bdo_american_express_cashback_credit_card': {
    why: 'This card gives you cash back on every purchase which helps you stretch your family budget further.',
    targetUser: 'Suited for shoppers who want automatic savings on their daily local and overseas spending.',
    valueAdd: 'Its unique benefit is giving you a high 2% cashback when you spend money overseas.',
    pros: [
      'Gives you 1% cashback on all local purchases to lower your daily costs.',
      'Earns 2% cashback on all overseas spending to save you money when traveling.',
      'Monthly fee is waived any month you spend at least ₱15,000, and the first year is free.',
    ],
    cons: [
      'Charges a ₱250 monthly fee (₱3,000 a year) for any month you spend less than ₱15,000.',
      'Requires a minimum monthly income of ₱33,000 to apply.',
      'Charges a foreign card fee of 2.50% which eats into your overseas cashback.',
    ],
  },

  'bdo_american_express_explorer_credit_card': {
    why: 'This card helps you earn travel miles quickly so you can explore new places with your loved ones.',
    targetUser: 'Suited for frequent travelers who want to turn their daily expenses into free flights.',
    valueAdd: 'Its unique benefit is a highly competitive mile earn rate of 1 mile for every ₱40 spent.',
    pros: [
      'Earns 1 mile for every ₱40 spent which is faster than many travel cards.',
      'Travel points do not expire so you can save them for future family trips.',
      'Foreign card fee is relatively low at 1.85% for international travel purchases.',
    ],
    cons: [
      'Has a yearly fee of ₱4,000 which you must pay unless you spend ₱450,000 a year.',
      'Requires a minimum monthly income of ₱66,000 to apply.',
      'American Express is accepted at fewer local stores compared to Visa or Mastercard.',
    ],
  },

  'bdo_american_express_platinum_credit_card': {
    why: 'This card provides premium travel comforts and purchase protection when traveling abroad.',
    targetUser: 'Suited for high earners who value airport lounge access and strong travel insurance coverage.',
    valueAdd: 'Its unique benefit is providing automatic yearly fee waivers if you spend at least ₱600,000 a year.',
    pros: [
      'Includes free access to select airport lounges to make your travel more comfortable.',
      'Offers free travel inconvenience protection and medical insurance during trips.',
      'Foreign card fee is competitive at 1.85% for overseas shopping.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,000 that is billed monthly or yearly.',
      'Requires a high minimum monthly income of ₱93,000 to apply.',
      'American Express cards are not accepted by some smaller local merchants.',
    ],
  },

  'bdo_blue_from_american_express': {
    why: 'This card helps young professionals start their rewards journey with a trusted global brand.',
    targetUser: 'Suited for first-time cardholders who want basic rewards and flexible payment terms.',
    valueAdd: 'Its unique benefit is BDO\'s entry-level American Express option with a low income requirement of ₱15,000.',
    pros: [
      'Earns points on all purchases that you can exchange for gift certificates or cash.',
      'Requires a very accessible minimum monthly income of ₱15,000 to apply.',
      'Gives you access to exclusive dining and shopping discounts through BDO partners.',
    ],
    cons: [
      'Has a yearly fee of ₱1,800 that you must pay to keep the card active.',
      'High foreign card fee of 2.50% makes buying from international sites expensive.',
      'Points accumulate slowly with 1 point earned for every ₱45 spent.',
    ],
  },

  // ── BDO ──────────────────────────────────────────────────────────────────

  'bdo_diamond_unionpay': {
    why: 'This card offers an exceptionally low cost for international spending to give you true value on your global adventures.',
    targetUser: 'Suited for frequent travelers to China and other parts of Asia who want to minimize exchange fees.',
    valueAdd: 'Its unique benefit is an extremely low foreign card fee of 0.85%, keeping international shopping cheap.',
    pros: [
      'Charges an exceptionally low foreign card fee of 0.85% on overseas purchases.',
      'Includes free airport lounge visits and premium travel insurance coverage.',
      'Yearly fee is waived for the first three years of card membership.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,000 starting from the fourth year.',
      'Requires a high minimum monthly income of ₱93,000 to apply.',
      'UnionPay network is not as widely accepted in some local Philippine stores as Visa.',
    ],
  },

  'bdo_diners_club_international': {
    why: 'This card gives you access to a global network of airport lounges to make your journeys more restful.',
    targetUser: 'Suited for moderate travelers who want lounge access without paying the highest premium fees.',
    valueAdd: 'Its unique benefit is giving you access to over 1,300 airport lounges worldwide.',
    pros: [
      'Provides entry to Diners Club airport lounges globally to help you relax before flights.',
      'Earns rewards points on all purchases that you can use to pay off fees.',
      'Foreign card fee of 1.50% is lower than the typical 2.50% bank standard.',
    ],
    cons: [
      'Has a yearly fee of ₱2,400 which requires consistent spending to justify.',
      'Requires a minimum monthly income of ₱33,000 to apply.',
      'Diners Club cards have limited acceptance among smaller local shops in the Philippines.',
    ],
  },

  'bdo_diners_club_premiere': {
    why: 'This card accelerates your travel miles earning so you can take your dream vacations sooner.',
    targetUser: 'Suited for frequent flyers who want premium lounge access and fast miles accumulation.',
    valueAdd: 'Its unique benefit is a low foreign card fee of 0.85% combined with excellent miles rewards.',
    pros: [
      'Earns 1 travel mile for every ₱30 spent to help you claim flights faster.',
      'Charges a low foreign card fee of 0.85% when you buy things overseas.',
      'Includes free airport lounge access and double miles on select spend categories.',
    ],
    cons: [
      'Has a high yearly fee of ₱4,500 that you must budget for annually.',
      'Requires a minimum monthly income of ₱77,000 to apply.',
      'Diners Club network can be difficult to use at smaller supermarkets and restaurants locally.',
    ],
  },

  'bdo_gold_mastercard': {
    why: 'This card balances everyday spending power with security features to protect your daily family purchases.',
    targetUser: 'Suited for mid-income earners who want a reliable card for shopping and travel insurance.',
    valueAdd: 'Its unique benefit is a competitive 1.50% foreign card fee, which is lower than standard gold cards.',
    pros: [
      'Foreign card fee of 1.50% keeps international online shopping more affordable.',
      'Includes free travel accident insurance when you purchase travel tickets with the card.',
      'Gives you access to BDO\'s easy installment plans for big purchases.',
    ],
    cons: [
      'Has a yearly fee of ₱2,400 which you must pay to keep using the card.',
      'Requires a minimum monthly income of ₱33,000 to apply.',
      'Rewards points accumulate slowly with 1 point for every ₱50 spent.',
    ],
  },

  'bdo_gold_unionpay': {
    why: 'This card provides secure payments and special dining privileges across Asian destinations.',
    targetUser: 'Suited for travelers who frequently visit Asian countries and want to save on international fees.',
    valueAdd: 'Its unique benefit is a low 1.50% foreign card fee and a free yearly membership fee for your first three years.',
    pros: [
      'Charges a low foreign card fee of 1.50% on all overseas spending.',
      'No yearly fee to pay for the first three years of using the card.',
      'Earns points that can be redeemed for shopping vouchers or cash credits.',
    ],
    cons: [
      'Has a yearly fee of ₱3,000 starting from the fourth year.',
      'Requires a minimum monthly income of ₱33,000 to apply.',
      'UnionPay network has lower merchant acceptance in standard Philippine provinces.',
    ],
  },

  'bdo_installment_card': {
    why: 'This card gives you a reliable way to pay for big family expenses in small, manageable monthly chunks.',
    targetUser: 'Suited for budget-conscious buyers who want to pay for appliances or emergency costs over time.',
    valueAdd: 'Its unique benefit is offering fixed, low-interest installment terms instead of standard credit card debt.',
    pros: [
      'Converts your credit limit into cash easily to cover emergency family expenses.',
      'Offers lower interest rates on installment plans compared to standard card finance charges.',
      'Has a low yearly fee of ₱1,000 which makes it affordable to keep in your wallet.',
    ],
    cons: [
      'Does not earn any rewards points or cashback on your spending.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Carrying a balance can lead to high interest costs if you do not pay the installments on time.',
    ],
  },

  'bdo_jcb_gold': {
    why: 'This card offers exclusive dining deals and airport lounge access in Japan to make your trips more memorable.',
    targetUser: 'Suited for people who love traveling to Japan and enjoy dining discounts.',
    valueAdd: 'Its unique benefit is providing free access to select airport lounges across Japan and Hawaii.',
    pros: [
      'Gives you free access to JCB airport lounges in Japan, Hawaii, and other Asian hubs.',
      'Low foreign card fee of 1.50% keeps overseas transactions cheaper.',
      'Offers special discounts at major Japanese restaurants and shopping outlets.',
    ],
    cons: [
      'Has a yearly fee of ₱2,400 that you need to spend enough to make worthwhile.',
      'Requires a minimum monthly income of ₱33,000 to apply.',
      'JCB card acceptance is more limited in standard local Philippine retail outlets.',
    ],
  },

  'bdo_jcb_lucky_cat': {
    why: 'This card is a friendly starter option that lets you earn points while building a healthy financial history.',
    targetUser: 'Suited for younger shoppers getting their first credit card who love cute designs and basic rewards.',
    valueAdd: 'Its unique benefit is BDO\'s entry-level JCB card with an accessible ₱15,000 income gate.',
    pros: [
      'Requires an accessible minimum monthly income of only ₱15,000 to apply.',
      'Charges a lower foreign card fee of 1.50% compared to the standard 2.50% rate.',
      'Features a unique lucky cat design and offers basic rewards points.',
    ],
    cons: [
      'Has a yearly fee of ₱1,800 which is billed monthly or yearly.',
      'Earns rewards slowly with 1 point for every ₱50 you spend.',
      'JCB network is not as widely accepted locally as Visa or Mastercard.',
    ],
  },

  'bdo_jcb_platinum': {
    why: 'This card elevates your travel experience with premium lounge access and excellent overseas discounts.',
    targetUser: 'Suited for premium travelers who visit Japan regularly and want cheap overseas transaction rates.',
    valueAdd: 'Its unique benefit is a very low 0.85% foreign card fee, making international purchases much cheaper.',
    pros: [
      'Charges an exceptionally low foreign card fee of 0.85% on overseas purchases.',
      'Includes free access to JCB airport lounges in Japan, Hawaii, and select Asian airports.',
      'Gives you double points on all purchases made in Japan.',
    ],
    cons: [
      'Has a high yearly fee of ₱4,500 that you must pay to maintain the card.',
      'Requires a high minimum monthly income of ₱77,000 to apply.',
      'Merchant acceptance for JCB can be lower at smaller local stores.',
    ],
  },

  'bdo_platinum_mastercard': {
    why: 'This card provides broad international acceptance and travel convenience so you can travel without worry.',
    targetUser: 'Suited for high-spending shoppers and travelers who want global recognition and low foreign fees.',
    valueAdd: 'Its unique benefit is a low 0.85% foreign card fee combined with Mastercard\'s near-universal global acceptance.',
    pros: [
      'Charges a very low foreign card fee of 0.85% when you buy things overseas.',
      'Includes free travel insurance and airport lounge access for more comfortable trips.',
      'Offers premium dining and hotel privileges through the Mastercard network.',
    ],
    cons: [
      'Has a high yearly fee of ₱4,500 that adds to your yearly expenses.',
      'Requires a high minimum monthly income of ₱77,000 to apply.',
      'Rewards points accumulate at 1 point per ₱40 spend, which is slow for a platinum card.',
    ],
  },

  'bdo_secured_credit_card': {
    why: 'This card helps you build or restore your credit history safely by locking in a secure bank deposit.',
    targetUser: 'Suited for freelancers and self-employed individuals who do not have standard company pay slips.',
    valueAdd: 'Its unique benefit is that it does not require typical income papers as long as you place a deposit.',
    pros: [
      'Does not require standard income documents like pay slips or tax forms to apply.',
      'Low foreign card fee of 1.50% makes online currency purchases more affordable.',
      'Helps you build a positive credit history to qualify for standard cards later.',
    ],
    cons: [
      'Requires you to lock in a cash deposit of at least ₱10,000 as collateral.',
      'You cannot withdraw your locked deposit while the credit card is active.',
      'Has a yearly fee of ₱1,800 which you must pay to keep using the card.',
    ],
  },

  'bdo_standard_mastercard': {
    why: 'This card is a straightforward tool to help you manage your daily family groceries and utilities safely.',
    targetUser: 'Suited for first-time credit card users who want a simple, internationally accepted payment method.',
    valueAdd: 'Its unique benefit is a low 1.50% foreign card fee, which is cheaper than other standard credit cards.',
    pros: [
      'Features a low foreign card fee of 1.50% for international and online shopping.',
      'Accepted at millions of stores globally wherever Mastercard is displayed.',
      'Gives you access to BDO\'s standard installment options for larger purchases.',
    ],
    cons: [
      'Has a yearly fee of ₱1,800 which increases your annual card costs.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Rewards accumulate slowly with only 1 point earned for every ₱50 spent.',
    ],
  },

  'bdo_visa_classic': {
    why: 'This card provides a safe and universally recognized payment option for your everyday household shopping.',
    targetUser: 'Suited for budget-conscious families who want a basic card for emergencies and routine bills.',
    valueAdd: 'Its unique benefit is a low 1.50% foreign card fee on Visa\'s wide merchant network.',
    pros: [
      'Low foreign card fee of 1.50% keeps overseas transactions and online subscriptions cheaper.',
      'Accepted globally at almost all stores and cash machines that take Visa.',
      'Easy to apply for if you already have a BDO savings account.',
    ],
    cons: [
      'Has a yearly fee of ₱1,800 which you must pay to keep the card active.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Rewards points accumulate slowly at a rate of 1 point per ₱50 spend.',
    ],
  },

  'bdo_visa_gold': {
    why: 'This card offers upgraded dining discounts and travel protection to make your family outings more enjoyable.',
    targetUser: 'Suited for middle-income shoppers who want travel insurance and Visa gold network perks.',
    valueAdd: 'Its unique benefit is a low 1.50% foreign card fee, making overseas orders cheaper than standard gold cards.',
    pros: [
      'Low foreign card fee of 1.50% saves you money when buying in foreign currencies.',
      'Includes free travel insurance when you purchase transportation tickets with the card.',
      'Gives you access to premium deals and discounts at Visa Gold merchant partners.',
    ],
    cons: [
      'Has a yearly fee of ₱2,400 that you need to budget for each year.',
      'Requires a minimum monthly income of ₱33,000 to apply.',
      'Rewards accumulate at a slow rate of 1 point for every ₱50 spent.',
    ],
  },

  'bdo_visa_platinum': {
    why: 'This card delivers luxury travel benefits and extensive purchase protection to ensure your trips are secure.',
    targetUser: 'Suited for frequent international travelers who want low currency fees and airport lounge access.',
    valueAdd: 'Its unique benefit is a highly competitive 0.85% foreign card fee combined with Visa\'s premium travel services.',
    pros: [
      'Charges a very low foreign card fee of 0.85% on all international transactions.',
      'Includes free access to select airport lounges to make your travel more relaxing.',
      'Earns rewards points faster with 1 point for every ₱40 spent.',
    ],
    cons: [
      'Has a high yearly fee of ₱4,500 that adds to your annual card expenses.',
      'Requires a high minimum monthly income of ₱77,000 to apply.',
      'Lounge access has a maximum limit of free visits per year.',
    ],
  },

  'bdo_visa_signature': {
    why: 'This card provides premium travel privileges and a low 0.70% foreign card fee for frequent overseas spending.',
    targetUser: 'Suited for high-spending individuals who want the lowest currency fees and premium concierge services.',
    valueAdd: 'Its unique benefit is a tiny 0.70% foreign card fee, which is one of the lowest in the country.',
    pros: [
      'Charges a tiny 0.70% foreign card fee, making overseas spending extremely cheap.',
      'Includes free priority airport lounge access and comprehensive travel insurance.',
      'Offers a higher rewards earning rate on local dining and shopping purchases.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,500 that you must pay to maintain the card.',
      'Requires a very high minimum monthly income of ₱165,000 to apply.',
      'High spending is required to maximize the value of the premium signature tier.',
    ],
  },

  'bdo_world_elite_mastercard': {
    why: 'This card offers premium travel services and worldwide card acceptance for very high-spend travelers.',
    targetUser: 'Suited for high-income cardholders who want dedicated concierge assistance and premium travel perks.',
    valueAdd: 'Its unique benefit is giving you access to dedicated 24/7 personal travel and lifestyle concierges.',
    pros: [
      'Includes unlimited free access to premium airport lounges worldwide for you and a guest.',
      'Earns rewards points quickly at a rate of 1 point for every ₱40 spent.',
      'Offers extensive worldwide travel insurance and medical coverage up to high limits.',
    ],
    cons: [
      'Has an extremely high yearly fee of ₱7,000 that you must pay annually.',
      'Only available by special invitation from BDO.',
      'Mainly suited for people who spend very heavily on premium travel.',
    ],
  },

  // ── BPI ──────────────────────────────────────────────────────────────────

  'bpi amore cashback card': {
    why: 'This card gives you cashback on groceries and utilities to help reduce your family\'s monthly living costs.',
    targetUser: 'Suited for household budget managers who spend heavily on weekly grocery shopping.',
    valueAdd: 'Its unique benefit is a high 4% cashback on groceries and supermarkets.',
    pros: [
      'Saves you money with 4% cashback on grocery purchases at supermarkets.',
      'Earns 1% cashback on drugstores and utility bill payments made with the card.',
      'Foreign card fee of 1.85% is lower than the typical 2.50% bank standard.',
    ],
    cons: [
      'Has a yearly fee of ₱2,050 which you must spend enough to earn back.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Cashback has a maximum limit of ₱15,000 per calendar year.',
    ],
  },

  'bpi amore platinum cashback card': {
    why: 'This card rewards your dining and leisure spending with direct cashback so you can enjoy weekend family meals.',
    targetUser: 'Suited for urban professionals who spend heavily on restaurants and online food delivery.',
    valueAdd: 'Its unique benefit is a high 4% cashback on dining and restaurant purchases.',
    pros: [
      'Earns 4% cashback on all restaurant dining and food delivery expenses.',
      'Cash back is credited directly to your account without needing to exchange points.',
      'Offers a lower foreign card fee of 1.85% compared to other platinum cards.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,000 that requires serious dining spend to justify.',
      'Requires a high minimum monthly income of ₱83,333 to apply.',
      'Earnings are limited to a maximum of ₱15,000 in cashback each year.',
    ],
  },

  'bpi edge card': {
    why: 'This card offers an affordable way to start earning points on your casual weekly purchases.',
    targetUser: 'Suited for young professionals looking for their first rewards card with a low monthly cost.',
    valueAdd: 'Its unique benefit is a low yearly fee of ₱1,320, which is billed as an affordable ₱110 per month.',
    pros: [
      'Low yearly fee of ₱1,320 that is billed monthly to keep your upfront costs low.',
      'Earns 1 rewards point for every ₱20 spent to help you build up points.',
      'Offers a lower foreign card fee of 1.85% for online overseas checkouts.',
    ],
    cons: [
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Points accumulate slowly and require heavy spending to exchange for high-value rewards.',
      'BPI rewards points require manual redemption through the bank\'s portal.',
    ],
  },

  'bpi gold rewards card': {
    why: 'This card provides automatic travel insurance and rewards points to give you confidence on your family trips.',
    targetUser: 'Suited for middle-income professionals who want travel protection and standard rewards.',
    valueAdd: 'Its unique benefit is free travel accident insurance of up to ₱10 million when trips are booked on the card.',
    pros: [
      'Includes free travel insurance for safer and more peaceful family trips.',
      'Earns 1 rewards point for every ₱35 spent on all of your purchases.',
      'Charges a lower foreign card fee of 1.85% compared to the standard 2.50% rate.',
    ],
    cons: [
      'Has a yearly fee of ₱2,250 which increases your annual card expenses.',
      'Requires a minimum monthly income of ₱40,000 to apply.',
      'You need to spend a lot to collect enough points for premium gifts.',
    ],
  },

  'bpi platinum rewards card': {
    why: 'This card accelerates your points earning on local and international trips to reward your global lifestyle.',
    targetUser: 'Suited for frequent travelers who want double points overseas and airport lounge access.',
    valueAdd: 'Its unique benefit is earning double points on all international and foreign currency purchases.',
    pros: [
      'Earns double rewards points when you spend overseas or shop online in foreign currencies.',
      'Includes free airport lounge access and comprehensive travel insurance.',
      'Foreign card fee of 1.85% is cheaper than the standard 2.50% bank rate.',
    ],
    cons: [
      'Has a high yearly fee of ₱4,000 that you must budget for annually.',
      'Requires a high minimum monthly income of ₱80,000 to apply.',
      'Standard local earn rate of 2 points per ₱30 spent is average.',
    ],
  },

  'bpi platinum rewards mastercard': {
    why: 'This card helps you accumulate points quickly on travel and luxury dining experiences worldwide.',
    targetUser: 'Suited for upscale diners and globetrotters who want premium Mastercard benefits and lounge access.',
    valueAdd: 'Its unique benefit is earning double BPI rewards points on all overseas spending.',
    pros: [
      'Earns double points on foreign currency purchases, helping you gather points faster.',
      'Includes complimentary access to select airport lounges and free travel insurance.',
      'Offers a competitive foreign card fee of 1.85% on international shopping.',
    ],
    cons: [
      'Has a high yearly fee of ₱4,000 that requires consistent spending to justify.',
      'Requires a high minimum monthly income of ₱80,000 to apply.',
      'You must spend regularly to make up for the high yearly card cost.',
    ],
  },

  'bpi rewards card': {
    why: 'This card is a simple and reliable tool to earn rewards on your everyday grocery and utility bills.',
    targetUser: 'Suited for first-time credit card owners who want to earn basic points on household expenses.',
    valueAdd: 'Its unique benefit is a low minimum income gate of ₱15,000 combined with a lower 1.85% foreign card fee.',
    pros: [
      'Earns 1 rewards point for every ₱35 spent on all card purchases.',
      'Requires an accessible minimum monthly income of only ₱15,000 to apply.',
      'Charges a lower foreign card fee of 1.85% compared to the standard 2.50% fee.',
    ],
    cons: [
      'Has a yearly fee of ₱1,550 which adds to your annual expenses.',
      'Points take a long time to build up if you only use the card for small purchases.',
      'Does not offer advanced travel perks like airport lounge access.',
    ],
  },

  'bpi signature card': {
    why: 'This card grants you premium dining discounts and airport lounge visits to elevate your leisure time.',
    targetUser: 'Suited for high earners who appreciate fine dining privileges and premium Visa signature services.',
    valueAdd: 'Its unique benefit is a low 1.85% foreign card fee on Visa\'s premium signature tier.',
    pros: [
      'Earns 2 rewards points for every ₱20 spent to help you collect points rapidly.',
      'Includes free access to select airport lounges and comprehensive travel insurance.',
      'Offers special 50% discounts on partner dining and luxury hotel bookings.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,500 that you must budget for.',
      'Requires a high minimum monthly income of ₱100,000 to apply.',
      'Promo rates and dining discounts are subject to strict seasonal schedules.',
    ],
  },

  'petron bpi card': {
    why: 'This card helps you fight rising fuel prices by giving you cash back at the pump.',
    targetUser: 'Suited for daily drivers and car owners who refuel regularly at Petron stations.',
    valueAdd: 'Its unique benefit is a high 3% cashback on all fuel purchases at Petron.',
    pros: [
      'Saves you money with 3% cashback on Petron fuel purchases.',
      'Offers a free ₱200 fuel voucher as a welcome gift upon card approval.',
      'Charges a lower foreign card fee of 1.85% on all overseas spending.',
    ],
    cons: [
      'Has a yearly fee of ₱1,550 which requires regular driving to earn back.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Gives you no cashback value if you buy fuel from other gas station brands.',
    ],
  },

  'robinsons cashback card': {
    why: 'This card helps you save money on your family\'s weekly groceries at Robinsons supermarkets.',
    targetUser: 'Suited for families who buy their daily household necessities at Robinsons stores.',
    valueAdd: 'Its unique benefit is a high 3% cashback on all grocery purchases at Robinsons.',
    pros: [
      'Earns 3% cashback on grocery shopping at Robinsons supermarkets and stores.',
      'Offers a lower foreign card fee of 1.85% compared to other retail cards.',
      'Accepted globally wherever the Visa network is displayed.',
    ],
    cons: [
      'Has a yearly fee of ₱2,500 which increases your annual card expenses.',
      'Requires a minimum monthly income of ₱15,000 to apply.',
      'Yields very little cashback value when you shop at non-Robinsons stores.',
    ],
  },

  'bpi corporate card': {
    why: 'This card helps business owners organize company spending and track employee travel costs in one place.',
    targetUser: 'Suited for small to medium business owners who want to separate personal and company finances.',
    valueAdd: 'Its unique benefit is providing detailed corporate expense reporting to simplify business tax filing.',
    pros: [
      'Simplifies bookkeeping by keeping business and personal spending completely separate.',
      'Earns rewards points on business purchases that can be used for company savings.',
      'Charges a lower foreign card fee of 1.85% for overseas business travel.',
    ],
    cons: [
      'Has a yearly fee of ₱1,700 which you must pay for each employee card.',
      'Requires company registration and business financial documents to apply.',
      'Not designed for personal rewards or individual cashback programs.',
    ],
  },

  // ── Chinabank ────────────────────────────────────────────────────────────

  'chinabank_athome_visa_platinum': {
    why: 'This card gives you cashback on online shopping to save you money from the comfort of your couch.',
    targetUser: 'Suited for online shoppers who frequently buy groceries and household items on websites.',
    valueAdd: 'Its unique benefit is a solid 1% cashback on online transactions with a low income gate of ₱20,833.',
    pros: [
      'Earns 1% cashback on online purchases to reward your internet shopping.',
      'Requires a highly accessible minimum monthly income of only ₱20,833 to apply.',
      'Offers standard Visa Platinum privileges including shopping protection.',
    ],
    cons: [
      'Has a yearly fee of ₱3,000 that you must pay to keep using the card.',
      'High foreign card fee of 2.50% makes buying from foreign online stores expensive.',
      'Cashback has a maximum monthly earning limit.',
    ],
  },

  'chinabank_cash_rewards_mastercard': {
    why: 'This card can reduce some household costs by providing higher cashback on groceries and family meals.',
    targetUser: 'Suited for families who spend heavily on dining out and weekly grocery trips.',
    valueAdd: 'Its unique benefit is a 6% cashback rate on dining and grocery spending.',
    pros: [
      'Earns 6% cashback on groceries and dining purchases.',
      'Requires a low minimum monthly income of only ₱20,833 to apply.',
      'Cash rewards are credited directly to your card statement to reduce your bill.',
    ],
    cons: [
      'Has a yearly fee of ₱3,588 which requires consistent dining spend to justify.',
      'High foreign card fee of 2.50% makes international purchases more expensive.',
      'Cashback has a maximum limit of ₱1,000 per month.',
    ],
  },

  'chinabank_destinations_platinum_mastercard': {
    why: 'This card helps you earn travel miles on your daily local spending so you can plan your next escape.',
    targetUser: 'Suited for casual travelers who want a simple way to collect points for airline tickets.',
    valueAdd: 'Its unique benefit is a competitive local mile earn rate of 1 mile for every ₱30 spent.',
    pros: [
      'Earns 1 Destination Mile for every ₱30 spent, which is fast for an entry-level miles card.',
      'Miles can be transferred to major airline programs like Mabuhay Miles and KrisFlyer.',
      'Requires a reasonable minimum monthly income of ₱20,833 to apply.',
    ],
    cons: [
      'Has a yearly fee of ₱4,000 that you must pay to keep the card active.',
      'High foreign card fee of 2.50% makes overseas shopping less rewarding.',
      'Lounge access is not free and requires a payment per visit.',
    ],
  },

  'chinabank_destinations_world_dollar_mastercard': {
    why: 'This card keeps your dollar savings safe by letting you pay international bills directly in US dollars.',
    targetUser: 'Suited for people with US dollar accounts who travel globally and want to avoid currency conversion fees.',
    valueAdd: 'Its unique benefit is settling your card bills directly in US dollars to skip local currency exchange.',
    pros: [
      'Billed in US dollars, saving you from currency exchange costs when spending abroad.',
      'Offers a lower foreign card fee of 1.70% on international non-dollar purchases.',
      'Includes free airport lounge visits and premium travel insurance.',
    ],
    cons: [
      'Has a yearly fee of $100 which must be paid in US dollars.',
      'Requires a US dollar savings account with Chinabank to apply.',
      'Requires a minimum monthly income equivalent to ₱20,833.',
    ],
  },

  'chinabank_destinations_world_mastercard': {
    why: 'This card provides high-speed miles earning and premium airport lounge comfort for your international travels.',
    targetUser: 'Suited for frequent flyers who want fast miles collection and premium Mastercard travel benefits.',
    valueAdd: 'Its unique benefit is a low 1.75% foreign card fee combined with excellent miles conversion rates.',
    pros: [
      'Earns 1 Destination Mile for every ₱30 spent on all local purchases.',
      'Charges a lower foreign card fee of 1.75% compared to the standard 2.50% bank fee.',
      'Includes free airport lounge access and comprehensive travel insurance.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,000 that you must pay annually.',
      'Requires a minimum monthly income of ₱20,833 to apply.',
      'You must spend heavily to gather enough miles for business class flights.',
    ],
  },

  'chinabank_freedom_mastercard': {
    why: 'This card lets you earn rewards points without the worry of paying any recurring yearly card costs.',
    targetUser: 'Suited for first-time credit card users who want to build credit with zero yearly fees.',
    valueAdd: 'Its unique benefit is a yearly fee waived for life without any spend rules.',
    pros: [
      'No yearly fee for life ensures you never pay to keep this card active.',
      'Requires an accessible minimum monthly income of ₱20,833 to apply.',
      'Earns 1 rewards point for every ₱20 spent on all purchases.',
    ],
    cons: [
      'High foreign card fee of 2.50% makes buying from international websites expensive.',
      'Rewards points require a large amount of spending before you can exchange them.',
      'Does not include travel benefits like free insurance or lounge access.',
    ],
  },

  // -- EastWest --------------------------------------------------------------

  'eastwest_gold_mastercard': {
    why: 'This is a straightforward rewards card for people who want EastWest points without moving into a premium income tier.',
    targetUser: 'Suited for cardholders with regular shopping or bill spend who want rewards points and a moderate yearly fee.',
    valueAdd: 'You earn 1 EastWest Rewards Point for every Php 100 spend, with a first-year fee waiver for new-to-bank cardholders.',
    pros: [
      'Earns 1 EastWest Rewards Point for every Php 100 charged to the card.',
      'First-year yearly fee is waived for new-to-bank cardholders.',
      'Requires a minimum gross annual income of Php 480,000, lower than EastWest Platinum cards.',
    ],
    cons: [
      'Regular yearly fee is Php 2,500 after the first year.',
      'Cash advance costs include a Php 200 service fee plus interest from the date you take the advance.',
      'Foreign card fee is 2.50%, so overseas purchases need extra care.',
    ],
  },

  'eastwest_visa_platinum': {
    why: 'This card is mainly for people who want cashback-style rewards and can comfortably meet a higher income and spending requirement.',
    targetUser: 'Suited for higher-income cardholders who spend enough each year to make the fee waiver realistic.',
    valueAdd: 'Its key trade-off is clear: a Php 3,600 yearly fee today, with automatic waiver after Php 1.5 million accumulated spend over the prior 12 months.',
    pros: [
      'Uses EastWest Cash Rewards, which is easier to understand than points for many users.',
      'Yearly fee is automatically waived after Php 1.5 million accumulated spend in the prior 12 months from card anniversary.',
      'Includes the same published Php 200 cash advance service fee used across many EastWest cards.',
    ],
    cons: [
      'Requires a minimum gross annual income of Php 1,000,000.',
      'Regular yearly fee is Php 3,600 and is scheduled to become Php 4,000 on August 20, 2026.',
      'The fee waiver spend threshold is high, so light spenders may still pay the yearly fee.',
    ],
  },

  // -- Metrobank -------------------------------------------------------------

  'm_free_credit_card': {
    why: 'This is a low-maintenance Metrobank card for people who mainly want payment convenience and no yearly fee, not a rewards program.',
    targetUser: 'Suited for applicants who already have another principal credit card and meet Metrobank\'s listed Php 867,000 gross annual income requirement.',
    valueAdd: 'The main value is simple: Metrobank lists the principal and supplementary yearly fees as perpetually waived.',
    pros: [
      'No yearly fee for the principal card and supplementary card.',
      'Includes Metrobank installment and balance-conversion access for larger purchases.',
      'Keeps the card simple by focusing on ownership cost instead of points tracking.',
    ],
    cons: [
      'No documented points, miles, or cashback program on the official product page.',
      'Requires an existing principal credit card from another bank for at least 9 months.',
      'Cash advance still has a Php 200 fee and interest starts from the cash advance date.',
    ],
  },

  'metrobank_titanium_mastercard': {
    why: 'This is a Metrobank rewards card for people who spend often on online shopping, department stores, and dining.',
    targetUser: 'Suited for cardholders who want points and can meet Metrobank\'s listed Php 180,000 minimum annual income requirement.',
    valueAdd: 'It earns 1 point for every Php 20 spend, with 2x points on listed online, department-store, and dining transactions.',
    welcomePromo: 'Metrobank lists a 2026 Mastercard welcome promo for eligible new Titanium Mastercard applicants who apply from March 1 to June 30, 2026 and spend Php 30,000 within 90 days.',
    pros: [
      'Earns 1 never-expiring point for every Php 20 spend.',
      'Earns 2x points on listed online, department-store, and dining transactions.',
      'Has a current Metrobank-published welcome promo for eligible new Titanium applicants.',
    ],
    cons: [
      'Regular yearly fee is Php 2,500 after the standard first-year waiver.',
      'The lifetime fee-waiver promo is conditional and time-limited, not automatic for everyone.',
      'Foreign card fees combine a 1.00% cross-border service fee and 2.50% forex processing fee.',
    ],
  },

  // -- Metrobank premium/travel ---------------------------------------------

  'metrobank_travel_signature_visa': {
    why: 'This is a travel-focused Metrobank card for people who value miles, lounge access, travel insurance, and a lower listed foreign-currency fee.',
    targetUser: 'Suited for applicants who meet Metrobank\'s Php 700,000 minimum annual income requirement and already hold another principal credit card.',
    valueAdd: 'It earns 1 mile for every Php 30 spend and Metrobank lists a 1.68% foreign-currency fee on the product page.',
    welcomePromo: 'Metrobank lists a LoungeKey promo for existing and new Travel Signature Visa cardholders from July 25, 2025 to July 24, 2026, with one pass after a Php 50,000 single-receipt airline transaction.',
    pros: [
      'Earns 1 mile for every Php 30 spend on all purchases.',
      'Includes unlimited local lounge access at partner lounges and travel insurance coverage listed by Metrobank.',
      'Has a lower listed foreign-currency fee than many peso credit cards.',
    ],
    cons: [
      'Regular yearly fee is Php 5,500 after the first-year waiver.',
      'Requires another principal credit card with at least Php 150,000 credit limit, based on Metrobank\'s eligibility rules.',
      'The LoungeKey promo needs a Php 50,000 single-receipt airline transaction and is capped at three passes.',
    ],
  },

  'metrobank_platinum_mastercard': {
    why: 'This is a Metrobank lifestyle card for people who want points, dining privileges, and e-commerce protection without moving into a travel-miles card.',
    targetUser: 'Suited for applicants who meet Metrobank\'s Php 700,000 minimum annual income requirement and want Mastercard Platinum benefits.',
    valueAdd: 'It earns Metrobank Rewards Points and lists a Php 400,000 yearly spend waiver path for the following year.',
    welcomePromo: 'Metrobank lists a LoungeKey promo for existing and new Platinum Mastercard cardholders from July 25, 2025 to July 24, 2026, with one pass after a Php 50,000 single-receipt airline transaction.',
    pros: [
      'Earns Metrobank Rewards Points for everyday purchases.',
      'Includes dining deals, a free first supplementary card, and e-commerce protection listed by Metrobank.',
      'Yearly fee can be waived for the following year after Php 400,000 spend, based on Metrobank\'s listed condition.',
    ],
    cons: [
      'Regular yearly fee is Php 5,000 after the first-year waiver.',
      'Foreign-currency purchases can be costly once the cross-border and forex processing fees are combined.',
      'The lounge promo is airline-spend specific, so it may not help if you do not buy flights with the card.',
    ],
  },

  'metrobank_world_mastercard': {
    why: 'This is a premium Metrobank card for people who spend in foreign currency, book hotels, or shop online often enough to use the 3x rewards categories.',
    targetUser: 'Suited for applicants who meet Metrobank\'s Php 700,000 minimum annual income requirement and can make use of travel and online-spend benefits.',
    valueAdd: 'It earns 3 rewards points for every Php 20 on foreign-currency, hotel, and online transactions, with 1 point per Php 20 on other purchases.',
    pros: [
      'Earns higher points on foreign-currency, hotel, and online transactions.',
      'Includes two global lounge passes per year through Mastercard Travel Pass and unlimited local lounge access at partner lounges.',
      'Lists a lower 1.85% foreign-currency transaction fee than many standard peso credit cards.',
    ],
    cons: [
      'Regular yearly fee is Php 6,000 after the first-year waiver.',
      'Higher rewards depend on the listed bonus categories, so ordinary local spend is less distinctive.',
      'Requires another principal credit card with at least Php 150,000 credit limit, based on Metrobank\'s eligibility rules.',
    ],
  },

  // ── Equicom ──────────────────────────────────────────────────────────────

  'equicom_gold_credit_card': {
    why: 'This card offers reliable daily payment convenience and local healthcare privileges for families who value medical discounts.',
    targetUser: 'Suited for middle-income families who value hospital and medical benefits alongside standard credit.',
    valueAdd: 'Its unique benefit is offering exclusive medical discounts and emergency health services.',
    pros: [
      'Provides special discounts at Maxicare partner clinics and hospitals.',
      'Earns 1 rewards point for every ₱300 spent to redeem for gifts or bill credits.',
      'Foreign card fee of 2.00% is lower than the typical 2.50% bank standard.',
    ],
    cons: [
      'Has a yearly fee of ₱2,000 which adds to your annual expenses.',
      'Requires a higher minimum monthly income of ₱41,500 to apply.',
      'Equicom is a smaller bank, so branch locations for payment are limited.',
    ],
  },

  // ── HSBC ──────────────────────────────────────────────────────────────────

  'hsbc live credit card': {
    why: 'This card maximizes your savings on food and entertainment to reward your weekend family gatherings.',
    targetUser: 'Suited for diners and families who spend heavily on restaurants, deliveries, and shopping.',
    valueAdd: 'Its unique benefit is a high 8% cashback on all dining and restaurant spending.',
    pros: [
      'Earns 8% cashback on dining out and food delivery services.',
      'Offers 5% cashback on shopping and online purchases to save you money.',
      'Cashback is earned automatically and credited to your monthly statement.',
    ],
    cons: [
      'Has a high yearly fee of ₱5,000 that requires consistent dining to justify.',
      'High foreign card fee of 2.50% makes overseas shopping less rewarding.',
      'Cashback is limited to a maximum of ₱1,250 across all categories each month.',
    ],
  },

  'hsbc red platinum mastercard': {
    why: 'This card multiplies your rewards points on everyday online shopping and dining to help you redeem gifts faster.',
    targetUser: 'Suited for budget-conscious online shoppers who want fast points on Shopee and Lazada.',
    valueAdd: 'Its unique benefit is a low income gate of ₱16,667 combined with a 4x rewards points multiplier.',
    pros: [
      'Earns 4 times more rewards points on online shopping, local dining, and overseas spend.',
      'First year is free with zero annual fee to pay upfront.',
      'Requires a highly accessible minimum monthly income of only ₱16,667 to apply.',
    ],
    cons: [
      'Has a yearly fee of ₱2,500 starting from the second year.',
      'High foreign card fee of 2.50% makes buying in foreign currencies expensive.',
      'You need to spend on specific categories to get the higher 4x points rate.',
    ],
  },

  // -- RCBC ------------------------------------------------------------------

  'rcbc_flex_visa': {
    why: 'This is a lower-fee RCBC rewards card for people who want points to follow their real spending habits.',
    targetUser: 'Suited for first-card or everyday cardholders who can name two regular spend categories, such as dining, clothing, travel, or transportation.',
    valueAdd: 'You can earn 2x rewards points in two preferred categories while keeping the regular yearly fee at Php 1,500.',
    pros: [
      'Earns 2x rewards points in two preferred categories chosen from dining, clothing, travel, or transportation.',
      'Regular yearly fee is Php 1,500, lower than many premium rewards cards.',
      'Rewards can be redeemed in several ways, including shopping vouchers, cash rebates, account credit, donations, or airmiles enrollment.',
    ],
    cons: [
      'The higher earn rate depends on choosing categories that match your actual spending.',
      'The lifetime-fee waiver is a temporary promo, not a permanent published waiver for every applicant.',
      'Outside the active promo, the card still has a Php 1,500 yearly fee.',
    ],
  },

  'rcbc_black_card_platinum_mastercard': {
    why: 'This is a premium RCBC rewards card for high-income cardholders who want travel protection, flexible rewards, and Mastercard acceptance.',
    targetUser: 'Suited for cardholders who spend locally and overseas, value travel-related protection, and can meet the Php 1,000,000 annual income requirement.',
    valueAdd: 'Its main upside is a flexible points program with stronger earning on international spend and several redemption paths.',
    pros: [
      'Earns 1 rewards point for every Php 30 local spend, and 1 point for every Php 10 international spend.',
      'Rewards can be redeemed for vouchers, rebates, account credit, donations, deposits, or airmiles enrollment.',
      'Includes travel insurance, purchase protection, and Mastercard e-commerce purchase protection when the published conditions are met.',
    ],
    cons: [
      'Regular yearly fee is Php 3,600 for the peso card if you do not qualify for the active lifetime-fee waiver promo.',
      'Requires a high annual income of Php 1,000,000 to apply.',
      'Foreign card fee is 3.50%, so overseas rewards should be weighed against the added currency cost.',
    ],
  },

  'rcbc_classic_mastercard': {
    why: 'This is RCBC\'s simpler Mastercard rewards card for people who want points without moving into a premium fee tier.',
    targetUser: 'Suited for first-card shoppers or light everyday spenders who meet the Php 180,000 annual income requirement and want a familiar Mastercard setup.',
    valueAdd: 'The regular Php 1,500 yearly fee is lower than RCBC\'s Gold and Platinum cards while still earning non-expiring rewards points.',
    pros: [
      'Earns rewards points that RCBC lets cardholders redeem for vouchers, rebates, account credit, donations, deposits, airmiles enrollment, or fee-waiver credits.',
      'Has a lower regular yearly fee than RCBC Gold, Diamond, and Black cards.',
      'RCBC lists a temporary lifetime yearly-fee waiver promo for eligible new-to-RCBC applicants who meet the published spend rule.',
    ],
    cons: [
      'The lifetime yearly-fee waiver is conditional and time-limited, not automatic for every applicant.',
      'Foreign card fee is 3.50%, so it is not the cheapest RCBC option for foreign-currency purchases.',
      'It has fewer premium travel and protection benefits than RCBC\'s higher-tier cards.',
    ],
  },

  'rcbc_gold_mastercard': {
    why: 'This is a mid-tier RCBC rewards card for people who want everyday points plus some travel and purchase-protection benefits.',
    targetUser: 'Suited for cardholders who can meet the Php 600,000 annual income requirement and expect enough spend to justify a Php 3,000 yearly fee.',
    valueAdd: 'It keeps the flexible RCBC Rewards setup while adding a higher-tier Mastercard package than Classic.',
    pros: [
      'Earns non-expiring RCBC Rewards Points for eligible purchases.',
      'Includes RCBC-listed travel and purchase-protection benefits when the bank\'s conditions are met.',
      'Eligible new-to-RCBC applicants can qualify for RCBC\'s temporary lifetime yearly-fee waiver promo if they meet the published spend rule.',
    ],
    cons: [
      'Regular yearly fee is Php 3,000 if you do not qualify for the temporary lifetime yearly-fee waiver promo.',
      'Requires a higher annual income than RCBC Classic Mastercard.',
      'Foreign card fee is 3.50%, which can reduce the value of rewards on overseas spend.',
    ],
  },

  'rcbc_diamond_card_platinum_mastercard': {
    why: 'This is a Platinum Mastercard for cardholders who like RCBC Rewards and also want part of their spending linked to automatic charity donations.',
    targetUser: 'Suited for high-income cardholders who meet the Php 1,000,000 annual income requirement and prefer a donation-linked card over a pure travel card.',
    valueAdd: 'For every Php 100 charged, RCBC says Php 0.10 is automatically donated to the cardholder\'s selected Diamond Cares partner charity.',
    pros: [
      'Earns flexible, non-expiring RCBC Rewards Points for eligible purchases.',
      'Automatically links eligible spend to donations through RCBC\'s Diamond Cares program.',
      'Regular yearly fee is Php 2,500, lower than several other RCBC premium cards.',
    ],
    cons: [
      'Requires a high annual income of Php 1,000,000 to apply.',
      'Foreign card fee is 3.50%, so overseas spending has a meaningful added cost.',
      'The donation angle is narrow; if you want a travel-first card, RCBC Airmiles or other travel cards may be easier to compare.',
    ],
  },

  'rcbc_airmiles_visa_signature': {
    why: 'This is RCBC\'s travel-focused Visa Signature card for high-income cardholders who want direct mileage earning and lounge access.',
    targetUser: 'Suited for frequent travelers who can meet the Php 1,000,000 annual income requirement and can use the card enough to offset a Php 5,500 yearly fee.',
    valueAdd: 'It earns 1 Signature Airmile per Php 25 overseas spend or Php 48 local spend, with RCBC listing 1:1 conversion to partner mileage programs.',
    welcomePromo: 'No active RCBC welcome-gift application window was confirmed for new Airmiles applications on June 8, 2026; the last listed promo covered March 11 to May 31, 2026 applications.',
    pros: [
      'Earns Signature Airmiles directly instead of general rewards points.',
      'RCBC lists a limited-time 1.50% foreign card fee until December 31, 2026, lower than its standard 1.70% for this card.',
      'Includes published travel benefits such as Priority Pass membership, local lounge access, and travel insurance when conditions are met.',
    ],
    cons: [
      'Regular yearly fee is Php 5,500 after the first-year waiver.',
      'Requires a high annual income of Php 1,000,000 to apply.',
      'The latest official welcome-gift application period we confirmed has already ended for new applicants.',
    ],
  },
};

export default editorial;

type TimedPromo = {
  validThrough: string;
  text: string;
};

function promoStillCurrent(validThrough: string): boolean {
  const validThroughManila = new Date(`${validThrough}T23:59:59+08:00`);
  return Number.isFinite(validThroughManila.getTime()) && Date.now() <= validThroughManila.getTime();
}

function getWelcomePromoFor(key: string): string | undefined {
  const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');

  const promos: Record<string, TimedPromo> = {
    petron_bpi_card: {
      validThrough: '2026-06-30',
      text: 'Bank-listed promo to verify: BPI lists a Php 6,000 eGC welcome gift after Php 30,000 spend for eligible new cardholders. Application period is March 10 to June 30, 2026.',
    },
    bpi_rewards_card: {
      validThrough: '2026-06-30',
      text: 'Bank-listed promo to verify: BPI lists a Php 12,000 eGC welcome gift after Php 60,000 spend for eligible new cardholders. Application period is March 10 to June 30, 2026.',
    },
    bpi_gold_rewards_card: {
      validThrough: '2026-06-30',
      text: 'Bank-listed promo to verify: BPI lists a Php 12,000 eGC welcome gift after Php 60,000 spend for eligible new cardholders. Application period is March 10 to June 30, 2026.',
    },
    bpi_amore_cashback_card: {
      validThrough: '2026-06-30',
      text: 'Bank-listed promo to verify: BPI lists a Php 12,000 eGC welcome gift after Php 60,000 spend for eligible new cardholders. Application period is March 10 to June 30, 2026.',
    },
    bpi_platinum_rewards_mastercard: {
      validThrough: '2026-06-30',
      text: 'Bank-listed promo to verify: BPI lists a Php 12,000 eGC welcome gift after Php 60,000 spend for eligible new cardholders. Application period is March 10 to June 30, 2026.',
    },
    bpi_signature_card: {
      validThrough: '2026-06-30',
      text: 'Bank-listed promo to verify: BPI lists a Php 18,000 eGC welcome gift after Php 90,000 spend for eligible new cardholders. Application period is March 10 to June 30, 2026.',
    },
    rcbc_flex_visa: {
      validThrough: '2026-06-30',
      text: 'RCBC lists a temporary lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants who apply from April 1 to June 30, 2026 and meet the spend requirement within 60 days from card receipt.',
    },
    rcbc_black_card_platinum_mastercard: {
      validThrough: '2026-06-30',
      text: 'RCBC lists a temporary lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants who apply from April 1 to June 30, 2026 and spend Php 60,000 within 60 days from card receipt.',
    },
    rcbc_classic_mastercard: {
      validThrough: '2026-06-30',
      text: 'RCBC lists a temporary lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants who apply from April 1 to June 30, 2026 and spend Php 30,000 within 60 days from card receipt.',
    },
    rcbc_gold_mastercard: {
      validThrough: '2026-06-30',
      text: 'RCBC lists a temporary lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants who apply from April 1 to June 30, 2026 and spend Php 40,000 within 60 days from card receipt.',
    },
    rcbc_diamond_card_platinum_mastercard: {
      validThrough: '2026-06-30',
      text: 'RCBC lists a temporary lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants who apply from April 1 to June 30, 2026 and spend Php 60,000 within 60 days from card receipt.',
    },
  };

  const promo = promos[normalizedKey];
  return promo && promoStillCurrent(promo.validThrough) ? promo.text : undefined;
}

function cleanEditorialLine(line: string): string {
  return line
    .replace(/\bIts unique benefit is /g, '')
    .replace(/\bunique benefit\b/gi, 'main upside')
    .replace(/\bcomplete peace of mind\b/gi, 'added protection')
    .replace(/\btotal peace of mind\b/gi, 'a lower ongoing cost')
    .replace(/\bpeace of mind\b/gi, 'added protection')
    .replace(/\bfree flights\b/gi, 'flight redemptions')
    .replace(/\bmassive cashback\b/gi, 'higher cashback')
    .replace(/\bmassive\b/gi, 'higher')
    .replace(/\bimpressive\b/gi, 'published')
    .replace(/\bunmatched\b/gi, 'low')
    .replace(/\bthe ultimate level of\b/gi, 'a set of')
    .replace(/\bultimate level of\b/gi, 'a set of')
    .replace(/\belite travel privileges\b/gi, 'premium travel privileges')
    .replace(/\belite\b/gi, 'premium')
    .replace(/\bglobal recognition\b/gi, 'worldwide card acceptance')
    .replace(/\bbespoke\b/gi, 'dedicated')
    .replace(/\bultra-high-net-worth individuals\b/gi, 'high-income cardholders')
    .replace(/\bBest suited only for\b/gi, 'Mainly suited for')
    .replace(/\bstretch your family budget further\b/gi, 'reduce some everyday costs')
    .replace(/\bdream vacations\b/gi, 'future trips')
    .replace(/\btrue value\b/gi, 'lower cost')
    .replace(/\bglobal adventures\b/gi, 'overseas trips')
    .replace(/\bexcellent miles rewards\b/gi, 'a stronger miles earn rate')
    .replace(/\bexceptionally low\b/gi, 'low')
    .replace(/\bextremely low\b/gi, 'low')
    .replace(/\btiny\b/gi, 'low')
    .replace(/\bhighly competitive\b/gi, 'competitive')
    .replace(/\bmassive worldwide merchant network\b/gi, 'wide merchant network')
    .replace(/\bNo annual fee for life \(NAFFL\)\b/gi, 'No yearly fee for life')
    .replace(/\bNAFFL\b/gi, 'no yearly fee for life')
    .replace(/\bAnnual fee\b/g, 'Yearly fee')
    .replace(/\bannual fee\b/g, 'yearly fee');
}

function cleanEditorialCopy(copy: CardEditorial): CardEditorial {
  return {
    ...copy,
    why: cleanEditorialLine(copy.why),
    targetUser: copy.targetUser ? cleanEditorialLine(copy.targetUser) : undefined,
    valueAdd: copy.valueAdd ? cleanEditorialLine(copy.valueAdd) : undefined,
    welcomePromo: copy.welcomePromo ? cleanEditorialLine(copy.welcomePromo) : undefined,
    pros: copy.pros.map(cleanEditorialLine),
    cons: copy.cons.map(cleanEditorialLine),
  };
}

function rewardKind(card: CreditCard): 'cashback' | 'miles' | 'points' | null {
  const raw = card.rewards_type?.toLowerCase() ?? '';
  if (raw.includes('cashback')) return 'cashback';
  if (raw.includes('mile')) return 'miles';
  if (raw.includes('point') || raw.includes('reward')) return 'points';
  return null;
}

function rewardCopy(card: CreditCard): string {
  switch (rewardKind(card)) {
    case 'cashback':
      return 'Earns cashback on eligible purchases.';
    case 'miles':
      return 'Earns miles on eligible purchases.';
    case 'points':
      return 'Earns rewards points on eligible purchases.';
    default:
      return 'Keeps the value simple, with fees and payment habits doing most of the work.';
  }
}

function fallbackWhy(card: CreditCard, goalLabel: string, topCatLabel: string): string {
  const bankName = card.bank.replace(/\s*\([^)]*\)\s*/g, '').trim();
  const kind = rewardKind(card);

  if (card.naffl === true || card.annual_fee_recurring === 0) {
    return `This is mainly a low-maintenance card from ${bankName}, useful if you want something you can keep long term without watching for yearly-fee waiver rules.`;
  }
  if (kind === 'cashback') {
    return `This is a practical cashback card to compare if you spend often on ${topCatLabel}, but the yearly fee still needs to make sense for your budget.`;
  }
  if (kind === 'miles') {
    return `This is a travel-leaning card to compare if you can use the miles and benefits often enough to offset the yearly fee.`;
  }
  if (kind === 'points') {
    return `This is a points card to compare if you already like ${bankName}'s rewards setup and want ordinary purchases to earn something back.`;
  }

  return `This is a basic credit-card option from ${bankName}, worth checking mainly for fees, eligibility, and how easy it is to maintain.`;
}
/**
 * Returns per-card editorial copy, or a generic data-driven fallback.
 * Never returns fabricated content — fallback is grounded in real DB fields.
 * Client-safe: depends only on the editorial record and pure derivations,
 * so it can be imported by client components (e.g. the browse catalog).
 */
export function getEditorialFor(
  card: CreditCard,
  answers?: { goal?: GoalId; spending?: SpendingCategory },
): CardEditorial {
  const key = card.normalized_card_key;
  if (editorial[key]) {
    const base = editorial[key];
    return cleanEditorialCopy({
      ...base,
      welcomePromo: base.welcomePromo ?? getWelcomePromoFor(key),
    });
  }

  // Fallback: build a minimal-but-honest generic entry
  const goalLabel = answers?.goal
    ? {
        cashback: 'earning cashback',
        travel: 'travel and miles',
        'no-annual-fee': 'avoiding a yearly fee',
        'first-card': 'getting your first card',
        'low-fee': 'keeping fees low',
      }[answers.goal]
    : 'a card that fits everyday spending';

  const catMap = deriveCategoryMatch(card);
  const topCat = (Object.entries(catMap) as [SpendingCategory, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const topCatLabel = {
    groceries: 'groceries',
    dining: 'dining',
    online: 'online shopping',
    fuel: 'fuel',
    bills: 'bill payments',
    travel: 'travel',
  }[topCat];

  let yearlyFeePro: string | null = null;
  let yearlyFeeCon: string | null = null;
  if (card.naffl === true || card.annual_fee_recurring === 0) {
    yearlyFeePro = 'No yearly fee for life, so the ongoing card cost is Php 0.';
  } else if (card.annual_fee_recurring !== null && card.annual_fee_recurring !== undefined && card.annual_fee_recurring > 0) {
    yearlyFeeCon = `Has a yearly fee of ₱${card.annual_fee_recurring.toLocaleString('en-PH')} — check if the rewards match this cost.`;
  } else if ((card.naffl === null || card.naffl === undefined) && (card.annual_fee_recurring === null || card.annual_fee_recurring === undefined)) {
    yearlyFeeCon = 'Yearly fee details are not confirmed — check the bank\'s terms before applying.';
  }

  const rewardsPro = rewardCopy(card);

  let incomePro: string | null = null;
  let incomeCon: string | null = null;
  if (card.min_income_monthly === 0) {
    incomePro = 'Does not require proof of income to apply.';
  } else if (card.min_income_monthly !== null && card.min_income_monthly !== undefined && card.min_income_monthly > 0) {
    incomeCon = `Requires a minimum monthly income of ₱${card.min_income_monthly.toLocaleString('en-PH')} to apply.`;
  } else if (
    (card.min_income_monthly === null || card.min_income_monthly === undefined) &&
    (card.min_income_annual === null || card.min_income_annual === undefined)
  ) {
    incomeCon = 'Minimum monthly income is not publicly listed — confirm your eligibility with the bank.';
  }

  const foreignFeeCon = (card.foreign_transaction_fee_pct !== null && card.foreign_transaction_fee_pct !== undefined)
    ? `Charges a foreign card fee of ${card.foreign_transaction_fee_pct}% when you spend overseas or shop online in foreign currencies.`
    : 'Foreign card fee is not confirmed — check overseas transaction terms before traveling.';

  const networkPro = `Can be used anywhere ${card.card_network || 'major card networks'} is accepted.`;

  const pros = [
    yearlyFeePro,
    rewardsPro,
    incomePro,
    networkPro,
  ].filter(Boolean) as string[];

  const cons = [
    yearlyFeeCon,
    incomeCon,
    foreignFeeCon,
  ].filter(Boolean) as string[];

  return cleanEditorialCopy({
    why: fallbackWhy(card, goalLabel, topCatLabel),
    welcomePromo: getWelcomePromoFor(key),
    pros,
    cons,
  });
}

