import { Canvas, useThree } from "@react-three/fiber";
import Player3d from "./3d/Player3d";
import { useMemo } from "react";
import { PerspectiveCamera } from "three";
import { FAST, SHADOWS } from "./3d/engine";
import StartingPlatform from "./features/StartingPlatform";
import MovingPlatform from "./features/MovingPlatform";
import Box3d from "./3d/Box3d";
import MainPlatform from "./features/MainPlatform";

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

      <StartingPlatform position={[0, 0, 0]} size={[7.5, 7.5]} gateSize={3} />
      <MovingPlatform
        start={[0, -0.25, -7.5 / 2 - 3 / 2]}
        stop={[0, -0.25, -40 + 3 / 2]}
        size={[3, 3]}
        velocity={0.75 * (FAST ? 5 : 1)}
      />
      <MainPlatform
        position={[0, 0, -40 - 15 / 2]}
        size={[15, 15]}
        gateSize={3}
      />
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
