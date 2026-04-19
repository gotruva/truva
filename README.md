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

- Latest production snapshot: `732a7711-8192-4ca7-8a11-f1c59db5b032`
- Public API: 40 hydrated products, no duplicate public IDs
- Raw snapshot: 43 products across 17 providers
- Key files: `lib/rates.ts`, `lib/rate-review.ts`, `scripts/verify-rate-pipeline.ts`
- Scraper workspace: `/Users/albertoaldaba/truva-scraping`
- Salmon scraper status: normalized TD output emits `salmon-td-6mo` and `salmon-td-12mo` with aggregated tiers
- Next data task: Supabase-enabled Salmon-only staging/review/publish pass

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
