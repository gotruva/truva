'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, MessageSquare, X, CheckCircle, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FeedbackModal } from '@/components/FeedbackModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NAV_LINKS = [
  { label: 'Deposit Rates', href: '#deposit-rates' },
  { label: 'How To Start', href: '#how-to-start' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
];

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-brand-border dark:border-white/10 w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-brand-textSecondary"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-positive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100 mb-2">You&apos;re on the list!</h3>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm">
              We&apos;ll notify you when new features launch. Keep earning more after tax!
            </p>
            <Button onClick={onClose} className="mt-6 w-full bg-brand-primary hover:bg-brand-primary/90 text-white">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎉</span>
              <h3 className="text-xl font-bold text-brand-textPrimary dark:text-gray-100">Join the Waitlist</h3>
            </div>
            <p className="text-brand-textSecondary dark:text-gray-400 text-sm mb-6">
              Be the first to know when we launch new features — personalized rate alerts, portfolio tracker, and more.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textSecondary" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-brand-surface dark:bg-slate-950 border-brand-border dark:border-white/20 rounded-xl focus-visible:ring-brand-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all"
              >
                Join Waitlist
              </Button>
            </form>
            <p className="text-[11px] text-brand-textSecondary dark:text-gray-500 mt-3 text-center">
              No spam. Unsubscribe anytime.
            </p>
            <button
              onClick={onClose}
              className="w-full mt-4 text-[13px] text-brand-textSecondary dark:text-gray-500 hover:text-brand-textPrimary dark:hover:text-gray-300 transition-colors underline-offset-2 hover:underline"
            >
              No thanks, just browsing
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/80 dark:bg-slate-950/80 border-b border-brand-border/60 dark:border-white/5 h-[76px] flex items-center px-4 md:px-8 shrink-0 transition-colors duration-300 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-[28px] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-500 dark:from-blue-400 dark:to-indigo-400 group-hover:opacity-80 transition-opacity">
            Truva
          </span>
        </Link>

        {/* Nav links — hidden on mobile */}
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
          {/* Join Waitlist CTA */}
          <Button
            onClick={() => setIsWaitlistOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 h-9 rounded-lg shadow-md shadow-orange-500/20 transition-all text-[14px]"
          >
            <span className="hidden sm:inline">Join Waitlist</span>
            <span className="sm:hidden">Waitlist</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-1.5 text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-gray-200"
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
        </div>
      </div>

      <AnimatePresence>
        {isFeedbackOpen && (
          <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
        )}
        {isWaitlistOpen && (
          <WaitlistModal onClose={() => setIsWaitlistOpen(false)} />
        )}
      </AnimatePresence>
    </header>
  );
}
