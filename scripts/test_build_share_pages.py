import json
import os
import tempfile
import unittest

try:
    from PIL import Image
except ImportError:  # the scraper workflow runs every test file without installing Pillow
    raise unittest.SkipTest("Pillow is not installed")

from build_share_pages import build, compact, page_html, pick_entries, render_card, safe_text

DATASET = {
    "countries": {
        "Colombia": {
            "name": "Colombia",
            "top_developers": [
                {"rank": 3, "login": "ana", "name": 'Ana <b>"Pérez"</b>', "live_contributions": 21969, "estimated_commits": 1500,
                 "stars_received": 12, "followers": 1200000, "languages": ["Rust", "Go"]},
                {"rank": 1, "login": "zed", "name": "山田太郎", "languages": []},
            ],
        },
        "World": {
            "name": "Global / Worldwide",
            "top_developers": [
                {"rank": 9, "login": "ana", "country": "Colombia"},
                {"rank": 1, "login": "kim", "name": "Kim", "country": "Nowhere"},
            ],
        },
    }
}


class SharePagesTests(unittest.TestCase):
    def test_country_list_wins_and_world_rank_is_attached(self):
        picked = pick_entries(DATASET)
        self.assertEqual(picked["ana"]["key"], "Colombia")
        self.assertEqual(picked["ana"]["world_rank"], 9)
        self.assertEqual(picked["kim"]["key"], "World")
        self.assertEqual(set(picked), {"ana", "zed", "kim"})

    def test_helpers(self):
        self.assertEqual(compact(999), "999")
        self.assertEqual(compact(21969), "22K")
        self.assertEqual(compact(1200000), "1.2M")
        self.assertEqual(safe_text("山田太郎", "fallback"), "fallback")
        self.assertEqual(safe_text("José  Núñez"), "José Núñez")

    def test_page_escapes_content_and_points_to_the_card(self):
        page = page_html(pick_entries(DATASET)["ana"])
        self.assertNotIn("<b>", page)
        self.assertIn("&lt;b&gt;", page)
        self.assertIn('property="og:image" content="https://devcop95.github.io/gitrank/share/ana/card.jpg"', page)
        self.assertIn("#3 in Colombia", page)
        self.assertIn("?country=Colombia&amp;dev=ana", page)

    def test_card_has_the_social_size_with_and_without_avatar(self):
        entry = pick_entries(DATASET)["ana"]
        self.assertEqual(render_card(entry).size, (1200, 630))
        self.assertEqual(render_card(entry, Image.new("RGB", (240, 240), (200, 50, 50))).size, (1200, 630))
        self.assertEqual(render_card(pick_entries(DATASET)["zed"]).size, (1200, 630))

    def test_build_writes_a_folder_per_login(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "data.json")
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(DATASET, fh)
            out = os.path.join(tmp, "out")
            self.assertEqual(build(path, out, download=False), 3)
            for login in ("ana", "zed", "kim"):
                self.assertTrue(os.path.isfile(os.path.join(out, "share", login, "index.html")))
                self.assertTrue(os.path.isfile(os.path.join(out, "share", login, "card.jpg")))


if __name__ == "__main__":
    unittest.main()
