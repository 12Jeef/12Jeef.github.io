import type { vec2 } from "../3d/engine";
import Platform3d, { type Platform3dProps } from "../3d/Platform3d";
import Railing3d from "../3d/Railing3d";

export type MainPlatformProps = Platform3dProps & {
  gateSize: number;
};

export default function MainPlatform({
  gateSize,

  position,
  size,
  ...props
}: MainPlatformProps) {
  const [x, y, z] = position;
  const [w, h] = size;

  const cornerShift = 0.875;
  const cornerX = (w / 2) * cornerShift;
  const cornerZ = (h / 2) * cornerShift;
  const cornerSizeMult = 0.375;
  const cornerSize = [w * cornerSizeMult, h * cornerSizeMult] as vec2;

  const railThickness = 0.1;

  const railX = w / 2 - railThickness / 2;
  const railXCorner = cornerX + cornerSize[0] / 2 - railThickness / 2;
  const railXCornerIn = cornerX - cornerSize[0] / 2 + railThickness / 2;
  const railZ = h / 2 - railThickness / 2;
  const railZCorner = cornerZ + cornerSize[1] / 2 - railThickness / 2;
  const railZCornerIn = cornerZ - cornerSize[1] / 2 + railThickness / 2;

  return (
    <>
      <Platform3d position={position} size={size} {...props} />
      {[
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ].map(([sx, sz]) => (
        <>
          <Platform3d
            position={[x + sx * cornerX, y, z + sz * cornerZ]}
            size={cornerSize}
            {...props}
          />
          <Railing3d
            start={[x + sx * railXCorner, y, z + sz * railZCorner]}
            stop={[x + sx * railXCorner, y, z + sz * railZCornerIn]}
          />
          <Railing3d
            start={[x + sx * railXCornerIn, y, z + sz * railZCorner]}
            stop={[x + sx * railXCorner, y, z + sz * railZCorner]}
          />
          <Railing3d
            start={[x + sx * railXCorner, y, z + sz * railZCornerIn]}
            stop={[x + sx * railX, y, z + sz * railZCornerIn]}
          />
          <Railing3d
            start={[x + sx * railXCornerIn, y, z + sz * railZCorner]}
            stop={[x + sx * railXCornerIn, y, z + sz * railZ]}
          />
        </>
      ))}

      <Railing3d
        start={[x + railXCornerIn, y, z - railZ]}
        stop={[x - railXCornerIn, y, z - railZ]}
      />
      <Railing3d
        start={[x + railX, y, z + railZCornerIn]}
        stop={[x + railX, y, z - railZCornerIn]}
      />
      <Railing3d
        start={[x - railX, y, z + railZCornerIn]}
        stop={[x - railX, y, z - railZCornerIn]}
      />
      <Railing3d
        start={[x + railXCornerIn, y, z + railZ]}
        stop={[x + gateSize / 2, y, z + railZ]}
      />
      <Railing3d
        start={[x - railXCornerIn, y, z + railZ]}
        stop={[x - gateSize / 2, y, z + railZ]}
      />
    </>
  );
}
