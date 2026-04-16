'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Savings & Deposits', href: '/banking' },
  { label: 'Money Market Funds', href: '/banking/money-market-funds' },
]

function BankingTabNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-2 px-4 py-3 border-b border-brand-border dark:border-white/10 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/banking'
            ? pathname === '/banking'
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-primary text-white'
                : 'text-brand-textSecondary dark:text-white/50 hover:text-brand-textPrimary dark:hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function BankingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BankingTabNav />
      {children}
    </div>
  )
}
