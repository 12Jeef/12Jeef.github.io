import { motion, type MotionNodeOptions } from "framer-motion";
import type { HTMLAttributes } from "react";
import { defaultMotionSpring } from "../features/jiggle";

export type HomeBannerIconButtonProps = {
  delay?: number;
  href: string;
} & HTMLAttributes<HTMLButtonElement> &
  MotionNodeOptions;

export default function HomeBannerIconButton({
  children,
  delay = 0,
  href,
  className = "",
  ...props
}: HomeBannerIconButtonProps) {
  return (
    <a href={href} className="group relative">
      <motion.button
        initial={{ scale: 0.75, opacity: 0, x: "-50%", y: "-50%" }}
        animate={{
          scale: 1,
          opacity: 1,
          x: "0%",
          y: "0%",
          transition: defaultMotionSpring({ delay }),
        }}
        className={`text-[1.25rem] text-a1 hover:text-fg1 ${className}`}
        style={{
          transition: "color 0.3s",
        }}
        {...props}
      >
        {children}
      </motion.button>
    </a>
  );
}
