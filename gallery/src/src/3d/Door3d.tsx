import { useEffect, useMemo, useRef, useState } from "react";
import {
  DECO_GROUP,
  getHat,
  nextId,
  rotateYCW90,
  SHADOWS,
  useTrigger,
  type AzimuthName,
  type Box,
  type vec2,
  type vec3,
} from "./engine";
import Box3d, { defaultMaterial } from "./Box3d";
import { useFrame } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";
import { BufferAttribute, BufferGeometry, Euler } from "three";

const euler0 = new Euler(0, 0, 0, "YXZ");
const euler90 = new Euler(0, Math.PI / 2, 0, "YXZ");
const euler180 = new Euler(0, Math.PI, 0, "YXZ");
const euler270 = new Euler(0, (3 * Math.PI) / 2, 0, "YXZ");

// CENTER WEDGE

const createGeometries = (slant: number) => {
  const centerWedgeFaceVerticies = [
    [-1 - slant / 2, 1],
    [-1 + slant / 2, -1],
    [1 - slant / 2, -1],
    [1 + slant / 2, 1],
  ];
  const centerWedgeVerticies: number[] = [];
  for (const [x, y] of centerWedgeFaceVerticies)
    centerWedgeVerticies.push(x * 0.5, y * 0.5, 0.5);
  for (const [x, y] of centerWedgeFaceVerticies.reverse())
    centerWedgeVerticies.push(x * 0.5, y * 0.5, -0.5);

  const centerWedgeFaces = [
    // front
    [0, 1, 2],
    [0, 2, 3],
    // back
    [4, 5, 6],
    [4, 6, 7],
    // left
    [7, 6, 1],
    [7, 1, 0],
    // right
    [3, 2, 5],
    [3, 5, 4],
    // bottom
    [6, 2, 1],
    [6, 5, 2],
  ];
  const centerWedgeIndices: number[] = [];
  for (const [i, j, k] of centerWedgeFaces) centerWedgeIndices.push(i, j, k);

  const centerWedgeGeometry = new BufferGeometry();
  centerWedgeGeometry.setIndex(centerWedgeIndices);
  centerWedgeGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(centerWedgeVerticies), 3),
  );
  centerWedgeGeometry.computeVertexNormals();

  // SIDE WEDGE

  const sideWedgeFaceVerticies = [
    [-1, 1],
    [-1, -1],
    [1 + slant / 2, -1],
    [1 - slant / 2, 1],
  ];
  const sideWedgeVerticies: number[] = [];
  for (const [x, y] of sideWedgeFaceVerticies)
    sideWedgeVerticies.push(x * 0.5, y * 0.5, 0.5);
  for (const [x, y] of sideWedgeFaceVerticies.reverse())
    sideWedgeVerticies.push(x * 0.5, y * 0.5, -0.5);

  const sideWedgeFaces = [
    // front
    [0, 1, 2],
    [0, 2, 3],
    // back
    [4, 5, 6],
    [4, 6, 7],
    // left
    [7, 6, 1],
    [7, 1, 0],
    // right
    [3, 2, 5],
    [3, 5, 4],
    // top
    [0, 4, 7],
    [0, 3, 4],
  ];
  const sideWedgeIndices: number[] = [];
  for (const [i, j, k] of sideWedgeFaces) sideWedgeIndices.push(i, j, k);

  const sideWedgeGeometry = new BufferGeometry();
  sideWedgeGeometry.setIndex(sideWedgeIndices);
  sideWedgeGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(sideWedgeVerticies), 3),
  );
  sideWedgeGeometry.computeVertexNormals();

  return { centerWedgeGeometry, sideWedgeGeometry };
};

// COMPONENT

export type Door3dProps = {
  facing: AzimuthName;
  position: vec3;
  size: vec2;

  thickness?: number;
  showUpper?: boolean;
  showLower?: boolean;
  prongHeight?: number;
  prongSlant?: number;
  prongCenterPercent?: number;
};

export default function Door3d({
  facing,
  position,
  size,
  thickness = 0.1,
  showUpper = true,
  showLower = true,
  prongHeight = 0.25,
  prongSlant = 0.5,
  prongCenterPercent = 1 / 3,
}: Door3dProps) {
  let prongSidePercent = 0.5 - prongCenterPercent / 2;

  const [baseX, baseY, baseZ] = position;
  const [width, height] = size;

  const [facingX, _, facingZ] = getHat({ sign: "+", name: facing }).map((v) =>
    Math.abs(v),
  );
  const [rightX, __, rightZ] = getHat(
    rotateYCW90({ sign: "+", name: facing }),
  ).map((v) => Math.abs(v));

  const triggerBoxId = useMemo(() => nextId(), []);
  const triggerBox: Box = {
    id: triggerBoxId,
    name: "Door3dTrigger",

    position: [baseX, baseY + height / 2, baseZ],
    size: [
      facingX * 2.5 + rightX * width * 1.25,
      height,
      facingZ * 2.5 + rightZ * width * 1.25,
    ],
  };

  const triggered = useTrigger({ box: triggerBox });
  const changeTimeRef = useRef(0);
  useEffect(() => {
    changeTimeRef.current = Date.now() / 1e3;
    heightVeloRef.current = 0;
  }, [triggered]);

  const heightRef = useRef(height);
  const heightVeloRef = useRef(0);
  const [prongsVisible, setProngsVisible] = useState(true);
  const [coreVisible, setCoreVisible] = useState(true);
  useFrame((_, dt) => {
    const time = Date.now() / 1e3 - changeTimeRef.current;
    if (time > 0) {
      const a = lerp(0, 1.5, Math.min(1, (time - 0) / 2));
      if (triggered) heightVeloRef.current -= a * dt;
      else heightVeloRef.current += a * dt;
      heightRef.current += heightVeloRef.current * dt;
    }
    if (heightRef.current <= -prongHeight / 2) {
      heightRef.current = -prongHeight / 2;
    }
    if (heightRef.current >= height / 2) {
      heightRef.current = height / 2;
      heightVeloRef.current = 0;
    }

    const nextProngsVisible = heightRef.current > -prongHeight / 2;
    if (prongsVisible !== nextProngsVisible)
      setProngsVisible(nextProngsVisible);
    const nextCoreVisible = heightRef.current > 0;
    if (coreVisible !== nextCoreVisible) setCoreVisible(nextCoreVisible);
  });

  const { centerWedgeGeometry, sideWedgeGeometry } = useMemo(
    () => createGeometries(prongSlant),
    [prongSlant],
  );

  return (
    <>
      {coreVisible && (
        <>
          {showUpper && (
            <Box3d
              name="Door3dCoreTop"
              position={[...triggerBox.position]}
              size={[
                facingX * thickness + rightX * width,
                height,
                facingZ * thickness + rightZ * width,
              ]}
              update={(box) => {
                const top = height;
                const bottom = Math.min(
                  top,
                  height + prongHeight / 2 - heightRef.current,
                );
                box.position[1] = baseY + (top + bottom) / 2;
                box.size[1] = top - bottom;
              }}
            />
          )}
          {showLower && (
            <Box3d
              name="Door3dCoreBottom"
              position={[...triggerBox.position]}
              size={[
                facingX * thickness + rightX * width,
                height,
                facingZ * thickness + rightZ * width,
              ]}
              update={(box) => {
                const bottom = 0;
                const top = Math.max(
                  bottom,
                  heightRef.current - prongHeight / 2,
                );
                box.position[1] = baseY + (top + bottom) / 2;
                box.size[1] = top - bottom;
              }}
            />
          )}
        </>
      )}
      {prongsVisible && (
        <>
          {showUpper && (
            <Box3d
              geometry={null}
              position={[baseX, baseY, baseZ]}
              name="Door3dProngCenter"
              size={[
                facingX * thickness + rightX * (width * prongCenterPercent),
                prongHeight,
                facingZ * thickness + rightZ * (width * prongCenterPercent),
              ]}
              group={DECO_GROUP}
              update={(box) => {
                const bottom = height - prongHeight / 2 - heightRef.current;
                const top = Math.min(height, bottom + prongHeight);
                box.position[1] = baseY + (top + bottom) / 2;
                box.size[1] = top - bottom;
              }}
            >
              <mesh
                geometry={centerWedgeGeometry}
                material={defaultMaterial}
                rotation={facing === "z" ? euler0 : euler90}
                castShadow={SHADOWS}
                receiveShadow={SHADOWS}
              ></mesh>
            </Box3d>
          )}
          {showLower && (
            <>
              <Box3d
                geometry={null}
                name="Door3dProngRight"
                position={[
                  baseX + rightX * (width * (0.5 - prongSidePercent / 2)),
                  baseY,
                  baseZ + rightZ * (width * (0.5 - prongSidePercent / 2)),
                ]}
                size={[
                  facingX * thickness + rightX * (width * prongSidePercent),
                  prongHeight,
                  facingZ * thickness + rightZ * (width * prongSidePercent),
                ]}
                group={DECO_GROUP}
                update={(box) => {
                  const top = heightRef.current + prongHeight / 2;
                  const bottom = Math.max(0, top - prongHeight);
                  box.position[1] = baseY + (top + bottom) / 2;
                  box.size[1] = top - bottom;
                }}
              >
                <mesh
                  geometry={sideWedgeGeometry}
                  material={defaultMaterial}
                  rotation={facing === "z" ? euler180 : euler90}
                  castShadow={SHADOWS}
                  receiveShadow={SHADOWS}
                ></mesh>
              </Box3d>
              <Box3d
                geometry={null}
                name="Door3dProngLeft"
                position={[
                  baseX - rightX * (width * (0.5 - prongSidePercent / 2)),
                  baseY,
                  baseZ - rightZ * (width * (0.5 - prongSidePercent / 2)),
                ]}
                size={[
                  facingX * thickness + rightX * (width * prongSidePercent),
                  prongHeight,
                  facingZ * thickness + rightZ * (width * prongSidePercent),
                ]}
                group={DECO_GROUP}
                update={(box) => {
                  const top = heightRef.current + prongHeight / 2;
                  const bottom = Math.max(0, top - prongHeight);
                  box.position[1] = baseY + (top + bottom) / 2;
                  box.size[1] = top - bottom;
                }}
              >
                <mesh
                  geometry={sideWedgeGeometry}
                  material={defaultMaterial}
                  rotation={facing === "z" ? euler0 : euler270}
                  castShadow={SHADOWS}
                  receiveShadow={SHADOWS}
                ></mesh>
              </Box3d>
            </>
          )}
        </>
      )}
    </>
  );
}
