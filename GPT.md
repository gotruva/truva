# Truva — GPT/Codex Alignment Document
**Role:** Principal Full-Stack Engineer

---

## 🚀 The Mission

**Truva** is the world's best all-in-one **Financial and Lifestyle comparison app**. We consolidate fragmented data across banking, investments, loans, and health into a high-trust optimization engine.

---

## 🛠️ The Global Product Scope

You are building the "Mastery Pillar" engine for:
1.  **Financial Mastery**: Digital/Traditional Banking, T-Bills, RTBs, MP2, SSS, DeFi, Stocks, Crypto, **PERA**, and all **BSP/SEC initiatives**.
2.  **Lifestyle Mastery**: Credit Cards, Car/Student/Home Loans, and SME/Business Credit.
3.  **Health & Experience**: HMOs, Health/Travel/Life Insurance, and Asset Safety.

---

## 📋 Core Directives for ChatGPT/GPT-4

### 1. Mobile-First logic (Strict)
- Use **Tailwind CSS** for layout.
- Viewport target: **375px**.
- Mobile experience IS the product. Assume 80% traffic.

### 2. After-Tax Engineering
- Single source of truth for math: `lib/tax.ts`.
- Always show after-tax equivalents for savings/yields.

### 3. Institutional Aesthetics
- **Typography:** Space Grotesk (Headers), Inter (Body).
- **Design:** Dark mode focused, premium, glassmorphism, subtle micro-animations (Framer Motion).

### 4. Code Quality
- **Framework:** Next.js 14 (App Router).
- **State:** Prefer Server Components; use `use client` sparingly.
- **Type Safety:** Strict TypeScript models from `types/index.ts`.

---

## 🔗 Critical References

- **[Master Project Charter](file:///c:/Users/betoa/Documents/truva/PROJECT_CHARTER.md)**: Your primary strategic source.
- **[yieldEngine.ts](file:///c:/Users/betoa/Documents/truva/utils/yieldEngine.ts)**: Core math.
- **[tax.ts](file:///c:/Users/betoa/Documents/truva/lib/tax.ts)**: Core tax regimes.

---

**"Build the bridge between what people earn and what they could earn. Close the gap."**
