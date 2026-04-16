import { resolveLogoSrc } from '@/lib/logo';

export function getProviderLogo(provider: string): string | null {
  const map: Record<string, string> = {
    'BDO Unibank': '/logos/bdo.svg',
    'BPI Wealth': '/logos/bpi.svg',
    'Land Bank of the Philippines': '/logos/landbank.svg',
    'Development Bank of the Philippines': '/logos/dbp.svg',
    'Metrobank': '/logos/metrobank-mark.png',
    'Security Bank Corporation': '/logos/securitybank-mark.png',
    'Philippine National Bank': '/logos/pnb-mark.png',
    'RCBC Trust Corporation': '/logos/rcbc-mark.png',
    'EastWest Banking Corporation': '/logos/eastwest-mark.png',
    'ATRAM Trust Corporation': '/logos/atram-mark.png',
    'Manulife IMTC': '/logos/manulife-mark.png',
    'First Metro Asset Management': '/logos/fami-mark.png',
  };
  return map[provider] || null;
}

export function ProviderLogo({
  provider,
  className,
  textClassName,
}: {
  provider: string;
  className?: string;
  textClassName?: string;
}) {
  const logo = getProviderLogo(provider);

  if (logo) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 ${
          className || 'h-10 w-10'
        }`}
      >
        <img
          src={resolveLogoSrc(logo)}
          alt={provider}
          className="h-full w-full object-contain p-[15%]"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Use the first letter of the provider
  const initial = provider.charAt(0);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-brand-border/60 bg-brand-surface text-brand-textSecondary shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300 ${
        className || 'h-10 w-10'
      }`}
    >
      <span className={`font-bold uppercase ${textClassName || 'text-sm'}`}>
        {initial}
      </span>
    </div>
  );
}
