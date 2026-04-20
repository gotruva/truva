import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export type ReviewDecision = 'approved' | 'rejected';
export type EntityType = 'change_event' | 'product_snapshot';

interface ReviewQueueRow {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  status: string;
  priority: number;
  created_at: string;
}

interface ChangeEventRow {
  id: string;
  product_id: string;
  new_snapshot_id: string | null;
  summary: string | null;
  diff: unknown;
}

interface ProductRow {
  id: string;
  provider_display_name: string;
  product_name: string;
}

interface ProductSnapshotRow {
  id: string;
  product_id: string;
  source_mode: string;
  review_status: string;
  structured_payload: Record<string, unknown>;
  captured_at: string;
  metadata: Record<string, unknown> | null;
}

export interface RateDiffDetail {
  field: string;
  previous: unknown;
  next: unknown;
}

export interface QueuedChangeReviewItem {
  reviewQueueId: string;
  entityType: EntityType;
  entityId: string;
  changeEventId: string | null;
  productId: string;
  providerDisplayName: string;
  productName: string;
  reason: string;
  summary: string | null;
  changedFields: string[];
  diffDetails: RateDiffDetail[];
  newSnapshotId: string | null;
  priority: number;
  createdAt: string;
  scrapedPayload?: Record<string, unknown>;
  sourceUrl?: string;
  evidenceText?: string;
}

export interface ReviewDecisionResult {
  reviewQueueId: string;
  entityType: EntityType;
  entityId: string;
  productId: string;
  decision: ReviewDecision;
}

function getStagingAdminClient() {
  const client = createSupabaseAdminClient('staging');
  if (!client) {
    throw new Error('Missing Supabase admin environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return client;
}

function extractChangedFields(diff: unknown): string[] {
  if (!Array.isArray(diff)) return [];
  const fields = diff
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      return (entry as { field?: unknown }).field;
    })
    .filter((value): value is string => typeof value === 'string');
  return [...new Set(fields)];
}

function extractDiffDetails(diff: unknown): RateDiffDetail[] {
  if (!Array.isArray(diff)) return [];
  return diff
    .filter((entry): entry is { field: string; previous: unknown; next: unknown } => {
      if (!entry || typeof entry !== 'object') return false;
      return typeof (entry as { field?: unknown }).field === 'string';
    })
    .map((entry) => ({
      field: entry.field,
      previous: entry.previous,
      next: entry.next,
    }));
}

function snapshotToDiffDetails(payload: Record<string, unknown>): RateDiffDetail[] {
  const details: RateDiffDetail[] = [];

  const headlineRate = payload.headlineRate;
  if (typeof headlineRate === 'number') {
    details.push({ field: 'headlineRate', previous: null, next: headlineRate });
  }

  const baseRate = payload.baseRate as Record<string, number> | undefined;
  if (baseRate) {
    if (typeof baseRate.grossRate === 'number') {
      details.push({ field: 'grossRate', previous: null, next: baseRate.grossRate });
    }
    if (typeof baseRate.afterTaxRate === 'number') {
      details.push({ field: 'afterTaxRate', previous: null, next: baseRate.afterTaxRate });
    }
  }

  const tierType = payload.tierType;
  if (tierType) {
    details.push({ field: 'tierType', previous: null, next: tierType });
  }

  const tiers = payload.tiers;
  if (tiers) {
    details.push({ field: 'tiers', previous: null, next: tiers });
  }

  return details;
}

async function syncProductReviewStatus(productId: string) {
  const client = getStagingAdminClient();

  const { data: pendingChangeRows, error: pendingChangeError } = await client
    .from('change_events')
    .select('id')
    .eq('product_id', productId)
    .eq('review_status', 'pending_review')
    .limit(1);
  if (pendingChangeError) throw pendingChangeError;

  const { data: pendingSnapshotRows, error: pendingSnapshotError } = await client
    .from('product_snapshots')
    .select('id')
    .eq('product_id', productId)
    .eq('review_status', 'pending_review')
    .limit(1);
  if (pendingSnapshotError) throw pendingSnapshotError;

  const { data: approvedSnapshotRows, error: approvedSnapshotError } = await client
    .from('product_snapshots')
    .select('id')
    .eq('product_id', productId)
    .eq('review_status', 'approved')
    .limit(1);
  if (approvedSnapshotError) throw approvedSnapshotError;

  const hasPending = (pendingChangeRows?.length ?? 0) > 0 || (pendingSnapshotRows?.length ?? 0) > 0;
  const hasApprovedSnapshot = (approvedSnapshotRows?.length ?? 0) > 0;
  const nextStatus = hasPending ? 'pending_review' : hasApprovedSnapshot ? 'approved' : 'rejected';

  const { error: updateError } = await client
    .from('products')
    .update({ review_status: nextStatus, active_public: hasApprovedSnapshot })
    .eq('id', productId);
  if (updateError) throw updateError;
}

export async function listQueuedChangeReviews(): Promise<QueuedChangeReviewItem[]> {
  const client = getStagingAdminClient();

  const { data: queueRows, error: queueError } = await client
    .from('review_queue')
    .select('id, entity_type, entity_id, reason, status, priority, created_at')
    .in('entity_type', ['change_event', 'product_snapshot'])
    .eq('status', 'queued')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });
  if (queueError) throw queueError;

  const queuedRows = (queueRows ?? []) as ReviewQueueRow[];
  if (!queuedRows.length) return [];

  const changeEventRows = queuedRows.filter((row) => row.entity_type === 'change_event');
  const snapshotRows = queuedRows.filter((row) => row.entity_type === 'product_snapshot');
  const changeItems: QueuedChangeReviewItem[] = [];
  const snapshotItems: QueuedChangeReviewItem[] = [];

  if (changeEventRows.length) {
    const changeEventIds = changeEventRows.map((row) => row.entity_id);
    const { data: changeData, error: changeError } = await client
      .from('change_events')
      .select('id, product_id, new_snapshot_id, summary, diff')
      .in('id', changeEventIds);
    if (changeError) throw changeError;

    const mappedChangeRows = (changeData ?? []) as ChangeEventRow[];
    const changeById = new Map(mappedChangeRows.map((row) => [row.id, row]));
    const productIds = [...new Set(mappedChangeRows.map((row) => row.product_id))];
    let productsById = new Map<string, ProductRow>();

    if (productIds.length) {
      const { data: productData, error: productError } = await client
        .from('products')
        .select('id, provider_display_name, product_name')
        .in('id', productIds);
      if (productError) throw productError;
      productsById = new Map(((productData ?? []) as ProductRow[]).map((row) => [row.id, row]));
    }

    for (const queue of changeEventRows) {
      const change = changeById.get(queue.entity_id);
      if (!change) continue;
      const product = productsById.get(change.product_id);

      changeItems.push({
        reviewQueueId: queue.id,
        entityType: 'change_event',
        entityId: queue.entity_id,
        changeEventId: change.id,
        productId: change.product_id,
        providerDisplayName: product?.provider_display_name ?? 'Unknown Provider',
        productName: product?.product_name ?? change.product_id,
        reason: queue.reason,
        summary: change.summary,
        changedFields: extractChangedFields(change.diff),
        diffDetails: extractDiffDetails(change.diff),
        newSnapshotId: change.new_snapshot_id,
        priority: queue.priority,
        createdAt: queue.created_at,
      });
    }
  }

  if (snapshotRows.length) {
    const snapshotIds = snapshotRows.map((row) => row.entity_id);
    const { data: snapshotData, error: snapshotError } = await client
      .from('product_snapshots')
      .select('id, product_id, source_mode, review_status, structured_payload, captured_at, metadata')
      .in('id', snapshotIds);
    if (snapshotError) throw snapshotError;

    const mappedSnapshots = (snapshotData ?? []) as ProductSnapshotRow[];
    const snapshotById = new Map(mappedSnapshots.map((row) => [row.id, row]));
    const productIds = [...new Set(mappedSnapshots.map((row) => row.product_id))];
    let productsById = new Map<string, ProductRow>();

    if (productIds.length) {
      const { data: productData, error: productError } = await client
        .from('products')
        .select('id, provider_display_name, product_name')
        .in('id', productIds);
      if (productError) throw productError;
      productsById = new Map(((productData ?? []) as ProductRow[]).map((row) => [row.id, row]));
    }

    for (const queue of snapshotRows) {
      const snapshot = snapshotById.get(queue.entity_id);
      if (!snapshot) continue;
      const product = productsById.get(snapshot.product_id);
      const metadata = snapshot.metadata ?? {};

      snapshotItems.push({
        reviewQueueId: queue.id,
        entityType: 'product_snapshot',
        entityId: queue.entity_id,
        changeEventId: null,
        productId: snapshot.product_id,
        providerDisplayName: product?.provider_display_name ?? snapshot.product_id,
        productName: product?.product_name ?? snapshot.product_id,
        reason: queue.reason,
        summary: `Automated scrape captured on ${snapshot.captured_at.slice(0, 10)}`,
        changedFields: ['headlineRate', 'grossRate', 'afterTaxRate'],
        diffDetails: snapshotToDiffDetails(snapshot.structured_payload),
        newSnapshotId: snapshot.id,
        priority: queue.priority,
        createdAt: queue.created_at,
        scrapedPayload: snapshot.structured_payload,
        sourceUrl: typeof metadata.source_url === 'string' ? metadata.source_url : undefined,
        evidenceText: typeof metadata.evidence_text === 'string' ? metadata.evidence_text : undefined,
      });
    }
  }

  return [...snapshotItems, ...changeItems];
}

export async function applyChangeReviewDecision(
  reviewQueueId: string,
  decision: ReviewDecision,
  notes: string | null = null,
): Promise<ReviewDecisionResult> {
  const client = getStagingAdminClient();

  const { data: queueRow, error: queueError } = await client
    .from('review_queue')
    .select('id, entity_type, entity_id, status')
    .eq('id', reviewQueueId)
    .single();
  if (queueError) throw queueError;
  if (!queueRow) throw new Error(`Review queue row ${reviewQueueId} not found.`);

  const entityType = queueRow.entity_type as string;
  if (entityType !== 'change_event' && entityType !== 'product_snapshot') {
    throw new Error(`Review queue row ${reviewQueueId} has unsupported entity_type: ${queueRow.entity_type}.`);
  }
  if ((queueRow.status as string) !== 'queued') {
    throw new Error(`Review queue row ${reviewQueueId} is already ${queueRow.status}.`);
  }

  const resolvedAt = new Date().toISOString();
  const entityId = queueRow.entity_id as string;
  let productId: string;

  if (entityType === 'product_snapshot') {
    const { data: snapshotRow, error: snapshotFetchError } = await client
      .from('product_snapshots')
      .select('product_id')
      .eq('id', entityId)
      .single();
    if (snapshotFetchError) throw snapshotFetchError;
    if (!snapshotRow) throw new Error(`Product snapshot ${entityId} not found.`);

    productId = snapshotRow.product_id as string;
    const snapshotPatch: Record<string, unknown> = { review_status: decision };
    if (decision === 'approved') snapshotPatch.approved_at = resolvedAt;

    const { error: snapshotError } = await client
      .from('product_snapshots')
      .update(snapshotPatch)
      .eq('id', entityId);
    if (snapshotError) throw snapshotError;

    const { error: factsError } = await client
      .from('facts')
      .update({ review_status: decision })
      .eq('product_snapshot_id', entityId);
    if (factsError) throw factsError;
  } else {
    const { data: changeRow, error: changeError } = await client
      .from('change_events')
      .select('id, product_id, new_snapshot_id')
      .eq('id', entityId)
      .single();
    if (changeError) throw changeError;
    if (!changeRow) throw new Error(`Change event ${entityId} not found.`);

    productId = changeRow.product_id as string;
    const newSnapshotId = changeRow.new_snapshot_id as string | null;

    if (newSnapshotId) {
      const snapshotPatch: Record<string, unknown> = { review_status: decision };
      if (decision === 'approved') snapshotPatch.approved_at = resolvedAt;

      const { error: snapshotError } = await client
        .from('product_snapshots')
        .update(snapshotPatch)
        .eq('id', newSnapshotId);
      if (snapshotError) throw snapshotError;

      const { error: factsError } = await client
        .from('facts')
        .update({ review_status: decision })
        .eq('product_snapshot_id', newSnapshotId);
      if (factsError) throw factsError;
    }

    const { error: changeUpdateError } = await client
      .from('change_events')
      .update({ review_status: decision, resolved_at: resolvedAt })
      .eq('id', entityId);
    if (changeUpdateError) throw changeUpdateError;
  }

  const queuePatch: Record<string, unknown> = { status: decision, resolved_at: resolvedAt };
  if (notes) queuePatch.reviewer_notes = notes;

  const { error: queueUpdateError } = await client
    .from('review_queue')
    .update(queuePatch)
    .eq('id', reviewQueueId);
  if (queueUpdateError) throw queueUpdateError;

  await syncProductReviewStatus(productId);

  return {
    reviewQueueId,
    entityType,
    entityId,
    productId,
    decision,
  };
}

export interface PublishResult {
  stagingSnapshotId: string;
  productCount: number;
  providerCount: number;
  generatedAt: string;
}

export async function buildAndPromoteRateSnapshot(): Promise<PublishResult> {
  const client = createSupabaseAdminClient('public');
  if (!client) throw new Error('Missing Supabase admin environment variables.');

  const { data: stagingData, error: stagingError } = await client.rpc('build_rate_snapshot', {
    requested_channel: 'staging',
    snapshot_notes: `Admin-initiated publish at ${new Date().toISOString()}`,
  });
  if (stagingError) throw stagingError;
  if (!stagingData?.[0]) throw new Error('build_rate_snapshot returned no result.');

  const staging = stagingData[0] as {
    out_snapshot_id: string;
    out_product_count: number;
    out_provider_count: number;
    out_generated_at: string;
  };

  const { error: promoteError } = await client.rpc('promote_rate_snapshot');
  if (promoteError) throw promoteError;

  return {
    stagingSnapshotId: staging.out_snapshot_id,
    productCount: staging.out_product_count,
    providerCount: staging.out_provider_count,
    generatedAt: staging.out_generated_at,
  };
}

export async function rollbackToSnapshot(snapshotId: string): Promise<PublishResult> {
  const client = createSupabaseAdminClient('public');
  if (!client) throw new Error('Missing Supabase admin environment variables.');

  const { data: productionData, error: productionError } = await client.rpc('promote_specific_snapshot', {
    source_snapshot_id: snapshotId,
  });
  if (productionError) throw productionError;
  if (!productionData?.[0]) throw new Error('promote_specific_snapshot returned no result.');

  const result = productionData[0] as any;

  return {
    stagingSnapshotId: result.out_snapshot_id,
    productCount: result.out_product_count,
    providerCount: result.out_provider_count,
    generatedAt: result.out_generated_at,
  };
}
