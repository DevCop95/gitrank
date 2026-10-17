"""Regenerates the PNG icons and the social preview image in public/.

Run from the repo root:  python scripts/generate_assets.py
Needs Pillow (pip install pillow). Uses Consolas/Arial if present, else Pillow's default font.
"""
import os

from PIL import Image, ImageDraw, ImageFont

OUT = "public"
BLACK = (9, 9, 11)
WHITE = (250, 250, 250)
GRAY = (161, 161, 170)
GREEN = (46, 160, 67)


def font(size, bold=True):
    candidates = (
        ["consolab.ttf", "arialbd.ttf", "DejaVuSansMono-Bold.ttf"]
        if bold
        else ["consola.ttf", "arial.ttf", "DejaVuSansMono.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_logo(size, bg=BLACK):
    """Black rounded square with a white 'GT' and a green rank bar."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=bg)
    f = font(int(size * 0.46))
    text = "GT"
    box = d.textbbox((0, 0), text, font=f)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((size - w) / 2 - box[0], (size - h) / 2 - box[1] - size * 0.04), text, font=f, fill=WHITE)
    bar_w, bar_h = int(size * 0.34), max(2, int(size * 0.045))
    d.rounded_rectangle(
        ((size - bar_w) / 2, size * 0.76, (size + bar_w) / 2, size * 0.76 + bar_h),
        radius=bar_h // 2,
        fill=GREEN,
    )
    return img


def og_image():
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), BLACK)
    d = ImageDraw.Draw(img)
    logo = draw_logo(120, bg=(39, 39, 42))
    img.paste(logo, (80, 80), logo)
    d.text((225, 92), "GitTop", font=font(72), fill=WHITE)
    d.text((80, 250), "Top GitHub developers", font=font(64), fill=WHITE)
    d.text((80, 330), "worldwide and by country", font=font(64), fill=GRAY)
    d.text((80, 450), "Live contributions  |  Commits  |  Stars  |  Compare", font=font(30, bold=False), fill=GRAY)
    for i, width in enumerate((520, 400, 300)):
        y = 520 + i * 28
        d.rounded_rectangle((80, y, 80 + width, y + 12), radius=6, fill=GREEN if i == 0 else (63, 63, 70))
    d.text((w - 80, 596), "devcop95.github.io/gitrank", font=font(28, bold=False), fill=GRAY, anchor="rs")
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for size, name in ((192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")):
        draw_logo(size).save(os.path.join(OUT, name))
    og_image().save(os.path.join(OUT, "og-image.png"), optimize=True)
    print("assets written to", OUT)


if __name__ == "__main__":
    main()
