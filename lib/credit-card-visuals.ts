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
    assetPath: '/cards/aub-gold-mastercard.webp',
    sourceUrl: 'https://online.aub.ph/creditcards/goldandplatinum',
    checkedAt: CHECKED_AT,
    status: 'official-context-art',
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
    cardKeys: ['chinabank destinations platinum mastercard'],
    assetPath: '/cards/chinabank-destinations-platinum-mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-destinations-platinum',
    checkedAt: CHECKED_AT,
    status: 'official-context-art',
  },
  {
    cardKeys: ['chinabank destinations world dollar mastercard'],
    assetPath: '/cards/chinabank-destinations-world-dollar-mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-destinations-world-dollar',
    checkedAt: CHECKED_AT,
    status: 'official-context-art',
  },
  {
    cardKeys: ['chinabank destinations world mastercard'],
    assetPath: '/cards/chinabank-destinations-world-mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-destinations-world',
    checkedAt: CHECKED_AT,
    status: 'official-context-art',
  },
  {
    cardKeys: ['chinabank freedom mastercard'],
    assetPath: '/cards/clean/chinabank_freedom_mastercard.webp',
    sourceUrl: 'https://www.chinabank.ph/credit-cards-freedom',
    checkedAt: CHECKED_AT,
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
  // Check scrape report status first — only clean-card rows get a real asset
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
