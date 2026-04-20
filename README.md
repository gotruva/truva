# Truva — Financial & Lifestyle Mastery

> **The best all-in-one Financial and Lifestyle comparison app in the world.**

Truva is a high-performance, mobile-first optimization platform designed to consolidate siloed financial and lifestyle data into actionable comparisons. We empower users to master their wealth, health, and mobility through precise after-tax engineering and transparent product discovery.

---

## 🚀 Strategic Foundation

If you are an AI model (Gemini, Claude, GPT) or a developer joining the project, **start here**:

1.  **[Master Project Charter](file:///c:/Users/betoa/Documents/truva/PROJECT_CHARTER.md)**: The definitive source for our vision, roadmap, and non-negotiable technical directives.
2.  **[AI Alignment (Gemini)](file:///c:/Users/betoa/Documents/truva/gemini.md)**: Strategic context tailored for Gemini models.
3.  **[Claude Reference](file:///c:/Users/betoa/Documents/truva/CLAUDE.md)**: Quick-reference for Claude Code sessions.
4.  **[GPT/Codex Context](file:///c:/Users/betoa/Documents/truva/GPT.md)**: Alignment for ChatGPT and GPT-4 based workflows.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database/Auth**: Supabase
- **Visuals**: Framer Motion + Recharts
- **Delivery**: Resend

## 📌 Current Rate Pipeline State

As of April 20, 2026, Truva's public bank-rate source of truth is Supabase `production` snapshots. `data/rates.json` is still the manual/seed catalog for metadata fallback and non-scraper products.

- Latest production snapshot: `cd66e6b9-edf8-493d-889e-98085cba0f2e`
- Public API: 47 hydrated products, no duplicate public IDs
- Raw snapshot: 57 products across 17 providers
- Key files: `lib/rates.ts`, `lib/rate-review.ts`, `scripts/verify-rate-pipeline.ts`
- Scraper workspace: `/Users/albertoaldaba/truva-scraping`
- Salmon scraper status: normalized TD output supports the official 6/9/12/24/36/48/60-month terms with aggregated effective/compounded tiers
- UNO #UNOearn status: term-specific scraper output supports 12 months at 4.75% and 24 months at 5.00%; the old generic UNO time-deposit staging product is disabled
- Threshold calculator status: PHP 500,000 on `salmon-td-60mo` uses the PHP 500k-999,999 tier, 7.41% gross / 5.928% after tax
- MVP hydration preserves scraper `validUntil` as promo condition expiry

---

## 🏃 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

---

## ⚖️ The "After-Tax" Rule

Every financial product on Truva must be displayed with its **After-Tax** equivalent. This is our core competitive moat. Refer to `lib/tax.ts` for the tax regime implementation.

---

© 2026 Truva. All rights reserved.
