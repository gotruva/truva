'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FeedbackType = 'Bug' | 'Feature Request' | 'Other';

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('Feature Request');
  const [message, setMessage] = useState('');
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
    if (message.trim().length < 10) {
      setErrorMsg('Please write at least 10 characters.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong.');
      }
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  const types: FeedbackType[] = ['Bug', 'Feature Request', 'Other'];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 pb-8 pointer-events-none">
        <motion.div
          className="pointer-events-auto w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-brand-border dark:border-white/10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <h2 className="font-bold text-[15px] text-brand-textPrimary dark:text-gray-100">
              Share Feedback
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-brand-textSecondary dark:text-gray-400 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="px-5 pb-8 pt-4 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-semibold text-brand-textPrimary dark:text-gray-100">Got it! Thank you.</p>
              <p className="text-sm text-brand-textSecondary dark:text-gray-400 mt-1">Your feedback helps us improve Truva.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-4">
              {/* Type pills */}
              <div className="flex gap-2">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${
                      type === t
                        ? 'bg-brand-primary text-white border-brand-primary dark:bg-blue-600 dark:border-blue-600'
                        : 'bg-transparent text-brand-textSecondary dark:text-gray-400 border-brand-border dark:border-white/15 hover:border-brand-primary dark:hover:border-blue-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Message textarea */}
              <div className="flex flex-col gap-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-brand-textPrimary dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-300 dark:bg-slate-800 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
                />
                <span className="text-right text-[11px] text-brand-textSecondary dark:text-gray-500">
                  {message.length}/500
                </span>
              </div>

              {/* Optional email */}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com (optional)"
              />

              {/* Error */}
              {status === 'error' && (
                <p className="text-[13px] text-red-500 dark:text-red-400">{errorMsg}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand-primary dark:bg-blue-600 text-white hover:bg-brand-primaryDark dark:hover:bg-blue-500 rounded-xl h-10 font-bold text-[14px]"
              >
                {status === 'loading' ? 'Sending…' : 'Send Feedback'}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}
