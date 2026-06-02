import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

const isDev = process.env.NODE_ENV === 'development';

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
    // unsafe-eval added in dev only: React requires eval() for HMR and DevTools.
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: https:",
      // Supabase, DeFi data feeds, analytics.
      // GA4 (with Google Signals) sends collect beacons not only to
      // *.google-analytics.com but also to analytics.google.com and
      // www.google.com — all three must be allowed or hits are CSP-blocked.
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://yields.llama.fi https://www.googletagmanager.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://va.vercel-scripts.com`,
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

// Relaxed CSP scoped to the Keystatic admin only. The admin SPA needs eval
// (editor internals) and, in cloud mode, talks to keystatic.cloud + GitHub.
// The strict site-wide CSP is left untouched for every public route.
const keystaticHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      'img-src \'self\' data: blob: https:',
      "font-src 'self' data:",
      "connect-src 'self' https://keystatic.cloud https://*.keystatic.cloud https://api.github.com https://*.githubusercontent.com https://avatars.githubusercontent.com",
      "worker-src 'self' blob:",
      "frame-src 'self' https://keystatic.cloud https://*.keystatic.cloud",
    ].join('; '),
  },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  productionBrowserSourceMaps: false,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Every public route except the Keystatic admin + its API.
        source: '/((?!keystatic|api/keystatic).*)',
        headers: securityHeaders,
      },
      { source: '/keystatic', headers: keystaticHeaders },
      { source: '/keystatic/:path*', headers: keystaticHeaders },
    ];
  },
  async redirects() {
    return [
      {
        source: '/loans',
        destination: '/#categories',
        permanent: false,
      },
      {
        source: '/investing',
        destination: '/banking/money-market-funds',
        permanent: true,
      },
      {
        source: '/optimizer',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tracker',
        destination: '/',
        permanent: true,
      },
      {
        source: '/banking/articles',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/methodology',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/methodology/:path*',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
  },
});

export default withMDX(nextConfig);
