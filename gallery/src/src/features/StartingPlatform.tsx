import { useMemo } from "react";
import type { vec3 } from "../3d/engine";
import Light3d from "../3d/Light3d";
import Railing3d from "../3d/Railing3d";
import { lerp } from "three/src/math/MathUtils.js";
import BlinkingLight3d from "../3d/BlinkingLight3d";
import Platform3d, { type Platform3dProps } from "../3d/Platform3d";
import Pillar3d from "../3d/Pillar3d";

function OrbitLight({
  position,
  size,
  yRange,
  yVelo,
  orbitRadius,
  orbitVelo,
}: {
  position: vec3;

  size: number;

  yRange: number;
  yVelo: number;

  orbitRadius: number;
  orbitVelo: number;
}) {
  const [x, y, z] = position;

  return (
    <Light3d
      position={position}
      color={0xffffff}
      radius={size}
      intensityMult={2}
      update={(obj) => {
        const dy = (((Date.now() / 1e3) * yVelo) % (2 * yRange)) - yRange;
        const r = orbitRadius * lerp(1, 0.1, Math.abs(dy / yRange));
        const dx = Math.cos((orbitVelo / orbitRadius) * (Date.now() / 1e3)) * r;
        const dz = Math.sin((orbitVelo / orbitRadius) * (Date.now() / 1e3)) * r;
        obj.position.set(x + dx, y + dy, z + dz);
      }}
    />
  );
}

export type StartingPlatformProps = Platform3dProps & {
  gateSize: number;
};

export default function StartingPlatform({
  gateSize,

  position,
  size,
  ...props
}: StartingPlatformProps) {
  const [x, y, z] = position;
  const [w, h] = size;

  const railThickness = 0.1;

  const railX = (w - railThickness) / 2;
  const railZ = (h - railThickness) / 2;

  const orbitLights = useMemo(
    () =>
      new Array(50).fill(null).map((_) => ({
        size: lerp(0.1, 0.25, Math.random()),
        yVelo: lerp(1, 2, Math.random()),
        orbitRadius: lerp(0.75, 1.25, Math.random()) * Math.sqrt(w * w + h * h),
        orbitVelo: lerp(0.5, 1, Math.random()),
      })),
    [],
  );

  return (
    <>
      <Platform3d position={position} size={size} {...props} />
      {[
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ].map(([sx, sz]) => (
        <Pillar3d position={[x + sx * w, y, z + sz * h]} height={40} size={2} />
      ))}
      {Array.from(new Array(4).keys()).map((i) => (
        <>
          <Pillar3d
            position={[x + w, y, z - h * (i + 2)]}
            height={40}
            size={2}
          />
          <Pillar3d
            position={[x - w, y, z - h * (i + 2)]}
            height={40}
            size={2}
          />
        </>
      ))}

      <Railing3d
        start={[x - railX, y, z - railZ]}
        stop={[x - railX, y, z + railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x + railX, y, z - railZ]}
        stop={[x + railX, y, z + railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x - railX, y, z + railZ]}
        stop={[x + railX, y, z + railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x - railX, y, z - railZ]}
        stop={[x - gateSize / 2, y, z - railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x + railX, y, z - railZ]}
        stop={[x + gateSize / 2, y, z - railZ]}
        thickness={railThickness}
      />

      <BlinkingLight3d
        position={[x + w / 2 - 0.75, y - 5, z - h / 2 + 0.2]}
        color={0xff0000}
        radius={0.1}
        intensityMult={25}
        duration={2}
        offset={0}
        percentOn={0.25}
      />
      <BlinkingLight3d
        position={[x + w / 2 - 0.75, y - 5.5, z - h / 2 + 0.2]}
        color={0xff0000}
        radius={0.1}
        intensityMult={25}
        duration={2}
        offset={0.25}
        percentOn={0.25}
      />
      <BlinkingLight3d
        position={[x - w / 2 + 0.75, y - 7.5, z - h / 2 + 0.2]}
        color={0xff0000}
        radius={0.1}
        intensityMult={25}
        duration={2}
        offset={0.5}
        percentOn={0.25}
      />

      {orbitLights.map((light) => (
        <OrbitLight position={position} yRange={20} {...light} />
      ))}
    </>
  );
}
