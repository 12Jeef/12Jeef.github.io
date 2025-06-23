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

  const railThickness = 0.1;

  const railX = (w - railThickness) / 2;
  const railZ = (h - railThickness) / 2;

  return (
    <>
      <Platform3d position={position} size={size} {...props} />

      <Railing3d
        start={[x - railX, y, z - railZ]}
        stop={[x - railX, y, z + railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x + railX, y, z - railZ]}
        stop={[x + railX, y, z + railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x - railX, y, z - railZ]}
        stop={[x + railX, y, z - railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x - railX, y, z + railZ]}
        stop={[x - gateSize / 2, y, z + railZ]}
        thickness={railThickness}
      />
      <Railing3d
        start={[x + railX, y, z + railZ]}
        stop={[x + gateSize / 2, y, z + railZ]}
        thickness={railThickness}
      />
    </>
  );
}
