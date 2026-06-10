<!-- AI-AGENT METADATA
doc_type: batch-run-pack
system: truva-marketing
read_order: 6
audience_agents: [founder, gemini, claude, chatgpt]
consumes: TRUVA_FACTS_SHEET.json, MARKETING_SYSTEM_AI_GUIDE.md
produces: FACT_PACK, COPY_PACK, VISUAL_PACK, POST_PACKAGE
pipeline_stages: [S1, S2, S3, S4]
status: ready-to-run
authority: subordinate-to TRUVA_MASTER.md
-->

# Truva — Batch 001 Run Pack
**Date:** June 4, 2026 | **Cards:** all sourced from `TRUVA_FACTS_SHEET` (Supabase, 2026-06-04) | **Posts:** 4 (one per pillar — head-to-head test)

---

## How to read this file

Every step is labeled so you always know exactly what YOU do vs. what the AI does.

| Label | Meaning |
|---|---|
| 🤖 AI PROMPT | Copy the block and paste it into the named tool. Do not change the prompt. |
| 👤 YOU | A step you do manually — no AI involved. |
| 🔒 GATE | Hard stop. Nothing moves forward until every checkbox is ticked. |

**Run one post at a time, top to bottom.** Each post has: S1 (Gemini) → S2 (Claude) → S3a (ChatGPT image) → S3b (Canva overlay) → S4 gate.

---

## 👤 PRE-FLIGHT — do this before running any post

- [ ] Open `TRUVA_FACTS_SHEET.xlsx` and confirm the row(s) for this batch are founder-approved and dated within the last 30 days.
- [ ] If any row is older than 30 days, go to the issuer's page, re-check the numbers, and update the sheet before proceeding.
- [ ] Confirm the Truva landing page for this post exists and is live (see each post's gate checklist for the URL).

---

## Posts in this batch

| Post | Pillar | Card(s) | Hook angle |
|---|---|---|---|
| 0 | **D — Adulting Money (reach)** | No single card — beginner education | "Before your first credit card, check only these 3 numbers" |
| 1 | A — What's the Catch? | BPI Gold Rewards | "Free for the first year… then what?" |
| 2 | B — Card Battle | Security Bank Wave vs Chinabank Freedom | Two cards that are actually free for life — which wins? |
| 3 | C — Free for Life | AUB Gold, Chinabank Freedom, Security Bank Wave, EastWest Platinum | Cards with no annual fee, ever — no spend condition |

> **Why 4 posts:** one per pillar, shipped together so clicks-to-Apply (and saves/shares) can rank the pillars head-to-head. Post 0 (Pillar D) is the reach engine — it should pull the most saves/shares and feed the others.

---
---

# POST 0 — Pillar D — "Adulting Money" reach post
**Angle:** Beginner education, no single card. Earns reach + saves, funnels to `/credit-cards`. All numbers are DB-grounded aggregates — no per-card claims.

---

### 🤖 STEP 1 — GEMINI (S1 · Financial Analyst)

Paste the block below into Gemini. Do not edit it.

```
You are Truva's Financial Analyst (Stage S1). Using ONLY these verified AGGREGATE facts from Truva's database (43 PH cards, 2026-06-03 — do not add per-card numbers from memory/web), produce a FACT_PACK for a BEGINNER reach post titled "Before your first credit card, check only these 3 numbers."

VERIFIED AGGREGATES (FACTS_SHEET):
- Annual fee: some PH cards are genuinely free for life with NO spend condition (e.g., AUB Gold, Chinabank Freedom, Security Bank Wave, EastWest Platinum); MANY others are "free first year" then charge ₱1,000–₱7,000/yr unless you hit a spend target. So the real question is HOW the fee is waived, not "is it free."
- Interest on unpaid balance: about 3% per month is the standard across nearly all cards (a few lower, e.g., 2.5%). This is the number that hurts if you don't pay in full.
- Income requirement: ranges widely — from about ₱15,000/month for entry cards up to ₱165,000/month for premium ones. Beginners should check this first to avoid rejection.
- date_checked: 2026-06-03 | source: Truva DB (public.truva_credit_cards)

Output FACT_PACK: pillar D; three_questions reframed as "the 3 numbers" (fee+how-waived / interest per month / income to qualify); facts list with source+date; light-mode visual_spec; abstract light-mode DALL·E prompt (no text/logos/real cards). No captions.
```

---

### 👤 HANDOFF S1 → S2

1. Copy Gemini's full FACT_PACK output.
2. In the Step 2 block below, replace `[PASTE GEMINI'S FACT_PACK HERE]` with Gemini's output.
3. Paste the completed block into Claude.

---

### 🤖 STEP 2 — CLAUDE (S2 · Editor-in-Chief)

Paste the block below (with Gemini's FACT_PACK inserted) into Claude.

```
You are Truva's Editor-in-Chief (Stage S2). From this FACT_PACK only, write the beginner reach-post COPY_PACK: warm Taglish hook; 4 slides (the 3 numbers + a close); caption + master disclosure + 3–5 beginner hashtags. Grade 6–8; calm on numbers; Taglish in hook/caption only; no per-card claims beyond the aggregates. Goal: maximize saves/shares and send beginners to /credit-cards.

[PASTE GEMINI'S FACT_PACK HERE]
```

#### ✅ REFERENCE — what a good COPY_PACK looks like for this post
```
TOKEN: COPY_PACK
title_slide_hook: "Before your first credit card, tingnan mo lang 'tong 3 numbers 👀"
slides:
  s2: "1) The annual fee — and HOW it's waived. Some cards are free for life, no condition. Many are 'free year 1' then ₱1,000–₱7,000/year unless you spend enough. Always ask which kind."
  s3: "2) Interest per month. Most PH cards charge about 3% a month on anything you don't pay in full. Pay the full balance and this never touches you."
  s4: "3) The income requirement. It ranges from about ₱15,000/month to ₱165,000/month. Check this first so you don't get rejected."
  s5: "That's it. Fee (and how it's waived), interest, income. Compare all three side by side, free, on Truva."
caption: |
  Bago ka mag-apply ng first credit card mo — 3 numbers lang muna. 👀
  1) Annual fee + paano ma-waive (some are free for life, no condition; many are only free year 1).
  2) Interest per month — usually around 3% on unpaid balance. Pay in full and you're safe.
  3) Income requirement — ₱15k to ₱165k/month depending on the card. Check this para hindi ka ma-reject.
  Compare all three across PH cards, free, at gotruva.com (link in bio).
  Affiliate Disclosure: We earn a fee if you apply and get approved through our links. This does not change what you are offered, and it keeps Truva free. We rank every card honestly, based on real numbers.
hashtags: #CreditCardsPH #FirstCreditCard #AdultingPH #PersonalFinancePH #Gotruva
open_flags: []
```

---

### 👤 HANDOFF S2 → S3

1. Save Claude's COPY_PACK somewhere you can refer to (Notes, Google Doc, etc.).
2. You will use the slide text from the COPY_PACK in Step 3b (Canva).

---

### 🤖 STEP 3a — CHATGPT / DALL·E (S3 · Background image only)

Paste the block below into ChatGPT (image generation mode). This generates the abstract background only — no text.

```
Generate a LIGHT-MODE graphic, abstract, no text, no logos, not resembling real cards:

A clean, friendly light-mode fintech illustration for beginners: three simple abstract "number" tiles (1-2-3) floating on a bright white background (#FFFFFF), Truva Blue (#0052FF) accents, soft green (#12B76A) check motif, thin light-grey dividers (#E4E7EC), gentle shadows. Approachable, calm, premium. No text. 4:5 aspect ratio.
```

---

### 👤 STEP 3b — YOU (Canva · Text overlay)

1. Download the ChatGPT background image.
2. Open your **Pillar D Canva template**.
3. Drop the background image onto the template.
4. Overlay the slide text from Claude's COPY_PACK — one slide at a time:
   - **Title slide:** hook from `title_slide_hook`
   - **Slides 2–4:** text from `s2`, `s3`, `s4`
   - **Closing slide:** text from `s5`
5. Typography: **Space Grotesk** for headers, **Inter** for body. Numbers never edited — copy exactly from COPY_PACK.
6. Export all 5 slides as a set.

---

### 🔒 STEP 4 — FOUNDER GATE (S4)

Do not schedule this post until every box is checked.

- [ ] Aggregates still match the Facts Sheet (fee patterns, ~3%/mo, income range). No per-card claim slipped in.
- [ ] No after-tax language anywhere.
- [ ] Affiliate disclosure present (master wording).
- [ ] Link is live → `/credit-cards`.
- [ ] No `[VERIFY]` or `[MISSING]` flags in the COPY_PACK.
- [ ] BSP/DTI compliance line present.

**If gate passes:** build `POST_PACKAGE` and move to scheduling (S5).
**If gate fails:** identify which item failed, fix at the owning stage, and re-run from that step.

> This is the reach test — watch saves/shares closely vs Posts 1–3.

---
---

# POST 1 — Pillar A — BPI Gold Rewards
**Angle:** "What's the Catch?" — free year one, then ₱2,250/year unless you hit the spend target.

---

### 🤖 STEP 1 — GEMINI (S1 · Financial Analyst)

Paste the block below into Gemini. Do not edit it.

```
You are Truva's Financial Analyst (Stage S1). Read TRUVA_MASTER.md and MARKETING_SYSTEM_AI_GUIDE.md rules. Using ONLY the verified row below (from Truva's database — do not add numbers from memory or the web), produce a FACT_PACK.

VERIFIED ROW (FACTS_SHEET):
- card: BPI Gold Rewards Card | bank: Bank of the Philippine Islands
- annual_fee_first_year: PHP 0 | annual_fee_recurring: PHP 2,250
- fee_waiver_condition: min PHP 180,000 annual spend (per Moneymax — confirm on BPI page), OR redeem 45,000 BPI Rewards Points
- monthly_interest: 3.0% | effective_annual_EIR: [MISSING in DB]
- rewards_type: points | reward_earn_rate: [NOT IN DB]
- min_income: PHP 40,000/month (PHP 480,000/year)
- foreign_txn_fee: 1.85% | cash_advance_fee: PHP 200 + 3.0%
- source_url: https://www.bpi.com.ph/personal/cards/credit-cards/bpi-gold-mastercard | date_checked: 2026-06-03

Output a FACT_PACK with: pillar; three_questions (what_is_it / who_is_it_for / whats_the_catch); facts list (each with source + date; mark anything not provided as "[MISSING — do not guess]"); a light-mode visual_spec; and an abstract light-mode DALL·E prompt (no text, no real card designs). Do not write captions — that's Claude/S2.
```

#### ✅ REFERENCE — what a good Gemini FACT_PACK looks like
```
TOKEN: FACT_PACK
card: BPI Gold Rewards Card | pillar: A
three_questions:
  what_is_it: A mid-tier rewards points card from BPI for people with a steady income.
  who_is_it_for: Earners around PHP 40,000/month and up who want points on regular spend.
  whats_the_catch: It's free the first year, then PHP 2,250/year — unless you spend PHP 180,000 in a year or burn 45,000 points. Interest is about 3% per month.
facts:
  - annual_fee_first_year: PHP 0 (source: bpi.com.ph, 2026-06-03)
  - annual_fee_recurring: PHP 2,250 (source: bpi.com.ph, 2026-06-03)
  - waiver: PHP 180,000 annual spend OR 45,000 points [confirm on BPI page — lead was Moneymax]
  - monthly_interest: ~3% (source: bpi.com.ph, 2026-06-03)
  - effective_annual_EIR: [MISSING — add before any EIR claim]
  - reward_earn_rate: [MISSING — do not guess; confirm on BPI page]
  - min_income: PHP 40,000/mo (source: bpi.com.ph, 2026-06-03)
visual_spec: Light-mode single-card hero; white background; Truva-blue accents; abstract points/▲ chart motif.
dalle_prompt: (see Step 3a)
```

---

### 👤 HANDOFF S1 → S2

1. Copy Gemini's full FACT_PACK output.
2. In the Step 2 block below, replace `[PASTE GEMINI'S FACT_PACK HERE]` with Gemini's output.
3. Paste the completed block into Claude.

---

### 🤖 STEP 2 — CLAUDE (S2 · Editor-in-Chief)

Paste the block below (with Gemini's FACT_PACK inserted) into Claude.

```
You are Truva's Editor-in-Chief (Stage S2). Using ONLY this FACT_PACK (do not add facts), write a COPY_PACK for an IG/TikTok photo carousel. Rules: Grade 6–8 English; playful hook, calm and exact on numbers (no exclamation marks on data); 4 inside slides (what is it / who is it for / what's the catch / verdict + CTA); caption with the master affiliate disclosure; 3–5 PH hashtags; keep any [MISSING]/[VERIFY] tags visible. Taglish allowed in the hook/caption only, never in the data slides.

[PASTE GEMINI'S FACT_PACK HERE]
```

#### ✅ REFERENCE — what a good Claude COPY_PACK looks like
```
TOKEN: COPY_PACK
title_slide_hook: "BPI Gold Rewards: libre ang first year… tapos ano? 💳"
slides:
  s2_what: "What is it? A mid-tier rewards card from BPI. You earn points when you spend. [VERIFY earn rate on BPI page]"
  s3_who:  "Who is it for? People earning around ₱40,000 a month or more who want points on everyday spend."
  s4_catch:"What's the catch? Free the first year — then ₱2,250 every year. You skip the fee only if you spend ₱180,000 in a year or use 45,000 points. Unpaid balance grows about 3% a month."
  s5_verdict:"The verdict: Good if you'll spend enough to cancel out the fee. If not, ₱2,250 a year quietly eats your rewards. Pay in full, always."
caption: |
  BPI Gold Rewards looks free — and for year one, it is. Here's the part the ad doesn't lead with. 💳
  • Year 1: ₱0. After that: ₱2,250/year.
  • You avoid the fee only if you spend ₱180,000 in a year, or redeem 45,000 points.
  • Needs about ₱40,000/month income, so it's not really an entry-level card.
  Worth it if you spend enough to earn the fee back. If not, look for a card that's free with no conditions.
  👉 Compare PH credit cards side by side, free, at gotruva.com (link in bio).
  Affiliate Disclosure: We earn a fee if you apply and get approved through our links. This does not change what you are offered, and it keeps Truva free. We rank every card honestly, based on real numbers.
hashtags: #CreditCardsPH #BPI #PersonalFinancePH #Gotruva #TipidTips
open_flags: [reward earn rate VERIFY; EIR MISSING; waiver — confirm on BPI page]
```

---

### 👤 HANDOFF S2 → S3

1. Save Claude's COPY_PACK.
2. **Before continuing:** resolve all `[VERIFY]` and `[MISSING]` flags by checking bpi.com.ph. You need:
   - Reward earn rate (confirmed on BPI page)
   - Waiver condition confirmed (₱180k spend / 45k points — the DB lead was Moneymax, not BPI directly)
   - EIR — if not published, note that in the gate checklist; do not invent or estimate it
3. Update the COPY_PACK with confirmed values before Step 3b.

---

### 🤖 STEP 3a — CHATGPT / DALL·E (S3 · Background image only)

Paste the block below into ChatGPT (image generation mode). This generates the abstract background only — no text.

```
Generate a clean LIGHT-MODE fintech graphic, abstract only, no text, no logos, not resembling any real bank's card:

A professional product mockup of a single sleek credit card styled like a modern fintech product, in white with elegant Truva Blue (#0052FF) accents, clean metallic chip, minimalist abstract wave lines, soft blue edge highlight. Resting on a bright clean white surface (#FFFFFF) with a subtle light-grey gradient and faint thin grid lines (#E4E7EC). Soft studio lighting, gentle shadows. Premium, trustworthy light-mode fintech aesthetic. High-fidelity, 4:5 aspect ratio.
```

---

### 👤 STEP 3b — YOU (Canva · Text overlay)

1. Download the ChatGPT background image.
2. Open your **Pillar A Canva template**.
3. Drop the background image onto the template.
4. Overlay the slide text from Claude's COPY_PACK (with `[VERIFY]`/`[MISSING]` already resolved):
   - **Title slide:** hook from `title_slide_hook`
   - **Slides 2–4:** text from `s2_what`, `s3_who`, `s4_catch`
   - **Closing slide:** text from `s5_verdict`
5. Typography: **Space Grotesk** for headers, **Inter** for body. Copy numbers exactly — do not retype them.
6. Export all 5 slides as a set.

---

### 🔒 STEP 4 — FOUNDER GATE (S4)

Do not schedule this post until every box is checked.

- [ ] Confirm earn rate + waiver on **bpi.com.ph** (the DB row had a Moneymax lead + a `[MISSING]` earn rate).
- [ ] EIR added, or no annualized-rate claim made in the slides.
- [ ] No after-tax language anywhere.
- [ ] Affiliate disclosure present (master wording).
- [ ] Link is live → relevant BPI card page or `/credit-cards`.
- [ ] No `[VERIFY]` or `[MISSING]` flags remaining in the COPY_PACK.
- [ ] BSP/DTI compliance line present.

**If gate passes:** build `POST_PACKAGE` and move to scheduling (S5).
**If gate fails:** go back to the step that owns the failed item and fix it there.

---
---

# POST 2 — Pillar B — Security Bank Wave vs Chinabank Freedom
**Angle:** Card Battle — two cards that are genuinely free for life, no spend condition. Differentiate on interest rate and income bar.

---

### 🤖 STEP 1 — GEMINI (S1 · Financial Analyst)

Paste the block below into Gemini. Do not edit it.

```
You are Truva's Financial Analyst (Stage S1). Using ONLY the two verified rows below (Truva DB — no memory/web numbers), produce a FACT_PACK for a head-to-head Card Battle. Same output format as always (three_questions framed as the comparison, facts with sources, light-mode visual_spec, DALL·E prompt). Mark anything not provided as [MISSING — do not guess]. Don't write captions.

ROW A — Security Bank Wave Mastercard:
- annual_fee: PHP 0, NAFFL (unconditional, no spend requirement)
- monthly_interest: 2.5% | EIR: [MISSING] | rewards_type: cashback | earn_rate: [NOT IN DB]
- min_income: PHP 30,000/mo (PHP 360,000/yr existing cardholder; PHP 480,000/yr first-timer)
- foreign_txn_fee: 2.5% | source: securitybank.com/.../wave-mastercard | date: 2026-06-03

ROW B — Chinabank Freedom Mastercard:
- annual_fee: PHP 0, NAFFL (perpetually waived, no condition)
- monthly_interest: 3.0% | EIR: [MISSING] | rewards_type: points | earn_rate: [NOT IN DB]
- min_income: PHP 20,833/mo (PHP 250,000/yr)
- foreign_txn_fee: 2.5% | source: chinabank.ph/credit-cards-freedom | date: 2026-06-03
```

---

### 👤 HANDOFF S1 → S2

1. Copy Gemini's full FACT_PACK output.
2. In the Step 2 block below, replace `[PASTE GEMINI'S FACT_PACK HERE]` with Gemini's output.
3. Paste the completed block into Claude.

---

### 🤖 STEP 2 — CLAUDE (S2 · Editor-in-Chief)

Paste the block below (with Gemini's FACT_PACK inserted) into Claude.

```
You are Truva's Editor-in-Chief (Stage S2). From this FACT_PACK only, write a Card Battle COPY_PACK: title hook; slides for Annual Fee, Interest, Who Gets In (income), and a Truva Verdict; caption + master disclosure + 3–5 hashtags. Grade 6–8; calm on numbers; Taglish only in hook/caption. Keep [MISSING]/[VERIFY] tags. Honest framing: both are genuinely free for life — differentiate on interest (Wave 2.5% vs Freedom 3%) and income bar (Freedom is easier to get).

[PASTE GEMINI'S FACT_PACK HERE]
```

---

### 👤 HANDOFF S2 → S3

1. Save Claude's COPY_PACK.
2. **Before continuing:** confirm both cards are still NAFFL + resolve the cashback/points earn rates on each issuer page:
   - Security Bank Wave: securitybank.com
   - Chinabank Freedom: chinabank.ph
3. Update the COPY_PACK with confirmed values before Step 3b.

---

### 🤖 STEP 3a — CHATGPT / DALL·E (S3 · Background image only)

Paste the block below into ChatGPT (image generation mode). This generates the abstract background only — no text.

```
Generate a LIGHT-MODE head-to-head graphic, abstract, no text, no logos, not resembling real cards:

A minimalist light-mode head-to-head credit-card comparison for a mobile fintech app. Two sleek cards float facing each other, separated by a thin Truva Blue (#0052FF) vertical divider, above a clean white dashboard (#FFFFFF) with faint glassmorphic comparison charts in light grey (#F8F9FB) and subtle green (#12B76A) highlights. Thin elegant borders (#E4E7EC), soft shadows, crisp shapes. Bright, premium, trustworthy fintech aesthetic. 4:5 aspect ratio.
```

---

### 👤 STEP 3b — YOU (Canva · Text overlay)

1. Download the ChatGPT background image.
2. Open your **Pillar B Canva template**.
3. Drop the background image onto the template.
4. Overlay the slide text from Claude's COPY_PACK (with `[VERIFY]`/`[MISSING]` already resolved):
   - **Title slide:** hook
   - **Slides 2–4:** Annual Fee, Interest, Who Gets In
   - **Closing slide:** Truva Verdict
5. Typography: **Space Grotesk** for headers, **Inter** for body. Copy numbers exactly — do not retype them.
6. Export all 5 slides as a set.

---

### 🔒 STEP 4 — FOUNDER GATE (S4)

Do not schedule this post until every box is checked.

- [ ] Confirm both cards are still unconditionally NAFFL on their issuer pages.
- [ ] Cashback/points earn rates confirmed and added (were `[NOT IN DB]`).
- [ ] EIR added, or no annualized claim made.
- [ ] No after-tax language anywhere.
- [ ] Affiliate disclosure present (master wording).
- [ ] Link is live → `/credit-cards` or relevant compare page.
- [ ] No `[VERIFY]` or `[MISSING]` flags remaining.
- [ ] BSP/DTI compliance line present.

**If gate passes:** build `POST_PACKAGE` and move to scheduling (S5).
**If gate fails:** go back to the step that owns the failed item and fix it there.

---
---

# POST 3 — Pillar C — "Free For Life" roundup (4 cards)
**Angle:** Four cards with NO annual fee ever — no spend condition. Clearly distinguish from "waived if you spend."

---

### 🤖 STEP 1 — GEMINI (S1 · Financial Analyst)

Paste the block below into Gemini. Do not edit it.

```
You are Truva's Financial Analyst (Stage S1). Using ONLY these verified rows (Truva DB, all flagged NAFFL = no spend condition), produce a FACT_PACK for a "genuinely free for life" roundup. For each card give one plain line: who it suits + income bar. Note honestly that "free for life" here means NO spend condition (unlike many cards that require a spend to waive). Mark missing data [MISSING]. No captions.

1) AUB Gold Mastercard — NAFFL unconditional; income PHP 50,000/mo; points; 3%/mo; src online.aub.ph/creditcards/goldandplatinum
2) Chinabank Freedom Mastercard — NAFFL perpetual; income PHP 20,833/mo (lowest bar); points; 3%/mo; src chinabank.ph/credit-cards-freedom
3) Security Bank Wave Mastercard — NAFFL unconditional; income PHP 30,000/mo; cashback; 2.5%/mo (lowest interest); src securitybank.com/.../wave-mastercard
4) EastWest Platinum Mastercard — NAFFL; income PHP 150,000/mo (high bar); points; 3%/mo; src eastwestbanker.com/.../platinum-mastercard
All date_checked: 2026-06-03
```

---

### 👤 HANDOFF S1 → S2

1. Copy Gemini's full FACT_PACK output.
2. In the Step 2 block below, replace `[PASTE GEMINI'S FACT_PACK HERE]` with Gemini's output.
3. Paste the completed block into Claude.

---

### 🤖 STEP 2 — CLAUDE (S2 · Editor-in-Chief)

Paste the block below (with Gemini's FACT_PACK inserted) into Claude.

```
You are Truva's Editor-in-Chief (Stage S2). From this FACT_PACK only, write a roundup COPY_PACK: hook ("free forever — and we mean no spend condition"); one slide per card (name + one-line who-it's-for + income bar); a closing slide that explains the difference between "free for life, no condition" and "waived only if you spend"; caption + master disclosure + 3–5 hashtags. Grade 6–8; calm on numbers; Taglish only in hook/caption.

[PASTE GEMINI'S FACT_PACK HERE]
```

---

### 👤 HANDOFF S2 → S3

1. Save Claude's COPY_PACK.
2. **Before continuing:** re-confirm each card is still unconditionally NAFFL on its issuer page — NAFFL status can and does change. Check all four before proceeding.
3. Update the COPY_PACK if anything has changed.

---

### 🤖 STEP 3a — CHATGPT / DALL·E (S3 · Background image only)

Paste the block below into ChatGPT (image generation mode). This generates the abstract background only — no text.

```
Generate a LIGHT-MODE graphic, abstract, no text, no logos, not resembling real cards:

A clean light-mode fintech scene with four minimalist abstract cards arranged in a soft grid on a bright white background (#FFFFFF), Truva Blue (#0052FF) accents, subtle green (#12B76A) "check" motifs, thin light-grey dividers (#E4E7EC), soft shadows. Premium, trustworthy, airy. No text. 4:5 aspect ratio.
```

---

### 👤 STEP 3b — YOU (Canva · Text overlay)

1. Download the ChatGPT background image.
2. Open your **Pillar C Canva template**.
3. Drop the background image onto the template.
4. Overlay the slide text from Claude's COPY_PACK (with `[VERIFY]`/`[MISSING]` already resolved):
   - **Title slide:** hook
   - **Slides 2–5:** one slide per card (name + who it's for + income bar)
   - **Closing slide:** "free for life, no condition" vs "waived only if you spend" explainer
5. Typography: **Space Grotesk** for headers, **Inter** for body. Copy numbers exactly — do not retype them.
6. Export all slides as a set.

---

### 🔒 STEP 4 — FOUNDER GATE (S4)

Do not schedule this post until every box is checked.

- [ ] Re-confirm each of the 4 cards is still unconditionally NAFFL on its issuer page (checked on post day).
- [ ] No after-tax language anywhere.
- [ ] Affiliate disclosure present (master wording).
- [ ] Link is live → `/credit-cards/no-annual-fee`.
- [ ] No `[VERIFY]` or `[MISSING]` flags remaining.
- [ ] BSP/DTI compliance line present.

**If gate passes:** build `POST_PACKAGE` and move to scheduling (S5).
**If gate fails:** go back to the step that owns the failed item and fix it there.

---
---

## 👤 AFTER THE BATCH — S5 + S6

### S5 — Schedule + repurpose (you)
Each approved `POST_PACKAGE` becomes 5 surfaces:
1. Instagram carousel — schedule via **Meta Business Suite**
2. TikTok Photo Mode — same slides, add trending sound, post manually or via Metricool
3. Facebook — single graphic or 3–4 card cluster, schedule via **Meta Business Suite**
4. **The Truva Brief** — pull the caption as a newsletter snippet
5. Matching comparison page — confirm the UTM link in the post points to a live, indexed page

### S6 — Measure (you)
Log one row per post in your metrics dashboard after posting:

| Post | Pillar | Saves | Shares | Bio clicks | Compare-page clicks | Clicks-to-Apply |
|---|---|---|---|---|---|---|

Review by pillar after 7 days. Double down on what drives Clicks-to-Apply. Kill pillars that only earn impressions.

---

## Notes for next batch
- Add **UnionBank Rewards** + **HSBC Red** to the Supabase bridge so the two on-hold posts can run.
- Populate **EIR** for cards before any interest-rate claim (BSP compliance).
- Capture **reward earn rates** in the DB — several rows have `rewards_type` but no earn formula, which forces `[VERIFY]` on every post.
