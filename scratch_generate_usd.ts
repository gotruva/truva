import fs from 'fs';

const wf = JSON.parse(fs.readFileSync('docs/n8n/mmf-uitf-daily.workflow.json', 'utf8'));
wf.name = 'Truva MMF - USD UITF Daily Scrape';

const trigger = wf.nodes.find((n: any) => n.name === 'Daily 6:30 PM PHT');
trigger.name = 'Daily 6:35 PM PHT';
trigger.parameters.rule.interval[0].expression = '35 18 * * *';

const getFunds = wf.nodes.find((n: any) => n.name === 'Get Target Funds');
getFunds.parameters.url = getFunds.parameters.url.replace('currency=eq.PHP', 'currency=eq.USD');

const getBench = wf.nodes.find((n: any) => n.name === 'Get Latest Benchmark');
getBench.parameters.url = getBench.parameters.url.replace('key=eq.BTR_91D', 'key=eq.US_TBILL_90D');

const fetchSource = wf.nodes.find((n: any) => n.name === 'Fetch UITF Source');
fetchSource.parameters.url = fetchSource.parameters.url.replace('currency=PHP', 'currency=USD');

const buildPayload = wf.nodes.find((n: any) => n.name === 'Build Daily Rate Payload');
let code = buildPayload.parameters.jsCode;
code = code.replace('target PHP UITF', 'target USD UITF');
code = code.replace('Missing BTR_91D benchmark. Run the BTr benchmark workflow first.', 'Missing US_TBILL_90D benchmark. Run the US T-Bill benchmark workflow first.');
code = code.replace('const benchmarkAfterTaxRate = benchmarkRate * 0.8;', 'const benchmarkAfterTaxRate = benchmarkRate;');
code = code.replace(/const allowlist = \{[\s\S]+?\};/, `const allowlist = {
  'bdo dollar money market fund': 'bdo-dollar-money-market-fund',
  'chinabank dollar cash fund': 'chinabank-dollar-cash-fund',
  'landbank us dollar money market fund': 'landbank-us-dollar-money-market-fund',
  'metro dollar money market fund': 'metro-dollar-money-market-fund',
  'pnb prime dollar money market fund': 'pnb-prime-dollar-money-market-fund'
};`);

buildPayload.parameters.jsCode = code;

fs.writeFileSync('docs/n8n/mmf-uitf-daily-usd.workflow.json', JSON.stringify(wf, null, 2));
console.log('Created mmf-uitf-daily-usd.workflow.json');
