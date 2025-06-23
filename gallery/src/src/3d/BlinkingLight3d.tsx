import { useState } from "react";
import type { Light3dProps } from "./Light3d";
import { useFrame } from "@react-three/fiber";
import Light3d from "./Light3d";

export type BlinkingLight3dProps = Light3dProps & {
  duration: number;
  offset?: number;
  percentOn: number;
};

export default function BlinkingLight3d({
  duration,
  offset = 0,
  percentOn,
  ...props
}: BlinkingLight3dProps) {
  const [on, setOn] = useState(true);
  useFrame(() => {
    const nextOn =
      ((Date.now() / 1e3 + offset) % duration) / duration < percentOn;
    if (on !== nextOn) setOn(nextOn);
  });
  return <Light3d {...props} on={on} />;
}
