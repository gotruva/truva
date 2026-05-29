/** Read-only realtime diagnostic: active users + top events + cc_apply_click. */
import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PID = process.env.PROPERTY_ID || '532512485';

function req(host, path, { body, form, token } = {}) {
  return new Promise((res, rej) => {
    const data = body ? (form ? new URLSearchParams(body).toString() : JSON.stringify(body)) : null;
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
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
const rt = (t, body) => req('analyticsdata.googleapis.com', `/v1beta/properties/${PID}:runRealtimeReport`, { token: t, body });

const t = await token();

// 1. Active users right now
const users = await rt(t, { metrics: [{ name: 'activeUsers' }] });
const au = users.rows?.[0]?.metricValues?.[0]?.value ?? '0';
console.log(`Active users on site right now: ${au}`);

// 2. Top events in the last 30 min
const ev = await rt(t, { dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 25 });
console.log('\nTop events (last 30 min):');
if (!ev.rows?.length) console.log('  (no events in realtime — session may be blocked by an ad/privacy blocker, or no traffic)');
else for (const row of ev.rows) console.log(`  ${row.dimensionValues[0].value.padEnd(28)} ${row.metricValues[0].value}`);

// 3. cc_apply_click specifically
const apply = ev.rows?.find((r) => r.dimensionValues[0].value === 'cc_apply_click');
console.log(`\ncc_apply_click in realtime: ${apply ? apply.metricValues[0].value : 0}`);
