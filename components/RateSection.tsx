'use client';

import { useState } from 'react';
import { RateProduct, FilterCategory } from '@/types';
import { RateTable } from './RateTable';
import { RateCard } from './RateCard';
import { FilterTabs } from './FilterTabs';

import { motion, AnimatePresence } from 'framer-motion';

export function RateSection({ rates }: { rates: RateProduct[] }) {
  const [filter, setFilter] = useState<FilterCategory>('all');

  const filteredRates = rates.filter((r) => {
    if (filter === 'all') return true;
    return r.category === filter;
  });

  const sortedRates = [...filteredRates].sort((a, b) => b.afterTaxRate - a.afterTaxRate);

  return (
    <section>
      <FilterTabs active={filter} onChange={setFilter} />
      
      <div className="max-w-5xl mx-auto px-4 md:px-0">
        <RateTable rates={sortedRates} />
        
        <div className="md:hidden">
          <AnimatePresence mode="popLayout">
            {sortedRates.map((rate, i) => (
              <motion.div
                key={rate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <RateCard rate={rate} />
              </motion.div>
            ))}
          </AnimatePresence>
          {sortedRates.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="text-center text-brand-textSecondary dark:text-gray-400 py-8"
            >
              No products found for this category.
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
