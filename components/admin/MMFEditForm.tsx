'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveMMFMetadata } from '@/lib/admin-actions';

interface MMFEditFormProps {
  fundId: string;
  provider: string;
  name: string;
  initialData: {
    trust_fee_pct?: number | null;
    min_initial?: number | null;
    min_additional?: number | null;
    redemption_days?: number | null;
    fund_page_url?: string | null;
    navpu_url?: string | null;
    is_active?: boolean;
  };
}

export function MMFEditForm({ fundId, provider, name, initialData }: MMFEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [trustFeePct, setTrustFeePct] = useState(initialData.trust_fee_pct !== null && initialData.trust_fee_pct !== undefined ? String(initialData.trust_fee_pct) : '');
  const [minInitial, setMinInitial] = useState(initialData.min_initial !== null && initialData.min_initial !== undefined ? String(initialData.min_initial) : '');
  const [minAdditional, setMinAdditional] = useState(initialData.min_additional !== null && initialData.min_additional !== undefined ? String(initialData.min_additional) : '');
  const [redemptionDays, setRedemptionDays] = useState(initialData.redemption_days !== null && initialData.redemption_days !== undefined ? String(initialData.redemption_days) : '');
  const [fundPageUrl, setFundPageUrl] = useState(initialData.fund_page_url || '');
  const [navpuUrl, setNavpuUrl] = useState(initialData.navpu_url || '');
  const [isActive, setIsActive] = useState(initialData.is_active !== false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        trust_fee_pct: trustFeePct === '' ? null : Number(trustFeePct),
        min_initial: minInitial === '' ? null : Number(minInitial),
        min_additional: minAdditional === '' ? null : Number(minAdditional),
        redemption_days: redemptionDays === '' ? null : Number(redemptionDays),
        fund_page_url: fundPageUrl || null,
        navpu_url: navpuUrl || null,
        is_active: isActive,
      };

      await saveMMFMetadata(fundId, payload);
      alert('MMF Metadata saved successfully!');
      router.push('/admin/mmf');
    } catch (err: any) {
      alert(`Error saving MMF: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {provider} — {name}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fund ID: {fundId}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Trust Fee (%)
            </label>
            <input
              type="number"
              step="0.001"
              value={trustFeePct}
              onChange={(e) => setTrustFeePct(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 0.5"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Redemption Days (T+X)
            </label>
            <input
              type="number"
              step="1"
              value={redemptionDays}
              onChange={(e) => setRedemptionDays(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 1"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Min. Initial Deposit
            </label>
            <input
              type="number"
              step="0.01"
              value={minInitial}
              onChange={(e) => setMinInitial(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 1000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Min. Additional Deposit
            </label>
            <input
              type="number"
              step="0.01"
              value={minAdditional}
              onChange={(e) => setMinAdditional(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. 100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Fund Page URL (Affiliate or Info)
            </label>
            <input
              type="url"
              value={fundPageUrl}
              onChange={(e) => setFundPageUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="https://..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              NAVPU URL (Scraper Target)
            </label>
            <input
              type="url"
              value={navpuUrl}
              onChange={(e) => setNavpuUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="https://..."
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className="sr-only">Toggle active status</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Fund is Active (Displayed to public)
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.push('/admin/mmf')}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save MMF Metadata'}
          </button>
        </div>
      </form>
    </div>
  );
}
