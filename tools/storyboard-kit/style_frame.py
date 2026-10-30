"""Style frame: residential street at dusk, in the Golden Hour What If style (dusk tokens). Real one-point perspective."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S = 2
W, H = 1920 * S, 1080 * S
HZ = 610 * S          # horizon line
VX = 1010 * S         # vanishing point x
F = 1150 * S          # focal length (px)
CAMH = 1.55           # camera height (m)
rng = random.Random(11)

C = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in dict(
    sky_top="#1d2a5e", sky_mid="#5a2f5c", sky_low="#c2513f", horizon="#ffb36b",
    cloud_lit="#f08a4a", cloud_hot="#ffc58a", cloud_sh="#6e2a3c", cloud_dark="#3a2140",
    wall_lit="#c98f74", wall="#7a4f5a", wall_sh="#4d3951", roof="#3a2a3a", roof_hi="#7a4a4a",
    glow="#ffd08a", line="#2a1c26", asphalt="#3a2c36", asphalt_far="#8a5a58", walk="#7a6070",
    block="#9a7a72", block_sh="#6a5058", leaf="#4a5a3a", leaf_hi="#7a8a4a", pole="#2e2230", white="#efe2d6").items()}


def P(X, Y, Z):
    """World (m) -> screen (px). X right, Y up, Z forward."""
    return (VX + X * F / Z, HZ + (CAMH - Y) * F / Z)


def lightmap(img, x, y, r, col, a, sy=1.0):
    yy, xx = np.mgrid[0:H:8, 0:W:8]
    d2 = ((xx - x) / r) ** 2 + ((yy - y) / (r * sy)) ** 2
    m = (np.exp(-d2 * 2.2) * a)[..., None] * np.array(col)[None, None, :]
    lay = Image.fromarray(m.clip(0, 255).astype(np.uint8), "RGB").resize((W, H), Image.BILINEAR)
    return ImageChops.add(img, lay)


def vgrad(c_stops, h0, h1):
    ys = np.linspace(0, 1, h1 - h0)
    stops = np.array([s for s, _ in c_stops]); cols = np.array([c for _, c in c_stops], float)
    out = np.stack([np.interp(ys, stops, cols[:, k]) for k in range(3)], 1)
    return Image.fromarray(np.repeat(out[:, None, :], W, 1).astype(np.uint8), "RGB")


# ---------------- sky
img = Image.new("RGB", (W, H))
img.paste(vgrad([(0, C["sky_top"]), (0.45, C["sky_mid"]), (0.8, C["sky_low"]), (1, C["horizon"])], 0, HZ + 40 * S), (0, 0))
img = lightmap(img, VX, HZ - 20 * S, 700 * S, (255, 170, 90), 0.9, sy=0.6)
d = ImageDraw.Draw(img)
for _ in range(220):  # first stars in the top band
    x, y = rng.uniform(0, W), rng.uniform(0, HZ * 0.28)
    r = rng.uniform(1, 2.6) * S
    d.ellipse((x - r, y - r, x + r, y + r), fill=(250, 236, 220))

# cumulus banks lit from below: a dark body, a hot rim only along the underside
def cloud(cx, cy, w, h, n=14):
    body = Image.new("L", (W, H), 0); bd = ImageDraw.Draw(body)
    for _ in range(n):
        x = cx + rng.uniform(-w / 2, w / 2); r = rng.uniform(0.3, 0.55) * h
        y = cy + rng.uniform(-h * 0.35, h * 0.15) + abs(x - cx) / w * h * 0.5
        bd.ellipse((x - r * 1.35, y - r, x + r * 1.35, y + r * 0.75), fill=255)
    body = body.filter(ImageFilter.GaussianBlur(1.5 * S))
    def shifted(dy):
        return ImageChops.offset(body, 0, -dy)
    rim = ImageChops.subtract(body, shifted(int(h * 0.16)))      # lower edge band
    core = ImageChops.subtract(body, shifted(int(h * 0.07)))     # thinner, hotter band
    mid = ImageChops.subtract(body, shifted(int(h * 0.32)))
    img.paste(Image.new("RGB", (W, H), C["cloud_dark"]), (0, 0), body)
    img.paste(Image.new("RGB", (W, H), C["cloud_sh"]), (0, 0), mid.filter(ImageFilter.GaussianBlur(3 * S)))
    img.paste(Image.new("RGB", (W, H), C["cloud_lit"]), (0, 0), rim.filter(ImageFilter.GaussianBlur(1.5 * S)))
    img.paste(Image.new("RGB", (W, H), C["cloud_hot"]), (0, 0), core)
for (cx, cy, w, h) in [(420, 170, 760, 170), (1500, 120, 900, 190), (980, 330, 700, 120), (260, 420, 420, 90),
                       (1700, 380, 520, 110), (700, 70, 500, 90), (1250, 470, 380, 60)]:
    cloud(cx * S, cy * S, w * S, h * S, n=int(w / 30))
img = lightmap(img, VX, HZ, 260 * S, (255, 220, 150), 0.9, sy=0.7)
d = ImageDraw.Draw(img)
d.ellipse((VX - 34 * S, HZ - 60 * S, VX + 34 * S, HZ + 8 * S), fill=(255, 226, 170))

# ---------------- ground: road, sidewalks
far = 400
def quad(pts, col):
    d.polygon([P(*p) for p in pts], fill=col)
def gquad(pts, c_near, c_far):
    """quad with a vertical gradient (far colour at the horizon)."""
    q = [P(*p) for p in pts]
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon(q, fill=255)
    g = vgrad([(0, c_far), (1, c_near)], HZ, H)
    full = Image.new("RGB", (W, H)); full.paste(g, (0, HZ))
    img.paste(full, (0, 0), m)

gquad([(-3.6, 0, 1.2), (3.6, 0, 1.2), (3.6, 0, far), (-3.6, 0, far)], C["asphalt"], C["asphalt_far"])
for sx in (-1, 1):
    gquad([(sx * 3.6, 0, 1.2), (sx * 6.0, 0, 1.2), (sx * 6.0, 0, far), (sx * 3.6, 0, far)], C["walk"], C["asphalt_far"])
d = ImageDraw.Draw(img)
# warm reflection of the sun down the road
refl = Image.new("L", (W, H), 0)
ImageDraw.Draw(refl).polygon([P(-0.4, 0, 400), P(0.4, 0, 400), P(1.6, 0, 3), P(-1.6, 0, 3)], fill=120)
refl = refl.filter(ImageFilter.GaussianBlur(30 * S))
img.paste(Image.new("RGB", (W, H), (255, 160, 100)), (0, 0), refl)
d = ImageDraw.Draw(img)
# curbs, centre dashes, crosswalk
for sx in (-1, 1):
    d.line([P(sx * 3.6, 0, 1.2), P(sx * 3.6, 0, far)], fill=C["white"], width=4 * S)
    d.line([P(sx * 3.75, 0.12, 1.2), P(sx * 3.75, 0.12, far)], fill=(150, 120, 120), width=3 * S)
z = 9
while z < 200:
    quad([(-0.07, 0, z), (0.07, 0, z), (0.07, 0, z + 3), (-0.07, 0, z + 3)], (230, 210, 190)); z += 7
for i in range(9):
    x0 = -3.3 + i * 0.78
    quad([(x0, 0, 2.2), (x0 + 0.45, 0, 2.2), (x0 + 0.45, 0, 4.4), (x0, 0, 4.4)], (196, 186, 182))

# ---------------- houses along both sides
def house(side, z0, depth, h, col_seed):
    X = side * 7.2
    r = random.Random(col_seed)
    wl = C["wall_lit"] if side < 0 else C["wall"]
    # facade on the side plane (left side faces the sun -> lit)
    quad([(X, 0, z0), (X, h, z0), (X, h, z0 + depth), (X, 0, z0 + depth)], wl)
    # front face toward camera (narrow, in shade)
    quad([(X, 0, z0), (X + side * 3, 0, z0), (X + side * 3, h, z0), (X, h, z0)], C["wall_sh"])
    # roof: eave band + slope
    quad([(X - side * 0.5, h, z0 - 0.4), (X - side * 0.5, h + 0.35, z0 - 0.4), (X - side * 0.5, h + 0.35, z0 + depth + 0.4), (X - side * 0.5, h, z0 + depth + 0.4)], C["roof"])
    quad([(X - side * 0.5, h + 0.35, z0 - 0.4), (X + side * 2.5, h + 2.4, z0 - 0.4), (X + side * 2.5, h + 2.4, z0 + depth + 0.4), (X - side * 0.5, h + 0.35, z0 + depth + 0.4)], C["roof"])
    for k in range(1, 7):  # tile rows
        yk = h + 0.35 + k * 0.3; xk = X - side * 0.5 + side * k * 0.43
        d.line([P(xk, yk, z0 - 0.4), P(xk, yk, z0 + depth + 0.4)], fill=C["roof_hi"], width=max(1, int(2 * S * 8 / z0)))
    d.line([P(X - side * 0.5, h + 0.35, z0 - 0.4), P(X - side * 0.5, h + 0.35, z0 + depth + 0.4)], fill=(255, 170, 120), width=max(1, int(3 * S * 8 / z0)))
    # windows: two floors
    for fl, wy in enumerate((1.0, h * 0.58)):
        n = max(1, int(depth / 3.2))
        for i in range(n):
            wz = z0 + 0.9 + i * (depth - 1.4) / n
            lit = r.random() < 0.6
            quad([(X, wy, wz), (X, wy + 1.3, wz), (X, wy + 1.3, wz + 1.5), (X, wy, wz + 1.5)], C["glow"] if lit else (60, 46, 66))
            d.line([P(X, wy + 0.65, wz), P(X, wy + 0.65, wz + 1.5)], fill=C["line"], width=max(1, int(3 * S * 6 / wz)))
            d.line([P(X, wy, wz + 0.75), P(X, wy + 1.3, wz + 0.75)], fill=C["line"], width=max(1, int(3 * S * 6 / wz)))
            if lit and wz < 60:
                x, y = P(X, wy + 0.65, wz + 0.75)
                windows.append((x, y, 1.6 * F / wz))
            if r.random() < 0.35 and fl == 1:  # AC unit under the window
                quad([(X - side * 0.1, wy - 0.9, wz + 0.2), (X - side * 0.1, wy - 0.3, wz + 0.2), (X - side * 0.1, wy - 0.3, wz + 1.1), (X - side * 0.1, wy - 0.9, wz + 1.1)], (200, 186, 186))
    # gutter
    d.line([P(X - side * 0.05, 0, z0 + 0.2), P(X - side * 0.05, h, z0 + 0.2)], fill=(90, 60, 60), width=max(1, int(4 * S * 6 / z0)))
    # block wall + hedge in front
    WX = side * 6.0
    quad([(WX, 0, z0 - 1), (WX, 1.25, z0 - 1), (WX, 1.25, z0 + depth + 1), (WX, 0, z0 + depth + 1)], C["block"] if side < 0 else C["block_sh"])
    for yy in (0.4, 0.82):
        d.line([P(WX, yy, z0 - 1), P(WX, yy, z0 + depth + 1)], fill=C["block_sh"], width=max(1, int(2 * S * 6 / z0)))
    zz = z0 - 1
    while zz < z0 + depth + 1:
        d.line([P(WX, 0, zz), P(WX, 1.25, zz)], fill=C["block_sh"], width=max(1, int(2 * S * 6 / zz)))
        zz += 0.8
    for k in range(int(depth * 1.5)):
        hz_ = z0 + r.uniform(-0.5, depth + 0.5)
        x, y = P(WX - side * 0.3, 1.45, hz_); rr = 0.55 * F / hz_
        d.ellipse((x - rr * 1.2, y - rr, x + rr * 1.2, y + rr * 0.8), fill=C["leaf"])
        d.ellipse((x - rr * 0.7 + side * rr * 0.3, y - rr * 0.9, x + rr * 0.5 + side * rr * 0.3, y - rr * 0.1), fill=C["leaf_hi"])

windows = []
for sx in (-1, 1):  # yards beyond the sidewalk, so the ground never ends in black
    gquad([(sx * 6.0, 0, 1.2), (sx * 60.0, 0, 1.2), (sx * 60.0, 0, far), (sx * 6.0, 0, far)], (58, 40, 52), C["asphalt_far"])
d = ImageDraw.Draw(img)
for side in (-1, 1):
    z = 80.0
    zs = []
    while z > 13:
        dep = rng.uniform(7, 11)
        zs.append((z, dep)); z -= dep + rng.uniform(1.5, 3)
    for z0, dep in zs:  # far to near
        house(side, z0, dep, rng.uniform(5.6, 6.8), int(z0 * 10 + side))
for x, y, r in windows:
    img = lightmap(img, x, y, r * 1.2, (255, 190, 110), 0.14)
d = ImageDraw.Draw(img)

# near block walls + hedges (in front of the first houses), drawn after them
def wall(side, z0, z1):
    WX = side * 6.0
    quad([(WX, 0, z0), (WX, 1.25, z0), (WX, 1.25, z1), (WX, 0, z1)], C["block"] if side < 0 else C["block_sh"])
    quad([(WX, 1.25, z0), (WX + side * 0.25, 1.25, z0), (WX + side * 0.25, 1.25, z1), (WX, 1.25, z1)], (180, 150, 140))
    for yy in (0.4, 0.82):
        d.line([P(WX, yy, z0), P(WX, yy, z1)], fill=C["block_sh"], width=max(1, int(2 * S * 3 / z0)))
    zz = z0
    while zz < z1:
        d.line([P(WX, 0, zz), P(WX, 1.25, zz)], fill=C["block_sh"], width=max(1, int(3 * S * 3 / zz)))
        zz += 0.8
    r = random.Random(side * 7)
    for k in range(40):
        hz_ = r.uniform(z0 + 1.5, z1)
        x, y = P(WX + side * 0.6, 1.5, hz_); rr = 0.5 * F / hz_
        d.ellipse((x - rr * 1.2, y - rr, x + rr * 1.2, y + rr * 0.8), fill=C["leaf"])
        d.ellipse((x - rr * 0.6 - side * rr * 0.3, y - rr * 0.9, x + rr * 0.5 - side * rr * 0.3, y - rr * 0.15), fill=C["leaf_hi"])
for side in (-1, 1):
    wall(side, 1.6, 15)

# ---------------- utility poles, wires, streetlamps
tops = {-1: [], 1: []}
for side in (-1, 1):
    for z in (6, 24, 42, 60, 78, 96):
        X = side * 5.4
        w = max(2, int(0.28 * F / z))
        d.line([P(X, 0, z), P(X, 10, z)], fill=C["pole"], width=w)
        for yb in (9.4, 8.6):
            d.line([P(X - 1.0, yb, z), P(X + 1.0, yb, z)], fill=C["pole"], width=max(2, w // 2))
        tops[side].append(z)
        if z in (24, 60):  # streetlamp just switched on
            a, b = P(X, 7.0, z), P(X - side * 1.4, 7.0, z)
            d.line([a, b], fill=C["pole"], width=max(2, w // 2))
            img = lightmap(img, b[0], b[1], 1.6 * F / z, (255, 200, 120), 0.7)
            gx, gy = P(X - side * 1.6, 0, z)
            img = lightmap(img, gx, gy, 3.4 * F / z, (255, 170, 90), 0.35, sy=0.35)
            d = ImageDraw.Draw(img)
            d.ellipse((b[0] - 0.22 * F / z, b[1] - 0.12 * F / z, b[0] + 0.22 * F / z, b[1] + 0.14 * F / z), fill=(255, 236, 190))
def wire(p0, p1, sag):
    pts = []
    for i in range(31):
        t = i / 30
        x = p0[0] + (p1[0] - p0[0]) * t; y = p0[1] + (p1[1] - p0[1]) * t + sag * 4 * t * (1 - t)
        pts.append((x, y))
    d.line(pts, fill=(34, 22, 34), width=max(2, int(1.6 * S)))
for side in (-1, 1):
    zs = tops[side]
    for za, zb in zip(zs, zs[1:]):
        for dx, yb in ((-0.9, 9.4), (0.9, 9.4), (-0.6, 8.6), (0.6, 8.6)):
            a, b = P(side * 5.4 + dx, yb, za), P(side * 5.4 + dx, yb, zb)
            wire(a, b, 0.5 * F / ((za + zb) / 2) * 3)
    # wires running toward the camera, sagging into the frame
    a = P(side * 5.4 - 0.9, 9.4, 6)
    wire(a, (a[0] - side * 900 * S, a[1] - 300 * S), 140 * S)
for z in (24, 60):  # wires crossing the street
    wire(P(-5.4, 9.4, z), P(5.4, 9.4, z), 0.9 * F / z)

# ---------------- props near the camera: parked car, sign, cat
def box(X0, X1, Y0, Y1, Z0, Z1, col, top=None):
    quad([(X0, Y0, Z0), (X1, Y0, Z0), (X1, Y1, Z0), (X0, Y1, Z0)], col)
    if top: quad([(X0, Y1, Z0), (X1, Y1, Z0), (X1, Y1, Z1), (X0, Y1, Z1)], top)
# parked car on the right, far
box(2.2, 3.9, 0.25, 1.05, 34, 38.5, (150, 150, 160), (200, 190, 190))
box(2.4, 3.7, 1.05, 1.55, 35, 37.5, (80, 90, 110))
for wz in (34, 34):
    pass
img = lightmap(img, *P(2.4, 0.7, 34), 0.5 * F / 34, (255, 80, 60), 0.6)
d = ImageDraw.Draw(img)
# no-entry sign at the near left kerb
sx, sy = P(-4.0, 2.3, 7.5); sr = 0.32 * F / 7.5
d.line([P(-4.0, 0, 7.5), (sx, sy)], fill=(120, 110, 120), width=int(0.06 * F / 7.5))
d.ellipse((sx - sr, sy - sr, sx + sr, sy + sr), fill=(200, 40, 50), outline=(240, 230, 230), width=int(sr * 0.12))
d.rectangle((sx - sr * 0.62, sy - sr * 0.16, sx + sr * 0.62, sy + sr * 0.16), fill=(240, 236, 230))
# a cat on the left wall
cx, cy = P(-6.0, 1.25, 12)
cs = 0.3 * F / 12
d.ellipse((cx - cs * 1.1, cy - cs * 0.6, cx + cs * 0.9, cy + cs * 0.1), fill=(60, 40, 44))
d.ellipse((cx + cs * 0.5, cy - cs * 1.0, cx + cs * 1.2, cy - cs * 0.3), fill=(60, 40, 44))
d.polygon([(cx + cs * 0.6, cy - cs * 0.9), (cx + cs * 0.7, cy - cs * 1.3), (cx + cs * 0.85, cy - cs * 0.95)], fill=(60, 40, 44))
d.line([(cx - cs * 1.0, cy - cs * 0.2), (cx - cs * 1.5, cy + cs * 0.6)], fill=(60, 40, 44), width=int(cs * 0.18))

# ---------------- grade: warm rim from the sun, bloom, vignette, grain
bloom = img.filter(ImageFilter.GaussianBlur(24 * S)).point(lambda v: int(max(0, v - 215) * 1.2))
img = ImageChops.add(img, bloom)
yy, xx = np.mgrid[0:H:8, 0:W:8]
dd = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
m = Image.fromarray((255 * (1 - np.clip((dd - 0.6) / 0.8, 0, 1) * 0.55)).astype(np.uint8), "L").resize((W, H), Image.BILINEAR)
img = Image.composite(img, Image.new("RGB", (W, H), (10, 6, 18)), m)
out = img.resize((1920, 1080), Image.LANCZOS)
a = np.asarray(out).astype(np.int16)
a = a + np.random.default_rng(3).normal(0, 3, a.shape[:2])[..., None].astype(np.int16)
Image.fromarray(a.clip(0, 255).astype(np.uint8)).save("/root/what-if-studio/out/style/dusk_street.jpg", quality=92)
print("ok")
