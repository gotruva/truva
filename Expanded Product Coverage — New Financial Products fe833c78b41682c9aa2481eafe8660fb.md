# Expanded Product Coverage — New Financial Products to Aggregate

This page documents the capital-stable, yield-bearing Philippine financial products identified as gaps in our current Module 1 coverage. All products listed here are accessible to regular Filipino retail investors and have no capital appreciation component — they are pure yield instruments, making them directly comparable to digital bank savings rates.

> **Status:** Research complete. Pending founder decision on inclusion priority and data pipeline feasibility per category.
> 

---

## Why This Matters

Our current Module 1 covers digital bank savings, time deposits, UITFs, Pag-IBIG MP2, RTBs, and DeFi stablecoins. That is a strong foundation — but it misses entire product categories that millions of Filipinos already use. Adding these deepens the "one place for everything" positioning and widens the moat against any competitor trying to replicate us.

The guiding filter: **capital-stable + yield-bearing + accessible to retail Filipinos.** Every product below passes that filter.

---

## Category 1: Government Securities (BTr)

We currently track RTBs but not the full Bureau of Treasury retail product suite.

### T-Bills (Treasury Bills)

| Field | Detail |
| --- | --- |
| Tenors | 91-day, 182-day, 364-day |
| Issuer | Bureau of Treasury (Republic of the Philippines) |
| Risk | Sovereign — zero default risk |
| Capital stability | Full principal returned at maturity |
| Access | BTr Online Ordering Facility (OOF), GCash (via [Bonds.ph](http://Bonds.ph)), select brokers |
| Data source | BTr public auction results (published weekly) |
| Minimum investment | ₱5,000 |
| Tax | 20% final withholding tax on interest |

**Why add it:** T-Bills are the shortest-duration sovereign product available. Users with 3–6 month horizons who don't want a time deposit or digital bank promo rate need to see T-Bills in their options. Auction results are public — data pipeline is a weekly scrape of BTr's website.

### Fixed Rate Treasury Notes (FXTNs)

| Field | Detail |
| --- | --- |
| Tenors | 2, 3, 5, 7, 10 years |
| Issuer | Bureau of Treasury |
| Risk | Sovereign |
| Capital stability | Full principal at maturity (if held to maturity) |
| Access | BTr OOF, secondary market via brokers |
| Data source | BTr secondary market reference rates (daily) |
| Tax | 20% final withholding tax on coupon interest |

**Why add it:** FXTNs serve the "set and forget for 5–10 years" user — OFWs, retirees, long-horizon savers. The coupon rate is fixed and known. Yield-to-maturity data is published by BTr daily. Distinct from RTBs in distribution channel and tenor range.

**Data pipeline:** BTr publishes reference rates at [www.treasury.gov.ph](http://www.treasury.gov.ph) — daily scrape via n8n.

---

## Category 2: Foreign Currency Products

We currently compare DeFi USDC yields but have no PHP-based foreign currency products. This is a critical gap for our OFW segment (₱38.3B in annual remittances).

### Dollar Time Deposits

| Field | Detail |
| --- | --- |
| Currency | USD |
| Tenors | 30 days to 5 years (varies by bank) |
| Issuers | BDO, BPI, Metrobank, RCBC, UnionBank, digital banks |
| Risk | PDIC-insured up to $500 (peso equivalent of ₱500,000 per depositor per bank, converted at BSP rate) |
| Capital stability | Full USD principal at maturity |
| Access | Any Philippine bank with a USD account |
| Data source | Per-bank website scraping (no central feed) |
| Tax | 7.5% final withholding tax (preferential rate for FCDs) |

**Why add it:** The most common USD yield product for OFW families and dollar earners. Showing dollar TD rates alongside USDC DeFi yields gives our OFW users the comparison they actually need: *"Is my dollar better in BDO's USD TD or in USDC on Aave?"* No Philippine tool answers this today.

**Tax note:** Foreign currency deposits have a preferential 7.5% final withholding tax (vs 20% for peso deposits). Our calculator must reflect this correctly — it's a significant difference in after-tax yield.

### Dollar RTBs / Global Bonds

| Field | Detail |
| --- | --- |
| Currency | USD |
| Issuer | Bureau of Treasury (Republic of the Philippines) |
| Risk | Sovereign |
| Access | Periodic retail issuance — BTr OOF + brokers |
| Data source | BTr issuance announcements (irregular) |
| Tax | Typically tax-exempt for non-residents, 20% for residents |

**Why add it:** USD-denominated Philippine sovereign bonds are a premium product for dollar savers who want government security without FX risk. Not always available, but when BTr issues them, they get significant press. We track availability + current rate when active, show "Not currently available" when inactive.

---

## Category 3: Cooperative Deposits

**This is the highest-value gap in the entire market. No aggregator tracks this.**

### Credit Cooperative Savings & Time Deposits

| Field | Detail |
| --- | --- |
| Rates | Typically 6–12% per annum — well above digital banks |
| Regulator | Cooperative Development Authority (CDA), not BSP |
| Insurance | Not PDIC. Covered by CETF (Cooperative Education and Training Fund) — different coverage rules |
| Major coops | Ating Cooperative, TFCCI, NATCCO network members, Pag-asa ng Bayan, hundreds of others |
| Access | Membership required (most are open to public) |
| Data source | **No public feed — manual per-coop research only** |
| Risk | Moderate — CDA-regulated but not BSP-supervised |

**Why add it:** Cooperatives serve millions of Filipinos — particularly in the middle class, teachers, government workers, and rural communities. Their yields are consistently the highest in the capital-stable category. Yet they are completely invisible in any comparison tool because there is no central data source and no aggregator has bothered.

**Moat implication:** Building a cooperative rate database is labor-intensive but creates a near-impossible-to-replicate competitive advantage. Once we have it, no scraper can copy it.

**Risk labeling:** Cooperative deposits must be clearly labeled as non-PDIC insured with a risk level of "Low-Medium" (vs "Very Low" for bank products). Our PDIC Smart Split optimizer should exclude cooperative deposits from PDIC coverage calculations.

**Suggested MVP approach:** Launch with the top 10 most accessible national cooperatives. Expand via community submissions (users submit their coop's rates — we verify before publishing).

---

## Category 4: Government-Owned Bank Products

### Landbank of the Philippines

| Field | Detail |
| --- | --- |
| Type | Government-owned universal bank |
| Products | Landbank iAccess savings, time deposits, special savings programs |
| Risk | Government-owned — very high trust for conservative savers |
| Data source | Landbank website |
| PDIC | Yes — PDIC insured |

### Development Bank of the Philippines (DBP)

| Field | Detail |
| --- | --- |
| Type | Government-owned development bank |
| Products | DBP savings accounts, time deposits |
| PDIC | Yes |
| Data source | DBP website |

### OFBank (Overseas Filipino Bank)

| Field | Detail |
| --- | --- |
| Type | BSP-licensed digital bank, wholly owned by Landbank |
| Target market | OFWs and their families — our highest-value user segment |
| Products | OFW-specific savings products, remittance-linked savings |
| PDIC | Yes |
| Data source | OFBank website |

**Why add government banks:** Conservative savers — especially those with ₱500K+ — often refuse to put money in Maya or Tonik. Landbank and DBP are the "safe" choice for this segment. Showing their rates in the same table validates our neutrality and serves a user cohort that other comparison tools ignore.

---

## Category 5: Government Benefit Savings Programs

### SSS PESO Fund (Personal Equity and Savings Option)

| Field | Detail |
| --- | --- |
| Type | Voluntary savings program on top of SSS contributions |
| Yield | Annual dividend declared by SSS board — historically 4–7% |
| Risk | Government-backed — capital guaranteed by SSS |
| Access | SSS members only (almost all formal-sector employees) |
| Data source | SSS annual dividend announcement (once per year) |
| Tax | Tax-exempt |
| Liquidity | Withdrawable at retirement or specific qualifying events |

**Why add it:** The SSS PESO Fund is massively underutilized — most SSS members don't know it exists. Its yield is competitive with digital banks, it's tax-exempt, and it's government-backed. Nobody compares it to bank rates. Showing it in our table (with a liquidity caveat) is a genuine user insight.

### GSIS Financial Assistance Loan (GFAL) / GSIS Savings

| Field | Detail |
| --- | --- |
| Type | Government employees' savings programs |
| Access | Government employees (teachers, military, civil servants) only |
| Data source | GSIS website + annual reports |

**Why add it:** Government employees are a massive, underserved segment. Teachers in particular are heavy users of coops and government programs. Adding GSIS products alongside GSIS-employer-matched savings creates a complete picture for this user cohort.

---

## Updated Master Coverage Table

| Product | Currency | Regulator | PDIC / Insured | Risk Level | Data Source | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Digital bank savings | PHP | BSP | ✅ PDIC | Very Low | Bank websites (daily) | ✅ Already built |
| Time deposits (private banks) | PHP | BSP | ✅ PDIC | Very Low | Bank websites | ✅ Already built |
| UITFs / Money Market | PHP | BSP/SEC | ❌ (mark-to-market) | Very Low | NAVPS per fund | ✅ Already built |
| Pag-IBIG MP2 | PHP | HDMF | ✅ HDMF-backed | Very Low | [pagibigfund.gov.ph](http://pagibigfund.gov.ph) | ✅ Already built |
| RTBs | PHP | BTr | ✅ Sovereign | Very Low | BTr | ✅ Already built |
| DeFi stablecoins (USDC/USDT) | USD | None | ❌ | Low-Medium | DefiLlama API | ✅ Already built |
| **T-Bills (91/182/364-day)** | PHP | BTr | ✅ Sovereign | Very Low | BTr auction results | 🔴 Add — Week 5 |
| **FXTNs** | PHP | BTr | ✅ Sovereign | Very Low | BTr reference rates | 🟡 Add — Month 3 |
| **Dollar Time Deposits** | USD | BSP | ✅ PDIC (USD) | Very Low | Per-bank scraping | 🔴 Add — Week 5 |
| **Dollar RTBs / Global Bonds** | USD | BTr | ✅ Sovereign | Very Low | BTr announcements | 🟡 Add — Month 3 |
| **Cooperative deposits** | PHP | CDA | ❌ CETF only | Low-Medium | Manual per-coop | 🟠 Add — Month 4+ |
| **Landbank savings / TDs** | PHP | BSP | ✅ PDIC | Very Low | Landbank website | 🔴 Add — Week 5 |
| **DBP savings / TDs** | PHP | BSP | ✅ PDIC | Very Low | DBP website | 🔴 Add — Week 5 |
| **OFBank savings** | PHP | BSP | ✅ PDIC | Very Low | OFBank website | 🔴 Add — Week 5 |
| **SSS PESO Fund** | PHP | SSS | ✅ Gov-backed | Very Low | SSS annual declaration | 🟡 Add — Month 3 |
| **GSIS savings programs** | PHP | GSIS | ✅ Gov-backed | Very Low | GSIS website | 🟡 Add — Month 3 |

**Priority legend:** 🔴 High (add in build sprint) | 🟡 Medium (Month 3+) | 🟠 Strategic moat (Month 4+ with manual effort)

---

## Data Pipeline Notes

### Easy wins (Week 5 additions — low scraping effort)

- T-Bills: BTr publishes weekly auction results as a structured table at [treasury.gov.ph](http://treasury.gov.ph)
- Landbank / DBP / OFBank: Standard bank website scraping via n8n, same pipeline as private digital banks
- Dollar Time Deposits: Add USD column to existing time deposit scraper per bank

### Moderate effort (Month 3)

- FXTNs: BTr publishes daily reference rates — add to existing BTr scraper
- SSS PESO Fund: Annual update only — near-zero maintenance once built
- GSIS: Semi-annual update

### High effort / strategic bet (Month 4+)

- Cooperative deposits: No central feed. Requires manual research + community submission model. High moat, high effort. Consider a "Submit your coop's rate" feature where users contribute data (verified before publishing).

---

## Impact on PDIC Smart Split Optimizer

Adding government bank products and cooperative deposits requires a PDIC logic update:

- **Landbank / DBP / OFBank:** PDIC-insured — include in PDIC split calculations normally
- **Cooperative deposits:** NOT PDIC-insured — optimizer must exclude them from PDIC coverage math and label clearly. They can be recommended as a yield-maximizing allocation *outside* the PDIC-insured portion.
- **Dollar deposits:** PDIC covers up to the peso equivalent of ₱500,000 per depositor per bank (converted at BSP rate) — treat as separate PDIC bucket from peso deposits at the same bank
- **SSS PESO Fund / GSIS:** Government-guaranteed but not PDIC — exclude from PDIC split, include as a separate "government-safe" tier

---

## Impact on Tax Calculator

| Product | Withholding Tax Rate | Notes |
| --- | --- | --- |
| Digital bank savings (PHP) | 20% final | Standard |
| Time deposits (PHP) | 20% final | Standard |
| T-Bills | 20% final | Standard |
| FXTNs | 20% final | Standard |
| RTBs | 20% final | Standard |
| Dollar Time Deposits (FCD) | **7.5% final** | Preferential rate for Foreign Currency Deposits |
| Pag-IBIG MP2 | **Tax-exempt** |  |
| SSS PESO Fund | **Tax-exempt** |  |
| Cooperative deposits | 20% final | Same as bank deposits |
| DeFi / USDC | **Not withheld** | User's responsibility to declare; note in UI |

**The 7.5% FCD rate is a major insight for OFW users** — dollar TDs are taxed at less than half the rate of peso products. Our after-tax calculator must surface this visibly.

---

*Sub-page of: [TBA] — PH Yield & Savings Rate App | Founder Brief v1.0*

*Research completed: March 2026*

*Status: Pending founder review and prioritization*