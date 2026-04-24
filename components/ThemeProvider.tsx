'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { type ThemeProviderProps } from 'next-themes';
import { useHasMounted } from '@/lib/use-has-mounted';

// Dynamically import the provider with SSR disabled.
// This prevents Next.js from ever evaluating the script-injecting logic on the server.
const NextThemesProvider = dynamic(
  () => import('next-themes').then((mod) => mod.ThemeProvider),
  { ssr: false }
);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  if (!useHasMounted()) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider {...props} enableColorScheme={false}>
      {children}
    </NextThemesProvider>
  );
}
