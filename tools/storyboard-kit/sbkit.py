"""Storyboard drawing kit (Pillow). Dusk-lit, original cast matching the what-if-animation skill's LOOKS.
All drawing happens at 2x (1920x1080) and is downscaled to 960x540 for antialiasing."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

W, H = 1920, 1080
FONT_TITLE = "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

GOLD = (236, 186, 58)
GOLD_SH = (176, 124, 34)
GOLD_HI = (255, 240, 170)
INK = (20, 18, 28)

C = dict(skin=(246, 239, 227), skinShade=(226, 211, 190))
LOOKS = {
    # every character: black head and limbs, light outline, white face strokes; clothes and hair tell them apart
    # Arlo, the hero ("you"): wine-red hoodie
    "pip": dict(skin=(18, 17, 24), shade=(18, 17, 24), body=(122, 31, 43), bodySh=(90, 21, 32), accent=(90, 21, 32),
                limb=(18, 17, 24), line=(226, 232, 242), shoe=(18, 17, 24), hair=(18, 17, 24), extra="hood", face=(245, 245, 250)),
    # Theo, best friend: olive bomber jacket, coral headphones round the neck
    "theo": dict(skin=(18, 17, 24), shade=(18, 17, 24), body=(94, 110, 70), bodySh=(76, 90, 56), accent=(233, 196, 106),
                 limb=(18, 17, 24), line=(226, 232, 242), shoe=(217, 83, 79), hair=(18, 17, 24), extra="curls", face=(245, 245, 250)),
    # Nina, little sister: pigtails with coral bands, peach pyjamas
    "nina": dict(skin=(18, 17, 24), shade=(18, 17, 24), body=(240, 160, 130), bodySh=(214, 128, 100), accent=(242, 108, 90),
                 limb=(18, 17, 24), line=(226, 232, 242), shoe=(242, 108, 90), hair=(18, 17, 24), extra="bunches", face=(245, 245, 250)),
    # Mom: bob haircut, rose cardigan
    "mom": dict(skin=(18, 17, 24), shade=(18, 17, 24), body=(138, 90, 106), bodySh=(112, 72, 88), accent=(233, 196, 106),
                limb=(18, 17, 24), line=(226, 232, 242), shoe=(18, 17, 24), hair=(18, 17, 24), extra="bob", face=(245, 245, 250)),
    # The man in the grey suit: suit, white shirt, red tie
    "suit": dict(skin=(18, 17, 24), shade=(18, 17, 24), body=(92, 96, 108), bodySh=(70, 74, 86), accent=(168, 50, 62),
                 limb=(18, 17, 24), line=(226, 232, 242), shoe=(18, 17, 24), hair=(18, 17, 24), extra="suit", face=(245, 245, 250)),
}


def font(path, size):
    return ImageFont.truetype(path, size)


def canvas(top=(40, 30, 70), bottom=(20, 16, 32)):
    img = Image.new("RGB", (W, H), top)
    grad(img, (0, 0, W, H), top, bottom)
    return img


def grad(img, box, c0, c1, vertical=True):
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = max(1, x1 - x0), max(1, y1 - y0)
    t = np.linspace(0, 1, h if vertical else w)
    cols = (np.array(c0)[None, :] * (1 - t[:, None]) + np.array(c1)[None, :] * t[:, None]).astype(np.uint8)
    if vertical:
        arr = np.repeat(cols[:, None, :], w, axis=1)
    else:
        arr = np.repeat(cols[None, :, :], h, axis=0)
    img.paste(Image.fromarray(arr, "RGB"), (x0, y0))


def poly_grad(img, pts, c0, c1, vertical=True):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    box = (min(xs), min(ys), max(xs), max(ys))
    tile = Image.new("RGB", (W, H))
    grad(tile, box, c0, c1, vertical)
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    img.paste(tile, (0, 0), m)


def light(img, x, y, r, color=(255, 190, 110), strength=0.6, sy=1.0):
    """Additive soft light pool (gaussian)."""
    yy, xx = np.mgrid[0:H:4, 0:W:4]
    d2 = ((xx - x) / r) ** 2 + ((yy - y) / (r * sy)) ** 2
    a = np.exp(-d2 * 2.2) * strength
    small = (a[..., None] * np.array(color)[None, None, :]).clip(0, 255).astype(np.uint8)
    lay = Image.fromarray(small, "RGB").resize((W, H), Image.BILINEAR)
    return ImageChops.add(img, lay)


def darken(img, amt=0.35):
    return Image.blend(img, Image.new("RGB", img.size, (8, 6, 16)), amt)


def vignette(img, amt=0.55):
    yy, xx = np.mgrid[0:H:4, 0:W:4]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    m = np.clip((d - 0.55) / 0.75, 0, 1) * amt
    lay = Image.fromarray((255 * (1 - m)).astype(np.uint8), "L").resize((W, H), Image.BILINEAR)
    black = Image.new("RGB", (W, H), (6, 4, 12))
    return Image.composite(img, black, lay)


def finish(img, path, grain=10, vig=0.55):
    img = vignette(img, vig)
    rng = np.random.default_rng(7)
    small = img.resize((960, 540), Image.LANCZOS)
    a = np.asarray(small).astype(np.int16)
    a = a + rng.normal(0, grain / 3, a.shape[:2])[..., None].astype(np.int16)
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out.save(path, quality=90)
    return out


def blur_layer(img, draw_fn, radius=12, alpha=1.0):
    """Draw something onto a transparent layer, blur it, composite (for foregrounds / depth)."""
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(lay), lay)
    lay = lay.filter(ImageFilter.GaussianBlur(radius))
    if alpha < 1:
        r, g, b, a = lay.split(); a = a.point(lambda v: int(v * alpha)); lay = Image.merge("RGBA", (r, g, b, a))
    img.paste(lay, (0, 0), lay)


def shadow(d, x, y, w, h=None, a=110):
    h = h or w * 0.18
    d.ellipse((x - w / 2, y - h / 2, x + w / 2, y + h / 2), fill=(0, 0, 0))


def contact(img, x, y, w, h=None, alpha=0.55):
    h = h or w * 0.16
    def f(d, lay):
        d.ellipse((x - w / 2, y - h / 2, x + w / 2, y + h / 2), fill=(0, 0, 0, int(255 * alpha)))
    blur_layer(img, f, radius=max(4, w * 0.06))


def sparkle(d, x, y, r, col=(255, 248, 210)):
    d.polygon([(x, y - r), (x + r * 0.22, y - r * 0.22), (x + r, y), (x + r * 0.22, y + r * 0.22),
               (x, y + r), (x - r * 0.22, y + r * 0.22), (x - r, y), (x - r * 0.22, y - r * 0.22)], fill=col)


def text(img, xy, s, size, fill=(255, 255, 255), path=FONT_TITLE, anchor="mm", stroke=0, stroke_fill=INK):
    d = ImageDraw.Draw(img)
    d.text(xy, s, font=font(path, size), fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=stroke_fill)


# ---------------------------------------------------------------- rooms

def room(img, back, wall=(70, 58, 92), wall2=(54, 44, 74), floor=(58, 44, 52), floor2=(34, 26, 36), ceil=(30, 24, 44)):
    """One-point perspective box: back wall rect, floor to frame bottom, side walls, ceiling."""
    x0, y0, x1, y1 = back
    d = ImageDraw.Draw(img)
    poly_grad(img, [(0, 0), (W, 0), (x1, y0), (x0, y0)], ceil, wall2)
    poly_grad(img, [(0, 0), (x0, y0), (x0, y1), (0, H)], wall2, wall2)
    poly_grad(img, [(W, 0), (x1, y0), (x1, y1), (W, H)], wall2, wall2)
    poly_grad(img, [(x0, y1), (x1, y1), (W, H), (0, H)], floor, floor2)
    grad(img, back, wall, wall2)
    # skirting lines
    d.line([(x0, y1), (x1, y1)], fill=(30, 24, 40), width=4)
    d.line([(x0, y1), (0, H)], fill=(30, 24, 40), width=4)
    d.line([(x1, y1), (W, H)], fill=(30, 24, 40), width=4)
    # floor boards toward vanishing point
    vx, vy = (x0 + x1) / 2, (y0 + y1) / 2
    for i in range(-8, 9):
        bx = W / 2 + i * 260
        t = (y1 - vy) / (H - vy)
        d.line([(vx + (bx - vx) * t, y1), (bx, H)], fill=(44, 32, 42), width=2)


def window(img, rect, sky=((36, 30, 78), (232, 128, 84)), moon=None, sun=None, city=True, frame=(40, 32, 52)):
    x0, y0, x1, y1 = rect
    grad(img, rect, sky[0], sky[1])
    d = ImageDraw.Draw(img)
    if city:
        rng = random.Random(int(x0 + y0))
        x = x0
        while x < x1:
            bw = rng.randint(40, 90); bh = rng.randint(int((y1 - y0) * 0.15), int((y1 - y0) * 0.5))
            d.rectangle((x, y1 - bh, min(x1, x + bw), y1), fill=(26, 22, 46))
            for wy in range(int(y1 - bh + 10), int(y1 - 6), 18):
                for wx in range(int(x + 8), int(min(x1, x + bw) - 8), 16):
                    if rng.random() < 0.35:
                        d.rectangle((wx, wy, wx + 6, wy + 8), fill=(255, 196, 120))
            x += bw + rng.randint(2, 12)
    if moon:
        mx, my, mr = moon
        img2 = light(img, mx, my, mr * 3, (120, 130, 200), 0.35)
        img.paste(img2)
        d = ImageDraw.Draw(img)
        d.ellipse((mx - mr, my - mr, mx + mr, my + mr), fill=(244, 236, 214))
    if sun:
        sx, sy, sr = sun
        img2 = light(img, sx, sy, sr * 4, (255, 170, 90), 0.7)
        img.paste(img2)
        d = ImageDraw.Draw(img)
        d.ellipse((sx - sr, sy - sr, sx + sr, sy + sr), fill=(255, 214, 140))
    d.rectangle(rect, outline=frame, width=14)
    d.line([((x0 + x1) / 2, y0), ((x0 + x1) / 2, y1)], fill=frame, width=10)
    d.line([(x0, (y0 + y1) / 2), (x1, (y0 + y1) / 2)], fill=frame, width=10)
    d.rectangle((x0 - 20, y1, x1 + 20, y1 + 18), fill=(52, 42, 62))


def lamp(img, x, y, s=1.0, on=True):
    """Desk/bedside lamp standing on a surface at (x, y). Returns img (light added)."""
    d = ImageDraw.Draw(img)
    d.rectangle((x - 30 * s, y - 10 * s, x + 30 * s, y), fill=(40, 34, 50))
    d.line([(x, y - 10 * s), (x, y - 110 * s)], fill=(40, 34, 50), width=int(8 * s))
    d.polygon([(x - 55 * s, y - 100 * s), (x + 55 * s, y - 100 * s), (x + 32 * s, y - 165 * s), (x - 32 * s, y - 165 * s)],
              fill=(240, 196, 130) if on else (90, 80, 90))
    if on:
        img = light(img, x, y - 60 * s, 420 * s, (255, 176, 96), 0.75)
        img = light(img, x, y + 40 * s, 300 * s, (255, 150, 80), 0.35, sy=0.45)
    return img


def pendant(img, x, y, s=1.0):
    d = ImageDraw.Draw(img)
    d.line([(x, 0), (x, y - 40 * s)], fill=(30, 26, 38), width=4)
    d.pieslice((x - 60 * s, y - 60 * s, x + 60 * s, y + 20 * s), 180, 360, fill=(52, 44, 60))
    d.ellipse((x - 18 * s, y - 14 * s, x + 18 * s, y + 10 * s), fill=(255, 226, 170))
    return light(img, x, y + 120 * s, 520 * s, (255, 180, 100), 0.6, sy=1.2)


def desk(img, x0, x1, y, depth=60, top=(92, 62, 50), front=(62, 42, 38)):
    d = ImageDraw.Draw(img)
    d.polygon([(x0 + 30, y - depth), (x1 - 30, y - depth), (x1, y), (x0, y)], fill=top)
    d.rectangle((x0, y, x1, y + 26), fill=front)
    for lx in (x0 + 20, x1 - 40):
        d.rectangle((lx, y + 26, lx + 20, y + 260), fill=(48, 34, 32))


def frame_pic(d, rect, c=(120, 90, 120)):
    d.rectangle(rect, fill=(30, 24, 36))
    x0, y0, x1, y1 = rect
    d.rectangle((x0 + 10, y0 + 10, x1 - 10, y1 - 10), fill=c)


def plant(d, x, y, s=1.0):
    d.polygon([(x - 34 * s, y - 70 * s), (x + 34 * s, y - 70 * s), (x + 26 * s, y), (x - 26 * s, y)], fill=(150, 80, 60))
    for a in range(-60, 61, 30):
        r = math.radians(a - 90)
        d.ellipse((x + math.cos(r) * 70 * s - 22 * s, y - 70 * s + math.sin(r) * 80 * s - 40 * s,
                   x + math.cos(r) * 70 * s + 22 * s, y - 70 * s + math.sin(r) * 80 * s + 40 * s), fill=(60, 110, 80))


def books(d, x, y, n=8, s=1.0, seed=1):
    rng = random.Random(seed)
    cols = [(160, 80, 70), (70, 110, 140), (200, 160, 80), (90, 130, 90), (140, 90, 140), (220, 120, 90)]
    for i in range(n):
        h = rng.randint(50, 80) * s; w = rng.randint(14, 22) * s
        d.rectangle((x, y - h, x + w, y), fill=rng.choice(cols)); x += w + 3 * s
    return x


def clock_readout(img, x, y, s, txt, glow=(255, 90, 80)):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x - 90 * s, y - 40 * s, x + 90 * s, y + 40 * s), 10 * s, fill=(18, 16, 24))
    img2 = light(img, x, y, 160 * s, glow, 0.35)
    img.paste(img2)
    text(img, (x, y), txt, int(52 * s), fill=glow, path=FONT_MONO)


def chip(img, x, y, txt, size=40, fg=(255, 236, 190), bg=(20, 18, 28)):
    d = ImageDraw.Draw(img)
    f = font(FONT_MONO, size)
    tw = d.textlength(txt, font=f)
    d.rounded_rectangle((x - 20, y - size * 0.75, x + tw + 20, y + size * 0.75), 12, fill=bg, outline=(233, 196, 106), width=3)
    d.text((x, y), txt, font=f, fill=fg, anchor="lm")


# ---------------------------------------------------------------- characters

def _limb(d, pts, w, col, line):
    for (a, b) in zip(pts, pts[1:]):
        d.line([a, b], fill=line, width=int(w + 6))
    for p in pts:
        d.ellipse((p[0] - (w + 6) / 2, p[1] - (w + 6) / 2, p[0] + (w + 6) / 2, p[1] + (w + 6) / 2), fill=line)
    for (a, b) in zip(pts, pts[1:]):
        d.line([a, b], fill=col, width=int(w))
    for p in pts:
        d.ellipse((p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2), fill=col)


def _pt(o, ang, length):
    r = math.radians(ang)
    return (o[0] + math.sin(r) * length, o[1] + math.cos(r) * length)


def char(img, x, y, s=1.0, look="pip", face=0.4, expr="neutral", arms=((-10, 8), (10, -8)), legs="stand",
         rim="R", rim_col=(255, 178, 96), glow=None, gold_hand=None, hold=None, lean=0.0, head_tilt=0.0):
    """x,y = feet centre on the ground. face: -1 (looking left) .. 1 (looking right).
    arms: ((shoulder_deg, elbow_rel_deg) for screen-left arm, same for screen-right arm); 0 = straight down,
    positive angles swing toward screen-right. Returns dict of key points (hands, head)."""
    L = LOOKS[look]
    d = ImageDraw.Draw(img)
    R = 62 * s
    hip = (x + lean * 40 * s, y - 128 * s)
    neck = (hip[0] + lean * 50 * s, hip[1] - 108 * s)
    head = (neck[0] + head_tilt * 10 * s, neck[1] - R * 0.82)
    lw = 13 * s
    pts = {}
    # legs
    if legs == "stand":
        lp = [((hip[0] - 16 * s, hip[1]), (x - 22 * s, y - 62 * s), (x - 24 * s, y)),
              ((hip[0] + 16 * s, hip[1]), (x + 22 * s, y - 62 * s), (x + 24 * s, y))]
    elif legs == "run":
        sd = 1 if face >= 0 else -1
        lp = [((hip[0], hip[1]), (hip[0] + sd * 60 * s, hip[1] + 40 * s), (hip[0] + sd * 52 * s, y - 20 * s)),
              ((hip[0], hip[1]), (hip[0] - sd * 30 * s, hip[1] + 66 * s), (hip[0] - sd * 86 * s, y - 50 * s))]
    elif legs == "sit":
        sd = 1 if face >= 0 else -1
        lp = [((hip[0], hip[1]), (hip[0] + sd * 66 * s, hip[1] + 4 * s), (hip[0] + sd * 70 * s, y)),
              ((hip[0] - 10 * s, hip[1]), (hip[0] + sd * 56 * s, hip[1] + 8 * s), (hip[0] + sd * 58 * s, y))]
    elif legs == "walk":
        lp = [((hip[0] - 8 * s, hip[1]), (x - 30 * s, y - 62 * s), (x - 46 * s, y)),
              ((hip[0] + 8 * s, hip[1]), (x + 26 * s, y - 64 * s), (x + 40 * s, y - 4 * s))]
    else:
        lp = []
    for leg in lp:
        _limb(d, list(leg), lw, L["limb"], L["line"])
        f = leg[-1]
        d.ellipse((f[0] - 22 * s, f[1] - 12 * s, f[0] + 22 * s, f[1] + 8 * s), fill=L["shoe"], outline=L["line"], width=int(4 * s))
    # hood behind head
    if L["extra"] == "hood":
        d.ellipse((head[0] - R * 1.12, head[1] - R * 0.9, head[0] + R * 1.12, head[1] + R * 1.25), fill=L["bodySh"], outline=L["line"], width=int(4 * s))
    # torso
    tw0, tw1 = 46 * s, 54 * s
    if look == "nina":
        tw0, tw1 = 40 * s, 60 * s
    body = [(neck[0] - tw0, neck[1] + 6 * s), (neck[0] + tw0, neck[1] + 6 * s), (hip[0] + tw1, hip[1] + 14 * s), (hip[0] - tw1, hip[1] + 14 * s)]
    d.polygon(body, fill=L["body"], outline=L["line"], width=int(4 * s))
    sd = 1 if face >= 0 else -1
    d.polygon([(neck[0] - sd * tw0, neck[1] + 6 * s), (neck[0] - sd * tw0 * 0.3, neck[1] + 6 * s),
               (hip[0] - sd * tw1 * 0.3, hip[1] + 14 * s), (hip[0] - sd * tw1, hip[1] + 14 * s)], fill=L["bodySh"])
    if L["extra"] == "hood":
        for k in (-1, 1):
            d.line([(neck[0] + k * 12 * s + face * 10 * s, neck[1] + 8 * s), (neck[0] + k * 14 * s + face * 10 * s, neck[1] + 58 * s)], fill=L["accent"], width=int(6 * s))
    if L["extra"] == "suit":
        d.polygon([(neck[0] - 20 * s, neck[1] + 6 * s), (neck[0] + 20 * s, neck[1] + 6 * s), (neck[0], neck[1] + 60 * s)], fill=(236, 232, 226))
        d.polygon([(neck[0] - 7 * s, neck[1] + 12 * s), (neck[0] + 7 * s, neck[1] + 12 * s), (neck[0] + 9 * s, neck[1] + 74 * s), (neck[0], neck[1] + 86 * s), (neck[0] - 9 * s, neck[1] + 74 * s)], fill=L["accent"])
    if L["extra"] == "curls":  # headphones round the neck
        d.arc((neck[0] - 40 * s, neck[1] - 14 * s, neck[0] + 40 * s, neck[1] + 34 * s), 0, 180, fill=(40, 40, 48), width=int(9 * s))
        for k in (-1, 1):
            d.ellipse((neck[0] + k * 40 * s - 12 * s, neck[1] + 4 * s, neck[0] + k * 40 * s + 12 * s, neck[1] + 28 * s), fill=(217, 83, 79))
    if L["extra"] == "bob":
        d.line([(neck[0] - 2 * s, neck[1] + 10 * s), (hip[0] - 2 * s, hip[1] + 10 * s)], fill=L["bodySh"], width=int(4 * s))
    # arms
    shoulders = [(neck[0] - tw0 + 6 * s, neck[1] + 18 * s), (neck[0] + tw0 - 6 * s, neck[1] + 18 * s)]
    hands = []
    for i, (sh, (a, e)) in enumerate(zip(shoulders, arms)):
        el = _pt(sh, a, 56 * s)
        hd = _pt(el, a + e, 52 * s)
        _limb(d, [sh, el, hd], lw, L["limb"] if look != "pip" else L["body"], L["line"])
        hands.append(hd)
    for i, hd in enumerate(hands):
        side = "L" if i == 0 else "R"
        hc = L["skin"]
        if gold_hand == side:
            hc = GOLD
        d.ellipse((hd[0] - 15 * s, hd[1] - 15 * s, hd[0] + 15 * s, hd[1] + 15 * s), fill=hc, outline=L["line"], width=int(4 * s))
        if gold_hand == side:
            sparkle(d, hd[0] + 10 * s, hd[1] - 10 * s, 9 * s)
    pts["hands"] = hands
    # head
    d.ellipse((head[0] - R, head[1] - R, head[0] + R, head[1] + R), fill=L["skin"], outline=L["line"], width=int(5 * s))
    # shade crescent on the side away from the rim light
    shade_side = -1 if rim == "R" else 1
    m = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(m)
    md.ellipse((head[0] - R + 4 * s, head[1] - R + 4 * s, head[0] + R - 4 * s, head[1] + R - 4 * s), fill=255)
    md.ellipse((head[0] - R - shade_side * 22 * s + 4 * s, head[1] - R - 14 * s, head[0] + R - shade_side * 22 * s, head[1] + R - 10 * s), fill=0)
    img.paste(Image.new("RGB", (W, H), L["shade"]), (0, 0), m)
    d = ImageDraw.Draw(img)
    # hair
    hx = head[0] + face * 6 * s
    if L["extra"] == "hood":
        pass  # stickman hero: smooth round head, no tuft
    elif L["extra"] == "curls_off":
        for k in range(9):
            a = math.radians(-170 + k * 20)
            cx, cy = head[0] + math.cos(a) * R * 0.92, head[1] + math.sin(a) * R * 0.92
            d.ellipse((cx - 22 * s, cy - 22 * s, cx + 22 * s, cy + 22 * s), fill=L["hair"])
    elif L["extra"] == "bunches":
        for k in (-1, 1):
            cx = head[0] + k * R * 1.08
            d.ellipse((cx - 24 * s, head[1] - 46 * s, cx + 24 * s, head[1] + 2 * s), fill=L["hair"], outline=L["line"], width=int(4 * s))
            d.ellipse((cx - k * 18 * s - 7 * s, head[1] - 30 * s, cx - k * 18 * s + 7 * s, head[1] - 14 * s), fill=L["accent"])
        d.chord((head[0] - R, head[1] - R, head[0] + R, head[1] + R * 0.2), 180, 360, fill=L["hair"])
    elif L["extra"] == "bob":
        d.chord((head[0] - R * 1.08, head[1] - R * 1.08, head[0] + R * 1.08, head[1] + R * 0.5), 180, 360, fill=L["hair"])
        for k in (-1, 1):
            d.rounded_rectangle((head[0] + k * R * 0.9 - 18 * s, head[1] - 20 * s, head[0] + k * R * 0.9 + 16 * s, head[1] + R * 0.6), 14 * s, fill=L["hair"])
    elif L["extra"] == "suit":
        d.chord((head[0] - R * 1.02, head[1] - R * 1.06, head[0] + R * 1.02, head[1] + R * 0.1), 180, 360, fill=L["hair"])
        d.line([(head[0] + 12 * s, head[1] - R * 1.0), (head[0] + 4 * s, head[1] - R * 0.5)], fill=L["skin"], width=int(3 * s))
    # face (white strokes on the black head)
    FC = L.get("face", INK)
    fx, fy = head[0] + face * R * 0.42, head[1] + 4 * s
    sp = R * 0.36 * (1 - abs(face) * 0.25)
    er = R * 0.085
    eyes = [(fx - sp, fy - 6 * s), (fx + sp, fy - 6 * s)]
    if expr in ("happy", "closed"):
        for ex, ey in eyes:
            if expr == "happy":
                d.arc((ex - 12 * s, ey - 8 * s, ex + 12 * s, ey + 12 * s), 200, 340, fill=FC, width=int(5 * s))
            else:
                d.line([(ex - 11 * s, ey + 2 * s), (ex + 11 * s, ey + 2 * s)], fill=FC, width=int(5 * s))
    else:
        big = 1.5 if expr in ("wide", "shock", "awe") else 1.0
        for ex, ey in eyes:
            d.ellipse((ex - er * big, ey - er * 1.3 * big, ex + er * big, ey + er * 1.3 * big), fill=FC)
            if big > 1:
                d.ellipse((ex - er * 0.35 + 2 * s, ey - er * 0.9, ex + er * 0.25 + 2 * s, ey - er * 0.2), fill=(255, 255, 255))
    # brows
    bw = 14 * s
    for i, (ex, ey) in enumerate(eyes):
        k = -1 if i == 0 else 1
        by = ey - 24 * s
        if expr in ("sad", "worried"):
            d.line([(ex - bw, by - k * 6 * s), (ex + bw, by + k * 6 * s)], fill=FC, width=int(4 * s))
        elif expr in ("determined", "angry"):
            d.line([(ex - bw, by + k * 7 * s), (ex + bw, by - k * 7 * s)], fill=FC, width=int(5 * s))
        elif expr in ("wide", "shock", "awe"):
            d.arc((ex - bw, by - 14 * s, ex + bw, by + 6 * s), 200, 340, fill=FC, width=int(4 * s))
    # mouth
    mx, my = fx, fy + R * 0.42
    if expr in ("happy", "awe"):
        d.chord((mx - 16 * s, my - 12 * s, mx + 16 * s, my + 14 * s), 0, 180, fill=FC)
    elif expr == "shock":
        d.ellipse((mx - 9 * s, my - 8 * s, mx + 9 * s, my + 14 * s), fill=FC)
    elif expr in ("sad", "worried"):
        d.arc((mx - 13 * s, my, mx + 13 * s, my + 18 * s), 200, 340, fill=FC, width=int(4 * s))
    elif expr == "smirk":
        d.arc((mx - 16 * s, my - 10 * s, mx + 14 * s, my + 8 * s), 20, 120, fill=FC, width=int(4 * s))
    elif expr == "closed":
        d.arc((mx - 12 * s, my - 8 * s, mx + 12 * s, my + 8 * s), 20, 160, fill=FC, width=int(4 * s))
    else:
        d.line([(mx - 9 * s, my + 4 * s), (mx + 9 * s, my + 4 * s)], fill=FC, width=int(4 * s))
    # rim light: a warm arc on the lit side of the head
    if rim:
        a0, a1 = (-70, 70) if rim == "R" else (110, 250)
        d.arc((head[0] - R - 2 * s, head[1] - R - 2 * s, head[0] + R + 2 * s, head[1] + R + 2 * s), a0, a1, fill=rim_col, width=int(5 * s))
    # glowing fingertips
    if glow:
        for i, hd in enumerate(hands):
            if glow in ("both", "L" if i == 0 else "R"):
                img2 = light(img, hd[0], hd[1], 150 * s, (255, 210, 110), 0.95)
                img.paste(img2)
                d = ImageDraw.Draw(img)
                d.ellipse((hd[0] - 9 * s, hd[1] - 9 * s, hd[0] + 9 * s, hd[1] + 9 * s), fill=(255, 250, 220))
    pts["head"] = head
    pts["R"] = R
    if hold:
        hold(ImageDraw.Draw(img), hands)
    return pts


# ---------------------------------------------------------------- props

def paperclip(d, x, y, s=1.0, col=GOLD, ang=0, w=None):
    w = w or 7 * s
    pts = []
    def P(px, py):
        r = math.radians(ang)
        return (x + px * math.cos(r) - py * math.sin(r), y + px * math.sin(r) + py * math.cos(r))
    # nested loops path
    seg = [(-60, -14), (50, -14), (50, 14), (-46, 14), (-46, -6), (38, -6), (38, 6), (-30, 6)]
    path = [P(px * s, py * s) for px, py in seg]
    sh = tuple(int(c * 0.65) for c in col)
    d.line(path, fill=sh, width=int(w + 4), joint="curve")
    d.line(path, fill=col, width=int(w), joint="curve")
    d.line(path[:3], fill=GOLD_HI if col == GOLD else (230, 230, 240), width=max(1, int(w * 0.3)))


def gold_bar(d, x, y, s=1.0):
    d.polygon([(x - 50 * s, y), (x + 50 * s, y), (x + 36 * s, y - 26 * s), (x - 36 * s, y - 26 * s)], fill=GOLD, outline=GOLD_SH, width=int(3 * s))
    d.line([(x - 32 * s, y - 22 * s), (x + 20 * s, y - 22 * s)], fill=GOLD_HI, width=int(3 * s))


def hand_layer(pose="open", col=None, line=(226, 232, 242), sleeve=(122, 31, 43), tips=None, gold_upto=0.0):
    """Upright hand (fingers up) on a 600x900 RGBA layer. pose: open | point | fist.
    tips: colour for fingertips (glow). gold_upto: 0..1, how much of the hand (from the fingertips down) is gold."""
    col = col or (18, 17, 24)
    lay = Image.new("RGBA", (600, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    fingers = [(195, 250, 300), (265, 220, 330), (335, 230, 310), (405, 270, 250)]  # (x, top y, length) for open
    if pose == "point":
        fingers = [(195, 470, 0), (265, 200, 0), (335, 470, 0), (405, 480, 0)]
    if pose == "fist":
        fingers = [(195, 460, 0), (265, 450, 0), (335, 460, 0), (405, 480, 0)]
    def capsule(x0, y0, x1, y1, fill):
        d.rounded_rectangle((x0, y0, x1, y1), (x1 - x0) // 2, fill=fill, outline=line, width=10)
    capsule(120, 520, 210, 720, col) if pose != "fist" else None
    d.rounded_rectangle((150, 440, 460, 780), 90, fill=col, outline=line, width=10)
    for fx, ty, _ in fingers:
        capsule(fx - 34, ty, fx + 34, 560, col)
    if pose == "fist":
        d.line([(170, 520), (440, 520)], fill=line, width=8)
    d.rectangle((130, 760, 480, 900), fill=sleeve, outline=line, width=10)
    if gold_upto > 0:
        g = Image.new("RGBA", lay.size, GOLD + (255,))
        a = lay.split()[3]
        cut = Image.new("L", lay.size, 0)
        ImageDraw.Draw(cut).rectangle((0, 0, 600, int(200 + 600 * gold_upto)), fill=255)
        m = ImageChops.multiply(a, cut)
        # keep the outline dark: only recolour non-line pixels (approximate via the alpha)
        lay.paste(g, (0, 0), m)
        dd = ImageDraw.Draw(lay)
        for fx, ty, _ in fingers:
            dd.rounded_rectangle((fx - 34, ty, fx + 34, 560), 34, outline=GOLD_SH, width=10)
        dd.rounded_rectangle((150, 440, 460, 780), 90, outline=GOLD_SH, width=10)
        dd.line([(190, 470), (300, 470)], fill=GOLD_HI, width=10)
    if tips:
        for fx, ty, _ in fingers:
            if ty < 420:
                dd = ImageDraw.Draw(lay)
                dd.ellipse((fx - 22, ty + 6, fx + 22, ty + 50), fill=tips)
    return lay


def paste_hand(img, layer, x, y, scale=1.0, angle=0.0, glow=None):
    """Paste a hand layer with its wrist centre (300, 860) at (x, y)."""
    lay = layer.resize((int(600 * scale), int(900 * scale)), Image.LANCZOS)
    big = Image.new("RGBA", (lay.width * 2, lay.height * 2), (0, 0, 0, 0))
    big.paste(lay, (lay.width // 2, lay.height // 2))
    big = big.rotate(angle, resample=Image.BICUBIC, center=(lay.width // 2 + 300 * scale, lay.height // 2 + 860 * scale))
    ox = int(x - (lay.width // 2 + 300 * scale)); oy = int(y - (lay.height // 2 + 860 * scale))
    img.paste(big, (ox, oy), big)
    return img


def hand_point(px, py, wx, wy, scale, angle):
    """Where layer point (px, py) of a hand layer lands after paste_hand(wx, wy, scale, angle)."""
    dx, dy = (px - 300) * scale, (py - 860) * scale
    t = math.radians(angle)
    return (wx + dx * math.cos(t) + dy * math.sin(t), wy - dx * math.sin(t) + dy * math.cos(t))
