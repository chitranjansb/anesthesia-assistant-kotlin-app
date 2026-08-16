from PIL import Image, ImageDraw
import os

OUT = "public/icons"
os.makedirs(OUT, exist_ok=True)

BG = (11, 19, 28)       # deep slate (--background dark)
TEAL = (36, 189, 176)   # primary teal
WHITE = (235, 245, 245)

def draw_pulse(draw, size, safe_pad_ratio=0.0):
    pad = size * safe_pad_ratio
    w = size - 2 * pad
    cy = size / 2
    x0 = pad + w * 0.08
    pts = [
        (x0, cy),
        (x0 + w * 0.22, cy),
        (x0 + w * 0.28, cy - w * 0.18),
        (x0 + w * 0.34, cy + w * 0.30),
        (x0 + w * 0.40, cy),
        (x0 + w * 0.52, cy),
        (x0 + w * 0.56, cy - w * 0.10),
        (x0 + w * 0.60, cy),
        (x0 + w * 0.92, cy),
    ]
    stroke = max(2, int(size * 0.045))
    draw.line(pts, fill=TEAL, width=stroke, joint="curve")
    # rounded caps
    r = stroke / 2
    for p in (pts[0], pts[-1]):
        draw.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=TEAL)

def rounded_square(size, radius_ratio, safe_pad_ratio=0.0):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG + (255,))
    draw_pulse(draw, size, safe_pad_ratio)
    return img

# Standard icons
for size in (192, 512):
    img = rounded_square(size, 0.22)
    img.save(f"{OUT}/icon-{size}.png")

# Maskable icon (extra safe-zone padding per PWA maskable spec ~ 20%)
img = rounded_square(512, 0.0, safe_pad_ratio=0.18)
# maskable needs full-bleed background, no rounding baked in (system applies mask)
bg_full = Image.new("RGBA", (512, 512), BG + (255,))
draw = ImageDraw.Draw(bg_full)
draw_pulse(draw, 512, safe_pad_ratio=0.18)
bg_full.save(f"{OUT}/icon-maskable-512.png")

# Favicon
favicon = rounded_square(64, 0.22)
favicon.save(f"{OUT}/favicon-64.png")

print("icons written:", os.listdir(OUT))
