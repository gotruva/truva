# Credit Card Finder — Improvement Assessment

_Last updated: 2026-06-09. Card counts verified against the live `public.truva_credit_cards` view._

## Purpose

A prioritized, evidence-backed view on how to sharpen Truva's credit-card finder (the 5-question form at `/credit-cards`). Covers three questions Beto raised after walking the flow:

1. Can the **questions** be improved?
2. Is there a better way to **present the results**?
3. Is the **data** rich enough for the Philippine market?

This is an assessment, not an implementation. Each item is ranked by impact and effort so we can pick what to build next.

---

## Snapshot — what the finder does today

The finder is in good shape. It is not a rescue job. It already has:

- A real scoring model — income fit, priority match, spend match, "avoid" penalties, a first-card bonus, and a small bias toward cards we can stand behind ([rank.ts](../lib/creditCardFinder/rank.ts), `scoreFinderCard`).
- Honest slot-based results — three roles (closest fit / no-yearly-fee fit / worth checking) that never relabel a fee card as no-fee ([rank.ts](../lib/creditCardFinder/rank.ts), `selectFinderResults`).
- Per-card "why this may fit you" and "what to watch out for" ([explain.ts](../lib/creditCardFinder/explain.ts), [ResultCard.tsx](../components/credit-cards/results/ResultCard.tsx)).
- Affiliate disclosure before every Apply CTA, a data-confidence label per card, and a graceful no-match fallback.
- Strong accessibility (roving tabindex radios, 56px touch targets) and analytics across every step.

**Key files:** form + flow in `lib/creditCardFinder/*` and `components/credit-cards/finder/*`; results in `components/credit-cards/results/*`; locked copy in [copy.ts](../lib/creditCardFinder/copy.ts).

**The throughline of this assessment:** the finder's _logic_ is solid. The biggest unlocks are **data depth** and **cheap reuse of things we've already built** — not more questions.

---

## A. The questions

The five questions are: first card? → income → where you spend most → what matters most (priority) → what to avoid. Copy is marked "locked — Direction B final," but it is on the table for revisiting.

### A1. "Where do you spend most?" is single-select — make it pick-up-to-2 · **Impact: High · Effort: Low–Med**

Spending in the Philippines is split — groceries *and* bills *and* online shopping. Forcing one answer throws away signal ([questions.ts:82](../lib/creditCardFinder/questions.ts:82)). The scorer only adds +0.15 for a spend match ([rank.ts:304](../lib/creditCardFinder/rank.ts:304)), so allowing two selections slots in cleanly and lifts match quality without destabilizing the model. (Its payoff is capped by data item C2 below — category matching is currently inferred, not structured.)

### A2. De-duplicate "Priority" vs "Avoid" · **Impact: Med · Effort: Low**

The two questions overlap:

- "No yearly fee" (priority) and "Yearly fees" (avoid) are the same axis.
- "Avoid high income requirement" overlaps the income question we already asked.
- In the priority list, `easy` ("Beginner-friendly card") and `simple` ("Simple card for beginners") map to the **same** `beginner` tag ([rank.ts:250](../lib/creditCardFinder/rank.ts:250)) — two options doing one job.

The win here is to **tighten** the five questions, not add a sixth. A cleaner set reduces decision fatigue and drop-off.

### A3. The "first card" branch barely pays off · **Impact: Low–Med · Effort: Low**

Scoring only checks `first === 'yes'` ([rank.ts:318](../lib/creditCardFinder/rank.ts:318)). "No, I already have a card" and "I'm helping someone choose" currently score **identically** — we collect the answer but never use the distinction. Either make those branches change the result (e.g., a "helping someone" framing, or de-prioritizing beginner cards for experienced users) or simplify the question.

### A4. PH-specific questions — employment type, 0% installment intent · **Impact: High\* · Effort: High**

Two things drive real PH card decisions that we don't ask about:

- **Work situation** (employed vs self-employed vs OFW) — a major factor in approval, and OFW remittance income is a large PH segment (Persona C).
- **0% installment / *hulugan*** — one of the most common reasons Filipinos get a card.

\*Both are high-impact only **after** the supporting data exists (see C2/C4). Asking a question we can't act on adds friction. Flag as data-gated, later.

---

## B. Presenting the results

### B1. Wire results into the EXISTING compare feature · **Impact: High · Effort: Low**

We already built a comparison flow — the `/credit-cards/all` catalog has a compare tray that lets users select up to 3 cards and routes to `/credit-cards/compare/{key}-vs-{key}` ([CreditCardCatalog.tsx:424](../components/credit-cards/CreditCardCatalog.tsx:424)). The finder shows three cards but offers no way to compare them side by side. Linking finder results into the existing compare route is reuse, not a rebuild — the cheapest high-value move on this list.

### B2. Surface a plain "you likely qualify" verdict per result · **Impact: High · Effort: Low–Med**

Income fit already drives scoring, and the **detail** page already answers "Can you qualify?" — but the results card only shows the requirement label, not a verdict ([ResultCard.tsx](../components/credit-cards/results/ResultCard.tsx)). Reusing that logic to show a calm "Your income clears this card's listed requirement" signal directly on results would ease the approval anxiety that stops first-timers from applying. (Keep it honest: listed requirement met ≠ guaranteed approval — bank decides.)

### B3. Lead with one confident pick, then "other options" · **Impact: Med–High · Effort: Med**

Three co-equal cards can cause choice paralysis for first-timers (Personas A and C). An alternative layout leads with a single hero recommendation and tucks the alternatives beneath it. Worth validating against the `cc_finder` funnel analytics before committing — this is a structural UX change, not a tweak.

### B4. Make section headers adapt to the stated priority · **Impact: Low–Med · Effort: Low**

The section headers are static — "First-card fit / No-yearly-fee fit / Worth checking" ([copy.ts:54](../lib/creditCardFinder/copy.ts:54)) — even when the user's priority was travel or cashback. The per-card *why* text personalizes; the headers don't. Letting the lead header echo the user's stated goal (while staying honest about the role) makes results feel built for them.

### B5. Save / shortlist results · **Impact: Med · Effort: Med**

A credit card is a considered purchase; few people apply on the first visit. There's no way to save results today. A localStorage shortlist (no account, no data custody) would let people come back. Lower priority than B1–B2.

---

## C. Is the data enough for the PH market?

Short answer: **enough for a credible finder, with real gaps that matter here.** Annual fee, income requirement, rewards type, and forex fee are well-populated. The catalog (verified 2026-06-09) holds **57 cards across 10 issuers**:

| Issuer | Cards |
|---|---|
| BDO | 21 |
| BPI | 7\* |
| Metrobank | 9\* |
| Chinabank | 6 |
| RCBC | 6 |
| EastWest | 4 |
| AUB | 1 |
| Equicom | 1 |
| Security Bank | 1 |
| HSBC | 1 |

\*Split across `bank` name variants — see C5.

### C1. Issuer coverage gap — UnionBank, PNB, Citi, Maya are absent · **Impact: High · Effort: High**

These major PH card issuers have **zero cards** in the catalog. The most striking case: **UnionBank has 12 active promos in `web_weaver` but no cards in `public.truva_credit_cards`** — and UnionBank absorbed Citi's entire PH consumer-card business, so this is a top-tier issuer missing completely. PNB and Maya Credit are also absent. Closing this is the single biggest catalog-completeness gap.

### C2. Rewards-by-category are inferred, not structured · **Impact: High · Effort: High**

Spend matching keyword-matches over `rewards_formula` text and the card name (`deriveCategoryMatch` in [creditCardValue.ts](../lib/creditCardValue.ts)) rather than reading a structured category → rate table. This caps the accuracy of A1 (multi-select spend): we can guess "good for groceries," but not reliably rank by it.

### C3. Welcome promos / freebies aren't card-level · **Impact: High · Effort: Med–High**

Per the [data contract](./webweaver-credit-card-data-contract.md), there are 127 active credit-card promo rows, but they are mostly **issuer-level** — "Only one active promo had an exact `credit_card_id` target." Freebies (waived annual fee, free luggage, cashback on approval) heavily drive PH card choice, yet we can only safely attach a promo to a card when there's a verified exact target. Card-level promo data is a real differentiator we don't fully have.

### C4. No 0% installment / *hulugan* data · **Impact: Med–High · Effort: High**

A culturally huge PH use-case with no field in the card model. Pairs with question A4.

### C5. Bank-name fragmentation (data hygiene) · **Impact: Med · Effort: Low**

The same issuer appears under multiple `bank` values: Metrobank as "Metrobank Card Corporation" (6), "Metrobank" (2), and "Metropolitan Bank and Trust Company" (1); BPI as "Bank of the Philippine Islands" (6) and "...(BPI)" (1). Because tagging, the catalog's bank filter, and logo mapping (`BANK_LOGO_MAP`) key off `card.bank`, this fragmentation can split filters and miss logos. A normalization pass is low-effort and improves both the catalog and the finder.

### C6. Interest rates often null · **Impact: Med · Effort: Med**

`interest_rate_pct` is frequently empty, which weakens any cost-of-carry comparison (less critical for a rewards-led finder, but relevant if we ever surface "cost if you revolve").

---

## Prioritized backlog

### Quick wins — low effort, real impact

| Item | What | Area |
|---|---|---|
| B1 | Link finder results into the existing compare flow | Results |
| B2 | Show a plain "you likely qualify" verdict per result | Results |
| A2 | De-duplicate Priority vs Avoid options | Questions |
| A3 | Make the "first card" branch matter, or simplify it | Questions |
| B4 | Adapt section headers to the stated priority | Results |
| C5 | Normalize fragmented `bank` names | Data |

### High-value medium bets

| Item | What | Area |
|---|---|---|
| A1 | Multi-select "where you spend" (pick up to 2) | Questions |
| B3 | Lead with one confident pick + alternatives | Results |

### Bigger bets — data foundation

| Item | What | Area |
|---|---|---|
| C1 | Close issuer coverage (UnionBank first, then PNB/Maya) | Data |
| C2 | Structure rewards-by-category | Data |
| C3 | Card-level welcome promos / freebies | Data |
| C4 / A4 | 0% installment data + matching question | Data + Questions |
| C6 | Fill interest rates | Data |

---

## Notes on method

- Card counts and the UnionBank/PNB/Maya gap are verified against the live `public.truva_credit_cards` view (2026-06-09), not inferred from the repo.
- The promo claim is from [`docs/webweaver-credit-card-data-contract.md`](./webweaver-credit-card-data-contract.md) ("Promo Tables" section).
- All file/line references reflect the codebase as of this date and should be re-checked before implementing any item.
