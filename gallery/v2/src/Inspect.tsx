import { motion } from "motion/react";

import { context, type Artwork } from "./Game";
import { useContext, useEffect, useRef } from "react";
import { lerp } from "three/src/math/MathUtils.js";

export type InspectProps = { artwork: Artwork };

export default function Inspect({ artwork }: InspectProps) {
  const { mobile } = useContext(context);

  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const elem = ref.current;
    if (!elem) return;
    let mouseDown = false,
      mouseX = 0,
      mouseY = 0;
    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      mouseDown = true;
    };
    const onMouseUp = () => {
      mouseDown = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.pageX;
      mouseY = e.pageY;
    };
    let frame = 0;
    let t = 0;
    const update = () => {
      frame = window.requestAnimationFrame(update);

      const tWanted = mouseDown ? 1 : 0;
      t += (tWanted - t) * 0.1;

      const scale = lerp(1, 2, t);
      const shiftX = (mouseX - window.innerWidth / 2) * lerp(0, 2, t);
      const shiftY = (mouseY - window.innerHeight / 2) * lerp(0, 2, t);

      elem.style.transform = `translate(${-shiftX}px, ${-shiftY}px) scale(${scale})`;
    };
    update();
    elem.addEventListener("mousedown", onMouseDown);
    document.body.addEventListener("mouseup", onMouseUp);
    document.body.addEventListener("mousemove", onMouseMove);
    return () => {
      window.cancelAnimationFrame(frame);
      elem.removeEventListener("mousedown", onMouseDown);
      document.body.removeEventListener("mouseup", onMouseUp);
      document.body.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      }}
      className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full h-full p-4 flex flex-row items-center justify-center"
        style={{ paddingBottom: mobile ? "10rem" : "" }}
      >
        <img
          ref={ref}
          src={`./art/${artwork.file}.png`}
          className="max-w-full max-h-full cursor-zoom-in"
        />
      </div>
      <div
        className={
          mobile
            ? "absolute bottom-4 left-4 right-4 p-4 bg-white leading-1.1 text-sm"
            : "absolute bottom-8 right-8 p-4 bg-white max-w-100 leading-1.1 text-sm"
        }
      >
        <h1 className="mb-1 font-black">
          {artwork.name}
          <span className="float-right ml-1 mb-1 font-light italic opacity-50">
            {artwork.date[0]}{" "}
            {
              [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ][artwork.date[1] - 1]
            }{" "}
            {artwork.date[2]}
          </span>
        </h1>
        <p>{artwork.info}</p>
      </div>
    </motion.div>
  );
}
