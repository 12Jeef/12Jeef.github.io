import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import FancyLight from "./FancyLight";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LinearFilter, Mesh, Object3D, Texture, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import { context, materialBackground, type Artwork } from "./Game";

export type WallProps = ThreeElements["object3D"] & {
  width?: number;
  height?: number;
  lights?: number;
  artwork?: Artwork;
  canvas?: HTMLCanvasElement;
  onClose?: () => void;
  onFar?: () => void;
  loop?: number;
  onLost?: () => void;
  onFound?: () => void;
};

export default function Wall({
  width = 2,
  height = 2,
  lights = 1,
  artwork,
  canvas,
  onClose,
  onFar,
  loop,
  onLost,
  onFound,
  children,
  ...props
}: WallProps) {
  const { mobile } = useContext(context);

  const ref = useRef<Object3D | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const worldPosition = useMemo(() => new Vector3(), []);
  const cameraAltPosition = useMemo(() => new Vector3(), []);
  const closeRef = useRef(false);
  const loadedRef = useRef(false);
  const loadChangeTimeRef = useRef(-1e9);
  const flickerRef = useRef(true);
  const flickerChangeTimeRef = useRef(-1e9);

  const lostRef = useRef(true);

  const renderedRef = useRef(false);
  const [rendered, setRendered] = useState(false);

  const margin = 0.25;
  const top = 0.25;
  const out = 0.25;
  const tilt = Math.atan2(out, height / 2 - top);
  const radius = 0.05;

  const barWidth = width * (1 - 1 / (lights * 2));
  const barHeight = height - top + radius * 2;

  const artworkMarginX = 0.1;
  const artworkMarginY = 0.25;

  const gl = useThree((state) => state.gl);
  const beefy = gl.capabilities.maxTextures > 16;

  const [artworkTexture, setArtworkTexture] = useState<Texture | null>(null);
  useEffect(() => {
    if (!rendered) return setArtworkTexture(null);
    const texture = new Texture(
      canvas ? canvas : artwork ? artwork.canvas : null,
    );
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.minFilter = LinearFilter;
    texture.needsUpdate = true;
    setArtworkTexture(texture);
    return () => texture.dispose();
  }, [rendered, canvas, artwork?.canvas]);

  useFrame(({ camera }) => {
    const obj = ref.current;
    if (!obj) return;
    const mesh = meshRef.current;
    if (!mesh) return;
    obj.getWorldPosition(worldPosition);

    if (loop) {
      cameraAltPosition.copy(camera.position);
      if (camera.position.z > obj.position.z) cameraAltPosition.z -= loop;
      else cameraAltPosition.z += loop;
    }
    const positions = loop
      ? [camera.position, cameraAltPosition]
      : [camera.position];

    const now = Date.now() / 1e3;

    const yaw = camera.rotation.reorder("XZY").y;
    const desiredYaws = positions.map(
      (position) =>
        Math.atan2(worldPosition.x - position.x, worldPosition.z - position.z) +
        Math.PI,
    );
    const angleDeviation = Math.min(
      ...desiredYaws.map((desiredYaw) => {
        let diff = desiredYaw - yaw;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        return Math.abs(diff);
      }),
    );
    const maxAngleDeviation = 60 * (Math.PI / 180);
    const minAngleDeviation = 45 * (Math.PI / 180);
    const desiredDistance =
      angleDeviation > maxAngleDeviation
        ? 5
        : angleDeviation > minAngleDeviation
        ? lerp(
            5,
            10,
            (angleDeviation - maxAngleDeviation) /
              (minAngleDeviation - maxAngleDeviation),
          )
        : 10;
    const distance = Math.min(
      ...positions.map((position) => position.distanceTo(worldPosition)),
    );
    const distanceZ = Math.min(
      ...positions.map((position) => Math.abs(position.z - worldPosition.z)),
    );

    const close =
      !!artwork &&
      (mobile
        ? distance < width * 2 && distanceZ < width / 2
        : distance < (width / 2) * 1.5);
    if (closeRef.current != close) {
      closeRef.current = close;
      if (close) onClose?.();
      else onFar?.();
    }

    const load = distance < desiredDistance;
    if (loadedRef.current != load) {
      loadedRef.current = load;
      loadChangeTimeRef.current = now;
      flickerChangeTimeRef.current = loadChangeTimeRef.current;
    }

    const timeSinceChange = now - loadChangeTimeRef.current;
    const show =
      timeSinceChange > (mobile ? 0 : 0.5)
        ? load
        : (() => {
            const timeSinceFlicker = now - flickerChangeTimeRef.current;
            if (timeSinceFlicker > lerp(0, 0.05, Math.random())) {
              flickerChangeTimeRef.current = now;
              flickerRef.current =
                Math.random() < lerp(0, 1, timeSinceChange / 0.5);
            }
            return flickerRef.current ? load : !load;
          })();
    obj.visible = show;

    const render = load;
    if (renderedRef.current != render) {
      renderedRef.current = render;
      setRendered(render);
    }

    const lost = distance > 10;
    if (lostRef.current != lost) {
      lostRef.current = lost;
      if (lost) onLost?.();
      else onFound?.();
    }
  }, -1);

  const scale = artworkTexture
    ? Math.min(
        (width - artworkMarginX * 2) / artworkTexture.width,
        (height - artworkMarginY * 2) / artworkTexture.height,
      )
    : 0;

  return (
    <object3D ref={ref} visible={false} {...props}>
      {children}
      <mesh ref={meshRef} position={[0, height / 2, -0.05]} castShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshPhongMaterial color={0xffffff} />
      </mesh>
      {!beefy && (
        <mesh position={[0, -0.05 + 0.01, -height / 2]}>
          <boxGeometry args={[width, 0.1, height]} />
          <meshBasicMaterial color={materialBackground} />
        </mesh>
      )}
      {artworkTexture && (
        <mesh position={[0, height / 2, 0.01]}>
          <planeGeometry
            args={[artworkTexture.width * scale, artworkTexture.height * scale]}
          />
          <meshBasicMaterial
            map={artworkTexture}
            transparent
            color={0xbbbbbb}
          />
        </mesh>
      )}
      {rendered &&
        Array.from(new Array(lights).keys()).map((i) => (
          <FancyLight
            key={i}
            position={[
              (width / (lights + margin)) * (i + (1 + margin) / 2) - width / 2,
              height - top,
              out,
            ]}
            rotation={[
              tilt,
              0,
              (+(i === 0) - +(i === lights - 1)) * (Math.PI / 24),
            ]}
            angle={Math.PI * 0.25}
            intensity={3 * (height / 2)}
            decay={2 / (height / 2)}
            radius={radius}
          />
        ))}
      <mesh position={[0, barHeight, out]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[
            radius / 2,
            radius / 2,
            width * (1 - 1 / (lights * 2)),
            6,
            1,
            false,
          ]}
        />
        <meshBasicMaterial color={0x000000} />
      </mesh>
      <mesh
        position={[-barWidth / 2, barHeight, out / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[radius / 2, radius / 2, out, 6, 1, false]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
      <mesh
        position={[barWidth / 2, barHeight, out / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[radius / 2, radius / 2, out, 6, 1, false]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
    </object3D>
  );
}
