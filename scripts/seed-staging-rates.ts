import dotenv from 'dotenv';

import { buildSeedFacts, loadSeedRates } from '@/lib/rate-pipeline';
import {
  getRateProviderDefinition,
  getSeedProductClassification,
  listRateProviderDefinitions,
} from '@/lib/rate-pipeline-config';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function resetStagingSchema() {
  const client = createSupabaseAdminClient('staging');
  if (!client) throw new Error('Missing Supabase admin environment variables.');

  await client.from('published_snapshots').delete().not('id', 'is', null);
  await client.from('review_queue').delete().not('id', 'is', null);
  await client.from('change_events').delete().not('id', 'is', null);
  await client.from('facts').delete().not('id', 'is', null);
  await client.from('product_snapshots').delete().not('id', 'is', null);
  await client.from('crawl_runs').delete().not('id', 'is', null);
  await client.from('products').delete().not('id', 'is', null);
  await client.from('institution_sources').delete().not('id', 'is', null);
  await client.from('institutions').delete().not('id', 'is', null);
}

async function main() {
  const shouldReset = process.argv.includes('--reset');
  const client = createSupabaseAdminClient('staging');
  if (!client) {
    throw new Error('Missing Supabase admin environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (shouldReset) {
    console.log('Resetting staging schema tables...');
    await resetStagingSchema();
  }

  const rates = loadSeedRates();
  const now = new Date().toISOString();
  const providerDefinitions = listRateProviderDefinitions();

  const institutionRows = providerDefinitions.map((definition) => ({
    institution_slug: definition.institutionSlug,
    provider_display_name: definition.providerDisplayName,
    legal_name: definition.legalName,
    official_domain: definition.officialDomain,
    license_type: definition.licenseType,
    market_label: definition.marketLabel,
    source_mode: definition.defaultSourceMode,
    publish_allowed: definition.publishAllowed,
    review_status: 'approved',
    active: true,
    metadata: {
      notes: definition.notes ?? null,
      automation_phase: definition.automationPhase,
    },
  }));

  const { data: institutions, error: institutionsError } = await client
    .from('institutions')
    .upsert(institutionRows, { onConflict: 'institution_slug' })
    .select('id, institution_slug');

  if (institutionsError) throw institutionsError;
  const institutionIdBySlug = new Map((institutions ?? []).map((row) => [row.institution_slug as string, row.id as string]));

  const sourceRows = providerDefinitions.flatMap((definition) => {
    const institutionId = institutionIdBySlug.get(definition.institutionSlug);
    if (!institutionId) return [];

    return definition.sources.map((source) => ({
      institution_id: institutionId,
      source_kind: source.kind,
      url: source.url,
      parse_strategy: source.parseStrategy,
      official: true,
      active: true,
      notes: source.notes ?? null,
      metadata: {
        provider_display_name: definition.providerDisplayName,
      },
    }));
  });

  if (sourceRows.length) {
    const { error: sourceError } = await client
      .from('institution_sources')
      .upsert(sourceRows, { onConflict: 'institution_id,url' });

    if (sourceError) throw sourceError;
  }

  const productRows = rates.map((rate, index) => {
    const providerDefinition = getRateProviderDefinition(rate.provider);
    const classification = getSeedProductClassification(rate);
    const institutionId = institutionIdBySlug.get(classification.institutionSlug);

    if (!institutionId) {
      throw new Error(`No staging institution found for provider ${rate.provider}`);
    }

    return {
      id: rate.id,
      institution_id: institutionId,
      provider_display_name: rate.provider,
      product_name: rate.name,
      public_category: rate.category,
      product_type: classification.productType,
      source_mode: classification.sourceMode,
      automation_phase: classification.automationPhase,
      publish_allowed: classification.publishAllowed,
      review_status: classification.reviewStatus,
      active_public: classification.keepInPublishedSnapshot,
      seed_position: index,
      seed_payload: rate,
      metadata: {
        official_domain: providerDefinition.officialDomain,
      },
    };
  });

  const { error: productError } = await client
    .from('products')
    .upsert(productRows, { onConflict: 'id' });

  if (productError) throw productError;

  const snapshotRows = rates.map((rate) => {
    const classification = getSeedProductClassification(rate);
    return {
      product_id: rate.id,
      source_mode: classification.sourceMode,
      review_status: classification.reviewStatus,
      structured_payload: rate,
      raw_payload: rate,
      raw_text: JSON.stringify(rate),
      approved_at: classification.reviewStatus === 'approved' ? now : null,
      captured_at: now,
      metadata: {
        imported_from: 'data/rates.json',
      },
    };
  });

  const { data: snapshots, error: snapshotError } = await client
    .from('product_snapshots')
    .insert(snapshotRows)
    .select('id, product_id');

  if (snapshotError) throw snapshotError;

  const snapshotIdByProductId = new Map((snapshots ?? []).map((row) => [row.product_id as string, row.id as string]));
  const factRows = rates.flatMap((rate) => {
    const snapshotId = snapshotIdByProductId.get(rate.id);
    if (!snapshotId) return [];

    return buildSeedFacts(rate).map((fact) => ({
      product_snapshot_id: snapshotId,
      fact_key: fact.factKey,
      value: fact.value,
      evidence_text: fact.evidenceText,
      source_url: fact.sourceUrl,
      confidence: fact.confidence,
      is_material: fact.isMaterial,
      review_status: 'approved',
    }));
  });

  if (factRows.length) {
    const { error: factError } = await client.from('facts').insert(factRows);
    if (factError) throw factError;
  }

  console.log(`Seeded ${institutionRows.length} institutions, ${productRows.length} products, and ${snapshotRows.length} product snapshots into staging.`);
}

main().catch((error) => {
  console.error('Staging seed failed:', error);
  process.exit(1);
});

