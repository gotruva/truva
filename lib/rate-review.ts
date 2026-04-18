import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export type ReviewDecision = 'approved' | 'rejected';
type ReviewEntityType = 'change_event' | 'product_snapshot';

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

interface ProductSnapshotRow {
  id: string;
  product_id: string;
  structured_payload: unknown;
  metadata: unknown;
  captured_at: string;
  created_at: string;
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
  entityType: ReviewEntityType;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getRecordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function buildSnapshotDetails(snapshot: ProductSnapshotRow): RateDiffDetail[] {
  const payload = getRecordValue(snapshot.structured_payload);
  const baseRate = getRecordValue(payload.baseRate);
  const metadata = getRecordValue(snapshot.metadata);

  const details: Array<[string, unknown]> = [
    ['headlineRate', payload.headlineRate],
    ['baseRate.grossRate', baseRate.grossRate],
    ['baseRate.afterTaxRate', baseRate.afterTaxRate],
    ['tierType', payload.tierType],
    ['tiers', payload.tiers],
    ['validUntil', payload.validUntil],
    ['sourceUrl', metadata.source_url],
    ['capturedAt', snapshot.captured_at],
  ];

  return details
    .filter(([, next]) => next !== undefined && next !== null)
    .map(([field, next]) => ({ field, previous: null, next }));
}

function buildSnapshotSummary(snapshot: ProductSnapshotRow) {
  const payload = getRecordValue(snapshot.structured_payload);
  const metadata = getRecordValue(snapshot.metadata);
  const headlineRate = typeof payload.headlineRate === 'number'
    ? `${(payload.headlineRate * 100).toFixed(2)}%`
    : null;
  const sourceUrl = typeof metadata.source_url === 'string' ? metadata.source_url : null;

  if (headlineRate && sourceUrl) {
    return `Auto-scraped headline rate ${headlineRate} from ${sourceUrl}.`;
  }
  if (headlineRate) {
    return `Auto-scraped headline rate ${headlineRate}.`;
  }
  return 'Auto-scraped product snapshot.';
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

  const changeEventIds = queuedRows
    .filter((row) => row.entity_type === 'change_event')
    .map((row) => row.entity_id);
  const snapshotIds = queuedRows
    .filter((row) => row.entity_type === 'product_snapshot')
    .map((row) => row.entity_id);

  let mappedChangeRows: ChangeEventRow[] = [];
  if (changeEventIds.length) {
    const { data: changeRows, error: changeError } = await client
      .from('change_events')
      .select('id, product_id, new_snapshot_id, summary, diff')
      .in('id', changeEventIds);
    if (changeError) throw changeError;

    mappedChangeRows = (changeRows ?? []) as ChangeEventRow[];
  }
  const changeById = new Map(mappedChangeRows.map((row) => [row.id, row]));

  let mappedSnapshotRows: ProductSnapshotRow[] = [];
  if (snapshotIds.length) {
    const { data: snapshotRows, error: snapshotError } = await client
      .from('product_snapshots')
      .select('id, product_id, structured_payload, metadata, captured_at, created_at')
      .in('id', snapshotIds);
    if (snapshotError) throw snapshotError;

    mappedSnapshotRows = (snapshotRows ?? []) as ProductSnapshotRow[];
  }
  const snapshotById = new Map(mappedSnapshotRows.map((row) => [row.id, row]));

  const productIds = [
    ...new Set([
      ...mappedChangeRows.map((row) => row.product_id),
      ...mappedSnapshotRows.map((row) => row.product_id),
    ]),
  ];
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

  const items = queuedRows.map<QueuedChangeReviewItem | null>((queue) => {
    if (queue.entity_type === 'product_snapshot') {
      const snapshot = snapshotById.get(queue.entity_id);
      if (!snapshot) return null;

      const product = productsById.get(snapshot.product_id);
      const diffDetails = buildSnapshotDetails(snapshot);
      return {
        reviewQueueId: queue.id,
        entityType: 'product_snapshot',
        entityId: snapshot.id,
        changeEventId: null,
        productId: snapshot.product_id,
        providerDisplayName: product?.provider_display_name ?? 'Unknown Provider',
        productName: product?.product_name ?? snapshot.product_id,
        reason: queue.reason,
        summary: buildSnapshotSummary(snapshot),
        changedFields: diffDetails.map((detail) => detail.field),
        diffDetails,
        newSnapshotId: snapshot.id,
        priority: queue.priority,
        createdAt: queue.created_at,
      } satisfies QueuedChangeReviewItem;
    }

    if (queue.entity_type === 'change_event') {
      const change = changeById.get(queue.entity_id);
      if (!change) return null;

      const product = productsById.get(change.product_id);
      return {
        reviewQueueId: queue.id,
        entityType: 'change_event',
        entityId: change.id,
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
    }

    return null;
  });

  return items.filter((item): item is QueuedChangeReviewItem => item !== null);
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

  if ((queueRow.status as string) !== 'queued') {
    throw new Error(`Review queue row ${reviewQueueId} is already ${queueRow.status}.`);
  }

  const entityType = queueRow.entity_type as string;
  if (entityType !== 'change_event' && entityType !== 'product_snapshot') {
    throw new Error(`Review queue row ${reviewQueueId} is ${entityType}, expected change_event or product_snapshot.`);
  }

  const resolvedAt = new Date().toISOString();

  const queuePatch: Record<string, unknown> = {
    status: decision,
    resolved_at: resolvedAt,
  };
  if (notes) queuePatch.reviewer_notes = notes;

  let productId: string;
  let changeEventId: string | null = null;
  let snapshotId: string | null = null;

  if (entityType === 'change_event') {
    changeEventId = queueRow.entity_id as string;
    const { data: changeRow, error: changeError } = await client
      .from('change_events')
      .select('id, product_id, new_snapshot_id')
      .eq('id', changeEventId)
      .single();
    if (changeError) throw changeError;
    if (!changeRow) throw new Error(`Change event ${changeEventId} not found.`);

    productId = changeRow.product_id as string;
    snapshotId = changeRow.new_snapshot_id as string | null;

    if (snapshotId) {
      const snapshotPatch: Record<string, unknown> = {
        review_status: decision,
      };
      if (decision === 'approved') {
        snapshotPatch.approved_at = resolvedAt;
      }

      const { error: snapshotError } = await client
        .from('product_snapshots')
        .update(snapshotPatch)
        .eq('id', snapshotId);
      if (snapshotError) throw snapshotError;

      const { error: factsError } = await client
        .from('facts')
        .update({ review_status: decision })
        .eq('product_snapshot_id', snapshotId);
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
  } else {
    snapshotId = queueRow.entity_id as string;
    const { data: snapshotRow, error: snapshotLookupError } = await client
      .from('product_snapshots')
      .select('id, product_id')
      .eq('id', snapshotId)
      .single();
    if (snapshotLookupError) throw snapshotLookupError;
    if (!snapshotRow) throw new Error(`Product snapshot ${snapshotId} not found.`);

    productId = snapshotRow.product_id as string;
    const snapshotPatch: Record<string, unknown> = {
      review_status: decision,
    };
    if (decision === 'approved') {
      snapshotPatch.approved_at = resolvedAt;
    }

    const { error: snapshotUpdateError } = await client
      .from('product_snapshots')
      .update(snapshotPatch)
      .eq('id', snapshotId);
    if (snapshotUpdateError) throw snapshotUpdateError;

    const { error: factsError } = await client
      .from('facts')
      .update({ review_status: decision })
      .eq('product_snapshot_id', snapshotId);
    if (factsError) throw factsError;
  }

  const { error: queueUpdateError } = await client
    .from('review_queue')
    .update(queuePatch)
    .eq('id', reviewQueueId);
  if (queueUpdateError) throw queueUpdateError;

  await syncProductReviewStatus(productId);

  return {
    reviewQueueId,
    changeEventId,
    snapshotId,
    productId,
    decision,
  };
}
