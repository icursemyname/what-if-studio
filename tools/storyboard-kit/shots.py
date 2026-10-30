import sys
from sbkit import *

OUT = "/root/what-if-studio/out/one-touch-gold/board"
SHOTS = {}


def shot(fn):
    SHOTS[fn.__name__] = fn
    return fn


# ------------------------------------------------------------ sets

def bedroom(img, night=True, clock="00:00", lamp_on=True):
    back = (520, 300, 1400, 760)
    room(img, back)
    d = ImageDraw.Draw(img)
    # posters, shelf, string lights
    frame_pic(d, (600, 360, 720, 520), (90, 120, 150))
    frame_pic(d, (740, 390, 830, 500), (170, 110, 90))
    d.rectangle((880, 470, 1040, 480), fill=(60, 44, 50))
    books(d, 890, 470, 7, 1.0, 3)
    for i in range(14):
        x = 560 + i * 60; y = 330 + 12 * math.sin(i)
        d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(255, 214, 140))
    img = light(img, 940, 330, 520, (255, 190, 120), 0.18, sy=0.3)
    window(img, (1070, 360, 1330, 590), sky=((24, 22, 58), (70, 50, 110)) if night else ((120, 150, 200), (250, 200, 150)),
           moon=(1260, 420, 26) if night else None, sun=None if night else (1150, 560, 40))
    d = ImageDraw.Draw(img)
    # bed (left)
    d.rectangle((540, 600, 860, 760), fill=(70, 50, 70))
    d.polygon([(560, 700), (860, 700), (900, 880), (420, 880)], fill=(150, 160, 200))
    d.polygon([(420, 880), (900, 880), (900, 930), (420, 930)], fill=(110, 116, 160))
    d.ellipse((580, 660, 720, 720), fill=(230, 230, 240))
    # nightstand + clock + lamp
    d.rectangle((900, 700, 1010, 830), fill=(84, 60, 56))
    d.rectangle((900, 690, 1010, 704), fill=(100, 72, 64))
    if lamp_on is not None:
        img = lamp(img, 935, 690, 0.8, on=lamp_on)
    clock_readout(img, 985, 662, 0.42, clock)
    d = ImageDraw.Draw(img)
    # desk under the window (right)
    desk(img, 1090, 1460, 780)
    # rug, trainers, beanbag
    d.ellipse((700, 900, 1300, 1020), fill=(110, 70, 80))
    d.ellipse((1500, 860, 1700, 990), fill=(170, 90, 70))
    d.ellipse((560, 990, 620, 1020), fill=(214, 214, 220)); d.ellipse((620, 995, 680, 1025), fill=(214, 214, 220))
    return img


def kitchen(img):
    back = (480, 300, 1440, 760)
    room(img, back, wall=(78, 64, 84), wall2=(58, 46, 66))
    d = ImageDraw.Draw(img)
    window(img, (820, 380, 1100, 580), sky=((90, 80, 140), (250, 160, 110)), sun=(960, 560, 36))
    d = ImageDraw.Draw(img)
    d.rectangle((480, 600, 1440, 760), fill=(70, 58, 66))
    d.rectangle((480, 590, 1440, 612), fill=(160, 150, 150))
    for x in range(520, 1420, 120):
        d.rectangle((x, 630, x + 100, 740), outline=(54, 44, 52), width=4)
    for x in (560, 640, 1180, 1260, 1340):
        d.rectangle((x, 520, x + 50, 590), fill=(180, 120, 90)); d.rectangle((x + 6, 510, x + 44, 522), fill=(90, 60, 50))
    d.rectangle((1230, 420, 1420, 432), fill=(60, 44, 50))
    books(d, 1240, 420, 6, 0.8, 9)
    img = pendant(img, 760, 260)
    img = pendant(img, 1180, 260)
    return img


def living(img, night=True):
    back = (420, 290, 1500, 770)
    room(img, back, wall=(66, 58, 88), wall2=(48, 42, 68))
    d = ImageDraw.Draw(img)
    window(img, (560, 360, 860, 600), sky=((20, 20, 50), (40, 36, 80)) if night else ((140, 160, 210), (250, 200, 150)),
           moon=None, city=True)
    d = ImageDraw.Draw(img)
    # curtains
    d.rectangle((520, 340, 580, 640), fill=(110, 60, 70)); d.rectangle((840, 340, 900, 640), fill=(110, 60, 70))
    frame_pic(d, (980, 380, 1120, 500), (100, 140, 120)); frame_pic(d, (1150, 400, 1240, 480), (180, 140, 90))
    # sofa
    d.rounded_rectangle((960, 620, 1420, 780), 30, fill=(70, 90, 110))
    d.rounded_rectangle((940, 700, 1440, 820), 30, fill=(80, 104, 126))
    # door (right wall, to the porch) and stairs (left)
    d.polygon([(1540, 380), (1700, 300), (1700, 1000), (1540, 860)], fill=(40, 32, 44))
    # floor lamp
    d.line([(1460, 820), (1460, 520)], fill=(40, 34, 50), width=8)
    d.polygon([(1410, 520), (1510, 520), (1490, 450), (1430, 450)], fill=(240, 196, 130))
    img = light(img, 1460, 520, 520, (255, 176, 96), 0.6)
    plant(ImageDraw.Draw(img), 470, 860, 1.4)
    return img


def street(img, dusk=True, night=False):
    if night:
        grad(img, (0, 0, W, 700), (12, 12, 34), (40, 30, 70))
    else:
        grad(img, (0, 0, W, 700), (70, 50, 120), (250, 140, 90))
        img = light(img, 1500, 640, 500, (255, 170, 90), 0.8)
    d = ImageDraw.Draw(img)
    rng = random.Random(4)
    x = -40
    while x < W:  # houses
        w = rng.randint(260, 380); h = rng.randint(260, 360); c = rng.choice([(70, 56, 90), (84, 62, 84), (60, 54, 86)])
        d.rectangle((x, 700 - h, x + w, 700), fill=c)
        d.polygon([(x - 20, 700 - h), (x + w / 2, 700 - h - 120), (x + w + 20, 700 - h)], fill=(46, 36, 60))
        for wx in (x + 40, x + w - 110):
            lit = rng.random() < (0.6 if night else 0.4)
            d.rectangle((wx, 700 - h + 60, wx + 70, 700 - h + 150), fill=(255, 200, 120) if lit else (40, 34, 60))
        d.rectangle((x + w / 2 - 34, 700 - 140, x + w / 2 + 34, 700), fill=(44, 34, 46))
        x += w + rng.randint(30, 80)
    d.rectangle((0, 700, W, 760), fill=(90, 86, 100))
    grad(img, (0, 760, W, H), (60, 56, 70), (30, 28, 38))
    d = ImageDraw.Draw(img)
    for x in range(0, W, 220):
        d.rectangle((x, 900, x + 110, 912), fill=(160, 150, 120))
    # streetlamps
    for lx in (300, 1300):
        d.line([(lx, 760), (lx, 420)], fill=(30, 28, 40), width=10)
        d.line([(lx, 420), (lx + 60, 420)], fill=(30, 28, 40), width=8)
        d.ellipse((lx + 44, 414, lx + 80, 438), fill=(255, 220, 160))
        img = light(img, lx + 62, 440, 380 if night else 200, (255, 190, 110), 0.6 if night else 0.3)
        d = ImageDraw.Draw(img)
    return img


def schematic(img, title=None):
    grad(img, (0, 0, W, H), (18, 20, 34), (10, 12, 22))
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(30, 36, 56), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(30, 36, 56), width=1)
    if title:
        text(img, (110, 90), title, 40, fill=(140, 170, 220), path=FONT_MONO, anchor="lm")
    return img


# ------------------------------------------------------------ shots

@shot
def S01():  # wide bedroom, midnight, Pip at the desk
    img = canvas()
    img = bedroom(img, clock="00:00")
    contact(img, 1250, 900, 260)
    d = ImageDraw.Draw(img)
    # chair
    d.rectangle((1180, 800, 1330, 820), fill=(60, 44, 50)); d.line([(1200, 820), (1200, 900)], fill=(50, 38, 44), width=10); d.line([(1310, 820), (1310, 900)], fill=(50, 38, 44), width=10)
    char(img, 1250, 900, 1.0, "pip", face=0.6, expr="neutral", legs="sit", arms=((-5, 10), (40, 40)), glow="R", rim="L", lean=0.1)
    d = ImageDraw.Draw(img)
    paperclip(d, 1390, 742, 0.5, col=(190, 196, 210))
    img = darken(img, 0.12)
    blur_layer(img, lambda d, l: d.rectangle((0, 820, 340, H), fill=(14, 10, 20, 255)), 18)
    return img


@shot
def S02():  # macro: glowing fingertip, steel paperclip
    img = canvas((70, 48, 52), (40, 28, 34))
    d = ImageDraw.Draw(img)
    poly_grad(img, [(0, 560), (W, 500), (W, H), (0, H)], (110, 76, 60), (64, 44, 40))
    blur_layer(img, lambda d, l: [d.rectangle((1300, 180, 1600, 480), fill=(240, 196, 130, 160))], 60)
    d = ImageDraw.Draw(img)
    paperclip(d, 900, 760, 3.2, col=(190, 196, 210), ang=-8, w=26)
    contact(img, 900, 800, 520, 40, 0.4)
    # the finger coming in from the top right
    paste_hand(img, hand_layer("point", tips=(255, 250, 220)), 1457, 59, 1.1, angle=140)
    img = light(img, 1020, 640, 380, (255, 214, 120), 1.0)
    return img


@shot
def S03():  # macro: the paperclip is gold
    img = canvas((70, 48, 52), (40, 28, 34))
    poly_grad(img, [(0, 560), (W, 500), (W, H), (0, H)], (110, 76, 60), (64, 44, 40))
    img = light(img, 960, 720, 700, (255, 196, 90), 0.75)
    d = ImageDraw.Draw(img)
    paperclip(d, 960, 740, 3.4, col=GOLD, ang=-8, w=28)
    contact(img, 960, 790, 560, 44, 0.4)
    d = ImageDraw.Draw(img)
    for (x, y, r) in [(700, 620, 40), (1240, 660, 30), (1060, 560, 22), (820, 850, 18)]:
        sparkle(d, x, y, r)
    return img


@shot
def S04():  # Nina in the doorway, hall light behind (low angle)
    img = canvas((40, 32, 58), (22, 18, 34))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, H), fill=(44, 36, 60))
    poly_grad(img, [(0, 860), (W, 820), (W, H), (0, H)], (70, 52, 58), (40, 30, 38))
    # door frame + hall light
    grad(img, (700, 80, 1220, 860), (255, 214, 150), (230, 150, 90))
    img = light(img, 960, 420, 700, (255, 190, 110), 0.55)
    d = ImageDraw.Draw(img)
    d.rectangle((660, 60, 720, 880), fill=(60, 46, 50)); d.rectangle((1200, 60, 1260, 880), fill=(60, 46, 50)); d.rectangle((660, 40, 1260, 90), fill=(60, 46, 50))
    d.polygon([(1220, 90), (1500, 30), (1500, 960), (1220, 880)], fill=(84, 60, 56))  # door ajar
    d.ellipse((1450, 470, 1480, 500), fill=(200, 170, 90))
    contact(img, 960, 870, 300)
    pts = char(img, 960, 870, 1.55, "nina", face=-0.1, expr="wide", arms=((-30, 60), (25, -50)), rim="R", rim_col=(255, 220, 160))
    d = ImageDraw.Draw(img)
    hx, hy = pts["hands"][0]
    # stuffed rabbit
    d.ellipse((hx - 50, hy - 30, hx + 30, hy + 60), fill=(200, 190, 200), outline=INK, width=5)
    d.ellipse((hx - 40, hy - 100, hx + 20, hy - 20), fill=(200, 190, 200), outline=INK, width=5)
    d.ellipse((hx - 36, hy - 170, hx - 14, hy - 90), fill=(200, 190, 200), outline=INK, width=5)
    d.ellipse((hx - 6, hy - 166, hx + 16, hy - 90), fill=(200, 190, 200), outline=INK, width=5)
    blur_layer(img, lambda d, l: d.ellipse((-200, 700, 520, 1400), fill=(12, 8, 18, 255)), 24)
    return img


@shot
def S05():  # close-up: Pip looks at his hand, glow gone
    img = canvas((52, 40, 70), (24, 20, 36))
    img = light(img, 1500, 300, 700, (120, 130, 210), 0.35)
    img = light(img, 600, 700, 600, (255, 170, 100), 0.55)
    blur_layer(img, lambda d, l: [d.rectangle((1280, 120, 1700, 520), fill=(60, 50, 110, 255)), d.ellipse((1560, 180, 1630, 250), fill=(240, 236, 214, 255))], 30)
    char(img, 1120, 1520, 3.0, "pip", face=-0.45, expr="awe", arms=((-10, 8), (10, -8)), rim="L", rim_col=(255, 180, 110))
    paste_hand(img, hand_layer("open"), 560, 1180, 1.05, angle=-12)
    return img


@shot
def S06():  # title card: house at midnight
    img = canvas()
    img = street(img, night=True)
    img = darken(img, 0.25)
    d = ImageDraw.Draw(img)
    d.ellipse((1620, 120, 1700, 200), fill=(244, 236, 214))
    img = light(img, 1660, 160, 300, (120, 130, 210), 0.4)
    text(img, (960, 330), "WHAT IF YOU COULD", 62, fill=(255, 240, 220), stroke=6)
    text(img, (960, 450), "TURN ONE THING", 118, fill=(255, 255, 255), stroke=10)
    text(img, (960, 590), "INTO GOLD?", 150, fill=GOLD, stroke=12)
    return img


@shot
def S07():  # morning, medium: sitting up in bed, both arms wrapped round a solid gold pillow
    img = canvas((96, 84, 110), (70, 60, 86))
    # window high on the wall, sun inside it; its glow stays inside the glass
    wr = (1250, 150, 1610, 480)
    win = img.copy()
    window(win, wr, sky=((150, 180, 225), (255, 214, 165)), sun=(1470, 270, 44), city=True)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).rectangle((wr[0] - 24, wr[1] - 24, wr[2] + 24, wr[3] + 40), fill=255)
    img.paste(win, (0, 0), mask)
    # floor: the wall meets it at y 960
    poly_grad(img, [(0, 960), (W, 960), (W, H), (0, H)], (88, 64, 62), (58, 42, 44))
    d = ImageDraw.Draw(img)
    d.line([(0, 960), (W, 960)], fill=(44, 34, 44), width=6)
    for bx in range(-200, W + 400, 240):
        d.line([(bx, 960), (bx - 160, H)], fill=(70, 52, 52), width=3)
    d.ellipse((-120, 1000, 420, 1120), fill=(110, 70, 80))  # rug by the bed
    frame_pic(d, (180, 220, 360, 400), (90, 120, 150))
    # headboard behind Pip, nightstand with clock under the window
    d.rounded_rectangle((440, 560, 1200, 1000), 40, fill=(84, 58, 66), outline=(58, 40, 48), width=8)
    d.rectangle((1290, 780, 1500, H), fill=(84, 60, 56)); d.rectangle((1280, 766, 1510, 790), fill=(100, 72, 64))
    lamp(img, 1340, 766, 0.7, on=False)
    clock_readout(img, 1440, 736, 0.4, "07:12", glow=(120, 220, 160))
    # morning light falls on Pip and the bed, not on the wall below the window
    img = light(img, 860, 900, 560, (255, 214, 160), 0.38)
    x, s_ = 820, 1.9
    pts = char(img, x, 1203, s_, "pip", face=0.15, expr="worried", legs=None, arms=((0, 0), (0, 0)), rim="R", rim_col=(255, 224, 170), head_tilt=-1.5)
    d = ImageDraw.Draw(img)
    # the gold pillow, held against the chest
    pb = (590, 810, 1050, 1020)
    d.rounded_rectangle(pb, 70, fill=GOLD, outline=GOLD_SH, width=10)
    d.arc((620, 830, 1020, 1000), 200, 340, fill=GOLD_HI, width=10)
    for cx, cy in [(600, 820), (1040, 820), (600, 1010), (1040, 1010)]:
        d.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=GOLD_SH)
    sparkle(d, 1040, 800, 30); sparkle(d, 640, 990, 18)
    # both arms wrap round it, drawn over the pillow so the hug reads
    from sbkit import _limb
    L = LOOKS["pip"]; lw = 13 * s_
    sh_l, sh_r = (744, 789), (896, 789)
    for sh, el, hd in [(sh_l, (620, 900), (790, 935)), (sh_r, (1020, 900), (860, 945))]:
        _limb(d, [sh, el, hd], lw, L["body"], L["line"])
        d.ellipse((hd[0] - 28, hd[1] - 28, hd[0] + 28, hd[1] + 28), fill=L["skin"], outline=L["line"], width=8)
    # duvet over the legs: exactly the bed's width (headboard 440-1200), widening toward the camera
    contact(img, 820, H - 10, 1000, 60, 0.5)
    d = ImageDraw.Draw(img)
    d.polygon([(420, 1000), (1220, 1000), (1290, H), (350, H)], fill=(150, 160, 205), outline=(110, 118, 166))
    d.line([(420, 1000), (1220, 1000)], fill=(110, 118, 166), width=8)
    d.polygon([(1220, 1000), (1250, 1010), (1320, H), (1290, H)], fill=(112, 120, 168))  # duvet edge falling over the side
    for fx in (560, 1080):
        d.arc((fx - 120, 1012, fx + 120, 1110), 200, 330, fill=(120, 128, 176), width=6)
    img = light(img, 1000, 1040, 300, (255, 220, 160), 0.25, sy=0.4)  # sun patch on the duvet
    return img


@shot
def S08():  # insert: gold glove on the floor
    img = canvas((50, 40, 60), (30, 24, 36))
    poly_grad(img, [(0, 300), (W, 260), (W, H), (0, H)], (90, 64, 60), (50, 36, 38))
    d = ImageDraw.Draw(img)
    for x in range(-400, W + 400, 200):
        d.line([(x, 300), (x - 300, H)], fill=(70, 50, 48), width=4)
    img = light(img, 960, 640, 600, (255, 190, 110), 0.55)
    contact(img, 960, 760, 560, 70, 0.5)
    d = ImageDraw.Draw(img)
    # glove: palm + 4 fingers + thumb
    d.rounded_rectangle((760, 560, 1100, 760), 50, fill=GOLD, outline=GOLD_SH, width=10)
    for i in range(4):
        d.rounded_rectangle((1060, 560 + i * 48, 1260, 600 + i * 48), 22, fill=GOLD, outline=GOLD_SH, width=8)
    d.rounded_rectangle((900, 470, 980, 600), 30, fill=GOLD, outline=GOLD_SH, width=8)
    d.rounded_rectangle((640, 600, 790, 720), 20, fill=GOLD_SH)
    d.line([(800, 600), (1050, 600)], fill=GOLD_HI, width=10)
    for (x, y) in [(700, 520), (1290, 620)]:
        sparkle(d, x, y, 30)
    # clank lines
    for a in (-30, 0, 30):
        r = math.radians(a)
        d.line([(960 + math.sin(r) * 300, 430 - math.cos(r) * 40), (960 + math.sin(r) * 360, 380 - math.cos(r) * 60)], fill=(255, 240, 200), width=8)
    return img


@shot
def S09():  # medium: sitting very still on the bed edge, 23:59
    img = canvas()
    img = bedroom(img, clock="23:59")
    img = darken(img, 0.15)
    contact(img, 760, 900, 240)
    char(img, 760, 900, 1.15, "pip", face=0.5, expr="determined", legs="sit", arms=((20, 30), (30, 30)), rim="R")
    blur_layer(img, lambda d, l: d.rectangle((1500, 600, W, H), fill=(14, 10, 20, 255)), 20)
    return img


@shot
def S10():  # kitchen: Mom stirs coffee with a gold spoon
    img = canvas((80, 66, 90), (40, 32, 46))
    img = kitchen(img)
    d = ImageDraw.Draw(img)
    # island in front
    contact(img, 960, 920, 300)
    pts = char(img, 960, 980, 1.15, "mom", face=-0.3, expr="neutral", arms=((-10, 8), (30, 80)), rim="R")
    d = ImageDraw.Draw(img)
    d.rectangle((560, 820, 1400, 860), fill=(170, 160, 160))
    d.rectangle((580, 860, 1380, H), fill=(90, 70, 70))
    # mug + gold spoon
    hx, hy = pts["hands"][1]
    d.rounded_rectangle((1010, 740, 1100, 830), 14, fill=(230, 226, 220), outline=INK, width=5)
    d.arc((1080, 760, 1130, 810), 270, 90, fill=(230, 226, 220), width=12)
    d.line([(1040, 700), (1070, 790)], fill=GOLD, width=14)
    d.ellipse((1030, 690, 1056, 712), fill=GOLD)
    sparkle(d, 1030, 690, 18)
    blur_layer(img, lambda d, l: d.ellipse((1500, 650, 2200, 1300), fill=(14, 10, 20, 255)), 22)
    return img


@shot
def S11():  # street at dusk: the gold bike folds, Pip on the ground
    img = canvas()
    img = street(img)
    d = ImageDraw.Draw(img)
    contact(img, 900, 880, 520, 60)
    d = ImageDraw.Draw(img)
    # pretzel bike
    for (cx, cy) in [(720, 830), (1080, 830)]:
        d.ellipse((cx - 90, cy - 90, cx + 90, cy + 90), outline=GOLD_SH, width=16)
        d.ellipse((cx - 90, cy - 90, cx + 90, cy + 90), outline=GOLD, width=10)
    d.line([(720, 830), (860, 900), (900, 760), (1080, 830)], fill=GOLD, width=18, joint="curve")
    d.line([(860, 900), (820, 700), (760, 690)], fill=GOLD, width=16)
    sparkle(d, 940, 700, 26)
    # Pip sprawled on the road
    char(img, 1300, 960, 0.95, "pip", face=-0.6, expr="shock", legs="sit", arms=((-60, -30), (60, 30)), rim="R")
    blur_layer(img, lambda d, l: d.rectangle((0, 980, W, H), fill=(14, 10, 20, 200)), 18)
    return img



def car(d, x, y, s=1.0, body=GOLD, sh=GOLD_SH, hi=GOLD_HI, win=None):
    """Side-on hatchback, wheels on the ground at y."""
    win = win or sh
    d.rounded_rectangle((x - 300 * s, y - 150 * s, x + 300 * s, y - 40 * s), 40 * s, fill=body, outline=sh, width=int(8 * s))
    d.polygon([(x - 170 * s, y - 150 * s), (x - 110 * s, y - 250 * s), (x + 120 * s, y - 250 * s), (x + 200 * s, y - 150 * s)], fill=body, outline=sh)
    d.polygon([(x - 140 * s, y - 155 * s), (x - 96 * s, y - 230 * s), (x - 10 * s, y - 230 * s), (x - 10 * s, y - 155 * s)], fill=win)
    d.polygon([(x + 10 * s, y - 155 * s), (x + 10 * s, y - 230 * s), (x + 110 * s, y - 230 * s), (x + 170 * s, y - 155 * s)], fill=win)
    d.line([(x - 260 * s, y - 120 * s), (x + 240 * s, y - 120 * s)], fill=hi, width=int(8 * s))
    for wx in (x - 180 * s, x + 180 * s):
        d.ellipse((wx - 62 * s, y - 100 * s, wx + 62 * s, y + 24 * s), fill=(30, 26, 34))
        d.ellipse((wx - 30 * s, y - 68 * s, wx + 30 * s, y - 8 * s), fill=sh)


def tv(img, x0, y0, x1, y1):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x0 - 18, y0 - 18, x1 + 18, y1 + 18), 16, fill=(16, 14, 20))
    d.line([((x0 + x1) / 2, y1 + 18), ((x0 + x1) / 2, y1 + 70)], fill=(16, 14, 20), width=16)
    d.rectangle(((x0 + x1) / 2 - 120, y1 + 70, (x0 + x1) / 2 + 120, y1 + 84), fill=(16, 14, 20))


def camel(d, x, y, s=1.0, col=(30, 20, 30)):
    d.ellipse((x - 90 * s, y - 150 * s, x + 90 * s, y - 60 * s), fill=col)
    d.ellipse((x - 40 * s, y - 200 * s, x + 30 * s, y - 120 * s), fill=col)
    d.line([(x + 80 * s, y - 120 * s), (x + 140 * s, y - 200 * s)], fill=col, width=int(26 * s))
    d.ellipse((x + 120 * s, y - 230 * s, x + 190 * s, y - 190 * s), fill=col)
    for lx in (-70, -40, 40, 70):
        d.line([(x + lx * s, y - 80 * s), (x + lx * s, y)], fill=col, width=int(14 * s))
    d.rectangle((x - 60 * s, y - 210 * s, x + 20 * s, y - 170 * s), fill=GOLD_SH)


@shot
def S12():  # Theo holds the phone-shaped gold lump; Pip OTS
    img = canvas()
    img = living(img, night=False)
    img = light(img, 700, 480, 700, (255, 200, 140), 0.35)
    contact(img, 1100, 980, 300)
    pts = char(img, 1100, 980, 1.5, "theo", face=-0.35, expr="shock", arms=((20, 70), (-20, -70)), rim="L")
    d = ImageDraw.Draw(img)
    hx = (pts["hands"][0][0] + pts["hands"][1][0]) / 2; hy = (pts["hands"][0][1] + pts["hands"][1][1]) / 2
    d.rounded_rectangle((hx - 50, hy - 90, hx + 50, hy + 60), 22, fill=GOLD, outline=GOLD_SH, width=8)
    d.line([(hx - 30, hy - 70), (hx - 30, hy + 30)], fill=GOLD_HI, width=8)
    sparkle(d, hx + 50, hy - 90, 22)
    # Pip, over the shoulder, blurred dark foreground
    def fg(d, l):
        d.ellipse((150, 520, 650, 1020), fill=(20, 16, 28, 255)); d.rectangle((60, 900, 760, H), fill=(20, 16, 28, 255))
    blur_layer(img, fg, 14)
    return img


@shot
def S13():  # Mom asleep on the couch at 8 pm, smiling; bill marked PAID
    img = canvas()
    img = living(img, night=True)
    d = ImageDraw.Draw(img)
    # mom lying on the sofa: torso horizontal
    d.rounded_rectangle((1000, 640, 1330, 720), 40, fill=LOOKS["mom"]["body"], outline=INK, width=5)
    d.ellipse((900, 610, 1020, 730), fill=LOOKS["mom"]["skin"], outline=INK, width=5)
    d.chord((890, 600, 1030, 700), 180, 360, fill=LOOKS["mom"]["hair"])
    d.ellipse((900, 610, 1020, 730), outline=(226, 232, 242), width=4)
    d.arc((930, 662, 950, 676), 200, 340, fill=(245, 245, 250), width=4); d.arc((962, 662, 982, 676), 200, 340, fill=(245, 245, 250), width=4)
    d.arc((940, 684, 975, 704), 20, 160, fill=(245, 245, 250), width=4)
    d.rectangle((1330, 650, 1420, 700), fill=(58, 52, 70))
    # coffee table + PAID bill
    d.polygon([(900, 860), (1440, 860), (1500, 930), (840, 930)], fill=(92, 62, 50))
    d.rectangle((840, 930, 1500, 950), fill=(62, 42, 38))
    d.polygon([(1080, 870), (1250, 868), (1262, 920), (1070, 922)], fill=(236, 232, 220))
    text(img, (1166, 895), "PAID", 30, fill=(200, 60, 60), path=FONT_MONO)
    chip(img, 110, 120, "DAY 12", 40)
    blur_layer(img, lambda d, l: d.rectangle((0, 960, W, H), fill=(14, 10, 20, 230)), 18)
    return img


@shot
def S14():  # close-up: Nina and a cake slice with gold leaf
    img = canvas((80, 66, 90), (40, 32, 46))
    img = kitchen(img)
    img = darken(img, 0.2)
    blur_layer(img, lambda d, l: d.rectangle((0, 0, W, H), fill=(0, 0, 0, 0)), 1)
    img = img.filter(ImageFilter.GaussianBlur(10))
    img = light(img, 960, 500, 800, (255, 190, 120), 0.35)
    char(img, 820, 1480, 2.6, "nina", face=0.3, expr="awe", arms=((-10, 8), (10, -8)), rim="R")
    d = ImageDraw.Draw(img)
    # plate + slice in the foreground
    d.ellipse((1060, 860, 1560, 980), fill=(236, 232, 226), outline=INK, width=6)
    d.polygon([(1140, 900), (1480, 880), (1420, 780), (1180, 760)], fill=(120, 70, 60), outline=INK)
    d.polygon([(1180, 760), (1420, 780), (1400, 730), (1200, 716)], fill=(250, 236, 220), outline=INK)
    d.polygon([(1240, 730), (1360, 736), (1340, 712), (1252, 708)], fill=GOLD)
    for (x, y, r) in [(1250, 690, 24), (1380, 700, 16)]:
        sparkle(d, x, y, r)
    return img


@shot
def S15():  # schematic: all the gold ever mined, as a cube, next to a building
    img = canvas()
    img = schematic(img, "ALL GOLD EVER MINED")
    d = ImageDraw.Draw(img)
    gy = 900
    d.line([(100, gy), (1820, gy)], fill=(120, 150, 200), width=4)
    # building ~7 floors (each 3.2 m): 22.4 m tall -> scale 26 px/m
    k = 26
    bx = 1180
    d.rectangle((bx, gy - 7 * 3.2 * k, bx + 360, gy), outline=(120, 150, 200), width=4)
    for f in range(1, 7):
        y = gy - f * 3.2 * k
        d.line([(bx, y), (bx + 360, y)], fill=(70, 90, 130), width=2)
        for wx in range(bx + 30, bx + 340, 80):
            d.rectangle((wx, y + 20, wx + 40, y + 60), outline=(90, 110, 160), width=2)
    # cube 22.6 m, drawn in light perspective
    cs = 22.6 * k
    cx0 = 420
    front = [(cx0, gy - cs), (cx0 + cs, gy - cs), (cx0 + cs, gy), (cx0, gy)]
    d.polygon(front, fill=GOLD, outline=GOLD_SH)
    d.polygon([(cx0, gy - cs), (cx0 + 120, gy - cs - 80), (cx0 + cs + 120, gy - cs - 80), (cx0 + cs, gy - cs)], fill=GOLD_HI, outline=GOLD_SH)
    d.polygon([(cx0 + cs, gy - cs), (cx0 + cs + 120, gy - cs - 80), (cx0 + cs + 120, gy - 80), (cx0 + cs, gy)], fill=GOLD_SH)
    img = light(img, cx0 + cs / 2, gy - cs / 2, 700, (255, 190, 80), 0.35)
    # Pip for scale
    char(img, 1040, gy, 0.12, "pip", face=-0.6, expr="awe", rim="L")
    d = ImageDraw.Draw(img)
    d.line([(cx0, gy + 40), (cx0 + cs, gy + 40)], fill=(255, 236, 190), width=3)
    text(img, (cx0 + cs / 2, gy + 80), "22.6 m", 46, fill=(255, 236, 190), path=FONT_MONO)
    text(img, (cx0 + cs / 2, gy - cs / 2), "~222,600 t", 52, fill=(90, 60, 10), path=FONT_MONO)
    return img


@shot
def S16():  # schematic: neutron stars collide, gold is forged
    img = canvas()
    img = schematic(img, "WHERE GOLD COMES FROM")
    d = ImageDraw.Draw(img)
    for i in range(3):
        d.arc((560 - i * 90, 240 - i * 60, 1360 + i * 90, 840 + i * 60), 200 + i * 10, 340 + i * 10, fill=(80, 110, 180), width=3)
    img = light(img, 960, 540, 520, (255, 220, 160), 1.0)
    img = light(img, 960, 540, 900, (200, 140, 255), 0.35)
    d = ImageDraw.Draw(img)
    for (x, y) in [(860, 520), (1060, 560)]:
        d.ellipse((x - 46, y - 46, x + 46, y + 46), fill=(220, 230, 255))
    rng = random.Random(3)
    for _ in range(70):
        a = rng.uniform(0, 2 * math.pi); r = rng.uniform(160, 520)
        x, y = 960 + math.cos(a) * r, 540 + math.sin(a) * r * 0.7
        rr = rng.uniform(6, 16)
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=GOLD)
    text(img, (960, 960), "NEUTRON STAR COLLISION", 44, fill=(200, 210, 240), path=FONT_MONO)
    return img


@shot
def S17():  # schematic: the particle accelerator made 29 picograms of gold
    img = canvas()
    img = schematic(img, "THE ONLY GOLD HUMANS HAVE EVER MADE")
    d = ImageDraw.Draw(img)
    d.ellipse((460, 230, 1460, 870), outline=(90, 130, 210), width=26)
    d.ellipse((460, 230, 1460, 870), outline=(160, 200, 255), width=6)
    for (x, y) in [(560, 420), (1360, 680)]:
        img = light(img, x, y, 160, (140, 200, 255), 0.8)
    d = ImageDraw.Draw(img)
    img = light(img, 960, 550, 140, (255, 210, 110), 0.9)
    d = ImageDraw.Draw(img)
    d.ellipse((952, 542, 968, 558), fill=GOLD)
    d.line([(968, 552), (1180, 470)], fill=(255, 236, 190), width=3)
    chip(img, 1190, 450, "Au  29 pg", 44)
    chip(img, 1190, 540, "t < 0.000001 s", 44)
    chip(img, 150, 960, "LHC  2015-2018", 40)
    return img


@shot
def S18():  # junkyard at dusk: the gold car sinks into the mud
    img = canvas()
    grad(img, (0, 0, W, 760), (70, 50, 120), (250, 130, 80))
    img = light(img, 1500, 700, 520, (255, 160, 80), 0.9)
    d = ImageDraw.Draw(img)
    d.ellipse((1430, 630, 1570, 770), fill=(255, 210, 140))
    rng = random.Random(8)
    for _ in range(9):  # junk piles
        x = rng.randint(-100, W); w = rng.randint(300, 600); h = rng.randint(120, 300)
        d.polygon([(x - w / 2, 780), (x - w * 0.2, 780 - h), (x + w * 0.25, 780 - h * 0.8), (x + w / 2, 780)], fill=(40, 30, 50))
    grad(img, (0, 760, W, H), (80, 60, 50), (40, 30, 30))
    d = ImageDraw.Draw(img)
    contact(img, 1060, 930, 760, 60, 0.6)
    d = ImageDraw.Draw(img)
    car(d, 1060, 950, 1.35)
    for mx in range(560, 1580, 70):  # mud swallowing the wheels
        d.ellipse((mx - 70, 920, mx + 70, 990), fill=(74, 54, 44))
    d.rectangle((520, 955, 1600, 1010), fill=(74, 54, 44))
    img = light(img, 1060, 800, 560, (255, 200, 90), 0.35)
    d = ImageDraw.Draw(img)
    for (x, y, r) in [(780, 680, 30), (1400, 720, 24)]:
        sparkle(d, x, y, r)
    contact(img, 300, 960, 160)
    char(img, 300, 960, 0.75, "pip", face=0.6, expr="awe", rim="R")
    return img


@shot
def S19():  # TV news: gold flooding the markets, price falling
    img = canvas((44, 36, 56), (24, 20, 32))
    d = ImageDraw.Draw(img)
    frame_pic(d, (180, 160, 380, 360), (110, 100, 140))
    img = light(img, 960, 500, 900, (120, 160, 230), 0.5)
    tv(img, 380, 160, 1540, 800)
    grad(img, (380, 160, 1540, 800), (30, 40, 80), (14, 18, 40))
    d = ImageDraw.Draw(img)
    # anchor silhouette + chart
    d.ellipse((470, 300, 610, 440), fill=(60, 70, 110)); d.rounded_rectangle((420, 430, 660, 640), 40, fill=(60, 70, 110))
    pts = [(760, 330), (880, 360), (960, 340), (1060, 450), (1160, 430), (1280, 560), (1440, 640)]
    d.line(pts, fill=(240, 90, 80), width=10, joint="curve")
    d.polygon([(1440, 640), (1400, 600), (1460, 590)], fill=(240, 90, 80))
    for i in range(4):
        gold_bar(d, 820 + i * 110, 610, 0.9)
    d.rectangle((380, 690, 1540, 800), fill=(170, 40, 50))
    text(img, (420, 745), "MYSTERY GOLD FLOODS LOCAL MARKETS", 44, fill=(255, 255, 255), path=FONT_TITLE, anchor="lm")
    blur_layer(img, lambda d, l: d.rectangle((0, 900, W, H), fill=(10, 8, 14, 255)), 20)
    return img


@shot
def S20():  # history: a gold caravan, 1324, Cairo's gold loses value
    img = canvas()
    grad(img, (0, 0, W, 700), (90, 60, 120), (250, 160, 90))
    img = light(img, 1500, 620, 520, (255, 190, 100), 0.8)
    d = ImageDraw.Draw(img)
    d.ellipse((1440, 560, 1560, 680), fill=(255, 220, 150))
    d.polygon([(0, 700), (500, 620), (1100, 690), (1500, 640), (W, 700), (W, H), (0, H)], fill=(170, 110, 70))
    d.polygon([(0, 800), (700, 740), (1300, 800), (W, 760), (W, H), (0, H)], fill=(130, 80, 56))
    for i, x in enumerate((360, 640, 920, 1200)):
        camel(d, x, 780 - (i % 2) * 10, 1.0)
    chip(img, 110, 120, "CAIRO, 1324", 44)
    chip(img, 1300, 140, "1 mithqal: 25 -> 22 dirhams", 34)
    return img


@shot
def S21():  # porch at dusk: Theo holds his grandma's necklace
    img = canvas()
    grad(img, (0, 0, W, H), (80, 60, 100), (40, 30, 50))
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 760), fill=(86, 66, 80))
    for x in range(0, W, 90):
        d.line([(x, 0), (x, 760)], fill=(70, 54, 66), width=4)
    d.rectangle((300, 200, 620, 760), fill=(60, 44, 52))  # door
    d.ellipse((560, 470, 590, 500), fill=(200, 170, 90))
    d.rectangle((1100, 200, 1500, 520), fill=(255, 200, 130)); d.rectangle((1100, 200, 1500, 520), outline=(50, 40, 50), width=16)
    img = light(img, 1300, 360, 600, (255, 180, 100), 0.6)
    img = light(img, 760, 160, 400, (255, 200, 130), 0.6)
    d = ImageDraw.Draw(img)
    d.ellipse((740, 140, 780, 180), fill=(255, 236, 190))
    for i in range(3):  # steps
        d.rectangle((0, 760 + i * 100, W, 860 + i * 100), fill=(110 - i * 20, 80 - i * 14, 70 - i * 12))
        d.line([(0, 760 + i * 100), (W, 760 + i * 100)], fill=(50, 36, 40), width=4)
    contact(img, 1100, 860, 220); contact(img, 760, 860, 220)
    pts = char(img, 1100, 960, 1.05, "theo", face=-0.3, expr="sad", legs="sit", arms=((35, 60), (-10, -40)), rim="R")
    d = ImageDraw.Draw(img)
    hx, hy = pts["hands"][0]
    d.arc((hx - 40, hy - 20, hx + 40, hy + 60), 0, 180, fill=GOLD, width=8)
    d.ellipse((hx - 12, hy + 50, hx + 12, hy + 74), fill=GOLD)
    char(img, 760, 960, 1.05, "pip", face=0.4, expr="sad", legs="sit", arms=((10, 20), (20, 30)), rim="R")
    return img


@shot
def S22():  # night street, high angle: a grey car parked opposite the house
    img = canvas()
    img = street(img, night=True)
    d = ImageDraw.Draw(img)
    car(d, 1100, 990, 1.0, body=(110, 112, 120), sh=(70, 72, 80), hi=(150, 152, 160), win=(30, 34, 46))
    for hx in (790,):
        img = light(img, hx, 900, 340, (255, 250, 220), 0.7, sy=0.4)
    d = ImageDraw.Draw(img)
    chip(img, 110, 120, "DAY 26", 40)
    blur_layer(img, lambda d, l: d.polygon([(0, 0), (520, 0), (0, 520)], fill=(10, 8, 14, 255)), 26)
    return img


@shot
def S23():  # over the shoulder: the man in the grey suit at the door
    img = canvas((40, 34, 54), (20, 16, 30))
    d = ImageDraw.Draw(img)
    grad(img, (560, 60, 1360, 1000), (40, 40, 70), (20, 20, 40))
    img = light(img, 960, 140, 600, (255, 200, 130), 0.75)
    d = ImageDraw.Draw(img)
    d.ellipse((930, 110, 990, 170), fill=(255, 236, 190))
    d.rectangle((520, 40, 580, 1080), fill=(60, 46, 50)); d.rectangle((1340, 40, 1400, 1080), fill=(60, 46, 50))
    pts = char(img, 960, 1060, 1.7, "suit", face=-0.2, expr="smirk", arms=((-10, 8), (-30, -80)), rim="R")
    d = ImageDraw.Draw(img)
    hx, hy = pts["hands"][1]
    d.rectangle((hx - 70, hy - 50, hx + 30, hy + 80), fill=(130, 110, 80), outline=INK, width=5)
    # mom behind, right edge
    char(img, 1640, 1100, 1.4, "mom", face=-0.6, expr="worried", rim="L")
    def fg(d, l):
        d.ellipse((-60, 380, 520, 960), fill=(18, 14, 24, 255)); d.rectangle((-100, 860, 640, H), fill=(18, 14, 24, 255))
    blur_layer(img, fg, 16)
    return img


@shot
def S24():  # top-down insert: the folder, photos of the house and of the school
    img = canvas((80, 56, 46), (60, 40, 34))
    d = ImageDraw.Draw(img)
    for y in range(0, H, 90):
        d.line([(0, y), (W, y + 40)], fill=(70, 48, 40), width=3)
    img = light(img, 960, 520, 800, (255, 190, 120), 0.45)
    d = ImageDraw.Draw(img)
    d.polygon([(420, 200), (1520, 170), (1560, 920), (440, 950)], fill=(150, 120, 80), outline=INK)
    # photo 1: house
    d.polygon([(520, 300), (940, 290), (950, 640), (530, 650)], fill=(240, 236, 226))
    d.rectangle((580, 440, 880, 600), fill=(70, 56, 90)); d.polygon([(560, 440), (730, 340), (900, 440)], fill=(46, 36, 60))
    d.rectangle((610, 470, 660, 520), fill=(255, 200, 120))
    # photo 2: school
    d.polygon([(1020, 330), (1440, 300), (1460, 660), (1040, 680)], fill=(240, 236, 226))
    d.rectangle((1080, 460, 1400, 620), fill=(150, 80, 70)); d.rectangle((1210, 400, 1270, 460), fill=(150, 80, 70))
    for wx in range(1100, 1380, 60):
        d.rectangle((wx, 490, wx + 30, 530), fill=(230, 220, 180))
    d.line([(1240, 330), (1240, 400)], fill=INK, width=4); d.polygon([(1240, 330), (1290, 345), (1240, 360)], fill=(200, 60, 60))
    # suit's hand at the edge
    blur_layer(img, lambda d, l: d.rectangle((1600, 600, W, H), fill=(30, 32, 40, 255)), 14)
    return img


@shot
def S25():  # day 30, 23:50: headlights sweep the curtains, mom pacing, Theo at the back door
    img = canvas()
    img = living(img, night=True)
    img = darken(img, 0.2)
    d = ImageDraw.Draw(img)
    for (x0, x1) in [(600, 680), (740, 820)]:
        img = light(img, (x0 + x1) / 2, 480, 200, (255, 250, 220), 0.28, sy=1.8)
    clock_readout(img, 1220, 340, 0.5, "23:50")
    contact(img, 1000, 930, 220); contact(img, 1640, 960, 200); contact(img, 760, 940, 200)
    char(img, 1000, 930, 1.0, "mom", face=-0.4, expr="worried", legs="walk", arms=((-30, 60), (20, -70)), rim="L")
    char(img, 1640, 960, 1.0, "theo", face=-0.6, expr="worried", rim="L")
    char(img, 760, 940, 1.0, "pip", face=0.4, expr="determined", rim="R")
    chip(img, 110, 120, "DAY 30", 40)
    return img


@shot
def S26():  # close-up: the clock hits 00:00, fingertips glow
    img = canvas((30, 24, 44), (16, 12, 24))
    img = light(img, 600, 500, 700, (255, 90, 80), 0.25)
    clock_readout(img, 560, 520, 2.2, "00:00")
    paste_hand(img, hand_layer("open", tips=(255, 250, 220)), 1300, 1180, 1.15, angle=8)
    for (fx, ty) in [(195, 250), (265, 220), (335, 230), (405, 270)]:
        x, y = hand_point(fx, ty + 28, 1300, 1180, 1.15, 8)
        img = light(img, x, y, 130, (255, 220, 120), 0.85)
    return img


@shot
def S27():  # low angle: Nina runs down the stairs, arms wide
    img = canvas((50, 40, 66), (26, 20, 36))
    d = ImageDraw.Draw(img)
    for i in range(8):  # stairs rising to the top left
        y = 1000 - i * 90; x = 1500 - i * 150
        d.polygon([(x - 900, y), (x, y), (x, y + 90), (x - 900, y + 90)], fill=(80 - i * 4, 58 - i * 3, 60 - i * 3))
        d.line([(x - 900, y), (x, y)], fill=(40, 30, 40), width=4)
    d.line([(1700, 900), (500, 100)], fill=(50, 36, 40), width=18)
    img = light(img, 600, 160, 500, (255, 200, 130), 0.6)
    d = ImageDraw.Draw(img)
    d.ellipse((580, 140, 620, 180), fill=(255, 236, 190))
    contact(img, 1050, 820, 200)
    char(img, 1050, 820, 1.3, "nina", face=0.5, expr="sad", legs="run", arms=((-120, 10), (120, -10)), rim="L", lean=0.2)
    return img


@shot
def S28():  # close-up: the decision, red rim light
    img = canvas((40, 20, 30), (16, 8, 14))
    img = light(img, 1500, 400, 800, (230, 60, 60), 0.5)
    img = light(img, 600, 600, 500, (255, 200, 110), 0.25)
    char(img, 900, 1560, 3.0, "pip", face=0.2, expr="determined", rim="R", rim_col=(255, 80, 70))
    return img


@shot
def S29():  # macro: glowing fingertips press into the palm, gold spreads
    img = canvas((40, 28, 36), (20, 14, 20))
    img = light(img, 960, 520, 700, (255, 200, 100), 0.8)
    paste_hand(img, hand_layer("open", gold_upto=0.5), 820, 1260, 1.05, angle=-15)
    cx, cy = hand_point(305, 600, 820, 1260, 1.05, -15)  # palm centre
    # pointing hand from the right; its fingertip lands on the palm centre
    a = 75
    tx, ty = hand_point(265, 210, 0, 0, 1.0, a)
    paste_hand(img, hand_layer("point", tips=(255, 250, 220)), cx - tx, cy - ty, 1.0, angle=a)
    img = light(img, cx, cy, 260, (255, 220, 120), 0.9)
    d = ImageDraw.Draw(img)
    for (x, y, r) in [(cx - 260, cy - 340, 34), (cx - 60, cy - 420, 22), (cx - 330, cy - 120, 18)]:
        sparkle(d, x, y, r)
    return img


@shot
def S30():  # medium: Nina hugs Pip; gold hand; the suit closes his folder in the doorway
    img = canvas()
    img = living(img, night=True)
    img = darken(img, 0.15)
    img = light(img, 1620, 560, 360, (200, 200, 230), 0.45)
    pts = char(img, 1620, 920, 0.9, "suit", face=-0.5, expr="neutral", arms=((-10, 8), (-30, -90)), rim="L")
    contact(img, 860, 980, 300)
    char(img, 860, 990, 1.45, "pip", face=0.35, expr="closed", arms=((-10, 8), (-40, -70)), rim="R")
    char(img, 920, 990, 1.0, "nina", face=-0.3, expr="happy", arms=((-60, -60), (60, 60)), rim="R")
    # Pip's near (gold) hand resting on Nina's back
    d = ImageDraw.Draw(img)
    d.line([(800, 650), (1010, 700)], fill=INK, width=26); d.line([(800, 650), (1010, 700)], fill=LOOKS["pip"]["body"], width=18)
    d.ellipse((990, 676, 1050, 736), fill=GOLD, outline=GOLD_SH, width=6)
    sparkle(d, 1050, 670, 22)
    img = light(img, 1020, 706, 160, (255, 210, 110), 0.5)
    return img


@shot
def S31():  # morning: walking to school, Nina holds the gold hand
    img = canvas()
    img = street(img)
    img = light(img, 1500, 600, 900, (255, 200, 140), 0.35)
    contact(img, 860, 980, 200); contact(img, 1060, 980, 160)
    char(img, 860, 980, 1.2, "pip", face=0.5, expr="happy", legs="walk", arms=((-10, 8), (40, -10)), gold_hand="R", rim="R")
    char(img, 1060, 980, 0.84, "nina", face=0.5, expr="happy", legs="walk", arms=((-50, 0), (20, -10)), rim="R")
    return img


@shot
def S32():  # macro: the gold paperclip on Nina's backpack zip
    img = canvas((90, 70, 90), (60, 44, 60))
    img = light(img, 1400, 300, 900, (255, 200, 140), 0.5)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((300, 120, 1700, 1200), 160, fill=(242, 140, 106), outline=INK, width=10)
    d.line([(300, 420), (1700, 420)], fill=(200, 100, 80), width=26)
    for x in range(320, 1690, 22):
        d.rectangle((x, 410, x + 10, 430), fill=(120, 110, 110))
    d.rounded_rectangle((900, 400, 980, 560), 20, fill=(150, 150, 160), outline=INK, width=6)
    paperclip(d, 960, 700, 2.4, col=GOLD, ang=80, w=22)
    sparkle(d, 1040, 620, 34)
    return img


@shot
def S33():  # final: a TV in an empty room; somewhere, another kid's fingertips glow
    img = canvas((20, 16, 30), (10, 8, 16))
    tv(img, 560, 240, 1360, 700)
    grad(img, (560, 240, 1360, 700), (20, 24, 50), (10, 12, 26))
    d = ImageDraw.Draw(img)
    # silhouette of another kid in a window, hand glowing
    d.ellipse((900, 360, 1000, 460), fill=(6, 6, 12)); d.rounded_rectangle((880, 460, 1020, 640), 30, fill=(6, 6, 12))
    d.line([(1010, 500), (1120, 420)], fill=(6, 6, 12), width=26)
    img = light(img, 1125, 415, 120, (255, 220, 120), 1.0)
    img = light(img, 960, 470, 700, (100, 120, 220), 0.25)
    chip(img, 600, 660, "LIVE  00:00", 30)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 820, W, H), fill=(26, 20, 30))
    return img


if __name__ == "__main__":
    names = sys.argv[1:] or list(SHOTS)
    for n in names:
        im = SHOTS[n]()
        finish(im, f"{OUT}/{n}.jpg")
        print("ok", n)
