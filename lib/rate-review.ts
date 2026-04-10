import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export type ReviewDecision = 'approved' | 'rejected';

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

export interface RateDiffDetail {
  field: string;
  previous: unknown;
  next: unknown;
}

export interface QueuedChangeReviewItem {
  reviewQueueId: string;
  changeEventId: string;
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
    .eq('entity_type', 'change_event')
    .eq('status', 'queued')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });
  if (queueError) throw queueError;

  const queuedRows = (queueRows ?? []) as ReviewQueueRow[];
  if (!queuedRows.length) return [];

  const changeEventIds = queuedRows.map((row) => row.entity_id);
  const { data: changeRows, error: changeError } = await client
    .from('change_events')
    .select('id, product_id, new_snapshot_id, summary, diff')
    .in('id', changeEventIds);
  if (changeError) throw changeError;

  const mappedChangeRows = (changeRows ?? []) as ChangeEventRow[];
  const changeById = new Map(mappedChangeRows.map((row) => [row.id, row]));

  const productIds = [...new Set(mappedChangeRows.map((row) => row.product_id))];
  let productsById = new Map<string, ProductRow>();

  if (productIds.length) {
    const { data: productRows, error: productError } = await client
      .from('products')
      .select('id, provider_display_name, product_name')
      .in('id', productIds);
    if (productError) throw productError;

    const mappedProductRows = (productRows ?? []) as ProductRow[];
    productsById = new Map(mappedProductRows.map((row) => [row.id, row]));
  }

  return queuedRows
    .map((queue) => {
      const change = changeById.get(queue.entity_id);
      if (!change) return null;

      const product = productsById.get(change.product_id);
      return {
        reviewQueueId: queue.id,
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
      } satisfies QueuedChangeReviewItem;
    })
    .filter((item): item is QueuedChangeReviewItem => Boolean(item));
}

export async function applyChangeReviewDecision(reviewQueueId: string, decision: ReviewDecision, notes: string | null = null) {
  const client = getStagingAdminClient();

  const { data: queueRow, error: queueError } = await client
    .from('review_queue')
    .select('id, entity_type, entity_id, status')
    .eq('id', reviewQueueId)
    .single();
  if (queueError) throw queueError;
  if (!queueRow) throw new Error(`Review queue row ${reviewQueueId} not found.`);

  if ((queueRow.entity_type as string) !== 'change_event') {
    throw new Error(`Review queue row ${reviewQueueId} is ${queueRow.entity_type}, expected change_event.`);
  }
  if ((queueRow.status as string) !== 'queued') {
    throw new Error(`Review queue row ${reviewQueueId} is already ${queueRow.status}.`);
  }

  const changeEventId = queueRow.entity_id as string;
  const { data: changeRow, error: changeError } = await client
    .from('change_events')
    .select('id, product_id, new_snapshot_id')
    .eq('id', changeEventId)
    .single();
  if (changeError) throw changeError;
  if (!changeRow) throw new Error(`Change event ${changeEventId} not found.`);

  const productId = changeRow.product_id as string;
  const newSnapshotId = changeRow.new_snapshot_id as string | null;
  const resolvedAt = new Date().toISOString();

  if (newSnapshotId) {
    const snapshotPatch: Record<string, unknown> = {
      review_status: decision,
    };
    if (decision === 'approved') {
      snapshotPatch.approved_at = resolvedAt;
    }

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
    .update({
      review_status: decision,
      resolved_at: resolvedAt,
    })
    .eq('id', changeEventId);
  if (changeUpdateError) throw changeUpdateError;

  const queuePatch: Record<string, unknown> = {
    status: decision,
    resolved_at: resolvedAt,
  };
  if (notes) queuePatch.reviewer_notes = notes;

  const { error: queueUpdateError } = await client
    .from('review_queue')
    .update(queuePatch)
    .eq('id', reviewQueueId);
  if (queueUpdateError) throw queueUpdateError;

  await syncProductReviewStatus(productId);

  return {
    reviewQueueId,
    changeEventId,
    productId,
    decision,
  };
}
