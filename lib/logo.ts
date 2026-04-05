const LOGO_SRC_MAP: Record<string, string> = {
  '/logos/aave.svg': '/logos/aave-mark.png',
  '/logos/banko.svg': '/logos/banko-mark.png',
  '/logos/bdo.svg': '/logos/bdo-mark.jpg',
  '/logos/bpi.svg': '/logos/bpi-mark.png',
  '/logos/btr.svg': '/logos/btr-mark.jpg',
  '/logos/cimb.svg': '/logos/cimb-mark.png',
  '/logos/dbp.svg': '/logos/dbp-mark.png',
  '/logos/diskartech.svg': '/logos/diskartech-mark.png',
  '/logos/gotyme.svg': '/logos/gotyme-mark.png',
  '/logos/hdmf.svg': '/logos/hdmf-mark.jpg',
  '/logos/komo.svg': '/logos/komo-mark.jpg',
  '/logos/landbank.svg': '/logos/landbank-mark.jpg',
  '/logos/maribank.svg': '/logos/maribank-mark.png',
  '/logos/maya.svg': '/logos/maya-mark.jpg',
  '/logos/netbank.svg': '/logos/netbank-mark.webp',
  '/logos/ofbank.svg': '/logos/ofbank-mark.jpg',
  '/logos/ownbank.svg': '/logos/ownbank-mark.png',
  '/logos/uniondigital.svg': '/logos/uniondigital-mark.jpg',
  '/logos/uno.svg': '/logos/uno-mark.jpg',
};

export function resolveLogoSrc(src: string): string {
  return LOGO_SRC_MAP[src] ?? src;
}
