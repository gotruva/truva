/**
 * Copy guard for the credit-card finder.
 *
 * Fails if forbidden marketing words appear in finder/results source.
 * "approved" is forbidden; "approval" / "bank approval is still required"
 * is allowed (word-boundary regex keeps them distinct).
 *
 * Run: `npm run lint:cc-copy`. Exits non-zero on any hit.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Scope: only the NEW finder code. Existing components are out of scope.
const ROOTS = [
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

const FORBIDDEN: Array<{ label: string; re: RegExp }> = [
  { label: 'guaranteed', re: /\bguaranteed\b/i },
  { label: 'approved', re: /\bapproved\b/i },
  { label: 'perfect card', re: /\bperfect card\b/i },
  { label: 'best card ever', re: /\bbest card ever\b/i },
];

function walk(dir: string): string[] {
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
    files = walk(root);
  } catch {
    continue;
  }
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (isComment(line)) return;
      for (const { label, re } of FORBIDDEN) {
        if (re.test(line)) {
          hits.push(`${file}:${i + 1}  [${label}]  ${line.trim()}`);
        }
      }
    });
  }
}

if (hits.length > 0) {
  console.error('Forbidden copy found in credit-card finder:');
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}

console.log('credit-card finder copy guard: clean');
