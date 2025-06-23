import { useState } from "react";
import type { vec2, vec3 } from "../3d/engine";
import MovingBox3d from "../3d/MovingBox3d";
import Railing3d from "../3d/Railing3d";
import Door3d from "../3d/Door3d";
import { defaultGeometry, defaultMaterial } from "../3d/Box3d";
import BlinkingLight3d from "../3d/BlinkingLight3d";

export type MovingPlatformProps = {
  start: vec3;
  stop: vec3;
  size: vec2;
  velocity: number;
};

export default function MovingPlatform({
  start,
  stop,
  size,
  velocity,
}: MovingPlatformProps) {
  const length = Math.sqrt(
    (start[0] - stop[0]) ** 2 +
      (start[1] - stop[1]) ** 2 +
      (start[2] - stop[2]) ** 2,
  );
  const duration = length / velocity;

  const [w, h] = size;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);

  const railX = w / 2 - 0.05;
  const railZ = h / 2 - 0.05;
  const lightX = w / 2 + 0.05;
  const lightZ = h / 2 + 0.05;

  const [blinking, setBlinking] = useState(false);
  const [startLocked, setStartLocked] = useState(true);
  const [endLocked, setEndLocked] = useState(true);

  const props = {
    color: 0xff0000,
    radius: 0.1,
    showMesh: false,
    intensityMult: 25,
    duration: 1,
    offset: 0.5,
    percentOn: blinking ? 0.5 : 0,
  };

  return (
    <>
      <MovingBox3d
        size={[w, 0.5, h]}
        keyframes={[
          {
            position: start,
            duration: duration,
            prefixDelay: 1,
            confirmation: "when-leave",

            onPrefixStart: () => {
              setBlinking(true);
              setStartLocked(true);
              setEndLocked(true);
            },
            onDurationEnd: () => {
              setBlinking(false);
              setStartLocked(false);
            },
          },
          {
            prefixDelay: 1,
            confirmation: "when-enter",
          },
          {
            position: stop,
            duration: duration,
            prefixDelay: 1,
            confirmation: "when-leave",

            onPrefixStart: () => {
              setBlinking(true);
              setStartLocked(true);
              setEndLocked(true);
            },
            onDurationEnd: () => {
              setBlinking(false);
              setEndLocked(false);
            },
          },
          {
            prefixDelay: 1,
            confirmation: "when-enter",
          },
        ]}
        update={(box) => {
          setX(box.position[0]);
          setY(box.position[1] + 0.25);
          setZ(box.position[2]);
        }}
      />
      <mesh
        geometry={defaultGeometry}
        material={defaultMaterial}
        position={[x, y - 1, z]}
        scale={[w - 0.5, 1, h - 0.5]}
      ></mesh>
      <Railing3d
        start={[x - railX, y, z + railZ]}
        stop={[x - railX, y, z - railZ]}
      />
      <Railing3d
        start={[x + railX, y, z - railZ]}
        stop={[x + railX, y, z + railZ]}
      />
      <Door3d
        facing="z"
        position={[x, y, z + railZ]}
        size={[3, 2]}
        showUpper={false}
        overrideTrigger={!startLocked}
      />
      <Door3d
        facing="z"
        position={[x, y, z - railZ]}
        size={[3, 2]}
        showUpper={false}
        overrideTrigger={!endLocked}
      />
      <BlinkingLight3d position={[x + lightX, y, z + lightZ]} {...props} />
      <BlinkingLight3d position={[x - lightX, y, z + lightZ]} {...props} />
      <BlinkingLight3d position={[x + lightX, y, z - lightZ]} {...props} />
      <BlinkingLight3d position={[x - lightX, y, z - lightZ]} {...props} />
    </>
  );
}
