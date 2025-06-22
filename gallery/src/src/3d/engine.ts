import { useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Object3D } from "three";

// GENERIC

export type vec2 = [number, number];
export type vec3 = [number, number, number];

export const SHADOWS = false;

// AXIS

export type AxisSign = "+" | "-";
export type AxisName = "x" | "y" | "z";
export type Axis = {
  sign: AxisSign;
  name: AxisName;
};
export const getHat = (axis: Axis): vec3 => {
  const mag = axis.sign === "+" ? 1 : -1;
  const x = +(axis.name === "x") * mag;
  const y = +(axis.name === "y") * mag;
  const z = +(axis.name === "z") * mag;
  return [x, y, z];
};
export const flipSign = (sign: AxisSign): AxisSign => {
  return sign === "+" ? "-" : "+";
};
export const rotateXCW90 = ({ sign, name }: Axis): Axis => {
  if (name === "x") return { sign, name };
  if (name === "y") return { sign, name: "z" };
  return { sign: flipSign(sign), name: "y" };
};
export const rotateYCW90 = ({ sign, name }: Axis): Axis => {
  if (name === "y") return { sign, name };
  if (name === "z") return { sign, name: "x" };
  return { sign: flipSign(sign), name: "z" };
};
export const rotateZCW90 = ({ sign, name }: Axis): Axis => {
  if (name === "z") return { sign, name };
  if (name === "x") return { sign, name: "y" };
  return { sign: flipSign(sign), name: "x" };
};
export const rotateX180 = (axis: Axis) => rotateXCW90(rotateXCW90(axis));
export const rotateY180 = (axis: Axis) => rotateYCW90(rotateYCW90(axis));
export const rotateZ180 = (axis: Axis) => rotateZCW90(rotateZCW90(axis));
export const rotateXCCW90 = (axis: Axis) => rotateXCW90(rotateX180(axis));
export const rotateYCCW90 = (axis: Axis) => rotateYCW90(rotateY180(axis));
export const rotateZCCW90 = (axis: Axis) => rotateZCW90(rotateZ180(axis));

// AZIMUTH

export type AzimuthSign = "+" | "-";
export type AzimuthName = "x" | "z";
export type Azimuth = {
  sign: AzimuthSign;
  name: AzimuthName;
};

// COLLISIONS

export type CollisionGroup = number;

export const MAX_GROUPS: CollisionGroup = 16;
export const STATIC_GROUP: CollisionGroup = 1 << 0;
export const PHYSICS_GROUP: CollisionGroup = 1 << 1;
export const DECO_GROUP: CollisionGroup = 1 << 2;

const groups: Box[][] = new Array(MAX_GROUPS).fill(null).map((_) => []);

export type Collision = {
  axis: Axis;
  shift: number;
  box: Box;
};

export type CollisionCallback = (collision: Collision) => void;
export type CollisionsCallback = (collisions: Collision[]) => void;

export const getCollision = (
  staticBox: Box,
  dynamicBox: Box,
): Collision | null => {
  const axesCollisions: Collision[] = [];
  for (let j = 0; j < 3; j++) {
    const shift =
      Math.abs(staticBox.position[j] - dynamicBox.position[j]) -
      (staticBox.size[j] + dynamicBox.size[j]) / 2;
    if (shift >= 0) continue;
    axesCollisions.push({
      axis: {
        name: "xyz"[j] as AxisName,
        sign: staticBox.position[j] < dynamicBox.position[j] ? "+" : "-",
      },
      shift: Math.abs(shift),
      box: staticBox,
    });
  }
  if (axesCollisions.length < 3) return null;
  axesCollisions.sort((a, b) => a.shift - b.shift);
  return axesCollisions[0];
};

export const getCollisions = (
  box: Box,
  collideFilterIndices?: number[],
): Collision[] => {
  const collisions: Collision[] = [];
  for (const i of collideFilterIndices ?? Array.from(new Array(16).keys())) {
    for (const staticBox of groups[i]) {
      if (staticBox === box) continue;
      const collision = getCollision(staticBox, box);
      if (!collision) continue;
      collisions.push(collision);
    }
  }
  return collisions;
};

// BOXES

export type Id = string;

let id = 0;
export const nextId = (): Id => {
  return String(id++);
};

export type Box = {
  id: Id;
  name: string;

  position: vec3;
  size: vec3;
};

export type UpdateCallback = (box: Box, state: RootState, dt: number) => void;
export type RenderCallback = (box: Box, state: RootState, dt: number) => void;

// USE BOX

export type UseBoxProps = {
  name?: string;

  position?: vec3;
  size: vec3;

  group?: number;
  collideFilter?: number;

  update?: UpdateCallback;
  render?: RenderCallback;
  collision?: CollisionCallback;
  collisions?: CollisionsCallback;
};
export const useBox = ({
  name,

  position,
  size,

  group = STATIC_GROUP,
  collideFilter = 0,

  update,
  render,
  collision,
  collisions,
}: UseBoxProps) => {
  const ref = useRef<Object3D>(null);

  const [propX, propY, propZ] = position ?? [0, 0, 0];
  const [propW, propH, propD] = size;

  const id = useMemo(() => nextId(), []);
  const boxRef = useRef<Box>({
    id,
    name: "",
    position: [0, 0, 0],
    size: [0, 0, 0],
  });

  const groupIndices: number[] = [];
  const collideFilterIndices: number[] = [];
  for (let i = 0; i < MAX_GROUPS; i++) {
    if (group & (1 << i)) groupIndices.push(i);
    if (collideFilter & (1 << i)) collideFilterIndices.push(i);
  }

  useEffect(() => {
    for (const i of groupIndices) groups[i].push(boxRef.current);
    return () => {
      for (const i of groupIndices)
        groups[i].splice(groups[i].indexOf(boxRef.current), 1);
    };
  }, [group]);

  useEffect(() => {
    boxRef.current.name = name ?? "";
  }, [name]);

  useEffect(() => {
    boxRef.current.position[0] = propX;
  }, [propX]);
  useEffect(() => {
    boxRef.current.position[1] = propY;
  }, [propY]);
  useEffect(() => {
    boxRef.current.position[2] = propZ;
  }, [propZ]);
  useEffect(() => {
    boxRef.current.size[0] = propW;
  }, [propW]);
  useEffect(() => {
    boxRef.current.size[1] = propH;
  }, [propH]);
  useEffect(() => {
    boxRef.current.size[2] = propD;
  }, [propD]);

  useFrame((state, dt) => {
    if (update) update(boxRef.current, state, dt);
    const allCollisions = getCollisions(boxRef.current, collideFilterIndices);
    if (collision)
      for (const singleCollision of allCollisions) collision(singleCollision);
    if (collisions) collisions(allCollisions);
    if (render) {
      render(boxRef.current, state, dt);
      return;
    }
    const mesh = ref.current;
    if (!mesh) return;
    mesh.position.set(...boxRef.current.position);
    mesh.scale.set(...boxRef.current.size);
  });

  return { ref, boxRef };
};

// PHYSICS BOX

export type Physics = {
  velocity: vec3;
  acceleration: vec3;
  airborne: number;
};

// USE PHYSICS BOX

export type UsePhysicsBoxProps = UseBoxProps & {
  velocity?: vec3;
  gravity?: boolean;
};
export const usePhysicsBox = ({
  position,
  size,
  velocity,
  gravity = true,

  group = PHYSICS_GROUP,
  collideFilter = STATIC_GROUP | PHYSICS_GROUP,

  update,
  render,
  collision,
  collisions,
}: UsePhysicsBoxProps) => {
  const cloneCollision = (collision: Collision): Collision => ({
    axis: { ...collision.axis },
    shift: collision.shift,
    box: {
      ...collision.box,
      position: [...collision.box.position],
      size: [...collision.box.size],
    },
  });

  const boxInfo = useBox({
    position,
    size,

    group,
    collideFilter,

    update,
    render,
    collision,
    collisions: (allCollisions) => {
      pastCollisions.current = pastCollisions.current.filter((collision) => {
        collision.time++;
        return collision.time <= 2;
      });

      physicsRef.current.airborne++;
      for (const { axis, shift, box } of allCollisions) {
        const [x, y, z] = getHat(axis);
        boxRef.current.position[0] += x * shift;
        boxRef.current.position[1] += y * shift;
        boxRef.current.position[2] += z * shift;
        if (x) physicsRef.current.velocity[0] = 0;
        if (y) physicsRef.current.velocity[1] = 0;
        if (z) physicsRef.current.velocity[2] = 0;
        if (axis.name !== "y") continue;
        if (axis.sign !== "+") continue;
        physicsRef.current.airborne = 0;
        for (const pastCollision of pastCollisions.current) {
          const { axis: pastAxis, box: pastBox } = pastCollision.collision;
          if (pastBox.id !== box.id) continue;
          if (pastAxis.name !== "y") continue;
          if (pastAxis.sign !== "+") continue;
          for (let i = 0; i < 3; i++)
            boxRef.current.position[i] += box.position[i] - pastBox.position[i];
          break;
        }
      }

      for (const collision of allCollisions) {
        let matchedCollision = false;
        for (const pastCollision of pastCollisions.current) {
          if (pastCollision.collision.box.id === collision.box.id) {
            matchedCollision = true;
            pastCollision.collision = cloneCollision(collision);
            pastCollision.time = 0;
            break;
          }
        }
        if (matchedCollision) continue;
        pastCollisions.current.push({
          collision: cloneCollision(collision),
          time: 0,
        });
      }

      const resistance = physicsRef.current.airborne ? 0.995 : 0.95;
      physicsRef.current.velocity[0] *= resistance;
      physicsRef.current.velocity[1] *= resistance;
      physicsRef.current.velocity[2] *= resistance;

      if (collisions) collisions(allCollisions);
    },
  });
  const pastCollisions = useRef<{ collision: Collision; time: number }[]>([]);
  const { boxRef } = boxInfo;

  const [propVx, propVy, propVz] = velocity ?? [0, 0, 0];

  const physicsRef = useRef<Physics>({
    velocity: [0, 0, 0],
    acceleration: [0, 0, 0],
    airborne: 0,
  });

  useEffect(() => {
    physicsRef.current.velocity[0] = propVx;
  }, [propVx]);
  useEffect(() => {
    physicsRef.current.velocity[1] = propVy;
  }, [propVy]);
  useEffect(() => {
    physicsRef.current.velocity[2] = propVz;
  }, [propVz]);

  const accelerate = (acceleration: vec3) => {
    physicsRef.current.acceleration[0] += acceleration[0];
    physicsRef.current.acceleration[1] += acceleration[1];
    physicsRef.current.acceleration[2] += acceleration[2];
  };

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.1);

    if (gravity) accelerate([0, -20, 0]);

    let [x, y, z] = boxRef.current.position;
    let [vx, vy, vz] = physicsRef.current.velocity;
    let [ax, ay, az] = physicsRef.current.acceleration;

    x += vx * (dt / 2);
    y += vy * (dt / 2);
    z += vz * (dt / 2);

    if (!gravity) {
      vx *= 0.95;
      vy *= 0.95;
      vz *= 0.95;
    }
    vx += ax * dt;
    vy += ay * dt;
    vz += az * dt;

    ax = ay = az = 0;

    x += vx * (dt / 2);
    y += vy * (dt / 2);
    z += vz * (dt / 2);

    boxRef.current.position = [x, y, z];
    physicsRef.current.velocity = [vx, vy, vz];
    physicsRef.current.acceleration = [ax, ay, az];
  });

  return { ...boxInfo, physicsRef, accelerate };
};
