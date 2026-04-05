'use client';

import { Search, Sparkles } from 'lucide-react';
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
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.1]">
            See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-400 dark:to-blue-600">True Value</span> of Every Peso
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-blue-50">After-Tax. After Conditions. After the Fine Print.</span>
          </div>
          
          <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl text-blue-100/90 dark:text-gray-300">
            Compare how much your money could earn across PH digital banks and DeFi options, using real after-tax numbers instead of marketing rates.
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
             <div className="relative flex items-center bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-slate-700 p-2 pl-4 rounded-2xl shadow-xl backdrop-blur-xl opacity-90">
               <Search className="w-6 h-6 text-brand-textSecondary dark:text-gray-500 shrink-0" />
               <input 
                 type="text" 
                 disabled
                 placeholder="Where should I park ₱100k?" 
                 className="flex-1 bg-transparent text-brand-textSecondary dark:text-gray-400 outline-none px-4 font-medium h-12 w-full text-base md:text-lg placeholder:text-gray-400 cursor-not-allowed" 
               />
               
               {/* Coming in v2 Badge */}
               <div className="absolute -top-3 right-4 bg-brand-textPrimary text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 whitespace-nowrap z-20">
                 Coming in v2
               </div>

               <button disabled className="flex items-center justify-center gap-2 bg-brand-textSecondary/20 dark:bg-slate-700 text-brand-textSecondary dark:text-gray-400 cursor-not-allowed rounded-xl px-5 h-12 font-semibold shrink-0">
                 <span>Analyze</span>
               </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-blue-200/80 dark:text-gray-400 font-medium">
            <span>Popular:</span>
            <button className="hover:text-white transition-colors">&quot;Maya vs Tonik&quot;</button>
            <span className="opacity-50">&bull;</span>
            <button className="hover:text-white transition-colors">&quot;Best PDIC insured&quot;</button>
            <span className="opacity-50">&bull;</span>
            <button className="hover:text-white transition-colors">&quot;Higher earning DeFi&quot;</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
