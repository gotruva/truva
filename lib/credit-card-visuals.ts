import type { CreditCard as CreditCardType } from '@/types';
import { SCRAPE_REPORT_STATUS_MAP } from '@/lib/credit-card-visual-status';

export type CreditCardVisualStatus =
  | 'clean-card'
  | 'context-art'
  | 'truva-fallback';

export type CreditCardVisualManifestStatus =
  | 'official-art'
  | 'official-context-art'
  | 'truva-fallback';

export type CreditCardVisualSourceAsset = {
  cardKeys: readonly string[];
  assetPath?: string;
  sourceUrl: string;
  checkedAt: string;
  status: CreditCardVisualManifestStatus;
  note?: string;
};

export type CreditCardVisualAsset = Omit<CreditCardVisualSourceAsset, 'assetPath' | 'status'> & {
  assetPath?: string;
  originalAssetPath?: string;
  status: CreditCardVisualStatus;
};

export const CLEAN_CARD_ASSET_ROOT = '/cards/clean';

const CHECKED_AT = '2026-05-21';

export const CREDIT_CARD_VISUAL_ASSETS = [
  {
    cardKeys: ['aub gold mastercard', 'aub_gold_mastercard'],
    assetPath: '/cards/clean/aub_gold_mastercard.webp',
    sourceUrl: 'https://online.aub.ph/creditcards/goldandplatinum',
    checkedAt: '2026-05-25',
    status: 'official-art',
  },
  {
    cardKeys: ['aub easy mastercard', 'aub_easy_mastercard'],
    assetPath: '/cards/clean/aub_easy_mastercard.webp',
    sourceUrl: 'https://online.aub.ph/creditcards/easyandclassic',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['aub classic mastercard', 'aub_classic_mastercard'],
    assetPath: '/cards/clean/aub_classic_mastercard.webp',
    sourceUrl: 'https://online.aub.ph/creditcards/easyandclassic#classic',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['aub platinum mastercard', 'aub_platinum_mastercard'],
    assetPath: '/cards/clean/aub_platinum_mastercard.webp',
    sourceUrl: 'https://online.aub.ph/creditcards/goldandplatinum#platinum',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['bpi amore cashback card'],
    assetPath: '/cards/bpi-amore-cashback-card.png',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-classic',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bpi amore platinum cashback card'],
    assetPath: '/cards/bpi-amore-platinum-cashback-card.png',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-platinum',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bpi corporate card'],
    assetPath: '/cards/bpi-corporate-card.webp',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/bpi-corporate-mastercard',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bpi edge card'],
    assetPath: '/cards/bpi-edge-card.png',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/bpi-edge-mastercard',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bpi gold rewards card'],
    assetPath: '/cards/bpi-gold-rewards-card.png',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/bpi-gold-mastercard',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bpi platinum rewards mastercard'],
    assetPath: '/cards/bpi-platinum-rewards-mastercard.png',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/bpi-platinum-rewards-mastercard',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bpi signature card'],
    assetPath: '/cards/bpi-signature-card.jpg',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/visa-signature',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['petron bpi card'],
    assetPath: '/cards/petron-bpi-card.png',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/petron-bpi-mastercard',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['robinsons cashback card'],
    assetPath: '/cards/robinsons-cashback-card.jpg',
    sourceUrl: 'https://www.bpi.com.ph/personal/cards/credit-cards/robinsons-cashback-card-visa',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo american express cashback credit card', 'american express cashback credit card'],
    assetPath: '/cards/bdo-american-express-cashback-credit-card.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo american express explorer credit card', 'american express explorer credit card'],
    assetPath: '/cards/bdo-american-express-explorer-credit-card.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo american express platinum credit card', 'american express platinum credit card'],
    assetPath: '/cards/bdo-american-express-platinum-credit-card.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo blue from american express', 'blue from american express'],
    assetPath: '/cards/bdo-blue-from-american-express.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo diamond unionpay', 'bdo diamond unionpay credit card'],
    assetPath: '/cards/bdo-diamond-unionpay.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo diners club international', 'bdo diners club international credit card'],
    assetPath: '/cards/bdo-diners-club-international.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo diners club premiere', 'bdo diners club premiere credit card'],
    assetPath: '/cards/bdo-diners-club-premiere.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo gold mastercard'],
    assetPath: '/cards/bdo-gold-mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo gold unionpay', 'bdo gold unionpay credit card'],
    assetPath: '/cards/bdo-gold-unionpay.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo installment card'],
    assetPath: '/cards/bdo-installment-card.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo jcb gold'],
    assetPath: '/cards/bdo-jcb-gold.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo jcb lucky cat'],
    assetPath: '/cards/bdo-jcb-lucky-cat.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo jcb platinum'],
    assetPath: '/cards/bdo-jcb-platinum.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo platinum mastercard'],
    assetPath: '/cards/bdo-platinum-mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo secured credit card'],
    assetPath: '/cards/clean/bdo_secured_credit_card.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/secured-credit-card',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo standard mastercard'],
    assetPath: '/cards/bdo-standard-mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo visa classic'],
    assetPath: '/cards/bdo-visa-classic.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo visa gold'],
    assetPath: '/cards/bdo-visa-gold.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo visa platinum'],
    assetPath: '/cards/bdo-visa-platinum.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo visa signature'],
    assetPath: '/cards/bdo-visa-signature.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['bdo world elite mastercard'],
    assetPath: '/cards/clean/bdo_world_elite_mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/personal/cards/credit-cards/mastercard/world-elite',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank athome visa platinum', 'chinabank home visa platinum'],
    assetPath: '/cards/clean/chinabank_athome_visa_platinum.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-at-home-visa-platinum',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank cash rewards mastercard'],
    assetPath: '/cards/clean/chinabank_cash_rewards_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-cash-rewards',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank destinations platinum mastercard', 'chinabank_destinations_platinum_mastercard'],
    assetPath: '/cards/clean/chinabank_destinations_platinum_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-destinations-platinum',
    checkedAt: '2026-05-25',
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank destinations world dollar mastercard', 'chinabank_destinations_world_dollar_mastercard'],
    assetPath: '/cards/clean/chinabank_destinations_world_dollar_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-destinations-world-dollar',
    checkedAt: '2026-05-25',
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank destinations world mastercard', 'chinabank_destinations_world_mastercard'],
    assetPath: '/cards/clean/chinabank_destinations_world_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-destinations-world',
    checkedAt: '2026-05-25',
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank freedom mastercard'],
    assetPath: '/cards/clean/chinabank_freedom_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-freedom',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank prime mastercard', 'chinabank_prime_mastercard'],
    assetPath: '/cards/clean/chinabank_prime_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-prime',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['chinabank platinum mastercard', 'chinabank_platinum_mastercard'],
    assetPath: '/cards/clean/chinabank_platinum_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-platinum',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest everyday titanium mastercard', 'eastwest_everyday_titanium_mastercard'],
    assetPath: '/cards/clean/eastwest_everyday_titanium_mastercard.webp',
    sourceUrl: 'https://www.eastwestbanker.com/creditcards/everyday-titanium-mastercard',
    checkedAt: '2026-06-01',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest gold mastercard', 'eastwest_gold_mastercard'],
    assetPath: '/cards/clean/eastwest_gold_mastercard.webp',
    sourceUrl: 'https://www.eastwestbanker.com/cards/creditcards/eastwest-gold-mastercard',
    checkedAt: '2026-06-07',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest platinum mastercard', 'eastwest_platinum_mastercard'],
    assetPath: '/cards/clean/eastwest_platinum_mastercard.webp',
    sourceUrl: 'https://www.eastwestbanker.com/cards/creditcards/platinum-mastercard',
    checkedAt: '2026-06-01',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest visa platinum', 'eastwest_visa_platinum'],
    assetPath: '/cards/clean/eastwest_visa_platinum.webp',
    sourceUrl: 'https://www.eastwestbanker.com/cards/creditcards/visa-platinum',
    checkedAt: '2026-06-07',
    status: 'official-art',
  },
  {
    cardKeys: ['equicom gold credit card'],
    assetPath: '/cards/equicom-gold-credit-card.webp',
    sourceUrl: 'https://www.equicomsavings.com/product-and-services/card-products/',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['hsbc live credit card', 'hsbc live plus credit card'],
    assetPath: '/cards/hsbc-live-plus-credit-card.webp',
    sourceUrl: 'https://www.hsbc.com.ph/credit-cards/products/liveplus/',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['hsbc red platinum mastercard'],
    assetPath: '/cards/hsbc-red-platinum-mastercard.jpg',
    sourceUrl: 'https://www.hsbc.com.ph/credit-cards/products/red-mastercard/',
    checkedAt: CHECKED_AT,
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank cashback visa', 'metrobank_cashback_visa'],
    assetPath: '/cards/clean/metrobank_cashback_visa.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/cashback',
    checkedAt: '2026-06-01',
    status: 'official-art',
  },
  {
    cardKeys: ['m free credit card', 'm_free_credit_card'],
    assetPath: '/cards/clean/m_free_credit_card.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/mfree',
    checkedAt: '2026-06-07',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank rewards plus visa', 'metrobank_rewards_plus_visa'],
    assetPath: '/cards/clean/metrobank_rewards_plus_visa.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/rewards',
    checkedAt: '2026-06-01',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank titanium mastercard', 'metrobank_titanium_mastercard'],
    assetPath: '/cards/clean/metrobank_titanium_mastercard.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/titanium',
    checkedAt: '2026-06-07',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank travel signature visa', 'metrobank_travel_signature_visa'],
    assetPath: '/cards/clean/metrobank_travel_signature_visa.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/travel-signature-visa',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank platinum mastercard', 'metrobank_platinum_mastercard'],
    assetPath: '/cards/clean/metrobank_platinum_mastercard.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/platinum',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank world mastercard', 'metrobank_world_mastercard'],
    assetPath: '/cards/clean/metrobank_world_mastercard.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/world',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank toyota platinum card', 'metrobank_toyota_platinum_card'],
    assetPath: '/cards/clean/metrobank_toyota_platinum_card.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/toyota',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['metrobank toyota card', 'metrobank_toyota_card'],
    assetPath: '/cards/clean/metrobank_toyota_card.webp',
    sourceUrl: 'https://www.metrobank.com.ph/personal/cards/credit-cards/toyota-classic',
    checkedAt: '2026-06-09',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc flex visa', 'rcbc_flex_visa'],
    assetPath: '/cards/clean/rcbc_flex_visa.webp',
    sourceUrl: 'https://rcbccredit.com/credit-cards/gold-and-classic-cards/flex-visa',
    checkedAt: '2026-06-02',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc black card platinum mastercard', 'rcbc_black_card_platinum_mastercard'],
    assetPath: '/cards/clean/rcbc_black_card_platinum_mastercard.webp',
    sourceUrl: 'https://rcbccredit.com/credit-cards/premium-cards/black-card-platinum-mastercard',
    checkedAt: '2026-06-08',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc classic mastercard', 'rcbc_classic_mastercard'],
    assetPath: '/cards/clean/rcbc_classic_mastercard.webp',
    sourceUrl: 'https://rcbccredit.com/credit-cards/gold-and-classic-cards/classic-card',
    checkedAt: '2026-06-08',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc gold mastercard', 'rcbc_gold_mastercard'],
    assetPath: '/cards/clean/rcbc_gold_mastercard.webp',
    sourceUrl: 'https://rcbccredit.com/credit-cards/gold-and-classic-cards/gold-card',
    checkedAt: '2026-06-08',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc diamond card platinum mastercard', 'rcbc_diamond_card_platinum_mastercard'],
    assetPath: '/cards/clean/rcbc_diamond_card_platinum_mastercard.webp',
    sourceUrl: 'https://rcbccredit.com/credit-cards/premium-cards/diamond-card-platinum-mastercard',
    checkedAt: '2026-06-08',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc airmiles visa signature', 'rcbc_airmiles_visa_signature'],
    assetPath: '/cards/clean/rcbc_airmiles_visa_signature.webp',
    sourceUrl: 'https://rcbccredit.com/credit-cards/premium-cards/airmiles-visa-signature',
    checkedAt: '2026-06-08',
    status: 'official-art',
  },
  {
    cardKeys: ['security bank wave mastercard', 'security_bank_wave_mastercard'],
    assetPath: '/cards/clean/security_bank_wave_mastercard.webp',
    sourceUrl: 'https://www.securitybank.com/personal/credit-cards/rebate/wave-mastercard',
    checkedAt: '2026-06-01',
    status: 'official-art',
  },
  {
    cardKeys: ['bdo_bench_mastercard'],
    assetPath: '/cards/clean/bdo_bench_mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/content/dam/bdounibank/en-ph/cbg-marketing/cards/credit-and-debit/master-card/bench-mastercard/MC-Bench-1125.png',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['bdo_hope_mastercard'],
    assetPath: '/cards/clean/bdo_hope_mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/content/dam/bdounibank/en-ph/cbg-marketing/cards/credit-and-debit/master-card/hope-mastercard/MC-HOPE-web-2.png',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['bdo_shopmore_mastercard'],
    assetPath: '/cards/clean/bdo_shopmore_mastercard.webp',
    sourceUrl: 'https://www.bdo.com.ph/content/dam/bdounibank/en-ph/cbg-marketing/cards/credit-and-debit/master-card/shopmore-mastercard/PERX-Card-Images_Periwinkle.png',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['bpi_ecredit_card'],
    assetPath: '/cards/clean/bpi_ecredit_card.webp',
    sourceUrl: 'https://s7ap1.scene7.com/is/image/bpi/hero_xs_Ecredit?qlt=85&wid=600&ts=1704788958666&dpr=off',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['cebu_pacific_gold_credit_card'],
    assetPath: '/cards/clean/cebu_pacific_gold_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/Ceb-Credit-Card-Gold_0726.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['cebu_pacific_platinum_credit_card'],
    assetPath: '/cards/clean/cebu_pacific_platinum_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/Ceb-Credit-Card-Plat_0726_0.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['go_rewards_gold_visa_credit_card'],
    assetPath: '/cards/clean/go_rewards_gold_visa_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/Go-Rewards-Gold-Front.png',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['go_rewards_platinum_visa_credit_card'],
    assetPath: '/cards/clean/go_rewards_platinum_visa_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/Go-Rewards-Plat-Front.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['hsbc_red_platinum_mastercard'],
    assetPath: '/cards/clean/hsbc_red_platinum_mastercard.webp',
    sourceUrl: 'https://www.hsbc.com.ph/content/dam/hsbc/ph/images/credit-cards/16975-hsbc-red-credit-card-dummy-300x189.jpg',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['u_platinum_mastercard'],
    assetPath: '/cards/clean/u_platinum_mastercard.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/ucard-mc_0.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['u_visa_platinum'],
    assetPath: '/cards/clean/u_visa_platinum.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/ucard-visa_0.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_cash_back_titanium_mastercard'],
    assetPath: '/cards/clean/unionbank_cash_back_titanium_mastercard.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Cash-Back-No-Name-MC.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_cash_back_visa_platinum_credit_card'],
    assetPath: '/cards/clean/unionbank_cash_back_visa_platinum_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Cash-Back-No-Name-Visa.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_lazada_credit_card'],
    assetPath: '/cards/clean/unionbank_lazada_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/2020-07/LAZ_UB-MASTERCARD-2020_CREDITCREDIT-NUMBERLESS.png',
    checkedAt: '2026-06-10',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_mercury_visa'],
    assetPath: '/cards/clean/unionbank_mercury_visa.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/mercury-visa.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_miles_plus_visa_signature_credit_card'],
    assetPath: '/cards/clean/unionbank_miles_plus_visa_signature_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Miles-No-Name-Visa.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_miles_plus_world_mastercard'],
    assetPath: '/cards/clean/unionbank_miles_plus_world_mastercard.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Miles-No-Name-MC.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_play_everyday_credit_card'],
    assetPath: '/cards/clean/unionbank_play_everyday_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/PlayEveryday-Credit.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_reserve_visa_infinite_credit_card'],
    assetPath: '/cards/clean/unionbank_reserve_visa_infinite_credit_card.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Reserve-No-Name-Visa.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_reserve_world_elite_mastercard'],
    assetPath: '/cards/clean/unionbank_reserve_world_elite_mastercard.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Reserve-No-Name-MC.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_rewards_platinum_mastercard'],
    assetPath: '/cards/clean/unionbank_rewards_platinum_mastercard.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/2023-UB-Card-Rewards-No-Name-MC.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_s_and_r_visa_platinum'],
    assetPath: '/cards/clean/unionbank_s_and_r_visa_platinum.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/UB-SnR-Card.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['unionbank_shell_power_visa_platinum'],
    assetPath: '/cards/clean/unionbank_shell_power_visa_platinum.webp',
    sourceUrl: 'https://www.unionbankph.com/sites/default/files/tmp/UB-Shell-Power.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest_dolce_vita_titanium_mastercard'],
    assetPath: '/cards/clean/eastwest_dolce_vita_titanium_mastercard.webp',
    sourceUrl: 'https://www.eastwestbanker.com/sites/default/files/2025-05/dolce-vita-titanium-mastercard-2025.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest_jcb_gold'],
    assetPath: '/cards/clean/eastwest_jcb_gold.webp',
    sourceUrl: 'https://www.eastwestbanker.com/sites/default/files/2025-05/jcb-gold_2025.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest_jcb_platinum'],
    assetPath: '/cards/clean/eastwest_jcb_platinum.webp',
    sourceUrl: 'https://www.eastwestbanker.com/sites/default/files/2025-05/jcb-platinum_2025.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['eastwest_priority_visa_infinite'],
    assetPath: '/cards/clean/eastwest_priority_visa_infinite.webp',
    sourceUrl: 'https://www.eastwestbanker.com/sites/default/files/2026-05/visa-infinite_0.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['landbank_classic_credit_card'],
    assetPath: '/cards/clean/landbank_classic_credit_card.webp',
    sourceUrl: 'https://www.landbank.com/storage/uploads/images/library/classic-banner/classic-banner-2026-01-15-f3b87490.webp',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['landbank_gold_credit_card'],
    assetPath: '/cards/clean/landbank_gold_credit_card.webp',
    sourceUrl: 'https://www.landbank.com/storage/uploads/images/library/gold-credit-card-banner/gold-credit-card-banner-2026-01-15-6d02d9c7.webp',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_gold_mastercard'],
    assetPath: '/cards/clean/maybank_gold_mastercard.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/personal/cards/credit-cards/mastercard-gold_inpage.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_platinum_mastercard'],
    assetPath: '/cards/clean/maybank_platinum_mastercard.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/personal/cards/credit-cards/mastercard-platinum_inpage.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_standard_mastercard'],
    assetPath: '/cards/clean/maybank_standard_mastercard.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/personal/cards/credit-cards/mastercard-standard_inpage.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_visa_classic'],
    assetPath: '/cards/clean/maybank_visa_classic.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/personal/cards/credit-cards/visa-classic_inpage.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_visa_gold'],
    assetPath: '/cards/clean/maybank_visa_gold.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/personal/cards/credit-cards/visa-gold_inpage.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_visa_infinite'],
    assetPath: '/cards/clean/maybank_visa_infinite.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/m2u/Visa_Infinite_copy.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['maybank_visa_platinum'],
    assetPath: '/cards/clean/maybank_visa_platinum.webp',
    sourceUrl: 'https://www.maybank.com.ph/iwov-resources/maybank-ph/img/ph/en/personal/cards/credit-cards/visa-platinum_inpage.jpg',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['pnb_diamond_unionpay'],
    assetPath: '/cards/clean/pnb_diamond_unionpay.webp',
    sourceUrl: 'https://www.pnb.com.ph/index.php/credit-cards?tpl=revamp',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['pnb_la_salle_green_hills_alumni_platinum_mastercard'],
    assetPath: '/cards/clean/pnb_la_salle_green_hills_alumni_platinum_mastercard.webp',
    sourceUrl: 'https://www.pnb.com.ph/index.php/credit-cards?tpl=revamp',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['pnb_ze_lo_mastercard'],
    assetPath: '/cards/clean/pnb_ze_lo_mastercard.webp',
    sourceUrl: 'https://www.pnb.com.ph/index.php/credit-cards?tpl=revamp',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_airasia_credit_card'],
    assetPath: '/cards/clean/rcbc_airasia_credit_card.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/AirAsia-Classic.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_airasia_platinum_credit_card'],
    assetPath: '/cards/clean/rcbc_airasia_platinum_credit_card.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/AA-Platinum.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_classic_jcb'],
    assetPath: '/cards/clean/rcbc_classic_jcb.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/jcb-classic.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_flex_gold_visa'],
    assetPath: '/cards/clean/rcbc_flex_gold_visa.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/flex-gold-visa.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_gold_jcb'],
    assetPath: '/cards/clean/rcbc_gold_jcb.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/JCB%20Gold(1).png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_hexagon_club_priority'],
    assetPath: '/cards/clean/rcbc_hexagon_club_priority.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/HEXAGON-CLUB-PRIORITY.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_hexagon_club_privilege'],
    assetPath: '/cards/clean/rcbc_hexagon_club_privilege.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/RCBC%20Hexagon%20Club%202022.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_jcb_platinum'],
    assetPath: '/cards/clean/rcbc_jcb_platinum.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/jcb-plat.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_landmark_anson_s_mastercard'],
    assetPath: '/cards/clean/rcbc_landmark_anson_s_mastercard.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/LA_MC_2.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_unionpay_diamond_card'],
    assetPath: '/cards/clean/rcbc_unionpay_diamond_card.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/unionpay.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_visa_infinite'],
    assetPath: '/cards/clean/rcbc_visa_infinite.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/visa-infinite.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_world_mastercard'],
    assetPath: '/cards/clean/rcbc_world_mastercard.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/RCBC%20World%20Mastercard%202024%20400px.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_ygc_rewards_plus'],
    assetPath: '/cards/clean/rcbc_ygc_rewards_plus.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/mc-black-ygc-2022.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['rcbc_zalora_credit_card'],
    assetPath: '/cards/clean/rcbc_zalora_credit_card.webp',
    sourceUrl: 'https://rcbccredit.com/img/card/ZALORA-Credit-Card-powered-by-RCBC-Bankard.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['security_bank_cashback_platinum_mastercard'],
    assetPath: '/cards/clean/security_bank_cashback_platinum_mastercard.webp',
    sourceUrl: 'https://www.securitybank.com/wp-content/uploads/2025/01/CCV2-CB_Platinum_Contactless_2022-2026.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['security_bank_gold_mastercard'],
    assetPath: '/cards/clean/security_bank_gold_mastercard.webp',
    sourceUrl: 'https://www.securitybank.com/wp-content/uploads/2025/01/CCV2-Gold_Contactless_2022-2026-300x200-1.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['security_bank_platinum_mastercard'],
    assetPath: '/cards/clean/security_bank_platinum_mastercard.webp',
    sourceUrl: 'https://www.securitybank.com/wp-content/uploads/2025/01/CCV2-Platinum_Contactless_2022-2026-300x200-1.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
  {
    cardKeys: ['security_bank_world_mastercard'],
    assetPath: '/cards/clean/security_bank_world_mastercard.webp',
    sourceUrl: 'https://www.securitybank.com/wp-content/uploads/2025/01/CCV2-World_Contactless_2022-2026-300x200-1.png',
    checkedAt: '2026-06-11',
    status: 'official-art',
  },
] as const satisfies CreditCardVisualSourceAsset[];

const VISUAL_ASSET_INDEX = new Map<string, CreditCardVisualSourceAsset>();

for (const asset of CREDIT_CARD_VISUAL_ASSETS) {
  for (const key of asset.cardKeys) {
    VISUAL_ASSET_INDEX.set(normalizeCreditCardVisualKey(key), asset);
  }
}

export function normalizeCreditCardVisualKey(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeCleanCreditCardAssetKey(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getCleanCreditCardAssetPath(value: string | null | undefined): string | null {
  const normalizedKey = normalizeCleanCreditCardAssetKey(value);
  return normalizedKey ? `${CLEAN_CARD_ASSET_ROOT}/${normalizedKey}.webp` : null;
}

export function getCreditCardVisualAsset(
  card: Pick<CreditCardType, 'normalized_card_key' | 'card_name' | 'bank'>,
): CreditCardVisualAsset | null {
  // Check scrape report status first â€” only clean-card rows get a real asset
  const reportKey = normalizeCleanCreditCardAssetKey(card.normalized_card_key);
  const reportStatus = reportKey ? SCRAPE_REPORT_STATUS_MAP[reportKey] : null;

  if (reportStatus !== 'clean-card') {
    // Return truva-fallback: no assetPath so CreditCardVisual shows fallback UI
    return {
      cardKeys: [card.normalized_card_key ?? card.card_name].filter(Boolean),
      sourceUrl: '',
      checkedAt: '',
      status: 'truva-fallback',
    };
  }

  const candidates = [
    card.normalized_card_key,
    card.card_name,
    `${card.bank} ${card.card_name}`,
  ];

  for (const candidate of candidates) {
    const asset = VISUAL_ASSET_INDEX.get(normalizeCreditCardVisualKey(candidate));
    if (asset) return resolveCreditCardVisualAsset(asset, card.normalized_card_key);
  }

  return null;
}

function resolveCreditCardVisualAsset(
  asset: CreditCardVisualSourceAsset,
  normalizedCardKey: string | null | undefined,
): CreditCardVisualAsset {
  if (asset.status === 'truva-fallback') {
    return {
      ...asset,
      status: 'truva-fallback',
    };
  }

  return {
    ...asset,
    assetPath: getCleanCreditCardAssetPath(normalizedCardKey) ?? asset.assetPath,
    originalAssetPath: asset.assetPath,
    status: asset.status === 'official-context-art' ? 'context-art' : 'clean-card',
  };
}
