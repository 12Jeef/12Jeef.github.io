import { Canvas, useThree } from "@react-three/fiber";
import Box3d from "./3d/Box3d";
import Player3d from "./3d/Player3d";
import { useMemo } from "react";
import { PerspectiveCamera } from "three";
import Door3d from "./3d/Door3d";
import Railing3d from "./3d/Railing3d";
import { SHADOWS } from "./3d/engine";

function Internals() {
  const { gl } = useThree();
  gl.shadowMap.enabled = SHADOWS;

  return (
    <>
      <ambientLight color={0xffffff} intensity={2.5} />
      <hemisphereLight color={0xffffff} groundColor={0x888888} intensity={5} />

      <Player3d position={[0, 0, 0]} />
      <Box3d position={[0, -1, 0]} size={[5, 0.5, 5]} />
      <Door3d facing="z" position={[0, -0.75, 1]} size={[2, 2]} />
      <Door3d facing="z" position={[0, -0.75, -1]} size={[2, 2]} />
      <Door3d facing="x" position={[1, -0.75, 0]} size={[2, 2]} />
      <Door3d facing="x" position={[-1, -0.75, 0]} size={[2, 2]} />
      <Railing3d start={[-2.5, -0.75, -2.5]} stop={[-2.5, -0.75, 2.5]} />
      <Railing3d start={[-2.5, -0.75, 2.5]} stop={[2.5, -0.75, 2.5]} />
      <Railing3d start={[2.5, -0.75, 2.5]} stop={[2.5, -0.75, -2.5]} />
      <Railing3d start={[2.5, -0.75, -2.5]} stop={[-2.5, -0.75, -2.5]} />
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
