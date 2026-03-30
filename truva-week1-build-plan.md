# Truva — Week 1 Build Plan

**Sprint start:** April 2026 | **Scope:** Day 1 scaffold through Vercel deployment readiness

---

## Prerequisites (Manual — Must Be Done Before Any Code)

These must be completed by the founder before implementation begins:

1. **GitHub repo** — Create `truva-ph` (or similar), push current docs-only state as initial commit
2. **Supabase project** — Create at supabase.com. Copy: Project URL, anon key, service_role key
3. **Resend account** — Create at resend.com. Copy: API key
4. **`.env.local`** — Create in repo root with all 4 vars (see Phase 7 for exact var names). Never commit this file.
5. **`.gitignore`** — Verify it covers `.env.local` before first code commit

---

## Phase 1 — Scaffold

Run these CLI commands in the repo root. Do not hand-write these files.

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
npx shadcn-ui@latest init
npx shadcn-ui@latest add button tooltip badge tabs
npm install zod lucide-react class-variance-authority clsx tailwind-merge
```

**What gets generated:**
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `components/ui/*` (shadcn primitives)
- `lib/utils.ts`

**Immediately after scaffold — update `tailwind.config.ts`** with the full brand color tokens:

```ts
colors: {
  brand: {
    primary:      '#0052FF',
    primaryDark:  '#0039B3',
    primaryLight: '#EBF0FF',
    textPrimary:  '#0A0B0D',
    textSecondary:'#5B616E',
    bg:           '#FFFFFF',
    surface:      '#F8F9FB',
    border:       '#E4E7EC',
  },
  positive: '#12B76A',
  warning:  '#F79009',
  danger:   '#F04438',
  defi:     '#7B61FF',
}
```

---

## Phase 2 — Type Foundation

Build these before any component or data file. Everything else depends on them.

### `types/index.ts`
Single source of truth for all shared TypeScript interfaces:

```ts
type RiskLevel = 'Low' | 'Medium' | 'DeFi';
type FilterCategory = 'all' | 'banks' | 'govt' | 'uitfs' | 'defi';

interface RateProduct {
  id: string;
  name: string;
  provider: string;
  logo: string;           // path to /public/logos/
  category: FilterCategory;
  grossRate: number;      // e.g. 0.15 for 15%
  afterTaxRate: number;   // grossRate * 0.80 (or grossRate if taxExempt)
  taxExempt: boolean;
  conditions: string;
  balanceCap: number | null;
  lockInDays: number;     // 0 = liquid
  riskLevel: RiskLevel;
  pdic: boolean;
  affiliateUrl: string;
  referralCode: string;
  payoutAmount: number;   // in PHP
  palagoScore: number;    // 1–5 (placeholder = 3 until Week 7)
}

interface AffiliateLink {
  bank: string;
  referralCode: string;
  baseUrl: string;
  payoutAmount: number;
  utmSource: 'tool' | 'newsletter' | 'article';
  utmMedium: 'comparison-table' | 'calculator' | 'pdic-optimizer';
  utmCampaign: string;
}

interface DefiRate {
  apy: number;
  apyMean30d: number;
  tvlUsd: number;
}

interface NewsletterPayload {
  email: string;
}
```

### `lib/env.ts`
Fail-fast validator. App throws on startup if any required env var is missing — prevents cryptic runtime failures.

```ts
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
```

### `lib/tax.ts`
Pure utility functions — no external dependencies.

```ts
// Standard bank interest (20% FWT)
export const calcAfterTaxPhp = (grossRate: number): number => grossRate * 0.80;

// Dollar time deposits (7.5% FCD rate)
export const calcAfterTaxDollarTD = (grossRate: number): number => grossRate * 0.925;

// Tax-exempt products (MP2, T-Bills, RTBs)
export const calcTaxExempt = (grossRate: number): number => grossRate;
```

---

## Phase 3 — Data Layer

### `data/rates.json`
Static seed data for 6 banks + 1 DeFi placeholder:

| id | Gross | After-Tax | Tax-Exempt | Balance Cap | Lock-In | Risk | PDIC | Payout |
|---|---|---|---|---|---|---|---|---|
| `maya-savings` | 15.00% | 12.00% | No | ₱100,000 | Liquid | Low | ✅ | ₱100 |
| `tonik-savings` | 4.00% | 3.20% | No | None | Liquid | Low | ✅ | ₱60 |
| `uno-td-365` | 5.75% | 4.60% | No | None | 365 days | Low | ✅ | — |
| `gotyme-savings` | 3.50% | 2.80% | No | None | Liquid | Low | ✅ | ₱50 |
| `cimb-gsave` | 2.50% | 2.00% | No | None | Liquid | Low | ✅ | — |
| `maribank-savings` | 2.60% | 2.08% | No | None | Liquid | Low | ✅ | ₱50 |
| `aave-v3-usdc-base` | live | live | No | None | None | DeFi | ❌ | — |

> Aave's `grossRate` and `afterTaxRate` are stored as `0` — they are overwritten by the live DefiLlama fetch at runtime before the page renders.
>
> Maya `conditions`: `"Requires ₱500–35,000/month in Maya spending. Promo rate applies to first ₱100,000 balance."`
>
> All `palagoScore` values: `3` (placeholder ★★★ — real algorithm in Week 7)

### `lib/defi.ts`
DefiLlama API client with 5-minute ISR caching:

```ts
export async function fetchAaveBaseUSDC(): Promise<DefiRate | null> {
  try {
    const res = await fetch('https://yields.llama.fi/pools', {
      next: { revalidate: 300 },
    });
    const { data } = await res.json();
    const pool = data.find(
      (p: any) => p.project === 'aave-v3' && p.chain === 'Base' && p.symbol === 'USDC'
    );
    if (!pool) return null;
    return { apy: pool.apy, apyMean30d: pool.apyMean30d, tvlUsd: pool.tvlUsd };
  } catch {
    return null; // degrade gracefully — Aave row shows "--" if API is down
  }
}
```

### `lib/rates.ts`
Merges static JSON + live DeFi data. Server-side only.

```ts
export async function getLiveRates(): Promise<RateProduct[]> {
  const staticRates = await getStaticRates(); // reads rates.json
  const defiRate = await fetchAaveBaseUSDC();
  return staticRates.map((r) => {
    if (r.id === 'aave-v3-usdc-base' && defiRate) {
      return { ...r, grossRate: defiRate.apy / 100, afterTaxRate: defiRate.apy / 100 };
    }
    return r;
  });
}
```

### `lib/supabase.ts`
Stub only — Week 3 will wire the real client.

```ts
// Lazy getter — does not instantiate until first call
export function createSupabaseServerClient() {
  console.warn('Supabase not yet configured — stub returning null (Week 3)');
  return null;
}
```

---

## Phase 4 — API Routes

### `app/api/rates/route.ts`
- GET only — returns merged rate data
- Rejects all non-GET methods with 405

### `app/api/defi/route.ts`
- DefiLlama proxy with ISR `revalidate: 300`
- Returns `{ apy, apyMean30d, tvlUsd }`

### `app/api/newsletter/route.ts`
- POST only
- Validates email with Zod server-side (not frontend)
- In-memory rate limit: 5 requests/min per IP
  - Note: resets on deploy — acceptable for MVP since Resend is not yet wired. Upgrade to Upstash Redis in Week 3.
- Returns stub success response

---

## Phase 5 — UI Components

### `components/AffiliateButton.tsx`
- Opens affiliate URL in new tab
- Appends full UTM query string to URL
- `rel="noopener noreferrer"` on every link — hard rule, never skip
- Disclosure tooltip on hover (shadcn `Tooltip`): `"We earn ₱[amount] if you open this account. This doesn't affect the rates we show."`
- Button: `rounded-[6px]`, `text-sm font-semibold`, `bg-brand-primary hover:bg-brand-primaryDark`

### `components/RateCard.tsx`
Mobile-only — `block md:hidden`. Exact wireframe:

```
┌─────────────────────────────────────────┐
│  [Logo]  Bank Name        [Risk chip]   │
│                                         │
│  12.00% after tax    ← 40px / 700       │
│  (15.00% gross)      ← 15px / 400       │
│                                         │
│  Requires ₱500–35k/mo in Maya spending  │
│                                         │
│  [🔒 Liquid] [✅ PDIC] [🟢 Low risk]    │
│                                         │
│  [       Open Account →             ]   │
│                                         │
│  ⓘ We earn ₱100 if you open this account│
└─────────────────────────────────────────┘
```

Card CSS: `bg-brand-surface border border-brand-border rounded-lg p-5 mb-4`

### `components/RateTable.tsx`
Desktop-only — `hidden md:block`. Columns:

| Product | Rate | After-Tax | Conditions | Lock-In | Risk | PDIC | CTA |
|---|---|---|---|---|---|---|---|

- Row height: `h-14` (56px)
- Rate cells: `font-variant-numeric: tabular-nums`
- After-tax column highlighted in `text-positive font-semibold`
- Conditions: truncated with tooltip on hover

### `components/RateSection.tsx`
Client Component (`'use client'`) — owns filter state, renders either table or cards.

```ts
// Receives pre-fetched data as props from the RSC parent
// Uses useState for active filter tab
// Passes filtered data to RateTable (desktop) and RateCard list (mobile)
```

### `components/FilterTabs.tsx`
Sticky filter bar. Tabs: **All | Banks | Govt | UITFs | DeFi**

```css
position: sticky;
top: 0;
z-index: 10;
background: white;
box-shadow: 0 1px 4px rgba(0,0,0,0.06);
```

### `components/YieldCalculator.tsx`
Stub placeholder — renders empty `<section>` with "Calculator — Week 3" text. Slot exists so `app/page.tsx` wiring is correct.

### `components/NewsletterSignup.tsx`
- Client Component
- Email input + submit button
- On submit: POST to `/api/newsletter`
- Shows success state on 200, error message on 400/429/500
- Fine print: "Your privacy is respected. Unsubscribe anytime."

---

## Phase 6 — Pages

### `app/layout.tsx`
- Inter font via `next/font/google`
- `<html lang="en">`
- Global metadata export:
  ```ts
  export const metadata = {
    title: 'PH Savings Rate Comparison | Truva — Earn More After Tax',
    description: 'Compare savings rates from Maya, Tonik, GoTyme and more. See after-tax returns — the real rate, not the gross number. Updated weekly.',
    openGraph: { ... },
  };
  ```
- Footer with required disclaimers:
  > Rates verified as of [date]. All figures shown after 20% Final Withholding Tax unless marked tax-exempt. This is not financial advice.
  > We earn a referral fee if you open an account through our links. This does not affect the rates we show.

### `app/page.tsx`
React Server Component — fetches data before streaming HTML. No client-side fetch on initial load.

```ts
// Server Component — no 'use client'
export default async function HomePage() {
  const rates = await getLiveRates(); // runs server-side, in initial HTML
  return (
    <>
      <YieldCalculator /> {/* stub */}
      <RateSection rates={rates} /> {/* Client Component island */}
      <NewsletterSignup />
    </>
  );
}
```

> **Why this matters:** Rate data is in the initial HTML response. No loading spinners, no client fetch waterfall. This is how FCP < 1.5s and Lighthouse Mobile 90+ are achieved. If this is changed to a `useEffect` fetch, the Lighthouse score will collapse.

Also includes Schema.org JSON-LD structured data block per Section 11 of the briefing.

### `app/calculator/page.tsx`
Stub — placeholder heading + correct SEO metadata. (Week 3)

### `app/optimizer/page.tsx`
Stub — protected route. Middleware redirects unauthenticated users to `/`. (Week 4)

### `app/tracker/page.tsx`
Stub — protected route. (Week 6)

---

## Phase 7 — Security Layer

### `middleware.ts` (repo root — NOT inside `/app`)

Default-deny pattern. Any route not on the allowlist is treated as protected.

```ts
const PUBLIC_ROUTES = ['/', '/calculator'];
const PUBLIC_PREFIXES = ['/api/rates', '/api/defi', '/api/newsletter', '/_next', '/logos', '/favicon'];
```

- Unauthenticated requests to `/optimizer` or `/tracker` redirect to `/`
- Uses `supabase.auth.getUser()` NOT `getSession()` (getSession only reads local JWT without server validation)
- New pages added in future weeks are automatically protected — must be consciously allowlisted to make public

### `next.config.js` updates

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://yields.llama.fi",
  },
];

module.exports = {
  productionBrowserSourceMaps: false, // never expose source maps in prod
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

### Environment Variables

| Variable | `NEXT_PUBLIC_`? | Where used |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **Never** | Server only |
| `RESEND_API_KEY` | ❌ **Never** | Server only |

> The service_role key bypasses all Supabase RLS. If it ever gets a `NEXT_PUBLIC_` prefix, every row in every table is exposed to anyone on the internet.

### `.gitignore` additions

```
.env
.env.local
.env.production
.env*.local
.env.development
```

---

## Phase 8 — Static Assets

Create `/public/logos/` with placeholder SVGs for each bank. Use a colored square with bank initials until real press-kit logos are sourced.

Files needed: `maya.svg`, `tonik.svg`, `uno.svg`, `gotyme.svg`, `cimb.svg`, `maribank.svg`, `aave.svg`

> **Sourcing real logos:** Maya press kit at maya.ph/brand. Tonik at tonikbank.com/press. For any bank without a press kit, the placeholder SVG ships in Week 1.

---

## What Is NOT Being Built in Week 1

Per the briefing (do not build unless explicitly instructed):

- Pre-qualification flow (3-step input before card list) — Week 2
- Full 8-bank table expansion — Week 2
- Conditions tooltips — Week 2
- GA4 — Week 2
- Yield calculator (logic) — Week 3
- Supabase auth UI — Week 3
- Resend email wiring — Week 3
- PDIC optimizer — Week 4
- MP2, RTBs, T-Bills, UITFs — Week 5
- TD Tracker — Week 6
- Palago Score algorithm — Week 7

---

## Vercel Deployment Checklist

1. Connect GitHub repo to new Vercel project (framework: Next.js, auto-detected)
2. Set all 4 env vars in Vercel dashboard → Settings → Environment Variables (Production + Preview + Development)
3. Confirm `productionBrowserSourceMaps: false` is committed before first production deploy
4. Assign custom domain under Settings → Domains

---

## Verification Checklist

Run through every item after the build before declaring Week 1 done.

### Functionality
- [ ] `npm run dev` starts with no console errors
- [ ] "Maya" visible in raw page source (`view-source:`) — confirms RSC data fetch, not client-side
- [ ] `/api/defi` returns JSON with non-zero `apy` field
- [ ] `/api/rates` returns 7 entries; Aave entry has non-zero `grossRate`
- [ ] Filter tabs work: Banks shows only banks, DeFi shows only Aave, All shows all 7
- [ ] Affiliate button opens new tab with UTM params; disclosure tooltip appears on hover

### Mobile (375px viewport)
- [ ] No horizontal scroll
- [ ] Table is hidden (`display: none`)
- [ ] Cards visible, stacked vertically
- [ ] Hero rate number is ≥ 40px
- [ ] CTA button spans full width

### Desktop (800px+ viewport)
- [ ] Cards are hidden
- [ ] Table visible with all 8 columns
- [ ] Row height is 56px
- [ ] Rate numbers are right-aligned and tabular

### Security & API
- [ ] POST to `/api/rates` returns 405
- [ ] POST to `/api/newsletter` with invalid email returns 400
- [ ] 6th newsletter POST within 1 minute returns 429
- [ ] `/optimizer` and `/tracker` redirect to `/` when unauthenticated
- [ ] `npm run build` produces no `.js.map` files in `.next/static/chunks/`

### Production (after Vercel deploy)
- [ ] `curl -I [url]` shows `x-frame-options: DENY`
- [ ] `curl -I [url]` shows `x-content-type-options: nosniff`
- [ ] Lighthouse Mobile: Performance ≥ 90
- [ ] Lighthouse Mobile: FCP < 1.5s
- [ ] Lighthouse Mobile: LCP < 2.5s
- [ ] Lighthouse Mobile: CLS < 0.1

---

*Plan prepared by: Claude Code | March 30, 2026*
*For sprint: Truva Week 1 — Scaffold to Live URL*
