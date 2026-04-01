import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

export function GoogleAnalytics() {
  // Use a placeholder ID if none is provided via env vars
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
  return <NextGoogleAnalytics gaId={measurementId} />;
}
