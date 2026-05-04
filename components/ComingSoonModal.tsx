'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ComingSoonModalProps {
  categoryLabel: string;
  source: string;
  onClose: () => void;
}

export function ComingSoonModal({ categoryLabel, source, onClose }: ComingSoonModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }
      setStatus('success');
      sendGAEvent({ event: 'waitlist_signup', source });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 pb-8 pointer-events-none">
        <motion.div
          className="pointer-events-auto w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-brand-border dark:border-white/10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <h2 className="font-bold text-[15px] text-brand-textPrimary dark:text-gray-100">
              {categoryLabel} is coming soon
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-brand-textSecondary dark:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="px-5 pb-8 pt-2 text-center">
              <CheckCircle2 className="w-10 h-10 text-positive mx-auto mb-3" />
              <p className="font-semibold text-brand-textPrimary dark:text-gray-100">You&apos;re on the list!</p>
              <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-1">
                We&apos;ll notify you when {categoryLabel} launches.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-4">
              <p className="text-sm text-brand-textSecondary dark:text-gray-400">
                Leave your email and we&apos;ll notify you when it launches.
              </p>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={status === 'loading'}
                className="h-11"
              />
              {status === 'error' && (
                <p className="text-[13px] text-red-500 dark:text-red-400 -mt-2">{errorMsg}</p>
              )}
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand-primary dark:bg-blue-600 text-white hover:bg-brand-primaryDark dark:hover:bg-blue-500 rounded-xl h-10 font-bold text-[14px]"
              >
                {status === 'loading' ? 'Saving…' : 'Notify me'}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}
