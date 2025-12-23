import os
from PIL import Image

names = os.listdir("./public/art")
names = [
    name for name in names if name.endswith(".png") and not name.endswith("_tiny.png")
]
for name in names:
    print("minifying " + name)
    im = Image.open("./public/art/" + name)
    n_pixels = im.size[0] * im.size[1]
    n_pixels_wanted = 500 * 500
    size = int((n_pixels_wanted / n_pixels) ** 0.5 * im.size[0]), int(
        (n_pixels_wanted / n_pixels) ** 0.5 * im.size[1]
    )
    im.thumbnail(size, Image.Resampling.LANCZOS)
    im.save("./public/art/" + name.replace(".png", "_tiny.png"), "PNG")
