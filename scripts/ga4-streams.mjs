/** Read-only: list all GA4 properties + their web stream measurement IDs. */
import { request as httpsRequest } from 'https';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function req(method, host, path, { body, form, token } = {}) {
  return new Promise((res, rej) => {
    const data = body ? (form ? new URLSearchParams(body).toString() : JSON.stringify(body)) : null;
    const h = {}; if (token) h.Authorization = `Bearer ${token}`;
    if (data) { h['Content-Type'] = form ? 'application/x-www-form-urlencoded' : 'application/json'; h['Content-Length'] = Buffer.byteLength(data); }
    const r = httpsRequest({ hostname: host, path, method, headers: h }, (x) => {
      let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => { try { res(JSON.parse(d)); } catch { res({ raw: d }); } });
    });
    r.on('error', rej); if (data) r.write(data); r.end();
  });
}
async function token(cacheName) {
  const creds = JSON.parse(readFileSync(join(ROOT, 'ga4-oauth-client.json'), 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const f = join(ROOT, cacheName);
  const c = JSON.parse(readFileSync(f, 'utf8'));
  if (c.expiry > Date.now() + 60_000) return c.access_token;
  const r = await req('POST', 'oauth2.googleapis.com', '/token', { form: true, body: { client_id, client_secret, refresh_token: c.refresh_token, grant_type: 'refresh_token' } });
  writeFileSync(f, JSON.stringify({ access_token: r.access_token, refresh_token: c.refresh_token, expiry: Date.now() + r.expires_in * 1000 }));
  return r.access_token;
}

let t;
try { t = await token('.ga4-token-edit-cache.json'); } catch { t = await token('.ga4-token-cache.json'); }

const summary = await req('GET', 'analyticsadmin.googleapis.com', '/v1beta/accountSummaries', { token: t });
if (summary.error) { console.error('ERROR:', summary.error.message); process.exit(1); }

for (const acc of summary.accountSummaries || []) {
  console.log(`\nAccount: ${acc.displayName}`);
  for (const p of acc.propertySummaries || []) {
    const pid = p.property.replace('properties/', '');
    const streams = await req('GET', 'analyticsadmin.googleapis.com', `/v1beta/properties/${pid}/dataStreams`, { token: t });
    const ids = (streams.dataStreams || [])
      .filter((s) => s.type === 'WEB_DATA_STREAM')
      .map((s) => `${s.webStreamData?.measurementId} (${s.displayName})`)
      .join(', ') || '(no web stream)';
    console.log(`  • ${p.displayName}  [property ${pid}]  →  ${ids}`);
  }
}
console.log('\nLooking for: G-VKNLYP2027 (the ID on production gotruva.com)');
