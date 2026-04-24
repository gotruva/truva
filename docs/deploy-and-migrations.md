# Deploy and Migration Checklist

Use this sequence whenever a change touches both Supabase schema and app code.

## 1. Update the repo first

- Put schema changes in `supabase/migrations/`
- Keep app code and SQL changes in the same publish set
- Ignore local-only temp artifacts like `supabase/.temp/`

## 2. Verify locally

- Run the most relevant checks for the change
- For app changes, at minimum:
  - `npm run build`
- If repo-wide lint is noisy from unrelated legacy issues, run targeted lint on the changed files

## 3. Apply the schema change

- Run the migration in Supabase before expecting production app writes to succeed
- For analytics or reporting changes, verify:
  - new tables exist
  - new columns exist
  - new RPC/functions return sane output

## 4. Deploy the app

- Push the code to GitHub
- Deploy the updated app to Vercel after the migration is live

## 5. Verify production writes

- Trigger one controlled event in production
- Confirm rows land in the expected Supabase tables
- Confirm the admin/reporting UI reads the same data correctly

## 6. Watch for legacy data skew

- If a new metric depends on newly added tracking fields, exclude old rows that predate the new schema
- Example: CTR should not include older click rows that have no matching impression metadata
