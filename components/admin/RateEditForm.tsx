'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveManualRateEdit } from '@/lib/admin-actions';

interface RateEditFormProps {
  productId: string;
  providerName: string;
  productName: string;
  initialPayload: Record<string, any>;
}

export function RateEditForm({ productId, providerName, productName, initialPayload }: RateEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract initial values
  // Stored as decimals visually. 
  // e.g. 0.05 -> 5.00
  const parsePercent = (val: any) => {
    if (typeof val === 'number') return (val * 100).toFixed(2);
    return '';
  };

  const [headlineRate, setHeadlineRate] = useState(parsePercent(initialPayload?.headlineRate));
  const [grossRate, setGrossRate] = useState(parsePercent(initialPayload?.baseRate?.grossRate));
  const [afterTaxRate, setAfterTaxRate] = useState(parsePercent(initialPayload?.baseRate?.afterTaxRate));

  const [tierType, setTierType] = useState(initialPayload?.tierType || 'flat');
  const [sourceUrl, setSourceUrl] = useState(initialPayload?.sourceUrl || '');

  const handleSubmit = async (e: React.FormEvent, autoApprove: boolean) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...initialPayload,
        headlineRate: headlineRate ? Number(headlineRate) / 100 : null,
        tierType: tierType,
        sourceUrl: sourceUrl,
        baseRate: {
          ...(initialPayload?.baseRate || {}),
          grossRate: grossRate ? Number(grossRate) / 100 : null,
          afterTaxRate: afterTaxRate ? Number(afterTaxRate) / 100 : null,
        }
      };

      await saveManualRateEdit(productId, payload, autoApprove);
      alert('Rate saved successfully.');
      router.push('/admin/rates/catalog');
    } catch (err: any) {
      alert(`Error saving rate: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {providerName} — {productName}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Product ID: {productId}
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Headline Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={headlineRate}
              onChange={(e) => setHeadlineRate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 6.50"
            />
            <p className="mt-1 text-xs text-slate-500">The advertised max rate</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tier Type
            </label>
            <select
              value={tierType}
              onChange={(e) => setTierType(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="flat">Flat</option>
              <option value="blended">Blended / Stepped</option>
              <option value="threshold">Threshold</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Base Gross Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={grossRate}
              onChange={(e) => setGrossRate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Base After-Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={afterTaxRate}
              onChange={(e) => setAfterTaxRate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Source URL (optional)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            Save for Review
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50"
          >
            Save & Approve Now
          </button>
        </div>
      </form>
    </div>
  );
}
