'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Moon, Sun, MessageSquare, X, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Compare Rates', href: '/#deposit-rates' },
  { label: 'Calculator', href: '/#calculator' },
];

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.4 2C6.48 2 2.6 5.578 2.6 10.037c0 2.546 1.12 4.791 2.912 6.349l.012 3.228 3.088-1.72c.875.24 1.808.37 2.788.37 4.92 0 8.8-3.578 8.8-7.985C20.2 5.578 16.32 2 11.4 2zm4.72 10.95c-.32.352-.76.575-1.33.697-.28.061-.573.071-.854-.062-.64-.305-1.265-.636-1.89-.958-.394-.203-.765-.434-1.099-.718a11.34 11.34 0 01-1.777-2.135 5.83 5.83 0 01-.667-1.451c-.197-.72.06-1.318.492-1.778.193-.203.434-.255.697-.184.123.032.218.116.298.225.34.462.66.934.917 1.448.149.295.116.596-.1.86-.09.11-.19.215-.285.322-.087.097-.096.198-.041.313.44.923 1.1 1.633 2.053 2.044.115.05.216.034.31-.055.113-.107.218-.218.327-.326.24-.238.52-.285.806-.14.518.262 1.03.537 1.538.816.224.123.256.283.183.51z" />
    </svg>
  );
}

const FeedbackModal = dynamic(
  () => import('@/components/FeedbackModal').then((mod) => mod.FeedbackModal)
);

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/80 dark:bg-slate-950/80 border-b border-brand-border/60 dark:border-white/5 h-[76px] flex items-center px-4 md:px-8 shrink-0 transition-colors duration-300 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src="/truva-logo-blue.png"
            alt="Truva"
            width={134}
            height={36}
            priority
            className="block h-8 w-auto dark:hidden"
          />
          <Image
            src="/truva-logo-white.png"
            alt="Truva"
            width={134}
            height={36}
            priority
            className="hidden h-8 w-auto dark:block"
          />
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-[14px] font-semibold text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <a
            href="https://invite.viber.com/?g2=AQAVVY5OHy%2FfvlZdu7vUh%2FIkJ5fqL16B58XFTULkk1mS4%2BUU9O8ZAwYKbEqW4TCX"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200"
          >
            <ViberIcon className="w-5 h-5" />
            <span className="hidden sm:inline text-[14px] font-semibold">Join our Community</span>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline text-[14px] font-semibold">Feedback</span>
          </Button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-brand-textPrimary dark:text-gray-300"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex lg:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-brand-textPrimary dark:text-gray-300"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-4 right-4 top-[76px] z-50 rounded-2xl border border-brand-border bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 border-t border-brand-border pt-4 dark:border-white/10">
            <a
              href="https://invite.viber.com/?g2=AQAVVY5OHy%2FfvlZdu7vUh%2FIkJ5fqL16B58XFTULkk1mS4%2BUU9O8ZAwYKbEqW4TCX"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
            >
              <ViberIcon className="h-5 w-5" />
              Join our Community
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsFeedbackOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
            >
              <MessageSquare className="h-4 w-4" />
              Send feedback
            </button>
          </div>
        </div>
      )}

      {isFeedbackOpen && (
        <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
      )}
    </header>
  );
}
