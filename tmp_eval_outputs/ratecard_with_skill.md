# Copy Audit: components/RateCard.tsx
_Following truva-copy-optimizer skill_

## Visible text extracted
- Rate label: "Net Return" (ProductRow line 120, BankCard line 372, legacy RateCard line 454)
- Gross label: "Effective rate: {X}% gross" (BankCard, line 361)
- Expand button: "Click for more info" (ProductRow, line 135)
- Collapse button: "Hide extra info" (ProductRow, line 135)
- Condition flag: "Rate has requirements" (ProductRow, line 99)
- Tier heading: "How Your Balance Earns" (ProductRow, line 158)
- Condition heading: "To earn this rate, you must:" (ProductRow, line 195)
- No-condition note: "No conditions — flat rate on any amount" (ProductRow, line 209)
- Expand/collapse toggle: "Hide" / "More" (BankCard header, line 352)
- Lock-in verbose: "Time Locked for X" (ProductRow, line 27)
- Payout heading: "Interest Payout" (ProductRow, line 223)

---

## Rate Framing (Jargon / Missing After-Tax Clarity)

| # | Location | Original | Suggested | Why |
|---|----------|----------|-----------|-----|
| 1 | ProductRow rate label, line 120 | "Net Return" | "After-tax return" | "Net" is finance jargon that not all Filipino savers will map to after-tax; "after-tax return" is plain and explicit — matches what Truva shows everywhere else |
| 2 | BankCard rate label, line 371–372 | "Net Return · withdraw anytime" | "After-tax return · withdraw anytime" | Same as above; consistency across card variants |
| 3 | Legacy RateCard label, line 454 | "Net Return" | "After-tax return" | Consistency with the rest of the component |

---

## CTA Copy (Expand / Collapse)

| # | Location | Original | Suggested | Why |
|---|----------|----------|-----------|-----|
| 4 | Expand button, ProductRow line 135 | "Click for more info" | "See rate breakdown" | "Click for more info" is generic and redundant (all buttons are clickable); "See rate breakdown" tells users what they'll actually get — the tier structure, conditions, and payout details |
| 5 | Collapse button, ProductRow line 135 | "Hide extra info" | "Hide details" | "Extra info" sounds like optional fluff; "details" is cleaner and doesn't downplay the content |

---

## Vague Flag

| # | Location | Original | Suggested | Why |
|---|----------|----------|-----------|-----|
| 6 | Condition badge, ProductRow line 99 | "Rate has requirements" | "Conditions apply" | More standard, less alarming phrasing; "requirements" sounds onerous; "Conditions apply" is understood and matches how banks communicate this |

---

## Slightly Awkward Phrasing

| # | Location | Original | Suggested | Why |
|---|----------|----------|-----------|-----|
| 7 | Tier heading, ProductRow line 158 | "How Your Balance Earns" | "How your deposit earns" | "Balance earns" is grammatically odd; "deposit earns" is cleaner and more specific to TD context |

---

## No issues found in:
- "Withdraw Anytime" — clear and friendly
- "To earn this rate, you must:" — direct and honest
- "No conditions — flat rate on any amount" — simple and reassuring
- "Interest Payout" — clear section heading
- "PDIC Insured" / "Gov't Guaranteed" / "Pag-IBIG Guaranteed" — all clear and trustworthy
- "Best" badge — simple and earned in context
- "your tier" indicator — appropriately casual in context

---

Which of these would you like me to apply? You can say "all", list numbers (e.g. "1, 2, 3, 4, 5"), or exclude any.
