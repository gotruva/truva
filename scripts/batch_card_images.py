#!/usr/bin/env python3
"""
Batch credit card image scraper + processor for Truva v2.

This is a DEVELOPMENT/MANUAL tool - NOT part of normal build or runtime.
Run it only when you want to re-scrape card images from official bank sources.

Dependencies: Python 3.11+, playwright (pip install playwright), Pillow.
Also requires valid Supabase credentials in the project's .env.local file.

How it works:
1. Loads the live truva_credit_cards rows from Supabase via REST API.
2. Optionally narrows to an explicit curated key list with --keys/--keys-file.
3. Resolves per-card source URLs with normalized keys, so space-form overrides
   match Supabase underscore keys.
4. Downloads matched images, converts to 960x606 WebP with 2% padding.
5. Preserves existing clean assets unless --allow-overwrite is passed.
6. Writes a report unless --dry-run is used; curated subsets require
   --report-output so the canonical report cannot be replaced by a partial run.

Usage: python3 scripts/batch_card_images.py --dry-run --keys bpi_edge_card --list-source-urls
       (activate the hermes-agent venv first: source ~/.hermes/hermes-agent/venv/bin/activate)

After running, also regenerate the status map:
  python3 scripts/generate-card-visual-status.py
"""

import argparse
import asyncio
import base64
import hashlib
import io
import json
import os
import re
import shutil
import sys
import tempfile
from urllib.parse import urlparse, unquote
from datetime import date, datetime
from PIL import Image

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

TRUVA_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN_ASSET_DIR = os.path.join(TRUVA_ROOT, "public", "cards", "clean")
REPORT_PATH = os.path.join(TRUVA_ROOT, "docs", "credit-card-image-scrape-report.json")
TODAY = date.today().isoformat()

CARD_CANVAS_W = 960
CARD_CANVAS_H = 606
PADDING_RATIO = 0.02

# Bank page URLs for extracting card images with headings
BANK_PAGES = {
    "bdo": "https://www.bdo.com.ph/personal/cards/credit-cards/compare-credit-cards",
    "chinabank_all": "https://www.chinabank.ph/credit-cards",
}

TRUSTED_GENERIC_IMAGE_URL_HINTS = {
    "eastwest_everyday_titanium_mastercard": ["everyday-mc_2025"],
    "eastwest_platinum_mastercard": ["platinum-mc-emv_2025"],
    "metrobank_cashback_visa": ["cashback-visa.png"],
    "metrobank_rewards_plus_visa": ["rewards-plus-card"],
    "security_bank_wave_mastercard": ["CCV2-Wave_Contactless_2024.png"],
}

# Per-card source URLs (individual product pages for cards where listing page isn't enough)
PER_CARD_URLS = {
    "bdo_secured_credit_card": "https://www.bdo.com.ph/personal/cards/credit-cards/secured-credit-card",
    "bdo_world_elite_mastercard": "https://www.bdo.com.ph/personal/cards/credit-cards/mastercard/world-elite",
    "aub_gold_mastercard": "https://online.aub.ph/creditcards/goldandplatinum",
    "equicom_gold_credit_card": "https://www.equicomsavings.com/product-and-services/card-products/",
    "hsbc live credit card": "https://www.hsbc.com.ph/credit-cards/products/liveplus/",
    "hsbc_live_plus_credit_card": "https://www.hsbc.com.ph/credit-cards/products/liveplus/",
    "chinabank_athome_visa_platinum": "https://www.chinabank.ph/credit-cards-at-home-visa-platinum",
    "chinabank_cash_rewards_mastercard": "https://www.chinabank.ph/credit-cards-cash-rewards",
    "chinabank_destinations_platinum_mastercard": "https://www.chinabank.ph/credit-cards-destinations-platinum",
    "chinabank_destinations_world_dollar_mastercard": "https://www.chinabank.ph/credit-cards-destinations-world-dollar",
    "chinabank_destinations_world_mastercard": "https://www.chinabank.ph/credit-cards-destinations-world",
    "chinabank_freedom_mastercard": "https://www.chinabank.ph/credit-cards-freedom",
    "bpi amore cashback card": "https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-classic",
    "bpi amore platinum cashback card": "https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-platinum",
    "bpi corporate card": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-corporate-mastercard",
    "bpi edge card": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-edge-mastercard",
    "bpi gold rewards card": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-gold-mastercard",
    "bpi platinum rewards mastercard": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-platinum-rewards-mastercard",
    "bpi signature card": "https://www.bpi.com.ph/personal/cards/credit-cards/visa-signature",
    "petron bpi card": "https://www.bpi.com.ph/personal/cards/credit-cards/petron-bpi-mastercard",
    "robinsons cashback card": "https://www.bpi.com.ph/personal/cards/credit-cards/robinsons-cashback-card-visa",
    "security_bank_wave_mastercard": "https://www.securitybank.com/personal/credit-cards/",
}

# ─── Helper: normalize card key (match Supabase underscore or space) ───
def normalize_key(key: str) -> str:
    """Normalize to underscore-separated lowercase."""
    return re.sub(r'[^a-z0-9]+', '_', key.strip().lower()).strip('_')

def normalize_name(name: str) -> str:
    """Normalize card name for matching."""
    return re.sub(r'[^a-z0-9]+', ' ', name.strip().lower()).strip()

# ─── Image Processing ───

PER_CARD_URLS_BY_KEY = {normalize_key(key): url for key, url in PER_CARD_URLS.items()}

def resolve_source_url(row: dict) -> str:
    """Resolve the curated source URL for a Supabase row."""
    card_key = normalize_key(row.get("normalized_card_key", ""))
    return PER_CARD_URLS_BY_KEY.get(card_key) or row.get("source_url") or ""

def split_key_values(values: list[str] | None) -> list[str]:
    """Split comma/newline/space-delimited key arguments into normalized keys."""
    keys: list[str] = []
    for value in values or []:
        for part in re.split(r'[\s,]+', value.strip()):
            if part:
                keys.append(normalize_key(part))
    return keys

def load_selected_keys(keys_args: list[str] | None, keys_file: str | None) -> list[str]:
    """Load requested keys from CLI flags, preserving first-seen order."""
    keys = split_key_values(keys_args)
    if keys_file:
        with open(keys_file, encoding="utf-8") as f:
            file_values = []
            for line in f:
                clean_line = line.split("#", 1)[0].strip()
                if clean_line:
                    file_values.append(clean_line)
            keys.extend(split_key_values(file_values))

    seen = set()
    deduped = []
    for key in keys:
        if key not in seen:
            seen.add(key)
            deduped.append(key)
    return deduped

def filter_rows_by_keys(live_rows: list[dict], selected_keys: list[str]) -> list[dict]:
    """Restrict live rows to an explicit curated key list."""
    if not selected_keys:
        return live_rows

    by_key = {normalize_key(row["normalized_card_key"]): row for row in live_rows}
    missing = [key for key in selected_keys if key not in by_key]
    if missing:
        raise ValueError(f"Requested key(s) not found in live truva_credit_cards: {', '.join(missing)}")
    return [by_key[key] for key in selected_keys]

def process_to_clean_card(raw_bytes: bytes, output_path: str) -> dict:
    """Convert raw image to 960x606 WebP with 2% transparent padding, after transparentizing the background and cropping."""
    img = Image.open(io.BytesIO(raw_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    w, h = img.size
    
    # 1. BPI direct cropping using fixed coordinates
    filename = os.path.basename(output_path).lower()
    is_bpi = "bpi" in filename or "robinsons" in filename or "petron" in filename
    
    if is_bpi and w == 744 and h == 368:
        cropped = img.crop((148, 42, 596, 327))
    else:
        # 2. Safe crop using corner flood-fill for white/transparent only
        import collections
        visited = set()
        queue = collections.deque([(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)])
        for c in queue:
            visited.add(c)
            
        while queue:
            x, y = queue.popleft()
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    r, g, b, a = img.getpixel((nx, ny))
                    # STRICT background condition: transparent or solid near-white only
                    if a == 0 or (r >= 244 and g >= 244 and b >= 244):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
        pixels = img.load()
        for x, y in visited:
            pixels[x, y] = (0, 0, 0, 0)
            
        bbox_x1, bbox_y1 = w, h
        bbox_x2, bbox_y2 = 0, 0
        for y_idx in range(h):
            for x_idx in range(w):
                r, g, b, a = pixels[x_idx, y_idx]
                if a > 0:
                    if x_idx < bbox_x1: bbox_x1 = x_idx
                    if y_idx < bbox_y1: bbox_y1 = y_idx
                    if x_idx > bbox_x2: bbox_x2 = x_idx
                    if y_idx > bbox_y2: bbox_y2 = y_idx
                    
        if bbox_x1 < bbox_x2 and bbox_y1 < bbox_y2:
            cropped = img.crop((bbox_x1, bbox_y1, bbox_x2 + 1, bbox_y2 + 1))
        else:
            cropped = img

    # 3. Apply smooth rounded transparent corner mask
    from PIL import ImageDraw, ImageChops
    mask = Image.new('L', cropped.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, cropped.width - 1, cropped.height - 1), radius=18, fill=255)
    
    r, g, b, a = cropped.split()
    final_a = ImageChops.multiply(a, mask)
    img_cropped = Image.merge('RGBA', (r, g, b, final_a))

    # 4. Proceed with standard resizing and transparent padding
    padding_px = int(CARD_CANVAS_W * PADDING_RATIO)
    card_area_w = CARD_CANVAS_W - 2 * padding_px
    card_area_h = CARD_CANVAS_H - 2 * padding_px

    img_ratio = img_cropped.width / img_cropped.height
    target_ratio = card_area_w / card_area_h

    if img_ratio > target_ratio:
        new_w = card_area_w
        new_h = int(new_w / img_ratio)
    else:
        new_h = card_area_h
        new_w = int(new_h * img_ratio)

    img_resized = img_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CARD_CANVAS_W, CARD_CANVAS_H), (0, 0, 0, 0))
    x_offset = (CARD_CANVAS_W - new_w) // 2
    y_offset = (CARD_CANVAS_H - new_h) // 2
    canvas.paste(img_resized, (x_offset, y_offset), img_resized)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, "WEBP", quality=90, lossless=False)
    file_size = os.path.getsize(output_path)

    return {
        "width": CARD_CANVAS_W,
        "height": CARD_CANVAS_H,
        "original_width": w,
        "original_height": h,
        "mode": "RGBA",
        "file_size_kb": round(file_size / 1024, 1),
    }

def image_hash(raw_bytes: bytes) -> str:
    """SHA-256 hash of image content for dedup detection."""
    return hashlib.sha256(raw_bytes).hexdigest()[:16]

def clean_asset_hashes(exclude_keys: set[str] | None = None) -> dict[str, str]:
    """Map final clean asset file hashes to card keys."""
    exclude_keys = exclude_keys or set()
    hashes: dict[str, str] = {}
    if not os.path.isdir(CLEAN_ASSET_DIR):
        return hashes

    for filename in os.listdir(CLEAN_ASSET_DIR):
        if not filename.endswith(".webp"):
            continue
        key = os.path.splitext(filename)[0]
        if key in exclude_keys:
            continue
        path = os.path.join(CLEAN_ASSET_DIR, filename)
        with open(path, "rb") as f:
            hashes[image_hash(f.read())] = key
    return hashes

def process_clean_asset_candidate(
    card_key: str,
    raw_bytes: bytes,
    clean_path: str,
    dry_run: bool,
    allow_overwrite: bool,
) -> dict:
    """Process a candidate image without overwriting existing assets by default."""
    existing = os.path.exists(clean_path)
    if existing and not allow_overwrite:
        return {"preserved": True, "wrote": False, "would_write": False, "info": None, "duplicate_key": None}

    os.makedirs(os.path.dirname(clean_path), exist_ok=True)
    temp_dir = os.path.join(TRUVA_ROOT, ".codex-tmp", "card-image-candidates")
    os.makedirs(temp_dir, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=f"{card_key}-", suffix=".webp", dir=temp_dir)
    os.close(fd)

    try:
        info = process_to_clean_card(raw_bytes, temp_path)
        with open(temp_path, "rb") as f:
            candidate_hash = image_hash(f.read())
        duplicate_key = clean_asset_hashes(exclude_keys={card_key} if allow_overwrite else set()).get(candidate_hash)
        if duplicate_key:
            return {"preserved": False, "wrote": False, "would_write": False, "info": info, "duplicate_key": duplicate_key}

        if dry_run:
            return {"preserved": False, "wrote": False, "would_write": True, "info": info, "duplicate_key": None}

        shutil.move(temp_path, clean_path)
        temp_path = ""
        return {"preserved": False, "wrote": True, "would_write": False, "info": info, "duplicate_key": None}
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ─── Card name matching ───

def heading_matches_card(heading: str, card_name: str, bank: str) -> bool:
    """Check if a heading text matches a card name. Strict matching only."""
    h = normalize_name(heading)
    cn = normalize_name(card_name)
    bk = normalize_name(bank)

    # Exact match after normalization
    if h == cn:
        return True

    # Heading contains card name (excluding bank prefix)
    cn_without_bank = cn
    bk_words = set(bk.split())
    # Remove bank words from card name for comparison
    cn_words = cn.split()
    cn_without_bank = ' '.join(w for w in cn_words if w not in bk_words)

    # Check if heading contains the core card name (after removing bank)
    if cn_without_bank and cn_without_bank in h:
        return True
    if h in cn_without_bank:
        return True

    # Strict keyword matching: require at least 2 unique identifying words
    # that are specific to this card (not common bank words)
    unique_card_words = {'platinum', 'gold', 'signature', 'classic', 'standard',
                         'cashback', 'rewards', 'explorer', 'installment', 'edge',
                         'lucky', 'cat', 'diamond', 'elite', 'freedom', 'destinations',
                         'amore', 'petron', 'robinsons', 'corporate', 'home',
                         'live', 'red', 'world', 'blue', 'dollar', 'unionpay',
                         'diners', 'club', 'international', 'premiere', 'jcb',
                         'american', 'express', 'mastercard', 'visa'}
    h_words = set(h.split())
    cn_words_set = set(cn_words)
    matched = h_words & cn_words_set & unique_card_words
    if len(matched) >= 2:
        return True

    return False

def image_candidate_matches_card(info: dict, card_name: str, card_key: str) -> bool:
    """Require generic image candidates to carry card-specific text in URL or alt."""
    haystack = normalize_name(" ".join([
        info.get("src", ""),
        info.get("alt", ""),
    ]))
    common_words = {
        "bank", "card", "credit", "mastercard", "visa", "platinum", "gold",
        "titanium", "classic", "rewards", "reward", "plus", "the", "and",
        "of", "philippines", "corporation", "eastwest", "east", "west",
        "metrobank", "pnb", "rcbc", "security", "unionbank",
    }
    card_words = set(normalize_name(card_name).split()) | set(normalize_key(card_key).split("_"))
    identifying_words = {word for word in card_words if len(word) >= 4 and word not in common_words}

    if not identifying_words:
        return False

    return any(word in haystack for word in identifying_words)

# ─── Scraper: Extract card images from BDO compare page ───

async def extract_bdo_cards(page) -> dict[str, dict]:
    """Extract heading→image_url mapping from BDO compare page."""
    card_map = {}
    await page.goto(BANK_PAGES["bdo"], wait_until="domcontentloaded", timeout=30000)
    await page.wait_for_timeout(3000)

    card_data = await page.evaluate('''() => {
        const results = [];

        // Find card images from feature-card__item containers (BDO's compare page structure)
        document.querySelectorAll('.feature-card__item').forEach(item => {
            const heading = item.querySelector('.compare_card_title, h6');
            const headingText = heading ? heading.textContent.trim() : '';
            if (!headingText) return;  // Skip cards without names

            const img = item.querySelector('.compare_card_img, img');
            if (!img) return;

            const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            if (!src) return;

            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;
            if (w < 100 || h < 60) return;
            const ratio = w / h;
            if (ratio < 1.3 || ratio > 2.0) return;

            results.push({
                src: src,
                w: w, h: h,
                heading: headingText,
                alt: (img.getAttribute('alt') || '').trim()
            });
        });

        // Deduplicate by src
        const seen = new Set();
        return results.filter(r => {
            if (seen.has(r.src)) return false;
            seen.add(r.src);
            return true;
        });
    }''')

    for c in card_data:
        heading = c["heading"].strip()
        if heading:
            # Make absolute URL
            src = c["src"]
            if src.startswith('//'):
                src = 'https:' + src
            elif src.startswith('/'):
                src = f'https://www.bdo.com.ph{src}'
            heading_lower = normalize_name(heading)
            card_map[heading_lower] = {
                "url": src,
                "width": c["w"],
                "height": c["h"],
                "heading": heading,
            }

    print(f"  📋 Extracted {len(card_map)} card entries from BDO compare page")
    return card_map


async def extract_chinabank_cards(page) -> dict[str, dict]:
    """Extract card images from Chinabank credit cards listing."""
    card_map = {}
    await page.goto(BANK_PAGES["chinabank_all"], wait_until="domcontentloaded", timeout=30000)
    await page.wait_for_timeout(3000)

    card_data = await page.evaluate('''() => {
        const results = [];
        document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            if (!src || !src.match(/card/i)) return;
            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;
            const alt = (img.getAttribute('alt') || '').trim();

            // Find nearest heading
            let el = img.parentElement;
            let heading = '';
            for (let i = 0; i < 5 && el; i++) {
                const hd = el.querySelector('h2, h3, h4, h5, .card-title, [class*=\"title\"]');
                if (hd) { heading = hd.textContent.trim().substring(0, 60); break; }
                el = el.parentElement;
            }

            if (w >= 100 && h >= 60) {
                results.push({src, w, h, heading, alt});
            }
        });
        return results;
    }''')

    seen = set()
    for c in card_data:
        src = c["src"]
        if src in seen:
            continue
        seen.add(src)
        if src.startswith('//'):
            src = 'https:' + src
        elif src.startswith('/'):
            src = f'https://www.chinabank.ph{src}'
        heading_lower = normalize_name(c["heading"] or c["alt"] or "")
        if heading_lower:
            card_map[heading_lower] = {"url": src, "width": c["w"], "height": c["h"], "heading": c["heading"]}

    print(f"  📋 Extracted {len(card_map)} card entries from Chinabank listing page")
    return card_map


async def extract_bpi_card_image(page, url: str) -> dict | None:
    """Extract card image from a BPI per-card product page."""
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    await page.wait_for_timeout(3000)

    result = await page.evaluate("""() => {
        // BPI typically has a card-specific image at hero_xs_* Scene7 URL
        const selectors = [
            'img[src*="hero_xs"]', 'img[src*="card"]', 'img[src*="Card"]',
            '.product-image img', '.card-image img',
            'main img', '.content img',
            'section img'
        ];

        // Try hero_xs first (card-specific per BPI card)
        for (const sel of selectors) {
            const imgs = document.querySelectorAll(sel);
            for (const img of imgs) {
                const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                if (!src) continue;
                const w = img.naturalWidth || img.width || 0;
                const h = img.naturalHeight || img.height || 0;
                if (w < 100 || h < 60) continue;
                if (src.includes('hero_xs') || src.includes('hero_small') || src.includes('hero-small') || (src.includes('scene7') && src.includes('image_') && !src.includes('739x391'))) {
                    const altText = (img.getAttribute('alt') || '').trim();
                    return {src: src, w: w, h: h, ratio: w/h, alt: altText, isCardSpecific: true};
                }
            }
        }

        // Fallback: card-ratio image (not generic banner)
        for (const sel of selectors) {
            const imgs = document.querySelectorAll(sel);
            for (const img of imgs) {
                const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                if (!src) continue;
                const w = img.naturalWidth || img.width || 0;
                const h = img.naturalHeight || img.height || 0;
                if (w < 100 || h < 60) continue;
                const ratio = w / h;
                if (ratio > 1.3 && ratio < 2.0 && !src.includes('739x391') && !src.includes('shutterstock')) {
                    const altText = (img.getAttribute('alt') || '').trim();
                    return {src: src, w: w, h: h, ratio: ratio, alt: altText, isCardSpecific: false};
                }
            }
        }

        // Last resort: any decent image
        const allImgs = document.querySelectorAll('img');
        for (const img of allImgs) {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            if (!src) continue;
            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;
            if (w >= 200 && h >= 100) {
                const altText = (img.getAttribute('alt') || '').trim();
                return {src: src, w: w, h: h, ratio: w/h, alt: altText, isCardSpecific: false};
            }
        }
        return null;
    }""")

    if result and result.get("src"):
        src = result["src"]
        if src.startswith('//'):
            src = 'https:' + src
        elif src.startswith('/'):
            parsed = urlparse(url)
            src = f'{parsed.scheme}://{parsed.netloc}{src}'
        result["src"] = src
        return result
    return None


# ─── Main scraper ───

async def download_image_bytes(page, direct_url: str, source_url: str) -> bytes | None:
    """Download an image through the browser context so issuer referers/cookies work."""
    img_data = await page.evaluate(
        """
        async ({ directUrl, sourceUrl }) => {
            try {
                const resp = await fetch(directUrl, {
                    headers: {
                        'Referer': sourceUrl,
                        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
                    }
                });
                if (!resp.ok) return null;
                const blob = await resp.blob();
                const reader = new FileReader();
                return await new Promise(resolve => {
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            } catch(e) {
                return null;
            }
        }
        """,
        {"directUrl": direct_url, "sourceUrl": source_url},
    )
    return base64.b64decode(img_data) if img_data else None


async def extract_generic_card_image(page, url: str, card_name: str, card_key: str) -> dict | None:
    """Extract a generic issuer image candidate, trusting only curated URL hints."""
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    await page.wait_for_timeout(5000)

    raw_images = await page.evaluate(
        """
        () => Array.from(document.images).map((img, index) => {
            const rect = img.getBoundingClientRect();
            return {
                index,
                src: img.currentSrc || img.src || img.getAttribute('src') || img.getAttribute('data-src') || '',
                alt: (img.getAttribute('alt') || '').trim(),
                w: img.naturalWidth || img.width || Math.round(rect.width) || 0,
                h: img.naturalHeight || img.height || Math.round(rect.height) || 0,
            };
        }).filter(img => img.src)
        """
    )

    parsed = urlparse(url)
    images = []
    for image in raw_images:
        src = image.get("src", "")
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            src = f"{parsed.scheme}://{parsed.netloc}{src}"
        image["src"] = src
        if image["w"] >= 100 and image["h"] >= 60:
            images.append(image)

    hints = TRUSTED_GENERIC_IMAGE_URL_HINTS.get(card_key, [])
    for hint in hints:
        hint_lower = hint.lower()
        for image in images:
            if hint_lower in image["src"].lower():
                image["ratio"] = image["w"] / image["h"] if image["h"] else 0
                image["isTrusted"] = True
                return image

    candidates = []
    for image in images:
        ratio = image["w"] / image["h"] if image["h"] else 0
        src_lower = image["src"].lower()
        if "/thumbnails/promos/" in src_lower:
            continue
        if 1.2 < ratio < 2.1 and image_candidate_matches_card(image, card_name, card_key):
            image["ratio"] = ratio
            image["isTrusted"] = False
            candidates.append(image)

    return candidates[0] if candidates else None


async def scrape_all_cards(cards_list: list, dry_run: bool = False, allow_overwrite: bool = False) -> list:
    """Scrape all cards and return report entries."""
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        launch_options = {
            "headless": True,
            "args": [
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ],
        }
        if os.path.exists("/usr/bin/chromium-browser"):
            launch_options["executable_path"] = "/usr/bin/chromium-browser"
        browser = await p.chromium.launch(**launch_options)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 5000},
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        )
        await context.add_init_script(
            'Object.defineProperty(navigator, "webdriver", { get: () => undefined });'
        )
        page = await context.new_page()

        # Pre-extract BDO card mapping from compare page
        needs_bdo_listing = any(
            "bdo" in row["bank"].lower()
            and "secured" not in normalize_key(row["normalized_card_key"])
            and "world_elite" not in normalize_key(row["normalized_card_key"])
            for row in cards_list
        )
        if needs_bdo_listing:
            print("\nExtracting BDO card images from compare page...")
            bdo_card_map = await extract_bdo_cards(page)
        else:
            bdo_card_map = {}


        # Build a lookup: normalized card name -> BDO image URL
        # BDO headings on the compare page include things like:
        # "BDO Gold Mastercard", "BDO Visa Platinum", "Blue from American Express®", etc.
        bdo_name_to_url = {}
        for heading_lower, info in bdo_card_map.items():
            bdo_name_to_url[heading_lower] = info

        # Deduplicate BDO card map by first occurrence per heading
        seen_heading = set()
        deduped_bdo = {}
        for heading_lower, info in sorted(bdo_name_to_url.items()):
            # Clean heading for matching
            clean = heading_lower
            if clean not in seen_heading:
                seen_heading.add(clean)
                deduped_bdo[clean] = info
        bdo_name_to_url = deduped_bdo
        print(f"  (after dedup: {len(bdo_name_to_url)} unique cards)")

        # Track image hashes to detect duplicates
        hash_registry: dict[str, str] = {}  # hash -> first card_key that used it

        results = []
        total = len(cards_list)

        for idx, row in enumerate(cards_list):
            raw_key = row["normalized_card_key"]
            card_key = normalize_key(raw_key)
            card_name = row["card_name"]
            bank = row["bank"]
            source_url = resolve_source_url(row)

            print(f"\n{'='*60}")
            print(f"[{idx+1}/{total}] 📇 {card_name} ({card_key})")
            if source_url:
                print(f"  🔗 {source_url}")

            clean_path = os.path.join(CLEAN_ASSET_DIR, f"{card_key}.webp")
            clean_rel_path = f"/cards/clean/{card_key}.webp"

            direct_url = None
            status = "needs-manual-review"
            notes = ""
            downloaded_bytes = None
            matched_heading = ""

            # Determine which bank strategy to use
            bank_lower = bank.lower()

            if "bdo" in bank_lower and "secured" not in card_key and "world_elite" not in card_key:
                # Match from BDO compare page
                card_name_norm = normalize_name(card_name)
                bank_norm = normalize_name(bank)

                best_match = None
                best_score = 0

                for heading_lower, info in bdo_name_to_url.items():
                    score = 0
                    if heading_lower == card_name_norm:
                        score = 10
                    elif heading_matches_card(info["heading"], card_name, bank):
                        score = 5

                    if score > best_score:
                        best_score = score
                        best_match = info

                if best_match and best_score >= 5:
                    direct_url = best_match["url"]
                    matched_heading = best_match["heading"]
                    print(f"  ✅ Matched BDO heading: \"{best_match['heading']}\"")
                    print(f"  🖼️  {direct_url}")

                    # Download via page context
                    if not source_url:
                        source_url = BANK_PAGES["bdo"]

                    await page.goto(source_url, wait_until="domcontentloaded", timeout=30000)
                    await page.wait_for_timeout(2000)

                    img_data = await page.evaluate(f"""
                        async () => {{
                            try {{
                                const resp = await fetch('{direct_url}', {{
                                    headers: {{ 'Referer': '{source_url}', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }}
                                }});
                                if (!resp.ok) return null;
                                const blob = await resp.blob();
                                const reader = new FileReader();
                                return await new Promise(resolve => {{
                                    reader.onload = () => resolve(reader.result.split(',')[1]);
                                    reader.readAsDataURL(blob);
                                }});
                            }} catch(e) {{ return null; }}
                        }}
                    """)

                    if img_data:
                        downloaded_bytes = base64.b64decode(img_data)
                        print(f"  ✅ Downloaded {len(downloaded_bytes)} bytes")
                        status = "clean-card"
                        notes = f"Downloaded from BDO compare page on {TODAY}. Matched heading: \"{best_match['heading']}\""
                    else:
                        print(f"  ⚠️  Fetch failed")
                        status = "needs-manual-review"
                        notes = f"Found card on BDO compare page but download failed on {TODAY}."

            elif "bdo" in bank_lower and "secured" in card_key:
                # BDO Secured - known to have no usable image
                status = "official-unavailable"
                notes = "Official page does not expose usable product-card artwork. Verified on 2026-05-22."
                print(f"  📝 Known: BDO Secured has no usable card image")

            elif "bdo" in bank_lower and "world_elite" in card_key:
                # BDO World Elite - uses per-card page
                await page.goto(source_url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(3000)

                found = await page.evaluate('''() => {
                    const results = [];
                    document.querySelectorAll('img').forEach(img => {
                        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                        if (!src) return;
                        const w = img.naturalWidth || img.width || 0;
                        const h = img.naturalHeight || img.height || 0;
                        const ratio = w / h;
                        if (w >= 150 && h >= 100 && 1.3 < ratio && ratio < 2.0) {
                            results.push({src, w, h});
                        }
                    });
                    return results;
                }''')

                if found:
                    direct_url = found[0]["src"]
                    if direct_url.startswith('//'):
                        direct_url = 'https:' + direct_url
                    elif direct_url.startswith('/'):
                        direct_url = f'https://www.bdo.com.ph{direct_url}'
                    print(f"  🖼️  World Elite: {direct_url}")

                    img_data = await page.evaluate(f"""
                        async () => {{
                            try {{
                                const resp = await fetch('{direct_url}', {{
                                    headers: {{ 'Referer': '{source_url}', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }}
                                }});
                                if (!resp.ok) return null;
                                const blob = await resp.blob();
                                const reader = new FileReader();
                                return await new Promise(resolve => {{
                                    reader.onload = () => resolve(reader.result.split(',')[1]);
                                    reader.readAsDataURL(blob);
                                }});
                            }} catch(e) {{ return null; }}
                        }}
                    """)
                    if img_data:
                        downloaded_bytes = base64.b64decode(img_data)
                        status = "clean-card"
                        notes = f"Downloaded from issuer source on {TODAY}."
                    else:
                        status = "needs-manual-review"
                        notes = f"Found context art on {TODAY}."
                else:
                    status = "needs-manual-review"
                    notes = f"Found context art on {TODAY}."

            elif "bpi" in bank_lower or "bank of the philippine" in bank_lower:
                # BPI cards - scrape per-card page
                if not source_url:
                    status = "official-unavailable"
                    notes = f"No source URL configured on {TODAY}."
                else:
                    result = await extract_bpi_card_image(page, source_url)
                    if result:
                        direct_url = result["src"]
                        ratio = result.get("ratio", 0)
                        is_card_face = 1.3 < ratio < 2.0
                        is_card_specific = result.get("isCardSpecific", False)

                        print(f"  🖼️  {direct_url} ({result['w']}x{result['h']}, ratio={ratio:.4f}, cardSpecific={is_card_specific})")

                        # Accept card-ratio images OR card-specific Scene7 art
                        if is_card_face or is_card_specific:
                            # Download via page context
                            img_data = await page.evaluate(f"""
                                async () => {{
                                    try {{
                                        const resp = await fetch('{direct_url}', {{
                                            headers: {{ 'Referer': '{source_url}', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }}
                                        }});
                                        if (!resp.ok) return null;
                                        const blob = await resp.blob();
                                        const reader = new FileReader();
                                        return await new Promise(resolve => {{
                                            reader.onload = () => resolve(reader.result.split(',')[1]);
                                            reader.readAsDataURL(blob);
                                        }});
                                    }} catch(e) {{ return null; }}
                                }}
                            """)
                            if img_data:
                                downloaded_bytes = base64.b64decode(img_data)
                                pil_img = Image.open(io.BytesIO(downloaded_bytes))
                                w, h = pil_img.size
                                actual_ratio = w / h
                                # Accept card-ratio images OR card-specific Scene7 art (even if square)
                                if (1.3 < actual_ratio < 2.0) or (actual_ratio >= 0.9 and actual_ratio <= 1.2 and is_card_specific):
                                    status = "clean-card"
                                    notes = f"Downloaded from issuer source on {TODAY}."
                                    print(f"  ✅ Accepted as clean-card")
                                else:
                                    print(f"  ⚠️  BPI image is context/lifestyle art (ratio={actual_ratio:.4f})")
                                    status = "needs-manual-review"
                                    notes = f"Found context art on {TODAY}. Card-face image not available from bank site."
                            else:
                                status = "needs-manual-review"
                                notes = f"Download failed on {TODAY}."
                        else:
                            print(f"  ⚠️  BPI image is not card-specific (ratio={ratio:.4f})")
                            status = "needs-manual-review"
                            notes = f"Found context art on {TODAY}. Card-face image not available from bank site."
                    else:
                        print(f"  ❌ No images found on page")
                        status = "official-unavailable"
                        notes = f"No usable card-face image found on {TODAY}."

            elif "chinabank" in bank_lower:
                # Chinabank - known to have context art only
                status = "needs-manual-review"
                notes = "Official Chinabank pages expose context/banner art, not clean card-face images. Verified on previous runs."
                print(f"  📝 Chinabank: context art only (no clean card-face)")

            elif "hsbc" in bank_lower:
                # HSBC - check per-card page
                if source_url:
                    result = await extract_bpi_card_image(page, source_url)  # same DOM strategy works
                    if result:
                        direct_url = result["src"]
                        ratio = result.get("ratio", 0)
                        is_card_face = 1.3 < ratio < 2.0

                        print(f"  🖼️  {direct_url} ({result['w']}x{result['h']}, ratio={ratio:.4f})")

                        if is_card_face:
                            img_data = await page.evaluate(f"""
                                async () => {{
                                    try {{
                                        const resp = await fetch('{direct_url}', {{
                                            headers: {{ 'Referer': '{source_url}', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }}
                                        }});
                                        if (!resp.ok) return null;
                                        const blob = await resp.blob();
                                        const reader = new FileReader();
                                        return await new Promise(resolve => {{
                                            reader.onload = () => resolve(reader.result.split(',')[1]);
                                            reader.readAsDataURL(blob);
                                        }});
                                    }} catch(e) {{ return null; }}
                                }}
                            """)
                            if img_data:
                                downloaded_bytes = base64.b64decode(img_data)
                                pil_img = Image.open(io.BytesIO(downloaded_bytes))
                                w, h = pil_img.size
                                actual_ratio = w / h
                                if 1.3 < actual_ratio < 2.0:
                                    status = "clean-card"
                                    notes = f"Downloaded from issuer source on {TODAY}."
                                else:
                                    status = "needs-manual-review"
                                    notes = f"Found context art on {TODAY}."
                            else:
                                status = "needs-manual-review"
                                notes = f"Image found but download failed on {TODAY}."
                        else:
                            status = "needs-manual-review"
                            notes = f"Found context/banner art on {TODAY}."
                    else:
                        status = "official-unavailable"
                        notes = f"No usable card-face image found on {TODAY}."

            elif "equicom" in bank_lower:
                # Equicom - known card-face available
                result = await extract_bpi_card_image(page, source_url)
                if result:
                    direct_url = result["src"]
                    ratio = result.get("ratio", 0)
                    is_card_face = 1.3 < ratio < 2.0
                    print(f"  🖼️  {direct_url}")

                    if is_card_face:
                        img_data = await page.evaluate(f"""
                            async () => {{
                                try {{
                                    const resp = await fetch('{direct_url}', {{
                                        headers: {{ 'Referer': '{source_url}', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }}
                                    }});
                                    if (!resp.ok) return null;
                                    const blob = await resp.blob();
                                    const reader = new FileReader();
                                    return await new Promise(resolve => {{
                                        reader.onload = () => resolve(reader.result.split(',')[1]);
                                        reader.readAsDataURL(blob);
                                    }});
                                }} catch(e) {{ return null; }}
                            }}
                        """)
                        if img_data:
                            downloaded_bytes = base64.b64decode(img_data)
                            status = "clean-card"
                            notes = f"Downloaded from issuer source on {TODAY}."
                        else:
                            status = "official-unavailable"
                            notes = f"Image found but download failed on {TODAY}."
                    else:
                        status = "needs-manual-review"
                        notes = f"Found context art on {TODAY}."
                else:
                    status = "official-unavailable"
                    notes = f"No usable card-face image found on {TODAY}."

            elif "asia united" in bank_lower or "aub" in bank_lower:
                # AUB - known context art
                result = await extract_bpi_card_image(page, source_url)
                if result:
                    direct_url = result["src"]
                    ratio = result.get("ratio", 0)
                    is_card_face = 1.3 < ratio < 2.0
                    if is_card_face:
                        img_data = await page.evaluate(f"""
                            async () => {{
                                try {{
                                    const resp = await fetch('{direct_url}', {{
                                        headers: {{ 'Referer': '{source_url}', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }}
                                    }});
                                    if (!resp.ok) return null;
                                    const blob = await resp.blob();
                                    const reader = new FileReader();
                                    return await new Promise(resolve => {{
                                        reader.onload = () => resolve(reader.result.split(',')[1]);
                                        reader.readAsDataURL(blob);
                                    }});
                                }} catch(e) {{ return null; }}
                            }}
                        """)
                        if img_data:
                            downloaded_bytes = base64.b64decode(img_data)
                            status = "clean-card"
                            notes = f"Downloaded from issuer source on {TODAY}."
                        else:
                            status = "needs-manual-review"
                            notes = f"Found context art on {TODAY}."
                    else:
                        status = "needs-manual-review"
                        notes = f"Found context/banner art on {TODAY}."
                else:
                    status = "needs-manual-review"
                    notes = f"Found context art on {TODAY}."

            elif source_url:
                # Generic per-card official page scraper for Stage 2 candidates.
                result = await extract_generic_card_image(page, source_url, card_name, card_key)
                if result:
                    direct_url = result["src"]
                    ratio = result.get("ratio", 0)
                    is_card_face = 1.3 < ratio < 2.0
                    is_trusted = result.get("isTrusted", False)
                    print(f"  Generic image candidate: {direct_url} ({result['w']}x{result['h']}, ratio={ratio:.4f}, trusted={is_trusted})")

                    if not is_trusted:
                        status = "needs-manual-review"
                        notes = f"Generic image candidate requires manual review on {TODAY}."
                    elif is_card_face or is_trusted:
                        downloaded_bytes = await download_image_bytes(page, direct_url, source_url)
                        if downloaded_bytes:
                            pil_img = Image.open(io.BytesIO(downloaded_bytes))
                            w, h = pil_img.size
                            actual_ratio = w / h
                            if (1.3 < actual_ratio < 2.0) or (0.9 <= actual_ratio <= 1.2 and is_trusted):
                                status = "clean-card"
                                notes = f"Downloaded from generic issuer source strategy on {TODAY}."
                            else:
                                status = "needs-manual-review"
                                notes = f"Generic source image is context art on {TODAY} (ratio={actual_ratio:.4f})."
                        else:
                            status = "needs-manual-review"
                            notes = f"Generic source image found but download failed on {TODAY}."
                    else:
                        status = "needs-manual-review"
                        notes = f"Generic source image looked like context/banner art on {TODAY}."
                else:
                    status = "official-unavailable"
                    notes = f"No usable image found by generic source strategy on {TODAY}."

            else:
                status = "needs-manual-review"
                notes = f"No scraping strategy for {bank} on {TODAY}."

            # ─── Duplicate hash detection ───
            if downloaded_bytes:
                img_hash = image_hash(downloaded_bytes)
                existing_key = hash_registry.get(img_hash)
                if existing_key and existing_key != card_key:
                    print(f"  ⚠️  DUPLICATE HASH: same image as {existing_key}! Marking needs-manual-review.")
                    status = "needs-manual-review"
                    notes = f"Image hash matches {existing_key}. Possible duplicate or incorrect scrape."
                    downloaded_bytes = None
                else:
                    hash_registry[img_hash] = card_key

            # ─── Process to clean WebP ───
            has_clean = False
            if downloaded_bytes:
                asset_result = process_clean_asset_candidate(
                    card_key=card_key,
                    raw_bytes=downloaded_bytes,
                    clean_path=clean_path,
                    dry_run=dry_run,
                    allow_overwrite=allow_overwrite,
                )
                duplicate_key = asset_result.get("duplicate_key")
                info = asset_result.get("info")
                if duplicate_key:
                    print(f"  DUPLICATE CLEAN ASSET: processed output matches {duplicate_key}. Marking needs-manual-review.")
                    status = "needs-manual-review"
                    notes = f"Processed clean asset hash matches {duplicate_key}. Possible duplicate or incorrect scrape."
                elif asset_result.get("preserved"):
                    print(f"  Preserved existing clean WebP: {clean_rel_path} (use --allow-overwrite to replace)")
                    has_clean = True
                elif asset_result.get("would_write"):
                    print(f"  DRY RUN: would save clean WebP: {clean_rel_path} ({info['file_size_kb']} KB)")
                    has_clean = os.path.exists(clean_path)
                elif asset_result.get("wrote"):
                    print(f"  Saved clean WebP: {clean_rel_path} ({info['file_size_kb']} KB)")
                    has_clean = True

            results.append({
                "normalized_card_key": card_key,
                "bank": bank,
                "card_name": card_name,
                "source_page_url": source_url,
                "direct_image_url": direct_url,
                "local_asset_path": clean_rel_path if has_clean else None,
                "status": status,
                "checked_at": TODAY,
                "notes": notes,
            })

        await browser.close()
        return results


# ─── Validation ───

def validate_report(results: list, live_rows: list, dry_run: bool = False) -> list[str]:
    """Validate report against the rows intentionally processed."""
    issues = []

    # Check row count
    if len(results) != len(live_rows):
        issues.append(f"ROW COUNT MISMATCH: report has {len(results)} rows, expected rows has {len(live_rows)} rows")

    # Check for extra keys (keys in report not in live DB)
    report_keys = {r["normalized_card_key"] for r in results}
    live_keys = {normalize_key(r["normalized_card_key"]) for r in live_rows}

    extra = report_keys - live_keys
    missing = live_keys - report_keys

    if extra:
        issues.append(f"EXTRA KEYS in report (not in expected rows): {', '.join(sorted(extra))}")
    if missing:
        issues.append(f"MISSING KEYS from expected rows (not in report): {', '.join(sorted(missing))}")

    # Check for duplicate keys in report
    seen_keys = {}
    for r in results:
        k = r["normalized_card_key"]
        if k in seen_keys:
            issues.append(f"DUPLICATE KEY: {k} appears twice in report")
        seen_keys[k] = True

    # Check required fields
    for r in results:
        if not r.get("source_page_url"):
            issues.append(f"MISSING source_page_url for {r['normalized_card_key']}")
        if not r.get("checked_at"):
            issues.append(f"MISSING checked_at for {r['normalized_card_key']}")

    # Check for duplicate hashes in final clean assets
    asset_hashes = {}
    for r in results:
        path = os.path.join(CLEAN_ASSET_DIR, f"{r['normalized_card_key']}.webp")
        if os.path.exists(path):
            with open(path, "rb") as f:
                h = image_hash(f.read())
            if h in asset_hashes:
                issues.append(f"DUPLICATE FILE HASH: {r['normalized_card_key']} has same hash as {asset_hashes[h]}")
            asset_hashes[h] = r['normalized_card_key']

    # Check file existence for clean-card status
    for r in results:
        if r["status"] == "clean-card":
            path = os.path.join(CLEAN_ASSET_DIR, f"{r['normalized_card_key']}.webp")
            if not dry_run and not os.path.exists(path):
                issues.append(f"MISSING FILE: clean-card {r['normalized_card_key']} has no WebP at {path}")

    return issues


# ─── Main ───

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scrape and process official credit-card images with explicit Stage 2 safety rails."
    )
    parser.add_argument(
        "--keys",
        action="append",
        help="Comma, space, or newline-delimited normalized_card_key values to process. Repeatable.",
    )
    parser.add_argument(
        "--keys-file",
        help="File containing normalized_card_key values, one per line or comma-delimited. # comments are ignored.",
    )
    parser.add_argument(
        "--input-rows",
        help="JSON file of candidate rows to process instead of live public truva_credit_cards rows.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run the scraper without writing clean assets or the canonical report.",
    )
    parser.add_argument(
        "--allow-overwrite",
        action="store_true",
        help="Allow replacing existing public/cards/clean assets. Default preserves them.",
    )
    parser.add_argument(
        "--report-output",
        help="Optional JSON report path. Required for curated non-dry-run subsets.",
    )
    parser.add_argument(
        "--list-source-urls",
        action="store_true",
        help="Resolve source URLs for the selected live rows and exit before launching the browser.",
    )
    return parser.parse_args()


def same_path(left: str, right: str) -> bool:
    return os.path.abspath(left).casefold() == os.path.abspath(right).casefold()


def read_env_file() -> dict[str, str]:
    env_path = os.path.join(TRUVA_ROOT, ".env.local")
    env_vars: dict[str, str] = {}
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    return env_vars


def fetch_live_rows() -> list[dict]:
    env_vars = read_env_file()
    supabase_url = env_vars.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_key = env_vars.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        raise RuntimeError("Missing Supabase credentials in .env.local")

    import urllib.request

    api_url = (
        f"{supabase_url}/rest/v1/truva_credit_cards"
        "?select=normalized_card_key,card_name,bank,source_url&order=normalized_card_key"
    )
    req = urllib.request.Request(
        api_url,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def load_input_rows(path: str) -> list[dict]:
    input_path = path if os.path.isabs(path) else os.path.join(TRUVA_ROOT, path)
    with open(input_path, encoding="utf-8") as f:
        rows = json.load(f)
    if not isinstance(rows, list):
        raise ValueError("--input-rows must point to a JSON array")

    required = {"normalized_card_key", "bank", "card_name", "source_url"}
    missing_messages = []
    for idx, row in enumerate(rows):
        if not isinstance(row, dict):
            missing_messages.append(f"row {idx + 1} is not an object")
            continue
        missing = sorted(required - set(row.keys()))
        if missing:
            missing_messages.append(f"row {idx + 1} missing: {', '.join(missing)}")
    if missing_messages:
        raise ValueError("; ".join(missing_messages))
    return rows


def resolve_report_output(args: argparse.Namespace, is_partial_run: bool) -> str | None:
    output = args.report_output
    if output:
        output = output if os.path.isabs(output) else os.path.join(TRUVA_ROOT, output)
    else:
        output = REPORT_PATH

    if args.dry_run and args.report_output and same_path(output, REPORT_PATH):
        raise ValueError("--dry-run cannot write the canonical scrape report. Use a scratch --report-output path.")

    if args.dry_run and same_path(output, REPORT_PATH):
        return None

    if is_partial_run and same_path(output, REPORT_PATH):
        raise ValueError("Curated/input-row runs cannot write the canonical scrape report. Use --report-output.")

    return output


def write_report(results: list[dict], output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        f.write("\n")


def print_source_url_plan(rows: list[dict]) -> int:
    missing = 0
    for row in rows:
        key = normalize_key(row["normalized_card_key"])
        source_url = resolve_source_url(row)
        marker = "OK" if source_url else "MISSING"
        if not source_url:
            missing += 1
        print(f"  {marker} {key} | {row['bank']} | {row['card_name']} | {source_url}")
    return missing


def print_summary(results: list[dict], expected_rows: list[dict]) -> None:
    clean = sum(1 for r in results if r["status"] == "clean-card")
    review = sum(1 for r in results if r["status"] == "needs-manual-review")
    unavailable = sum(1 for r in results if r["status"] == "official-unavailable")
    with_direct = sum(1 for r in results if r.get("direct_image_url"))
    print(f"  Clean cards:       {clean}")
    print(f"  Needs review:      {review}")
    print(f"  Unavailable:       {unavailable}")
    print(f"  With direct URL:   {with_direct}")
    print(f"  Report entries:    {len(results)}")
    print(f"  Expected rows:     {len(expected_rows)}")


def main() -> int:
    args = parse_args()
    selected_keys = load_selected_keys(args.keys, args.keys_file)

    print("=" * 60)
    print("Truva Batch Credit Card Image Scraper v2")
    print("=" * 60)
    print("\nLoading card rows...")

    try:
        if args.input_rows:
            live_rows = load_input_rows(args.input_rows)
            source_label = args.input_rows
        else:
            live_rows = fetch_live_rows()
            source_label = "Supabase public truva_credit_cards"
        rows_to_process = filter_rows_by_keys(live_rows, selected_keys)
        is_partial_run = bool(selected_keys or args.input_rows)
        report_output = None if args.list_source_urls else resolve_report_output(args, is_partial_run)
    except Exception as exc:
        print(f"  ERROR: {exc}")
        return 1

    print(f"  Loaded {len(live_rows)} row(s) from {source_label}")
    if selected_keys:
        print(f"  Curated key mode: {len(rows_to_process)} selected row(s)")
    if args.dry_run:
        print("  Dry run: clean assets and canonical report will not be written")
    if not args.allow_overwrite:
        print("  Existing clean assets will be preserved; use --allow-overwrite to replace them")

    print(f"\nCards to process: {len(rows_to_process)}")
    print(f"  Clean asset dir: {CLEAN_ASSET_DIR}")
    print(f"  Report: {report_output or '(not written)'}")

    if args.list_source_urls:
        print("\nResolved source URLs:")
        missing = print_source_url_plan(rows_to_process)
        if missing:
            print(f"\nERROR: {missing} selected row(s) have no source URL")
            return 1
        return 0

    os.makedirs(CLEAN_ASSET_DIR, exist_ok=True)
    try:
        results = asyncio.run(
            scrape_all_cards(
                rows_to_process,
                dry_run=args.dry_run,
                allow_overwrite=args.allow_overwrite,
            )
        )
    except ModuleNotFoundError as exc:
        missing = exc.name or "dependency"
        print(f"  ERROR: Missing Python dependency '{missing}'.")
        print("  Install scraper dependencies with:")
        print("    python -m pip install playwright Pillow")
        print("    python -m playwright install chromium")
        return 1

    if report_output:
        write_report(results, report_output)
        print(f"\nWrote report: {report_output}")
    else:
        print("\nDry run: report not written")

    print(f"\n{'='*60}")
    print("REPORT VALIDATION")
    issues = validate_report(results, rows_to_process, dry_run=args.dry_run)
    if issues:
        print(f"  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    - {issue}")
    else:
        print("  All validations passed")

    print(f"\n{'='*60}")
    print("SUMMARY")
    print_summary(results, rows_to_process)
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
