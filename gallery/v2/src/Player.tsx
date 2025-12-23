import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Object3D } from "three";

export type PlayerProps = {
  onMove?: () => void;
  onInspect?: () => void;
  loopDigital: number;
};

export default function Player({
  onMove,
  onInspect,
  loopDigital,
}: PlayerProps) {
  const keysPressed = useMemo(() => new Set(), []);
  const keysDown = useMemo(() => new Set(), []);
  const keysUp = useMemo(() => new Set(), []);
  const velocity = useMemo(() => [0, 0, 0], []);
  const floorRef = useRef<Object3D | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.code);
      keysDown.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
      keysUp.add(e.code);
    };
    document.body.addEventListener("keydown", onKeyDown);
    document.body.addEventListener("keyup", onKeyUp);
  }, []);

  useFrame(({ camera }, dt) => {
    const yaw = camera.rotation.reorder("XZY").y;
    const accel = 50;
    const forward =
      -accel * dt * (+keysPressed.has("KeyW") - +keysPressed.has("KeyS"));
    const right =
      accel * dt * (+keysPressed.has("KeyD") - +keysPressed.has("KeyA"));
    const up =
      accel *
      dt *
      (+keysPressed.has("Space") -
        +(keysPressed.has("ShiftLeft") || keysPressed.has("ShiftRight")));
    if (forward || right) {
      onMove?.();
    }
    velocity[0] +=
      Math.cos(yaw) * forward + Math.cos(yaw + Math.PI / 2) * right;
    velocity[1] +=
      Math.sin(yaw) * forward + Math.sin(yaw + Math.PI / 2) * right;
    velocity[2] += up;
    for (let i = 0; i < 3; i++) {
      velocity[i] *= 0.9 ** (dt / (1 / 120));
    }
    camera.position.set(
      camera.position.x + velocity[1] * dt,
      1, // camera.position.y + velocity[2] * dt,
      camera.position.z + velocity[0] * dt,
    );
    if (camera.position.x < 0) {
      while (camera.position.z > loopDigital / 2)
        camera.position.z -= loopDigital;
      while (camera.position.z < -loopDigital / 2)
        camera.position.z += loopDigital;
    }
    if (keysDown.has("KeyE")) onInspect?.();
    keysDown.clear();
    keysUp.clear();
    const floor = floorRef.current;
    if (floor) floor.position.set(camera.position.x, -0.5, camera.position.z);
  });

  return (
    <>
      <mesh ref={floorRef} receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        <meshPhongMaterial color={0xffffff} />
      </mesh>
    </>
  );
}
