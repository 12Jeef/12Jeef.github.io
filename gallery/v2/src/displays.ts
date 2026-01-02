export function createCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  return ctx;
}

export function createIntroDisplay() {
  const ctx = createCanvas(800, 1200);

  ctx.lineJoin = "miter";
  ctx.lineCap = "square";

  ctx.fillStyle = ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.beginPath();
  for (let [i, [x, y]] of [
    [-1, -1],
    [-1, 1],
    [-1 / 3, 0],
    [0, 1],
    [1 / 3, 0],
    [1, 1],
    [1, -1],
  ].entries()) {
    x *= 48;
    y *= -36;
    x += ctx.canvas.width / 2;
    y += ctx.canvas.height / 2 - 48 * 5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.font = "96px Arial Black";
  ctx.fillText("JEEF", ctx.canvas.width / 2, ctx.canvas.height / 2 - 48 * 3);

  ctx.font = "48px Arial Black";
  ctx.fillText("ART GALLERY", ctx.canvas.width / 2, ctx.canvas.height / 2 - 48);

  ctx.font = "bold 36px Arial";

  let y = 0,
    x = 0,
    w = 0;

  y = ctx.canvas.height / 2 + 48 * 4;
  x = (ctx.canvas.width / 2) * 1.75;
  ctx.textAlign = "right";
  ctx.fillText("Digital Art", x, y);
  w = ctx.measureText("Digital Art").width;
  ctx.beginPath();
  ctx.moveTo(x - w - 24, y);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.moveTo(ctx.canvas.width - x + 10, y + 10);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.lineTo(ctx.canvas.width - x + 10, y - 10);
  ctx.stroke();

  y = ctx.canvas.height / 2 + 48 * 6;
  x = (ctx.canvas.width / 2) * 0.25;
  ctx.textAlign = "left";
  ctx.fillText("Traditional Art", x, y);
  w = ctx.measureText("Traditional Art").width;
  ctx.beginPath();
  ctx.moveTo(x + w + 24, y);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.moveTo(ctx.canvas.width - x - 10, y + 10);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.lineTo(ctx.canvas.width - x - 10, y - 10);
  ctx.stroke();

  return ctx.canvas;
}

export function createDigitalArtDisplay() {
  const ctx = createCanvas(800, 1200);

  ctx.lineJoin = "miter";
  ctx.lineCap = "square";

  ctx.fillStyle = ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "48px Arial Black";
  ctx.fillText(
    "DIGITAL WORKS",
    ctx.canvas.width / 2,
    ctx.canvas.height / 2 - 48,
  );

  ctx.font = "bold 36px Arial";

  let y = 0,
    x = 0,
    w = 0;

  y = ctx.canvas.height / 2 + 48 * 4;
  x = (ctx.canvas.width / 2) * 1.75;
  ctx.textAlign = "right";
  ctx.fillText("New Stuff", x, y);
  w = ctx.measureText("New Stuff").width;
  ctx.beginPath();
  ctx.moveTo(x - w - 24, y);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.moveTo(ctx.canvas.width - x + 10, y + 10);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.lineTo(ctx.canvas.width - x + 10, y - 10);
  ctx.stroke();

  y = ctx.canvas.height / 2 + 48 * 6;
  x = (ctx.canvas.width / 2) * 0.25;
  ctx.textAlign = "left";
  ctx.fillText("Old Stuff", x, y);
  w = ctx.measureText("Old Stuff").width;
  ctx.beginPath();
  ctx.moveTo(x + w + 24, y);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.moveTo(ctx.canvas.width - x - 10, y + 10);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.lineTo(ctx.canvas.width - x - 10, y - 10);
  ctx.stroke();

  return ctx.canvas;
}

export function createTraditionalArtDisplay() {
  const ctx = createCanvas(800, 1200);

  ctx.lineJoin = "miter";
  ctx.lineCap = "square";

  ctx.fillStyle = ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "48px Arial Black";
  ctx.fillText(
    "TRADITIONAL WORKS",
    ctx.canvas.width / 2,
    ctx.canvas.height / 2 - 48,
  );

  ctx.font = "bold 36px Arial";

  let y = 0,
    x = 0,
    w = 0;

  y = ctx.canvas.height / 2 + 48 * 4;
  x = (ctx.canvas.width / 2) * 1.75;
  ctx.textAlign = "right";
  ctx.fillText("New Stuff", x, y);
  w = ctx.measureText("New Stuff").width;
  ctx.beginPath();
  ctx.moveTo(x - w - 24, y);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.moveTo(ctx.canvas.width - x + 10, y + 10);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.lineTo(ctx.canvas.width - x + 10, y - 10);
  ctx.stroke();

  y = ctx.canvas.height / 2 + 48 * 6;
  x = (ctx.canvas.width / 2) * 0.25;
  ctx.textAlign = "left";
  ctx.fillText("Old Stuff", x, y);
  w = ctx.measureText("Old Stuff").width;
  ctx.beginPath();
  ctx.moveTo(x + w + 24, y);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.moveTo(ctx.canvas.width - x - 10, y + 10);
  ctx.lineTo(ctx.canvas.width - x, y);
  ctx.lineTo(ctx.canvas.width - x - 10, y - 10);
  ctx.stroke();

  return ctx.canvas;
}
