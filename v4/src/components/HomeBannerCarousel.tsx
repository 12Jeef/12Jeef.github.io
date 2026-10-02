import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

export type HomeBannerCarouselProps = { values: string[] };

export default function HomeBannerCarousel({
  values,
}: HomeBannerCarouselProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  const controlsIn = useAnimationControls();
  const controlsOut = useAnimationControls();

  const [lastIndex, setLastIndex] = useState(0);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (ref.current) setWidth(ref.current.scrollWidth);
    controlsIn.stop();
    controlsOut.stop();
    controlsIn.set({ y: "-50%", opacity: 0 });
    controlsOut.set({ y: "0%", opacity: 1 });
    controlsIn.start({
      y: "0%",
      opacity: 1,
      transition: { duration: 0.25 },
    });
    controlsOut.start({
      y: "50%",
      opacity: 0,
      transition: { duration: 0.25 },
    });
    const timeout = setTimeout(() => {
      setLastIndex(index);
      setIndex((index + 1) % values.length);
    }, 1.5 * 1e3);
    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <motion.span
      className="relative inline-block"
      animate={{ width }}
      transition={{ duration: 0.25 }}
    >
      <motion.span
        ref={ref}
        className="inline-block min-w-max"
        animate={controlsIn}
      >
        {values[index]}
      </motion.span>
      <motion.span
        className="absolute top-0 left-0 block min-w-max"
        animate={controlsOut}
      >
        {values[lastIndex]}
      </motion.span>
    </motion.span>
  );
}
