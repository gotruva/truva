# TRUVA MASTER — Single Source of Truth
**Version:** 1.0 | **Last Updated:** May 4, 2026 | **Status:** Active

> **For all AI agents (Claude, Gemini, GPT) and team members:** This is the one file to read. Everything else — PROJECT_CHARTER.md, gemini.md, GPT.md, the Founder Brief, and Brand Guidelines — are superseded by this document. Start here. End here.

---

## 1. What Truva Is

**One-liner:**
> Truva is the easiest way for every Filipino to find the right financial product for their life — and understand exactly what they're getting before they apply.

**Mission:**
> Financial products are confusing on purpose. The fine print is long. The fees are hidden. The terms sound the same across every company. Truva cuts through all of that. We show every product — savings accounts, credit cards, insurance, loans — in one place, in plain words, so you can compare quickly and choose with confidence. Free for every Filipino. A smarter way for companies to reach the right people.

**The problem we solve:**
Every Filipino faces the same problem: financial products all look the same from the outside. A savings account is a savings account. A credit card is a credit card. An insurance plan is an insurance plan. Until you read the fine print — and most people never do.

So they pick whatever their friend recommends. Or whatever app they already use. Or nothing at all.

Truva changes that. We show every option, explain what each one means in plain words, and help you find the one that fits your life right now. All companies. All products. One place. No jargon.

**The bridge:**
Truva is not just a consumer tool. It is a bridge between companies and exactly the right consumers for their products. When companies win (right customer finds them), and users win (right product finds them), the whole economy benefits. That win-win is the business.

**What we are NOT:**
- Not a bank, wallet, or fund custodian — we never hold or touch money
- Not a robo-advisor — we do not give personalized financial advice
- Not a crypto exchange — DeFi data is just one comparison category
- Not a media brand — articles serve discovery, not editorial identity

---

## 2. Who We Serve

### Persona A — The First-Time Saver
Age 24–32. First stable job. Has ₱50,000–₱500,000 sitting in a Maya or GCash wallet. Knows better options exist but doesn't have time to research. Wants the best place to park idle money without overthinking it.

### Persona B — The Life-Stage Transitioner
Any age. Just hit a milestone: getting their first credit card, buying their first travel insurance, switching banks after a raise, or taking out their first loan. Has products already but suspects they are on the wrong one. Needs Truva to validate or replace quickly.

### Persona C — The First-Timer (Unbanked / Under-served)
No existing bank account beyond a GCash wallet. May be a first-jobber, OFW family member, or someone in the informal economy. Has never held a credit card. Truva may be the first place they seriously consider formal financial products. Copy must never assume they know financial terms.

**Key facts about the Filipino market:**
- ~50% of Filipinos are unbanked — Truva must work for complete beginners
- Credit card holders are a small minority — Truva helps grow that market
- 80%+ of our traffic is mobile — mobile is the product
- Financial literacy is lower than in most neighboring countries — plain language is non-negotiable

---

## 3. Brand Voice & Language Rules

### Tone
**Trusted guide — clear, confident, and on the user's side.**

| Principle | Do | Don't |
|---|---|---|
| Plain words | "The rate you earn on your savings" | "Yield" or "APR" without explaining |
| Honest | "You need to spend ₱500–₱35,000/month to get this rate" | Hiding conditions in fine print |
| Simple | "You get your money back anytime" | "This product offers full liquidity" |
| Specific | "You earn ₱8,640 in one year" | "You could earn more!" |
| Local | ₱ amounts, Pag-IBIG, PDIC by name | USD-first framing for PHP content |

### Reading level rule
**All website copy, product UI, and marketing materials must be written at a Grade 6–8 reading level.** This is not dumbing down — it is respecting the user's time. Short sentences. One idea per sentence. No jargon without an immediate plain-English explanation in the same sentence.

**Plain-language glossary (use these on the website):**

| Financial term | Plain-language version |
|---|---|
| PDIC insurance | Government protection for your money (up to ₱1M per bank) |
| Liquidity | How quickly you can get your money back |
| Annual fee waiver | They skip charging you the yearly fee |
| Minimum average daily balance | You need to keep at least this amount in your account every day |
| Promo rate | A special higher rate that only lasts for a limited time |
| Time deposit | You lock your money for a set number of months and earn a higher rate |
| Credit limit | The most you are allowed to spend on the card |
| Annual fee | A yearly charge just for having the card |

### What we never show or say
- No post-tax or after-tax calculations — we show the rate exactly as the bank or company advertises it
- No exclamation marks in data outputs or rate labels
- No "This is amazing!" or "Great news!" tone
- No Taglish in UI copy
- No Latin financial terms (pro rata, compounding, amortization) without a plain-words explanation right beside it

### Disclaimers (always present)
- *"This is not financial advice."*
- *"Rates are updated regularly. Check with the bank or company before applying."*
- Affiliate disclosure on every CTA: *"We earn a fee if you apply through this link. This does not change what you are offered."*

---

## 4. Visual Identity

### Color System

| Token | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#0052FF` | Primary buttons, active states, key highlights |
| `--brand-primary-dark` | `#0039B3` | Hover states, pressed buttons |
| `--brand-primary-light` | `#EBF0FF` | Backgrounds, chip fills, subtle highlights |
| `--brand-text-primary` | `#0A0B0D` | All body copy |
| `--brand-text-secondary` | `#5B616E` | Labels, helper text, metadata |
| `--brand-bg` | `#FFFFFF` | Page background |
| `--brand-surface` | `#F8F9FB` | Card backgrounds, table rows |
| `--brand-border` | `#E4E7EC` | Dividers, input borders |
| `--color-positive` | `#12B76A` | Gains, positive labels |
| `--color-warning` | `#F79009` | Conditions, caveats, promo requirements |
| `--color-danger` | `#F04438` | Risk labels, errors |
| `--color-defi` | `#7B61FF` | DeFi product tags only |

### Typography
- **Headers:** Space Grotesk (Google Fonts — variable)
- **Body:** Inter (Google Fonts — variable)
- Financial figures always use `font-variant-numeric: tabular-nums` for alignment in tables

### Spacing
- Base unit: 4px | Card padding: 24px | Section gap: 48px | Border radius: 8px cards / 6px buttons
- Max content width: 1200px | Mobile-first: 375px base

### Mobile rules
- No horizontal scrolling on mobile — ever
- Rate table converts to vertical scrollable card list on screens under 768px
- Sticky category filter tabs at top on mobile

---

## 5. Product Roadmap

| Phase | Status | Vertical | Notes |
|---|---|---|---|
| 1 | ✅ Live | Savings, Bonds, DeFi, Govt products (Pag-IBIG MP2, T-Bills, RTBs) | Core banking rates live |
| 2 | 🔨 Active | Credit Cards | Active build — highest affiliate payout per conversion |
| 3 | 🔜 Next | Insurance — Travel first, then Health, Auto, Life | Travel is easiest to launch, seasonal demand, strong affiliate rates |
| 4 | Future | Loans — Personal, Home, Car, Student, Business | After Insurance vertical is established |

**Why this order?**
- Credit cards have the highest payout per person who applies — right move after savings.
- Insurance fits naturally after credit cards — same audience, next life-stage purchase.
- Travel insurance is the easiest insurance to start with: low regulation friction, high seasonal demand.
- Loans come last because they require deeper relationships with banks and more compliance groundwork.

**What is NOT being built (unless explicitly instructed):**
- Native iOS/Android app (PWA first)
- AI chatbot or persistent AI conversation
- Payment infrastructure or subscription billing
- Real-time rate feeds (daily updates are enough)
- Any feature that involves holding, transferring, or managing user funds

---

## 6. Revenue Model

**Free for users, always. Revenue comes from companies.**

| Stream | When | How |
|---|---|---|
| Affiliate referral links | From Day 1 | We earn a fee when a user applies and is approved through our link |
| Newsletter (The Truva Brief) | From Week 1 | Weekly email → affiliate links embedded contextually |
| Sponsored placement | Month 4+ | Companies pay to be featured prominently during promos |

**Current affiliate payout ranges (PH market):**
- Savings accounts: ₱50–₱300 per verified account
- Credit cards: ₱500–₱2,000+ per approved card
- Insurance: rates TBD — negotiate when building Phase 3
- Loans: ₱1,000–₱10,000+ per funded loan (Phase 4)

---

## 7. Non-Negotiable Rules

These rules apply to every feature, every page, every line of copy and code:

1. **Mobile-first — 375px base.** Every UI must work at 375px with no horizontal scroll. Desktop is secondary.
2. **Plain language always.** Grade 6–8 reading level. No jargon without an immediate plain-English explanation.
3. **No post-tax or after-tax calculations shown to users.** Show the rate as the bank or company advertises it. Tax math is removed from all user-facing surfaces.
4. **No fund custody — ever.** Truva compares. Truva never holds money, transfers money, or manages accounts.
5. **Affiliate disclosure on every CTA.** Required for trust and legal compliance. Non-negotiable.
6. **Every product page must answer three questions in plain words:**
   - "What is this?" (one sentence)
   - "Who is this for?" (the real target user)
   - "What's the catch?" (conditions, fees, requirements — before the user clicks Apply)

---

## 8. Tech Anchors

| File | Purpose |
|---|---|
| `types/index.ts` | TypeScript interfaces for all data models — read this first |
| `lib/rates.ts` | Supabase hydration → public `RateProduct[]`; identity precedence: `structured_payload.id` → `source_product_ids[index]` → provider-prefix stripping |
| `data/rates.json` | Manual/seed catalog — metadata fallback and non-scraper products (e.g., `pagibig-mp2`) |
| `utils/yieldEngine.ts` | Rate calculation logic — **do not surface after-tax outputs in UI** |
| `lib/tax.ts` | Tax regime definitions — **no longer called by user-facing components** |
| `app/layout.tsx` | Root layout, fonts, global metadata |

**Important:** `lib/tax.ts` and the after-tax calculation logic inside `utils/yieldEngine.ts` exist in the codebase but must NOT be called by any user-facing UI component. They are internal utilities only. We show the rate as advertised.

### Rate pipeline
- Scraper repo: `/Users/albertoaldaba/truva-scraping`
- MVP repo: `/Users/albertoaldaba/truva-mvp`
- `RateProduct.tierType`: `flat | blended | threshold`
  - `flat` → single rate, no deposit-amount tiers
  - `threshold` → only qualify deposits that fall inside the tier min/max range
- Hydration dedupes public product IDs — canonical `structured_payload.id` beats older generic scraper rows
- Manual seed products (e.g., `pagibig-mp2`) must stay merged when the scraper does not own them

---

## 9. Current Build State (May 2026)

### Live and working
- Banking rate comparison table (desktop) + card layout (mobile, 375px)
- Rate data hydrates from Supabase `production` snapshots; `data/rates.json` is metadata/seed fallback
- Latest production snapshot: `526fd854-1678-428c-b029-369285baf674` (67 raw products → 57 public after dedupe)
- Live pages verified: `/api/rates`, `/`, `/banking/rates`, `/calculator`
- `pagibig-mp2` present in API/home/calculator; intentionally absent from bank-only `/banking/rates`
- Personal Yield Calculator — dual scenarios, bar chart
- Mobile pre-qual flow (3-step: amount → lock-in → risk tolerance)
- Newsletter signup (Resend, rate-limited)
- Affiliate CTAs with disclosure on every product
- Dark mode, GA4, SEO structured data, security headers

### In progress
- Credit cards (Phase 2) — active build

### Stubbed / not yet built
- `/optimizer` — PDIC Smart Split Optimizer
- `/tracker` — Time Deposit Tracker + maturity alerts
- Insurance vertical (Phase 3)
- Loans vertical (Phase 4)

---

## 10. AI Agent Instructions

You are the **Principal Full-Stack Engineer** for Truva. Your job is to ship a product that helps every Filipino find the right financial product for their life — and understand it before they apply.

**Before writing any code or copy:**
1. Check that what you're building serves at least one of the three personas (Personas A, B, or C).
2. Confirm the feature is in the current active phase (Phase 1 or Phase 2 right now).
3. Make sure any user-facing text is in plain language — Grade 6–8 reading level, no jargon.
4. Confirm no after-tax calculations are surfaced in the UI.
5. Test at 375px on mobile before declaring anything done.

**Rate display rule:** Show the rate exactly as the bank or company advertises it. Do not apply tax deductions. Do not show "after-tax" numbers. The rate users see here is the rate they see on the bank's own website or app.

**The mission in one line:** Help every Filipino find the right product. Explain it simply. Get out of the way.
