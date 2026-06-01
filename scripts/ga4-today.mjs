/** Read-only: today's overall GA4 activity (users + top events). */
import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PID = process.env.PROPERTY_ID || '532512485';

function req(host, path, { body, form, token } = {}) {
  return new Promise((res, rej) => {
    const data = body ? (form ? new URLSearchParams(body).toString() : JSON.stringify(body)) : null;
    const h = {}; if (token) h.Authorization = `Bearer ${token}`;
    if (data) { h['Content-Type'] = form ? 'application/x-www-form-urlencoded' : 'application/json'; h['Content-Length'] = Buffer.byteLength(data); }
    const r = httpsRequest({ hostname: host, path, method: 'POST', headers: h }, (x) => {
      let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => { try { res(JSON.parse(d)); } catch { res({ raw: d }); } });
    });
    r.on('error', rej); if (data) r.write(data); r.end();
  });
}
async function token() {
  const creds = JSON.parse(readFileSync(join(ROOT, 'ga4-oauth-client.json'), 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const f = join(ROOT, '.ga4-token-cache.json');
  const c = JSON.parse(readFileSync(f, 'utf8'));
  if (c.expiry > Date.now() + 60_000) return c.access_token;
  const r = await req('oauth2.googleapis.com', '/token', { form: true, body: { client_id, client_secret, refresh_token: c.refresh_token, grant_type: 'refresh_token' } });
  writeFileSync(f, JSON.stringify({ access_token: r.access_token, refresh_token: c.refresh_token, expiry: Date.now() + r.expires_in * 1000 }));
  return r.access_token;
}
const report = (t, body) => req('analyticsdata.googleapis.com', `/v1beta/properties/${PID}:runReport`, { token: t, body });

const t = await token();
for (const range of [{ l: 'TODAY', s: 'today', e: 'today' }, { l: 'YESTERDAY', s: 'yesterday', e: 'yesterday' }, { l: 'LAST 3 DAYS', s: '3daysAgo', e: 'today' }]) {
  const r = await report(t, {
    dateRanges: [{ startDate: range.s, endDate: range.e }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 12,
  });
  console.log(`\n=== ${range.l} ===`);
  if (r.error) { console.log('  ERROR:', r.error.message); continue; }
  if (!r.rows?.length) { console.log('  (no events recorded)'); continue; }
  for (const row of r.rows) console.log(`  ${row.dimensionValues[0].value.padEnd(26)} events=${row.metricValues[0].value}  users=${row.metricValues[1].value}`);
}
