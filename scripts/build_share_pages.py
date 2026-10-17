"""Builds one static share page + preview image per developer.

Social networks read Open Graph tags without running JavaScript, so a single
index.html cannot show a different preview per developer. This script runs after
`vite build` and writes, for every login in the dataset:

    dist/share/<login>/index.html   OG/Twitter tags for that developer, then redirects to the app
    dist/share/<login>/card.jpg     1200x630 preview with avatar, rank, country and stats

Usage (repo root):  python scripts/build_share_pages.py [dataset.json] [out_dir]
Needs Pillow. Avatars are downloaded when reachable; otherwise initials are drawn.
"""
import html
import io
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

from PIL import Image, ImageDraw, ImageFont

SITE = "https://devcop95.github.io/gitrank/"
W, H = 1200, 630
BLACK = (9, 9, 11)
PANEL = (24, 24, 27)
BORDER = (63, 63, 70)
WHITE = (250, 250, 250)
GRAY = (161, 161, 170)
GREEN = (46, 160, 67)
WORLD_KEY = "World"


@lru_cache(maxsize=None)
def font(size, bold=True):
    names = ["DejaVuSans-Bold.ttf", "arialbd.ttf"] if bold else ["DejaVuSans.ttf", "arial.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def safe_text(value, fallback=""):
    """Keeps only characters the bundled Latin fonts can draw (no tofu boxes)."""
    text = "".join(ch for ch in str(value or "") if ch.isprintable() and (ord(ch) < 0x250 or 0x2010 <= ord(ch) <= 0x2027))
    text = " ".join(text.split())
    return text or fallback


def fit(draw, text, f_size, max_width, bold=True):
    """Shrinks the font, then truncates with an ellipsis, until the text fits."""
    size = f_size
    while size > 22 and draw.textlength(text, font=font(size, bold)) > max_width:
        size -= 2
    f = font(size, bold)
    while len(text) > 1 and draw.textlength(text, font=f) > max_width:
        text = text[:-2].rstrip() + "…"
    return text, f


def compact(n):
    n = int(n or 0)
    for limit, suffix in ((1_000_000, "M"), (1_000, "K")):
        if n >= limit:
            value = n / limit
            return f"{value:.1f}".rstrip("0").rstrip(".") + suffix
    return str(n)


def pick_entries(dataset):
    """Maps login -> {'dev', 'key', 'rank', 'name', 'world_rank'}.

    The country list wins over World so the card reads "#3 in Colombia"; World
    is only used for developers whose country has no list of its own.
    """
    countries = dataset.get("countries", {})
    picked = {}
    for key, entry in countries.items():
        if key == WORLD_KEY:
            continue
        for dev in entry.get("top_developers", []):
            login = dev.get("login")
            if not login:
                continue
            current = picked.get(login)
            if current is None or dev.get("rank", 10**9) < current["dev"].get("rank", 10**9):
                picked[login] = {"dev": dev, "key": key, "name": entry.get("name") or key, "world_rank": None}
    for dev in countries.get(WORLD_KEY, {}).get("top_developers", []):
        login = dev.get("login")
        if not login:
            continue
        if login in picked:
            picked[login]["world_rank"] = dev.get("rank")
        else:
            picked[login] = {"dev": dev, "key": WORLD_KEY, "name": "Worldwide", "world_rank": dev.get("rank")}
    return picked


def headline(entry):
    dev = entry["dev"]
    label = safe_text(dev.get("name") or dev["login"], dev["login"])
    place = f"#{dev.get('rank', '?')} {'Worldwide' if entry['key'] == WORLD_KEY else 'in ' + safe_text(entry['name'], entry['key'])}"
    return label, place


def fetch_avatar(url):
    if not url:
        return None
    sep = "&" if "?" in url else "?"
    for _ in range(2):
        try:
            with urllib.request.urlopen(urllib.request.Request(f"{url}{sep}s=240", headers={"User-Agent": "gitrank-share"}), timeout=10) as res:
                return Image.open(io.BytesIO(res.read())).convert("RGB")
        except Exception:
            continue
    return None


def circle(img, size):
    img = img.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask.resize((size, size), Image.LANCZOS))
    return out


def render_card(entry, avatar=None):
    dev = entry["dev"]
    name, place = headline(entry)
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img)

    # Avatar (or initials)
    size, ax, ay = 220, 80, 80
    d.ellipse((ax - 6, ay - 6, ax + size + 6, ay + size + 6), outline=GREEN, width=4)
    if avatar is not None:
        img.paste(circle(avatar, size), (ax, ay), circle(avatar, size))
    else:
        d.ellipse((ax, ay, ax + size, ay + size), fill=PANEL)
        initial = safe_text(name[:1] or dev["login"][:1]).upper() or "?"
        d.text((ax + size / 2, ay + size / 2), initial, font=font(110), fill=WHITE, anchor="mm")

    # Name + login
    text_x, max_w = 350, W - 350 - 80
    name_text, name_font = fit(d, name, 60, max_w)
    d.text((text_x, 92), name_text, font=name_font, fill=WHITE)
    d.text((text_x, 175), f"@{dev['login']}", font=font(34, bold=False), fill=GRAY)

    # Rank
    place_text, place_font = fit(d, place, 66, max_w)
    d.text((text_x, 235), place_text, font=place_font, fill=GREEN)
    if entry["key"] != WORLD_KEY and entry.get("world_rank"):
        d.text((text_x, 318), f"#{entry['world_rank']} in the global top", font=font(28, bold=False), fill=GRAY)

    # Stats
    stats = (
        ("Contributions", dev.get("live_contributions")),
        ("Commits", dev.get("estimated_commits")),
        ("Stars", dev.get("stars_received")),
        ("Followers", dev.get("followers")),
    )
    box_w, gap, y0 = 245, 20, 380
    for i, (label, value) in enumerate(stats):
        x = 80 + i * (box_w + gap)
        d.rounded_rectangle((x, y0, x + box_w, y0 + 120), radius=18, fill=PANEL, outline=BORDER, width=2)
        d.text((x + 24, y0 + 22), compact(value), font=font(46), fill=WHITE)
        d.text((x + 24, y0 + 84), label, font=font(22, bold=False), fill=GRAY)

    # Languages + footer
    langs = [safe_text(l) for l in (dev.get("languages") or []) if safe_text(l)][:4]
    d.text((80, 540), "  ·  ".join(langs) if langs else "Open source", font=font(26, bold=False), fill=GRAY)
    d.text((W - 80, 556), "GitTop  |  devcop95.github.io/gitrank", font=font(26), fill=GRAY, anchor="rs")
    return img


def page_html(entry):
    dev = entry["dev"]
    name, place = headline(entry)
    login = dev["login"]
    quoted = urllib.request.quote(login, safe="")
    page_url = f"{SITE}share/{quoted}/"
    image_url = f"{page_url}card.jpg"
    app_url = f"{SITE}?country={urllib.request.quote(entry['key'], safe='')}&dev={quoted}"
    title = f"{name} (@{login}) - {place} | GitTop"
    desc = (
        f"{place} on GitTop: {compact(dev.get('live_contributions'))} contributions, "
        f"{compact(dev.get('estimated_commits'))} commits, {compact(dev.get('stars_received'))} stars."
    )
    e = html.escape
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{e(page_url)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="GitTop">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(page_url)}">
<meta property="og:image" content="{e(image_url)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="{W}">
<meta property="og:image:height" content="{H}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{e(image_url)}">
<meta http-equiv="refresh" content="0; url={e(app_url)}">
<script>location.replace({json.dumps(app_url)});</script>
</head>
<body style="font-family:system-ui,sans-serif;background:#09090b;color:#fafafa;padding:2rem">
<p>{e(title)}</p>
<p><a style="color:#2ea043" href="{e(app_url)}">Open in GitTop</a></p>
</body>
</html>
"""


def build(dataset_path, out_dir, download=True):
    with open(dataset_path, encoding="utf-8") as fh:
        dataset = json.load(fh)
    entries = pick_entries(dataset)

    def work(item):
        login, entry = item
        avatar = fetch_avatar(entry["dev"].get("avatar_url")) if download else None
        folder = os.path.join(out_dir, "share", login)
        os.makedirs(folder, exist_ok=True)
        render_card(entry, avatar).save(os.path.join(folder, "card.jpg"), quality=82, optimize=True, subsampling=0)
        with open(os.path.join(folder, "index.html"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(page_html(entry))

    with ThreadPoolExecutor(max_workers=12) as pool:
        list(pool.map(work, entries.items()))
    return len(entries)


if __name__ == "__main__":
    dataset_arg = sys.argv[1] if len(sys.argv) > 1 else "public/data/committers.json"
    out_arg = sys.argv[2] if len(sys.argv) > 2 else "dist"
    print(f"share pages written: {build(dataset_arg, out_arg)} -> {out_arg}/share")
