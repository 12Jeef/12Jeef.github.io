import { useRef } from "react";
import Box3d, { type Box3dProps } from "./Box3d";
import type { vec3 } from "./engine";
import { lerp } from "three/src/math/MathUtils.js";

export type Keyframe = {
  prefixDelay?: number;
  suffixDelay?: number;
  duration: number;
  position: vec3;
  confirmation?: () => boolean;
};
export type MovingBox3dProps = Box3dProps & {
  keyframes: Keyframe[];
  loop?: boolean;
};

export default function MovingBox3d({
  name = "MovingBox3d",
  keyframes,
  loop = true,
  update,
  ...props
}: MovingBox3dProps) {
  const startTimeRef = useRef(0);
  const keyframeIndexRef = useRef(0);

  return (
    <Box3d
      {...props}
      name={name}
      update={(box, state, dt) => {
        if (keyframeIndexRef.current < keyframes.length) {
          const now = Date.now() / 1e3;
          const time = now - startTimeRef.current;
          const keyframe = keyframes[keyframeIndexRef.current];
          const { duration, prefixDelay = 0, suffixDelay = 0 } = keyframe;
          const prevKeyframe =
            keyframes[
              (keyframeIndexRef.current + keyframes.length - 1) %
                keyframes.length
            ];
          if (time < prefixDelay) {
            box.position = [...prevKeyframe.position];
          } else if (time - prefixDelay < duration) {
            const t = (time - prefixDelay) / duration;
            const [x, y, z] = keyframe.position;
            const [prevX, prevY, prevZ] = prevKeyframe.position;
            box.position = [
              lerp(prevX, x, t),
              lerp(prevY, y, t),
              lerp(prevZ, z, t),
            ];
          } else if (time - prefixDelay - duration < suffixDelay) {
            box.position = [...keyframe.position];
          } else {
            box.position = [...keyframe.position];
            if (!keyframe.confirmation || keyframe.confirmation()) {
              startTimeRef.current = now;
              keyframeIndexRef.current = keyframeIndexRef.current + 1;
              if (loop) keyframeIndexRef.current %= keyframes.length;
            }
          }
        }

        if (update) update(box, state, dt);
      }}
    />
  );
}
