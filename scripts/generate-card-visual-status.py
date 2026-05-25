#!/usr/bin/env python3
"""
Generate lib/credit-card-visual-status.ts from docs/credit-card-image-scrape-report.json.

This script reads the canonical scrape report and writes the TypeScript status map
that powers the app's visual resolution logic. Run this whenever the report changes.

Usage: python3 scripts/generate-card-visual-status.py
"""
import json, os

script_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(script_dir)

report_path = os.path.join(root, "docs", "credit-card-image-scrape-report.json")
out_path = os.path.join(root, "lib", "credit-card-visual-status.ts")

with open(report_path) as f:
    report = json.load(f)

lines = [
    "// Auto-generated from docs/credit-card-image-scrape-report.json — DO NOT EDIT MANUALLY.",
    "// Regenerate with: python3 scripts/generate-card-visual-status.py",
    "// Maps each card key to its current visual status from the scrape report.",
    "// The verify-credit-card-visuals.ts verifier cross-checks this against the live report",
    "// and will fail if they diverge.",
    "export const SCRAPE_REPORT_STATUS_MAP: Record<string, string> = {",
]

for entry in report:
    key = entry["normalized_card_key"]
    status = entry["status"]
    lines.append(f'  "{key}": "{status}",')

lines.append("};\n")

content = "\n".join(lines)
with open(out_path, "w") as f:
    f.write(content)

print(f"✅ Generated {out_path}")
print(f"   {len(report)} entries from {report_path}")