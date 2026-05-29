/**
 * GA4 Credit Card Feature Report
 * Uses your own OAuth2 Desktop client — no "app blocked" errors.
 *
 * Setup (one-time):
 *   1. Enable Google Analytics Data API in Cloud Console
 *   2. Create OAuth 2.0 Desktop credentials → download JSON → save as ga4-oauth-client.json in project root
 *   3. node scripts/ga4-credit-cards-report.mjs
 */

import { createServer } from 'http';
import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLIENT_FILE = join(ROOT, 'ga4-oauth-client.json');
const TOKEN_CACHE = join(ROOT, '.ga4-token-cache.json');
const SCOPES = 'https://www.googleapis.com/auth/analytics.readonly';

// ── helpers ─────────────────────────────────────────────────────────────────

function post(hostname, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const req = httpsRequest(opts, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error(raw)); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function postForm(hostname, path, params) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams(params).toString();
    const opts = {
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = httpsRequest(opts, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error(raw)); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(hostname, path, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = httpsRequest(opts, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error(raw)); } });
    });
    req.on('error', reject);
    req.end();
  });
}

function ga4Report(propertyId, body, token) {
  return post('analyticsdata.googleapis.com', `/v1beta/properties/${propertyId}:runReport`, body, {
    Authorization: `Bearer ${token}`,
  });
}

// ── auth ─────────────────────────────────────────────────────────────────────

async function getToken(clientId, clientSecret) {
  // Return cached token if still valid
  if (existsSync(TOKEN_CACHE)) {
    const cached = JSON.parse(readFileSync(TOKEN_CACHE, 'utf8'));
    if (cached.expiry > Date.now() + 60_000) return cached.access_token;
    // Refresh
    if (cached.refresh_token) {
      const r = await postForm('oauth2.googleapis.com', '/token', {
        client_id: clientId, client_secret: clientSecret,
        refresh_token: cached.refresh_token, grant_type: 'refresh_token',
      });
      if (r.access_token) {
        writeFileSync(TOKEN_CACHE, JSON.stringify({
          access_token: r.access_token,
          refresh_token: cached.refresh_token,
          expiry: Date.now() + r.expires_in * 1000,
        }));
        return r.access_token;
      }
    }
  }

  // Full OAuth2 flow via loopback
  const PORT = 9004;
  const redirectUri = `http://localhost:${PORT}`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri,
    response_type: 'code', scope: SCOPES, access_type: 'offline', prompt: 'consent',
  });

  console.log('\nOpening your browser for GA4 access…');
  try { execSync(`open "${authUrl}"`); } catch { console.log('Visit this URL:\n', authUrl); }

  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><h2>Authenticated! You can close this tab.</h2></body></html>');
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const code = url.searchParams.get('code');
      server.close();
      if (code) resolve(code); else reject(new Error('No code returned'));
    });
    server.listen(PORT);
    console.log(`Waiting for browser auth on port ${PORT}…`);
  });

  const tokens = await postForm('oauth2.googleapis.com', '/token', {
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirectUri, grant_type: 'authorization_code',
  });

  if (!tokens.access_token) throw new Error('Token exchange failed: ' + JSON.stringify(tokens));
  writeFileSync(TOKEN_CACHE, JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry: Date.now() + tokens.expires_in * 1000,
  }));
  return tokens.access_token;
}

// ── report helpers ────────────────────────────────────────────────────────────

function table(rows, dimHeaders, metHeaders) {
  if (!rows?.length) return '  (no data)\n';
  const cols = [...dimHeaders, ...metHeaders];
  const data = rows.map(r => [
    ...(r.dimensionValues || []).map(v => v.value),
    ...(r.metricValues || []).map(v => Number(v.value).toLocaleString()),
  ]);
  const widths = cols.map((h, i) => Math.max(h.length, ...data.map(r => (r[i] || '').length)));
  const line = widths.map(w => '-'.repeat(w)).join('-+-');
  const row = r => r.map((v, i) => v.padEnd(widths[i])).join(' | ');
  return ['', row(cols), line, ...data.map(row), ''].join('\n  ');
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(CLIENT_FILE)) {
    console.error(`\nMissing: ${CLIENT_FILE}`);
    console.error('Download OAuth 2.0 Desktop credentials from Google Cloud Console and save as ga4-oauth-client.json in the project root.\n');
    process.exit(1);
  }

  const creds = JSON.parse(readFileSync(CLIENT_FILE, 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;

  const token = await getToken(client_id, client_secret);
  console.log('Authenticated.\n');

  // Discover property
  let propertyId = process.env.PROPERTY_ID;
  if (!propertyId) {
    const summary = await get('analyticsadmin.googleapis.com', '/v1beta/accountSummaries', token);
    if (summary.error) throw new Error('Admin API error: ' + summary.error.message);
    for (const acc of summary.accountSummaries || []) {
      for (const p of acc.propertySummaries || []) {
        if (p.displayName?.toLowerCase().includes('truva')) {
          propertyId = p.property.replace('properties/', '');
          console.log(`Property: ${p.displayName} (ID: ${propertyId})\n`);
        }
      }
    }
    if (!propertyId) {
      console.log('Available properties:');
      for (const acc of summary.accountSummaries || [])
        for (const p of acc.propertySummaries || [])
          console.log(`  ${p.displayName} → ${p.property}`);
      console.error('\nSet PROPERTY_ID=<numeric-id> and re-run.');
      process.exit(1);
    }
  }

  const ccFilter = { filter: { fieldName: 'eventName', stringFilter: { matchType: 'BEGINS_WITH', value: 'cc_' } } };
  const exact = v => ({ filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: v } } });
  const orGroup = (...vals) => ({ orGroup: { expressions: vals.map(exact) } });

  console.log('════════════════════════════════════════════════════════════');
  console.log(' TRUVA — CREDIT CARD FEATURE  |  GA4 REPORT  |  Last 30 days');
  console.log('════════════════════════════════════════════════════════════\n');

  // 1. All cc_ events
  console.log('1.  ALL cc_* EVENTS');
  const r1 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: ccFilter,
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 30,
  }, token);
  process.stdout.write(table(r1.rows, ['Event'], ['Fires', 'Users']));

  // 2. Funnel
  console.log('\n2.  FUNNEL — started → completed → applied');
  const r2 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: orGroup('cc_finder_started', 'cc_finder_completed', 'cc_results_viewed', 'cc_no_match_viewed', 'cc_apply_click'),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 10,
  }, token);
  process.stdout.write(table(r2.rows, ['Stage'], ['Events', 'Users']));

  // 3. Finder step drop-off
  console.log('\n3.  FINDER STEP DROP-OFF');
  const r3 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }, { name: 'customEvent:step' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: exact('cc_finder_step_completed'),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20,
  }, token);
  process.stdout.write(table(r3.rows, ['Event', 'Step'], ['Count']));

  // 4. Apply clicks by card
  console.log('\n4.  APPLY CLICKS BY CARD');
  const r4 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'customEvent:card_key' }, { name: 'customEvent:bank' }, { name: 'customEvent:placement' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: exact('cc_apply_click'),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20,
  }, token);
  process.stdout.write(table(r4.rows, ['Card', 'Bank', 'Placement'], ['Clicks']));

  // 5. Card detail views
  console.log('\n5.  CARD DETAIL PAGE VIEWS');
  const r5 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'customEvent:card_key' }, { name: 'customEvent:bank' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: exact('cc_detail_viewed'),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20,
  }, token);
  process.stdout.write(table(r5.rows, ['Card', 'Bank'], ['Views']));

  // 6. 14-day daily trend
  console.log('\n6.  DAILY TREND — last 14 days (started / completed / applied)');
  const r6 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }, { name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: orGroup('cc_finder_started', 'cc_finder_completed', 'cc_apply_click'),
    orderBys: [{ dimension: { dimensionName: 'date' } }, { dimension: { dimensionName: 'eventName' } }],
    limit: 90,
  }, token);
  process.stdout.write(table(r6.rows, ['Date', 'Event'], ['Count']));

  // 7. Device breakdown
  console.log('\n7.  DEVICE & OS BREAKDOWN');
  const r7 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }, { name: 'operatingSystem' }],
    metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
    dimensionFilter: ccFilter,
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10,
  }, token);
  process.stdout.write(table(r7.rows, ['Device', 'OS'], ['Users', 'Events']));

  // 8. Result match vs no-match
  console.log('\n8.  RESULTS — MATCH vs NO-MATCH');
  const r8 = await ga4Report(propertyId, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: orGroup('cc_results_viewed', 'cc_no_match_viewed'),
    limit: 5,
  }, token);
  process.stdout.write(table(r8.rows, ['Outcome'], ['Events', 'Users']));

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(' END OF REPORT');
  console.log('════════════════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('\nFatal:', err.message); process.exit(1); });
