<!-- AI-AGENT METADATA
doc_type: onboarding
system: truva-marketing
read_order: 7
audience: content-operator (human)
consumes: MARKETING_SYSTEM_AI_GUIDE.md, BATCH_RUN_PACK
status: active
authority: subordinate-to TRUVA_MASTER.md
-->

# Truva Content Operator — Onboarding Guide
**Version:** 1.0 | **Date:** June 2026 | **Owner:** Beto (founder)

> **You are reading this because you are taking over (or learning) Truva's content production system.** This document tells you everything you need to know to run the pipeline from start to finish. Read it fully before you touch any tool.

---

## 1. What you are doing (and why it matters)

Truva posts educational content about Philippine financial products on Instagram, TikTok, and Facebook. The goal is not just likes — it is to send people to gotruva.com to compare products and click Apply (which is how Truva earns revenue).

**The single most important rule: Truva's reputation is built on accurate numbers.** One wrong fee or rate on a post destroys trust. Every number that goes out has to be verified against a source before it ships. The system is designed to make that easy — but you are the last human check before anything is published.

---

## 2. The tools you need (and what each one does)

| Tool | What it does in this system | Access |
|---|---|---|
| **Gemini** (Google) | Stage S1 — turns verified facts into a structured FACT_PACK | gemini.google.com (Gemini Advanced, $20/mo) |
| **Claude** (Anthropic) | Stage S2 — turns the FACT_PACK into slide copy and captions | claude.ai (Claude Pro, $20/mo) |
| **ChatGPT** (OpenAI) | Stage S3 — generates the abstract background image (DALL·E) | chatgpt.com (ChatGPT Plus, $20/mo) |
| **Canva** | Stage S3b — you overlay the verified text onto the background | canva.com (Canva Pro, ~$13/mo) |
| **Meta Business Suite** | Stage S5 — schedule Instagram + Facebook posts | business.facebook.com (free) |
| **TikTok** | Stage S5 — post TikTok Photo Mode manually or via Metricool | free |
| **TRUVA_FACTS_SHEET.xlsx** | Source of truth — all numbers come from here | In the truva folder |
| **Supabase** | Where the Facts Sheet data originally comes from (Beto's DB) | Ask Beto for access |
| **GA4** | Stage S6 — measure post performance | Ask Beto for access |

You will use all of these tools. Make sure you have logins before your first batch day.

---

## 3. The pipeline — what happens in what order

```
👤 YOU (pre-flight)
     │ Confirm Facts Sheet rows are current and founder-approved
     ▼
🤖 GEMINI — Stage S1
     │ FACT_PACK (structured facts, no captions)
     ▼
👤 YOU (handoff)
     │ Copy Gemini's output, paste into Claude
     ▼
🤖 CLAUDE — Stage S2
     │ COPY_PACK (hook, 5 slides, caption, disclosure, hashtags)
     ▼
👤 YOU (handoff + flag resolution)
     │ Save the COPY_PACK; resolve any [VERIFY]/[MISSING] flags on issuer pages
     ▼
🤖 CHATGPT / DALL·E — Stage S3a
     │ Abstract background image (no text baked in)
     ▼
👤 YOU — Canva Stage S3b
     │ Download image → open Canva template → overlay slide text from COPY_PACK
     ▼
🔒 FOUNDER GATE — Stage S4
     │ Hard stop: every number verified, disclosure present, link live, no flags
     ▼
👤 YOU — Schedule S5
     │ IG + FB via Meta Business Suite; TikTok manually
     ▼
👤 YOU — Measure S6
     │ Log METRICS_ROW per post after 7 days
```

**The labels used in every Run Pack:**
- 🤖 AI PROMPT — paste this block into the named tool, do not change it
- 👤 YOU — a step you do manually
- 🔒 GATE — hard stop, nothing moves forward until all boxes are checked

---

## 4. The files you work with

| File | What it is | Where it lives |
|---|---|---|
| `TRUVA_MASTER.md` | Brand rules, voice, personas — read this first if you're new | `/truva/` |
| `MARKETING_SYSTEM_AI_GUIDE.md` | Full pipeline spec, agent roles, handoff contracts | `/truva/` |
| `TRUVA_FACTS_SHEET.xlsx` | The verified numbers all content is built from | `/truva/` |
| `TRUVA_FACTS_SHEET.json` | Same data, LLM-readable format (Gemini reads this) | `/truva/` |
| `BATCH_001_RUN_PACK.md` | Step-by-step execution script for Batch 1 (4 posts) | `/truva/social/` |
| `CONTENT_MARKETING_OPERATING_SYSTEM.md` | Cadence, metrics, compliance rules, tooling stack | `/truva/` |
| Canva templates | One per pillar (A, B, C, D) — reusable each batch | Canva (ask Beto for folder link) |

**Read order before your first batch:** TRUVA_MASTER.md → MARKETING_SYSTEM_AI_GUIDE.md → CONTENT_MARKETING_OPERATING_SYSTEM.md → the Run Pack for that batch.

---

## 5. Your role vs. the AI's role

This is the most important thing to understand.

| The AI does | You do |
|---|---|
| Structure and format the facts | Own and verify the facts |
| Write the slide copy and captions | Check that the copy matches the facts |
| Generate the background image | Overlay the text in Canva |
| Flag gaps with `[VERIFY]` or `[MISSING]` | Resolve every flag before the post ships |
| — | Run the gate checklist |
| — | Schedule and post |
| — | Log the metrics |

**The AI never originates a number.** If a number appears in a COPY_PACK that is not in the FACTS_SHEET, that is an error — stop and flag it to Beto.

---

## 6. The Facts Sheet — your most important document

The `TRUVA_FACTS_SHEET.xlsx` is the only source of truth for every number in every post. Before a batch runs:

1. Open the sheet.
2. Check the `date_checked` column for every card in that batch. If it is older than 30 days, the row needs to be re-verified on the issuer's official page before it is used.
3. For promo-sensitive fields (fee waivers, special rates, promos), re-verify on the bank's own page on post day — these change without notice.
4. Never update the sheet with numbers from an LLM's memory or a third-party aggregator (e.g., Moneymax) as the final source. Aggregators are leads only. The issuer's page is the source.

---

## 7. How to handle [VERIFY] and [MISSING] flags

When Claude produces a COPY_PACK, it may contain flags like:
- `[VERIFY earn rate on BPI page]` — the fact exists but needs confirmation on the issuer's page
- `[MISSING — do not guess]` — the data was not in the Facts Sheet at all

**These flags must be resolved before Canva (Step 3b) and before the gate (Step 4).** Here is what to do:

| Flag | What to do |
|---|---|
| `[VERIFY]` | Go to the source URL in the Facts Sheet. Confirm the number. Update the COPY_PACK with the confirmed value. Log the source + date in the sheet. |
| `[MISSING]` | Go to the issuer's official page. If you find the value, add it to the Facts Sheet (with source + date) and update the COPY_PACK. If you cannot find it, remove any claim about that field from the post — do not guess or estimate. |

If you cannot resolve a flag, do not ship the post. Note the gap in the Facts Sheet and flag it to Beto.

---

## 8. Canva — how to use the templates

Each content pillar has a reusable Canva template. The templates have:
- A placeholder layer for the ChatGPT background image
- Text boxes already sized and positioned for each slide
- Truva brand fonts pre-loaded (Space Grotesk for headers, Inter for body)

**How to use:**
1. Duplicate the template for each new post — never overwrite the master template.
2. Drop the ChatGPT background image into the placeholder layer.
3. Copy text from the COPY_PACK into the text boxes. Do not retype numbers — copy-paste to avoid typos.
4. Export as a set of images (one per slide).

**Typography rules:**
- Headers: Space Grotesk
- Body: Inter
- Numbers always in tabular figures (this is set in the template)

---

## 9. The gate — what to check before anything is scheduled

Every post must pass this gate before it is scheduled. Check each item against the final COPY_PACK and the Canva slides:

- [ ] Every number in the slides matches the Facts Sheet exactly
- [ ] Every `[VERIFY]` and `[MISSING]` flag has been resolved
- [ ] No after-tax or "true yield" language anywhere
- [ ] No exclamation marks on data lines
- [ ] Affiliate disclosure is present (master wording — see below)
- [ ] BSP/DTI compliance line is present on any promo or interest-rate claim
- [ ] The UTM link in the post goes to a live page on gotruva.com
- [ ] No reference to Truva features that do not exist yet (e.g., PDIC optimizer)

**Master affiliate disclosure wording (use this exactly):**
> *We earn a fee if you apply and get approved through our links. This does not change what you are offered, and it keeps Truva free. We rank every card honestly, based on real numbers.*

If anything fails the gate, do not schedule. Go back to the step that owns the failed item and fix it there, then re-run the gate.

---

## 10. What to do when something goes wrong

| Problem | What to do |
|---|---|
| Gemini adds a number not in the Facts Sheet | Discard that output. Edit the prompt to be more explicit: "use ONLY these rows." Re-run. |
| Claude adds a fact not in the FACT_PACK | Discard that output. Re-paste the Step 2 prompt with the instruction "do not add facts not in this FACT_PACK." Re-run. |
| ChatGPT generates an image with text baked in | Regenerate — add "no text, no numbers, no letters of any kind" to the prompt. |
| A bank changes its fee/rate between Facts Sheet and post day | Update the Facts Sheet with the new number and source. Re-run the COPY_PACK from Step 2 with the corrected row. |
| You cannot verify a `[MISSING]` flag | Remove the claim from the post entirely. Note the gap in the Facts Sheet. Flag to Beto. |
| A card's NAFFL status has changed | Do not use that card in this batch. Flag to Beto to update the DB. |
| The UTM link goes to a 404 | Do not schedule. Ask Beto to stand up the page first. |

---

## 11. Cadence and batch rhythm

- **Batch day:** every 2 weeks. One batch day produces ~6 posts.
- **Posting:** 3 posts per week, scheduled and dripped.
- **Weekly mix:** 1× Pillar D (reach) + 1× Pillar B or C (intent) + 1× Pillar A or Rate Pulse (trust).

Do not post daily by hand — it is not sustainable and quality drops. Batch by stage: research all → write all → design all → verify all → schedule all.

---

## 12. Your first batch — checklist

Before you run your first batch, confirm you have:

- [ ] Read TRUVA_MASTER.md, MARKETING_SYSTEM_AI_GUIDE.md, CONTENT_MARKETING_OPERATING_SYSTEM.md
- [ ] Access to Gemini Advanced, Claude Pro, ChatGPT Plus, Canva Pro
- [ ] Access to the Truva folder with TRUVA_FACTS_SHEET.xlsx
- [ ] Access to Meta Business Suite (IG + FB pages connected)
- [ ] The Canva templates open and duplicated for each pillar
- [ ] The Facts Sheet rows for this batch verified and dated within 30 days
- [ ] A place to log METRICS_ROWs after posting (Google Sheet or Notion — ask Beto)

When all boxes are checked, open the Run Pack for this batch and start at the pre-flight step.
