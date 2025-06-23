import { defaultGeometry, defaultMaterial } from "./Box3d";
import type { vec3 } from "./engine";

export type Pillar3dProps = {
  position: vec3;
  height: number;
  size?: number;
  middle?: number;
};

export default function Pillar3d({
  position,
  height,
  size = 2,
  middle = height * 0.25,
}: Pillar3dProps) {
  const [x, y, z] = position;

  const wedgeHeight = (height - middle) / 2;

  return (
    <>
      <mesh
        geometry={defaultGeometry}
        material={defaultMaterial}
        position={position}
        scale={[size, height, size]}
      ></mesh>
      {[
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].map(([sx, sz]) => (
        <>
          <mesh
            geometry={defaultGeometry}
            material={defaultMaterial}
            position={[
              x + sx * ((size / 2) * 0.75),
              y - height / 2 + wedgeHeight / 2,
              z + sz * ((size / 2) * 0.75),
            ]}
            scale={[size * 0.5, wedgeHeight, size * 0.5]}
          ></mesh>
          <mesh
            geometry={defaultGeometry}
            material={defaultMaterial}
            position={[
              x + sx * ((size / 2) * 0.75),
              y + height / 2 - wedgeHeight / 2,
              z + sz * ((size / 2) * 0.75),
            ]}
            scale={[size * 0.5, wedgeHeight, size * 0.5]}
          ></mesh>
        </>
      ))}
    </>
  );
}
