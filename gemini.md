# Truva Project Context (For Future AI Models)

## What is this App?
**Truva** is a Philippine digital bank interest rate, government savings, and DeFi yield comparison platform. It is being built as a mobile-first Next.js 14 Progressive Web App (PWA) using Tailwind CSS and shadcn/ui. 

The core differentiator of Truva is that it presents **after-tax yields** (e.g., deducting 20% Final Withholding Tax) rather than simply gross rates, alongside an interactive yield calculator. The application is rigorously optimized for performance (Lighthouse ≥90), strictly mobile-first (designed for a 375px viewport), and follows a precise institutional-brand design system.

## What has been done so far?
- **Week 1 Scaffolding & Setup**: The repository was successfully scaffolded.
- **Architectural Implementation**: Set up the Next.js App Router, Tailwind CSS configuration, custom color tokens, TypeScript definitions, and shadcn/ui primitives.
- **Core Components & Layout**: Built mobile-first specific UI configurations (`RateCard`) alongside desktop data tables (`RateTable`). Integrated sticky tab navigations (`FilterTabs`) and prepared placeholder stubs for the newsletter signups and calculator elements.
- **Data Integrations**: 
  - Seeded static JSON objects containing verified yield structures for initial Philippine digital banks (e.g., Maya, Tonik, GoTyme).
  - Wired live API proxy fetching to dynamically capture DefiLlama USDC/Aave base yields and merged them seamlessly alongside static rates.
- **Linting & Compilation Stabilization**: Rectified all strict ESLint compiler errors (such as unescaped React sequences, loose `any` variables in the DeFi fetcher, and unused request contexts) blocking the initial Vercel deploy.
- **Build Verification**: Achieved a clean zero-error compile state on `npm run build`.

## Instructions for Future AI Models
If you are continuing work on this codebase, please adhere to the following strict guidelines defined by the founder:

1. **Read the Briefing Context First**: The entire technical structure, product vision, and business architecture are documented in `truva-antigravity-briefing.md`. You MUST read this file to understand the rigorous design constraints, the components to be built in subsequent weeks, and features to explicitly **avoid** at MVP.
2. **Weekly Build Plans**: Refer to the active sprint build plan (e.g., `truva-week1-build-plan.md`) to verify what's required in the current milestone. Always check off the criteria.
3. **Performance First**: Do not introduce heavy external dependencies or unnecessarily shift natively server-rendered data into client-side `useEffect` fetches. The project mandates a <1.5s First Contentful Paint.
4. **Assume Mobile First**: Any UI modification must strictly preserve readability natively down to 375px without horizontal scrollbars. If adding a data table, it must have a card-based vertical list explicitly for mobile.
5. **Thoughtful Execution**: Do not arbitrarily rewrite stable components. The founder expects you to adopt a senior-level mindset: plan thoroughly, ask clarifying architectural questions if ambiguous, and utilize implementation plan artifacts prior to modifying the repository.
