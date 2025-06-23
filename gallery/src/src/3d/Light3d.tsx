import {
  Material,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  type ColorRepresentation,
} from "three";
import { SHADOWS, type vec3 } from "./engine";
import { useFrame, type RootState } from "@react-three/fiber";
import { useRef } from "react";
import { defaultMaterial } from "./Box3d";

export const lightGeometry = new SphereGeometry(1, 8, 8);
const lightMaterials: { [key: string]: Material | undefined } = {};
export const getLightMaterial = (color: ColorRepresentation): Material => {
  const key = color.toString();
  if (lightMaterials[key]) return lightMaterials[key];
  return (lightMaterials[key] = new MeshBasicMaterial({ color }));
};

export type Light3dProps = {
  position: vec3;
  color: ColorRepresentation;
  radius: number;

  on?: boolean;
  showMesh?: boolean;

  distanceMult?: number;
  intensityMult?: number;

  update?: (object: Object3D, state: RootState, dt: number) => void;
};

export default function Light3d({
  position,
  color,
  radius,
  on = true,
  showMesh = true,
  distanceMult = 1,
  intensityMult = 1,
  update,
}: Light3dProps) {
  const ref = useRef<Object3D>(null);

  useFrame((state, dt) => {
    const obj = ref.current;
    if (!obj) return;
    if (update) update(obj, state, dt);
  });

  return (
    <>
      <object3D ref={ref} position={position}>
        {showMesh && (
          <mesh
            geometry={lightGeometry}
            material={on ? getLightMaterial(color) : defaultMaterial}
            scale={[radius, radius, radius]}
          ></mesh>
        )}
        {on && (
          <pointLight
            color={color}
            distance={radius * 25 * distanceMult}
            decay={0}
            intensity={2 * intensityMult}
            castShadow={SHADOWS}
          />
        )}
      </object3D>
    </>
  );
}
