import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

import dotenv from 'dotenv';

import { ensureDirectory } from '@/lib/rate-pipeline';
import { listRateProviderDefinitions } from '@/lib/rate-pipeline-config';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

function getProviderFilter() {
  const raw = process.argv.find((value) => value.startsWith('--provider='))?.split('=')[1];
  return raw?.toLowerCase() ?? null;
}

function getArtifactExtension(url: string, contentType: string | null) {
  if (contentType?.includes('pdf') || url.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'html';
}

async function main() {
  const providerFilter = getProviderFilter();
  const definitions = listRateProviderDefinitions().filter((definition) => {
    if (definition.automationPhase !== 'phase1_digital') return false;
    if (!providerFilter) return true;
    return definition.institutionSlug === providerFilter || definition.providerDisplayName.toLowerCase() === providerFilter;
  });

  if (!definitions.length) {
    throw new Error('No phase1 digital-bank provider matched the requested filter.');
  }

  const stagingClient = createSupabaseAdminClient('staging');
  const sourceRows = stagingClient
    ? (await stagingClient
        .from('institution_sources')
        .select('id, url')
        .then(({ data, error }) => {
          if (error) throw error;
          return data ?? [];
        }))
    : [];
  const sourceIdByUrl = new Map(sourceRows.map((row) => [row.url as string, row.id as string]));

  let successCount = 0;

  for (const definition of definitions) {
    for (const source of definition.sources) {
      const runStartedAt = new Date().toISOString();
      const artifactDir = path.join(
        process.cwd(),
        'artifacts',
        'rate-crawls',
        definition.institutionSlug,
        runStartedAt.replace(/[:.]/g, '-'),
      );
      ensureDirectory(artifactDir);

      const crawlRunId = stagingClient
        ? (await stagingClient
            .from('crawl_runs')
            .insert({
              institution_source_id: sourceIdByUrl.get(source.url) ?? null,
              status: 'running',
              started_at: runStartedAt,
              metadata: {
                institution_slug: definition.institutionSlug,
                source_kind: source.kind,
                parse_strategy: source.parseStrategy,
              },
            })
            .select('id')
            .single()
            .then(({ data, error }) => {
              if (error) throw error;
              return data.id as string;
            }))
        : null;

      try {
        const previousHash = stagingClient && sourceIdByUrl.get(source.url)
          ? (await stagingClient
              .from('crawl_runs')
              .select('content_hash')
              .eq('institution_source_id', sourceIdByUrl.get(source.url)!)
              .eq('status', 'succeeded')
              .order('started_at', { ascending: false })
              .limit(1)
              .maybeSingle()
              .then(({ data, error }) => {
                if (error) throw error;
                return (data?.content_hash as string | undefined) ?? null;
              }))
          : null;

        const response = await fetch(source.url, {
          headers: {
            'user-agent': 'TruvaRatePipeline/1.0 (+https://www.gotruva.com)',
          },
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentHash = createHash('sha256').update(buffer).digest('hex');
        const extension = getArtifactExtension(source.url, response.headers.get('content-type'));
        const artifactPath = path.join(artifactDir, `${source.kind}.${extension}`);
        fs.writeFileSync(artifactPath, buffer);

        if (stagingClient && crawlRunId) {
          const { error: updateError } = await stagingClient
            .from('crawl_runs')
            .update({
              status: response.ok ? 'succeeded' : 'failed',
              http_status: response.status,
              content_hash: contentHash,
              artifact_path: artifactPath,
              finished_at: new Date().toISOString(),
              error_message: response.ok ? null : `Fetch failed with HTTP ${response.status}`,
            })
            .eq('id', crawlRunId);

          if (updateError) throw updateError;

          if (response.ok && previousHash && previousHash !== contentHash) {
            const { error: reviewError } = await stagingClient.from('review_queue').insert({
              entity_type: 'crawl_run',
              entity_id: crawlRunId,
              reason: `Source content hash changed for ${definition.providerDisplayName}: ${source.url}`,
              status: 'queued',
              priority: 2,
              metadata: {
                previous_hash: previousHash,
                current_hash: contentHash,
              },
            });

            if (reviewError) throw reviewError;
          }
        }

        if (!response.ok) {
          throw new Error(`Fetch failed with HTTP ${response.status} for ${source.url}`);
        }

        successCount += 1;
        console.log(`Fetched ${source.url}`);
      } catch (error) {
        if (stagingClient && crawlRunId) {
          await stagingClient
            .from('crawl_runs')
            .update({
              status: 'failed',
              finished_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : String(error),
            })
            .eq('id', crawlRunId);
        }

        console.error(`Failed to fetch ${source.url}:`, error);
      }
    }
  }

  if (!successCount) {
    throw new Error('No provider source fetched successfully.');
  }

  console.log(`Fetched ${successCount} official source artifact(s).`);
}

main().catch((error) => {
  console.error('Rate crawl failed:', error);
  process.exit(1);
});

