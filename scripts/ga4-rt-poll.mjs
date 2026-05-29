/** Read-only: poll realtime active users + cc_apply_click for ~75s. */
import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PID = process.env.PROPERTY_ID || '532512485';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
const rt = (t, body) => req('analyticsdata.googleapis.com', `/v1beta/properties/${PID}:runRealtimeReport`, { token: t, body });

const t = await token();
for (let i = 1; i <= 6; i++) {
  const u = await rt(t, { metrics: [{ name: 'activeUsers' }] });
  const au = Number(u.rows?.[0]?.metricValues?.[0]?.value ?? 0);
  const ev = await rt(t, { dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'cc_apply_click' } } } });
  const ac = Number(ev.rows?.[0]?.metricValues?.[0]?.value ?? 0);
  const allEv = await rt(t, { dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], limit: 1 });
  const anyEvents = (allEv.rows?.length ?? 0) > 0;
  console.log(`  check ${i}/6 — activeUsers=${au}  anyEvents=${anyEvents ? 'yes' : 'no'}  cc_apply_click=${ac}`);
  if (ac > 0 || au > 0 || anyEvents) {
    console.log(au > 0 || anyEvents ? '\n✓ Your session is being tracked!' : '');
    if (ac > 0) { console.log('✓ cc_apply_click landed in Realtime — pipeline confirmed end-to-end.'); break; }
  }
  if (i < 6) await sleep(13000);
}
console.log('\nDone polling.');
