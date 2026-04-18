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
  // For product_snapshot items from the scraper
  scrapedPayload?: Record<string, unknown>;
  sourceUrl?: string;
  evidenceText?: string;
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

/**
 * Builds a human-readable "diff" from a product_snapshot structured_payload
 * so it renders in the same DiffTable component as change_event diffs.
 */
function snapshotToDiffDetails(payload: Record<string, unknown>): RateDiffDetail[] {
  const details: RateDiffDetail[] = [];

  const headlineRate = payload['headlineRate'];
  if (typeof headlineRate === 'number') {
    details.push({ field: 'headlineRate', previous: null, next: headlineRate });
  }

  const baseRate = payload['baseRate'] as Record<string, number> | undefined;
  if (baseRate) {
    if (typeof baseRate['grossRate'] === 'number') {
      details.push({ field: 'grossRate', previous: null, next: baseRate['grossRate'] });
    }
    if (typeof baseRate['afterTaxRate'] === 'number') {
      details.push({ field: 'afterTaxRate', previous: null, next: baseRate['afterTaxRate'] });
    }
  }

  const tierType = payload['tierType'];
  if (tierType) {
    details.push({ field: 'tierType', previous: null, next: tierType });
  }

  const tiers = payload['tiers'];
  if (tiers) {
    details.push({ field: 'tiers', previous: null, next: tiers });
  }

  return details;
}

async function syncProductReviewStatus(productId: string) {
  const client = getStagingAdminClient();
  const { data: pendingRows, error: pendingError } = await client
    .from('change_events')
    .select('id')
    .eq('product_id', productId)
    .eq('review_status', 'pending_review')
    .limit(1);
  if (pendingError) throw pendingError;

  const nextStatus = (pendingRows?.length ?? 0) > 0 ? 'pending_review' : 'approved';
  const { error: updateError } = await client
    .from('products')
    .update({ review_status: nextStatus })
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

  const changeEventRows = queuedRows.filter((r) => r.entity_type === 'change_event');
  const snapshotRows = queuedRows.filter((r) => r.entity_type === 'product_snapshot');

  // ── Handle change_event items ──────────────────────────────────────────────
  const changeItems: QueuedChangeReviewItem[] = [];

  if (changeEventRows.length) {
    const changeEventIds = changeEventRows.map((r) => r.entity_id);
    const { data: changeData, error: changeError } = await client
      .from('change_events')
      .select('id, product_id, new_snapshot_id, summary, diff')
      .in('id', changeEventIds);
    if (changeError) throw changeError;

    const mappedChangeRows = (changeData ?? []) as ChangeEventRow[];
    const changeById = new Map(mappedChangeRows.map((r) => [r.id, r]));

    const productIds = [...new Set(mappedChangeRows.map((r) => r.product_id))];
    let productsById = new Map<string, ProductRow>();

    if (productIds.length) {
      const { data: productData, error: productError } = await client
        .from('products')
        .select('id, provider_display_name, product_name')
        .in('id', productIds);
      if (productError) throw productError;
      productsById = new Map((productData ?? [] as ProductRow[]).map((r) => [r.id, r]));
    }

    for (const queue of changeEventRows) {
      const change = changeById.get(queue.entity_id);
      if (!change) continue;
      const product = productsById.get(change.product_id);
      changeItems.push({
        reviewQueueId: queue.id,
        entityType: 'change_event',
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

  // ── Handle product_snapshot items (from scraper) ───────────────────────────
  const snapshotItems: QueuedChangeReviewItem[] = [];

  if (snapshotRows.length) {
    const snapshotIds = snapshotRows.map((r) => r.entity_id);
    const { data: snapData, error: snapError } = await client
      .from('product_snapshots')
      .select('id, product_id, source_mode, review_status, structured_payload, captured_at, metadata')
      .in('id', snapshotIds);
    if (snapError) throw snapError;

    const mappedSnapshots = (snapData ?? []) as ProductSnapshotRow[];
    const snapshotById = new Map(mappedSnapshots.map((r) => [r.id, r]));

    const snapshotProductIds = [...new Set(mappedSnapshots.map((r) => r.product_id))];
    let snapProductsById = new Map<string, ProductRow>();

    if (snapshotProductIds.length) {
      const { data: snapProductData, error: snapProductError } = await client
        .from('products')
        .select('id, provider_display_name, product_name')
        .in('id', snapshotProductIds);
      if (snapProductError) throw snapProductError;
      snapProductsById = new Map((snapProductData ?? [] as ProductRow[]).map((r) => [r.id, r]));
    }

    for (const queue of snapshotRows) {
      const snap = snapshotById.get(queue.entity_id);
      if (!snap) continue;
      const product = snapProductsById.get(snap.product_id);
      const meta = snap.metadata ?? {};
      snapshotItems.push({
        reviewQueueId: queue.id,
        entityType: 'product_snapshot',
        changeEventId: null,
        productId: snap.product_id,
        providerDisplayName: product?.provider_display_name ?? snap.product_id,
        productName: product?.product_name ?? snap.product_id,
        reason: queue.reason,
        summary: `Automated scrape captured on ${snap.captured_at.slice(0, 10)}`,
        changedFields: ['headlineRate', 'grossRate', 'afterTaxRate'],
        diffDetails: snapshotToDiffDetails(snap.structured_payload),
        newSnapshotId: snap.id,
        priority: queue.priority,
        createdAt: queue.created_at,
        scrapedPayload: snap.structured_payload,
        sourceUrl: typeof meta['source_url'] === 'string' ? meta['source_url'] : undefined,
        evidenceText: typeof meta['evidence_text'] === 'string' ? meta['evidence_text'] : undefined,
      });
    }
  }

  return [...snapshotItems, ...changeItems];
}

export async function applyChangeReviewDecision(
  reviewQueueId: string,
  decision: ReviewDecision,
  notes: string | null = null,
) {
  const client = getStagingAdminClient();

  const { data: queueRow, error: queueError } = await client
    .from('review_queue')
    .select('id, entity_type, entity_id, status')
    .eq('id', reviewQueueId)
    .single();
  if (queueError) throw queueError;
  if (!queueRow) throw new Error(`Review queue row ${reviewQueueId} not found.`);

  if (!['change_event', 'product_snapshot'].includes(queueRow.entity_type as string)) {
    throw new Error(`Review queue row ${reviewQueueId} has unsupported entity_type: ${queueRow.entity_type}.`);
  }
  if ((queueRow.status as string) !== 'queued') {
    throw new Error(`Review queue row ${reviewQueueId} is already ${queueRow.status}.`);
  }

  const resolvedAt = new Date().toISOString();
  const entityId = queueRow.entity_id as string;

  if ((queueRow.entity_type as string) === 'product_snapshot') {
    // Direct scraper snapshot — update its review_status
    const snapshotPatch: Record<string, unknown> = { review_status: decision };
    if (decision === 'approved') snapshotPatch.approved_at = resolvedAt;

    const { error: snapError } = await client
      .from('product_snapshots')
      .update(snapshotPatch)
      .eq('id', entityId);
    if (snapError) throw snapError;

    // Fetch snapshot's product_id to sync product review status
    const { data: snapRow, error: snapFetchError } = await client
      .from('product_snapshots')
      .select('product_id')
      .eq('id', entityId)
      .single();
    if (snapFetchError) throw snapFetchError;
    if (snapRow) await syncProductReviewStatus(snapRow.product_id as string);
  } else {
    // Legacy change_event path
    const { data: changeRow, error: changeError } = await client
      .from('change_events')
      .select('id, product_id, new_snapshot_id')
      .eq('id', entityId)
      .single();
    if (changeError) throw changeError;
    if (!changeRow) throw new Error(`Change event ${entityId} not found.`);

    const productId = changeRow.product_id as string;
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

    await syncProductReviewStatus(productId);
  }

  // Resolve the queue item
  const queuePatch: Record<string, unknown> = { status: decision, resolved_at: resolvedAt };
  if (notes) queuePatch.reviewer_notes = notes;

  const { error: queueUpdateError } = await client
    .from('review_queue')
    .update(queuePatch)
    .eq('id', reviewQueueId);
  if (queueUpdateError) throw queueUpdateError;

  return { reviewQueueId, decision };
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

  // 1. Build staging snapshot
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

  // 2. Promote to production
  const { error: promoteError } = await client.rpc('promote_rate_snapshot');
  if (promoteError) throw promoteError;

  return {
    stagingSnapshotId: staging.out_snapshot_id,
    productCount: staging.out_product_count,
    providerCount: staging.out_provider_count,
    generatedAt: staging.out_generated_at,
  };
}
