import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import {
  PHYSICS_GROUP,
  // SHADOWS,
  STATIC_GROUP,
  usePhysicsBox,
  type vec3,
} from "./engine";
import { useFrame } from "@react-three/fiber";
import { Object3D } from "three";

export default function Player3d({ position }: { position?: vec3 }) {
  const ref = useRef<Object3D>(null);
  const { physicsRef, accelerate } = usePhysicsBox({
    name: "Player3d",

    position,
    size: [0.5, 2, 0.5],
    gravity: true,

    group: PHYSICS_GROUP,
    collideFilter: STATIC_GROUP | PHYSICS_GROUP,

    render: (box, state) => {
      state.camera.position.set(
        box.position[0],
        box.position[1] + box.size[1] * 0.25,
        box.position[2],
      );
      ref.current?.position.set(
        box.position[0],
        box.position[1],
        box.position[2],
      );
    },
  });

  const keysRef = useRef(new Set<string>());

  useFrame((state) => {
    const keys = keysRef.current;

    const demandX = +keys.has("KeyD") - +keys.has("KeyA");
    const demandY = +keys.has("Space"); // - +(keys.has("ShiftLeft") || keys.has("ShiftRight"));
    const demandZ = +keys.has("KeyW") - +keys.has("KeyS");

    const playerX = demandX / (demandX && demandZ ? Math.SQRT2 : 1);
    const playerY = demandY;
    const playerZ = demandZ / (demandX && demandZ ? Math.SQRT2 : 1);

    state.camera.rotation.reorder("YXZ");
    const azimuthX = -Math.sin(state.camera.rotation.y);
    const azimuthZ = -Math.cos(state.camera.rotation.y);

    const x = azimuthX * playerZ - azimuthZ * playerX;
    const y = playerY;
    const z = azimuthZ * playerZ + azimuthX * playerX;

    const airborne = physicsRef.current.airborne >= 3;

    const a = airborne ? 1 : 25;
    const aY = airborne ? 0 : 200;
    const ax = x * a;
    const ay = y * aY;
    const az = z * a;

    accelerate([ax, ay, az]);
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    document.body.addEventListener("keydown", onKeyDown);
    document.body.addEventListener("keyup", onKeyUp);

    return () => {
      document.body.removeEventListener("keydown", onKeyDown);
      document.body.removeEventListener("keyup", onKeyUp);
    };
  });

  return (
    <>
      <PointerLockControls />
      {/* <pointLight
        ref={ref}
        color={0xffffff}
        intensity={5}
        distance={10}
        decay={0}
        castShadow={SHADOWS}
      /> */}
    </>
  );
}
