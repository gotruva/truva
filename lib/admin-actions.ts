'use server';

import { getAdminClient } from '@/lib/supabase-admin-server';
import { revalidatePath } from 'next/cache';
import { rollbackToSnapshot } from '@/lib/rate-review';

const RATE_SURFACE_PATHS = ['/', '/banking', '/banking/rates', '/calculator', '/api/rates'];

export async function toggleProductPublish(productId: string, field: string, value: boolean) {
  const supabase = getAdminClient('staging');

  // We are toggling `active_public` on the staging.products table.
  if (field !== 'active_public') {
    throw new Error('Only active_public can be toggled via this action.');
  }

  const { error } = await supabase
    .from('products')
    .update({ active_public: value })
    .eq('id', productId);

  if (error) {
    throw new Error(`Failed to update ${productId}: ${error.message}`);
  }

  revalidatePath('/admin/rates/catalog');
  // It's up to the user to sync staging -> production after toggle via the Review Queue page publish button.
  // We can optionally revalidate the review queue as well.
  revalidatePath('/admin/rates/review');
}

export async function saveManualRateEdit(productId: string, payload: Record<string, unknown>, autoApprove: boolean = false) {
  const supabase = getAdminClient('staging');

  // Insert the new product_snapshot
  const { data: snapshotData, error: snapshotError } = await supabase
    .from('product_snapshots')
    .insert({
      product_id: productId,
      source_mode: 'manual_annual',
      structured_payload: payload,
      review_status: autoApprove ? 'approved' : 'pending_review',
      approved_at: autoApprove ? new Date().toISOString() : null,
      captured_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (snapshotError) throw new Error(`Failed to save manual snapshot: ${snapshotError.message}`);

  // Insert into review_queue
  const { error: queueError } = await supabase.from('review_queue').insert({
    entity_type: 'product_snapshot',
    entity_id: snapshotData.id,
    reason: 'Manual edit submitted from Admin Dashboard.',
    status: autoApprove ? 'approved' : 'queued',
    priority: 1,
    resolved_at: autoApprove ? new Date().toISOString() : null,
  });

  if (queueError) throw new Error(`Failed to queue review: ${queueError.message}`);

  // Sync products table
  await supabase
    .from('products')
    .update({
      review_status: autoApprove ? 'approved' : 'pending_review',
      active_public: autoApprove ? true : undefined, // only turn active if approving, else leave as is
    })
    .eq('id', productId);

  revalidatePath('/admin/rates/catalog');
  revalidatePath('/admin/rates/review');
}

export async function saveMMFMetadata(fundId: string, payload: Record<string, unknown>) {
  const supabase = getAdminClient('public');
  
  const { error } = await supabase
    .from('money_market_funds')
    .update(payload)
    .eq('id', fundId);

  if (error) {
    throw new Error(`Failed to update MMF metadata: ${error.message}`);
  }

  revalidatePath('/admin/mmf');
  revalidatePath('/banking/money-market-funds');
}

export async function rollbackSnapshot(snapshotId: string) {
  await rollbackToSnapshot(snapshotId);
  
  // Revalidate public surfaces
  for (const path of RATE_SURFACE_PATHS) {
    revalidatePath(path);
  }
  revalidatePath('/admin/snapshots');
  revalidatePath('/admin/rates/review');
}

export async function upsertMMFDailyRate(fundId: string, payload: Record<string, any>) {
  const supabase = getAdminClient('public');
  
  const { error } = await supabase
    .from('mmf_daily_rates')
    .upsert({
      fund_id: fundId,
      ...payload,
      data_source: 'manual',
      scraped_at: new Date().toISOString()
    }, { onConflict: 'fund_id,date' });

  if (error) {
    throw new Error(`Failed to save manual MMF rate: ${error.message}`);
  }

  revalidatePath('/admin/mmf');
  revalidatePath('/banking/money-market-funds');
}

export async function copyLastMMFRate(fundId: string, targetDate: string) {
  const supabase = getAdminClient('public');
  
  const { data: lastRate, error: fetchError } = await supabase
    .from('mmf_daily_rates')
    .select('*')
    .eq('fund_id', fundId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !lastRate) throw new Error('Could not find a previous rate to copy.');

  const { error } = await supabase
    .from('mmf_daily_rates')
    .upsert({
      fund_id: fundId,
      date: targetDate,
      navpu: lastRate.navpu,
      gross_yield_1y: lastRate.gross_yield_1y,
      after_tax_yield: lastRate.after_tax_yield,
      net_yield: lastRate.net_yield,
      data_source: 'manual_verification',
      scraped_at: new Date().toISOString()
    }, { onConflict: 'fund_id,date' });

  if (error) throw new Error(`Failed to copy rate: ${error.message}`);

  revalidatePath('/admin/mmf');
  revalidatePath('/banking/money-market-funds');
}

