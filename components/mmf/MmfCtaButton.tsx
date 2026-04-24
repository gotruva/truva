'use client';

type Props = {
  url: string;
  provider: string;
  compact?: boolean;
};

export function MmfCtaButton({ url, provider, compact = false }: Props) {
  const affiliateUrl = url;

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-primaryDark"
        >
          Open
        </a>
        <p className="max-w-[96px] truncate text-center text-[10px] text-brand-textSecondary/50 dark:text-white/35">
          via {provider}
        </p>
      </div>
    );
  }

  return (
    <div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl bg-brand-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-primaryDark"
      >
        Open account
      </a>
      <p className="mt-1.5 text-center text-xs text-brand-textSecondary/45">
        via {provider} | Truva may earn a referral fee
      </p>
    </div>
  );
}
