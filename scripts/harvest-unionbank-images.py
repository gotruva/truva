"""Harvest UnionBank card art from the credit-cards hub page.

The hub page (unionbankph.com/cards/credit-card) renders every card's clean
art with identifying alt text / filenames; per-product pages only expose a
shared hero banner (the generic batch scraper grabbed the floating Help
button). Downloads go through the live browser context because Akamai
cookie-gates even static files. Originals live at the thumbnail path minus
the /styles/<style>/public segment.

Run headful (the site 403s any headless browser):
    py -3 tmp/harvest_unionbank.py
"""
import asyncio
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts"))
from batch_card_images import process_to_clean_card, CLEAN_ASSET_DIR  # noqa: E402

from PIL import Image  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

HUB_URL = "https://www.unionbankph.com/cards/credit-card"
INVENTORY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unionbank-image-inventory.json")
RESULTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unionbank-harvest-results.json")

# key -> list of lowercase filename fragments that must ALL appear
KEY_FRAGMENTS: dict[str, list[str]] = {
    "u_visa_platinum": ["ucard-visa"],
    "u_platinum_mastercard": ["ucard-mc"],
    "unionbank_s_and_r_visa_platinum": ["snr"],
    "unionbank_shell_power_visa_platinum": ["shell-power"],
    "unionbank_reserve_world_elite_mastercard": ["reserve-no-name-mc"],
    "unionbank_reserve_visa_infinite_credit_card": ["reserve-no-name-visa"],
    "unionbank_cash_back_titanium_mastercard": ["cash-back-no-name-mc"],
    "unionbank_cash_back_visa_platinum_credit_card": ["cash-back-no-name-visa"],
    "unionbank_miles_plus_world_mastercard": ["miles-no-name-mc"],
    "unionbank_miles_plus_visa_signature_credit_card": ["miles-no-name-visa"],
    "unionbank_rewards_platinum_mastercard": ["rewards-no-name-mc"],
    # rewards_visa_platinum: no unambiguous card-face filename on the hub
    # (only featured-banner art) - left on the branded fallback deliberately.
    "go_rewards_platinum_visa_credit_card": ["go-rewards-plat"],
    "unionbank_mercury_visa": ["mercury-visa"],
    "unionbank_play_everyday_credit_card": ["playeveryday"],
    "cebu_pacific_gold_credit_card": ["ceb", "gold"],
    "cebu_pacific_platinum_credit_card": ["ceb", "plat"],
}

STYLE_SEGMENT = re.compile(r"/styles/[^/]+/public")


def original_url(src: str) -> str:
    return STYLE_SEGMENT.sub("", src).split("?")[0]


async def fetch_bytes(page, url: str) -> bytes | None:
    """Download inside the page context - Akamai rejects Playwright's own
    HTTP stack (page.request) but allows the real browser's fetch()."""
    import base64
    try:
        b64 = await page.evaluate(
            """async (url) => {
                try {
                    const resp = await fetch(url, {credentials: 'include'});
                    if (!resp.ok) return null;
                    const blob = await resp.blob();
                    return await new Promise(res => {
                        const r = new FileReader();
                        r.onload = () => res(r.result.split(',')[1]);
                        r.readAsDataURL(blob);
                    });
                } catch (e) { return null; }
            }""",
            url,
        )
        if b64:
            raw = base64.b64decode(b64)
            if len(raw) > 2000:
                return raw
    except Exception as exc:
        print(f"    fetch error {type(exc).__name__}: {exc}")
    return None


async def main() -> int:
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False, channel="chrome",
            args=["--disable-blink-features=AutomationControlled"],
        )
        ctx = await browser.new_context(viewport={"width": 1366, "height": 900}, locale="en-PH")
        page = await ctx.new_page()
        resp = await page.goto(HUB_URL, wait_until="domcontentloaded", timeout=60000)
        print("hub status:", resp.status if resp else None)
        try:
            await page.wait_for_load_state("networkidle", timeout=20000)
        except Exception:
            pass
        # Scroll to force lazy sections to load
        for _ in range(8):
            await page.mouse.wheel(0, 1200)
            await page.wait_for_timeout(400)
        await page.wait_for_timeout(1500)

        imgs = await page.eval_on_selector_all(
            "img",
            "els => els.map(e => ({src: e.currentSrc || e.getAttribute('src') || '', alt: e.alt || ''}))"
            ".filter(i => i.src && i.src.includes('/sites/default/files'))",
        )
        # de-dup by src
        seen, inventory = set(), []
        for i in imgs:
            if i["src"] in seen:
                continue
            seen.add(i["src"])
            inventory.append(i)
        with open(INVENTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(inventory, f, indent=1)
        print(f"inventory: {len(inventory)} unique card-area images -> {INVENTORY_PATH}")

        results = {}
        for key, fragments in KEY_FRAGMENTS.items():
            match = None
            for entry in inventory:
                fname = entry["src"].lower().rsplit("/", 1)[-1]
                if all(frag in fname for frag in fragments):
                    match = entry
                    break
            if not match:
                print(f"  ❌ {key}: no filename match for {fragments}")
                results[key] = {"status": "no-match"}
                continue

            candidates = [original_url(match["src"]),
                          STYLE_SEGMENT.sub("/styles/large/public", match["src"]).split("?")[0],
                          match["src"]]
            raw = None
            used_url = None
            for url in candidates:
                raw = await fetch_bytes(page, url)
                if raw:
                    used_url = url
                    break
            if not raw:
                print(f"  ❌ {key}: all downloads failed")
                results[key] = {"status": "download-failed", "src": match["src"]}
                continue

            img = Image.open(io.BytesIO(raw))
            w, h = img.size
            ratio = w / h if h else 0
            if w < 380 or not (1.2 < ratio < 2.1):
                print(f"  ⚠️  {key}: rejected {w}x{h} ratio={ratio:.2f} from {used_url}")
                results[key] = {"status": "rejected-size", "url": used_url, "w": w, "h": h}
                continue

            out_path = os.path.join(CLEAN_ASSET_DIR, f"{key}.webp")
            info = process_to_clean_card(raw, out_path)
            print(f"  ✅ {key}: {w}x{h} from {used_url}")
            results[key] = {"status": "clean-card", "url": used_url, "w": w, "h": h,
                            "asset": f"/cards/clean/{key}.webp", "process": info}

        with open(RESULTS_PATH, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=1)
        ok = sum(1 for r in results.values() if r["status"] == "clean-card")
        print(f"\nDONE: {ok}/{len(KEY_FRAGMENTS)} clean cards. Results -> {RESULTS_PATH}")
        await browser.close()
        return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
