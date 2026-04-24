'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toggleProductPublish } from '@/lib/admin-actions';

interface ProductRow {
  id: string;
  provider_display_name: string;
  product_name: string;
  category: string;
  active_public: boolean;
  review_status: string;
  latest_rate?: number | string | null;
  days_since_verified?: number | null;
  is_stale?: boolean;
}

export function CatalogTabs({ products }: { products: ProductRow[] }) {
  const [activeTab, setActiveTab] = useState<string>('banks');
  const [isPending, startTransition] = useTransition();

  const tabs = [
    { id: 'banks', label: 'Banks' },
    { id: 'govt', label: 'Govt' },
    { id: 'uitf', label: 'UITFs' },
    { id: 'defi', label: 'DeFi' },
    { id: 'credit_card', label: 'Credit Cards' },
  ];

  const handleToggle = (productId: string, currentValue: boolean) => {
    startTransition(async () => {
      try {
        await toggleProductPublish(productId, 'active_public', !currentValue);
      } catch (err) {
        alert('Failed to toggle publish status.');
        console.error(err);
      }
    });
  };

  const filtered = products.filter(p => {
    if (activeTab === 'banks') return ['banks', 'digital_bank', 'traditional_bank', 'savings', 'time_deposit'].includes(p.category);
    if (activeTab === 'govt') return ['govt', 'government_bond', 'government_savings', 'government_fixed_income'].includes(p.category);
    if (activeTab === 'uitf') return ['uitfs', 'uitf', 'mutual_fund', 'money_market_fund'].includes(p.category);
    if (activeTab === 'defi') return ['defi', 'defi_pool'].includes(p.category);
    if (activeTab === 'credit_card') return ['credit_card', 'credit-cards'].includes(p.category);
    return p.category === activeTab;
  });

  return (
    <div>
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Product
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Staging Rate
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Published
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Freshness
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No products found in this category.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-900/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {product.provider_display_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300 flex flex-col">
                    <span>{product.product_name}</span>
                    <span className="text-xs text-slate-400 font-mono">{product.id}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-right text-slate-700 dark:text-slate-300">
                    {product.latest_rate != null ? `${(Number(product.latest_rate) * 100).toFixed(2)}%` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      product.review_status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      product.review_status === 'pending_review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {product.review_status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    <button
                      onClick={() => handleToggle(product.id, product.active_public)}
                      disabled={isPending}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 ${
                        product.active_public ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className="sr-only">Toggle publish status</span>
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          product.active_public ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    {product.days_since_verified != null ? (
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.is_stale 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {product.days_since_verified}d ago
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/rates/edit/${product.id}`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
