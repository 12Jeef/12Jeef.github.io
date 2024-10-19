self.addEventListener("message", async (e) => {
  const name = String(e.data.name);
  const maxWidth = Number(e.data.maxWidth);
  const maxHeight = Number(e.data.maxHeight);
  const canvas = e.data.canvas as OffscreenCanvas;

  const resp = await fetch("./assets/art/" + name + ".png");
  const blob = await resp.blob();
  const bmp = await createImageBitmap(blob);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get context 2d");

  const width = bmp.width;
  const height = bmp.height;

  const scale =
    maxWidth < 0
      ? maxHeight < 0
        ? 1
        : maxHeight / height
      : maxHeight < 0
      ? maxWidth / width
      : Math.min(maxWidth / width, maxHeight / height);

  canvas.width = Math.round(width * scale * 500);
  canvas.height = Math.round(height * scale * 500);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

  self.postMessage({ width, height, scale });
});
