import type { HTMLAttributes } from "react";
import { motion, type MotionNodeOptions } from "framer-motion";
import { useJiggle } from "../features/jiggle";

export type JiggleButtonProps = {
  showBackground?: boolean;
  initialValue?: number;
  initialGoal?: number;
  hoverScale?: number;
  jiggleScale?: number;
} & HTMLAttributes<HTMLButtonElement> &
  MotionNodeOptions;

export default function JiggleButton({
  showBackground = true,
  initialValue = 1,
  initialGoal = 1,
  hoverScale = 1.1,
  jiggleScale = 1.1,
  className = "",
  children,
  ...props
}: JiggleButtonProps) {
  const [jiggleX, jiggleY, setScale, jiggle] = useJiggle({
    initial: initialValue,
    initialGoal,
  });

  return (
    <motion.button
      className={`px-5 py-3 text-a1 hover:text-fg1 font-bold ${
        showBackground ? "bg-a1aa" : ""
      } rounded-[1rem] ${className}`}
      style={{
        transform: `scale(${jiggleX}, ${jiggleY})`,
        boxShadow: showBackground ? "inset 0 0 0.5rem var(--color-a1aa)" : "",
        transition: "color 0.3s",
      }}
      onHoverStart={() => setScale(hoverScale)}
      onHoverEnd={() => setScale(1)}
      onClick={() => jiggle(jiggleScale)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
