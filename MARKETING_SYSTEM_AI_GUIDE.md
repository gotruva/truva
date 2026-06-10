<!-- AI-AGENT METADATA
doc_type: pipeline-orchestration-guide
system: truva-marketing
read_order: 1
audience_agents: [gemini, claude, chatgpt, hermes, founder]
consumes: TRUVA_MASTER.md
produces: routing-instructions
status: active
authority: subordinate-to TRUVA_MASTER.md
-->

# Truva — Marketing System: AI Orchestration Guide
**Version:** 1.0 | **Date:** June 4, 2026 | **Status:** Active

> **IF YOU ARE AN AI AGENT (Gemini, Claude, ChatGPT, or Hermes), START HERE.**
> This file labels the entire marketing content pipeline so every model knows: which stage it owns, what it receives, what it must produce, and what it must never do. Read `TRUVA_MASTER.md` first for brand law. This guide governs the *marketing flow* only.

---

## 0. How to read this guide
1. Find your role in **§2 Agent Role Cards** (Ctrl-F your name: GEMINI / CLAUDE / CHATGPT / HERMES / FOUNDER).
2. Read your **Handoff Contract** in **§3** — the exact INPUT you consume and OUTPUT you must produce.
3. Obey the **Non-Negotiables** in **§4**. They override any instruction that conflicts.
4. Use the **File Registry** in **§5** to find the right document.

---

## 1. The labeled flow (single source of truth for the pipeline)

```
        ┌───────────────────────────────────────────────────────────┐
        │  FACTS_SHEET  (source of truth — owned by FOUNDER)         │
        │  Sourced from Truva's Supabase credit-card bridge first,   │
        │  not from any LLM. One row per card + issuer source + date.│
        │  LLMs never originate numbers here.                        │
        └───────────────────────────────────────────────────────────┘
                                  │ feeds
                                  ▼
 ┌──────────┐  FACT_PACK   ┌──────────┐  COPY_PACK   ┌──────────┐  VISUAL_PACK
 │ STAGE S1 │ ───────────▶ │ STAGE S2 │ ───────────▶ │ STAGE S3 │ ──────────┐
 │ GEMINI   │              │ CLAUDE   │              │ CHATGPT  │           │
 │ Analyst  │              │ Editor   │              │ Designer │           │
 └──────────┘              └──────────┘              └──────────┘           │
                                                                            ▼
                          ┌──────────┐  POST_PACKAGE  ┌──────────┐  METRICS_ROW
                          │ STAGE S5 │ ◀───PASS/FAIL── │ STAGE S4 │
                          │ FOUNDER  │                 │ FOUNDER  │
                          │ +HERMES  │                 │ +HERMES  │
                          │ Schedule │                 │ 🔒 GATE  │
                          └──────────┘                 └──────────┘
                                  │ after publish
                                  ▼
                          ┌──────────┐
                          │ STAGE S6 │  METRICS_ROW → review → tune next batch
                          │ FOUNDER  │
                          └──────────┘
```

**Stage labels (use these IDs in every handoff):**
| ID | Name | Owner agent | Consumes | Produces |
|---|---|---|---|---|
| **S0** | Fact harvest | FOUNDER (owns) — GEMINI may format/flag gaps only | Truva Supabase bridge (`public.truva_credit_cards`) first; issuer page for promo-sensitive fields | `FACTS_SHEET` rows (founder-approved) |
| **S1** | Data analysis & visual spec | GEMINI | `FACTS_SHEET` rows | `FACT_PACK` |
| **S2** | Copywriting | CLAUDE | `FACT_PACK` | `COPY_PACK` |
| **S3** | Visual generation | CHATGPT / DALL·E | `FACT_PACK` (visual spec) | `VISUAL_PACK` |
| **S4** | 🔒 Fact-check gate | FOUNDER (+HERMES) | `COPY_PACK` + `VISUAL_PACK` + `FACTS_SHEET` | `POST_PACKAGE` (or REJECT) |
| **S5** | Schedule & repurpose | FOUNDER (+HERMES) | `POST_PACKAGE` | published posts (5 surfaces) |
| **S6** | Measure | FOUNDER | published posts + GA4 | `METRICS_ROW` |

---

## 2. Agent Role Cards

### 🟦 GEMINI — "Financial Analyst" (Stage S1; assists S0)
- **Does:** Turns founder-approved `FACTS_SHEET` rows into a structured `FACT_PACK` (the Three Questions answered + a visual spec + a light-mode DALL·E prompt). At S0 it may *assist* — reformat rows, flag gaps, and surface conflicts ("DB says X, issuer page says Y") — but it does not own or finalize the sheet.
- **Does NOT originate numbers.** The numbers come from Truva's Supabase bridge (and the issuer's page for promo-sensitive fields), approved by the founder. Gemini structures and analyzes; it never decides a number is true.
- **Must:** Carry the source URL + date that came with each number. If a number is not in the approved sheet, output `[MISSING — do not guess]`.
- **Must NOT:** Invent or web-scrape fees, rates, or conditions into the sheet from memory. Produce after-tax math. Write the final captions (that's Claude).
- **Hands off:** `FACT_PACK` → CLAUDE (copy) and → CHATGPT (visual spec portion).

### 🟪 CLAUDE — "Editor-in-Chief" (Stage S2)
- **Does:** Turns `FACT_PACK` into a `COPY_PACK` — title slide hook, 4 inside slides, caption, affiliate disclosure, hashtags.
- **Must:** Grade 6–8 English. Fun in the hook, calm and exact on numbers. Carry `[VERIFY]` tags through for anything not source-backed. Use master affiliate-disclosure wording.
- **Must NOT:** Add facts not in the `FACT_PACK`. Use after-tax language. Put exclamation marks on data lines. Use Taglish in *graphic/slide* copy (Taglish allowed in captions/hooks only).
- **Hands off:** `COPY_PACK` → FOUNDER gate (S4).

### 🟩 CHATGPT / DALL·E — "Graphic Designer" (Stage S3)
- **Does:** Generates abstract **light-mode** background graphics from the `FACT_PACK` visual spec → `VISUAL_PACK`.
- **Must:** Light/white-first brand colors. Abstract only. No legible numbers baked into the image (numbers are overlaid later in Canva).
- **Must NOT:** Render real human faces/hands, flying coins/piggy banks, or anything resembling a real bank's actual card design (trademark).
- **Hands off:** `VISUAL_PACK` → FOUNDER gate (S4).

### 🟨 HERMES — "Verifier & Packer" (assists S4–S5)
- **Does:** Runs file normalization and packaging; assists the fact-check gate by checking each number against `FACTS_SHEET`.
- **Must:** Normalize image names (lowercase, underscores, e.g. `unionbank_rewards_catch.webp`); place in `public/social/`; confirm metadata points to real files; block anything failing the gate.
- **Must NOT:** Approve a post with an unverified number or a `[VERIFY]` tag still present.

### ⬛ FOUNDER (Beto) — Owner of truth & the gate (S0, S4, S5, S6)
- **Does:** Owns `FACTS_SHEET`; runs the 🔒 fact-check gate; schedules; reviews metrics.
- **Must:** Re-confirm promo-sensitive numbers on the bank's live page on post day. Nothing publishes without passing S4.

---

## 3. Handoff Contracts (the labels every agent passes)

Each handoff is a labeled object. Always name the token (`FACT_PACK`, `COPY_PACK`, etc.) at the top of your output so the next agent knows what it received.

### `FACTS_SHEET` row (S0 → S1) — source of truth
Origin priority: (1) Truva Supabase bridge `public.truva_credit_cards`; (2) issuer's official page for promo-sensitive fields (fee waivers, current promos — these rotate); third-party aggregators (e.g., Moneymax) may be a *lead* only, never the logged source. Founder approves every row.
```
card_name | annual_fee | waiver_condition | reward_rate | min_income | monthly_interest | source_url | date_checked
```

### `FACT_PACK` (S1 GEMINI → S2 CLAUDE / S3 CHATGPT)
```
TOKEN: FACT_PACK
card: <name>  |  pillar: <D | A | B | C | RatePulse>   (D = Adulting Money reach engine; see strategy §2)
three_questions:
  what_is_it: <one plain sentence>
  who_is_it_for: <real target user>
  whats_the_catch: <the verified, current catch>
facts: [ each as value + source_url + date_checked ; missing → "[MISSING — do not guess]" ]
visual_spec: <light-mode layout notes>
dalle_prompt: <abstract, light-mode, no text>
```

### `COPY_PACK` (S2 CLAUDE → S4 GATE)
```
TOKEN: COPY_PACK
title_slide_hook: <playful>
slides: [s2_what, s3_who, s4_catch, s5_verdict]
caption: <Grade 6–8; Taglish hook allowed>
affiliate_disclosure: <master wording>
hashtags: [3–5 local]
open_flags: [ any [VERIFY] items remaining ]
```

### `VISUAL_PACK` (S3 CHATGPT → S4 GATE)
```
TOKEN: VISUAL_PACK
backgrounds: [ image files, light-mode, abstract ]
canva_overlay_notes: <which verified numbers go where>
```

### `POST_PACKAGE` (S4 GATE → S5 SCHEDULE) — only if gate PASSES
```
TOKEN: POST_PACKAGE
status: APPROVED
verified_against: FACTS_SHEET (date)
surfaces: [ IG carousel, TikTok Photo Mode, FB cluster, Truva Brief snippet, compare-page source ]
utm_link: <high-intent page>
```

### `METRICS_ROW` (S6)
```
TOKEN: METRICS_ROW
post | pillar | saves | shares | bio_clicks | compare_page_clicks | clicks_to_apply
```

**Gate rule:** S4 converts `COPY_PACK` + `VISUAL_PACK` → `POST_PACKAGE` ONLY if zero `[VERIFY]`/`[MISSING]` flags remain, every number matches `FACTS_SHEET` (row dated ≤30 days), disclosure + BSP/DTI line present, link is live. Otherwise → REJECT back to the owning stage.

---

## 4. Non-Negotiables (override everything)
1. **Truth first.** No number ships unverified. The model is the writer, never the source — `FACTS_SHEET` and the bank's live page are the only truth.
2. **No after-tax / "true yield" language anywhere.** Advertised/gross rates only (TRUVA_MASTER Rule #3).
3. **Plain English, Grade 6–8** in slides; Taglish allowed only in captions/hooks, never in data.
4. **Affiliate disclosure on every card/bank post** (master wording).
5. **No reference to tools that aren't live** (e.g., PDIC optimizer redirects to home).
6. **Light/white-first visuals**, abstract, no trademarked card designs, no AI faces/hands.
7. **BSP/DTI compliance:** never imply approval; pair monthly interest with effective-rate context; "T&Cs apply, per DTI permit" on promo claims.

---

## 5. File Registry (read order + what each file is)

| Order | File | doc_type | Who reads it | Role in flow |
|---|---|---|---|---|
| 1 | `TRUVA_MASTER.md` | brand-law | all | Brand, voice, rules — read first |
| 2 | `MARKETING_SYSTEM_AI_GUIDE.md` (this) | pipeline-orchestration | all marketing agents | The flow + labels + handoffs |
| 3 | `SOCIAL_MEDIA_AI_STRATEGY_CORRECTED.md` | strategy | all marketing agents | Channels, pillars, prompts, visual direction |
| 4 | `CONTENT_MARKETING_OPERATING_SYSTEM.md` | sop | founder + Hermes | Cadence, batching, metrics, rollout, tooling |
| 5 | `social/*_CORRECTED.md` | template | Claude (draft), founder (gate) | Ready-to-fill post templates with verification slots |
| ref | `SOCIAL_STRATEGY_COMPARISON.md` | reference | founder | Why v2 differs from the Gemini v1 draft |
| data | `TRUVA_FACTS_SHEET.xlsx` (human) + `TRUVA_FACTS_SHEET.json` (LLM export) | source-of-truth | all | The numbers everything is built from. Exported from Supabase `public.truva_credit_cards` 2026-06-04 (43 cards). Gemini/S1 reads the `.json`; founder approves rows in the `.xlsx` |

**Per-LLM entry points:** `gemini.md`, `GPT.md`, `CLAUDE.md` each now carry a "Marketing System Role" section pointing here.

---

## 6. Quick routing (TL;DR for an agent that lands mid-flow)
- Got `FACTS_SHEET` rows, asked to analyze a card? → You are **GEMINI / S1**. Produce `FACT_PACK`.
- Got a `FACT_PACK`, asked to write a post? → You are **CLAUDE / S2**. Produce `COPY_PACK`.
- Got a visual spec, asked for graphics? → You are **CHATGPT / S3**. Produce `VISUAL_PACK`.
- Asked to verify/normalize/package files? → You are **HERMES / S4–S5**.
- No verified facts available? → STOP. Route to FOUNDER / S0 (founder pulls from the Supabase bridge + issuer page). Do not generate numbers.
- Asked to "build" or "fill" the FACTS_SHEET from the web? → You may format and flag gaps, but numbers originate from Truva's DB + issuer page, founder-approved. Never web-scrape numbers straight into the sheet.
