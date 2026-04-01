'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/80 dark:bg-slate-950/80 border-b border-brand-border/60 dark:border-white/5 h-[76px] flex items-center px-4 md:px-8 shrink-0 transition-colors duration-300 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="md:hidden p-2 -ml-2 rounded-md font-semibold text-brand-textPrimary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors active:scale-95 z-50 relative"
           >
              {isMobileMenuOpen ? ( // X icon
                 <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : ( // Hamburger
                 <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
           </button>
           <Link href="/" className="flex items-center gap-2 group">
             <span className="text-[28px] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-500 dark:from-blue-400 dark:to-indigo-400 group-hover:opacity-80 transition-opacity">Truva</span>
           </Link>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-4 py-2.5 rounded-full hover:bg-brand-surface dark:hover:bg-slate-800/80 font-semibold text-[15px] transition-all text-brand-textPrimary dark:text-gray-200">Compare Rates</Link>
          <Link href="/calculator" className="px-4 py-2.5 rounded-full hover:bg-brand-surface dark:hover:bg-slate-800/80 font-semibold text-[15px] transition-all text-brand-primary dark:text-blue-400">Yield Calculator</Link>
          <Link href="/optimizer" className="px-4 py-2.5 rounded-full hover:bg-brand-surface dark:hover:bg-slate-800/80 text-brand-textSecondary dark:text-gray-400 font-semibold text-[15px] transition-all hover:text-brand-textPrimary dark:hover:text-gray-200">PDIC Optimizer</Link>
        </nav>
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
           <Link href="/optimizer" className="text-[15px] font-bold hidden sm:block text-brand-textPrimary dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 transition-colors px-2">Log In</Link>
           <Link href="/optimizer" className="bg-brand-primary dark:bg-blue-600 text-white dark:text-white hover:bg-brand-primaryDark dark:hover:bg-blue-500 hover:scale-[1.03] active:scale-95 px-6 py-2.5 rounded-full font-bold text-[15px] transition-all shadow-md shadow-brand-primary/25 flex items-center gap-2">
             <span>Get Started</span>
           </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[76px] left-0 w-full bg-white dark:bg-slate-950 border-b border-brand-border dark:border-white/10 shadow-lg md:hidden z-40">
          <nav className="flex flex-col p-4 gap-2">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="px-4 py-3 rounded-xl hover:bg-brand-surface dark:hover:bg-slate-800 font-semibold text-brand-textPrimary dark:text-gray-200 text-lg">Compare Rates</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/calculator" className="px-4 py-3 rounded-xl hover:bg-brand-surface dark:hover:bg-slate-800 font-semibold text-brand-primary dark:text-blue-400 text-lg">Yield Calculator</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/optimizer" className="px-4 py-3 rounded-xl hover:bg-brand-surface dark:hover:bg-slate-800 font-semibold text-brand-textSecondary dark:text-gray-400 text-lg">PDIC Optimizer</Link>
            <div className="h-[1px] bg-brand-border dark:bg-white/10 my-2" />
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/optimizer" className="px-4 py-3 font-semibold text-brand-textPrimary dark:text-gray-200 text-lg">Log In</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/optimizer" className="mt-2 bg-brand-primary dark:bg-blue-600 text-white dark:text-white px-4 py-3 rounded-xl font-bold text-lg text-center shadow-md">Get Started</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
