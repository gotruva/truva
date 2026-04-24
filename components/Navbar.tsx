'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { BookOpenText, ChevronDown, Landmark, BarChart2, GraduationCap, Menu, MessageSquare, Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useHasMounted } from '@/lib/use-has-mounted';

const READ_LINKS = [
  {
    label: 'Banking',
    description: 'Rate guides, digital bank reviews, and account comparisons.',
    href: '/banking/articles',
    icon: Landmark,
  },
  {
    label: 'Investing',
    description: 'Money market funds, T-Bills, UITFs, and investing strategies.',
    href: '/investing',
    icon: BarChart2,
  },
  {
    label: 'Finance & Lifestyle',
    description: 'Tax explainers, PDIC basics, and practical money guides.',
    href: '/guides',
    icon: GraduationCap,
  },
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
  const pathname = usePathname();
  const hasMounted = useHasMounted();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReadOpen, setIsReadOpen] = useState(false);
  const [isMobileReadOpen, setIsMobileReadOpen] = useState(false);
  const readCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (readCloseTimeoutRef.current) clearTimeout(readCloseTimeoutRef.current);
    };
  }, []);

  const openReadMenu = () => {
    if (readCloseTimeoutRef.current) clearTimeout(readCloseTimeoutRef.current);
    setIsReadOpen(true);
  };

  const closeReadMenu = () => {
    if (readCloseTimeoutRef.current) clearTimeout(readCloseTimeoutRef.current);
    readCloseTimeoutRef.current = setTimeout(() => setIsReadOpen(false), 140);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileReadOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobileMenu(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobileMenuOpen]);

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return isActive
      ? 'relative px-3 py-2 text-[14px] font-bold text-brand-primary dark:text-blue-400 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-brand-primary dark:after:bg-blue-400 after:rounded-full transition-colors'
      : 'px-3 py-2 text-[14px] font-semibold text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-100 transition-colors';
  };

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

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" className={pathname === '/' ? 'relative px-3 py-2 text-[14px] font-bold text-brand-primary dark:text-blue-400 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-brand-primary dark:after:bg-blue-400 after:rounded-full transition-colors' : 'px-3 py-2 text-[14px] font-semibold text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-100 transition-colors'}>
            Savings
          </Link>
          <Link href="/banking/money-market-funds" className={navLinkClass('/banking/money-market-funds')}>
            Funds
          </Link>

          <div
            className="relative -mb-3 pb-3"
            onMouseEnter={openReadMenu}
            onMouseLeave={closeReadMenu}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[14px] font-semibold text-brand-textSecondary transition-colors hover:bg-gray-100 hover:text-brand-textPrimary dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100"
              aria-expanded={isReadOpen}
              aria-haspopup="true"
              onFocus={openReadMenu}
            >
              <BookOpenText className="h-4 w-4" />
              + Read
              <ChevronDown className={`h-4 w-4 transition-transform ${isReadOpen ? 'rotate-180' : ''}`} />
            </button>

            {isReadOpen && (
              <div
                className="absolute left-0 top-full z-50 w-[22rem] overflow-hidden rounded-[1.5rem] border border-brand-border bg-white/95 p-2 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
                onMouseEnter={openReadMenu}
                onMouseLeave={closeReadMenu}
              >
                <div className="space-y-1">
                  {READ_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-start gap-3 rounded-[1.15rem] px-3 py-3 transition-colors hover:bg-brand-surface dark:hover:bg-white/5"
                    >
                      <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                        <link.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-textPrimary transition-colors group-hover:text-brand-primary dark:text-gray-100">
                          {link.label}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <a
            href="https://invite.viber.com/?g2=AQAVVY5OHy%2FfvlZdu7vUh%2FIkJ5fqL16B58XFTULkk1mS4%2BUU9O8ZAwYKbEqW4TCX"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-semibold text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ViberIcon className="w-5 h-5" />
            <span className="hidden md:inline">Community</span>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          {hasMounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-brand-textPrimary dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
          )}

          <button
            onClick={() => isMobileMenuOpen ? closeMobileMenu() : setIsMobileMenuOpen(true)}
            className="flex lg:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-brand-textPrimary dark:text-gray-300"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close mobile navigation"
            onClick={closeMobileMenu}
            className="fixed inset-x-0 bottom-0 top-[76px] z-40 bg-slate-950/28 backdrop-blur-[2px] lg:hidden"
          />

          <div className="fixed left-4 right-4 top-[88px] z-50 rounded-2xl border border-brand-border bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-2.5 text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
              >
                Savings
              </Link>
              <Link
                href="/banking/money-market-funds"
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-2.5 text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
              >
                Funds
              </Link>

              <div className="rounded-xl border border-brand-border/70 bg-brand-surface/50 dark:border-white/10 dark:bg-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setIsMobileReadOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
                  aria-expanded={isMobileReadOpen}
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpenText className="h-4 w-4 text-brand-primary" />
                    + Read
                  </span>
                  <ChevronDown className={`h-4 w-4 text-brand-textSecondary transition-transform dark:text-gray-400 ${isMobileReadOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileReadOpen && (
                  <div className="space-y-1 px-2 pb-2">
                    {READ_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white dark:hover:bg-slate-800"
                      >
                        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                          <link.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand-textPrimary dark:text-gray-100">{link.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">{link.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="mt-4 border-t border-brand-border pt-4 dark:border-white/10">
              <a
                href="https://invite.viber.com/?g2=AQAVVY5OHy%2FfvlZdu7vUh%2FIkJ5fqL16B58XFTULkk1mS4%2BUU9O8ZAwYKbEqW4TCX"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
              >
                <ViberIcon className="h-5 w-5" />
                Join our Community
              </a>
              <button
                onClick={() => { closeMobileMenu(); setIsFeedbackOpen(true); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:text-gray-100 dark:hover:bg-slate-800"
              >
                <MessageSquare className="h-4 w-4" />
                Send feedback
              </button>
            </div>
          </div>
        </>
      )}

      {isFeedbackOpen && (
        <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
      )}
    </header>
  );
}
