import "@react-three/fiber";
import { BufferGeometry, Material } from "three";
import { SHADOWS, usePhysicsBox, type UsePhysicsBoxProps } from "./engine";
import { defaultGeometry, defaultMaterial } from "./Box3d";

export type PhysicsBox3dProps = UsePhysicsBoxProps & {
  visible?: boolean;
  geometry?: BufferGeometry | null;
  material?: Material | null;
  children?: any;
};

export default function PhysicsBox3d({
  visible,
  geometry,
  material,
  children,
  name = "PhysicsBox3d",
  ...props
}: PhysicsBox3dProps) {
  const { ref } = usePhysicsBox({ name, ...props });

  return (
    <mesh
      ref={ref}
      visible={visible}
      geometry={geometry === null ? undefined : geometry ?? defaultGeometry}
      material={material === null ? undefined : material ?? defaultMaterial}
      castShadow={SHADOWS}
      receiveShadow={SHADOWS}
    >
      {children}
    </mesh>
  );
}
