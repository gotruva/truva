'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-brand-border dark:border-white/10 h-[72px] flex items-center px-4 md:px-8 shrink-0 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[26px] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-500 dark:from-blue-400 dark:to-indigo-400 group-hover:opacity-80 transition-opacity">Truva</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-slate-800/50 text-brand-textPrimary dark:text-gray-100 font-semibold text-sm transition-all text-brand-primary dark:text-blue-400">Compare Rates</Link>
          <Link href="/calculator" className="px-4 py-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-slate-800/50 text-brand-textSecondary dark:text-gray-400 font-semibold text-sm transition-all hover:text-brand-textPrimary dark:hover:text-gray-200">Yield Calculator</Link>
          <Link href="/optimizer" className="px-4 py-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-slate-800/50 text-brand-textSecondary dark:text-gray-400 font-semibold text-sm transition-all hover:text-brand-textPrimary dark:hover:text-gray-200">PDIC Optimizer</Link>
        </div>
        <div className="flex items-center gap-3">
           {mounted && (
             <button
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-brand-textPrimary dark:text-gray-300"
               aria-label="Toggle Dark Mode"
             >
               {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
             </button>
           )}
           <Link href="/optimizer" className="text-sm font-bold hidden sm:block text-brand-textPrimary dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 transition-colors px-2">Log In</Link>
           <Link href="/optimizer" className="bg-brand-textPrimary dark:bg-white text-white dark:text-brand-textPrimary hover:scale-105 active:scale-95 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-2">
             <span>Get Started</span>
           </Link>
        </div>
      </div>
    </header>
  );
}
