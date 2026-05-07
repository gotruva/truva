'use client';

import { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHasMounted } from '@/lib/use-has-mounted';

export function NewsletterSignup() {
  const hasMounted = useHasMounted();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed successfully.');
        setEmail('');
        sendGAEvent({ event: 'newsletter_signup_success' });
      } else {
        setStatus('error');
        
        // Handle zod format
        if (typeof data.error === 'object' && data.error._errors) {
            setMessage('Invalid email format.');
        } else {
            setMessage(data.error || 'Failed to subscribe.');
        }
      }
    } catch {
      setStatus('error');
      setMessage('Internal server error.');
    }
  };

  return (
    <div
      data-lpignore="true"
      data-1p-ignore="true"
      suppressHydrationWarning
    >
      {hasMounted ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          suppressHydrationWarning
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading' || status === 'success'}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            suppressHydrationWarning
            className="h-12 bg-white border-brand-border focus-visible:ring-brand-primary placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            data-lpignore="true"
            data-1p-ignore="true"
            suppressHydrationWarning
            className="h-12 px-8 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
          >
            {status === 'loading' ? 'Subscribing...' : 'Join the brief'}
          </Button>
        </form>
      ) : (
        <div className="mx-auto max-w-md rounded-md border border-brand-border/70 bg-white px-4 py-3 text-sm text-brand-textSecondary dark:border-white/10 dark:bg-slate-900 dark:text-gray-400">
          Loading signup form...
        </div>
      )}

      {status === 'success' && <p className="text-positive text-sm mt-4 font-medium text-center">{message}</p>}
      {status === 'error' && <p className="text-danger text-sm mt-4 font-medium text-center">{message}</p>}

      <p className="text-xs text-brand-textSecondary dark:text-gray-400 mt-5 text-center">
        Free. No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
