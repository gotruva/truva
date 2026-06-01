'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Settings, Check, X, Shield } from 'lucide-react';

// Self-contained cookie helpers to avoid external library dependencies
const COOKIE_NAME = 'truva_cookie_consent';

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : null;
};

const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax; Secure";
};

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false, // strict opt-in default
  });

  // Handle client-side mount to avoid hydration mismatch
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
      const savedConsent = getCookie(COOKIE_NAME);
      if (!savedConsent) {
        // No consent saved yet, show the banner
        setIsOpen(true);
      } else {
        try {
          const parsed = JSON.parse(savedConsent) as ConsentPreferences;
          setPreferences(parsed);
        } catch {
          setIsOpen(true);
        }
      }
    });
  }, []);

  const saveConsent = (updatedPreferences: ConsentPreferences) => {
    // If they accept analytics, keep the cookie for 365 days. 
    // If they decline, write a session-only cookie (days = 0) so we can re-prompt on their next session.
    const days = updatedPreferences.analytics ? 365 : 0;
    setCookie(COOKIE_NAME, JSON.stringify(updatedPreferences), days);
    setPreferences(updatedPreferences);
    setIsOpen(false);

    // Update Google Consent Mode v2
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: updatedPreferences.analytics ? 'granted' : 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
    });
  };

  const handleDeclineAll = () => {
    saveConsent({
      essential: true,
      analytics: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 left-0 z-50 p-4 md:p-6 flex justify-center md:justify-end animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-brand-border/80 dark:border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 text-brand-textPrimary dark:text-gray-100">
        {!showPreferences ? (
          // Standard Banner View
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-primaryLight dark:bg-brand-primary/10 rounded-lg text-brand-primary shrink-0">
                <Cookie className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base md:text-lg font-sans">Cookie Preferences</h3>
                <p className="text-brand-textSecondary dark:text-gray-400 text-sm leading-relaxed">
                  We use cookies and Google Analytics 4 pseudonymously to understand how you interact with our rate tools, filters, and calculators. This helps us optimize Truva. We never collect PII. 
                  Read our{' '}
                  <Link href="/privacy" className="text-brand-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>{' '}
                  for full compliance disclosures under RA 10173.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-4 rounded-lg bg-brand-primary hover:bg-brand-primaryDark text-white text-sm font-semibold transition-colors duration-200 shadow-md shadow-brand-primary/10"
              >
                Accept All
              </button>
              <button
                onClick={handleDeclineAll}
                className="flex-1 py-2 px-4 rounded-lg bg-brand-surface hover:bg-brand-border/40 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-brand-textSecondary dark:text-gray-300 text-sm font-semibold border border-brand-border/60 dark:border-white/5 transition-colors duration-200"
              >
                Decline Analytics
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="py-2 px-3 rounded-lg hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-textSecondary dark:text-gray-400 hover:text-brand-textPrimary dark:hover:text-white transition-colors duration-200"
                aria-label="Customize cookie settings"
              >
                <Settings className="h-5 w-5 mx-auto" />
              </button>
            </div>
            
            <p className="text-[11px] text-brand-textSecondary dark:text-gray-500 text-center leading-relaxed">
              Analytics cookies are disabled by default. Your preferences can be updated at any time.
            </p>
          </div>
        ) : (
          // Preferences Customization View
          <div className="space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border/40 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-primary" />
                <h3 className="font-bold text-base md:text-lg font-sans">Preferences</h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded-lg hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-textSecondary dark:text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex justify-between gap-4 p-3 bg-brand-surface/40 dark:bg-slate-800/30 rounded-xl border border-brand-border/30 dark:border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <span>Essential Cookies</span>
                    <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-brand-primaryLight dark:bg-brand-primary/10 text-brand-primary font-medium">Required</span>
                  </div>
                  <p className="text-brand-textSecondary dark:text-gray-400 text-xs leading-relaxed">
                    Necessary for safety, theme storage, and maintaining your privacy choices. Cannot be turned off.
                  </p>
                </div>
                <div className="flex items-center self-center shrink-0">
                  <div className="h-5 w-5 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center opacity-70 cursor-not-allowed">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <label 
                className="flex justify-between gap-4 p-3 bg-brand-surface/40 dark:bg-slate-800/30 rounded-xl border border-brand-border/30 dark:border-white/5 cursor-pointer hover:border-brand-primary/40 dark:hover:border-brand-primary/30 transition-colors duration-200"
                htmlFor="analytics-toggle"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm">Analytics Cookies</div>
                  <p className="text-brand-textSecondary dark:text-gray-400 text-xs leading-relaxed">
                    Collects coarse, aggregated usage metrics under GA4 (ID <code>G-VKNLYP2027</code>) to help us identify issues and improve rates calculators. Contains no PII.
                  </p>
                </div>
                <div className="flex items-center self-center shrink-0">
                  <div className="relative inline-flex items-center select-none">
                    <input
                      id="analytics-toggle"
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          analytics: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-brand-border dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary transition-colors duration-200"></div>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSavePreferences}
                className="flex-1 py-2 px-4 rounded-lg bg-brand-primary hover:bg-brand-primaryDark text-white text-sm font-semibold transition-colors duration-200 shadow-md shadow-brand-primary/10"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="py-2 px-4 rounded-lg bg-brand-surface hover:bg-brand-border/40 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-brand-textSecondary dark:text-gray-300 text-sm font-semibold border border-brand-border/60 dark:border-white/5 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
