'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Client-side shortlist of credit cards, keyed by `normalized_card_key`.
 * Stored in localStorage only — no account, no server, no PII (consistent with
 * Truva's no-custody rule). Instances stay in sync within a tab via a custom
 * event, and across tabs via the native `storage` event.
 */
const STORAGE_KEY = 'truva.cards.saved';
const CHANGE_EVENT = 'truva:saved-cards-changed';

function readSaved(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((k): k is string => typeof k === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeSaved(keys: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    /* storage may be unavailable (private mode / quota) */
  }
  // Same-tab sync: the `storage` event does not fire in the tab that wrote it.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export interface UseSavedCards {
  /** Saved card keys (empty until hydrated on the client). */
  saved: string[];
  count: number;
  /** False during the first client render so SSR/markup never flashes wrong. */
  hydrated: boolean;
  isSaved: (key: string) => boolean;
  toggle: (key: string) => boolean; // returns the new saved state
  remove: (key: string) => void;
  clear: () => void;
}

export function useSavedCards(): UseSavedCards {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Defer the first read out of the synchronous effect body (mirrors the
    // finder's localStorage hydration) to avoid a cascading render.
    const raf = requestAnimationFrame(() => {
      setSaved(readSaved());
      setHydrated(true);
    });
    const sync = () => setSaved(readSaved());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((key: string) => {
    const current = readSaved();
    const isCurrentlySaved = current.includes(key);
    const next = isCurrentlySaved
      ? current.filter((k) => k !== key)
      : [...current, key];
    writeSaved(next);
    setSaved(next);
    return !isCurrentlySaved;
  }, []);

  const remove = useCallback((key: string) => {
    const next = readSaved().filter((k) => k !== key);
    writeSaved(next);
    setSaved(next);
  }, []);

  const clear = useCallback(() => {
    writeSaved([]);
    setSaved([]);
  }, []);

  const isSaved = useCallback((key: string) => saved.includes(key), [saved]);

  return { saved, count: saved.length, hydrated, isSaved, toggle, remove, clear };
}
