import { motion, type MotionNodeOptions } from "framer-motion";
import type { HTMLAttributes } from "react";
import { FaX } from "react-icons/fa6";
import { useJiggle } from "../features/jiggle";
import { Link } from "react-router-dom";

export type PageProps = {} & HTMLAttributes<HTMLElement> & MotionNodeOptions;

export default function Page({
  children,
  className = "",
  ...props
}: PageProps) {
  const [jiggleX, jiggleY, setScale, jiggle] = useJiggle({ initial: 0 });

  return (
    <motion.article
      className={`relative w-full max-w-full bg-bg1 flex flex-col items-center justify-center p-10 lg:p-20 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      {...props}
    >
      <div className="sticky top-10 lg:top-20 w-full pointer-events-none text-right">
        <Link to="/" className="pointer-events-auto">
          <motion.button
            className="text-a1 hover:text-fg1"
            onHoverStart={() => setScale(1.1)}
            onHoverEnd={() => setScale(1)}
            onClick={() => jiggle()}
            style={{
              transition: "color 0.3s",
            }}
          >
            <div
              style={{
                transform: `scale(${jiggleX}, ${jiggleY})`,
              }}
            >
              <FaX />
            </div>
          </motion.button>
        </Link>
      </div>
      {children}
    </motion.article>
  );
}
