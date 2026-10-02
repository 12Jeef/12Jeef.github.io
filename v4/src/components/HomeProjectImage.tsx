import { useContext, type HTMLAttributes } from "react";
import { motion, type MotionNodeOptions } from "framer-motion";
import { projectContext } from "./HomeProject";
import { context } from "../main";

export type HomeProjectImageProps = {
  src: string;
  description: string;
} & HTMLAttributes<HTMLImageElement> &
  MotionNodeOptions;

export default function HomeProjectImage({
  src,
  description,
  className,
  ...props
}: HomeProjectImageProps) {
  const { touch } = useContext(context);
  const { description: selectedDescription, setDescription } =
    useContext(projectContext);

  const active =
    selectedDescription == null || selectedDescription === description;

  return (
    <motion.img
      className={`object-contain cursor-pointer ${active ? "z-1" : ""} ${className}`}
      src={src}
      animate={{ scale: selectedDescription === description ? 1.05 : 1 }}
      style={{
        filter: active ? "" : "grayscale(50%) blur(2px)",
        opacity: active ? 1 : 0.75,
        transition: "filter 0.25s, opacity 0.25s",
      }}
      onClick={() => {
        if (!touch) return;
        setDescription(
          selectedDescription === description ? null : description,
        );
      }}
      onMouseEnter={() => {
        if (touch) return;
        setDescription(description);
      }}
      onMouseLeave={() => {
        if (touch) return;
        setDescription(null);
      }}
      {...props}
    />
  );
}
