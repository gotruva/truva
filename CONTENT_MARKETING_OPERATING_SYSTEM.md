<!-- AI-AGENT METADATA
doc_type: sop
system: truva-marketing
read_order: 4
audience_agents: [founder, hermes]
consumes: MARKETING_SYSTEM_AI_GUIDE.md, SOCIAL_MEDIA_AI_STRATEGY_CORRECTED.md
produces: cadence, batching-process, metrics, rollout-plan
pipeline_stages: [S0, S4, S5, S6]
status: active
authority: subordinate-to TRUVA_MASTER.md
-->

# Truva — Content & Marketing Operating System
**Version:** 1.0 | **Date:** June 4, 2026 | **Status:** Active
**Owner:** Beto (solo founder) | **Companions:** `SOCIAL_MEDIA_AI_STRATEGY_CORRECTED.md`, `TRUVA_MASTER.md`

> **Purpose:** Turn one-off posts into a repeatable engine a single founder can run on a $20 AI stack without burning out — and without ever shipping a wrong number. This doc answers "how do we scale content and marketing," reviewed and shaped by a PH-finance growth marketer.

---

## 0. The one rule everything hangs on
**Truva's asset is trust. A skipped post costs nothing. A wrong fee on a "What's the Catch?" post costs the brand.** Every system choice below exists to make *accurate* content *fast* — never fast at the expense of accurate.

---

## 1. The core principle: batch by stage, not by post
Don't take one post end-to-end. Context-switching is what kills solo throughput. Instead, run **8–10 posts through each stage together**: research all → write all → design all → verify all → schedule all.

**Realistic cadence:** 3 posts/week (12/month). One **batch day every 2 weeks** produces ~6 posts; you schedule and drip them. This is sustainable for one person. Daily posting is not — don't pretend otherwise.

**Weekly mix (reach-led funnel):**
- 1× Pillar D "Adulting Money" (the reach engine — beginner/relatable, earns the audience)
- 1× Pillar B "Card Battle" *or* Pillar C "Free for Life" (intent)
- 1× Pillar A "What's the Catch?" *or* Rate Pulse (trust / retention)

Rationale: D earns reach, B/C capture intent, A builds trust → Apply. See `PILLAR_VALIDATION_SCAN.md`. Lead audience: beginners / first-timers.

---

## 2. The production pipeline (your roles, played by you + AI)

```
[ VERIFIED FACTS SHEET ]  ← single source of truth (you own this)
          │
   1. Harvest facts (you + Gemini)   → refresh the sheet for this batch's cards
          ▼
   2. Draft copy (Claude)            → captions + slide copy from the sheet only
          ▼
   3. Design (DALL·E + Canva)        → abstract light-mode bg + real text overlaid in Canva
          ▼
   4. 🔒 FACT-CHECK GATE (you)       → hard stop; lookup against the sheet
          ▼
   5. Schedule + repurpose           → 1 effort → 5 surfaces
          ▼
   6. Measure (GA4 + dashboard row)  → kill what only earns impressions
```

### Stage 1 — Harvest facts (the foundation)
Maintain a **Verified Facts Sheet** (Google Sheet or Notion DB), **sourced from Truva's own Supabase credit-card bridge (`public.truva_credit_cards`) first** — not from an LLM's web reading. For promo-sensitive fields the DB doesn't hold cleanly (fee-waiver conditions, current promos), confirm on the **issuer's official page** (aggregators like Moneymax are a lead only). Gemini may help *format* rows and *flag gaps/conflicts*, but it never originates a number, and you (founder) approve every row. One row per card/product:

| Card | Annual fee | Fee-waiver condition | Reward rate | Min income | Monthly interest | Source URL | Date checked |
|---|---|---|---|---|---|---|---|
| UnionBank Rewards | ₱2,500 | Free for life if ₱20k spend in 60 days | 1pt/₱30; 3x shopping & dining | ₱180k/yr | ~3% | unionbankph.com/cards-fees | 2026-06-04 |
| HSBC Red | ₱2,500 (free yr 1) | "For life" needs ~₱60k spend + app reg | 1pt/₱20; 4x online/dining/overseas | ₱400k/yr | ~3% | hsbc.com.ph + offers.hsbc.com.ph | 2026-06-04 |

**Rule:** the LLMs never invent a number — they only format what's in this sheet. Anything missing comes back as `[VERIFY]`, never a guess. A row older than ~30 days must be re-checked before reuse. This turns fact-checking from "re-research every time" into "lookup."

### Stage 2 — Draft (Claude)
Feed Claude the verified rows + the playbook's Editor prompt. Generate all 6 copy packages in one session. Voice: **fun in the hook, calm and exact in the data.**

### Stage 3 — Design (DALL·E + Canva)
- Generate **abstract light-mode backgrounds** in batch (playbook §5 prompts).
- **Overlay the real numbers as text in Canva — never bake numbers into the AI image** (DALL·E scrambles text and you lose fact control). One reusable Canva template per pillar → ~10 min per card.
- Card art stays abstract: **must not resemble any real bank's actual card design** (issuer trademark).

### Stage 4 — 🔒 Fact-Check Gate (the hard stop)
Lookup, not re-research. Nothing ships unless ALL pass:
- [ ] Every number matches the Verified Facts Sheet, and the row is dated within ~30 days.
- [ ] The "catch" is currently true (re-confirm on the bank's own page on post day for promo-sensitive cards).
- [ ] No after-tax / "true yield" language anywhere.
- [ ] No reference to tools that aren't live (e.g., PDIC optimizer).
- [ ] Affiliate disclosure present (master wording).
- [ ] **BSP/DTI compliance line** present (see §4).
- [ ] Link goes to a live, high-intent page.

### Stage 5 — Schedule + repurpose (1 effort → 5 surfaces)
Each carousel becomes:
1. Instagram carousel
2. TikTok Photo Mode (same cards, trending sound)
3. Facebook single-graphic or 3–4 card cluster
4. A snippet in **The Truva Brief** (newsletter)
5. Raw material for one **comparison blog page** (`/credit-cards/compare/...`) — see §3

Schedule IG + FB via **Meta Business Suite** (free). TikTok manually or via a cheap scheduler (Metricool/Buffer).

### Stage 6 — Measure
One dashboard row per post (see §5).

---

## 3. The four things the social strategy alone misses (add these to scale)

### A. Comparison-SEO is where the money actually is
Social drives spiky traffic; **search drives compounding, high-intent traffic.** Your competitor Moneymax wins on programmatic comparison SEO. Every social post should have a **matching, indexable landing page** for the same query:
- "unionbank rewards vs hsbc red" → `/credit-cards/compare/unionbank-rewards-vs-hsbc-red`
- "no annual fee credit card philippines" → a `/credit-cards/no-annual-fee` roundup
**Action:** the UTM links in the posts already point here — make sure those pages exist, are indexable, and carry the same verified facts. Social feeds SEO; it doesn't replace it.

### B. Email turns rented reach into owned reach
IG/TikTok reach can vanish with one algorithm change. **The Truva Brief is owned land.** Every social CTA should also offer "get the weekly rate drop." Convert followers → subscribers relentlessly.

### C. Taglish is your biggest untapped reach lever
Keep **data slides in clean English** (brand rule). But **lean into warm Taglish in hooks and captions** — it dramatically outperforms pure English for PH organic reach on TikTok/FB.
- Hooks: *"Free for life nga ba talaga?"*, *"Ito 'yung hindi sinasabi sa credit card ad..."*
- A/B test Taglish vs. English captions for a month; keep what reaches further.

### D. Measurement, or you're flying blind
Track by pillar so you can see which content earns commissions vs. just likes.

---

## 4. Compliance guardrails (PH-specific — don't skip)
- **You are an affiliate, not the issuer.** Never imply guaranteed approval. Never quote a promo without "T&Cs apply."
- **BSP truth-in-advertising:** when you state an interest rate, don't cherry-pick a bare monthly figure in isolation — pair "~3% per month" with effective-annual context so it isn't misleading.
- **DTI promo permits rotate.** Any "free for life if you spend ₱X" claim must be re-verified on the bank's page on post day, with the source + date logged.
- **Affiliate disclosure on every card/bank post**, master wording.
- Add a one-line compliance check to the Fact-Check Gate (done in §2.4).

---

## 5. Metrics that matter (weekly dashboard)
One row per post:

| Post | Pillar | Saves | Shares | Link-in-bio clicks | Clicks to comparison page | Clicks-to-Apply (CTA) |
|---|---|---|---|---|---|---|

- **Saves + shares** = the signals that drive PH reach (especially TikTok). Optimize hooks for these.
- **Clicks-to-Apply** = the only metric that pays rent. Track per pillar; double down on what converts, kill what only earns impressions.
- Use GA4 + the UTM scheme already in the posts.

---

## 6. Tooling stack (lean, ~$73/mo)
| Tool | Role | Cost |
|---|---|---|
| Gemini Advanced | Fact structuring | $20 |
| Claude Pro | Copy | $20 |
| ChatGPT Plus / DALL·E | Backgrounds | $20 |
| Canva Pro | Text overlay templates (keeps numbers accurate) | ~$13 |
| Google Sheets / Notion | Verified Facts Sheet (source of truth) | free |
| Meta Business Suite | Schedule IG + FB | free |
| GA4 + UTM | Measurement | free (in place) |

---

## 7. Anti-burnout rules
1. **Batch every 2 weeks**, don't post daily by hand.
2. **If a fact can't be verified on batch day, that post isn't made** — don't defer it, don't ship it unverified.
3. **Reuse templates** (Canva per pillar, prompt library, the Facts Sheet) so each post is assembly, not invention.
4. **5 surfaces per research effort** — never research something once and use it once.

---

## 8. 30-day rollout
**Week 1**
- Fix the UnionBank post framing (done — real ₱20k/60-day catch) and fill the Card Battle with verified numbers (done).
- Build the Verified Facts Sheet (seed with UnionBank + HSBC Red; add 8–10 more cards).
- Manually confirm which subreddits/FB groups actually exist (default to r/phinvest, r/PHCreditCards; verify r/CreditCardsPH & r/DigitalBankingPH).

**Week 2**
- First batch day: produce 6 posts through the pipeline. Set up Canva templates per pillar.
- Stand up matching comparison landing pages for the first posts; confirm they're indexable.

**Week 3**
- Start posting (3/week, scheduled). Wire The Truva Brief signup into every CTA.
- Launch Taglish vs. English caption A/B test.

**Week 4**
- First metrics review by pillar. Kill/scale based on clicks-to-Apply. Plan next batch.
