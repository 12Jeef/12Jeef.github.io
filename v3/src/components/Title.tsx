import { useEffect, type HTMLAttributes } from "react";
import type { TitleLetterFont } from "./TitleLetter";
import TitleLetter from "./TitleLetter";
import { useJiggle } from "../features/jiggle";

export type TitleLetterFontOrder = [
  TitleLetterFont,
  TitleLetterFont,
  TitleLetterFont,
  TitleLetterFont,
];

export type TitleProps = {
  fontOrder?: TitleLetterFontOrder;
  bgFontOrder?: TitleLetterFontOrder;
} & HTMLAttributes<HTMLElement>;

export default function Title({
  fontOrder = [2, 1, 3, 2],
  bgFontOrder = [3, 2, 1, 3],
  className = "",
  ...props
}: TitleProps) {
  const delay = 0.1;

  const word = Array.from("JEEF");
  const jiggles = new Array(4).fill(null).map((_) => {
    const [jiggleX, jiggleY, setScale, jiggle] = useJiggle({
      initial: 0,
      initialGoal: 0,
    });
    const [bgJiggleX, bgJiggleY, bgSetScale, bgJiggle] = useJiggle({
      initial: 0,
      initialGoal: 0,
    });
    return {
      fg: {
        x: jiggleX,
        y: jiggleY,
        onHover: () => {
          setScale(1.1);
          setTimeout(() => bgSetScale(1.1), 1e3 * delay);
        },
        onUnhover: () => {
          setScale(1);
          setTimeout(() => bgSetScale(1), 1e3 * delay);
        },
        onClick: () => {
          jiggle(1.2);
          setTimeout(() => bgJiggle(1.2), 1e3 * delay);
        },
      },
      bg: {
        x: bgJiggleX,
        y: bgJiggleY,
      },
    };
  });

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i >= jiggles.length) {
        clearInterval(id);
        return;
      }
      jiggles[i].fg.onUnhover();
      i++;
    }, 1e3 * 0.1);
    return () => clearInterval(id);
  }, []);

  return (
    <h1
      className={`relative text-[10rem] flex flex-row gap-0 ${className} min-h-[1em]`}
      style={{ filter: "drop-shadow(0 0 5rem var(--color-a1a))" }}
      {...props}
    >
      {word.map((letter, i) => (
        <TitleLetter
          key={i}
          font={fontOrder[i]}
          jiggle={jiggles[i].fg}
          delayPercent={[0, 0.5, 0.2, 0.7][i]}
        >
          {letter}
        </TitleLetter>
      ))}
      <span className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-row gap-0 opacity-50 scale-110 z-[-1] pointer-events-none">
        {word.map((letter, i) => (
          <TitleLetter
            key={i}
            font={bgFontOrder[i]}
            jiggle={jiggles[i].bg}
            delayPercent={[1, 0.3, 0.7, 0.1][i]}
          >
            {letter}
          </TitleLetter>
        ))}
      </span>
    </h1>
  );
}
