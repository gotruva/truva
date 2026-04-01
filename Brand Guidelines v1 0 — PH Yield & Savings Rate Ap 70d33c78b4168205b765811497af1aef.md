# Brand Guidelines v1.0 — PH Yield & Savings Rate App

# Brand Overview

This app is the first Filipino financial platform that shows every savings and yield option — digital banks, government products, and DeFi — in one place, with real after-tax math. The brand must feel like a **trusted financial institution**, not a startup. Clean, blue, precise.

> **Brand name: Truva.** These guidelines apply to all UI, copy, and product decisions.
> 

---

# 1. Brand Name: Truva

**Selected.** Short, clean, modern, globally pronounceable, no PH fintech conflicts. Domain registration pending.

---

# 2. Color System

Blue-primary palette. Reference tone: Coinbase, PayPal, Meta — high-trust, institutional, digital-native.

> **Mobile UX reference: NerdWallet.** Their mobile experience is the clearest model for financial comparison on small screens — card-based product lists (not horizontal tables), sticky filter tabs, pre-qualification flow, and progressive disclosure. Study [nerdwallet.com](http://nerdwallet.com) on mobile before building any comparison UI. Full UX pattern breakdown in International Comparable Analysis — Section 6.
> 

## Primary Palette

| Token | Hex | Usage |
| --- | --- | --- |
| `--brand-primary` | `#0052FF` | Primary CTAs, active states, key data highlights |
| `--brand-primary-dark` | `#0039B3` | Hover states, pressed buttons |
| `--brand-primary-light` | `#EBF0FF` | Backgrounds, chip fills, subtle highlights |
| `--brand-text-primary` | `#0A0B0D` | All body copy |
| `--brand-text-secondary` | `#5B616E` | Labels, helper text, metadata |
| `--brand-bg` | `#FFFFFF` | Page background |
| `--brand-surface` | `#F8F9FB` | Card backgrounds, table rows |
| `--brand-border` | `#E4E7EC` | Dividers, input borders |

## Semantic Colors

| Token | Hex | Usage |
| --- | --- | --- |
| `--color-positive` | `#12B76A` | Yield gains, positive returns |
| `--color-warning` | `#F79009` | Conditions, caveats, promo requirements |
| `--color-danger` | `#F04438` | Risk labels, errors |
| `--color-defi` | `#7B61FF` | DeFi/stablecoin product tags only |

## Never Use

- Red as a primary action color
- More than 2 brand colors in a single component
- Dark backgrounds except for the hero section
- Gradients on data-heavy screens (tables, calculators)

---

# 3. Typography

**Primary typeface:** Inter (Google Fonts — free, variable, used by Coinbase, Linear, Vercel)

| Role | Style | Size | Weight |
| --- | --- | --- | --- |
| Page title | Inter | 32px | 700 |
| Section heading | Inter | 24px | 600 |
| Card heading | Inter | 18px | 600 |
| Body copy | Inter | 15px | 400 |
| Data label | Inter | 13px | 500 |
| Fine print / footnote | Inter | 12px | 400 |
| CTA button | Inter | 14px | 600 |
| Rate figure (hero number) | Inter | 40–48px | 700 |

**Rule:** Financial figures (rates, peso amounts) always use tabular numerals (`font-variant-numeric: tabular-nums`) for alignment in tables.

---

# 4. Spacing & Layout

- **Base unit:** 4px
- **Card padding:** 24px
- **Section gap:** 48px
- **Table row height:** 56px
- **Border radius:** 8px (cards), 6px (buttons), 4px (chips/badges)
- **Max content width:** 1200px
- **Mobile-first:** All layouts designed at 375px first

---

# 5. Component Rules

## Rate Table Rows (Desktop — ≥768px)

- Each row: Product name + Provider logo + Rate + Conditions badge + After-tax return + Lock-in + Risk level chip
- Highlight the #1 ranked row with a thin `--brand-primary` left border
- "Conditions apply" rows get a `--color-warning` badge
- DeFi rows get a `--color-defi` chip labeled "DeFi"

## Mobile Rate Cards (<768px) — NerdWallet Pattern

**Rule: No horizontal table scrolling on mobile. Ever.** Horizontal scrolling on mobile comparison tables is a known UX antipattern — Lemoneyd does this. Truva does not.

On screens under 768px, the rate table converts to a **vertical scrollable card list**. Each card:

- **Header:** Bank/product name + logo (left) + Palago Score badge (right)
- **Hero number:** After-tax rate — large (24px, 700 weight), `--brand-primary` color
- **"Best for" label:** One-line description in `--brand-text-secondary` (e.g. "Best for liquid savings under ₱100K")
- **Spec row:** Lock-in period + PDIC status + Risk chip — displayed as icon + label pairs
- **CTA:** Single full-width "Open Account" button in `--brand-primary`
- **Disclosure:** Small affiliate tooltip icon ("We earn ₱X if you open this account")

Card spacing: 16px gap between cards, 20px side padding. `--brand-surface` background, `--brand-border` border, 8px radius.

**Sticky filter tabs on mobile:** The category tabs (All / Banks / Govt / UITFs / DeFi) use `position: sticky; top: 0` so they remain visible as the user scrolls the card list. Background: `--brand-bg`. Box shadow on scroll to indicate depth.

**Pre-qualification flow (mobile entry point):** Before showing the card list on mobile, show a 3-question input sequence: (1) Savings amount range, (2) Lock-in horizon, (3) Risk tolerance. Re-sort card list based on answers. Full list accessible via "See all options" link below top 3 results.

## Buttons

- Primary: `--brand-primary` fill, white text, 6px radius
- Secondary: white fill, `--brand-border` border, `--brand-text-primary` text
- Destructive: `--color-danger` fill
- No icon-only CTAs on mobile

## Data Cards (Calculator output)

- White background, `--brand-border` border, 8px radius, 24px padding
- Bold peso amount at top in `--brand-primary`
- Subtext in `--brand-text-secondary`
- Small "After 20% tax" footnote always present below any yield figure

---

# 6. Voice & Tone

## Brand Voice

**Precise. Neutral. Trustworthy.**

This app is the Bloomberg Terminal for Filipino savers — not a lifestyle brand, not a personal finance coach. The voice is that of a smart banker: confident, factual, no filler.

## Tone Principles

| Principle | Do | Don’t |
| --- | --- | --- |
| **Precise** | “Earning ₱8,640/year after tax” | “You could earn more!” |
| **Neutral** | “Maya’s 15% rate applies to the first ₱100K only” | “Maya is amazing for savers” |
| **Efficient** | “Best rate for 6 months, low risk: UNO TD at 5.75%” | “Great news! We found some options for you.” |
| **Honest** | “After 20% withholding tax” | Showing gross rates without caveats |
| **Local** | Show amounts in ₱, reference PDIC, Pag-IBIG by name | Avoid USD-first framing for PHP content |

## Language Rules

- Primary language: **English**
- Filipino terms permitted only for product names (e.g., “Pag-IBIG MP2”)
- No Taglish in UI copy
- No exclamation marks in data outputs or table labels
- Disclaimers always present: *“This is not financial advice. Rates updated [date].”*

## Copy Formulas

**Hero line pattern:**

> [Verb] + [what user gets] + [differentiator]
> 

> *“See where every peso earns the most — after tax, after conditions.”*
> 

**CTA copy:**

- Primary: “Calculate my earnings” (not “Get Started”)
- Secondary: “Compare all rates” (not “Learn more”)
- Newsletter signup: "Get the weekly rate update" (not "Subscribe")
- Login prompt: "Save your results" (not "Sign up")

**Error states:**

- “Rate data unavailable. Last updated [date].” (not “Something went wrong!”)

---

# 7. Primary User Persona

## “The First-Time Saver”

> Age 24–32. Young professional. First stable job. Has ₱100,000–500,000 sitting in a Maya or GCash savings account. Knows rates exist but doesn’t have time to research. Trusts data more than advice.
> 

| Attribute | Detail |
| --- | --- |
| **Goal** | Make idle savings work harder without locking it all up |
| **Pain** | Doesn’t know if their current rate is good or bad |
| **Behavior** | Googles “best digital bank Philippines 2026” monthly |
| **Trust signal** | Actual peso amounts (“you earn ₱18,000 more”) beat percentages |
| **Barrier** | Skeptical of apps that require account linking or sign-up before showing value |
| **Device** | 80% mobile |

**Design implication:** The rate table, calculator, and PDIC optimizer must all be accessible **without login**. Login gates activate only on save scenario, TD tracker, and rate alerts — these capture the email for the newsletter list. No paywall exists. Every feature is free.

---

# 8. Logo Direction

*Pending name finalization. Principles below apply to any name direction.*

- **Style:** Wordmark-first. No complex icon marks at MVP.
- **Weight:** Bold wordmark in Inter or a geometric sans (e.g., Gilroy, Plus Jakarta Sans)
- **Color:** `--brand-primary` (#0052FF) on white. White wordmark on `--brand-primary` fill for dark contexts.
- **No:** Piggy banks, peso signs, coins, upward arrows, or any clichéd finance iconography
- **Yes:** Clean geometric lettermark if an icon is needed for favicon/app icon

---

# 9. What This Brand Is Not

- Not a neobank or wallet (never position as holding funds)
- Not a robo-advisor (never imply personalized financial planning)
- Not a crypto exchange (DeFi yields are data, not products we sell)
- Not a personal finance coach (no motivational tone, no budgeting advice)
- Not a media brand (articles serve SEO, not editorial identity)

---

# 10. Brand Checklist (Pre-Launch)

- [x]  Name finalized: **Truva**
- [ ]  Domain registered (.com/.ph/.app)
- [ ]  Inter loaded via Google Fonts in Next.js
- [ ]  Color tokens defined in Tailwind config
- [ ]  “After 20% tax” disclaimer on every yield figure
- [ ]  “This is not financial advice” in footer and on calculator output
- [ ]  No gross rates shown without after-tax equivalent
- [ ]  Rate table accessible without login on homepage
- [ ]  PDIC cap (₱1M) labeled on any multi-bank content

---

*Document version: 2.0 | Last updated: March 30, 2026 | Status: Active — Brand name: Truva*