'use client';

import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-primary dark:bg-slate-950 text-white py-20 px-4 md:px-8 transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-blue-50">Truva AI Optimization</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.1]">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-400 dark:to-blue-600">True Yield</span> of Your Cash
          </h1>
          
          <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl text-blue-100/90 dark:text-gray-300">
            Stop guessing. We calculate the exact after-tax returns for PH digital banks and DeFi so you can maximize your savings immediately.
          </p>
        </motion.div>

        <motion.div 
          className="w-full max-w-2xl relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Redesigned AI Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-white/40 dark:border-slate-700 p-2 pl-4 rounded-2xl shadow-2xl backdrop-blur-xl">
               <Search className="w-6 h-6 text-brand-primary dark:text-blue-500 shrink-0" />
               <input 
                 type="text" 
                 placeholder="Ask Truva AI: 'Where should I park ₱100k for 6 months?'" 
                 className="flex-1 bg-transparent text-brand-textPrimary dark:text-white outline-none px-4 font-medium h-12 w-full text-base md:text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500" 
               />
               <button className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primaryDark dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors rounded-xl px-5 h-12 font-semibold shrink-0">
                 <span>Analyze</span>
                 <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-blue-200/80 dark:text-gray-400 font-medium">
            <span>Popular:</span>
            <button className="hover:text-white transition-colors">&quot;Maya vs Tonik&quot;</button>
            <span className="opacity-50">&bull;</span>
            <button className="hover:text-white transition-colors">&quot;Best PDIC insured&quot;</button>
            <span className="opacity-50">&bull;</span>
            <button className="hover:text-white transition-colors">&quot;High yield DeFi&quot;</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
