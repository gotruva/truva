import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { getEditorialArticleBySlug } from '@/lib/editorial';
import type { EditorialArticle } from '@/types';

const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview';
const DEFAULT_ASPECT_RATIO = '16:9';
const DEFAULT_IMAGE_SIZE = '2K';

const MASTER_SYSTEM_INSTRUCTION = `You are generating an editorial banner BACKGROUND for Truva, a high-trust Filipino financial comparison app. This banner will have website typography overlaid later, so the image must contain NO text, NO numbers, NO logos, NO trademarks, and NO watermarks.

Brand feel: trusted financial institution; clean, precise, premium, digital-native; minimalist; subtle glassmorphism (soft blur, gentle shadows); crisp vector-like shapes.

Color palette (strict): white #FFFFFF, Truva primary blue #0052FF, Truva tint #EBF0FF, surface #F8F9FB, border #E4E7EC. Use at most one saturated accent (Truva blue). Do NOT introduce other saturated colors. Never use red as a dominant color.

Allowed abstract motifs (no legible UI copy): rounded comparison cards, faint table-row stripes, simple chart shapes (lines/bars without labels), calculator outline, thin grid lines, subtle blue glow. Everything should feel like modern fintech UI, not illustration art.

Composition (critical): keep the LEFT ~45% of the frame mostly empty with a clean soft gradient for text overlay. Place subtle abstract UI/data elements on the RIGHT side only. Maintain high contrast and low visual noise in the left safe area.

Hard exclusions: people, faces, hands; coins/piggy banks/peso signs; upward arrows or cliche finance iconography; bank logos; any text or typographic glyphs; busy textures; heavy multi-color gradients; cartoonish 3D.

Output: one modern, crisp, minimalist 16:9 banner background that visually evokes the topic without using any text.`;

function getFlagValue(name: string) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((value) => value.startsWith(prefix));
  return raw?.slice(prefix.length);
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function getSlug() {
  return getFlagValue('slug') ?? process.argv[2];
}

function getSectionLabel(article: EditorialArticle) {
  const sectionLabelMap: Record<EditorialArticle['section'], string> = {
    rates: 'Rates',
    reviews: 'Reviews',
    compare: 'Compare',
    guides: 'Guides',
  };

  if (article.category === 'guides') {
    return 'Guides';
  }

  const categoryLabel =
    article.category === 'credit-cards' ? 'Credit Cards' : article.categoryLabel || 'Banking';

  const sectionLabel = sectionLabelMap[article.section] ?? article.section;
  return `${categoryLabel} / ${sectionLabel}`;
}

function inferVisualFocus(article: EditorialArticle) {
  const slug = article.slug.toLowerCase();
  const title = article.title.toLowerCase();

  if (slug.includes('pdic') || title.includes('pdic')) {
    return 'shield outline + deposit split cards';
  }

  if (slug.includes('withholding-tax') || title.includes('tax')) {
    return 'tax rules ledger + calculator outline';
  }

  if (article.section === 'compare') {
    return 'side-by-side comparison cards';
  }

  if (article.section === 'reviews') {
    return 'product card + conditions chips';
  }

  return 'comparison cards + chart shapes';
}

function buildBannerBrief(article: EditorialArticle, visualFocus: string) {
  const sectionLabel = getSectionLabel(article);

  const keywords = (article.keywords ?? []).slice(0, 7);
  const keywordsLine = keywords.length ? keywords.join(', ') : 'after-tax yield, comparisons, peso math';

  return `Banner brief (topic context only):
- Article title: "${article.title}"
- Section: "${sectionLabel}"
- Keywords: ${keywordsLine}
- Visual focus: "${visualFocus}"

Generate the Truva brand-consistent banner background following the system instruction. Keep the left ~45% clean negative space for overlay text; keep all abstract elements on the right; no text/numbers/logos.`;
}

function buildPayload(systemInstruction: string, bannerBrief: string, generationConfig: unknown) {
  return {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        parts: [{ text: bannerBrief }],
      },
    ],
    generationConfig,
  };
}

function printHelp() {
  console.error(`Usage:
  npm run banners:json -- <slug> [--focus="..."] [--out="path.json"] [--write]

Examples:
  npm run banners:json -- best-digital-bank-philippines
  npm run banners:json -- final-withholding-tax-explained --focus="tax rules ledger + calculator outline"
  npm run banners:json -- pdic-insurance-guide --write
`);
}

async function maybeWriteOutput(outPath: string, content: string) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, content, 'utf8');
}

async function main() {
  if (hasFlag('help') || hasFlag('h')) {
    printHelp();
    process.exit(0);
  }

  const slug = getSlug();
  if (!slug) {
    printHelp();
    throw new Error('Missing article slug.');
  }

  const article = getEditorialArticleBySlug(slug);
  if (!article) {
    throw new Error(
      `Unknown article slug "${slug}". Add it to lib/editorial.ts, then retry.`
    );
  }

  const model = getFlagValue('model') ?? DEFAULT_MODEL;
  const aspectRatio = getFlagValue('ratio') ?? getFlagValue('aspectRatio') ?? DEFAULT_ASPECT_RATIO;
  const imageSize = getFlagValue('size') ?? getFlagValue('imageSize') ?? DEFAULT_IMAGE_SIZE;

  const visualFocus =
    getFlagValue('focus') ?? article.bannerFocus ?? inferVisualFocus(article);

  const bannerBrief = buildBannerBrief(article, visualFocus);

  const generationConfig = {
    responseModalities: ['IMAGE'],
    imageConfig: {
      aspectRatio,
      imageSize,
    },
  };

  const payload = buildPayload(MASTER_SYSTEM_INSTRUCTION, bannerBrief, generationConfig);
  const output = JSON.stringify(payload, null, 2);

  const shouldWrite = hasFlag('write') || Boolean(getFlagValue('out'));
  const outPath =
    getFlagValue('out') ??
    path.join('artifacts', 'publish-ready', 'banner-json', `${slug}.${model}.json`);

  if (shouldWrite) {
    await maybeWriteOutput(outPath, output);
    console.error(`Wrote ${outPath}`);
  }

  console.log(output);
}

main().catch((error) => {
  console.error('Banner JSON generation failed:', error);
  process.exit(1);
});

