'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterSignup() {
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
        setMessage(data.message || 'Subscribed successfully!');
        setEmail('');
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
    <section className="max-w-xl mx-auto py-16 px-4 text-center">
      <h3 className="text-[28px] leading-tight font-bold text-brand-textPrimary dark:text-gray-100 mb-3">
        Be the First to Know
      </h3>
      <p className="text-brand-textSecondary dark:text-gray-400 mb-8 text-[16px]">
        New banks, new features, rate changes — get notified when something on Truva updates. No fluff, just the signal.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading' || status === 'success'}
          className="h-12 bg-white border-brand-border focus-visible:ring-brand-primary placeholder:text-gray-400"
        />
        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="h-12 px-8 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold rounded-md transition-colors"
        >
          {status === 'loading' ? 'Subscribing...' : 'Notify me'}
        </Button>
      </form>

      {status === 'success' && <p className="text-positive text-sm mt-4 font-medium">{message}</p>}
      {status === 'error' && <p className="text-danger text-sm mt-4 font-medium">{message}</p>}

      <p className="text-xs text-brand-textSecondary dark:text-gray-400 mt-6">
        Free. No spam. Unsubscribe anytime.
      </p>
    </section>
  );
}
