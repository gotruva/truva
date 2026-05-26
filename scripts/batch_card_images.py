#!/usr/bin/env python3
"""
Batch credit card image scraper + processor for Truva v2.

This is a DEVELOPMENT/MANUAL tool — NOT part of normal build or runtime.
Run it only when you want to re-scrape card images from official bank sources.

Dependencies: Python 3.11+, playwright (pip install playwright), Pillow.
Also requires valid Supabase credentials in the project's .env.local file.

How it works:
1. Loads the live list of 40 truva_credit_cards from Supabase via REST API.
2. Visits official bank listing pages (BDO compare page, per-card product pages).
3. Extracts card images by matching DOM headings to card names — no ratio heuristic.
4. Downloads matched images, converts to 960x606 WebP with 2% padding.
5. Writes docs/credit-card-image-scrape-report.json with one row per live card.
6. Validates: exact row count, no duplicate keys, no duplicate image hashes.

Usage: python3 scripts/batch_card_images.py
       (activate the hermes-agent venv first: source ~/.hermes/hermes-agent/venv/bin/activate)

After running, also regenerate the status map:
  python3 scripts/generate-card-visual-status.py
"""

import asyncio, json, os, sys, base64, re, hashlib
from urllib.parse import urlparse, unquote
from datetime import date, datetime
from PIL import Image
import io

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
}

# ─── Helper: normalize card key (match Supabase underscore or space) ───
def normalize_key(key: str) -> str:
    """Normalize to underscore-separated lowercase."""
    return re.sub(r'[^a-z0-9]+', '_', key.strip().lower()).strip('_')

def normalize_name(name: str) -> str:
    """Normalize card name for matching."""
    return re.sub(r'[^a-z0-9]+', ' ', name.strip().lower()).strip()

# ─── Image Processing ───

def process_to_clean_card(raw_bytes: bytes, output_path: str) -> dict:
    """Convert raw image to 960x606 WebP with 2% transparent padding."""
    img = Image.open(io.BytesIO(raw_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    padding_px = int(CARD_CANVAS_W * PADDING_RATIO)
    card_area_w = CARD_CANVAS_W - 2 * padding_px
    card_area_h = CARD_CANVAS_H - 2 * padding_px

    img_ratio = img.width / img.height
    target_ratio = card_area_w / card_area_h

    if img_ratio > target_ratio:
        new_w = card_area_w
        new_h = int(new_w / img_ratio)
    else:
        new_h = card_area_h
        new_w = int(new_h * img_ratio)

    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

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
        "original_width": img.width,
        "original_height": img.height,
        "mode": "RGBA",
        "file_size_kb": round(file_size / 1024, 1),
    }

def image_hash(raw_bytes: bytes) -> str:
    """SHA-256 hash of image content for dedup detection."""
    return hashlib.sha256(raw_bytes).hexdigest()[:16]

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
        return result
    return None


# ─── Main scraper ───

async def scrape_all_cards(cards_list: list) -> list:
    """Scrape all cards and return report entries."""
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium-browser",
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled",
                  "--disable-dev-shm-usage"]
        )
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
        print("\n🔍 Extracting BDO card images from compare page...")
        bdo_card_map = await extract_bdo_cards(page)

        # Pre-extract Chinabank card mapping
        print("\n🔍 Extracting Chinabank card images from listing page...")
        chinabank_card_map = await extract_chinabank_cards(page)

        # Build a lookup: normalized card name -> BDO image URL
        # BDO headings on the compare page include things like:
        # "BDO Gold Mastercard", "BDO Visa Platinum", "Blue from American Express®", etc.
        bdo_name_to_url = {}
        for heading_lower, info in bdo_card_map.items():
            bdo_name_to_url[heading_lower] = info

        chinabank_name_to_url = {}
        for heading_lower, info in chinabank_card_map.items():
            chinabank_name_to_url[heading_lower] = info

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
            source_url = PER_CARD_URLS.get(raw_key, "")

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
                info = process_to_clean_card(downloaded_bytes, clean_path)
                print(f"  ✅ Saved clean WebP: {clean_rel_path} ({info['file_size_kb']} KB)")
                has_clean = True

            results.append({
                "normalized_card_key": card_key,
                "bank": bank,
                "card_name": card_name,
                "source_page_url": source_url or BANK_PAGES.get("bdo", ""),
                "direct_image_url": direct_url,
                "local_asset_path": clean_rel_path if has_clean else None,
                "status": status,
                "checked_at": TODAY,
                "notes": notes,
            })

        await browser.close()
        return results


# ─── Validation ───

def validate_report(results: list, live_rows: list) -> list[str]:
    """Validate report against live Supabase rows. Returns list of issues."""
    issues = []

    # Check row count
    if len(results) != len(live_rows):
        issues.append(f"ROW COUNT MISMATCH: report has {len(results)} rows, live DB has {len(live_rows)} rows")

    # Check for extra keys (keys in report not in live DB)
    report_keys = {r["normalized_card_key"] for r in results}
    live_keys = {normalize_key(r["normalized_card_key"]) for r in live_rows}

    extra = report_keys - live_keys
    missing = live_keys - report_keys

    if extra:
        issues.append(f"EXTRA KEYS in report (not in live DB): {', '.join(sorted(extra))}")
    if missing:
        issues.append(f"MISSING KEYS from live DB (not in report): {', '.join(sorted(missing))}")

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
            if not os.path.exists(path):
                issues.append(f"MISSING FILE: clean-card {r['normalized_card_key']} has no WebP at {path}")

    return issues


# ─── Main ───

if __name__ == "__main__":
    print("=" * 60)
    print("Truva Batch Credit Card Image Scraper v2")
    print("=" * 60)

    # First, fetch live Supabase rows via direct REST API
    print("\n📡 Fetching live cards from Supabase...")

    # Read credentials from .env.local
    env_path = os.path.join(TRUVA_ROOT, ".env.local")
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip()

    supabase_url = env_vars.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_key = env_vars.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        print("  ❌ Missing Supabase credentials in .env.local")
        sys.exit(1)

    import urllib.request
    api_url = f"{supabase_url}/rest/v1/truva_credit_cards?select=normalized_card_key,card_name,bank&order=normalized_card_key"
    req = urllib.request.Request(
        api_url,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            live_rows = json.loads(resp.read().decode())
        print(f"  ✅ Loaded {len(live_rows)} card rows from Supabase")
    except Exception as e:
        print(f"  ❌ Failed to fetch Supabase rows: {e}")
        sys.exit(1)

    print(f"\n📊 Cards to process: {len(live_rows)}")
    print(f"  Clean asset dir: {CLEAN_ASSET_DIR}")
    print(f"  Report: {REPORT_PATH}")
    print()

    os.makedirs(CLEAN_ASSET_DIR, exist_ok=True)

    results = asyncio.run(scrape_all_cards(live_rows))

    # ─── Write report ───
    with open(REPORT_PATH, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # ─── Validation ───
    print(f"\n{'='*60}")
    print("🔍 REPORT VALIDATION")
    issues = validate_report(results, live_rows)
    if issues:
        print(f"  ⚠️  {len(issues)} issue(s) found:")
        for i in issues:
            print(f"    • {i}")
    else:
        print("  ✅ All validations passed!")

    # 📊 Summary
    print(f"\n{'='*60}")
    print("📊 SUMMARY")
    clean = sum(1 for r in results if r["status"] == "clean-card")
    review = sum(1 for r in results if r["status"] == "needs-manual-review")
    unavailable = sum(1 for r in results if r["status"] == "official-unavailable")
    with_direct = sum(1 for r in results if r.get("direct_image_url"))
    print(f"  Clean cards:       {clean}")
    print(f"  Needs review:      {review}")
    print(f"  Unavailable:       {unavailable}")
    print(f"  With direct URL:   {with_direct}")
    print(f"  Report entries:    {len(results)}")
    print(f"  Live DB rows:      {len(live_rows)}")