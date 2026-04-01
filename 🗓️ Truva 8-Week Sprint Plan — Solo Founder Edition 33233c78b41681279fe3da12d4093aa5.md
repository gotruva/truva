# 🗓️ Truva 8-Week Sprint Plan — Solo Founder Edition

# Truva — 8-Week Sprint Plan — Solo Founder Edition

> **Context:** Solo founder (CEO + dev + content). Vibe coded with Google Antigravity + Claude. Dev days: Mon / Wed / Fri. Content days: Tue / Thu / weekends. Sprint start: April 2026.
> 

> **Vision:** Truva = NerdWallet of the Philippines + crypto/DeFi yields as a unique first-class category.
> 

> **Revenue model:** All features free. Revenue via affiliate referrals, sponsored bank placements, and newsletter. Platform expands from savings + crypto yields → credit cards → loans → investing → insurance following the NerdWallet multi-category arc.
> 

---

# ⚡ Pre-Week: Unblock Yourself First

> Every day the name is undecided is a day you can't register a domain, set up email, or ship branded anything.
> 

| # | Task | Day | Done? |
| --- | --- | --- | --- |
| 1 | Brand name decided: **Truva** | Day 1 | Yes |
| 2 | Check domain availability on Namecheap (.com, .ph, .app) | Day 1 | ☐ |
| 3 | Register domain immediately | Day 1 | ☐ |
| 4 | Create GitHub repo (private) | Day 1 | ☐ |
| 5 | Set up Supabase project (free tier) | Day 1 | ☐ |
| 6 | Connect Vercel to GitHub repo | Day 2 | ☐ |
| 7 | Set up Resend account for email | Day 2 | ☐ |
| 8 | Update Notion docs with final brand name | Day 2 | ☐ |

> **Name decided: Truva.** Proceed immediately with domain registration and infrastructure setup.
> 

---

# Week 1 — Foundation and Rate Table Shell

**Sprint goal:** A live URL exists. Rate table renders with manual data. DefiLlama is pulling.

## Monday (Dev)

| # | Task | Tool |
| --- | --- | --- |
| 1 | Scaffold Next.js 14 + Tailwind + shadcn/ui | Google Antigravity / [v0.dev](http://v0.dev) |
| 2 | Set up folder structure: /app /components /lib /data | Cursor |
| 3 | Create static rate data JSON (5-6 banks, manual) | Cursor |
| 4 | Deploy skeleton to Vercel, get a live URL | Vercel |

## Wednesday (Dev)

| # | Task | Tool |
| --- | --- | --- |
| 1 | Build rate comparison table component | [v0.dev](http://v0.dev) / Cursor |
| 2 | Columns: Bank, Rate %, Conditions, Balance Cap, After-Tax, Lock-in, Risk | Cursor |
| 3 | Plug DefiLlama API, fetch USDC Aave Base rate | Cursor |
| 4 | Add sort by rate | Cursor |

## Friday (Dev)

| # | Task | Tool |
| --- | --- | --- |
| 1 | Polish table UI, mobile responsive | Tailwind |
| 2 | Add risk level badges (Low / Medium / DeFi) | shadcn/ui |
| 3 | Add affiliate referral links to each bank row (Maya, Tonik, GoTyme codes) | Cursor |
| 4 | Add email newsletter signup form (above fold + footer) | Resend / Cursor |
| 5 | Deploy and test on mobile, share with 5 people | Vercel |

## Tuesday (Content)

| # | Task |
| --- | --- |
| 1 | Outline article #1: "Best Digital Bank Interest Rates Philippines April 2026" |
| 2 | Research current rates: Maya, Tonik, UNO, GoTyme, CIMB, UnionDigital |
| 3 | Draft article (1,500 words minimum) |

## Thursday (Content)

| # | Task |
| --- | --- |
| 1 | Publish article #1 (Ghost, Substack, or app blog) |
| 2 | Post to r/phinvest, frame as research not promotion |
| 3 | Share in 2-3 Facebook groups (Digital Banking PH, Pag-IBIG MP2) |

### Week 1 Exit Criteria

- [ ]  Live URL with rate table (6+ banks + DeFi)
- [ ]  Domain registered, brand name locked
- [ ]  Affiliate referral links live on every bank row
- [ ]  Newsletter email signup form live on homepage
- [ ]  First SEO article published
- [ ]  10 real people have seen the live URL
- [ ]  **Mobile card layout live** — open on phone and confirm no horizontal table scrolling

---

# Week 2 — Data Quality and After-Tax Column

**Sprint goal:** Table is accurate. After-tax column is the core differentiator vs. Lemoneyd.

## Monday (Dev)

| # | Task |
| --- | --- |
| 1 | Add all 8 digital banks (Maya, Tonik, UNO, GoTyme, CIMB, UnionDigital, MariBank, OwnBank) |
| 2 | Build after-tax logic: rate x (1 - 0.20 FWT) |
| 3 | Display after-tax column prominently, this IS the product |

## Wednesday (Dev)

| # | Task |
| --- | --- |
| 1 | Add conditions tooltip per bank |
| 2 | Add PDIC insurance status indicator per row |
| 3 | Scaffold n8n scheduler skeleton for future data updates |

## Friday (Dev)

| # | Task |
| --- | --- |
| 1 | Add "Effective rate" explanation tooltip |
| 2 | QA entire table, verify every rate against source bank app |
| 3 | Set up Google Analytics 4 |

## Tuesday and Thursday (Content)

| # | Task |
| --- | --- |
| 1 | Article #2: "Maya 15% Interest Rate, Is It Real? What You Actually Earn" |
| 2 | Publish article #2 |
| 3 | Post after-tax comparison screenshot to Facebook and Twitter/X |
| 4 | Identify 3 PH finance creators for Month 2 collab outreach |

### Week 2 Exit Criteria

- [ ]  Full 8-bank table with accurate after-tax column
- [ ]  Conditions shown per bank
- [ ]  GA4 tracking live
- [ ]  2 SEO articles published
- [ ]  **3-question pre-qual flow on mobile** — amount range + lock-in + risk tolerance inputs re-sort the card list. "See all options" link below top 3.

---

# Week 3 — Yield Calculator, Auth, and Email Capture

**Sprint goal:** Users can calculate personal yield. Auth captures emails. Newsletter pipeline ready.

## Monday (Dev)

| # | Task |
| --- | --- |
| 1 | Build yield calculator UI: amount + time horizon + risk toggle |
| 2 | Output: top 3 recommendations with after-tax PHP earnings |
| 3 | Embed calculator above rate table (SingSaver UX pattern) |

## Wednesday (Dev)

| # | Task |
| --- | --- |
| 1 | Set up Supabase auth (email + Google OAuth) |
| 2 | Create user profile table in Supabase |
| 3 | Gate "Save scenario" behind free login (email capture, NOT paywall) |

## Friday (Dev)

| # | Task |
| --- | --- |
| 1 | Add shareable result card: "I am earning P X more, calculated on Truva" |
| 2 | Set up Resend for newsletter: welcome email + weekly The Truva Brief template |
| 3 | Add email signup prompt after every calculator result |

## Tuesday and Thursday (Content)

| # | Task |
| --- | --- |
| 1 | Article #3: "Pag-IBIG MP2 vs Digital Bank: Real Calculator Comparison" |
| 2 | Draft first The Truva Brief newsletter issue |
| 3 | Post calculator preview as social content |

### Week 3 Exit Criteria

- [ ]  Calculator live and functional
- [ ]  Auth working (login / logout / Google OAuth)
- [ ]  Email capture pipeline active (Supabase → Resend)
- [ ]  Newsletter welcome email sending on signup

---

# Week 4 — PDIC Optimizer, Newsletter Launch, and Affiliate Links

**Sprint goal:** PDIC optimizer live (free, login required). First newsletter sent. Affiliate links generating clicks.

## Monday (Dev)

| # | Task |
| --- | --- |
| 1 | Build PDIC Smart Split Optimizer v1 (input: amount, output: bank split table) |
| 2 | Gate behind free login (captures email for newsletter) |
| 3 | Each bank in the split output has an affiliate referral link |

## Wednesday (Dev)

| # | Task |
| --- | --- |
| 1 | Optimize all affiliate links: add UTM parameters for tracking (source, medium, campaign) |
| 2 | Add affiliate disclosure tooltip on every bank row |
| 3 | Set up Supabase table to log affiliate link clicks for conversion tracking |

## Friday (Dev)

| # | Task |
| --- | --- |
| 1 | Send first The Truva Brief newsletter to all registered users |
| 2 | QA all affiliate links end-to-end (click → bank signup page) |
| 3 | Launch publicly: email early signups, announce on communities |

## Tuesday and Thursday (Content)

| # | Task |
| --- | --- |
| 1 | Article #4: "How to Split P1M Across Banks and Stay PDIC-Safe" |
| 2 | Announce launch on r/phinvest, Facebook groups, Twitter/X |
| 3 | DM 10 people from early feedback list, ask them to sign up for newsletter |

### Week 4 Exit Criteria

- [ ]  PDIC optimizer live (free, login required)
- [ ]  All affiliate links tracked with UTMs
- [ ]  First newsletter sent to registered users
- [ ]  Launch announced publicly
- [ ]  At least 50 newsletter subscribers

---

# Week 5 — Expand Rate Table

**Sprint goal:** Table grows beyond digital banks. SEO footprint expands significantly.

## Dev Days

| # | Task |
| --- | --- |
| 1 | Add Pag-IBIG MP2: dividend rate, tax-exempt status, lock-in |
| 2 | Add Retail Treasury Bonds from BTr |
| 3 | Add T-Bills (91/182/364-day): BTr auction results |
| 4 | Add UITFs / Money Market: BDO, BPI, Metrobank |
| 5 | Add USD Dollar TD section |
| 6 | Add Landbank, DBP, OFBank rows |
| 7 | Add category filter tabs: All / Banks / Govt / UITFs / DeFi |

## Content Days

| # | Task |
| --- | --- |
| 1 | Article #5: "USDC vs Philippine Peso Savings: Which Earns More in 2026?" |
| 2 | Send Weekly "The Truva Brief" email #1, launch this habit now |

### Week 5 Exit Criteria

- [ ]  15+ products in rate table across all categories
- [ ]  Category filter tabs working
- [ ]  First weekly The Truva Brief email sent

---

# Week 6 — TD Tracker and Rate Alerts

**Sprint goal:** Premium is feature-complete. TD Tracker is the retention anchor.

## Dev Days

| # | Task |
| --- | --- |
| 1 | Build TD Tracker UI: add TD (bank, amount, rate, start, maturity) |
| 2 | Build maturity alert emails: 30-day, 7-day, maturity-day via Resend |
| 3 | Build rate change alert: compare daily snapshot vs previous |
| 4 | Rate alert email template: "Maya dropped from 15% to 10%. Here is what to do." |
| 5 | QA all premium features end-to-end |
| 6 | Ask first paying users for testimonial or feedback screenshot |

### Week 6 Exit Criteria

- [ ]  TD Tracker live with maturity email alerts
- [ ]  Rate change alerts sending correctly
- [ ]  All features live and free (login-gated where applicable)
- [ ]  200+ newsletter subscribers
- [ ]  Affiliate link clicks being tracked in Supabase

---

# Week 7-8 — Polish, SEO, and Affiliate Prep

**Sprint goal:** Product is stable. Affiliate links wired. SEO compounding. Outreach begins.

## Dev Tasks

| # | Task |
| --- | --- |
| 1 | Add affiliate UTM links to every bank row |
| 2 | Add transparent affiliate disclosure tooltip |
| 3 | Build "Palago Score" composite rating (after-tax yield + liquidity + conditions + PDIC) |
| 4 | Add "Top 3 for You" default view after calculator result |
| 5 | Lighthouse performance audit: 90+ on mobile |
| 6 | Set up n8n auto-scraper for 3 bank rates (Maya, Tonik, UNO) |

## Content Tasks

| # | Task |
| --- | --- |
| 1 | Articles #6, #7, #8, publish weekly |
| 2 | Reach out to 3 PH finance YouTubers and TikTokers for collab |
| 3 | Submit to first affiliate program (GCash, Maya, or digital bank) |
| 4 | Weekly Truva Brief emails #2 and #3 |

### Week 7-8 Exit Criteria

- [ ]  Affiliate links live and tracked on all bank rows
- [ ]  Palago Score visible on all products
- [ ]  8 SEO articles published and indexed
- [ ]  First formal bank partnership email sent (Maya, Tonik, or GoTyme)
- [ ]  500+ newsletter subscribers
- [ ]  The Truva Brief sent 3+ times

---

# 🧠 Weekly Operating Rhythm

| Day | Focus | Non-Negotiable |
| --- | --- | --- |
| Monday | Dev: Setup + new feature build | Ship something to live URL by EOD |
| Tuesday | Content: Research + draft | One article outline completed |
| Wednesday | Dev: Core feature completion | Feature works end-to-end, not just UI |
| Thursday | Content: Publish + distribute | Article live and posted in 2 communities |
| Friday | Dev: Polish + QA + deploy | QA pass done, deploy to prod |
| Weekend | Light: social, Pulse email, weekly planning | Weekly Savings Pulse drafted and sent |

## Sunday PM Check-in (15 minutes only)

1. What was the single most important thing I shipped this week?
2. What is the single most important thing for next week?
3. What is blocking me and needs a decision today?

---

# 🚨 Decision Parking Lot

| Decision | Deadline | Status |
| --- | --- | --- |
| Final brand name | Done | ✅ Truva |
| Domain registration ([truva.com](http://truva.com) / [truva.ph](http://truva.ph) / [truva.app](http://truva.app)) | Today | UNBLOCKED — register now |
| Confirm Next.js + Supabase scaffold works in Cursor | Week 1 | Pending |
| Newsletter platform: Resend vs Beehiiv vs Buttondown | Week 2 | Recommend Resend (already in stack, 3K/mo free) |
| First bank partnership outreach (Maya BD team) | Week 7 | Not urgent yet |
| Content writer / VA hire | When revenue exceeds ₱50K/mo | Not yet |

---

---

# 🔭 Phase 2 Preview — What Comes After Week 8

> **Don’t build this now. Know it’s coming.**
> 

After the 8-week sprint, Truva has a clear expansion path into higher-revenue affiliate verticals. The savings rate tool is the entry point and trust builder. Credit cards are the revenue multiplier.

| Phase | Timing | Product | Affiliate CPA | Why Now / Why Wait |
| --- | --- | --- | --- | --- |
| **Phase 1** | Now – Month 5 | **Savings rates + Crypto/DeFi yields** | ₱50–300/account | Entry moat. Zero competition on the combined category. Crypto yields = our NerdWallet differentiator — no global comparison platform does this. |
| **Phase 2** | Month 6+ | **Credit cards** | ₱500–2,000+/approved card | 10–20× CPA of savings. Moneymax’s primary revenue. Same audience, natural upsell. |
| **Phase 3** | Year 2 | **Personal loans + home loans** | ₱500–10,000+/funded loan | Needs SEO authority + bank partnerships from Phase 1–2. Don’t rush. |
| **Phase 4** | Year 2+ | **Investing / UITFs / stocks** | Lower CPA, high traffic | GInvest and Investagrams have partial coverage — Truva adds the comparison + after-tax layer they lack. |
| **Phase 5** | Year 3+ | **Insurance** | High, requires IC broker license | Moneymax’s stronghold. Do not enter without team, license, and capital. |

**The thesis:** Truva enters with savings + crypto yields (zero competition, genuine product gap) → earns user trust and newsletter subscribers → converts that audience to credit card signups in Phase 2 → adds loans, investing, and eventually insurance → becomes the full NerdWallet of the Philippines by Year 3. The crypto yields category is the one thing NerdWallet doesn't have — and in a market ranked 9th globally in crypto adoption, it's a meaningful first-mover advantage.

*Created: March 2026 | Owner: CEO / Founder | Sprint status: Pre-Week 0*