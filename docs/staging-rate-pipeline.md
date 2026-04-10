# Staging Rate Pipeline

This rollout keeps the current public experience intact while moving rate management into a staged, review-first Supabase workflow.

## Baseline and rollback

Run the baseline export before touching the database:

```bash
npm run baseline:export
```

This writes a baseline package to `baseline/pre-staging-rate-pipeline/` with:

- `rates.json`
- `credit-cards.json`
- `current_public_snapshot.json`
- `next_published_candidate_snapshot.json`
- `baseline-manifest.json`
- optional `supabase-public/*.json` exports when admin credentials are available

Git rollback markers created for this migration:

- branch: `codex-staging-rate-pipeline`
- tag: `baseline-pre-staging-rate-pipeline`

## Staging workflow

1. Apply Supabase migrations.
2. In Supabase API settings, expose the `staging` schema if you want the seed/crawl scripts to write directly through the REST API. Snapshot reads use public RPCs, so the website does not need `staging` exposed just to consume approved snapshots.
3. Seed the staging schema from the current vetted site dataset:

```bash
npm run rates:seed:staging -- --reset
```

4. Fetch raw official-source artifacts for a phase-1 provider:

```bash
npm run rates:crawl -- --provider=maya-bank
```

5. Parse the latest local crawl artifacts into pending-review automated snapshots and review items:

```bash
npm run rates:extract -- --provider=maya-bank --dry-run
npm run rates:extract -- --provider=maya-bank
```

Use `--dry-run` first to inspect material diffs before writing to Supabase. The live command writes `pending_review` rows to `staging.product_snapshots`, `staging.facts`, `staging.change_events`, and `staging.review_queue`.

6. Review pending changes with the CLI:

```bash
npm run rates:review -- --list
```

Approve queued review IDs:

```bash
npm run rates:review -- --approve=<review_queue_id>
```

Reject queued review IDs (with optional note):

```bash
npm run rates:review -- --reject=<review_queue_id> --notes="reason"
```

You can pass multiple IDs as CSV in one call (for example `--approve=id1,id2`).

Optional internal review UI:

```bash
TRUVA_ENABLE_STAGING_REVIEW_UI=true
npm run dev
```

Then open `/admin/rates/review` to approve/reject with buttons.

7. Build the latest `staging` published snapshot from approved products:

```bash
npm run rates:snapshot:build -- --channel=staging
```

8. Verify the local pipeline invariants:

```bash
npm run rates:verify
```

9. For local integration testing, set:

```bash
TRUVA_RATES_SNAPSHOT_CHANNEL=staging
```

When this is set and server-side Supabase admin env vars are present, the app reads the latest staging snapshot. Otherwise it falls back to `data/rates.json`.

## Promotion

Only promote after local verification, Supabase review, and preview signoff:

```bash
npm run rates:snapshot:promote
```

This copies the latest `staging` snapshot into the `production` channel. Production deployments should read only the `production` snapshot channel.

## Preview-deployment verification checklist

Run this checklist **before** promoting staging → production. All items must pass.

### Step 1 — Local pre-check

```bash
npm run rates:verify
```

Expected output: `Verification passed: X products in staging snapshot.`  
If it prints fewer than 40 products, **do not promote**. Investigate the snapshot.

### Step 2 — Set staging channel locally

```bash
# .env.local
TRUVA_RATES_SNAPSHOT_CHANNEL=staging
```

Restart `npm run dev` and open `http://localhost:3000`. Check:

| Check | Pass condition |
|---|---|
| Rate table loads | Products visible, no error banner |
| After-tax rates displayed | Every rate shows an after-tax value |
| Pag-IBIG MP2 present | Visible in the Govt category |
| T-Bills absent | Not visible (inactive products correctly excluded) |
| Aave absent | Not visible |
| Maya rates match source | Visually compare with mayabank.ph/savings |
| Tonik rates match source | Visually compare with tonikbank.com product pages |

### Step 3 — Admin review queue is empty

```bash
npm run rates:review -- --list
```

Expected: `No queued change-event reviews found.`  
If items are still queued, resolve them before promoting.

### Step 4 — Deploy to Vercel preview

Push to a branch and get a Vercel preview URL. On the preview deployment:

- Set `TRUVA_RATES_SNAPSHOT_CHANNEL=production` (preview should read production until you've promoted staging)
- Confirm the same checks in Step 2 pass
- Confirm no JS console errors on the rate table page

### Step 5 — Promote

Only after steps 1–4 pass:

```bash
npm run rates:snapshot:promote
```

Confirm the production snapshot ID in the output, then do a final `npm run rates:verify` to validate.

---

## Rollback drill

There are two rollback paths depending on severity.

### Fast-path — Re-promote the previous snapshot

Use this when promotion introduced a data issue but the **previous staging snapshot** is still valid.

1. Query Supabase for the previous published snapshot ID:

   ```sql
   -- In Supabase SQL editor
   SELECT id, created_at, notes
   FROM staging.published_snapshots
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. Update the production channel to point to the previous snapshot:

   ```sql
   UPDATE staging.published_snapshots
   SET channel = 'production'
   WHERE id = '<previous_snapshot_id>';
   
   -- Then mark the bad one as rolled back:
   UPDATE staging.published_snapshots
   SET channel = 'rolled_back'
   WHERE id = '<bad_snapshot_id>';
   ```

3. Redeploy (or wait for the next ISR cycle — max 5 minutes).

4. Verify:

   ```bash
   npm run rates:verify
   ```

### Full-path — Reseed from baseline

Use this when staging data is corrupted and the previous snapshot is also unreliable.

1. Export the current baseline first (in case you want to diff):

   ```bash
   npm run baseline:export
   ```

2. Reseed staging from `data/rates.json`:

   ```bash
   npm run rates:seed:staging -- --reset
   ```

   > ⚠ This resets **all** staging rows to the approved seed state. All pending automated snapshots and queued review items will be wiped.

3. Build a fresh staging snapshot:

   ```bash
   npm run rates:snapshot:build -- --channel=staging
   ```

4. Verify:

   ```bash
   npm run rates:verify
   ```

5. If the production snapshot is also bad, re-promote the fresh staging snapshot:

   ```bash
   npm run rates:snapshot:promote
   ```

### If git rollback is needed

A baseline tag was created before the staging pipeline migration:

```bash
git checkout baseline-pre-staging-rate-pipeline
```

This restores the codebase to the pre-pipeline state where the app reads directly from `data/rates.json` with no Supabase dependency.

---

*Last updated: 2026-04-10*
