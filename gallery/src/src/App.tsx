import { Canvas, useThree } from "@react-three/fiber";
import Player3d from "./3d/Player3d";
import { useMemo } from "react";
import { PerspectiveCamera } from "three";
import { SHADOWS } from "./3d/engine";
import MovingBox3d from "./3d/MovingBox3d";
import StartingPlatform from "./features/StartingPlatform";

function Internals() {
  const { gl } = useThree();
  gl.shadowMap.enabled = SHADOWS;

  return (
    <>
      <fog
        attach="fog"
        args={[
          getComputedStyle(document.body).getPropertyValue("--color-bg1"),
          10,
          15,
        ]}
      ></fog>
      <hemisphereLight
        color={0xffffff}
        groundColor={0x888888}
        intensity={2}
        castShadow={SHADOWS}
      />

      <Player3d position={[0, 3, 0]} />

      <StartingPlatform position={[0, 0, 0]} size={[7.5, 7.5]} />

      {new Array(10).fill(null).map((_, i) => (
        <MovingBox3d
          size={[2, 0.5, 2]}
          keyframes={[
            { position: [0, -4, -7.5 / 2 - 1], duration: 1e-3 },
            {
              position: [0, -0.25, -7.5 / 2 - 1 - 2 * i],
              duration: 3,
              prefixDelay: 0.5 * i,
            },
          ]}
          loop={false}
        />
      ))}
    </>
  );
}

export default function App() {
  const camera = useMemo(() => new PerspectiveCamera(90), []);

  return (
    <Canvas camera={camera}>
      <Internals />
    </Canvas>
  );
}
