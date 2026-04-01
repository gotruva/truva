# 🎨 UX/UI Strategy — Optimized User Flow & Design Principles

# Core Principle: Zero Friction to Value

The biggest UX mistake comparison sites make is asking users to create an account or answer questions **before** showing them anything useful. The target user — a young Filipino professional with ₱50K–₱500K in savings — needs to see value in the first 10 seconds or they leave.

> **Rule #1: Show the table first. Gate nothing at the top.**
> 

The landing page IS the product — not a marketing page with a CTA to sign up.

---

# Landing Page Structure (Above the Fold)

The rate comparison table should be visible without scrolling, with a simple calculator input sitting directly above it. The calculator and table are one unified component — this is the SingSaver pattern.

```
[ How much are you saving? ]  [ PHP ▾ ]  [ See My Returns → ]
─────────────────────────────────────────────────────────────
🏆 Maya Bank          15.00%    ₱6,250/mo after tax    [Open Account →]
   Tonik              6.00%     ₱2,500/mo after tax    [Open Account →]
   UNO Digital        5.75%     ₱2,395/mo after tax    [Open Account →]
   GoTyme             3.50%     ₱1,458/mo after tax    [Open Account →]
─────────────────────────────────────────────────────────────
[ Digital Banks ]  [ Time Deposits ]  [ DeFi ]  [ Gov't ]   ← sticky tabs
```

When the user enters an amount, the table **re-renders client-side instantly** with their actual projected after-tax earnings per bank. No page reload. No API call. Pure JavaScript state. The number becomes personal and real — that's the hook.

**What does NOT appear above the fold:**

- Newsletter signup form (signals "this is a blog", not a tool)
- Account creation prompt
- Hero marketing copy

---

# The 3-Question Pre-Qualification Flow

After the user sees the initial table, a subtle inline prompt appears — **not a modal, not a popup**:

> *"Get a personalized recommendation →"*
> 

Clicking opens a 3-step inline flow (no new page, no route change):

1. **How much?** — slider or input (pre-filled if they already typed it above)
2. **How long?** — Liquid / 3 months / 6 months / 1 year+
3. **Risk comfort?** — No risk (PDIC only) / Some risk ok / Include DeFi

**Output: Top 3 for You** — cards with a clear #1, one-sentence rationale each, and affiliate CTAs. Full table still accessible below via "See all options."

This flow should be completable in **under 30 seconds on mobile.**

---

# Mobile-First Card Layout

On desktop, a table works. On mobile — where most Filipino users will land — tables are unusable. Each bank becomes a card:

```
┌─────────────────────────────────────┐
│  🏦 Maya Bank              ⭐ 4.7    │
│  15.00% p.a.                         │
│  ₱6,250/month  |  After tax: ₱5,000 │
│  ⚡ Liquid  ✅ PDIC insured           │
│  ⚠️ Requires ₱500–35K spend/month   │
│                    [ Open Account → ]│
└─────────────────────────────────────┘
```

- Palago Score (e.g. 4.7/5) in the top-right of every card
- Sticky category filter tabs at the top of the screen as users scroll
- NerdWallet mobile pattern — cards, not tables

---

# Account Creation: Earn It, Don't Gate It

Never ask for signup upfront. Trigger account creation only when the user has already received value and the prompt feels natural:

| Trigger | Prompt |
| --- | --- |
| After 3-question flow | "Save your results and get weekly rate updates" |
| Clicking "Add Time Deposit" | TD Tracker requires free account |
| Using PDIC Optimizer | "Save your split plan" |
| After calculator result | "Get notified when a better rate appears" |

Each of these converts at much higher rates than a cold homepage signup prompt.

---

# Page Architecture (Keep It Flat)

Resist deep navigation. At launch, 5 routes only:

| Route | Purpose |
| --- | --- |
| `/` | Rate table + calculator (the whole product) |
| `/calculator` | Full yield calculator, shareable results |
| `/pdic-optimizer` | PDIC smart split tool |
| `/dashboard` | Logged-in users: TD tracker, saved plans |
| `/blog/[slug]` | SEO articles |

**No separate pages for each category at MVP.** Filter tabs on the homepage handle Digital Banks / Time Deposits / DeFi / Gov't switching without routing. Fewer pages = faster SEO indexing, simpler codebase, no user getting lost.

---

# The Shareable Result Card (Viral Loop)

After any calculation, generate a shareable image card on the fly:

> *"I'm earning ₱47,200/year more by switching to Maya + Tonik. Calculated on [Truva.ph](http://Truva.ph)"*
> 
- Zero-cost word-of-mouth
- One share on r/phinvest (357K members) or a Facebook finance group can drive 500+ visits
- Build this in **Week 4**
- Implementation: `html2canvas` or a pre-rendered OG image endpoint

---

# Technical Implementation Notes

All of this is achievable in Next.js 14 with no exotic tooling:

| Feature | Implementation |
| --- | --- |
| Rate table + calculator | Client-side React state, pre-loaded data from Supabase at build time (static generation) |
| Filter tabs | `useState` toggling which card rows render |
| Amount input re-sorting | Sort pre-loaded array by calculated yield client-side — zero API calls |
| Shareable card | `html2canvas` or pre-rendered OG image endpoint |
| Mobile cards | Tailwind responsive — table on `md:`, cards on mobile |

The entire landing page can be **statically generated** and served as near-instant HTML from Vercel's edge network — critical for mobile users on spotty PH mobile data connections.

---

# What to Avoid

- ❌ Wizard or onboarding flow before showing value — every step before the table is a drop-off point
- ❌ Data tables on mobile — cards only
- ❌ Newsletter signup above the table
- ❌ Showing every product category by default — default to "Top Picks", let users opt into "See all"
- ❌ Modal popups on first visit
- ❌ Account creation wall before any feature

---

# Reference Models

- **NerdWallet** — mobile card layout, sticky category filters, progressive personalization
- **SingSaver** — calculator embedded directly into the rate table (not a separate page)
- **Canstar** — branded composite score (our equivalent: Palago Score) as the scannable default
- **Scripbox** — "Top 3 for You" default view to reduce decision fatigue

---

*Added: April 2026 | Source: UX/UI strategy session*