import Box3d, { defaultGeometry, defaultMaterial } from "./Box3d";
import type { vec2, vec3 } from "./engine";

export type Platform3dProps = {
  position: vec3;
  size: vec2;

  platformDepth?: number;

  decoSize?: vec2;
  decoDownShift?: number;
  decoInShift?: number;

  pillarDepth?: number;
  pillarInShift?: number;
};

export default function Platform3d({
  position,
  size,
  platformDepth = 1,
  decoSize = [1.5, 3],
  decoDownShift = platformDepth / 2,
  decoInShift = 0.25,
  pillarDepth = 20,
  pillarInShift = 0.25,
}: Platform3dProps) {
  const [x, y, z] = position;
  const [w, h] = size;

  const decoX = w / 2 - decoInShift;
  const decoY = y - decoDownShift - decoSize[1] / 2;
  const decoZ = h / 2 - decoInShift;

  const pillarY = y - platformDepth - pillarDepth / 2;
  const [pillarW, pillarH] = [w - pillarInShift * 2, h - pillarInShift * 2];

  return (
    <>
      <Box3d
        position={[x, y - platformDepth / 2, z]}
        size={[w, platformDepth, h]}
      />
      {[
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ].map(([sx, sz], i) => (
        <mesh
          key={i}
          geometry={defaultGeometry}
          material={defaultMaterial}
          position={[x + sx * decoX, decoY, z + sz * decoZ]}
          scale={[decoSize[0], decoSize[1], decoSize[0]]}
        ></mesh>
      ))}
      <mesh
        geometry={defaultGeometry}
        material={defaultMaterial}
        position={[x, pillarY, z]}
        scale={[pillarW, pillarDepth, pillarH]}
      ></mesh>
    </>
  );
}
