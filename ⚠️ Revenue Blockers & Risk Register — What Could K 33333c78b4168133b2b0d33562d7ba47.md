# ⚠️ Revenue Blockers & Risk Register — What Could Kill This

# Revenue Blockers & Risk Register

> **Purpose:** Honest assessment of the risks that could prevent this business from reaching ₱100K/month. Each risk is rated by probability and impact, with a specific mitigation. Updated March 30, 2026.
> 

---

# 🚨 Critical Blockers (Must Fix Before Revenue)

## Blocker 1: Brand Name

**Status:** ✅ RESOLVED — Truva

**Impact:** Cannot register domain, set up GitHub repo, Supabase project, Vercel URL, branded emails, or newsletter. Every day delayed is a day not building.

**Mitigation:** Name decided: **Truva**. Next step: register domain ([truva.com](http://truva.com), [truva.ph](http://truva.ph), or [truva.app](http://truva.app)) immediately.

## Blocker 2: Affiliate Revenue Depends on Peer Referral Codes, Not Formal Programs

**Status:** HIGH RISK

**Impact:** Philippine digital banks (Maya, Tonik, GoTyme, GCash) pay ₱50–100 per referral via peer codes. These are NOT formal CPA affiliate programs. They can be changed, capped, or discontinued at any time without notice. If Maya caps their referral program at 10 referrals/month, your revenue ceiling drops dramatically.

**Mitigation:**

- Diversify across 5+ bank referral codes from Day 1 (don’t depend on any single bank)
- Begin formal partnership outreach to Maya and Tonik BD teams by Week 7
- Track which codes are active monthly — programs change without warning
- Build toward sponsored placement revenue (bank-paid, not referral-dependent) by Month 4

## Blocker 3: No Formal Affiliate Mechanism for Government Products

**Status:** STRUCTURAL LIMITATION

**Impact:** Pag-IBIG MP2, RTBs, T-Bills, SSS PESO Fund, and UITFs have zero referral or affiliate infrastructure. These products drive traffic and trust but generate ZERO direct revenue. They are cost centers (dev time to build + maintain) not profit centers.

**Mitigation:** Accept this. Government products serve as SEO magnets and trust builders. Users who come for MP2 info stay for digital bank comparisons (where affiliate links exist). The funnel is: MP2/RTB content → trust → digital bank comparison → affiliate click → revenue.

---

# 🟡 High-Risk Items (Could Significantly Slow Revenue)

## Risk 4: Lemoneyd Has a 6-Month Head Start

**Probability:** Certain (it’s already live)

**Impact:** Lemoneyd launched Sept 2025 with 45K+ app downloads, active community, and established bank referral codes. They are the incumbent. If they add an after-tax calculator before you launch, your primary differentiator disappears.

**Mitigation:**

- Ship the after-tax calculator FAST (Week 3). This is your #1 feature moat.
- Build the PDIC Smart Split optimizer — Lemoneyd doesn’t have this and it’s hard to replicate.
- Go web-first (PWA) while Lemoneyd is app-only — capture SEO traffic they can’t.
- Compete on breadth: Lemoneyd covers digital banks only. You cover digital banks + government products + DeFi + UITFs + credit cooperatives.

## Risk 5: SEO Takes 6–12 Months to Compound

**Probability:** Certain

**Impact:** Organic traffic is the primary distribution channel. But Google takes 3–6 months to index and rank new domains, and 6–12 months for competitive keywords like “best digital bank Philippines 2026.” Month 1–3 organic traffic will be near zero.

**Mitigation:**

- Community distribution (r/phinvest, Facebook groups) bridges the gap from Month 1–4
- Publish SEO articles from Week 1 even though traffic won’t appear for months — compound early
- Consider 2–3 guest posts on established PH finance blogs ([Grit.ph](http://Grit.ph), JuanInvestor) for backlinks
- Facebook Ads at ₱9 CPC (90% cheaper than global average) can supplement organic from Month 3

## Risk 6: Newsletter Growth Is Slow Without Existing Audience

**Probability:** High

**Impact:** The newsletter is the affiliate distribution engine. But growing from 0 to 5,000 subscribers takes 6–12 months for most creators. Substack data shows adding 100 net new subscribers/week is considered strong performance. At that rate, 5,000 takes ~50 weeks.

**Mitigation:**

- Every tool interaction should prompt email capture (after calculator result, after PDIC split, on article pages)
- Offer a genuine lead magnet: "Free downloadable PH savings rate spreadsheet" or "Monthly rate report PDF"
- Cross-promote on r/phinvest (357K members) and Facebook groups
- Use the tool itself as the growth engine — the shareable result card ("I’m earning ₱X more") drives organic signups

## Risk 7: Solo Founder Burnout / Scope Creep

**Probability:** High

**Impact:** Building a tool + writing weekly content + managing a newsletter + doing bank BD outreach + maintaining rate data accuracy is an enormous workload for one person. The Sprint Plan has Mon/Wed/Fri dev and Tue/Thu content, but this leaves zero buffer for bugs, data corrections, or partnership meetings.

**Mitigation:**

- Ruthlessly prioritize: the rate table + calculator + affiliate links + newsletter are the ONLY Week 1–4 deliverables. Everything else waits.
- Accept that the rate data will be manually updated for Month 1–2. Don’t build n8n scrapers until the product has users.
- Defer credit cooperatives, SSS PESO Fund, GSIS, and Dollar RTBs to Month 3+
- Hire a part-time content writer when revenue exceeds ₱50K/month

---

# 🟢 Lower-Risk Items (Monitor)

## Risk 8: Rate Data Accuracy Liability

**Probability:** Medium

**Impact:** If the tool shows an incorrect rate and a user makes a financial decision based on it, there’s reputational (not legal) risk. The product is clearly not financial advice, but community trust is everything.

**Mitigation:**

- "Last updated" timestamp on every rate row
- "Rates verified against [bank name] app on [date]" disclosure
- "This is not financial advice" in footer and on every calculator output
- Weekly QA pass: manually verify top 5 bank rates against their apps every Sunday

## Risk 9: Bank Referral Code Attribution Is Imperfect

**Probability:** High

**Impact:** Peer referral codes don’t have robust tracking. You won’t know exactly which of your users converted. Maya’s referral dashboard shows referral count but not source. You can’t attribute conversions to specific articles, newsletter issues, or tool interactions.

**Mitigation:**

- Track affiliate link clicks in Supabase (you control this data)
- Use unique UTM parameters per placement (tool vs. newsletter vs. article)
- Estimated conversion rate: if 100 people click your Maya referral link, ~10–20 will complete signup. Track clicks as your proxy metric.
- When you negotiate formal partnerships, insist on a dedicated tracking dashboard

## Risk 10: ChatGPT / AI Can Replicate Calculator Functionality

**Probability:** Medium-High

**Impact:** Anyone can ask ChatGPT "what’s the best savings rate in the Philippines?" and get a reasonable answer. Your calculator’s math is not defensible.

**Mitigation:** Your moat is NOT the calculator. It’s:

- **Live data** (ChatGPT doesn’t know today’s Maya rate or if Tonik changed their TD)
- **Persistence** (TD Tracker, maturity reminders, saved scenarios)
- **Proactive alerts** ("Maya dropped from 15% to 10%, here’s what to do")
- **Newsletter relationship** (weekly email ChatGPT can’t send)
- Positioning: "ChatGPT can do the math. It can’t watch your money."

## Risk 11: Premature Vertical Expansion (Building Credit Cards Too Early)

**Probability:** Medium

**Impact:** With a broader platform vision now documented (Phase 2: credit cards, Phase 3: loans), there is a real risk of scope creep during the 8-week sprint. Building credit card comparison before savings is established wastes dev time, dilutes the product narrative, and competes directly with Moneymax's entrenched SEO without any of Truva's unique advantages (after-tax math, PDIC optimizer, DeFi yields) being applicable to credit cards.

**Mitigation:**

- Phase 2 is documented but LOCKED until Month 6. No credit card features in the 8-week sprint.
- The trigger for starting Phase 2 is: 3,000+ newsletter subscribers AND consistent affiliate revenue from savings vertical AND at least 2 formal bank partnerships negotiated.
- If any of those three conditions isn't met by Month 6, Phase 2 is deferred. Traffic and trust must come first.

---

# 📊 Revenue Probability Assessment

| Timeline | Revenue Target | Probability | What Must Be True |
| --- | --- | --- | --- |
| Month 6 | ₱100,000/month | **< 5%** | Viral moment + 15K+ users + 4%+ conversion + formal bank partnerships — all simultaneously |
| Month 6 | ₱15,000–35,000/month | **40–60%** | Strong execution, 500+ newsletter subscribers, active affiliate links, 2+ SEO articles ranking |
| Month 12 | ₱50,000–100,000/month | **30–50%** | 5,000+ newsletter subscribers, 2–3 formal bank partnerships, 8+ ranking SEO articles, regular sponsored content |
| Month 18 | ₱100,000–200,000/month | **40–60%** | Category authority established, 10,000+ newsletter, B2B API customer(s), multiple bank partnerships |

---

*Created: March 30, 2026 | Owner: Beto | Review: Monthly*