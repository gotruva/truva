/** Poll the live production CSP until the GA fix lands (or time out). */
import { request } from 'https';

const URL_HOST = 'www.gotruva.com';
const NEEDLES = ['analytics.google.com', 'www.google.com'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getCsp() {
  return new Promise((resolve, reject) => {
    const r = request({ hostname: URL_HOST, path: `/?cb=${Date.now()}`, method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache' } }, (res) => {
      resolve(res.headers['content-security-policy'] || '');
      res.resume();
    });
    r.on('error', reject);
    r.end();
  });
}

for (let i = 1; i <= 8; i++) {
  const csp = await getCsp();
  const connect = (csp.split(';').find((d) => d.trim().startsWith('connect-src')) || '').trim();
  const has = NEEDLES.every((n) => connect.includes(n));
  console.log(`  check ${i}/8 — fix live: ${has ? 'YES ✓' : 'not yet'}`);
  if (has) {
    console.log('\n✓ Production now allows the GA collect endpoints. The fix is LIVE.');
    console.log('  connect-src:', connect);
    process.exit(0);
  }
  if (i < 8) await sleep(20000);
}
console.log('\n• Still old CSP after ~2.5 min. Either the prod deploy is still building,');
console.log('  or the branch hasn\'t been merged to main yet (prod deploys from main).');
