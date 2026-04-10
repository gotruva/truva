import path from 'path';
import { fileURLToPath } from 'url';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HSTS: force HTTPS for 1 year, including subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    // unsafe-inline retained for scripts: Next.js App Router injects inline bootstrap
    // scripts for hydration that cannot be nonced without a custom server setup.
    // unsafe-eval removed: it is not needed in production and allows dynamic code execution.
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: https:",
      // Supabase, DeFi data feeds, analytics
      "connect-src 'self' https://*.supabase.co https://yields.llama.fi https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
