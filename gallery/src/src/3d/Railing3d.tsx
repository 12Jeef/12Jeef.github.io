import { clamp, lerp } from "three/src/math/MathUtils.js";
import Box3d, { defaultGeometry, defaultMaterial } from "./Box3d";
import { SHADOWS, type AzimuthName, type vec3 } from "./engine";

export type Railing3dProps = {
  start: vec3;
  stop: vec3;

  height?: number;
  gap?: number;
  thickness?: number;
};

export default function Railing3d({
  start,
  stop,
  height = 1,
  gap = 1.5,
  thickness = 0.1,
}: Railing3dProps) {
  const [startX, startY, startZ] = start;
  const [stopX, stopY, stopZ] = stop;

  if (startY !== stopY) return <></>;
  const y = Math.min(startY, stopY);
  if (startX !== stopX && startZ !== stopZ) return <></>;
  const azimuth: AzimuthName = startX === stopX ? "z" : "x";
  const length =
    azimuth === "x" ? Math.abs(startX - stopX) : Math.abs(startZ - stopZ);

  const n = Math.ceil(length / gap) + 1;

  return (
    <>
      <Box3d
        visible={false}
        position={[(startX + stopX) / 2, y + height / 2, (startZ + stopZ) / 2]}
        size={[
          azimuth === "z" ? thickness : length,
          height,
          azimuth === "z" ? length : thickness,
        ]}
      />
      <mesh
        geometry={defaultGeometry}
        material={defaultMaterial}
        position={[
          (startX + stopX) / 2,
          y + height - thickness / 2,
          (startZ + stopZ) / 2,
        ]}
        scale={[
          azimuth === "z" ? thickness : length,
          thickness,
          azimuth === "z" ? length : thickness,
        ]}
        castShadow={SHADOWS}
        receiveShadow={SHADOWS}
      ></mesh>
      {Array.from(new Array(n).keys()).map((i) => {
        const t =
          clamp(
            (i - (n - 1) / 2) * gap,
            (-length + thickness) / 2,
            (length - thickness) / 2,
          ) /
            length +
          0.5;
        const x = lerp(startX, stopX, t);
        const z = lerp(startZ, stopZ, t);
        return (
          <mesh
            key={i}
            geometry={defaultGeometry}
            material={defaultMaterial}
            position={[x, y + height / 2, z]}
            scale={[thickness, height, thickness]}
            castShadow={SHADOWS}
            receiveShadow={SHADOWS}
          ></mesh>
        );
      })}
    </>
  );
}
