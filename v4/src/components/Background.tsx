import { useContext, useEffect, useRef } from "react";
import { context } from "../main";

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  following: "mouse" | "logo" | number;
  a: number;
  t: number;
};

function BackgroundContent() {
  const { mobile } = useContext(context);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onResize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    onResize();
    const observer = new ResizeObserver(onResize);
    observer.observe(parent);

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const rect = canvas.getBoundingClientRect();
      mouseX -= rect.left;
      mouseY -= rect.top;
    };
    window.addEventListener("mousemove", onMouseMove);

    const balls: Ball[] = [];
    const mouseRadii = [75, 50, 50, 35, 35, 25, 25];
    const logoRadii = [
      100, 100, 75, 75, 50, 50, 50, 35, 35, 35, 35, 25, 25, 25, 25, 25,
    ];
    if (!mobile)
      for (const r of mouseRadii)
        balls.push({
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          radius: r,
          following: balls.length - 2 >= 0 ? balls.length - 2 : "mouse",
          a:
            (0.75 +
              (0.5 - 0.75) *
                Math.pow(balls.length / (mouseRadii.length - 1), 1 / 1e3)) *
            (balls.length % 2 === 0 ? 1 : 0.75),
          t: Math.random(),
        });
    for (const r of logoRadii)
      balls.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: r,
        following: "logo",
        a: 0.25,
        t: Math.random(),
      });
    const scale = mobile ? 0.75 : 1;
    for (const ball of balls) ball.radius *= scale;

    let frameId: number;
    let t0 = Date.now();
    let t = 0;
    const update = () => {
      const t1 = Date.now();
      const dt = Math.min(0.1, (t1 - t0) / 1e3);
      t0 = t1;
      t += dt;

      const logoX = canvas.width / 2;
      const logoY = window.innerHeight / 2 + 50;

      for (const ball of balls) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        ball.vx *= 0.9;
        ball.vy *= 0.9;
        for (const ball2 of balls) {
          if (ball === ball2) continue;
          const dx = ball.x - ball2.x;
          const dy = ball.y - ball2.y;
          const r = Math.hypot(dx, dy);
          if (r <= 0) continue;
          const thresh = (ball.radius + ball2.radius) * 0.75;
          if (r > thresh) continue;
          const a =
            (-0.5 * Math.pow(thresh - r, 2)) / (0.02 * (ball.radius / scale));
          ball.vx -= (dx / r) * a * dt;
          ball.vy -= (dy / r) * a * dt;
        }
        const goalX =
          typeof ball.following === "number"
            ? balls[ball.following].x
            : {
                mouse: mouseX,
                logo:
                  logoX +
                  (300 - 2 * (ball.radius / scale)) *
                    scale *
                    Math.sin(
                      (Date.now() / 1e3) * 1 +
                        (5.67 + 8.91 * ball.t) +
                        2 * Math.PI * ball.t,
                    ),
              }[ball.following];
        const goalY =
          typeof ball.following === "number"
            ? balls[ball.following].y
            : {
                mouse: mouseY,
                logo:
                  logoY +
                  (300 - 2 * (ball.radius / scale)) *
                    scale *
                    Math.cos(
                      (Date.now() / 1e3) * 1.5 +
                        (8.91 + 5.67 * ball.t) +
                        2 * Math.PI * ball.t,
                    ),
              }[ball.following];
        const dx = ball.x - goalX;
        const dy = ball.y - goalY;
        const r = Math.hypot(dx, dy);
        if (r <= 0) continue;
        const a = ball.a * Math.pow(r, 1.75);
        ball.vx -= (dx / r) * a * dt;
        ball.vy -= (dy / r) * a * dt;
      }

      ctx.fillStyle = "white";

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const ball of balls) {
        ctx.beginPath();
        const v = Math.hypot(ball.vx, ball.vy) / scale;
        const r = ball.radius * (t < 1 ? 0 : t > 3 ? 1 : (t - 1) / 2);
        const rx =
          r *
          (1 + 0.1 * Math.sin((Date.now() / 1e3) * 1 + 2 * Math.PI * ball.t)) *
          Math.pow(2, v / 5e3);
        const ry =
          r *
          (1 +
            0.1 *
              Math.cos((Date.now() / 1e3) * 2 + 2 * Math.PI * (ball.t * 3))) *
          Math.pow(0.5, v / 5e3);
        const angle = Math.atan2(ball.vy, ball.vx);
        ctx.ellipse(ball.x, ball.y, rx, ry, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      frameId = requestAnimationFrame(update);
    };
    update();

    return () => {
      observer.unobserve(parent);
      cancelAnimationFrame(frameId);
    };
  }, [canvasRef, mobile]);

  return <canvas ref={canvasRef}></canvas>;
}

export type BackgroundProps = {};

export default function Background({}: BackgroundProps) {
  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden opacity-20 -z-1"
      style={{ mixBlendMode: "lighten" }}
    >
      <div className="absolute top-[-100px] bottom-[-100px] left-[-100px] right-[-100px] bg-a1">
        <div
          className="absolute top-0 bottom-0 left-0 right-0"
          style={{ mixBlendMode: "multiply" }}
        >
          <div
            className="absolute top-0 bottom-0 left-0 right-0"
            style={{
              filter: "contrast(12000%)",
            }}
          >
            <div className="absolute top-0 bottom-0 left-0 right-0 blur-[15px] bg-black">
              <BackgroundContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
