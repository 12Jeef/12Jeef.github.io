import { getHat, type Azimuth, type vec3 } from "./engine";
import Box3d from "./Box3d";
import { lerp } from "three/src/math/MathUtils.js";

export type Stairs3dProps = {
  facing: Azimuth;
  position: vec3;
  size: vec3;
};

export default function Stairs3d({ facing, position, size }: Stairs3dProps) {
  const [dx, _, dz] = getHat(facing);

  const [x, y, z] = position;
  const [w, h, d] = size;

  const step = 0.2;
  const n = Math.ceil(h / step);

  return (
    <>
      {new Array(n).fill(null).map((_, i) => {
        const t = i / n;
        const xi = x + lerp(-0.5, 0.5, t) * dx * w;
        const yi = y + lerp(-0.5, 0.5, t) * h + step;
        const zi = z + lerp(-0.5, 0.5, t) * dz * d;
        const wi = dx === 0 ? w : w / n;
        const hi = step * 0.5;
        const di = dz === 0 ? d : d / n;
        return <Box3d position={[xi, yi - hi / 2, zi]} size={[wi, hi, di]} />;
      })}
    </>
  );
}
