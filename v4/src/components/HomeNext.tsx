import type { HTMLAttributes } from "react";
import { motion, type MotionNodeOptions } from "framer-motion";
import { defaultMotionSpring, useJiggle } from "../features/jiggle";
import { FaArrowDown } from "react-icons/fa6";

export type HomeNextProps = {} & HTMLAttributes<HTMLButtonElement> &
  MotionNodeOptions;

export default function HomeNext({
  className = "",
  onClick,
  ...props
}: HomeNextProps) {
  const [jiggleX, jiggleY, setScale, jiggle] = useJiggle({
    initial: 0,
    initialGoal: 1,
  });

  return (
    <motion.button
      className={`text-mg hover:text-a1 text-4xl transition-colors duration-300 ${className}`}
      initial={{ scale: 0.75, opacity: 0, y: "-50%" }}
      animate={{
        scale: 1,
        opacity: 1,
        y: "0",
        transition: defaultMotionSpring({ delay: 1.25 }),
      }}
      onMouseEnter={() => setScale(1.25)}
      onMouseLeave={() => setScale(1)}
      onClick={(e) => {
        jiggle(1.25);
        onClick?.(e);
      }}
      {...props}
    >
      <motion.div
        animate={{
          y: ["-25%", "25%", "-25%"],
          transition: {
            repeat: Infinity,
            duration: 3,
          },
        }}
      >
        <FaArrowDown style={{ transform: `scale(${jiggleX}, ${jiggleY})` }} />
      </motion.div>
    </motion.button>
  );
}
