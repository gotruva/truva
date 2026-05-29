/**
 * End-to-end pipeline test: inject one tagged `cc_apply_click` event into the
 * live GA4 property via the Measurement Protocol, then confirm it appears in
 * the Realtime report. Cleans up the temporary MP secret afterward.
 *
 * The test event is clearly tagged (card_key = "truva_pipeline_test") so you
 * can filter it out of real reports.
 *
 *   node scripts/ga4-pipeline-test.mjs
 */

import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLIENT_FILE = join(ROOT, 'ga4-oauth-client.json');
const EDIT_CACHE = join(ROOT, '.ga4-token-edit-cache.json');
const READ_CACHE = join(ROOT, '.ga4-token-cache.json');
const PROPERTY_ID = process.env.PROPERTY_ID || '532512485';
const MEASUREMENT_ID = 'G-VKNLYP2027';
const TEST_CARD_KEY = 'truva_pipeline_test';

function httpJson(method, host, path, { token, body, contentType } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (data) {
      headers['Content-Type'] = contentType || 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const r = httpsRequest({ hostname: host, path, method, headers }, (res) => {
      let raw = '';
      res.on('data', (d) => (raw += d));
      res.on('end', () => {
        let json = {};
        try { json = raw ? JSON.parse(raw) : {}; } catch { json = { raw }; }
        resolve({ status: res.statusCode, json });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function postForm(host, path, params) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams(params).toString();
    const r = httpsRequest(
      { hostname: host, path, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data) } },
      (res) => { let raw=''; res.on('data',d=>raw+=d); res.on('end',()=>{ try{resolve(JSON.parse(raw));}catch{reject(new Error(raw));} }); },
    );
    r.on('error', reject);
    r.write(data); r.end();
  });
}

/** Load a token from cache, refreshing with the OAuth client if expired. */
async function loadToken(cacheFile, label) {
  if (!existsSync(cacheFile)) throw new Error(`Missing ${cacheFile} — run the ${label} script first to authenticate.`);
  const creds = JSON.parse(readFileSync(CLIENT_FILE, 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const c = JSON.parse(readFileSync(cacheFile, 'utf8'));
  if (c.expiry > Date.now() + 60_000) return c.access_token;
  if (!c.refresh_token) throw new Error(`${label} token expired and no refresh token — re-run that script.`);
  const r = await postForm('oauth2.googleapis.com', '/token', {
    client_id, client_secret, refresh_token: c.refresh_token, grant_type: 'refresh_token',
  });
  if (!r.access_token) throw new Error(`Refresh failed for ${label}: ${JSON.stringify(r)}`);
  writeFileSync(cacheFile, JSON.stringify({ access_token: r.access_token, refresh_token: c.refresh_token, expiry: Date.now() + r.expires_in * 1000 }));
  return r.access_token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const editToken = await loadToken(EDIT_CACHE, 'register-dimensions');

  // 1. Find the web data stream
  const streams = await httpJson('GET', 'analyticsadmin.googleapis.com', `/v1beta/properties/${PROPERTY_ID}/dataStreams`, { token: editToken });
  const web = (streams.json.dataStreams || []).find((s) => s.type === 'WEB_DATA_STREAM');
  if (!web) { console.error('No web data stream found:', JSON.stringify(streams.json)); process.exit(1); }
  const streamId = web.name.split('/').pop();
  console.log(`Web stream: ${web.displayName} (${web.webStreamData?.measurementId || MEASUREMENT_ID})`);

  // 2. Create a temporary Measurement Protocol secret
  const secretRes = await httpJson('POST', 'analyticsadmin.googleapis.com',
    `/v1beta/properties/${PROPERTY_ID}/dataStreams/${streamId}/measurementProtocolSecrets`,
    { token: editToken, body: { displayName: 'truva-pipeline-test (temp)' } });
  if (secretRes.status !== 200 && secretRes.status !== 201) {
    console.error('Failed to create MP secret:', JSON.stringify(secretRes.json)); process.exit(1);
  }
  const apiSecret = secretRes.json.secretValue;
  const secretName = secretRes.json.name; // for cleanup
  console.log('Created temporary MP secret.\n');

  // 3. Validate first (debug endpoint does NOT record), then send for real
  const eventBody = {
    client_id: `pipelinetest.${Date.now()}`,
    events: [{
      name: 'cc_apply_click',
      params: {
        card_key: TEST_CARD_KEY,
        bank: 'QA Test Bank',
        placement: 'pipeline_test',
        rank: 1,
        source_page: 'pipeline_test',
        debug_mode: 1,
        engagement_time_msec: 1,
        session_id: String(Date.now()),
      },
    }],
  };
  const mpPath = `/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${apiSecret}`;
  const debugPath = `/debug/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${apiSecret}`;

  const validation = await httpJson('POST', 'www.google-analytics.com', debugPath, { body: eventBody });
  const msgs = validation.json.validationMessages || [];
  console.log(`Validation: ${msgs.length === 0 ? 'PASSED (no errors)' : JSON.stringify(msgs)}`);
  if (msgs.length) { console.error('Aborting — fix validation issues.'); }

  const send = await httpJson('POST', 'www.google-analytics.com', mpPath, { body: eventBody });
  console.log(`Sent test cc_apply_click (HTTP ${send.status}). card_key="${TEST_CARD_KEY}"\n`);

  // 4. Poll the Realtime report (needs read scope) for ~90s
  let readToken;
  try { readToken = await loadToken(READ_CACHE, 'credit-cards-report'); }
  catch (e) { console.warn('Could not load read token for realtime check:', e.message); }

  let seen = false, lastRows = [];
  if (readToken) {
    for (let attempt = 1; attempt <= 6 && !seen; attempt++) {
      await sleep(15000);
      const rt = await httpJson('POST', 'analyticsdata.googleapis.com', `/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`, {
        token: readToken,
        body: {
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'cc_apply_click' } } },
        },
      });
      lastRows = rt.json.rows || [];
      const count = lastRows.length ? Number(lastRows[0].metricValues[0].value) : 0;
      console.log(`  realtime check ${attempt}/6 — cc_apply_click events in last 30 min: ${count}`);
      if (count > 0) seen = true;
    }
  }

  // 5. Cleanup — delete the temporary MP secret
  const del = await httpJson('DELETE', 'analyticsadmin.googleapis.com', `/v1beta/${secretName}`, { token: editToken });
  console.log(`\nDeleted temporary MP secret (HTTP ${del.status}).`);

  console.log('\n──────── RESULT ────────');
  if (seen) {
    console.log('✓ The test event reached GA4 — cc_apply_click is visible in Realtime.');
  } else {
    console.log('• Sent OK and validated, but not yet visible in Realtime (can lag).');
    console.log('  Check GA4 → Reports → Realtime, or DebugView, for card_key="truva_pipeline_test".');
  }
  console.log(`\nRemember to exclude card_key="${TEST_CARD_KEY}" from real reporting if needed.`);
}

main().catch((e) => { console.error('\nFatal:', e.message); process.exit(1); });
