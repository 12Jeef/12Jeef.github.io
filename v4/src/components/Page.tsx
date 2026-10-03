import { motion, type MotionNodeOptions } from "framer-motion";
import { type HTMLAttributes } from "react";

export type PageProps = {
  setElem?: (elem: HTMLDivElement) => void;
  innerClassName?: string;
} & HTMLAttributes<HTMLElement> &
  MotionNodeOptions;

export default function Page({
  setElem,
  className = "",
  innerClassName = "",
  children,
  ...props
}: PageProps) {
  return (
    <motion.div
      className={`relative w-full h-full max-w-full max-h-full overflow-hidden bg-bg1 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      {...props}
    >
      <div
        ref={setElem}
        className="absolute top-0 bottom-0 left-0 right-0 overflow-auto"
      >
        <div
          className={`relative w-full max-w-full min-h-full flex flex-col items-center justify-center ${innerClassName}`}
        >
          {children}
        </div>
      </div>
      <div className="absolute bottom-3 w-full text-center text-xs text-mg pointer-events-none z-100">
        © 2026 Jeffrey Fan. All rights reserved.
      </div>
    </motion.div>
  );
}
