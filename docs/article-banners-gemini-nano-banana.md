# Truva Brand-Guided Article Banners (Gemini "Nano Banana")

This guide creates **background-only** (no text/logo) editorial banner images for Truva articles, designed to sit behind overlaid site typography.

## Model + output

- **Model (Nano Banana 2 Preview):** `gemini-3.1-flash-image-preview`
- **Aspect ratio:** `16:9`
- **Resolution:** `2K`
- **Response modality:** `IMAGE` only

## 1) Master system instruction (brand lock)

Copy/paste this as your **system instruction** (or paste at the top of your prompt if you can't set system instruction separately):

```text
You are generating an editorial banner BACKGROUND for Truva, a high-trust Filipino financial comparison app. This banner will have website typography overlaid later, so the image must contain NO text, NO numbers, NO logos, NO trademarks, and NO watermarks.

Brand feel: trusted financial institution; clean, precise, premium, digital-native; minimalist; subtle glassmorphism (soft blur, gentle shadows); crisp vector-like shapes.

Color palette (strict): white #FFFFFF, Truva primary blue #0052FF, Truva tint #EBF0FF, surface #F8F9FB, border #E4E7EC. Use at most one saturated accent (Truva blue). Do NOT introduce other saturated colors. Never use red as a dominant color.

Allowed abstract motifs (no legible UI copy): rounded comparison cards, faint table-row stripes, simple chart shapes (lines/bars without labels), calculator outline, thin grid lines, subtle blue glow. Everything should feel like modern fintech UI, not illustration art.

Composition (critical): keep the LEFT ~45% of the frame mostly empty with a clean soft gradient for text overlay. Place subtle abstract UI/data elements on the RIGHT side only. Maintain high contrast and low visual noise in the left safe area.

Hard exclusions: people, faces, hands; coins/piggy banks/peso signs; upward arrows or cliche finance iconography; bank logos; any text or typographic glyphs; busy textures; heavy multi-color gradients; cartoonish 3D.

Output: one modern, crisp, minimalist 16:9 banner background that visually evokes the topic without using any text.
```

## 2) Per-article "banner brief" prompt template

Copy/paste and fill the placeholders for each article:

```text
Banner brief (topic context only):
- Article title: "{{ARTICLE_TITLE}}"
- Section: "{{SECTION}}" (e.g., Banking / Rates, Banking / Reviews, Guides)
- Keywords: {{KEYWORDS}} (3-7 short phrases)
- Visual focus: "{{VISUAL_FOCUS}}" (one short phrase; e.g., "after-tax yield comparison UI", "tax rules ledger + calculator UI", "PDIC safety + deposit split UI")

Generate the Truva brand-consistent banner background following the system instruction. Keep the left ~45% clean negative space for overlay text; keep all abstract elements on the right; no text/numbers/logos.
```

## 3) Gemini API `generateContent` request JSON (REST)

Use this payload with:

`POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`

```json
{
  "system_instruction": {
    "parts": [
      {
        "text": "PASTE_MASTER_SYSTEM_INSTRUCTION_HERE"
      }
    ]
  },
  "contents": [
    {
      "parts": [
        {
          "text": "PASTE_PER_ARTICLE_BANNER_BRIEF_HERE"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE"],
    "imageConfig": {
      "aspectRatio": "16:9",
      "imageSize": "2K"
    }
  }
}
```

Notes:
- The Gemini REST API uses `system_instruction` (snake_case). Some SDKs use `systemInstruction` in their config objects.
- If you get any text/logo/people or the left side is too busy, regenerate and tighten `VISUAL_FOCUS`.

## Quick test set (3 real Truva topics)

1) **Best digital bank Philippines 2026: rates, conditions & real peso math**
```text
Banner brief (topic context only):
- Article title: "Best digital bank Philippines 2026: rates, conditions & real peso math"
- Section: "Banking / Rates"
- Keywords: digital banks PH, savings rates, after-tax yield, comparisons, peso math
- Visual focus: "comparison cards + chart shapes"
```

2) **Final Withholding Tax explained: the 20% cut on savings interest in the Philippines**
```text
Banner brief (topic context only):
- Article title: "Final Withholding Tax explained: the 20% cut on savings interest in the Philippines"
- Section: "Guides"
- Keywords: final withholding tax, 20% tax, after-tax interest, savings math, Philippines
- Visual focus: "tax rules ledger + calculator outline"
```

3) **PDIC insurance explained: how your deposits are protected**
```text
Banner brief (topic context only):
- Article title: "PDIC insurance explained: how your deposits are protected"
- Section: "Guides"
- Keywords: PDIC, deposit insurance, 1,000,000 limit, safety, split deposits
- Visual focus: "shield outline + deposit split cards"
```

## Banner QA checklist (fast)

- No text, numbers, logos, watermarks, or brand marks.
- Left ~45% is clean, low-noise negative space for overlay typography.
- Palette stays within white + Truva blues + subtle neutrals (no extra saturated colors).
- Abstract elements are on the right and feel "institutional fintech UI", not illustration.

## Automation: generate JSON from an article slug

If an article exists in `lib/editorial.ts`, you can generate a ready-to-send `generateContent` request body automatically:

```bash
npm run --silent banners:json -- best-digital-bank-philippines
```

Optional:

```bash
# Override visual focus (recommended for best results)
npm run --silent banners:json -- final-withholding-tax-explained --focus="tax rules ledger + calculator outline"

# Also write a file under artifacts/publish-ready/banner-json/
npm run --silent banners:json -- pdic-insurance-guide --write
```
