# 🗄️ [ARCHIVED] API Monetization Strategy — Not Pursuing

> **Strategic principle:** CoinGecko became the developer default for crypto price data by opening their API with a generous free tier, then monetizing commercial usage at scale. NerdWallet takes the opposite approach — keeping all data proprietary inside a consumer UI. Truva follows CoinGecko's path. **No programmatic feed of Philippine savings rates, after-tax yields, MP2 dividends, BTr data, and DeFi yields exists anywhere. Truva will be the first.**
> 

---

## Why This Works for Truva Specifically

Truva is building the data infrastructure to power the consumer product anyway — rate collection pipelines, after-tax calculation logic, Palago Scores, historical rate tracking. Selling API access is **pure margin on work already done**. Zero additional data collection cost. Zero additional engineering required at MVP.

The parallel to CoinGecko is direct:

| CoinGecko | Truva |
| --- | --- |
| Crypto price data — fragmented, manual to collect | PH savings rate data — fragmented, manual to collect |
| No developer-standard API existed before them | No developer-standard PH financial rate API exists |
| Free tier → massive adoption → paid tier conversion | Free widget → dependency → paid API conversion |
| Banks / exchanges pay to be featured and monitored | PH banks pay for competitive intelligence feed |
| 10B+ API calls/month at scale | Philippine market — smaller scale, same model |

---

## The Three-Phase Funnel

### Phase A — Free Embeddable Widget (Month 3–5)

**Goal:** Build dependency and distribution before asking for money.

A JavaScript snippet any PH finance blog or financial coach can paste onto their site. Renders a live, Truva-branded rate table with current after-tax yields. Updates automatically whenever Truva updates its data.

```html
<!-- Truva Rate Widget -->
<script src="https://truva.ph/widget.js" data-category="banks" data-limit="5"></script>
```

- Free forever for non-commercial use, Truva branding required
- Target Month 3 outreach: [Grit.ph](http://Grit.ph), JuanInvestor, [FintechNews.ph](http://FintechNews.ph), PH finance YouTubers
- Every widget embed = SEO backlink + brand impression + future API lead
- Cermati (Indonesia) proved this exact model: widget distribution → API sales

### Phase B — Warm API Outreach (Month 6–9)

**Goal:** Convert widget users and identify commercial buyers before public launch.

- Direct outreach to sites already using the widget: "You're already on our data. Here's programmatic access."
- Identify fintech apps and HR platforms through inbound interest
- Offer a 3-month pilot at discounted rate in exchange for a testimonial
- No self-serve yet — all deals closed manually to understand buyer needs

### Phase C — Self-Serve Public API (Month 12+)

**Goal:** Recurring B2B revenue with minimal sales effort.

- Public documentation site ([docs.truva.ph](http://docs.truva.ph))
- Self-serve signup with Stripe billing
- Developer dashboard: API key management, usage tracking, quota alerts
- Upgrade prompts when free tier limits are hit

---

## API Tier Structure

| Tier | Price | Rate Limit | Monthly Calls | Data Access | Target |
| --- | --- | --- | --- | --- | --- |
| **Demo** | ₱0 | 30 calls/min | 10K/month | Current rates only. Truva branding required on display. | Blogs, coaches, hobby devs |
| **Starter** | ₱2,000/month | 500 calls/min | 500K/month | Full dataset: banks + govt + UITFs + DeFi + after-tax math | Small apps, coaches going pro |
| **Growth** | ₱8,000/month | 1,000 calls/min | 2M/month | Full dataset + 12-month historical rates + Palago Scores + rate change webhooks | Fintech apps, HR platforms, media |
| **Enterprise** | ₱25,000–50,000/month | Custom SLA | Unlimited | White-label, custom endpoints, competitive intelligence feed, 99.9% uptime SLA, dedicated support | Digital banks, large fintechs, robo-advisors |

**Overage billing:** ₱500 per additional 500K calls above quota (Growth+). Disabled by default, opt-in.

**Annual discount:** 20% off for annual prepay (mirrors CoinGecko's model).

---

## API Endpoints (Built as Byproduct of Consumer Product)

Every endpoint below is a natural output of the data Truva already collects for its own rate table. No additional data pipeline work required.

```
GET  /v1/rates/banks            All PH digital bank rates, gross + after-tax, conditions
GET  /v1/rates/banks/{id}       Single bank detail
GET  /v1/rates/government       MP2, RTBs, T-Bills, Landbank, DBP, OFBank
GET  /v1/rates/uitfs            UITF NAV and annualized rates by fund
GET  /v1/rates/defi             DeFi stablecoin yields (USDC/USDT on Aave, Morpho)
GET  /v1/rates/all              Full feed, all categories, sortable
GET  /v1/rates/history/{id}     Historical rate data — paid tiers (Starter+) only
GET  /v1/calculator             After-tax yield calculation — input: amount, rate, product type
GET  /v1/palago/{id}            Palago Score per product — paid tiers only
GET  /v1/compare                Side-by-side comparison of 2–5 products
GET  /v1/top                    Top N products by Palago Score or after-tax yield
POST /v1/webhooks               Rate change alerts webhook — Growth+ only
GET  /v1/key                    Current API key usage stats (mirrors CoinGecko /key endpoint)
```

**Response format (consistent across all endpoints):**

```json
{
  "data": [...],
  "meta": {
    "last_updated": "2026-04-01T08:00:00+08:00",
    "total_count": 24,
    "currency": "PHP",
    "tax_rate_applied": 0.20
  },
  "status": {
    "credits_used": 1,
    "credits_remaining": 49999
  }
}
```

---

## What Makes the Truva API Defensible

**1. The after-tax calculation layer**

Truva doesn't just return raw rates — it returns `grossRate`, `afterTaxRate`, `effectiveYield`, `conditionsPenalty`, and `taxTreatment` (standard 20% FWT, 7.5% FCD for USD TDs, tax-exempt for MP2/T-Bills). No other PH data source does this. This is structured, opinionated financial data — not a scrape.

**2. PH-specific product coverage**

Pag-IBIG MP2, BTr T-Bills, RTBs, cooperative deposits, OFBank, Landbank — globally there is no API for these. The addressable market is small but completely uncontested.

**3. Historical rate data**

By Month 6, Truva has 6 months of rate history. By Month 12, it has 12 months. Historical PH savings rate data is itself a product — banks, researchers, and financial apps will pay for it. Nobody else is building this archive.

**4. Palago Score**

A proprietary composite rating (after-tax yield + liquidity + conditions + PDIC safety) that no raw data source can replicate. Banks wanting to understand their competitive position need this score.

**5. Developer standard moat**

Once 30–50 apps are calling `api.truva.ph/v1/rates`, switching requires rebuilding integrations. The free tier creates this lock-in at zero cost.

---

## Revenue Projections

| Scenario | Month 12 | Month 18 | Month 24 |
| --- | --- | --- | --- |
| Conservative (5 Starter, 2 Growth) | ₱26,000/mo | ₱45,000/mo | ₱80,000/mo |
| Base (10 Starter, 5 Growth, 1 Enterprise) | ₱90,000/mo | ₱150,000/mo | ₱250,000/mo |
| Optimistic (20 Starter, 10 Growth, 3 Enterprise) | ₱260,000/mo | ₱400,000/mo | ₱600,000/mo |

At scale, the API becomes the highest-margin revenue stream — no sales team, no customer support for free tier users, and banks essentially pay to be monitored by their own competition.

---

## What NOT to Build at MVP

- No API infrastructure during the 8-week sprint. Build the consumer product first.
- No public docs until Month 10+
- No self-serve billing until Month 12
- The free widget (Month 3) is the only "API-adjacent" thing that gets built early

---

## CoinGecko Pricing Reference (for benchmarking)

CoinGecko's actual tiers as of 2025–2026:

- **Demo (free):** ~30 calls/min, attribution required
- **Analyst:** ~$129/month (~₱7,200), 500K calls/month
- **Pro:** ~$499/month (~₱27,700), 2M calls/month
- **Enterprise:** ~$999/month+ (~₱55,500), custom

Truva prices at roughly 25–30% of CoinGecko's rates given the narrower PH-specific dataset and market size. As coverage expands to credit cards and loans (Phase 2+), pricing moves up.

---

*Sub-page of: Truva — PH Yield & Savings Rate App | Founder Brief v2.0*

*Created: March 30, 2026 | Status: Strategy — build Month 12+, widget Month 3*