import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

import { applyChangeReviewDecision, buildAndPromoteRateSnapshot, listQueuedChangeReviews } from '@/lib/rate-review';
import type { QueuedChangeReviewItem, RateDiffDetail } from '@/lib/rate-review';

export const dynamic = 'force-dynamic';

const BULK_ACTION_CAP = 25;
const RATE_SURFACE_PATHS = ['/', '/banking', '/banking/rates', '/calculator', '/api/rates'];

function isReviewUiEnabled() {
  return process.env.TRUVA_ENABLE_STAGING_REVIEW_UI === 'true' || process.env.NODE_ENV === 'development';
}

function getOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function formatQueueTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    if (value > 0 && value <= 0.50) {
      return `${(value * 100).toFixed(value * 100 % 1 === 0 ? 0 : 2)}%`;
    }
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function DiffTable({ details, isNew }: { details: RateDiffDetail[]; isNew?: boolean }) {
  if (!details.length) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Rate Changes (Previous → New)
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="py-1.5 pr-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Field</th>
            {isNew ? (
              <th className="py-1.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Extracted Value</th>
            ) : (
              <>
                <th className="py-1.5 pr-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Previous</th>
                <th className="py-1.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">New</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {details.map((d) => {
            const nextText = formatDiffValue(d.next);
            const prevText = formatDiffValue(d.previous);
            const isComplex = nextText.startsWith('{') || nextText.startsWith('[');
            return (
              <tr key={d.field} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">{d.field}</td>
                {isNew ? (
                  <td className="py-2">
                    {isComplex ? (
                      <pre className="rounded bg-sky-50 p-2 text-xs text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 overflow-x-auto">{nextText}</pre>
                    ) : (
                      <span className="rounded bg-sky-50 px-2 py-0.5 font-mono text-xs text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">{nextText}</span>
                    )}
                  </td>
                ) : isComplex ? (
                  <td colSpan={2} className="py-2">
                    <div className="grid gap-1 md:grid-cols-2">
                      <pre className="rounded bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 overflow-x-auto">{prevText}</pre>
                      <pre className="rounded bg-emerald-50 p-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 overflow-x-auto">{nextText}</pre>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-rose-50 px-2 py-0.5 font-mono text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">{prevText}</span>
                    </td>
                    <td className="py-2">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{nextText}</span>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReviewCard({ item }: { item: QueuedChangeReviewItem }) {
  const isScraperItem = item.entityType === 'product_snapshot';
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {isScraperItem && (
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                🤖 Auto-Scraped
              </span>
            )}
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {item.providerDisplayName} — {item.productName}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Product ID: {item.productId}
          </p>
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block text-xs text-sky-600 underline underline-offset-2 hover:text-sky-700 dark:text-sky-400"
            >
              View Source Page ↗
            </a>
          )}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Priority {item.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-1 text-sm text-slate-700 dark:text-slate-300">
        <p><span className="font-medium">Queued At:</span> {formatQueueTimestamp(item.createdAt)}</p>
        {item.summary && <p><span className="font-medium">Summary:</span> {item.summary}</p>}
        {item.evidenceText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{item.evidenceText}"</p>
        )}
        <p><span className="font-medium">Reason:</span> {item.reason}</p>
      </div>

      <DiffTable details={item.diffDetails} isNew={isScraperItem} />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <form action={approveReviewAction} className="rounded-xl border border-emerald-200 p-3 dark:border-emerald-900/60">
          <input type="hidden" name="reviewQueueId" value={item.reviewQueueId} />
          <label htmlFor={`approve-notes-${item.reviewQueueId}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Approval Note (optional)
          </label>
          <input
            id={`approve-notes-${item.reviewQueueId}`}
            name="notes"
            type="text"
            placeholder="e.g. Verified against official website"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            ✓ Approve Change
          </button>
        </form>

        <form action={rejectReviewAction} className="rounded-xl border border-rose-200 p-3 dark:border-rose-900/60">
          <input type="hidden" name="reviewQueueId" value={item.reviewQueueId} />
          <label htmlFor={`reject-notes-${item.reviewQueueId}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Rejection Note <span className="text-rose-500">(recommended)</span>
          </label>
          <input
            id={`reject-notes-${item.reviewQueueId}`}
            name="notes"
            type="text"
            placeholder="e.g. Scraper picked up promo rate, not regular"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
          >
            ✗ Reject — Keep Current Live Rate
          </button>
        </form>
      </div>
    </article>
  );
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function approveReviewAction(formData: FormData) {
  'use server';
  if (!isReviewUiEnabled()) throw new Error('Review dashboard is disabled.');
  const reviewQueueId = getOptionalText(formData.get('reviewQueueId'));
  if (!reviewQueueId) throw new Error('Missing review queue ID for approval.');
  await applyChangeReviewDecision(reviewQueueId, 'approved', getOptionalText(formData.get('notes')));
  revalidatePath('/admin/rates/review');
}

async function rejectReviewAction(formData: FormData) {
  'use server';
  if (!isReviewUiEnabled()) throw new Error('Review dashboard is disabled.');
  const reviewQueueId = getOptionalText(formData.get('reviewQueueId'));
  if (!reviewQueueId) throw new Error('Missing review queue ID for rejection.');
  await applyChangeReviewDecision(reviewQueueId, 'rejected', getOptionalText(formData.get('notes')));
  revalidatePath('/admin/rates/review');
}

async function approveAllAction(formData: FormData) {
  'use server';
  if (!isReviewUiEnabled()) throw new Error('Review dashboard is disabled.');
  const confirm = getOptionalText(formData.get('confirm'));
  if (confirm !== 'APPROVE_ALL') throw new Error('Bulk approve requires the confirmation token APPROVE_ALL.');
  const rawIds = getOptionalText(formData.get('reviewQueueIds'));
  if (!rawIds) throw new Error('No review queue IDs supplied for bulk approve.');
  const ids = rawIds.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length > BULK_ACTION_CAP) throw new Error(`Bulk approve is capped at ${BULK_ACTION_CAP} items.`);
  const notes = getOptionalText(formData.get('notes')) ?? 'Bulk approved via review UI.';
  for (const id of ids) {
    await applyChangeReviewDecision(id, 'approved', notes);
  }
  revalidatePath('/admin/rates/review');
}

async function rejectAllAction(formData: FormData) {
  'use server';
  if (!isReviewUiEnabled()) throw new Error('Review dashboard is disabled.');
  const confirm = getOptionalText(formData.get('confirm'));
  if (confirm !== 'REJECT_ALL') throw new Error('Bulk reject requires the confirmation token REJECT_ALL.');
  const rawIds = getOptionalText(formData.get('reviewQueueIds'));
  if (!rawIds) throw new Error('No review queue IDs supplied for bulk reject.');
  const ids = rawIds.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length > BULK_ACTION_CAP) throw new Error(`Bulk reject is capped at ${BULK_ACTION_CAP} items.`);
  const notes = getOptionalText(formData.get('notes')) ?? 'Bulk rejected via review UI.';
  for (const id of ids) {
    await applyChangeReviewDecision(id, 'rejected', notes);
  }
  revalidatePath('/admin/rates/review');
}

async function publishToProductionAction() {
  'use server';
  if (!isReviewUiEnabled()) throw new Error('Review dashboard is disabled.');
  await buildAndPromoteRateSnapshot();
  for (const path of RATE_SURFACE_PATHS) {
    revalidatePath(path);
  }
  revalidatePath('/admin/rates/review');
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RateReviewPage() {
  if (!isReviewUiEnabled()) notFound();

  const queuedItems = await listQueuedChangeReviews();
  const allIds = queuedItems.map((item) => item.reviewQueueId).join(',');
  const bulkCapExceeded = queuedItems.length > BULK_ACTION_CAP;
  const adminSecret = process.env.TRUVA_ADMIN_SECRET ?? null;
  const bulkActionsAllowed = adminSecret === null;

  const scraperItems = queuedItems.filter((i) => i.entityType === 'product_snapshot');
  const changeItems = queuedItems.filter((i) => i.entityType === 'change_event');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Truva Rate Command Center
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Review material rate changes detected by extraction before rebuilding the staging snapshot.
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {queuedItems.length} item{queuedItems.length !== 1 ? 's' : ''} pending review
          {scraperItems.length > 0 && ` · ${scraperItems.length} from automated scraper`}
          {!bulkActionsAllowed && (
            <span className="ml-3 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              ⚠ TRUVA_ADMIN_SECRET is set — bulk actions disabled
            </span>
          )}
        </p>
      </div>

      {/* ── Publish to Production Card ── */}
      <div className="mb-8 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm dark:border-indigo-800/60 dark:from-indigo-950/40 dark:to-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-indigo-900 dark:text-indigo-200">
              🚀 Publish Rates to Live Website
            </h2>
            <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
              Once you have approved the rate changes above, click this button to push all approved
              snapshots to your live gotruva.com frontend instantly.
            </p>
            <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-400">
              ⚡ This builds a staging snapshot from all approved rates, then promotes it to production. Only approved data reaches users.
            </p>
          </div>
          <form action={publishToProductionAction} className="shrink-0">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              Publish to Website →
            </button>
          </form>
        </div>
      </div>

      {/* ── Bulk Action Panel ── */}
      {queuedItems.length > 1 && bulkActionsAllowed && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Bulk Actions ({queuedItems.length} items)
          </p>
          {bulkCapExceeded && (
            <p className="mb-3 text-xs text-rose-600 dark:text-rose-400">
              ⚠ {queuedItems.length} items exceeds the {BULK_ACTION_CAP}-item cap. Use individual approvals or flush in batches.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <form action={approveAllAction} className="space-y-2 rounded-xl border border-emerald-200 p-3 dark:border-emerald-900/60">
              <input type="hidden" name="reviewQueueIds" value={allIds} />
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Bulk Approval Note</label>
              <input
                name="notes"
                type="text"
                placeholder="Verified against source pages"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Type <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">APPROVE_ALL</code> to confirm
              </label>
              <input
                name="confirm"
                type="text"
                placeholder="APPROVE_ALL"
                className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={bulkCapExceeded}
                className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ✓ Approve All {queuedItems.length} Items
              </button>
            </form>
            <form action={rejectAllAction} className="space-y-2 rounded-xl border border-rose-200 p-3 dark:border-rose-900/60">
              <input type="hidden" name="reviewQueueIds" value={allIds} />
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Bulk Rejection Note</label>
              <input
                name="notes"
                type="text"
                placeholder="Reason for batch rejection"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Type <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">REJECT_ALL</code> to confirm
              </label>
              <input
                name="confirm"
                type="text"
                placeholder="REJECT_ALL"
                className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={bulkCapExceeded}
                className="inline-flex w-full items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ✗ Reject All {queuedItems.length} Items
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Queue Items ── */}
      {queuedItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl">✅</p>
          <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">All caught up!</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No pending review items. The scraper runs nightly — check back tomorrow, or click "Publish to Website" to push the latest approved rates now.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {queuedItems.map((item) => (
            <article
              key={item.reviewQueueId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-brand-textPrimary dark:text-slate-100">
                    {item.providerDisplayName} - {item.productName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Product ID: {item.productId}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Priority {item.priority}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                <p>
                  <span className="font-medium">Queued At:</span> {formatQueueTimestamp(item.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Queue ID:</span> {item.reviewQueueId}
                </p>
                <p>
                  <span className="font-medium">Entity:</span> {item.entityType} ({item.entityId})
                </p>
                {item.changeEventId ? (
                  <p>
                    <span className="font-medium">Change Event ID:</span> {item.changeEventId}
                  </p>
                ) : null}
                {item.newSnapshotId ? (
                  <p>
                    <span className="font-medium">New Snapshot ID:</span> {item.newSnapshotId}
                  </p>
                ) : null}
                {item.summary ? (
                  <p>
                    <span className="font-medium">Summary:</span> {item.summary}
                  </p>
                ) : null}
                <p>
                  <span className="font-medium">Reason:</span> {item.reason}
                </p>
              </div>

              <DiffTable details={item.diffDetails} />

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <form action={approveReviewAction} className="rounded-xl border border-emerald-200 p-3 dark:border-emerald-900/60">
                  <input type="hidden" name="reviewQueueId" value={item.reviewQueueId} />
                  <label htmlFor={`approve-notes-${item.reviewQueueId}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Approval Note (optional)
                  </label>
                  <input
                    id={`approve-notes-${item.reviewQueueId}`}
                    name="notes"
                    type="text"
                    placeholder="Reason or verification note"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    Approve Change
                  </button>
                </form>

                <form action={rejectReviewAction} className="rounded-xl border border-rose-200 p-3 dark:border-rose-900/60">
                  <input type="hidden" name="reviewQueueId" value={item.reviewQueueId} />
                  <label htmlFor={`reject-notes-${item.reviewQueueId}`} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Rejection Note (recommended)
                  </label>
                  <input
                    id={`reject-notes-${item.reviewQueueId}`}
                    name="notes"
                    type="text"
                    placeholder="What should be fixed before re-run"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    Reject Change
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
