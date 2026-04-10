import dotenv from 'dotenv';

import { applyChangeReviewDecision, listQueuedChangeReviews } from '@/lib/rate-review';

dotenv.config({ path: '.env.local' });
dotenv.config();

interface ParsedArgs {
  list: boolean;
  approveIds: string[];
  rejectIds: string[];
  notes: string | null;
}

function getCsvArgument(prefix: string) {
  const raw = process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length).trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function getStringArgument(prefix: string) {
  const raw = process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length).trim();
  return raw && raw.length > 0 ? raw : null;
}

function parseArgs(): ParsedArgs {
  return {
    list: process.argv.includes('--list'),
    approveIds: getCsvArgument('--approve='),
    rejectIds: getCsvArgument('--reject='),
    notes: getStringArgument('--notes='),
  };
}

async function listQueuedItems() {
  const queuedItems = await listQueuedChangeReviews();
  if (!queuedItems.length) {
    console.log('No queued change-event reviews found.');
    return;
  }

  console.log(`Queued review items: ${queuedItems.length}`);
  for (const item of queuedItems) {
    const changedFields = item.changedFields.join(', ');

    console.log('');
    console.log(`review_queue_id: ${item.reviewQueueId}`);
    console.log(`priority: ${item.priority}`);
    console.log(`created_at: ${item.createdAt}`);
    console.log(`product_id: ${item.productId}`);
    console.log(`product: ${item.providerDisplayName} - ${item.productName}`);
    console.log(`change_event_id: ${item.changeEventId}`);
    if (item.newSnapshotId) console.log(`new_snapshot_id: ${item.newSnapshotId}`);
    if (changedFields) console.log(`fields: ${changedFields}`);
    if (item.summary) console.log(`summary: ${item.summary}`);
    if (item.reason) console.log(`reason: ${item.reason}`);
  }
}

async function main() {
  const args = parseArgs();

  if (args.list && !args.approveIds.length && !args.rejectIds.length) {
    await listQueuedItems();
    return;
  }

  if (args.approveIds.length && args.rejectIds.length) {
    throw new Error('Use approve or reject in one command, not both.');
  }

  if (!args.approveIds.length && !args.rejectIds.length) {
    throw new Error('Usage: --list OR --approve=<review_queue_id[,id]> OR --reject=<review_queue_id[,id]> [--notes="..."]');
  }

  if (args.approveIds.length) {
    for (const id of args.approveIds) {
      const result = await applyChangeReviewDecision(id, 'approved', args.notes);
      console.log(`APPROVED: ${result.reviewQueueId} (${result.productId})`);
    }
    return;
  }

  for (const id of args.rejectIds) {
    const result = await applyChangeReviewDecision(id, 'rejected', args.notes);
    console.log(`REJECTED: ${result.reviewQueueId} (${result.productId})`);
  }
}

main().catch((error) => {
  console.error('Rate review action failed:', error);
  process.exit(1);
});
