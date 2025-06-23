import { useMemo, useRef } from "react";
import Box3d, { type Box3dProps } from "./Box3d";
import { nextId, useTrigger, type Box, type vec3 } from "./engine";
import { clamp, lerp } from "three/src/math/MathUtils.js";

export type Keyframe = {
  prefixDelay?: number;
  suffixDelay?: number;
  duration?: number;
  position?: vec3;
  confirmation?: (() => boolean) | "when-enter" | "when-leave";

  onPrefixStart?: () => void;
  onPrefixEnd?: () => void;
  onDurationStart?: () => void;
  onDurationEnd?: () => void;
  onSuffixStart?: () => void;
  onSuffixEnd?: () => void;
  onConfirmationStart?: () => void;
  onConfirmationEnd?: () => void;
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
  const keyframeStageRef = useRef(0);

  const triggerId = useMemo(() => nextId(), []);
  const triggerBox: Box = {
    id: triggerId,
    name: "MovingBox3dTrigger",
    position: [0, 0, 0],
    size: [0, 0, 0],
  };
  const triggered = useTrigger({ box: triggerBox });

  const getKeyframePosition = (i: number | Keyframe, iStop?: number): vec3 => {
    if (typeof i === "object") return getKeyframePosition(keyframes.indexOf(i));
    if (i === iStop) return props.position ?? [0, 0, 0];
    if (keyframes[i].position) return keyframes[i].position;
    return getKeyframePosition(
      (i + keyframes.length - 1) % keyframes.length,
      iStop ?? i,
    );
  };

  return (
    <Box3d
      {...props}
      name={name}
      update={(box, state, dt) => {
        if (keyframeIndexRef.current < keyframes.length) {
          const now = Date.now() / 1e3;
          const time = now - startTimeRef.current;

          const keyframe = keyframes[keyframeIndexRef.current];
          const {
            duration = 1e-3,
            prefixDelay = 0,
            suffixDelay = 0,
          } = keyframe;

          const prevKeyframe =
            keyframes[
              (keyframeIndexRef.current + keyframes.length - 1) %
                keyframes.length
            ];

          // Prefix
          if (keyframeStageRef.current === 0) {
            if (keyframe.onPrefixStart) keyframe.onPrefixStart();
            keyframeStageRef.current = 0.1;
          }
          if (keyframeStageRef.current === 0.1) {
            box.position = getKeyframePosition(prevKeyframe);
            if (time >= prefixDelay) {
              keyframeStageRef.current = 1;
              if (keyframe.onPrefixEnd) keyframe.onPrefixEnd();
            }
          }
          // Duration
          if (keyframeStageRef.current === 1) {
            if (keyframe.onDurationStart) keyframe.onDurationStart();
            keyframeStageRef.current = 1.1;
          }
          if (keyframeStageRef.current === 1.1) {
            const t = clamp((time - prefixDelay) / duration, 0, 1);
            const [x, y, z] = getKeyframePosition(keyframe);
            const [prevX, prevY, prevZ] = getKeyframePosition(prevKeyframe);
            box.position = [
              lerp(prevX, x, t),
              lerp(prevY, y, t),
              lerp(prevZ, z, t),
            ];
            if (time - prefixDelay >= duration) {
              keyframeStageRef.current = 2;
              if (keyframe.onDurationEnd) keyframe.onDurationEnd();
            }
          }
          // Suffix
          if (keyframeStageRef.current === 2) {
            if (keyframe.onSuffixStart) keyframe.onSuffixStart();
            keyframeStageRef.current = 2.1;
          }
          if (keyframeStageRef.current === 2.1) {
            box.position = getKeyframePosition(keyframe);
            if (time - prefixDelay - duration >= suffixDelay) {
              keyframeStageRef.current = 3;
              if (keyframe.onSuffixEnd) keyframe.onSuffixEnd();
            }
          }
          // Confirmation
          if (keyframeStageRef.current === 3) {
            if (keyframe.onConfirmationStart) keyframe.onConfirmationStart();
            keyframeStageRef.current = 3.1;
          }
          if (keyframeStageRef.current === 3.1) {
            box.position = getKeyframePosition(keyframe);
            if (
              (() => {
                if (keyframe.confirmation === "when-enter") return triggered;
                if (keyframe.confirmation === "when-leave") return !triggered;
                return !keyframe.confirmation || keyframe.confirmation();
              })()
            ) {
              if (keyframe.onConfirmationEnd) keyframe.onConfirmationEnd();
              startTimeRef.current = now;
              keyframeIndexRef.current = keyframeIndexRef.current + 1;
              if (loop) keyframeIndexRef.current %= keyframes.length;
              keyframeStageRef.current = 0;
            }
          }

          // Trigger position
          triggerBox.position = [
            box.position[0],
            box.position[1] + box.size[1] / 2 + 1,
            box.position[2],
          ];
          triggerBox.size = [box.size[0] - 0.25, 2, box.size[2] - 0.25];
        }

        if (update) update(box, state, dt);
      }}
    />
  );
}
