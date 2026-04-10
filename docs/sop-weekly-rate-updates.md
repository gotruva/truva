# Truva Rate Pipeline: Weekly Operations SOP

This document outlines the standard procedural flow for maintaining Truva's interest rates securely and efficiently. It is designed for operators and VAs to predictably execute weekly data verifications.

---

## 1. High-Level Flow: How Rates Update the Website

Truva uses a **Staging-First Pipeline** to ensure accuracy. Rates do not go blindly to live production.

1. **Crawl (`rates:crawl`)**: A script visits every configured bank's official website and downloads a static snapshot (HTML) of their pages.
2. **Extract (`rates:extract`)**: A parser checks the crawled HTML. It finds the exact rates, calculates the after-tax yields, and compares them against our current known database values.
3. **Review Queuing**: If the extractor finds a difference (e.g. GoTyme dropped from 4% to 3%), it flags the item as a **material change** and pushes it to an internal "Needs Review" queue. If the rate hasn't changed, it simply updates the "Last Verified" timestamp silently.
4. **Human Verification**: An operator visits the `/admin/rates/review` dashboard inside the Truva web app. They see a side-by-side Diff Table, verify the change, and click "Approve". 
5. **Production Apply**: Only after clicking "Approve" does the updated rate synchronize to the live production database for users to see.

---

## 2. Weekly Step-by-Step SOP

Perform this procedure once every week (e.g. Monday mornings) to ensure all Phase 1 digital bank yields are perfectly accurate.

### Step 1: Run the Automated Crawler
Open the repository in your terminal and run the crawler. This command visits all supported banks automatically.
```bash
npm run rates:crawl
```
Wait for the script to finish. It will log "Fetched [URL]" for each bank. Note any `Failed to fetch` errors, as websites may occasionally go down.

### Step 2: Run the automated Extractor
Run the extractor script to process the downloaded HTML files into rate updates.
```bash
npm run rates:extract
```
The console will log exactly which products had `material changes` and which ones had `no material changes detected`.

### Step 3: Approve/Reject in the Internal UI
1. Navigate to the local admin portal: `http://localhost:3000/admin/rates/review`.
2. Review the pending items in the queue. You will see a Diff Table showing the `Previous Value` vs `New Value`.
3. If an extraction was flawed or grabbed the wrong number, hit **Reject** so it doesn't break production. You can then investigate. (If rejected, the production website still safely shows the old rate).
4. If a rate truly changed and the numbers look accurate, click **Approve** or click **Approve All**.

### Step 4: Verify Live Updates
Once approved, refresh the main application table on `http://localhost:3000`. The new rate and newly calculated after-tax yield should be actively displayed.

---

## 3. Handling NEW Deposit Products

Bank offerings change. Banks might launch a new "6-month Time Deposit" or a entirely new "Stash" product. **The automated parser does NOT auto-create brand new products.** Our parsers are strictly configured for known specific products to avoid injecting junk data correctly.

Here is how you catch new products and add them:

### A. How to Discover New Products
1. **Watch the Hash Changes Queue**: If a bank simply changes their page layout or adds a new product, the `rates:crawl` command detects that the entire HTML structure changed. It will flag a `Source content hash changed` event in your `/admin/rates/review` UI. Even if an extractor doesn't capture a rate change, a flagged hash change tells you: *"Something major was rewritten on the GoTyme page, go look at it manually."*
2. **Weekly Newsletter Monitoring**: Subscribe to the official newsletters and social media pages of the 14 Philippine digital banks.
3. **Compare with Competitors/Aggregators**: Periodically check Lemoneyd, SeedIn, or other PH finance communites to spot if a bank dropped a new stealth feature.

### B. How to Add a New Product to Truva
Once you verify the bank has a new product:

1. **Seed the Data**: Open `data/rates.json`. Copy an existing product JSON block from the same bank and paste it at the bottom. 
2. **Assign a unique ID**: Give it a new ID (e.g. `uno-td-1y`).
3. **Fill the Manual Info**: Populate the `"name"`, `"lockInDays"`, `"tiers"`, and base `"headlineRate"` according to their marketing page.
4. **Inform the Developer**: The automation parser in `lib/rate-extraction.ts` needs a new Regex rule to automatically extract the new product's rate going forward. Open a ticket with the engineer requesting: *"Please add a parser mapping for the newly added `uno-td-1y`."*
5. Until the developer adds the parsing rule, the pipeline will simply keep your manually seeded rate as perfectly valid and won't crash!
