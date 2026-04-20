-- migrations/20260421_admin_auth.sql
-- Function to rollback the live rate snapshot to a specific previous snapshot.

CREATE OR REPLACE FUNCTION public.promote_specific_snapshot(source_snapshot_id uuid)
RETURNS table (
  out_snapshot_id uuid,
  out_snapshot_channel text,
  out_product_count integer,
  out_provider_count integer,
  out_generated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, staging
AS $$
DECLARE
  source_snapshot staging.published_snapshots%rowtype;
  new_staging_id uuid;
BEGIN
  -- Get the target snapshot
  SELECT *
  INTO source_snapshot
  FROM staging.published_snapshots
  WHERE id = source_snapshot_id;

  IF source_snapshot.id IS NULL THEN
    RAISE EXCEPTION 'Source snapshot % not found.', source_snapshot_id;
  END IF;

  -- Insert it as a new staging snapshot so the pipeline can promote it cleanly
  INSERT INTO staging.published_snapshots (
    snapshot_channel,
    payload,
    source_product_ids,
    provider_count,
    product_count,
    promoted_from_snapshot_id,
    notes,
    metadata,
    generated_at
  )
  VALUES (
    'staging',
    source_snapshot.payload,
    source_snapshot.source_product_ids,
    source_snapshot.provider_count,
    source_snapshot.product_count,
    source_snapshot.id,
    format('Rollback/Restore from snapshot %s', source_snapshot.id),
    jsonb_build_object('generated_by', 'public.promote_specific_snapshot'),
    now()
  )
  RETURNING id INTO new_staging_id;

  -- Now promote that new staging snapshot to production using the existing function
  RETURN QUERY
  SELECT * FROM public.promote_rate_snapshot();
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_specific_snapshot(uuid) TO service_role;
