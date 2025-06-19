import type { HTMLAttributes } from "react";
import { motion, type MotionNodeOptions } from "framer-motion";

export type TitleLetterFont = 1 | 2 | 3;

export type TitleLetterProps = {
  font: TitleLetterFont;
  children: string;
  jiggle?: {
    x: number;
    y: number;
    onHover?: () => void;
    onUnhover?: () => void;
    onClick?: () => void;
  };
  delayPercent?: number;
} & HTMLAttributes<HTMLSpanElement> &
  MotionNodeOptions;

export default function TitleLetter({
  font,
  children,
  jiggle,
  delayPercent,
  className = "",
  ...props
}: TitleLetterProps) {
  return (
    <motion.span
      className={`relative mx-[-0.25rem] text-a1 ${
        ["font-blob1", "font-blob2", "font-blob3"][font - 1]
      } lowercase select-none ${className}`}
      style={{ transform: `scale(${jiggle?.x ?? 1}, ${jiggle?.y ?? 1})` }}
      onHoverStart={() => jiggle?.onHover && jiggle.onHover()}
      onHoverEnd={() => jiggle?.onUnhover && jiggle.onUnhover()}
      onClick={() => jiggle?.onClick && jiggle.onClick()}
      {...props}
    >
      <motion.div
        animate={{
          scaleX: [1, 0.9, 1, 1.1, 1],
          scaleY: [1, 1.1, 1, 0.9, 1],
          transition: {
            repeat: Infinity,
            duration: 5,
            delay: 5 * (delayPercent ?? 0),
          },
        }}
      >
        {children}
      </motion.div>
    </motion.span>
  );
}
