'use client'

type Props = {
  url: string
  provider: string
  compact?: boolean
}

export function MmfCtaButton({ url, provider, compact = false }: Props) {
  // Later: append UTM / affiliate tracking code here
  const affiliateUrl = url // e.g. `${url}?ref=truva`

  if (compact) {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs bg-brand-primary hover:bg-brand-primaryDark text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        Open
      </a>
    )
  }

  return (
    <div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full block text-center bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        Open Account →
      </a>
      <p className="text-center text-xs text-brand-textSecondary/40 mt-1.5">
        via {provider} · Truva may earn a referral fee
      </p>
    </div>
  )
}
