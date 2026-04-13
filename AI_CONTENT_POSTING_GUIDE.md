# Truva AI Content Posting Guide (v1.0)

> This document is designed for AI agents (Claude, Gemini, GPT) and future content editors. It defines the "Truva Way" of posting financial content to ensure maximum SEO authority and AI-SEO citation potential.

---

## 🏗️ Directory Taxonomy

Content must be placed in specific silos to build topical authority. **Never use flat routes** if a vertical category exists.

| Vertical | Directory Path | URL Pattern | Content Type |
| :--- | :--- | :--- | :--- |
| **Banking** | `app/banking/reviews/` | `/banking/reviews/[slug]` | Product deep-dives, Maya/BDO reviews |
| **Banking** | `app/banking/compare/` | `/banking/compare/[slug]` | Side-by-side (Maya vs GoTyme) |
| **Banking** | `app/banking/rates/` | `/banking/rates/[slug]` | "Best of" roundup lists |
| **Guides** | `app/guides/` | `/guides/[slug]` | Educational/Legal (Tax, PDIC, SSS) |
| **Credit Cards** | `app/credit-cards/` | `/credit-cards/reviews/[slug]` | Card reviews & comparisons |
| **Loans** | `app/loans/` (Planned) | `/loans/[slug]` | Personal, Home, and Auto loans |
| **Insurance** | `app/insurance/` (Planned) | `/insurance/[slug]` | Health, Life, and Motor insurance |

---

## ✍️ MDX Authoring Workflow

Truva uses **MDX** for all editorial content. This allows for plain Markdown writing with high-performance React components.

### 1. File Structure
Every post must be its own folder with a `page.mdx` file:
`app/banking/reviews/maya-savings-review/page.mdx`

### 2. The "Direct Answer" (Featured Snippet)
Search engines and AI-SEO agents reward direct, high-value answers. **Every article must start with a `<SEOBox>`**.

```mdx
import { SEOBox } from '@/components/seo/SEOBox';

# Article Title

<SEOBox title="The Direct Answer">
  Provide a 40-60 word definitive answer to the primary user query here.
  Use **bolding** for emphasis on numbers or names.
</SEOBox>
```

### 3. Typography & Formatting
Do not add custom styles or Tailwind classes to Markdown. The `MDXComponents.tsx` system handles:
- **Tables**: Use native Markdown tables for facts and rates.
- **Lists**: Use standard `-` or `1.` for checklists.
- **Links**: Use absolute paths (`/banking/rates`) for internal links.

---

## 📈 SEO & AI-SEO Checklists

### E-E-A-T (Expertise, Experience, Authoritativeness, Trust)
- Always include a "Key Facts" table near the top.
- Cite primary sources (BSP, BTr, Bank marketing pages) using external links.
- Focus on **after-tax yields** (e.g., "The effective yield is 4% after the 20% Final Withholding Tax").

### Crawlability
- The sitemap (`app/sitemap.ts`) automatically crawls the directory structure. 
- Ensure your folder name is a clean, SEO-friendly slug (no spaces, all lowercase).

---

## 🛠️ Available Components for AI

When generating content, you can use these pre-built components (import them at the top of the `.mdx` file):

- `<SEOBox title="...">` : For featured snippet answer blocks.
- `<AffiliateButton bank="..." />` : (Planned) For high-conversion CTAs.
- `<YieldCalculator />` : (Planned) For interactive math.

---

## 🛑 Rules for AI Implementation
1. **Never use placeholder dates**. Use the current month/year (e.g., "April 2026").
2. **Never hide the answer**. The best info should be visible above the fold.
3. **Always link sideways**. Link to a related tool (calculator) or a related vertical (credit cards) to keep users in the funnel.

> [!NOTE]
> For the strategic "Why" behind this structure, consult the [Truva SEO Growth Strategy](file:///Users/albertoaldaba/truva-mvp/seo-ai-seo-growth-strategy-2026.md).
