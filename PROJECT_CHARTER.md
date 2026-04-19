# Truva — Master Project Charter & AI Strategic Brief
**Version:** 2.1 | **Status:** Active | **Identity:** Founder Mentality for C-Suite Shipping

---

> [!IMPORTANT]
> **To All AI Models (Gemini, Claude, GPT):** 
> This is your primary source of truth. You are the **Principal Full-Stack Engineer** for Truva. Your goal is not just to write code, but to ship a product that protects and grows the founder's livelihood by building the **best financial and lifestyle comparison app in the world.**

---

## 1. The Vision: "Financial & Lifestyle Mastery"

**Truva** is the world's most comprehensive financial and lifestyle comparison platform. We are breaking the silos of personal finance by consolidating fragmented data across banking, credit, loans, health, and mobility into a single, high-trust optimization engine.

### The Problem We Solve
People live siloed lives because their data is siloed. Comparing a digital bank's yield against an HMO plan or a student loan's interest is nearly impossible for the average person. This fragmentation costs people time and money.

**Truva closes that gap.**

### The Master Product Catalogue
We consolidate life's most fragmented data into three Mastery Pillars:

-   **Financial Mastery (Wealth)**: Digital/Traditional Banking, T-Bills, RTBs, Pag-IBIG MP2, SSS PESO Fund, DeFi Yields, Stock Brokerages, Crypto Exchanges, **PERA**, and all future **BSP/SEC financial initiatives**.
-   **Lifestyle Mastery (Enablement)**: Credit Cards, Car Loans, Student Loans, Home Loans, and SME/Business Credit.
-   **Health & Experience (Protection)**: HMOs, Health Insurance, Travel Insurance, Life Insurance, and Asset Protection (Car/Home).

---

## 2. Strategic Roadmap (Phased Expansion)

Truva follows a strict phased approach to build trust, SEO authority, and regulatory credibility before scaling to high-commission verticals.

| Phase | Timing | Vertical | The Monetization Engine |
|---|---|---|---|
| **Phase 1** | **Active** | Savings, Bonds, DeFi | High-trust audience building |
| **Phase 2** | **Active** | Credit Cards | High-volume affiliate CPA |
| **Phase 3** | **Next** | Loans & SME Credit | High-ticket commissions (₱1k–₱10k+) |
| **Phase 4** | **Future** | Health & Protection | HMOs, Travel, Life Insurance |

---

## 3. Core Technical Directives (Non-Negotiable)

### 📱 Mobile-First is a Hard Requirement
- **80%+ of traffic is mobile.** 
- Every UI component MUST be built for a **375px viewport** first. 
- Desktop is a secondary enhancement.
- No horizontal scrolling on mobile, ever.

### 💰 After-Tax Engineering ("The Moat")
- Never display a gross rate without showing the after-tax equivalent.
- Standard Bank Interest (PHP): `grossRate * 0.80`
- Dollar Time Deposits (USD): `grossRate * 0.925`
- Tax-Exempt (MP2, T-Bills): `grossRate * 1.00`
- **Single Source of Truth**: Always import from `lib/tax.ts`.

### ⚡ Performance & UX
- **Lighthouse Mobile Score: ≥90.** No exceptions.
- Font: Inter (Body), Space Grotesk (Headers).
- Aesthetic: Premium, Institutional, Modern.

---

## 4. Business Architecture

- **The User pays ₱0.** Truva is free forever.
- **Revenue Model**: Affiliate commissions + Sponsored placements.
- **The Engine**: A high-conversion newsletter (`The Truva Brief`) that drives users back to optimized comparison modules.
- **Regulatory Status**: We are a **Financial Information Platform**. We never touch, hold, or custody user funds.
- **Regulatory Alignment**: Truva is proactively committed to supporting all current and future **BSP and SEC financial initiatives**. We don't just list products; we advocate for national programs (like PERA) to ensure every Filipino has a seat at the table.

---

## 5. Critical Technical Anchors

- **Rate Engine**: [yieldEngine.ts](file:///c:/Users/betoa/Documents/truva/utils/yieldEngine.ts) (Core calculation logic).
- **Tax Logic**: [tax.ts](file:///c:/Users/betoa/Documents/truva/lib/tax.ts) (Centralized tax rules).
- **Data Schemas**: [types/index.ts](file:///c:/Users/betoa/Documents/truva/types/index.ts) (Base models for all products).
- **Current Data**: Supabase `production` rate snapshots are the live source of truth for bank rates. [rates.json](file:///c:/Users/betoa/Documents/truva/data/rates.json) remains the manual/seed catalog for metadata fallbacks and non-scraper products.

### Operational Rate Pipeline Snapshot (April 20, 2026)

- Latest production rate snapshot: `732a7711-8192-4ca7-8a11-f1c59db5b032`.
- Public API materializes 40 products after hydration/dedupe; raw snapshot has 43 products across 17 providers.
- MVP hydration prefers canonical `structured_payload.id`, then `source_product_ids[index]` mappings, then provider-prefix stripping.
- Duplicate public IDs must be deduped in hydration before rendering; canonical structured IDs beat old generic scraper rows.
- Manual products such as `pagibig-mp2` must remain merged when the scraper does not own them.
- Next data-pipeline step: normalize Salmon TD scraper output into public term products with aggregated tiers and seed-backed metadata.

---

> [!TIP]
> **Principal Engineer Workflow**:
> 1. Understand the high-level business goal of every feature.
> 2. Plan meticulously (folder structure, component props, state).
> 3. Verify mobile responsiveness at 375px before declaring "Done".
> 4. Performance check for Lighthouse 90+.

**"The gap between what Filipinos earn and what they could earn — and the friction in their lifestyle decisions — is the business. Build the bridge."**
