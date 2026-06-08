#!/usr/bin/env python3
"""Regression tests for batch_card_images.py safety helpers."""

import argparse
import importlib.util
import os
import tempfile
import unittest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT_PATH = os.path.join(ROOT, "scripts", "batch_card_images.py")

spec = importlib.util.spec_from_file_location("batch_card_images", SCRIPT_PATH)
batch_card_images = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(batch_card_images)


BPI_STAGE_ONE_KEYS = {
    "bpi_amore_cashback_card": "https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-classic",
    "bpi_amore_platinum_cashback_card": "https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-platinum",
    "bpi_edge_card": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-edge-mastercard",
    "bpi_gold_rewards_card": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-gold-mastercard",
    "bpi_platinum_rewards_mastercard": "https://www.bpi.com.ph/personal/cards/credit-cards/bpi-platinum-rewards-mastercard",
    "bpi_signature_card": "https://www.bpi.com.ph/personal/cards/credit-cards/visa-signature",
    "petron_bpi_card": "https://www.bpi.com.ph/personal/cards/credit-cards/petron-bpi-mastercard",
}


class BatchCardImageSafetyTests(unittest.TestCase):
    def test_normalized_url_lookup_resolves_space_form_bpi_overrides(self):
        self.assertEqual(batch_card_images.normalize_key("bpi amore cashback card"), "bpi_amore_cashback_card")
        self.assertEqual(batch_card_images.normalize_key("Petron BPI Card"), "petron_bpi_card")

        for key, expected_url in BPI_STAGE_ONE_KEYS.items():
            with self.subTest(key=key):
                row = {
                    "normalized_card_key": key,
                    "card_name": key,
                    "bank": "Bank of the Philippine Islands",
                    "source_url": "",
                }
                self.assertEqual(batch_card_images.resolve_source_url(row), expected_url)

    def test_stage2d_eastwest_hints_are_registered(self):
        self.assertIn(
            "gold-mc-emv_2025",
            batch_card_images.TRUSTED_GENERIC_IMAGE_URL_HINTS["eastwest_gold_mastercard"],
        )
        self.assertIn(
            "visa-platinum-emv_2025",
            batch_card_images.TRUSTED_GENERIC_IMAGE_URL_HINTS["eastwest_visa_platinum"],
        )

    def test_stage2e_metrobank_hints_and_urls_are_registered(self):
        self.assertIn(
            "mfree-mastercard-card",
            batch_card_images.TRUSTED_GENERIC_IMAGE_URL_HINTS["m_free_credit_card"],
        )
        self.assertIn(
            "titanium-mastercard-card",
            batch_card_images.TRUSTED_GENERIC_IMAGE_URL_HINTS["metrobank_titanium_mastercard"],
        )
        self.assertEqual(
            batch_card_images.PER_CARD_URLS_BY_KEY["m_free_credit_card"],
            "https://www.metrobank.com.ph/personal/cards/credit-cards/mfree",
        )
        self.assertEqual(
            batch_card_images.PER_CARD_URLS_BY_KEY["metrobank_titanium_mastercard"],
            "https://www.metrobank.com.ph/personal/cards/credit-cards/titanium",
        )

    def test_stage2f_rcbc_black_direct_image_override_is_registered(self):
        self.assertEqual(
            batch_card_images.DIRECT_IMAGE_URL_OVERRIDES["rcbc_black_card_platinum_mastercard"],
            "https://rcbccredit.com/img/card/black-MC.png",
        )

    def test_stage2g_rcbc_direct_image_overrides_are_registered(self):
        expected = {
            "rcbc_classic_mastercard": "https://rcbccredit.com/img/card/Mastercard%20Classic(1).png",
            "rcbc_gold_mastercard": "https://rcbccredit.com/img/card/RCBC%20Gold%20Credit%20Card%20Mastercard.png",
            "rcbc_diamond_card_platinum_mastercard": "https://rcbccredit.com/img/card/diamond-mastercard.png",
            "rcbc_airmiles_visa_signature": "https://rcbccredit.com/img/card/RCBC-Airmiles-Visa-Signature.png",
        }

        for key, image_url in expected.items():
            with self.subTest(key=key):
                self.assertEqual(batch_card_images.DIRECT_IMAGE_URL_OVERRIDES[key], image_url)

    def test_selected_keys_are_normalized_deduped_and_ordered(self):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as temp:
            temp.write("bpi_gold_rewards_card # keep comments out\n")
            temp.write("petron_bpi_card, bpi_edge_card\n")
            keys_file = temp.name

        try:
            keys = batch_card_images.load_selected_keys(
                ["BPI_EDGE_CARD,bpi_amore_cashback_card", "petron_bpi_card"],
                keys_file,
            )
        finally:
            os.remove(keys_file)

        self.assertEqual(
            keys,
            [
                "bpi_edge_card",
                "bpi_amore_cashback_card",
                "petron_bpi_card",
                "bpi_gold_rewards_card",
            ],
        )

    def test_filter_rows_by_keys_preserves_requested_order_and_fails_missing(self):
        live_rows = [
            {"normalized_card_key": "bpi_edge_card", "card_name": "BPI Edge Card"},
            {"normalized_card_key": "petron_bpi_card", "card_name": "Petron BPI Card"},
            {"normalized_card_key": "bpi_signature_card", "card_name": "BPI Signature Card"},
        ]

        selected = batch_card_images.filter_rows_by_keys(
            live_rows,
            ["petron_bpi_card", "bpi_edge_card"],
        )
        self.assertEqual([row["normalized_card_key"] for row in selected], ["petron_bpi_card", "bpi_edge_card"])

        with self.assertRaisesRegex(ValueError, "not found"):
            batch_card_images.filter_rows_by_keys(live_rows, ["missing_card"])

    def test_report_output_blocks_partial_canonical_writes(self):
        self.assertIsNone(
            batch_card_images.resolve_report_output(
                argparse.Namespace(dry_run=True, report_output=None),
                is_partial_run=False,
            )
        )

        with self.assertRaisesRegex(ValueError, "Curated/input-row runs cannot write"):
            batch_card_images.resolve_report_output(
                argparse.Namespace(dry_run=False, report_output=None),
                is_partial_run=True,
            )

        with self.assertRaisesRegex(ValueError, "dry-run cannot write"):
            batch_card_images.resolve_report_output(
                argparse.Namespace(dry_run=True, report_output=batch_card_images.REPORT_PATH),
                is_partial_run=False,
            )

        with tempfile.TemporaryDirectory() as temp_dir:
            scratch_report = os.path.join(temp_dir, "scratch-report.json")
            self.assertEqual(
                batch_card_images.resolve_report_output(
                    argparse.Namespace(dry_run=False, report_output=scratch_report),
                    is_partial_run=True,
                ),
                scratch_report,
            )

    def test_existing_clean_asset_is_preserved_without_overwrite(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            clean_path = os.path.join(temp_dir, "bpi_edge_card.webp")
            with open(clean_path, "wb") as clean_file:
                clean_file.write(b"existing-clean-asset")

            result = batch_card_images.process_clean_asset_candidate(
                card_key="bpi_edge_card",
                raw_bytes=b"not-even-an-image",
                clean_path=clean_path,
                dry_run=False,
                allow_overwrite=False,
            )

            self.assertTrue(result["preserved"])
            self.assertFalse(result["wrote"])
            with open(clean_path, "rb") as clean_file:
                self.assertEqual(clean_file.read(), b"existing-clean-asset")


if __name__ == "__main__":
    unittest.main()
