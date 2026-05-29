/**
 * Read-only Realtime watcher. Polls GA4 for cc_apply_click events (broken down
 * by card_key) and reports when a new one lands. Writes nothing.
 *
 *   node scripts/ga4-realtime-watch.mjs
 */

import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLIENT_FILE = join(ROOT, 'ga4-oauth-client.json');
const READ_CACHE = join(ROOT, '.ga4-token-cache.json');
const PROPERTY_ID = process.env.PROPERTY_ID || '532512485';

function httpJson(method, host, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (data) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(data); }
    const r = httpsRequest({ hostname: host, path, method, headers }, (res) => {
      let raw = ''; res.on('data', d => raw += d);
      res.on('end', () => { let j={}; try{j=raw?JSON.parse(raw):{};}catch{j={raw};} resolve({ status: res.statusCode, json: j }); });
    });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}
function postForm(host, path, params) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams(params).toString();
    const r = httpsRequest({ hostname: host, path, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data) } },
      (res) => { let raw=''; res.on('data',d=>raw+=d); res.on('end',()=>{try{resolve(JSON.parse(raw));}catch{reject(new Error(raw));}}); });
    r.on('error', reject); r.write(data); r.end();
  });
}
async function loadToken() {
  const creds = JSON.parse(readFileSync(CLIENT_FILE, 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const c = JSON.parse(readFileSync(READ_CACHE, 'utf8'));
  if (c.expiry > Date.now() + 60_000) return c.access_token;
  const r = await postForm('oauth2.googleapis.com', '/token', { client_id, client_secret, refresh_token: c.refresh_token, grant_type: 'refresh_token' });
  if (!r.access_token) throw new Error('refresh failed: ' + JSON.stringify(r));
  writeFileSync(READ_CACHE, JSON.stringify({ access_token: r.access_token, refresh_token: c.refresh_token, expiry: Date.now() + r.expires_in * 1000 }));
  return r.access_token;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function realtimeApplyClicks(token) {
  // Try with card_key breakdown; fall back to eventName-only if unsupported.
  let res = await httpJson('POST', 'analyticsdata.googleapis.com', `/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`, {
    token,
    body: {
      dimensions: [{ name: 'customEvent:card_key' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'cc_apply_click' } } },
    },
  });
  if (res.status !== 200) {
    res = await httpJson('POST', 'analyticsdata.googleapis.com', `/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`, {
      token,
      body: {
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'cc_apply_click' } } },
      },
    });
  }
  return res;
}

function summarize(rows) {
  let total = 0; const byCard = {};
  for (const r of rows || []) {
    const n = Number(r.metricValues?.[0]?.value || 0);
    total += n;
    const key = r.dimensionValues?.[0]?.value ?? '(n/a)';
    byCard[key] = (byCard[key] || 0) + n;
  }
  return { total, byCard };
}

async function main() {
  const token = await loadToken();
  const base = await realtimeApplyClicks(token);
  if (base.status !== 200) { console.error('Realtime query failed:', JSON.stringify(base.json)); process.exit(1); }
  const baseline = summarize(base.json.rows);
  console.log(`Baseline cc_apply_click in last 30 min: ${baseline.total}`);
  console.log('Watching for your click… (go click "Apply on bank site" on https://www.gotruva.com now)\n');

  const POLLS = 18, EVERY = 12000;
  for (let i = 1; i <= POLLS; i++) {
    await sleep(EVERY);
    const res = await realtimeApplyClicks(token);
    const now = summarize(res.json.rows);
    const delta = now.total - baseline.total;
    const line = `  poll ${String(i).padStart(2)}/${POLLS} — total=${now.total}` + (delta > 0 ? `  (+${delta} since baseline)` : '');
    console.log(line);
    if (delta > 0) {
      console.log('\n✓ NEW apply click detected in Realtime! Breakdown by card:');
      for (const [card, n] of Object.entries(now.byCard).sort((a,b)=>b[1]-a[1])) {
        const mark = (!baseline.byCard[card] || now.byCard[card] > baseline.byCard[card]) ? '  ← new' : '';
        console.log(`    ${card}: ${n}${mark}`);
      }
      console.log('\nThe pipeline works end-to-end: your click → GA4 → reportable by card.');
      return;
    }
  }
  console.log('\n• No new apply click seen in the watch window. Realtime can lag ~30–60s,');
  console.log('  or the click may not have registered. Current breakdown:');
  for (const [card, n] of Object.entries(baseline.byCard)) console.log(`    ${card}: ${n}`);
}
main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
