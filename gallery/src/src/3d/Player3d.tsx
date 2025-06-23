import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import {
  PHYSICS_GROUP,
  STATIC_GROUP,
  usePhysicsBox,
  type vec3,
} from "./engine";

export default function Player3d({ position }: { position?: vec3 }) {
  const { physicsRef, accelerate } = usePhysicsBox({
    name: "Player3d",

    position,
    size: [0.5, 2, 0.5],
    gravity: true,

    group: PHYSICS_GROUP,
    collideFilter: STATIC_GROUP | PHYSICS_GROUP,

    update: (box, state) => {
      const keys = keysRef.current;

      const shift = keys.has("ShiftLeft") || keys.has("ShiftRight");

      const demandX = +keys.has("KeyD") - +keys.has("KeyA");
      const demandY = +keys.has("Space");
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

      const a = (airborne ? 2.5 : 25) * (shift ? 0.3 : 1);
      const aY = airborne ? 0 : 150;
      const ax = x * a;
      const ay = y * aY;
      const az = z * a;

      accelerate([ax, ay, az]);

      const height = shift ? 1.5 : 2;
      box.size[1] += (height - box.size[1]) * 0.25;

      if (box.position[1] < -20) box.position = position ?? [0, 0, 0];
    },
    render: (box, state) => {
      const x = box.position[0];
      const y = box.position[1] + box.size[1] * 0.25;
      const z = box.position[2];
      state.camera.position.setX(
        state.camera.position.x + 0.25 * (x - state.camera.position.x),
      );
      state.camera.position.setY(
        state.camera.position.y + 0.25 * (y - state.camera.position.y),
      );
      state.camera.position.setZ(
        state.camera.position.z + 0.25 * (z - state.camera.position.z),
      );
    },
  });

  const keysRef = useRef(new Set<string>());

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
    </>
  );
}
