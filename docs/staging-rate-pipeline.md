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

5. Build the latest `staging` published snapshot from approved products:

```bash
npm run rates:snapshot:build -- --channel=staging
```

6. Verify the local pipeline invariants:

```bash
npm run rates:verify
```

7. For local integration testing, set:

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
