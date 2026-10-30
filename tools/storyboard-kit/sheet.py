import sys, glob
from PIL import Image, ImageDraw, ImageFont
files = sys.argv[2:]
cols = 3; w, h = 480, 270
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + 10) + 10, rows * (h + 40) + 10), (16, 14, 20))
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 20)
d = ImageDraw.Draw(sheet)
for i, p in enumerate(files):
    im = Image.open(p).resize((w, h))
    x = 10 + (i % cols) * (w + 10); y = 10 + (i // cols) * (h + 40)
    sheet.paste(im, (x, y + 30)); d.text((x, y + 4), p.split('/')[-1][:-4], font=f, fill=(230, 220, 200))
sheet.save(sys.argv[1], quality=88)
