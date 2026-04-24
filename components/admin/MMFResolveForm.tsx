'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertMMFDailyRate, copyLastMMFRate } from '@/lib/admin-actions';
import { getErrorMessage } from '@/lib/error-message';

interface MMFResolveFormProps {
  fundId: string;
  slug: string;
  name: string;
  provider: string;
  targetDate: string;
}

export function MMFResolveForm({ fundId, slug, name, provider, targetDate }: MMFResolveFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  void slug;

  // Form states
  const [date, setDate] = useState(targetDate);
  const [navpu, setNavpu] = useState('');
  const [grossYield, setGrossYield] = useState('');
  const [netYield, setNetYield] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!navpu || !grossYield || !netYield) {
        throw new Error('Please fill in all mandatory rate fields.');
      }

      const payload = {
        date,
        navpu: Number(navpu),
        gross_yield_1y: Number(grossYield) / 100, // User enters e.g. 5.5 for 5.5%
        after_tax_yield: (Number(grossYield) * 0.80) / 100, // Default 20% tax
        net_yield: Number(netYield) / 100,
      };

      await upsertMMFDailyRate(fundId, payload);
      alert('Manual rate submitted successfully. The issue should now be resolved.');
      router.push('/admin/mmf');
    } catch (error: unknown) {
      alert(`Error: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoChange = async () => {
    if (!confirm("This will copy the most recent known rate to the target date. Select 'OK' if you have verified that the rate has not changed since the last update.")) return;
    setIsSubmitting(true);
    try {
      await copyLastMMFRate(fundId, date);
      alert('Rate verified as unchanged and data health issue resolved.');
      router.push('/admin/mmf');
    } catch (error: unknown) {
      alert(`Error: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900/50 dark:bg-sky-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-sky-900 dark:text-sky-200">Rate Unchanged?</h3>
            <p className="text-sm text-sky-700 dark:text-sky-400">
              If you verified that the rate has not changed since the last update, you can simply acknowledge it.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNoChange}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:scale-95 disabled:opacity-50"
          >
            ✓ Confirm: No Change Since Yesterday
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolution Targets</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Fund</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{provider} - {name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Target Resolution Date</p>
            <p className="text-sm font-medium text-rose-600 font-mono">{targetDate}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Effective Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">NAVPU</label>
          <input
            type="number"
            step="0.000001"
            value={navpu}
            onChange={(e) => setNavpu(e.target.value)}
            placeholder="e.g. 1.234567"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Gross 1Y Yield (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={grossYield}
              onChange={(e) => setGrossYield(e.target.value)}
              placeholder="e.g. 5.50"
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
            <span className="absolute right-3 top-2 text-slate-400">%</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Net Yield (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={netYield}
              onChange={(e) => setNetYield(e.target.value)}
              placeholder="e.g. 4.40"
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
            <span className="absolute right-3 top-2 text-slate-400">%</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">Net yield = (Gross * 0.80) - trust fee. Verify against KIIDS.</p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Manual Rate'}
        </button>
      </div>
    </form>
    </div>
  );
}
