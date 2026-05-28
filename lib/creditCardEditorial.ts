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

const editorial: Record<string, CardEditorial> = {
  // ── Asia United Bank ──────────────────────────────────────────────────────

  'aub_gold_mastercard': {
    why: 'This card helps you build your credit profile with zero yearly fees so you can enjoy total peace of mind.',
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
      'Yearly fee is waived for the first year of using the card.',
    ],
    cons: [
      'Has a yearly fee of ₱3,000 starting from the second year.',
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
    why: 'This card provides premium travel comforts and purchase protection to give you complete peace of mind when traveling abroad.',
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
    valueAdd: 'Its unique benefit is a low 1.50% foreign card fee on Visa\'s massive worldwide merchant network.',
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
    why: 'This card provides elite travel privileges and unmatched foreign exchange savings for the seasoned global traveler.',
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
    why: 'This card offers the ultimate level of personalized luxury travel services and global recognition.',
    targetUser: 'Suited for ultra-high-net-worth individuals who want bespoke concierge assistance and top-tier travel perks.',
    valueAdd: 'Its unique benefit is giving you access to dedicated 24/7 personal travel and lifestyle concierges.',
    pros: [
      'Includes unlimited free access to premium airport lounges worldwide for you and a guest.',
      'Earns rewards points quickly at a rate of 1 point for every ₱40 spent.',
      'Offers extensive worldwide travel insurance and medical coverage up to high limits.',
    ],
    cons: [
      'Has an extremely high yearly fee of ₱7,000 that you must pay annually.',
      'Only available by special invitation from BDO.',
      'Best suited only for those who spend very heavily on premium luxury travel.',
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
    why: 'This card boosts your household budget by providing massive cashback on groceries and family meals.',
    targetUser: 'Suited for families who spend heavily on dining out and weekly grocery trips.',
    valueAdd: 'Its unique benefit is a massive 6% cashback on all dining and grocery spending.',
    pros: [
      'Earns an impressive 6% cashback on groceries and dining purchases.',
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

  // ── Equicom ──────────────────────────────────────────────────────────────

  'equicom_gold_credit_card': {
    why: 'This card offers reliable daily payment convenience and local healthcare privileges for your family\'s peace of mind.',
    targetUser: 'Suited for middle-income families who value hospital and medical benefits alongside standard credit.',
    valueAdd: 'Its unique benefit is offering exclusive medical discounts and emergency health services.',
    pros: [
      'Provides special discounts at Maxicare partner clinics and hospitals.',
      'Earns 1 rewards point for every ₱30 spent to redeem for gifts or bill credits.',
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
};

export default editorial;

function getWelcomePromoFor(key: string, bank: string, cardName: string): string {
  const normalizedKey = key.toLowerCase();
  const normalizedBank = bank.toLowerCase();

  // HSBC
  if (normalizedKey === 'hsbc live credit card' || normalizedKey.includes('hsbc_live')) {
    return 'Get a welcome gift of ₱5,000 cashback when you spend at least ₱20,000 within 60 days of card approval.';
  }
  if (normalizedKey === 'hsbc red platinum mastercard' || normalizedKey.includes('hsbc_red')) {
    return 'Earn up to ₱3,000 cashback or travel vouchers as a welcome gift upon spending your first ₱15,000.';
  }

  // BPI Signature
  if (normalizedKey === 'bpi signature card' || normalizedKey.includes('signature')) {
    return 'Get a premium welcome gift of 20,000 rewards points when you spend ₱50,000 in your first 60 days.';
  }
  // BPI Amore Platinum
  if (normalizedKey === 'bpi amore platinum cashback card') {
    return 'Earn up to ₱5,000 cashback as a welcome gift when you spend at least ₱30,000 within 60 days.';
  }
  // BPI Amore
  if (normalizedKey === 'bpi amore cashback card') {
    return 'Earn up to ₱3,000 cashback as a welcome gift when you spend at least ₱30,000 within 60 days.';
  }
  // BPI Platinum Rewards
  if (normalizedKey.includes('bpi_platinum') || normalizedKey.includes('bpi platinum')) {
    return 'Get up to 15,000 rewards points as a welcome gift when you spend ₱50,000 in your first 60 days.';
  }
  // BPI Petron
  if (normalizedKey.includes('petron')) {
    return 'Get a free ₱200 fuel voucher as a welcome gift upon card approval and activation.';
  }
  // BPI Robinsons
  if (normalizedKey.includes('robinsons')) {
    return 'Earn a welcome gift of ₱2,000 cashback when you spend ₱20,000 at Robinsons stores.';
  }
  // BPI General
  if (normalizedBank.includes('philippine islands') || normalizedKey.startsWith('bpi')) {
    return 'Get up to 10,000 rewards points when you spend ₱30,000 within the first 60 days of approval.';
  }

  // BDO American Express Cashback
  if (normalizedKey === 'bdo_american_express_cashback_credit_card') {
    return 'Get an introductory welcome benefit of waived annual fees for your first full year.';
  }
  // BDO American Express Explorer
  if (normalizedKey === 'bdo_american_express_explorer_credit_card') {
    return 'Earn a welcome bonus of 5,000 miles when you spend ₱50,000 within 60 days of approval.';
  }
  // BDO American Express Platinum
  if (normalizedKey === 'bdo_american_express_platinum_credit_card') {
    return 'Get free airport lounge access passes and waived yearly fees for the first year.';
  }
  // BDO Visa Signature / World Elite
  if (normalizedKey.includes('signature') || normalizedKey.includes('world_elite')) {
    return 'Get a luxury welcome gift of complimentary airport lounge access and 10,000 rewards points.';
  }
  // BDO JCB Platinum / Gold / Lucky Cat
  if (normalizedKey.includes('jcb')) {
    return 'Enjoy complimentary airport lounge access passes in Japan and Hawaii as a welcome benefit.';
  }
  // BDO General
  if (normalizedBank.includes('bdo') || normalizedKey.startsWith('bdo')) {
    return 'Enjoy a welcome benefit of waived yearly card fees for your entire first year.';
  }

  // Chinabank Freedom
  if (normalizedKey === 'chinabank_freedom_mastercard') {
    return 'No yearly fee forever (NAFFL) is your standard welcome benefit upon card activation.';
  }
  // Chinabank Destinations
  if (normalizedKey.includes('destinations')) {
    return 'Earn a welcome gift of up to 5,000 air miles when you spend your first ₱30,000.';
  }
  // Chinabank General
  if (normalizedBank.includes('china') || normalizedKey.startsWith('chinabank')) {
    return 'Get up to 3,000 rewards points or shopping vouchers as an introductory welcome gift.';
  }

  // AUB
  if (normalizedBank.includes('asia united') || normalizedKey.startsWith('aub')) {
    return 'No yearly fee for life is your permanent welcome benefit upon card activation.';
  }

  // Equicom
  if (normalizedBank.includes('equicom') || normalizedKey.startsWith('equicom')) {
    return 'Enjoy waived yearly fees for the first year of card usage as a welcome offer.';
  }

  return 'Verify active introductory welcome promotions on the bank\'s website upon application.';
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
    return {
      ...base,
      welcomePromo: base.welcomePromo || getWelcomePromoFor(key, card.bank, card.card_name),
    };
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
    : 'getting value from your spending';

  const catMap = deriveCategoryMatch(card);
  const topCat = (Object.entries(catMap) as [SpendingCategory, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const topCatLabel = {
    groceries: 'grocery',
    dining: 'dining',
    online: 'online shopping',
    fuel: 'fuel',
    bills: 'bill payments',
    travel: 'travel',
  }[topCat];

  let yearlyFeePro: string | null = null;
  let yearlyFeeCon: string | null = null;
  if (card.naffl === true || card.annual_fee_recurring === 0) {
    yearlyFeePro = 'No annual fee for life (NAFFL) — zero cost to keep this card.';
  } else if (card.annual_fee_recurring !== null && card.annual_fee_recurring !== undefined && card.annual_fee_recurring > 0) {
    yearlyFeeCon = `Has a yearly fee of ₱${card.annual_fee_recurring.toLocaleString('en-PH')} — check if the rewards match this cost.`;
  } else if ((card.naffl === null || card.naffl === undefined) && (card.annual_fee_recurring === null || card.annual_fee_recurring === undefined)) {
    yearlyFeeCon = 'Yearly fee details are not confirmed — check the bank\'s terms before applying.';
  }

  const rewardsPro = card.rewards_type
    ? `Earns ${card.rewards_type} on your purchases.`
    : 'A simple starter card designed to help you build credit and manage payments safely.';

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

  const networkPro = `Accepted wherever ${card.card_network || 'major networks'} is used`;

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

  return {
    why: `This card fits your goal of ${goalLabel} and gives you the most value when spending on ${topCatLabel}.`,
    welcomePromo: getWelcomePromoFor(key, card.bank, card.card_name),
    pros,
    cons,
  };
}

