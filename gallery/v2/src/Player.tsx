import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import { context, INTRO_TIME } from "./Game";

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export type Swipe = {
  direction: "left" | "right" | "up" | "down";
  magnitude: number;
  significant: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type Waypoint =
  | "HOME"
  | { type: "DIGITAL"; piece: number }
  | { type: "TRADITIONAL"; piece: number };

function getWaypoint(
  waypoint: Waypoint,
  position: Vector3,
  loopDigital: number,
  loopTraditional: number,
): [number, number, number, number] {
  if (waypoint === "HOME") return [0, 1.5, 2, 0];
  if (typeof waypoint === "object") {
    const loop = waypoint.type === "DIGITAL" ? loopDigital : loopTraditional;
    let z =
      waypoint.type === "DIGITAL"
        ? 1 + 3 * waypoint.piece
        : waypoint.type === "TRADITIONAL"
        ? 1 - 3 * waypoint.piece
        : 0;
    const zI = Math.round(z / loop);
    const loopI = Math.round(position.z / loop);
    let minZ = z;
    let minDistance = Math.abs(minZ - position.z);
    for (let zIShift = -1; zIShift <= 1; zIShift++) {
      const possibleZ = z - zI * loop + loopI * loop + zIShift * loop;
      const distance = Math.abs(possibleZ - position.z);
      if (distance < minDistance) {
        minZ = possibleZ;
        minDistance = distance;
      }
    }
    z = minZ;
    if (waypoint.type === "DIGITAL")
      return [-8, waypoint.piece === 0 ? 1.5 : 1, z, Math.PI / 2];
    if (waypoint.type === "TRADITIONAL")
      return [8, waypoint.piece === 0 ? 1.5 : 1, z, -Math.PI / 2];
  }
  return [0, 0, 0, 0];
}

export type PlayerProps = {
  onIntroDone?: () => void;
  onMove?: () => void;
  onInspect?: () => void;
  onSwipe?: (swipe: Swipe) => void;
  inspecting?: boolean;
  nDigital: number;
  nTraditional: number;
  loopDigital: number;
  loopTraditional: number;
};

export default function Player({
  onIntroDone,
  onMove,
  onInspect,
  onSwipe,
  inspecting,
  nDigital,
  nTraditional,
  loopDigital,
  loopTraditional,
}: PlayerProps) {
  const { mobile } = useContext(context);

  const keysPressed = useMemo(() => new Set(), []);
  const keysDown = useMemo(() => new Set(), []);
  const keysUp = useMemo(() => new Set(), []);
  const swipes = useMemo<Swipe[]>(() => [], []);
  const swipeRef = useRef<Swipe | null>(null);
  const velocity = useMemo(() => [0, 0, 0], []);
  const floorRef = useRef<Object3D | null>(null);

  useEffect(() => {
    if (mobile) {
      const onTouchStart = (e: TouchEvent) => {
        swipeRef.current = {
          direction: "left",
          magnitude: 0,
          significant: false,
          startX: e.touches.item(0)?.pageX!,
          startY: e.touches.item(0)?.pageY!,
          endX: e.touches.item(0)?.pageX!,
          endY: e.touches.item(0)?.pageY!,
        };
      };
      const onTouchMove = (e: TouchEvent) => {
        const swipe = swipeRef.current!;
        swipe.endX = e.touches.item(0)?.pageX!;
        swipe.endY = e.touches.item(0)?.pageY!;
        const dx = swipe.endX - swipe.startX;
        const dy = swipe.endY - swipe.startY;
        swipe.direction =
          Math.abs(dx) > Math.abs(dy)
            ? dx < 0
              ? "left"
              : "right"
            : dy < 0
            ? "up"
            : "down";
        swipe.magnitude = Math.max(Math.abs(dx), Math.abs(dy));
        swipe.significant =
          Math.max(
            Math.abs(dx) / window.innerWidth,
            Math.abs(dy) / window.innerHeight,
          ) > 0.25;
      };
      const onTouchEnd = () => {
        swipes.push(swipeRef.current!);
        swipeRef.current = null;
      };
      document.body.addEventListener("touchstart", onTouchStart);
      document.body.addEventListener("touchmove", onTouchMove);
      document.body.addEventListener("touchend", onTouchEnd);
      return () => {
        document.body.removeEventListener("touchstart", onTouchStart);
        document.body.removeEventListener("touchmove", onTouchMove);
        document.body.removeEventListener("touchend", onTouchEnd);
      };
    }
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
    return () => {
      document.body.removeEventListener("keydown", onKeyDown);
      document.body.removeEventListener("keyup", onKeyUp);
    };
  }, [mobile]);

  const introRef = useRef(true);
  const introStartTime = useMemo(() => Date.now() / 1e3, []);

  const waypointRef = useRef<Waypoint>("HOME");

  useFrame(({ camera }, dt) => {
    if (introRef.current) {
      const t = Math.min(1, (Date.now() / 1e3 - introStartTime) / INTRO_TIME);
      camera.rotation.set(lerp(Math.PI / 3, 0, easeInOutCubic(t)), 0, 0, "XZY");
      if (t >= 1) {
        introRef.current = false;
        onIntroDone?.();
      }
    }

    const yaw = camera.rotation.reorder("XZY").y;
    const rotX = camera.rotation.reorder("XZY").x;
    const rotZ = camera.rotation.reorder("XZY").z;

    for (const swipe of swipes) {
      if (!swipe.significant) continue;
      onSwipe?.(swipe);
    }

    if (mobile) {
      if (inspecting) swipes.splice(0, swipes.length);

      if (waypointRef.current === "HOME") {
        for (const swipe of swipes) {
          if (!swipe.significant) continue;
          if (swipe.direction === "up") waypointRef.current = "HOME";
          if (swipe.direction === "right")
            waypointRef.current = { type: "DIGITAL", piece: 0 };
          if (swipe.direction === "left")
            waypointRef.current = { type: "TRADITIONAL", piece: 0 };
        }
      } else if (
        typeof waypointRef.current === "object" &&
        (waypointRef.current.type === "DIGITAL" ||
          waypointRef.current.type === "TRADITIONAL")
      ) {
        const n =
          waypointRef.current.type === "DIGITAL" ? nDigital : nTraditional;
        for (const swipe of swipes) {
          if (!swipe.significant) continue;
          if (swipe.direction === "left") waypointRef.current.piece--;
          if (swipe.direction === "right") waypointRef.current.piece++;
          waypointRef.current.piece =
            (((waypointRef.current.piece + (n + 1)) % (n + 1)) + (n + 1)) %
            (n + 1);
          if (waypointRef.current.piece === 0)
            if (swipe.direction === "up") {
              waypointRef.current = "HOME";
              break;
            }
        }
      }

      const [x, y, z, wantedYaw] = getWaypoint(
        waypointRef.current,
        camera.position,
        loopDigital,
        loopTraditional,
      );
      camera.position.set(
        lerp(camera.position.x, x, 0.1),
        lerp(camera.position.y, y, 0.1),
        lerp(camera.position.z, z, 0.1),
      );
      const deltaYaw =
        (() => {
          let diff = wantedYaw - yaw;
          if (diff > Math.PI) diff -= 2 * Math.PI;
          return diff;
        })() * 0.1;
      camera.rotation.set(rotX, yaw + deltaYaw, rotZ, "XZY");
      swipes.splice(0, swipes.length);
    } else {
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
      if (keysDown.has("KeyE")) onInspect?.();
      keysDown.clear();
      keysUp.clear();
    }

    const loop =
      camera.position.x < -1
        ? loopDigital
        : camera.position.x > 1
        ? loopTraditional
        : 0;
    if (loop > 0) {
      while (camera.position.z > loop / 2) camera.position.z -= loop;
      while (camera.position.z < -loop / 2) camera.position.z += loop;
    }

    const floor = floorRef.current;
    if (floor) floor.position.set(camera.position.x, -0.5, camera.position.z);
  }, -2);

  return (
    <>
      <mesh ref={floorRef} receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        <meshPhongMaterial color={0xffffff} />
      </mesh>
    </>
  );
}
