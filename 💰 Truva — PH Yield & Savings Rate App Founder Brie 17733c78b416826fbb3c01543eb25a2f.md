> ⚠️ **SUPERSEDED — May 4, 2026.** This document is kept for historical reference only. Vision, brand, and roadmap have been updated. The single source of truth is now **`TRUVA_MASTER.md`**. Read that file instead.

# 💰 Truva — PH Yield & Savings Rate App | Founder Brief v2.0

# The One-Line Pitch

> *Truva is the NerdWallet of the Philippines — a free financial comparison platform helping Filipinos make smarter decisions across savings, crypto yields, credit cards, loans, and beyond.*
> 

> **What makes us different from NerdWallet:** We include crypto/DeFi yields as a first-class comparison category — a natural fit for a market ranked 9th globally in crypto adoption. No financial comparison platform in the world puts DeFi stablecoin yields side-by-side with traditional savings, government bonds, and after-tax math in one place. That's the gap.
> 

| Phase | Timing | Category | Why This Order |
| --- | --- | --- | --- |
| **Phase 1** | Now — Month 5 | Savings rates + Crypto/DeFi yields | Zero competition. Genuine product gap. Our entry moat. |
| **Phase 2** | Month 6+ | Credit cards | 10–20× the affiliate CPA of savings. Moneymax's primary revenue. Our audience converts naturally. |
| **Phase 3** | Year 2 | Personal loans + home loans | Requires traffic authority + bank partnerships built in Phase 1–2. |
| **Phase 4** | Year 3+ | Insurance | Requires Insurance Commission broker license. Moneymax's stronghold — don't touch until we have scale. |

---

# 1. The Problem

Every Filipino with savings faces the same invisible problem: **they are almost certainly earning less than they should be.**

Here's what finding the "best rate" actually requires today:

- Manually checking 6+ digital bank apps (Maya, Tonik, UNO, GoTyme, CIMB, UnionDigital)
- Reading fine print on conditions — Maya's 15% requires spending ₱500–35,000/month depending on tier
- Separately researching DeFi yields on DefiLlama (global tool, no PH context)
- Manually applying the 20% final withholding tax on bank interest
- Building your own spreadsheet to forecast 6–12 month earnings
- Tracking when your time deposit matures so you don't get auto-rolled at a lower rate
- Figuring out how to split ₱1M+ across banks to stay within PDIC insurance limits
- Comparing Pag-IBIG MP2 dividends vs digital bank rates (almost nobody does this)

**Nobody does all of this. So most Filipinos just leave money in whichever bank they opened first.**

That gap — between what Filipinos *are* earning and what they *could* earn — is the business.

---

# 2. The Market Opportunity

| Metric | Figure |
| --- | --- |
| Digital bank customers in PH (Sept 2025) | 20.4 million |
| Total digital bank deposits | ₱119.5 billion |
| Philippines crypto adoption rank (global) | 9th |
| Crypto users in PH (projected 2026) | 12.79 million |
| Annual OFW remittances | $38.3 billion |
| PDIC coverage per depositor per bank | ₱1 million (as of March 2025) |

The target user is any Filipino who:

- Has ₱50,000+ in savings and wants it to work harder
- Is crypto-aware but wants low-risk yield, not speculation
- Has a time deposit they're not actively managing
- Has ₱1M+ and needs to split across banks for full PDIC coverage
- Is an OFW or family member asking “should I keep remittance in USDC or convert to PHP?”

**This is not a niche. This is 20 million people with a universal financial pain point.**

---

# 3. The Product

A **web-first PWA** (Progressive Web App) — no app store needed at launch — with five core modules.

## Module 1: Live Rate Comparison Table

A single screen showing every low-risk yield product available to Filipinos, updated daily.

**PHP Products covered:**

- Digital bank savings: Maya, Tonik, UNO, GoTyme, CIMB/GSave, UnionDigital, MariBank, OwnBank
- Time deposits: all major digital and traditional banks
- UITFs / Money Market Funds: BDO, BPI, Metrobank, digital banks
- Pag-IBIG MP2: annual dividend tracker
- Retail Treasury Bonds (RTBs): availability + current rate
- **T-Bills (91/182/364-day):** BTr auction results, updated weekly *(new)*
- **Landbank / DBP / OFBank savings and TDs:** government-owned banks, high trust for conservative savers *(new)*
- **SSS PESO Fund:** annual dividend, tax-exempt, government-backed *(new — Month 3)*
- **GSIS savings programs:** for government employees *(new — Month 3)*
- **Credit cooperative deposits:** 6–12% yields, CDA-regulated, non-PDIC — highest-yield capital-stable product in PH *(new — Month 4+, strategic moat)*

**USD Products covered:**

- USDC yield: Aave v3 (Base), Morpho, Compound
- USDT yield: major audited DeFi protocols
- Data pulled free from DefiLlama API — real-time, no cost
- **Dollar Time Deposits:** USD TDs from major PH banks, taxed at 7.5% FCD rate (vs 20% for peso) *(new)*
- **Dollar RTBs / Global Bonds:** BTr USD-denominated sovereign bonds when available *(new — Month 3)*

Each row shows: Rate, Conditions, Balance Cap, After-Tax Return, Lock-in Period, Risk Level, Insurance Status.

> Full product coverage details, data pipelines, and tax treatment per product: see **Expanded Product Coverage — New Financial Products to Aggregate** (sub-page).
> 

## Module 2: Personal Yield Calculator

**Inputs:** Amount (PHP or USD), Currency, Time Horizon, Risk Tolerance

**Output:**

- Projected earnings in ₱ for top 3 matching options
- After 20% withholding tax applied
- After FX conversion (for USDC/DeFi comparison)
- Inflation-adjusted real return using BSP CPI data
- Side-by-side comparison chart

**AI Integration (minimal, targeted):** One Claude Haiku API call (~₱0.02) for natural language queries. User types: *"I have ₱500K for 6 months, low risk, what's best for me?"* — returns a ranked recommendation in plain language. User-triggered only, not running on every page load.

## Module 3: PDIC Smart Split Optimizer

The feature that makes this tool indispensable for anyone with ₱1M+ in savings — and the reason they come back, share it, and click affiliate links.

**The problem it solves:** PDIC insures up to ₱1M per depositor per bank. Anyone saving more than ₱1M needs to split across banks — but nobody tells you exactly how to split it to maximize yield AND stay fully insured simultaneously.

**Input:** Total amount + time horizon + risk tolerance

**Output:** Recommended split that keeps every peso PDIC-insured while maximizing blended yield after tax.

Example for ₱3.5M total savings:

```
₱900,000 → Maya Bank (15% promo, spend req.)   = ₱135,000/yr
₱900,000 → UNO Digital (5.75% TD, 12 months)   = ₱51,750/yr
₱900,000 → Tonik (4% flat, no conditions)       = ₱36,000/yr
₱800,000 → GoTyme (3.5% Go Save, liquid)         = ₱28,000/yr

Total after 20% tax: ₱200,600/yr | All PDIC insured ✅
```

No Filipino tool does this today.

## Module 4: Time Deposit Tracker & Reminders *(Free — Registered Users Only)*

The retention mechanic — once users add their TDs, they never leave. Requires free account registration, which builds the email list that powers newsletter + affiliate distribution.

- Add any TD: bank, amount, rate, start + maturity date
- **30 days before maturity:** alert comparing renewal rate vs current best alternative
- **7 days before:** second alert with direct link to move funds
- **On maturity day:** “Your TD matured. Here’s where to move it.”
- Shows projected earnings lost from auto-rollover at a lower rate

Banks will never build this. They have zero incentive to tell you to leave them.

## Module 5: Goal-Based Savings Planner *(Free)*

> *“I want to save ₱500,000 in 24 months. How much do I put where to get there fastest at low risk?”*
> 

Generates a month-by-month savings plan: amount, where to put it, projected balance. No financial jargon. Zero AI cost — pure math.

---

# 4. Competitive Landscape

|  | Digital Banks | Time Deposits | MP2 | RTBs | UITFs | DeFi | PDIC Optimizer | TD Reminders |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Lemoneyd** (closest competitor) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| BitPinas (blog) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Investagrams | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GInvest / GCash | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| [Bonds.ph](http://Bonds.ph) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Truva** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Lemoneyd** is the closest direct competitor — a PH digital bank savings rate comparison table with 45K+ app downloads (launched Sept 2025), active affiliate referral codes, and strong community engagement. Their gap: no after-tax calculator, no PDIC optimizer, no TD tracker. BitPinas is a manually updated monthly blog post. We are building the product version with a live calculator, reminders, and an optimization engine on top.

---

# 5. The Crypto Yields Category — Our NerdWallet Differentiator

NerdWallet covers 8 verticals: credit cards, banking, mortgages, investing, insurance, personal loans, SMB, student loans. **None of them is crypto.** That's a US market reality — crypto penetration is low, regulatory clarity is limited, and their audience didn't demand it.

The Philippines is a different market entirely.

| Metric | Figure |
| --- | --- |
| PH global crypto adoption rank | 9th |
| Projected PH crypto users (2026) | 12.79 million |
| OFW remittances annually | $38.3 billion |
| % of OFWs exploring USDC for remittance | Growing — no data yet, but active r/phinvest discussion |

For Filipino savers, the question isn't "crypto vs no crypto" — it's "should I keep my USDC earning 6–8% on Aave, or convert to PHP and put it in Maya at 15% (with spending conditions)?" That is a real, quantifiable financial question. **No tool answers it with actual math.** Truva does.

**This is not blockchain for blockchain's sake. It's one more column in the comparison table.**

**What we show:**

- USDC yield on Aave v3 (Base), Morpho, Compound — pulled free from DefiLlama API in real time
- USDT yield on major audited protocols
- FX conversion applied so the comparison is in PHP
- Risk label: clearly marked "DeFi" — higher risk, no PDIC, smart contract exposure disclosed
- After-tax treatment: DeFi yields are not subject to PH FWT (no PH withholding mechanism on-chain)

**What we are not:**

- Not a wallet, custodian, or DeFi protocol
- Not a crypto exchange
- Not recommending anyone go into crypto — we show data, users decide
- Zero regulatory exposure: we read public blockchain data and display it, same as DefiLlama

**The NerdWallet parallel:** When NerdWallet added banking/savings to their credit card platform, it wasn't because they became a bank — they just added a new comparison category. Truva adding crypto yields is identical. It's a data category, not a product we sell.

**The competitive moat:** Moneymax doesn't cover crypto. Lemoneyd doesn't cover crypto. Investagrams covers trading, not yields. BitPinas covers news, not a calculator. Truva is the only platform that will show a Filipino saver exactly how USDC on Aave compares to Maya's 15% promo — after tax, after FX, on their specific amount. That's our NerdWallet differentiator.

---

# 6. Monetization Plan

> **Strategic principle (March 2026 reframe):** Every successful financial comparison business globally — NerdWallet, Bankrate, MoneySmart, Moneymax — monetizes through affiliate commissions and bank partnerships on a **free tool**, not consumer subscriptions. The subscription model was dropped after analysis showed: (a) PH freemium-to-paid conversion rates for financial tools average 1–3%, (b) at ₱149/month you need 671 paying users just to hit ₱100K, requiring 22,000–67,000 free users, (c) Filipino personal finance audiences are not conditioned to pay for financial content/tools, and (d) every reader behind a paywall is a reader who does NOT see affiliate links. **The product is free. The audience is the product we sell to banks.**
> 

## Stream 1: Affiliate Referral Revenue (Primary — from Month 1)

Tracked referral links embedded in every bank row of the comparison table. Revenue generated when users open accounts through our links.

**Current PH digital bank referral payouts (verified March 2026):**

| Partner | Referral Payout | Type | Status |
| --- | --- | --- | --- |
| Maya | ₱100 per verified account | Peer referral code | Active |
| Tonik | ₱60 per account / ₱1,000 per loan referral | Friends with Benefits program | Active |
| GoTyme | ₱50 per account | Referral Rewards (selected partners) | Requires partnership application |
| GCash | ₱50 per verified account | Peer referral code | Active |
| MariBank (SeaBank) | ~₱50 per account | Informal referral bonus | Active |
| CIMB / UnionDigital | No public program | N/A | Requires direct BD outreach |
| [Coins.ph](http://Coins.ph) / PDAX | ₱100–300 per verified account | Affiliate program | Active |

**Important reality check:** These are peer referral codes, not formal CPA affiliate programs. To earn higher payouts (₱200–500+ per conversion), we need to negotiate **direct partnership agreements** with each bank — similar to what Moneymax does through its MoneyHero parent. Target: secure 2–3 formal partnerships by Month 4–6.

**For UITFs, Pag-IBIG MP2, RTBs, and T-Bills: no referral or affiliate mechanism exists.** These products are distributed through licensed channels. They drive traffic and trust, not direct revenue.

## Stream 2: Free Newsletter as Affiliate Distribution Engine (from Week 1)

A weekly "The Truva Brief" email newsletter — completely free — that serves as the primary engagement, retention, and affiliate conversion channel.

**Content format:** Rate change alerts, after-tax yield rankings, bank promo updates, and educational content. Every issue embeds affiliate referral links contextually (e.g., "Maya dropped to 10%. Tonik is now the best liquid option — open an account here").

**Revenue model:** Newsletter drives repeat traffic to the tool (where affiliate links live) and directly embeds affiliate offers in email content. At scale, this becomes the channel for sponsored content placements from digital banks.

**Benchmarks:** PH personal finance bloggers in high-demand niches earn ₱22,000–₱50,000/month (GoDaddy PH data, 2025). Finance is the highest-earning Substack category globally. A free newsletter with 5,000+ subscribers becomes attractive for bank-sponsored newsletter placements at ₱5,000–₱20,000 per send.

## Stream 3: Sponsored Placement + Bank Partnerships (Month 4+)

Digital banks pay to appear prominently in comparison results during promotional periods. This is Moneymax’s proven playbook applied to savings rates — an untapped PH market.

**Pricing model:** Banks pay for featured placement, "promoted" badges, or sponsored rate highlights when running high-rate promos. Estimated: ₱10,000–₱50,000 per campaign, depending on traffic volume.

**Why banks will pay:** When Maya runs a 15% promo, they want maximum exposure to savings-conscious users. We are the only neutral comparison platform showing all rates side by side. Featured placement on our table reaches their exact target audience.

## Stream 4: Public API — The CoinGecko Model for PH Financial Data (Month 6 widget → Month 12 paid API)

**The positioning:** CoinGecko became the developer default for crypto price data by opening their API with a generous free tier, then monetizing commercial usage with paid tiers. No NerdWallet equivalent exists for this — NerdWallet keeps all data proprietary inside their consumer UI. Truva takes the CoinGecko path: **be the data standard for Philippine financial rates.**

No programmatic feed of PH savings rates, after-tax yields, MP2 dividends, BTr data, and DeFi yields exists anywhere. Truva will be building this data infrastructure for the consumer product anyway. Selling API access to it is pure margin — zero additional data collection cost.

### The Funnel: Free Widget → Paid API

| Phase | Timing | Product | Cost | Goal |
| --- | --- | --- | --- | --- |
| **Phase A** | Month 3–5 | Free embeddable rate widget | ₱0 to integrators | Build dependency + SEO backlinks |
| **Phase B** | Month 6–9 | Warm outreach to widget users | — | Convert to paid API |
| **Phase C** | Month 12+ | Self-serve public API with tiered pricing | ₱0–₱50,000/mo | Recurring B2B revenue |

### API Tier Structure (CoinGecko-Mapped to PH Market)

| Tier | Price | Call Limits | Data Access | Target Customer |
| --- | --- | --- | --- | --- |
| **Demo** | ₱0 | 30 calls/min, attribution required | Current rates only, Truva branding required | Blogs, coaches, hobby projects |
| **Starter** | ₱2,000/month | 500 calls/min, 500K calls/month | Full dataset: banks + govt + UITFs + DeFi + after-tax | Small apps, financial coaches |
| **Growth** | ₱8,000/month | 1,000 calls/min, 2M calls/month | Full dataset + 12-month historical rates + Palago Scores | Fintech apps, HR platforms, media |
| **Enterprise** | ₱25,000–50,000/month | Custom SLA, unlimited | White-label, custom endpoints, competitive intelligence feed, 99.9% uptime SLA | Digital banks, large fintechs, robo-advisors |

### What the Truva API Serves

Endpoints Truva will have as a natural byproduct of building the consumer product:

```
GET /v1/rates/banks          — All PH digital bank rates, after-tax, conditions
GET /v1/rates/government     — MP2, RTBs, T-Bills, BTr data
GET /v1/rates/uitfs          — UITF NAV and rates by fund
GET /v1/rates/defi           — DeFi stablecoin yields (USDC/USDT)
GET /v1/rates/all            — Full feed, all categories
GET /v1/rates/history/{bank} — Historical rate data (paid tiers only)
GET /v1/calculator           — After-tax yield calculation endpoint
GET /v1/palago/{product}     — Composite Palago Score per product
```

### Why This Is Defensible (The CoinGecko Parallel)

CoinGecko's moat is not the data itself — it's being **the developer standard**. Once 50 apps are calling `api.truva.ph/v1/rates`, switching away requires rebuilding integrations. The free tier creates this dependency at zero cost. Paid tiers monetize scale. Enterprise tier monetizes the banks themselves — Maya and Tonik paying to receive competitive rate monitoring from the very platform their customers use to compare them.

### Who Pays and When

| Customer | Product | Est. Monthly | Sales Cycle |
| --- | --- | --- | --- |
| PH finance blogs ([Grit.ph](http://Grit.ph), JuanInvestor, [FintechNews.ph](http://FintechNews.ph)) | Free widget → Starter API | ₱0 → ₱2,000 | Short — outreach Month 3 |
| Financial coaches / CFPs | Starter API (client portal widget) | ₱2,000–5,000 each | Short |
| HR platforms / BPO wellness programs | Growth API | ₱8,000–15,000 each | Medium (3–6 months) |
| Fintech apps / e-wallets | Growth API | ₱15,000–30,000 each | Medium |
| Digital banks (competitive intelligence) | Enterprise | ₱20,000–50,000 each | Long (6–12 months) |
| Robo-advisors / wealth apps | Growth or Enterprise | ₱15,000–40,000 each | Long |
| Media companies (Rappler, Inquirer) | Starter or Growth | ₱5,000–15,000 each | Medium |

**B2B sales cycles are long. The API is a Month 12+ revenue stream.** The free widget (Month 3) is how you build the customer base before asking for money.

## Revenue Timeline (Data-Backed, Conservative)

| Month | Milestone | Revenue Estimate | Key Assumptions |
| --- | --- | --- | --- |
| 1–2 | Launch tool + newsletter. Build free user base via SEO + community. | ₱0–5,000 | 50–100 affiliate referral conversions at ₱50–100 each |
| 3–4 | Newsletter at 1,000–2,000 subscribers. Affiliate links optimized. First bank outreach. | ₱5,000–20,000 | 100–200 referrals/month + growing newsletter engagement |
| 5–6 | Newsletter at 3,000–5,000. First sponsored newsletter placement. 2–3 formal bank partnerships. | ₱15,000–35,000 | 200+ referrals + 1–2 sponsored placements at ₱5K–10K |
| 7–12 | Organic traffic compounding. 8,000–15,000 newsletter subscribers. Formal affiliate partnerships paying higher CPAs. | ₱50,000–100,000 | 500+ referrals/mo at higher rates + regular sponsored content |
| 12–18 | SEO authority established. 15,000–25,000 newsletter. First B2B API customer. Bank partnership revenue growing. | ₱80,000–150,000 | Blended affiliate + sponsored + 1–3 B2B deals |
| Year 2 | Category ownership. 30,000+ monthly visitors. Multiple bank partnerships. | ₱150,000–300,000+ | Scaled affiliate + sponsored placement + B2B API |

**₱100K/month target: realistic at Month 10–14 with strong execution.** Not Month 6. The bottleneck is not the product (buildable in weeks) — it is traffic, SEO authority, newsletter list size, and bank partnership negotiations, all of which take 6–12 months to compound.

---

# 7. Tech Stack

## Philosophy: Data aggregation + math. Nothing more.

| Layer | Service | Cost |
| --- | --- | --- |
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui | Free |
| Charts | Recharts | Free |
| Database + Auth | Supabase | Free → $25/mo |
| PHP Rate Scraping | [n8n.io](http://n8n.io) (self-hosted scheduler) | Free |
| DeFi Yield Data | DefiLlama API (free, no key) | Free |
| Pag-IBIG MP2 | Manual scrape from [pagibigfund.gov.ph](http://pagibigfund.gov.ph) | Free |
| RTB Data | Bureau of Treasury public API | Free |
| UITF Data | NAVPS scraping per fund | Free |
| FX Rates | ExchangeRate-API | Free → ₱600/mo |
| Email + Newsletter | Resend (transactional emails + weekly The Truva Brief newsletter) | Free (3K/mo) → ₱1,200/mo |
| AI | Claude Haiku (calculator only) | ~₱200–500/mo |
| Hosting | Vercel | Free → ₱1,200/mo |
| **Total MVP** |  | **₱0/month** |
| **Total at scale** |  | **~₱4,000/month** |

## The Only Web3 Code We Write

```jsx
// DefiLlama API - free, no key, real-time
const res = await fetch('https://yields.llama.fi/pools')
const { data } = await res.json()
const aaveBase = data.filter(p =>
  p.project === 'aave-v3' &&
  p.chain === 'Base' &&
  p.symbol === 'USDC'
)
// Returns: current APY, 7-day avg, TVL
```

No wallet. No smart contract. No gas. Pure read.

## What We Don't Build at MVP

- Native iOS/Android app — PWA first, app later
- Stock tracker — Investagrams owns that space
- Custom auth — Supabase handles it
- Real-time rate feeds — daily updates are sufficient
- AI chatbot — one targeted call only
- Payment infrastructure — no subscription paywall, no PayMongo. All features free. Revenue is affiliate + sponsored, not consumer payments
- Credit cooperatives, SSS PESO Fund, GSIS, Dollar RTBs — deferred to Month 3+ (scope control)

## Vibe Coding Toolkit

Google Antigravity (primary build tool — agentic IDE, UI generation, scaffolding, autonomous coding, browser testing) + Claude (AI strategy, code review, content) + Supabase AI (schema) + Vercel (deploy)

> **Two things to know about Antigravity before you build:**
> 

> 1. **Quota limits are real.** The free tier runs on weekly quotas for some APIs — not daily. Real-world builders have hit "no more quota" mid-sprint. Monitor usage actively. If you hit limits during a heavy dev week, the estimated ~$20/month Pro tier is worth it immediately.
> 

> 2. **Security QA pass required after each major feature.** AI-generated code prioritizes speed over security. After building auth, TD Tracker, and any user-data feature, do one deliberate review: check session expiration, rate limiting, and that no admin routes are exposed. Takes 30 minutes. Non-negotiable for a financial data product.
> 

**Timeline: 6–8 weeks to a working, traffic-generating product as a solo founder.**

---

# 8. Regulatory Status

**This product requires zero financial licenses.**

| Activity | Our Role | License Needed |
| --- | --- | --- |
| Displaying bank rates | Public info aggregation | None |
| Showing DeFi yields | Reading public blockchain data | None |
| Running a calculator | Software / math | None |
| Sending TD reminders | Notification service | None |
| Referral links | Affiliate marketing | None |
| B2B data API | SaaS | None |
| Collecting payments | PayMongo is licensed | None |

We never hold user funds. We never touch crypto. We are a **financial information platform** — the same category as NerdWallet, MoneySuperMarket, iPrice. BSP and SEC have no jurisdiction over this product.

---

# 9. Go-To-Market

## Phase 1: Content-Led SEO (Month 1–2, zero cost)

Publish monthly:

- “Best Digital Bank Rates Philippines [Month] [Year]”
- “Maya vs Tonik vs UNO: Which Pays More?”
- “Pag-IBIG MP2 vs Digital Bank: Real Calculator”
- “How to Split ₱1M Across Banks and Stay PDIC-Safe”
- “USDC vs Philippine Peso Savings: Which Earns More?”

These are high-intent, low-competition searches. Own them early and traffic compounds permanently.

## Phase 1.5: Free Newsletter — "The Truva Brief" (from Week 1)

The newsletter is not a separate product — it is the affiliate distribution engine. Every email drives readers back to the tool (where affiliate links live) and embeds contextual referral offers.

**Format:** Weekly rate change digest. "Maya dropped their promo rate. Tonik raised theirs. Here’s the updated top 3 — and where to move your money."

**Signup mechanics:** Email capture on the tool homepage (above the fold), after every calculator result, and at the end of every SEO article. Incentive: "Get the weekly rate update before anyone else."

**Growth target:** 500 subscribers by Month 2. 2,000 by Month 4. 5,000+ by Month 6.

**Monetization:** Embedded affiliate links in every issue. Once at 5,000+ subscribers, sell sponsored newsletter placements to digital banks at ₱5,000–₱20,000 per send.

## Phase 2: Community Distribution (Month 2–3)

- Reddit: r/phinvest (357K+ members) — frame as research/tool, not promotion
- Facebook Groups: Pag-IBIG MP2 Philippines, Digital Banking PH, OFW Finance groups
- Twitter/X: PH finance community
- TikTok/YouTube Shorts: partner with 2–3 PH finance creators (Fitz Villafuerte, Sheila Pinay Teenvestor, etc.)

## Phase 3: Viral Sharing Feature

Shareable result card after every calculation:

> *“I’m earning ₱47,200/year more by switching combinations. Calculated on Truva.”*
> 

Free word-of-mouth with social proof built in.

## Phase 4: B2B Outreach (Month 6+)

Inbound via SEO first, then direct outreach to:

- PH personal finance coaches on YouTube/Instagram
- HR managers at BPOs for employee financial wellness
- Digital banks for sponsored placement

---

# 10. Team

**Solo founder operation.** AI-assisted ("vibe coded") development using Google Antigravity and Claude. No co-founder required at this stage.

| Role | Responsibilities | Tools |
| --- | --- | --- |
| Founder (Beto) | Product, dev, content, GTM, partnerships, everything | Google Antigravity • Claude |

**Hiring trigger:** Consider a part-time content writer or VA when newsletter subscribers exceed 5,000 and affiliate revenue exceeds ₱50,000/month.

## 8-Week Build Sprint (Revised — Affiliate-First Model)

| Week | Deliverable |
| --- | --- |
| 1–2 | Live rate comparison table (PHP banks + DeFi) with affiliate referral links + after-tax column. Newsletter signup form live. First SEO article published. |
| 3–4 | Yield calculator embedded above table. Supabase auth for registered users. Email capture on every interaction. Shareable result cards. |
| 5 | Expand table: Pag-IBIG MP2, RTBs, T-Bills, UITFs, government banks. Category filter tabs. First "The Truva Brief" newsletter sent. |
| 6 | PDIC Smart Split optimizer (free, requires login). TD Tracker + maturity reminders (free, requires login). Rate change alerts via email. |
| 7–8 | Palago Score composite rating. "Top 3 for You" default view. Affiliate links optimized on all rows. Affiliate disclosure tooltips. Lighthouse 90+ mobile. First bank partnership outreach. |
| Month 3+ | Goal-based planner. Embeddable rate widget for PH finance blogs. Formal bank partnership negotiations. n8n auto-scraping. |

---

# 10B. Strategic Insights from Global Analogues

Research into five international comparable products (MoneySavingExpert, Canstar, SingSaver, Cermati, Scripbox) surfaced 11 concrete actions to strengthen [TBA]'s product, monetization, and GTM. Full analysis in the sub-page: **International Comparable Analysis — Global Market Analogues**.

### The 5 Highest-Priority Actions

**1. Weekly "The Truva Brief" Email — from Day 1**

Every successful comparable (especially MoneySavingExpert) built compounding retention via a weekly rate-change email. Format: *"Maya dropped their promo rate. UNO quietly raised theirs. Here's the updated top 3."* Launch this with the product. Costs nothing.

**2. Embed Calculator Directly into the Rate Table**

SingSaver proved this: don't make the calculator a separate page. Amount + time horizon inputs sit above the table, and the table re-sorts to show personalized after-tax earnings per bank. The calculator IS the table. This is a UX change, not a new feature.

**3. Build a "Palago Score" (Composite Product Rating)**

Canstar's defensible IP was their star rating system. We should build a branded composite score: after-tax yield (40%) + liquidity (25%) + conditions complexity penalty (20%) + PDIC safety (15%). This makes our table scannable in seconds, positions us as the expert, and gives banks a reason to pay for featured placement.

**4. "Top 3 for You" Default View**

Scripbox reduced decision fatigue by showing 3 recommendations, not 20. After every calculator result, show Top 3 ranked with one-sentence rationale and a clear #1. Full table accessible via "See all options." Apply this to PDIC Smart Split output too.

**5. Transparent Affiliate Disclosure Tooltip**

SingSaver's counterintuitive finding: a small tooltip on every rate card — *"We earn ₱300 if you open this account. This doesn't affect the rates we show."* — increased conversion because it built trust. Include from Day 1.

### 6 Additional Actions (Month 2+)

- Consumer advocacy tone in all content: outrage on behalf of the user
- B2B pitch framing: banks pay to improve/feature their Palago Score
- UTM + referral code pass-through on every affiliate link (airtight tracking)
- Full answers in every SEO article — no gating, no partial answers
- Free embeddable rate widget for PH finance blogs before selling the API
- "Sleeping money" email trigger: *"₱200K in BDO earned ₱3,200 last year. In Maya: ₱28,000. That's ₱24,800 you didn't earn."*

---

# 11. The Moat

**Layer 1 — Data Freshness**

First mover who invests in rate accuracy owns the category. Competitors must rebuild the entire database from scratch.

**Layer 2 — SEO Ownership**

Every article is a permanent traffic asset. 12 months of publishing = owning every major PH savings rate search query. Cannot be bought away by competitors.

**Layer 3 — Brand Trust**

Personal finance is a trust-first category. The brand that becomes synonymous with “best savings rate Philippines” becomes defensible over time. This is why NerdWallet is worth billions despite being a simple comparison site at its core.

**Layer 4 — Regulatory Tailwind (Emerging)**

As BSP and SEC push financial literacy, a trusted neutral comparison platform becomes a natural government partnership target. No competitor is positioned for this.

---

# 12. Key Numbers

| Metric | Figure |
| --- | --- |
| Infrastructure cost at MVP | ₱0/month |
| Infrastructure cost at scale | ~₱4,000/month |
| Subscription paywall | None — product is 100% free |
| Primary revenue model | Affiliate commissions + sponsored placement |
| Phase 1 affiliate CPA range | ₱50–300/account (savings + crypto) |
| Phase 2 affiliate CPA range | ₱500–2,000+/approved card (credit cards) |
| Target ₱100K/month | Realistic at Month 10–14 |
| % of PH digital bank market needed | 0.015% of 20M users to hit meaningful traffic |
| Platform comparison | NerdWallet of the Philippines + crypto yields category |

---

# 13. Brand Name

**Status: DECIDED — Truva**

Short, clean, modern, memorable. No direct Philippine fintech conflicts. There is a "Truva AI" (YC-backed, acquired by Salesforce 2025) but it’s a B2B sales automation tool with no consumer presence, no Philippine operations, and the team has been absorbed into Salesforce. Different industry, different geography, minimal collision risk.

**Next steps:**

- [ ]  Check domain availability: [truva.com](http://truva.com), [truva.ph](http://truva.ph), [truva.app](http://truva.app)
- [ ]  Register domain immediately
- [ ]  Set up GitHub repo: truva-ph or truva-app
- [ ]  Create Supabase project: truva
- [ ]  Connect Vercel
- [ ]  Set up Resend with @truva domain email

Previous candidates considered: Lago, Angat, Masinop, Tipid, Husay. SAVii was blocked due to GoTyme trademark conflict.

---

# 14. Why Now

1. **Digital bank competition is at its peak** — 20M customers, ₱119.5B in deposits, rates actively competing. The comparison problem has never been more relevant.
2. **DeFi yields consistently beat PH bank rates** — no Filipino tool shows this side by side.
3. **Pag-IBIG MP2 is massively popular but poorly understood** — millions in MP2 with no comparison tool.
4. **BSP digital bank moratorium lifted in 2025** — more banks entering = more rate complexity = more need for comparison.
5. **Vibe coding makes a 2-person team competitive** — what took 10 people in 2020 takes 2 people in 6–8 weeks in 2026.

---

*Document prepared: March 2026 | Revised: March 30, 2026*

*Status: Founder Brief v2.0 — Solo founder, affiliate-first model*

*Vision: NerdWallet of the Philippines + crypto/DeFi yields as a unique first-class category*

*Key revision: Dropped ₱149/month subscription paywall. All features free. Revenue via affiliate referrals, sponsored placement, and newsletter. Platform expands from savings + crypto → credit cards → loans → insurance following the NerdWallet multi-category arc.*

*Next milestone: Domain registration ([truva.com](http://truva.com) / [truva.ph](http://truva.ph)) → Build sprint begins*

[Competitive Landscape — Philippine Competitors Deep Dive](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/Competitive%20Landscape%20%E2%80%94%20Philippine%20Competitors%20Dee%209df33c78b41682b18c988112ebf74777.md)

[Competitor Monetization Breakdown](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/Competitor%20Monetization%20Breakdown%2099733c78b41682bdaf240199251553f5.md)

[AI System Instructions — Claude Haiku Integration v1.0](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/AI%20System%20Instructions%20%E2%80%94%20Claude%20Haiku%20Integration%20%2097233c78b4168374bffd01af928deb32.md)

[Brand Guidelines v1.0 — PH Yield & Savings Rate App](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/Brand%20Guidelines%20v1%200%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20Ap%2070d33c78b4168205b765811497af1aef.md)

[International Comparable Analysis — Global Market Analogues](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/International%20Comparable%20Analysis%20%E2%80%94%20Global%20Market%20%20fa833c78b41682e58dae817199c3e4f3.md)

[Expanded Product Coverage — New Financial Products to Aggregate](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/Expanded%20Product%20Coverage%20%E2%80%94%20New%20Financial%20Products%20fe833c78b41682c9aa2481eafe8660fb.md)

[🗓️ Truva 8-Week Sprint Plan — Solo Founder Edition](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/%F0%9F%97%93%EF%B8%8F%20Truva%208-Week%20Sprint%20Plan%20%E2%80%94%20Solo%20Founder%20Edition%2033233c78b41681279fe3da12d4093aa5.md)

[⚠️ Revenue Blockers & Risk Register — What Could Kill This](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/%E2%9A%A0%EF%B8%8F%20Revenue%20Blockers%20&%20Risk%20Register%20%E2%80%94%20What%20Could%20K%2033333c78b4168133b2b0d33562d7ba47.md)

[🗄️ [ARCHIVED] API Monetization Strategy — Not Pursuing](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/%F0%9F%97%84%EF%B8%8F%20%5BARCHIVED%5D%20API%20Monetization%20Strategy%20%E2%80%94%20Not%20Purs%2033333c78b4168195a95efff1e87323c7.md)

[🎨 UX/UI Strategy — Optimized User Flow & Design Principles](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/%F0%9F%8E%A8%20UX%20UI%20Strategy%20%E2%80%94%20Optimized%20User%20Flow%20&%20Design%20Pr%2033433c78b41681dfb87fdab30b31ce27.md)

[🔄 Data Pipeline Strategy — PH Bank Rate Aggregation](%F0%9F%92%B0%20Truva%20%E2%80%94%20PH%20Yield%20&%20Savings%20Rate%20App%20Founder%20Brie/%F0%9F%94%84%20Data%20Pipeline%20Strategy%20%E2%80%94%20PH%20Bank%20Rate%20Aggregatio%2033433c78b41681eeac1ae1eb5ed61798.md)