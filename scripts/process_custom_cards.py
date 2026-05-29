#!/usr/bin/env python3
import os
import sys
from PIL import Image, ImageDraw, ImageChops
import io

TRUVA_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN_ASSET_DIR = os.path.join(TRUVA_ROOT, "public", "cards", "clean")

CARD_CANVAS_W = 960
CARD_CANVAS_H = 606
PADDING_RATIO = 0.02

def process_to_clean_card(input_path: str, output_path: str):
    """Convert raw image to 960x606 WebP with 2% transparent padding, after transparentizing the background and cropping."""
    print(f"Processing {input_path} -> {output_path}")
    img = Image.open(input_path)
    
    # Auto-rotate vertical cards 90 degrees counter-clockwise to lay horizontally
    w, h = img.size
    if h > w:
        print(f"Card is vertical ({w}x{h}). Rotating 90 degrees counter-clockwise to match horizontal styles.")
        img = img.transpose(Image.ROTATE_90)

    if img.mode != "RGBA":
        img = img.convert("RGBA")

    w, h = img.size
    
    # Safe crop using corner flood-fill for white/transparent only
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

    # Apply smooth rounded transparent corner mask
    mask = Image.new('L', cropped.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, cropped.width - 1, cropped.height - 1), radius=18, fill=255)
    
    r_chan, g_chan, b_chan, a_chan = cropped.split()
    final_a = ImageChops.multiply(a_chan, mask)
    img_cropped = Image.merge('RGBA', (r_chan, g_chan, b_chan, final_a))

    # Proceed with standard resizing and transparent padding
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
    print(f"Saved to {output_path} successfully.")

def main():
    custom_cards = {
        "bdo-world-elite-mastercard.png": "bdo_world_elite_mastercard.webp",
        "bdo-secured-credit-card.png": "bdo_secured_credit_card.webp",
        "chinabank-athome-visa-platinum.png": "chinabank_athome_visa_platinum.webp",
        "chinabank-cash-rewards-mastercard.png": "chinabank_cash_rewards_mastercard.webp",
        "chinabank-freedom-mastercard.png": "chinabank_freedom_mastercard.webp"
    }

    for png_name, webp_name in custom_cards.items():
        src_path = os.path.join(TRUVA_ROOT, "public", "cards", png_name)
        dest_path = os.path.join(CLEAN_ASSET_DIR, webp_name)
        if os.path.exists(src_path):
            process_to_clean_card(src_path, dest_path)
        else:
            print(f"Error: Source file does not exist: {src_path}", file=sys.stderr)

if __name__ == "__main__":
    main()
