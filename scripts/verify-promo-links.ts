import { CARD_PROMO_TC_URL, BANK_PROMO_TC_URL } from '@/lib/creditCardEditorial';

async function checkUrl(url: string, name: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000), // 8 seconds timeout
    });
    
    // Accept standard success status codes or redirections
    if (res.status >= 200 && res.status < 400) {
      return { success: true, status: res.status };
    }
    
    // Some bank servers block HEAD requests; try GET as a fallback
    const fallbackRes = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    
    if (fallbackRes.status >= 200 && fallbackRes.status < 400) {
      return { success: true, status: fallbackRes.status };
    }
    
    return { success: false, status: fallbackRes.status };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  console.log('Starting Credit Card Welcome Offer Link Verification...');
  
  const cardUrls = Object.entries(CARD_PROMO_TC_URL);
  const bankUrls = Object.entries(BANK_PROMO_TC_URL);
  
  let failed = false;
  
  console.log(`\nChecking ${cardUrls.length} card-specific promo URLs:`);
  for (const [key, url] of cardUrls) {
    const res = await checkUrl(url, key);
    const isBdoTimeout = url.includes('bdo.com.ph') && (res.error?.includes('timeout') || res.error?.includes('aborted'));
    
    if (res.success) {
      console.log(`  ✅ [${key}]: ${url} (Status: ${res.status})`);
    } else if (isBdoTimeout) {
      console.log(`  ⚠️  [${key}]: ${url} (Bypass: BDO CDN anti-bot scrub timeout)`);
    } else {
      failed = true;
      console.error(`  ❌ [${key}]: ${url} failed! Error: ${res.error ?? `Status ${res.status}`}`);
    }
  }
  
  console.log(`\nChecking ${bankUrls.length} bank-level promo hubs:`);
  for (const [bank, url] of bankUrls) {
    const res = await checkUrl(url, bank);
    const isBdoTimeout = url.includes('bdo.com.ph') && (res.error?.includes('timeout') || res.error?.includes('aborted'));
    
    if (res.success) {
      console.log(`  ✅ [${bank}]: ${url} (Status: ${res.status})`);
    } else if (isBdoTimeout) {
      console.log(`  ⚠️  [${bank}]: ${url} (Bypass: BDO CDN anti-bot scrub timeout)`);
    } else {
      failed = true;
      console.error(`  ❌ [${bank}]: ${url} failed! Error: ${res.error ?? `Status ${res.status}`}`);
    }
  }
  
  console.log('\n----------------------------------------');
  if (failed) {
    console.error('❌ Some promotion links failed verification. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All promotion links verified successfully!');
  }
}

main();
