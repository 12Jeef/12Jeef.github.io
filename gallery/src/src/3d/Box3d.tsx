import "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  Material,
  MeshLambertMaterial,
} from "three";
import { SHADOWS, useBox, type UseBoxProps } from "./engine";

export const defaultGeometry = new BoxGeometry(1, 1, 1);
export const defaultMaterial = new MeshLambertMaterial({
  flatShading: true,
  color: getComputedStyle(document.documentElement).getPropertyValue(
    "--color-bg1",
  ),
});

export type Box3dProps = UseBoxProps & {
  visible?: boolean;
  geometry?: BufferGeometry | null;
  material?: Material | null;
  children?: any;
};

export default function Box3d({
  visible,
  geometry,
  material,
  children,
  name = "Box3d",
  ...props
}: Box3dProps) {
  const { ref } = useBox({ name, ...props });

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
