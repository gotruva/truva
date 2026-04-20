'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { type ThemeProviderProps } from 'next-themes';

// Dynamically import the provider with SSR disabled.
// This prevents Next.js from ever evaluating the script-injecting logic on the server.
const NextThemesProvider = dynamic(
  () => import('next-themes').then((mod) => mod.ThemeProvider),
  { ssr: false }
);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // We return a fragment for initial SSR/hydration, and only render the
  // provider on the client.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider {...props} enableColorScheme={false}>
      {children}
    </NextThemesProvider>
  );
}
