# Truva SEO and AI-SEO Growth Strategy

Status: Working strategy for the April 2026 growth push
Audience: Claude, Codex, Gemini, and the founder
Last updated: 2026-04-07

## Purpose

This document is the operating manual for Truva's SEO and AI-SEO push.

The goal is not "publish content" in the abstract. The goal is:

1. Grow qualified organic users in the Philippines.
2. Turn those users into newsletter subscribers and affiliate clicks.
3. Build enough audience, traffic, and trust to negotiate better bank partnerships and future referral deals.
4. Create the authority base that lets Truva expand from savings into credit cards, then loans, without looking like a thin affiliate site.

This strategy is built for Truva's actual product position:

- Truva is a free Philippine financial comparison platform.
- The current moat is after-tax savings comparison, not generic finance content.
- Revenue comes from affiliate and referral commissions, then sponsored placements and partnerships.
- Credit cards and loans are future categories, but SEO groundwork should start before the product expansion.

## Strategic Thesis

Truva should not try to beat giant finance sites by brute force on broad personal-finance keywords.

Truva should win by combining:

- Philippine-specific intent
- after-tax framing
- freshness on rates and promos
- clearer product comparisons
- tool-led landing pages
- stronger machine-readable structure for search and AI citation systems

In practice, this means:

- Own the savings, digital bank, time deposit, MP2, T-Bill, and "after-tax yield" topic graph first.
- Build landing pages that answer the query directly, then feed users into tools and tracked CTAs.
- Structure content so Google, Bing, Copilot, AI summaries, and future retrieval systems can reliably extract Truva's answers.
- Use savings traffic as the base to launch adjacent editorial clusters for credit cards and loans before full product rollouts.

## North Star Metrics

Primary business metrics:

- Organic users from the Philippines
- Newsletter signups from organic traffic
- Affiliate clicks from organic sessions
- Bank- and product-specific click volumes
- Monthly active users on comparison and calculator pages
- Growth in direct partnership conversations and conversion leverage with banks

Primary SEO metrics:

- Indexed pages
- Non-brand search clicks
- Query count in top 10 and top 3 positions
- Share of clicks from commercial-intent queries
- Page-level CTR from search
- Freshness-sensitive pages updated on schedule

Primary AI-SEO metrics:

- Bing AI citations and cited pages
- Grounding queries in Bing AI Performance
- Referral traffic from AI chat/search tools where detectable
- Branded search lift after AI citations and social mentions

## Current State Audit

### Strengths

- Truva already has a real differentiated product: after-tax rate comparison.
- The homepage already includes a live comparison experience, calculator, and structured data.
- There is a clear commercial model with affiliate click tracking.
- The rate data is centralized in `data/rates.json`, which can power landing pages, comparison pages, and editorial pages.
- The site already exposes `robots`, a sitemap, GA, Vercel Analytics, and `llms.txt`.
- The app metadata already allows large image previews via `max-image-preview: large`.

### Current SEO blockers in the repo

- The site has only two URLs in the sitemap: `/` and `/calculator`. That is not enough crawl surface to build topical authority.
- The codebase hardcodes `https://truva.ph` in multiple places even though that domain is not currently live in production.
- There are no article, guide, review, category, or comparison routes yet.
- The current homepage uses `FAQPage` structured data, but Google currently limits FAQ rich results to well-known government and health sites. Truva should not rely on FAQ schema for rich-result gains.
- `robots.ts` currently blocks `/optimizer`. If that route becomes valuable for acquisition, it should be reviewed.
- There are no author pages, editorial methodology pages, or visible trust architecture beyond the homepage copy.
- There is no scalable content model or content folder structure yet.
- There is no explicit Search Console or Bing Webmaster workflow documented in the repo.

### Current growth risk

Without a large set of indexable, intent-specific pages, Truva will remain a strong tool with weak organic discoverability.

That is the main SEO bottleneck right now, not "better keywords" or "more backlinks."

## Official Guidance That Should Shape the Plan

The strategy below follows current official search guidance:

- Google Search Essentials says the highest-impact basics are helpful content, words users actually search for in titles/headings, crawlable links, and search-friendly handling of images, structured data, and JavaScript.
- Google says generative AI is fine as a tool, but using it to generate many pages without adding value can violate spam policy on scaled content abuse.
- Google recommends prominent user-visible publication and last-updated dates, with structured data values that match the visible dates.
- Google currently limits FAQ rich results to well-known government and health sites, so FAQ markup on Truva should be used for machine understanding, not because rich results are expected.
- Google supports `data-nosnippet` to keep specific repeated text from being used in snippets.
- Bing introduced AI Performance in Webmaster Tools in February 2026, with citations, cited pages, grounding queries, and page-level AI citation visibility.
- Bing explicitly recommends clear headings, tables, FAQ sections, evidence, freshness, and IndexNow for AI-driven discovery.

Official references:

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google helpful, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google generative AI guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google byline date guidance: https://developers.google.com/search/docs/appearance/publication-dates
- Google robots/meta/data-nosnippet: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Google FAQ structured data guidance: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Bing AI Performance announcement: https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview

## Competitive Model to Copy

The sites worth learning from are not identical, but each contributes part of the blueprint:

- NerdWallet: topic graph, hub-and-spoke architecture, trust system, reviews, calculators, comparisons, and internal linking.
- Moneymax: commercial-intent editorial targeting for Philippine finance.
- PesoHub and Finmerkado: query-specific rates pages and comparison-led layouts.
- Official bank sites: exact-brand product pages and rate tables that dominate branded queries.

The takeaway is simple:

- Truva should not try to outrank bank brands on their own brand pages.
- Truva should own non-brand and comparison intent in the Philippines.
- Truva should build the same SEO machine structure as NerdWallet, but with a narrower Philippines-first wedge.

## Core Positioning for Search

Truva should be known for:

- after-tax rates, not just gross rates
- "best for this amount" recommendations
- direct, current comparisons across PH savings products
- rate freshness and promo-condition clarity
- plain-English explanations of what a user actually earns

This is the line to defend in every page and template:

"Truva is the Philippines-first after-tax financial comparison site."

That statement should show up in copy, metadata, structured data, and entity descriptions consistently.

## Information Architecture

### Phase 1: Savings authority cluster

Build these route families first:

- `/rates/`
- `/compare/`
- `/reviews/`
- `/learn/`
- `/calculators/`
- `/authors/`
- `/methodology/`

### Page types

1. Hub pages

- `/rates/`
- `/learn/`
- `/reviews/`

2. Commercial rate pages

- `/rates/best-savings-interest-rates-philippines`
- `/rates/digital-bank-rates-philippines`
- `/rates/time-deposit-rates-philippines`
- `/rates/mp2-vs-digital-bank-rates`
- `/rates/t-bill-rates-philippines`
- `/rates/best-time-deposit-rates-philippines`

3. Tool landing pages

- `/calculators/savings-interest-calculator-philippines`
- `/calculators/time-deposit-calculator-philippines`
- `/calculators/mp2-vs-digital-bank-calculator`
- `/calculators/pdic-split-calculator`

4. Comparison pages

- `/compare/maya-vs-gotyme`
- `/compare/maya-vs-tonik`
- `/compare/gsave-vs-cimb-upsave`
- `/compare/uno-vs-gotyme`
- `/compare/mp2-vs-time-deposit`
- `/compare/mp2-vs-digital-bank`

5. Review pages

- `/reviews/maya-savings-review`
- `/reviews/gotyme-savings-review`
- `/reviews/cimb-gsave-review`
- `/reviews/uno-bank-review`
- `/reviews/tonik-time-deposit-review`

6. Educational pages

- `/learn/final-withholding-tax-on-savings-philippines`
- `/learn/how-time-deposits-work-philippines`
- `/learn/what-is-mp2-and-how-it-works`
- `/learn/what-is-a-t-bill-philippines`
- `/learn/pdic-insurance-limit-philippines`
- `/learn/what-is-after-tax-yield`

### Future route families for expansion

Do not launch these as thin affiliate pages. Start them only when content quality and product depth are real.

- `/credit-cards/`
- `/credit-cards/compare/`
- `/credit-cards/reviews/`
- `/loans/`
- `/loans/compare/`
- `/loans/reviews/`

## Content Priorities by Phase

### Phase A: Next 30 days

Goal: build enough crawl surface to prove Truva is more than a homepage tool.

Priority pages:

- one savings hub
- one time deposit hub
- one calculator landing page
- three comparison pages
- three product reviews
- three educational support pages
- one methodology page
- one editorial standards page

Minimum output:

- 12 net-new indexable pages
- each page linked from at least one hub page and one related page

### Phase B: Days 31-60

Goal: own the highest-intent savings and deposit queries.

Priority pages:

- current rates pages
- "best" roundups
- updated comparison pages
- an indexable archive or update format for rate refreshes

Minimum output:

- 10 to 15 more pages
- every major bank covered by at least one review and one comparison path

### Phase C: Days 61-90

Goal: prepare adjacency expansion and strengthen authority signals.

Priority pages:

- credit card informational pages with no thin affiliate content
- loan educational pages
- author pages
- FAQ/help pages that support product understanding

Minimum output:

- 8 to 12 more pages
- one clean internal link path from savings pages into future card and loan interest capture pages

## Page Templates

### Template 1: Commercial rates page

Use for:

- best savings rates
- digital bank rates
- time deposit rates

Page structure:

1. Direct answer summary above the fold
2. Last updated date and source note
3. Top picks section
4. Full comparison table
5. "What you actually earn" examples at common balances
6. Conditions and tradeoffs section
7. FAQ block
8. Related comparisons
9. Newsletter signup
10. Affiliate CTAs only after the core answer is clear

Metadata pattern:

- Title: `Best Savings Interest Rates in the Philippines (Month Year) | Truva`
- H1: `Best Savings Interest Rates in the Philippines`
- Description: mention after-tax rates, freshness, and comparison value

Schema:

- `WebPage`
- `BreadcrumbList`
- `ItemList` where appropriate
- optional `FAQPage` only for machine understanding, not rich-result expectations

### Template 2: Comparison page

Use for:

- Maya vs GoTyme
- GSave vs UpSave
- MP2 vs digital bank

Page structure:

1. Winner summary for clear personas
2. Side-by-side table
3. After-tax examples at common amounts
4. Best use case for each option
5. Risks, lock-ins, and constraints
6. FAQs
7. Related reviews and calculator links

This page type is important for both classic search and AI citation because it offers compact, answerable tradeoff content.

### Template 3: Product review page

Use for:

- Maya Savings review
- GSave review
- Tonik Time Deposit review

Page structure:

1. Summary box
2. Best for / not for
3. Rates and conditions
4. Fees, access, lock-in, insurance
5. How it compares to top alternatives
6. Editorial verdict
7. Sources and verification date

Trust requirement:

- Every review must show who reviewed it, when it was updated, and where the data came from.

### Template 4: Educational page

Use for:

- tax, insurance, deposit mechanics, MP2, T-Bills

Page structure:

1. Definition in plain English
2. Why it matters in the Philippines
3. Example or scenario
4. Common mistakes
5. Related comparison/tool links

Educational pages should not be written as generic dictionary content. They should always connect back to a real decision.

## Content Standards

Every page must satisfy the following:

- One primary intent per URL
- One precise answer in the first screenful
- One strong title that matches query language
- Visible `Last updated` date
- Named author or editorial owner
- Source list using primary sources when possible
- One table or structured comparison block where useful
- Internal links to a tool, a related commercial page, and a related educational page
- No vague filler copy
- No generic AI-generated boilerplate

The tone should be plain, direct, and specific to the Philippines.

## AI-SEO Playbook

This section is about being cited, summarized, and retrieved well in AI-assisted search.

### What AI systems tend to reward

- clear headings
- short direct answers near the top
- structured lists and tables
- strong entity consistency
- visible sourcing
- freshness
- self-contained sections that answer a narrow question cleanly

### What Truva should do

1. Add answer blocks

- Each major page should open with a 40-90 word answer block that can stand alone.
- Example: "The best digital bank for liquid savings in the Philippines right now is X for balances up to Y, while Z is better above Y after tax."

2. Keep entity naming consistent

- Pick one canonical entity string per institution and product.
- Example: `CIMB / GCash` vs `CIMB GSave` must be normalized intentionally.
- Use the same name in headings, data, schema, and internal links.

3. Add evidence blocks

- Add short methodology or source sections near each table.
- Show last verified dates.
- Cite BSP, BTr, bank product pages, or official PDFs where relevant.

4. Prefer tables for facts

- AI systems and classic search both handle compact tables well.
- Rates, lock-in periods, PDIC status, balance caps, and promo conditions should always have a structured representation.

5. Keep freshness obvious

- For rates pages, update dates must be prominent and accurate.
- Use both visible dates and structured dates where relevant.

6. Use `data-nosnippet` selectively

- Repeated disclaimer blocks, affiliate disclosure text, and boilerplate footer copy can pollute snippets.
- Use `data-nosnippet` only where repeated text is crowding out the answer.

7. Keep `llms.txt`, but treat it as secondary

- `llms.txt` may help some AI systems understand site purpose.
- It is not a core ranking tactic.
- Keep it current, concise, and aligned with the actual production domain.

8. Add Bing AI monitoring

- Set up Bing Webmaster Tools and AI Performance.
- Review cited pages and grounding queries weekly.
- Use those signals to strengthen the pages AI systems already prefer.

9. Submit updates fast

- Use IndexNow for Bing and other participating engines.
- Keep sitemaps current for Google.

### What Truva should not do

- publish dozens of near-duplicate "best" pages with token wording changes
- generate thin pages from templates with no original judgment
- overuse FAQ markup expecting rich results
- hide the answer behind signup gates
- rely on `llms.txt` as if it were a ranking lever

## Technical SEO Roadmap

### Immediate technical fixes

1. Replace hardcoded base URLs

- Stop hardcoding `https://truva.ph` in `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, and `public/llms.txt`.
- Introduce one production site URL env variable.
- Use that value for canonical, sitemap, metadata base, JSON-LD, and `llms.txt`.

2. Expand the sitemap

- Generate a dynamic sitemap from all public routes.
- Include future article, review, compare, and calculator pages.
- Update `changeFrequency` and `priority` by page type.

3. Build a content route system

- Add route groups for `rates`, `compare`, `reviews`, and `learn`.
- Use a shared content model or page config object for metadata, hero content, related links, and schema.

4. Add breadcrumb navigation and schema

- Breadcrumbs help both users and AI systems understand location in the topic graph.

5. Add visible update dates and author info

- Follow Google's byline-date guidance.
- Match visible dates and structured dates.

6. Add editorial pages

- `/methodology/editorial-policy`
- `/methodology/how-we-rate-products`
- `/methodology/how-we-make-money`
- `/authors/<name>`

7. Review indexability of tool pages

- Keep `/calculator` indexable.
- Revisit whether `/optimizer` should remain blocked once it becomes useful.

8. Avoid weak faceted index pages

- Do not expose dozens of crawlable filter combinations with no unique value.
- Canonicalize or noindex thin query-parameter variants.

### Structured data recommendations

Use:

- `Organization`
- `WebSite`
- `WebPage`
- `BreadcrumbList`
- `Article` for editorial pages
- `ItemList` for ranked or grouped lists

Use carefully:

- `FAQPage` for machine clarity, but do not expect FAQ rich results

Do not force:

- unsupported or misleading schema just to chase rich results

## Internal Linking System

Every page should link in three directions:

- up to a hub page
- sideways to a closely related comparison or review page
- down to a tool or CTA page

Example:

- `best savings rates` links to `Maya vs GoTyme`, `Maya Savings review`, and the calculator
- `Maya Savings review` links back to `best savings rates`, to `Maya vs GoTyme`, and to `/go/maya-savings`
- `final withholding tax` links to `best time deposit rates` and the calculator

This should be engineered intentionally, not left to ad hoc inline links.

## Measurement Stack

### Mandatory setup

- Google Search Console on the production domain
- Bing Webmaster Tools on the production domain
- Bing AI Performance enabled
- GA4 event tracking for:
  - newsletter signup
  - affiliate click
  - calculator usage
  - comparison page engagement

### Dashboard views to build

1. Acquisition dashboard

- organic users
- landing pages
- country filter for PH
- branded vs non-brand traffic

2. Money dashboard

- affiliate clicks by landing page
- affiliate clicks by product
- newsletter signups by landing page
- CTR from organic to affiliate click

3. AI visibility dashboard

- Bing total citations
- cited pages
- grounding queries
- AI-cited pages that do not convert

### Review cadence

- Weekly: rankings, clicks, affiliate clicks, AI citations
- Biweekly: content refresh list
- Monthly: topic gap analysis, winner/loser page review

## Link Building and Distribution

Truva should not wait for "natural backlinks" in a vacuum.

Priority link and distribution tactics:

- free embeddable rates widget for PH finance blogs
- original rate-change roundups that journalists can cite
- outreach to PH finance blogs and creators
- founder-led commentary on rate changes and promo resets
- newsletter and social distribution tied to every fresh rates update

Best linkable assets:

- current rates hub
- after-tax calculator
- MP2 vs digital bank comparison
- PDIC split calculator
- monthly rate-change report

## Credit Cards and Loans Expansion Strategy

The next categories should be prepared in SEO before the full comparison product is mature.

### What to do now

- Create informational and educational pages for cards and loans only after the savings cluster is moving.
- Collect intent with newsletter and waitlist CTAs.
- Build glossary and comparison-intent pages that answer real user questions without pretending the product depth already exists.

Good early card topics:

- `best first credit card philippines`
- `cashback vs miles credit card philippines`
- `secured credit card philippines`
- `annual fee waived for life credit cards philippines`

Good early loan topics:

- `personal loan vs salary loan philippines`
- `bank loan vs sss salary loan`
- `how personal loan interest works philippines`
- `best personal loan for OFWs philippines`

### What not to do

- Do not launch fake "best credit cards" pages with shallow data and affiliate bias.
- Do not build mass programmatic pages before Truva has real card and loan coverage.

### Trigger to accelerate card and loan SEO

- savings pages show consistent organic growth
- newsletter compounding is visible
- the domain has trust signals and some backlinks
- partnership conversations need a larger story than savings alone

## 90-Day Execution Plan

### Weeks 1-2

- fix production domain and canonical configuration
- build content route system
- add methodology and editorial pages
- generate dynamic sitemap
- connect Search Console and Bing Webmaster Tools
- enable IndexNow

### Weeks 3-4

- publish:
  - best savings rates
  - digital bank rates
  - time deposit rates
  - savings calculator landing page
  - final withholding tax explainer
  - PDIC explainer

### Weeks 5-8

- publish:
  - Maya vs GoTyme
  - Maya vs Tonik
  - GSave vs UpSave
  - Maya Savings review
  - GSave review
  - Tonik Time Deposit review
- add internal linking modules across all savings pages
- add source and update blocks to all rates pages

### Weeks 9-12

- publish:
  - MP2 vs digital bank
  - T-Bill rates page
  - MP2 explainer
  - time deposit explainer
  - current monthly rate update page
- launch one early credit-card informational cluster if savings momentum is established

## Rules for Agents Working on This Update

When Claude, Codex, or Gemini touch the SEO stack, they should follow these rules:

1. Do not create pages without a defined intent, slug, title, H1, and internal-link destination.
2. Do not publish FAQ schema expecting rich results for Truva.
3. Do not hardcode the production domain anywhere.
4. Do not create thin pages for future categories that do not yet have real product depth.
5. Do not use AI to mass-generate low-value pages.
6. Do prefer direct answers, tables, clear headings, and visible update dates.
7. Do add source references and methodology where factual claims are made.
8. Do wire every commercial page to both a tool and a newsletter path.
9. Do track business outcomes, not just rankings.

## Implementation Backlog for the Big Update

This is the recommended build order.

### Technical foundation

- Add `NEXT_PUBLIC_SITE_URL`
- Refactor all metadata and sitemap code to use the real site URL
- Build shared page template utilities for metadata, breadcrumbs, and schema
- Add a content source for static editorial pages
- Add a dynamic sitemap that includes all public content

### Route and template work

- Add `app/rates/[slug]/page.tsx`
- Add `app/compare/[slug]/page.tsx`
- Add `app/reviews/[slug]/page.tsx`
- Add `app/learn/[slug]/page.tsx`
- Add `app/methodology/page.tsx`
- Add `app/authors/[slug]/page.tsx`

### Content system

- Create structured page configs or content files for each initial page
- Define title, description, slug, hero summary, key facts, FAQ set, related links, CTA slot, and source list per page

### Analytics and reporting

- Verify affiliate click events and newsletter events by landing page
- Add page-type labels so content performance can be compared cleanly
- Add a recurring review process for refresh candidates

## Final Decision

Truva should not treat SEO as a blog side project.

Truva should treat SEO as the top-of-funnel acquisition engine and trust engine that makes every later bank negotiation easier.

The winning model is:

- product-led landing pages
- editorial depth
- freshness
- machine-readable structure
- strong trust signals
- savings first, then cards, then loans

The big update should build the infrastructure for that machine, not just publish a few articles.

## Appendix: Competitor Pages Worth Studying

- NerdWallet banking hub: https://www.nerdwallet.com/banking
- NerdWallet current CD rates: https://www.nerdwallet.com/banking/learn/current-cd-rates
- Moneymax savings editorial page: https://www.moneymax.ph/personal-finance/articles/savings-accounts-no-maintaining-balance
- Finmerkado savings accounts: https://www.finmerkado.ph/saving-accounts
- PesoHub savings rates page: https://pesohub.ph/rates/savings-rates/best-savings-interest-rates-philippines/

## Appendix: Repo-Specific References

- `app/layout.tsx`
- `app/page.tsx`
- `app/calculator/page.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `public/llms.txt`
- `data/rates.json`
- `CLAUDE.md`
