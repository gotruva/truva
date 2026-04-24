'use client';

import type { AffiliatePlacement, AffiliateTrackingPayload } from '@/types';

const IMPRESSION_ENDPOINT = '/api/affiliate-impressions';
const EXPAND_ENDPOINT = '/api/affiliate-provider-expands';

let pageViewState: { path: string; id: string } | null = null;
const sentImpressions = new Set<string>();
const sentExpands = new Set<string>();

function postEvent(endpoint: string, payload: Record<string, string>) {
  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((error) => {
    console.error(`[affiliate-analytics] Failed to post ${endpoint}:`, error);
  });
}

export function getPagePath() {
  return typeof window === 'undefined' ? '/' : window.location.pathname;
}

export function getPageViewId(pagePath = getPagePath()) {
  if (!pageViewState || pageViewState.path !== pagePath) {
    pageViewState = {
      path: pagePath,
      id: globalThis.crypto?.randomUUID?.() ?? `${pagePath}-${Date.now()}`,
    };
  }

  return pageViewState.id;
}

export function buildTrackedAffiliateHref(productId: string, placement: AffiliatePlacement) {
  const pagePath = getPagePath();
  const params = new URLSearchParams({
    page_path: pagePath,
    placement,
    page_view_id: getPageViewId(pagePath),
  });

  return `/go/${encodeURIComponent(productId)}?${params.toString()}`;
}

export function trackAffiliateImpression(payload: AffiliateTrackingPayload) {
  const pagePath = getPagePath();
  const pageViewId = getPageViewId(pagePath);
  const key = `${pageViewId}:${payload.productId}:${payload.placement}`;
  if (sentImpressions.has(key)) return;

  sentImpressions.add(key);
  postEvent(IMPRESSION_ENDPOINT, {
    product_id: payload.productId,
    provider: payload.provider,
    category: payload.category,
    page_path: pagePath,
    placement: payload.placement,
    page_view_id: pageViewId,
  });
}

export function trackAffiliateProviderExpanded(provider: string, placement: AffiliatePlacement) {
  const pagePath = getPagePath();
  const pageViewId = getPageViewId(pagePath);
  const key = `${pageViewId}:${provider}:${placement}`;
  if (sentExpands.has(key)) return;

  sentExpands.add(key);
  postEvent(EXPAND_ENDPOINT, {
    provider,
    page_path: pagePath,
    placement,
    page_view_id: pageViewId,
  });
}
