/**
 * Copy guard for credit-card finder and browse surfaces.
 *
 * Fails if forbidden marketing words appear in finder/results source.
 * "approved" is forbidden; "approval" / "bank approval is still required"
 * is allowed (word-boundary regex keeps them distinct).
 *
 * Run: `npm run lint:cc-copy`. Exits non-zero on any hit.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = [
  'app/credit-cards/compare',
  'app/credit-cards/reviews',
  'components/credit-cards',
  'lib/creditCardEditorial.ts',
  'components/credit-cards/finder',
  'components/credit-cards/results',
  'components/credit-cards/shared',
  'lib/creditCardFinder',
];

/** Comment lines hold the rule doc itself — never user-facing copy. */
function isComment(line: string): boolean {
  const t = line.trim();
  return t.startsWith('*') || t.startsWith('//') || t.startsWith('/*');
}

function isTechnicalLine(line: string): boolean {
  const t = line.trim();
  return (
    t.includes('.replace(') ||
    t.startsWith('href:') ||
    t.includes("id: 'naffl'") ||
    t.includes('card.naffl') ||
    t.includes('true_naffl') ||
    t.includes("naf: 'naffl'") ||
    t.includes("'naffl'") ||
    t.includes('| \'naffl\'') ||
    t.includes('naffl?:') ||
    t.includes('naffl:')
  );
}

const FORBIDDEN: Array<{ label: string; re: RegExp; uiOnly?: boolean }> = [
  { label: 'guaranteed', re: /\bguaranteed\b/i },
  { label: 'approved', re: /\bapproved\b/i },
  { label: 'recommended', re: /\brecommended\b/i },
  { label: 'top pick', re: /\btop pick\b/i },
  { label: 'winner', re: /\bwinner\b/i },
  { label: 'perfect card', re: /\bperfect card\b/i },
  { label: 'best card ever', re: /\bbest card ever\b/i },
  { label: 'NAFFL acronym', re: /\bNAFFL\b/ },
  { label: 'robotic fit sentence', re: /This card fits your goal|most value when spending/i },
  { label: 'raw fee waiver render', re: /annual_fee_waiver_condition\s*\?\?|value=\{[^}]*annual_fee_waiver_condition/i, uiOnly: true },
];

function walk(dir: string): string[] {
  if (statSync(dir).isFile()) {
    return /\.(tsx?|ts)$/.test(dir) ? [dir] : [];
  }
  let out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out = out.concat(walk(full));
    } else if (/\.(tsx?|ts)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const hits: string[] = [];

for (const root of ROOTS) {
  let files: string[] = [];
  try {
    if (!existsSync(root)) continue;
    files = walk(root);
  } catch {
    continue;
  }
  for (const file of files) {
    const normalizedFile = file.replace(/\\/g, '/');
    const isUiFile =
      normalizedFile.startsWith('app/') ||
      normalizedFile.startsWith('components/');
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (isComment(line)) return;
      if (isTechnicalLine(line)) return;
      for (const { label, re, uiOnly } of FORBIDDEN) {
        if (uiOnly && !isUiFile) continue;
        if (re.test(line)) {
          hits.push(`${file}:${i + 1}  [${label}]  ${line.trim()}`);
        }
      }
    });
  }
}

if (hits.length > 0) {
  console.error('Forbidden copy found in credit-card surfaces:');
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}

console.log('credit-card copy guard: clean');
