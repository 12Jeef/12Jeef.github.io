import type { MotionNodeOptions, Transition, Variants } from "motion";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";

export const defaultMotionSpring = ({
  duration = 0.3,
  delay = 0,
}: {
  duration?: number;
  delay?: number;
} = {}): Transition => {
  return {
    type: "spring",
    duration,
    stiffness: 200,
    damping: 20,
    delay,
  };
};

export const defaultParentVariants = ({
  duration,
  delay = 0,
  stagger = 0.1,
}: {
  duration?: number;
  delay?: number;
  stagger?: number;
}): Variants => {
  return {
    hidden: {},
    visible: {
      transition: {
        ...defaultMotionSpring({ duration }),
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
};

export const defaultChildVariants = ({}) => {
  return { hidden: { scale: 0 }, visible: { scale: 1 } };
};

export const defaultParentProps = ({
  duration,
  delay,
  stagger,
  type = "once",
}: {
  duration?: number;
  delay?: number;
  stagger?: number;
  type?: "once" | "in-view";
}): HTMLAttributes<HTMLElement> & MotionNodeOptions => {
  const props: HTMLAttributes<HTMLElement> & MotionNodeOptions = {
    variants: defaultParentVariants({ duration, delay, stagger }),
    initial: "hidden",
  };
  if (type === "once") props.animate = "visible";
  else if (type === "in-view") props.whileInView = "visible";
  return props;
};

export const defaultChildProps = ({}): HTMLAttributes<HTMLElement> &
  MotionNodeOptions => {
  return {
    variants: defaultChildVariants({}),
    style: { transformOrigin: "0 0" },
  };
};

function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

export type JiggleArgs = {
  initial?: number;
  initialGoal?: number;
  initialJiggle?: number;
};

export function useJiggle({
  initial = 1,
  initialGoal = 1,
  initialJiggle = 1,
}: JiggleArgs = {}) {
  const [scale, setScale] = useState(initial);
  const [scaleGoal, setScaleGoal] = useState(initialGoal);
  const [jiggle, setJiggle] = useState(initialJiggle);
  const jiggleVeloRef = useRef(0);

  useEffect(() => {
    const start = scale;
    const stop = scaleGoal;
    const startTime = Date.now();
    const id = setInterval(() => {
      const time = (Date.now() - startTime) / 1e3;
      setScale(start + (stop - start) * easeOutElastic(Math.min(1, time / 1)));
    }, 1000 / 120);
    return () => clearInterval(id);
  }, [scaleGoal]);

  useEffect(() => {
    const dt = 1 / 120;
    const id = setTimeout(() => {
      jiggleVeloRef.current += 10 * (1 - jiggle);
      jiggleVeloRef.current *= 0.95;
      setJiggle(jiggle + jiggleVeloRef.current * dt);
    }, 1e3 * dt);
    return () => clearTimeout(id);
  }, [jiggle]);

  return [
    scale * jiggle,
    scale / jiggle,
    setScaleGoal,
    (shift?: number) => setJiggle(shift ?? 1.1),
  ] as const;
}
