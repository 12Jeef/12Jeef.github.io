import { useMemo, useState } from "react";
import Box3d, { defaultGeometry, defaultMaterial } from "../3d/Box3d";
import type { vec2, vec3 } from "../3d/engine";
import Light3d from "../3d/Light3d";
import Railing3d from "../3d/Railing3d";
import { useFrame } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";

function BlinkingLight({
  position,
  offset = 0,
}: {
  position: vec3;
  offset?: number;
}) {
  const [on, setOn] = useState(true);
  useFrame(() => {
    const nextOn = (Date.now() / 1e3 + 2 * offset) % 2 < 0.5;
    if (on !== nextOn) setOn(nextOn);
  });

  return (
    <Light3d
      position={position}
      color={0xff0000}
      radius={0.1}
      on={on}
      intensityMult={25}
    />
  );
}

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

function Pillar({ position }: { position: vec3 }) {
  const [x, y, z] = position;

  return (
    <>
      <mesh
        geometry={defaultGeometry}
        material={defaultMaterial}
        position={position}
        scale={[2, 40, 2]}
      ></mesh>
      {[
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].map(([sx, sz]) => (
        <>
          <mesh
            geometry={defaultGeometry}
            material={defaultMaterial}
            position={[x + sx * 0.75, y - 20 + 15 / 2, z + sz * 0.75]}
            scale={[1, 15, 1]}
          ></mesh>
          <mesh
            geometry={defaultGeometry}
            material={defaultMaterial}
            position={[x + sx * 0.75, y + 20 - 15 / 2, z + sz * 0.75]}
            scale={[1, 15, 1]}
          ></mesh>
        </>
      ))}
    </>
  );
}

export type StartingPlatformProps = {
  position: vec3;
  size: vec2;
  depth?: number;
};

export default function StartingPlatform({
  position,
  size,
  depth = 20,
}: StartingPlatformProps) {
  const [x, y, z] = position;
  const [w, h] = size;

  const platformDepth = 1;
  const decoShift = -0.25;
  const decoSize = [1.5, 3];
  const innerShift = 0.5;
  const innerSize = [w - innerShift, h - innerShift];

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
      <Box3d
        position={[x, y - platformDepth / 2, z]}
        size={[w, platformDepth, h]}
      />
      {[
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ].map(([sx, sz], i) => (
        <>
          <mesh
            key={i}
            geometry={defaultGeometry}
            material={defaultMaterial}
            position={[
              x + sx * (w / 2 + decoShift),
              y - platformDepth / 2 - decoSize[1] / 2,
              z + sz * (h / 2 + decoShift),
            ]}
            scale={[decoSize[0], decoSize[1], decoSize[0]]}
          ></mesh>
          <Pillar position={[x + sx * w, y, z + sz * h]} />
        </>
      ))}
      <mesh
        geometry={defaultGeometry}
        material={defaultMaterial}
        position={[x, y - platformDepth / 2 - depth / 2, z]}
        scale={[innerSize[0], depth, innerSize[1]]}
      ></mesh>

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
        stop={[x - 1, y, z - railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x + railX, y, z - railZ]}
        stop={[x + 1, y, z - railZ]}
        thickness={railThickness}
      />

      <BlinkingLight
        position={[
          x + innerSize[0] / 2 - 0.5,
          y - platformDepth / 2 - decoSize[1] - 2,
          z - innerSize[1] / 2 - 0.05,
        ]}
        offset={0}
      />
      <BlinkingLight
        position={[
          x + innerSize[0] / 2 - 0.5,
          y - platformDepth / 2 - decoSize[1] - 2.5,
          z - innerSize[1] / 2 - 0.05,
        ]}
        offset={0.25}
      />
      <BlinkingLight
        position={[
          x - innerSize[0] / 2 + 0.5,
          y - platformDepth / 2 - decoSize[1] - 4,
          z - innerSize[1] / 2 - 0.05,
        ]}
        offset={0.75}
      />

      {orbitLights.map((light) => (
        <OrbitLight position={position} yRange={20} {...light} />
      ))}
    </>
  );
}
