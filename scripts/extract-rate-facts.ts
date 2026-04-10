import dotenv from 'dotenv';

import type { RateProduct } from '@/types';
import type { RateProviderDefinition } from '@/types/rate-pipeline';

import {
  diffRateProductMaterialFields,
  extractAutomatedRateCandidates,
  formatRateDiffSummary,
  getRateChangeSeverity,
  listSupportedRateExtractionProviders,
  loadLatestLocalArtifacts,
} from '@/lib/rate-extraction';
import { listRateProviderDefinitions } from '@/lib/rate-pipeline-config';
import { loadSeedRates } from '@/lib/rate-pipeline';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

function getProviderFilter() {
  const raw = process.argv.find((value) => value.startsWith('--provider='))?.split('=')[1];
  return raw?.toLowerCase() ?? null;
}

function isDryRun() {
  return process.argv.includes('--dry-run');
}

function jsonStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function summarizeDiffs(diffs: ReturnType<typeof diffRateProductMaterialFields>) {
  return diffs.map((diff) => ({
    field: diff.field,
    previous: diff.previous,
    next: diff.next,
  }));
}

async function getLatestApprovedSnapshots(productIds: string[]) {
  const client = createSupabaseAdminClient('staging');
  if (!client || !productIds.length) return new Map<string, { id: string; structured_payload: RateProduct }>();

  const { data, error } = await client
    .from('product_snapshots')
    .select('id, product_id, structured_payload, created_at')
    .in('product_id', productIds)
    .eq('review_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const latestByProductId = new Map<string, { id: string; structured_payload: RateProduct }>();
  for (const row of data ?? []) {
    const productId = row.product_id as string;
    if (!latestByProductId.has(productId)) {
      latestByProductId.set(productId, {
        id: row.id as string,
        structured_payload: row.structured_payload as RateProduct,
      });
    }
  }

  return latestByProductId;
}

async function getLatestAutomatedSignatures(productIds: string[]) {
  const client = createSupabaseAdminClient('staging');
  if (!client || !productIds.length) return new Map<string, string>();

  const { data, error } = await client
    .from('product_snapshots')
    .select('product_id, metadata, created_at')
    .in('product_id', productIds)
    .eq('source_mode', 'automated')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const latestByProductId = new Map<string, string>();
  for (const row of data ?? []) {
    const productId = row.product_id as string;
    if (!latestByProductId.has(productId)) {
      const metadata = (row.metadata as { material_signature?: string } | null) ?? null;
      if (metadata?.material_signature) {
        latestByProductId.set(productId, metadata.material_signature);
      }
    }
  }

  return latestByProductId;
}

async function getLatestCrawlRunsByUrl(definition: RateProviderDefinition) {
  const client = createSupabaseAdminClient('staging');
  if (!client) return new Map<string, { crawlRunId: string; startedAt: string | null }>();

  const { data: institutions, error: institutionError } = await client
    .from('institutions')
    .select('id')
    .eq('institution_slug', definition.institutionSlug)
    .limit(1);
  if (institutionError) throw institutionError;

  const institutionId = institutions?.[0]?.id as string | undefined;
  if (!institutionId) return new Map();

  const { data: sources, error: sourceError } = await client
    .from('institution_sources')
    .select('id, url')
    .eq('institution_id', institutionId)
    .eq('active', true);
  if (sourceError) throw sourceError;

  const crawlRunByUrl = new Map<string, { crawlRunId: string; startedAt: string | null }>();

  for (const source of sources ?? []) {
    const { data: runs, error: runError } = await client
      .from('crawl_runs')
      .select('id, started_at')
      .eq('institution_source_id', source.id as string)
      .eq('status', 'succeeded')
      .order('started_at', { ascending: false })
      .limit(1);
    if (runError) throw runError;

    const latestRun = runs?.[0];
    if (latestRun) {
      crawlRunByUrl.set(source.url as string, {
        crawlRunId: latestRun.id as string,
        startedAt: (latestRun.started_at as string | null) ?? null,
      });
    }
  }

  return crawlRunByUrl;
}

async function persistExtractedChanges(definition: RateProviderDefinition, seedRates: Map<string, RateProduct>) {
  const client = createSupabaseAdminClient('staging');
  if (!client) {
    throw new Error('Missing Supabase admin environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const localArtifacts = loadLatestLocalArtifacts(definition.institutionSlug, definition);
  if (!localArtifacts.length) {
    throw new Error(`No local crawl artifacts were found for ${definition.providerDisplayName}. Run rates:crawl first.`);
  }

  const latestRunsByUrl = await getLatestCrawlRunsByUrl(definition);
  const hydratedArtifacts = localArtifacts.map((artifact) => ({
    ...artifact,
    ...(latestRunsByUrl.get(artifact.sourceUrl) ?? {}),
  }));

  const candidates = extractAutomatedRateCandidates(definition.institutionSlug, hydratedArtifacts, seedRates);
  if (!candidates.length) {
    throw new Error(`No extractor output was produced for ${definition.providerDisplayName}.`);
  }

  const latestApprovedByProductId = await getLatestApprovedSnapshots(candidates.map((candidate) => candidate.productId));
  const latestAutomatedSignatureByProductId = await getLatestAutomatedSignatures(candidates.map((candidate) => candidate.productId));

  let persistedSnapshots = 0;
  let createdReviewItems = 0;

  for (const candidate of candidates) {
    const previousSnapshot = latestApprovedByProductId.get(candidate.productId);
    const previousRate = previousSnapshot?.structured_payload ?? seedRates.get(candidate.productId);
    if (!previousRate) continue;

    const diffs = diffRateProductMaterialFields(previousRate, candidate.structuredPayload);
    if (!diffs.length) {
      console.log(`No material changes for ${candidate.productId}; skipping review snapshot.`);
      continue;
    }

    const latestAutomatedSignature = latestAutomatedSignatureByProductId.get(candidate.productId);
    if (latestAutomatedSignature === candidate.materialSignature) {
      console.log(`Latest automated snapshot for ${candidate.productId} already matches the current extracted signature; skipping duplicate.`);
      continue;
    }

    const snapshotInsert = await client
      .from('product_snapshots')
      .insert({
        product_id: candidate.productId,
        crawl_run_id: hydratedArtifacts.find((artifact) => candidate.facts.some((fact) => fact.sourceUrl === artifact.sourceUrl))?.crawlRunId ?? null,
        source_mode: 'automated',
        review_status: 'pending_review',
        structured_payload: candidate.structuredPayload,
        raw_payload: candidate.rawPayload,
        raw_text: candidate.rawText,
        metadata: {
          parser_version: '2026-04-10-maya-v1',
          material_signature: candidate.materialSignature,
          source_urls: [...new Set(candidate.facts.map((fact) => fact.sourceUrl))],
        },
      })
      .select('id')
      .single();
    if (snapshotInsert.error) throw snapshotInsert.error;

    const snapshotId = snapshotInsert.data.id as string;

    const insertableFacts = candidate.facts.filter((fact) => fact.value !== null && fact.value !== undefined);

    const { error: factError } = await client.from('facts').insert(
      insertableFacts.map((fact) => ({
        product_snapshot_id: snapshotId,
        crawl_run_id: hydratedArtifacts.find((artifact) => artifact.sourceUrl === fact.sourceUrl)?.crawlRunId ?? null,
        fact_key: fact.factKey,
        value: fact.value,
        evidence_text: fact.evidenceText,
        source_url: fact.sourceUrl,
        confidence: fact.confidence,
        is_material: fact.isMaterial,
        review_status: 'pending_review',
      })),
    );
    if (factError) throw factError;

    const { data: changeEvent, error: changeEventError } = await client
      .from('change_events')
      .insert({
        product_id: candidate.productId,
        previous_snapshot_id: previousSnapshot?.id ?? null,
        new_snapshot_id: snapshotId,
        change_type: previousSnapshot ? 'material_field_change' : 'new_product',
        severity: getRateChangeSeverity(diffs),
        summary: formatRateDiffSummary(candidate.structuredPayload, diffs),
        diff: summarizeDiffs(diffs),
        review_status: 'pending_review',
      })
      .select('id')
      .single();
    if (changeEventError) throw changeEventError;

    const { error: reviewError } = await client.from('review_queue').insert({
      entity_type: 'change_event',
      entity_id: changeEvent.id as string,
      reason: formatRateDiffSummary(candidate.structuredPayload, diffs),
      status: 'queued',
      priority: getRateChangeSeverity(diffs) === 'high' ? 1 : 2,
      metadata: {
        product_id: candidate.productId,
        fields: diffs.map((diff) => diff.field),
      },
    });
    if (reviewError) throw reviewError;

    const { error: productError } = await client
      .from('products')
      .update({ review_status: 'pending_review' })
      .eq('id', candidate.productId);
    if (productError) throw productError;

    persistedSnapshots += 1;
    createdReviewItems += 1;
    console.log(`Queued review for ${candidate.productId}: ${diffs.map((diff) => diff.field).join(', ')}`);
  }

  console.log(`Persisted ${persistedSnapshots} pending automated snapshot(s) and ${createdReviewItems} review item(s) for ${definition.providerDisplayName}.`);
}

function runDryRun(definition: RateProviderDefinition, seedRates: Map<string, RateProduct>) {
  const localArtifacts = loadLatestLocalArtifacts(definition.institutionSlug, definition);
  if (!localArtifacts.length) {
    throw new Error(`No local crawl artifacts were found for ${definition.providerDisplayName}. Run rates:crawl first.`);
  }

  const candidates = extractAutomatedRateCandidates(definition.institutionSlug, localArtifacts, seedRates);
  if (!candidates.length) {
    throw new Error(`No extractor output was produced for ${definition.providerDisplayName}.`);
  }

  for (const candidate of candidates) {
    const previousRate = seedRates.get(candidate.productId);
    if (!previousRate) continue;

    const diffs = diffRateProductMaterialFields(previousRate, candidate.structuredPayload);
    if (!diffs.length) {
      console.log(`[dry-run] ${candidate.productId}: no material changes detected.`);
      continue;
    }

    console.log(`[dry-run] ${candidate.productId}`);
    console.log(`  ${candidate.summary}`);
    for (const diff of diffs) {
      console.log(`  - ${diff.field}`);
      console.log(`    previous: ${jsonStringify(diff.previous)}`);
      console.log(`    next: ${jsonStringify(diff.next)}`);
    }
  }
}

async function main() {
  const providerFilter = getProviderFilter();
  const dryRun = isDryRun();
  const supportedProviders = new Set(listSupportedRateExtractionProviders());
  const definitions = listRateProviderDefinitions().filter((definition) => {
    if (!supportedProviders.has(definition.institutionSlug)) return false;
    if (!providerFilter) return true;
    return definition.institutionSlug === providerFilter || definition.providerDisplayName.toLowerCase() === providerFilter;
  });

  if (!definitions.length) {
    throw new Error('No supported extractor matched the requested provider.');
  }

  const seedRates = new Map(loadSeedRates().map((rate) => [rate.id, rate]));

  for (const definition of definitions) {
    if (dryRun) {
      runDryRun(definition, seedRates);
    } else {
      await persistExtractedChanges(definition, seedRates);
    }
  }
}

main().catch((error) => {
  console.error('Rate extraction failed:', error);
  process.exit(1);
});
