/**
 * Register GA4 event-scoped custom dimensions so the parameters Truva sends
 * become queryable in standard reports.
 *
 * Idempotent + additive: it lists existing dimensions and only creates the
 * missing ones. It never edits or deletes anything.
 *
 * Needs WRITE scope (analytics.edit), so the first run re-prompts in the browser.
 * Uses the same ga4-oauth-client.json you already created.
 *
 *   node scripts/ga4-register-dimensions.mjs
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
const TOKEN_CACHE = join(ROOT, '.ga4-token-edit-cache.json'); // separate cache (write scope)
const SCOPE = 'https://www.googleapis.com/auth/analytics.edit';
const ADMIN_HOST = 'analyticsadmin.googleapis.com';

// ── Event-scoped custom dimensions to ensure exist ────────────────────────────
// parameterName must match the event param key exactly.
const DIMENSIONS = [
  // Credit-card finder funnel
  ['step', 'Finder Step'],
  ['question_id', 'Finder Question'],
  ['answer_value', 'Finder Answer'],
  ['skipped', 'Finder Step Skipped'],
  ['first_card', 'First Card'],
  ['income_band', 'Income Band'],
  ['spend', 'Spend Profile'],
  ['priority', 'Card Priority'],
  ['avoid', 'Card Avoid'],
  // Credit-card results + apply
  ['card_key', 'Card Key'],
  ['bank', 'Bank'],
  ['placement', 'Placement'],
  ['rank', 'Result Rank'],
  ['result_role', 'Result Role'],
  ['source_page', 'Source Page'],
  ['top_card_key', 'Top Card Key'],
  ['top_bank', 'Top Bank'],
  ['result_count', 'Result Count'],
  // Credit-card browse / catalog
  ['pill', 'Browse Filter Pill'],
  ['filter_type', 'Browse Filter Type'],
  ['filter_value', 'Browse Filter Value'],
  ['sort_mode', 'Browse Sort Mode'],
  ['method', 'Clear Method'],
  ['query_length', 'Search Length'],
  ['direction', 'Carousel Direction'],
  ['action', 'Compare Action'],
  ['count', 'Compare Count'],
  // Cross-cutting (savings, MMF, content, nav)
  ['category', 'Category'],
  ['to_theme', 'Theme'],
  ['tab', 'Tab'],
  ['filter', 'Filter'],
  ['months', 'Months'],
  ['feedback_type', 'Feedback Type'],
];

// ── tiny https helpers ────────────────────────────────────────────────────────
function req(method, host, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const r = httpsRequest({ hostname: host, path, method, headers }, (res) => {
      let raw = '';
      res.on('data', (d) => (raw += d));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: raw ? JSON.parse(raw) : {} });
        } catch {
          resolve({ status: res.statusCode, json: { raw } });
        }
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
      {
        hostname: host,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (d) => (raw += d));
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            reject(new Error(raw));
          }
        });
      },
    );
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

// ── OAuth (loopback) ──────────────────────────────────────────────────────────
async function getToken(clientId, clientSecret) {
  if (existsSync(TOKEN_CACHE)) {
    const c = JSON.parse(readFileSync(TOKEN_CACHE, 'utf8'));
    if (c.expiry > Date.now() + 60_000) return c.access_token;
    if (c.refresh_token) {
      const r = await postForm('oauth2.googleapis.com', '/token', {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: c.refresh_token,
        grant_type: 'refresh_token',
      });
      if (r.access_token) {
        writeFileSync(
          TOKEN_CACHE,
          JSON.stringify({
            access_token: r.access_token,
            refresh_token: c.refresh_token,
            expiry: Date.now() + r.expires_in * 1000,
          }),
        );
        return r.access_token;
      }
    }
  }

  const PORT = 9005;
  const redirectUri = `http://localhost:${PORT}`;
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    });

  console.log('\nOpening your browser to grant GA4 *edit* access…');
  console.log('(If you see an "unverified app" screen, click Advanced → Go to … — it is your own OAuth app.)\n');
  try {
    execSync(`open "${authUrl}"`);
  } catch {
    console.log('Visit:\n', authUrl);
  }

  const code = await new Promise((resolve, reject) => {
    const server = createServer((rq, rs) => {
      rs.writeHead(200, { 'Content-Type': 'text/html' });
      rs.end('<h2>Authenticated — you can close this tab.</h2>');
      const u = new URL(rq.url, redirectUri);
      const c = u.searchParams.get('code');
      server.close();
      c ? resolve(c) : reject(new Error('No code returned'));
    });
    server.listen(PORT);
    console.log(`Waiting for browser auth on port ${PORT}…`);
  });

  const tok = await postForm('oauth2.googleapis.com', '/token', {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  if (!tok.access_token) throw new Error('Token exchange failed: ' + JSON.stringify(tok));
  writeFileSync(
    TOKEN_CACHE,
    JSON.stringify({
      access_token: tok.access_token,
      refresh_token: tok.refresh_token,
      expiry: Date.now() + tok.expires_in * 1000,
    }),
  );
  return tok.access_token;
}

async function discoverProperty(token) {
  if (process.env.PROPERTY_ID) return process.env.PROPERTY_ID;
  const { json } = await req('GET', ADMIN_HOST, '/v1beta/accountSummaries', { token });
  for (const acc of json.accountSummaries || []) {
    for (const p of acc.propertySummaries || []) {
      if (p.displayName?.toLowerCase().includes('truva')) {
        return p.property.replace('properties/', '');
      }
    }
  }
  throw new Error('Could not find the Truva property. Set PROPERTY_ID=… and re-run.');
}

async function main() {
  if (!existsSync(CLIENT_FILE)) {
    console.error(`Missing ${CLIENT_FILE}`);
    process.exit(1);
  }
  const creds = JSON.parse(readFileSync(CLIENT_FILE, 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;

  const token = await getToken(client_id, client_secret);
  const propertyId = await discoverProperty(token);
  console.log(`\nProperty: ${propertyId}\n`);

  // Existing dimensions (paginate just in case)
  const existing = new Set();
  let pageToken = '';
  do {
    const path =
      `/v1beta/properties/${propertyId}/customDimensions?pageSize=200` +
      (pageToken ? `&pageToken=${pageToken}` : '');
    const { status, json } = await req('GET', ADMIN_HOST, path, { token });
    if (status !== 200) {
      console.error('Failed to list custom dimensions:', JSON.stringify(json));
      process.exit(1);
    }
    for (const d of json.customDimensions || []) existing.add(d.parameterName);
    pageToken = json.nextPageToken || '';
  } while (pageToken);

  console.log(`Already registered: ${existing.size} custom dimension(s).\n`);

  let created = 0,
    skipped = 0,
    failed = 0;

  for (const [parameterName, displayName] of DIMENSIONS) {
    if (existing.has(parameterName)) {
      console.log(`  • skip   ${parameterName} (exists)`);
      skipped++;
      continue;
    }
    const { status, json } = await req(
      'POST',
      ADMIN_HOST,
      `/v1beta/properties/${propertyId}/customDimensions`,
      { token, body: { parameterName, displayName, scope: 'EVENT' } },
    );
    if (status === 200 || status === 201) {
      console.log(`  ✓ create ${parameterName}  →  "${displayName}"`);
      created++;
    } else {
      const msg = json?.error?.message || JSON.stringify(json);
      console.log(`  ✗ FAIL   ${parameterName}: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`);
  console.log('New dimensions populate going forward; historical events are not backfilled.');
}

main().catch((e) => {
  console.error('\nFatal:', e.message);
  process.exit(1);
});
