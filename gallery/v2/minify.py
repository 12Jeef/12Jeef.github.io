import os
import sys
from PIL import Image

args = sys.argv

wds = []
if "-d" in args:
    wds.append("./public/art/digital/")
if "-t" in args:
    wds.append("./public/art/traditional/")

for wd in wds:
    names = os.listdir(wd)
    names = [
        name
        for name in names
        if name.endswith(".png") and not name.endswith("_tiny.png")
    ]
    for name in names:
        print("minifying " + name)
        im = Image.open(wd + name)
        n_pixels = im.size[0] * im.size[1]
        n_pixels_wanted = 300 * 300
        size = int((n_pixels_wanted / n_pixels) ** 0.5 * im.size[0]), int(
            (n_pixels_wanted / n_pixels) ** 0.5 * im.size[1]
        )
        im.thumbnail(size, Image.Resampling.LANCZOS)
        im.save(wd + name.replace(".png", "_tiny.png"), "PNG")
