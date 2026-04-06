'use client';

import { useState } from 'react';

export function PartnerCTA() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('success');
      setMessage(data.message);
    } else {
      setStatus('error');
      setMessage(data.error || 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-brand-border dark:border-white/10">
      <p className="text-brand-textSecondary dark:text-gray-400 mb-2">
        Are you a bank, fintech, or financial institution?
      </p>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold bg-brand-surface dark:bg-white/5 border border-brand-border dark:border-white/10 text-brand-textPrimary dark:text-gray-200 hover:bg-brand-border/40 dark:hover:bg-white/10 transition-colors duration-200"
        >
          Partner with Truva
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}

      {open && status !== 'success' && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end max-w-xl mx-auto"
        >
          <input
            type="text"
            placeholder="Your name"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] bg-brand-surface dark:bg-white/5 border border-brand-border dark:border-white/10 text-brand-textPrimary dark:text-gray-200 placeholder:text-brand-textSecondary dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-textPrimary/30"
          />
          <input
            type="text"
            placeholder="Company"
            required
            value={form.company}
            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] bg-brand-surface dark:bg-white/5 border border-brand-border dark:border-white/10 text-brand-textPrimary dark:text-gray-200 placeholder:text-brand-textSecondary dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-textPrimary/30"
          />
          <input
            type="email"
            placeholder="Work email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] bg-brand-surface dark:bg-white/5 border border-brand-border dark:border-white/10 text-brand-textPrimary dark:text-gray-200 placeholder:text-brand-textSecondary dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-textPrimary/30"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-brand-textPrimary dark:bg-gray-200 text-white dark:text-slate-900 hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending…' : 'Get in touch'}
          </button>
        </form>
      )}

      {status === 'success' && (
        <p className="mt-3 text-[13px] font-semibold text-brand-textPrimary dark:text-gray-200">
          {message}
        </p>
      )}

      {status === 'error' && (
        <p className="mt-2 text-[13px] text-red-500">{message}</p>
      )}
    </div>
  );
}
