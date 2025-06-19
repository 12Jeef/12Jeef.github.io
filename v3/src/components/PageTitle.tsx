import type { HTMLAttributes } from "react";
import { useJiggle } from "../features/jiggle";

export type PageTitleProps = {
  children?: string;
} & HTMLAttributes<HTMLElement>;

export default function PageTitle({
  className = "",
  children = "",
  ...props
}: PageTitleProps) {
  const [jiggleX, jiggleY, setScale, jiggle] = useJiggle({ initial: 0 });

  return (
    <h1
      className={`relative text-[4rem] lg:text-[5rem] text-1xl lowercase flex flex-row gap-0 text-a1 font-blob2 opacity-100 select-none ${className} min-h-[1em]`}
      style={{
        filter: "drop-shadow(0 0 5rem var(--color-a1a))",
        transform: `scale(${jiggleX}, ${jiggleY})`,
      }}
      onMouseEnter={() => setScale(1.1)}
      onMouseLeave={() => setScale(1)}
      onClick={() => jiggle()}
      {...props}
    >
      {children}
      <span
        className="absolute top-1/2 left-1/2 -translate-1/2 flex-row gap-0 opacity-50 scale-110 z-[-1] font-blob3 whitespace-nowrap pointer-events-none"
        style={{ transform: `scale(${jiggleX}, ${jiggleY})` }}
      >
        {children}
      </span>
    </h1>
  );
}
