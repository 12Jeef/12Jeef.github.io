import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import FancyLight from "./FancyLight";
import { useEffect, useMemo, useRef, useState } from "react";
import { LinearFilter, Object3D, Texture, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import type { ArtworkData } from "./Game";

export type WallProps = ThreeElements["object3D"] & {
  width?: number;
  height?: number;
  lights?: number;
  artwork?: ArtworkData;
  canvas?: HTMLCanvasElement;
  onClose?: () => void;
  onFar?: () => void;
};

export default function Wall({
  width = 2,
  height = 2,
  lights = 1,
  artwork,
  canvas,
  onClose,
  onFar,
  children,
  ...props
}: WallProps) {
  const ref = useRef<Object3D | null>(null);
  const worldPosition = useMemo(() => new Vector3(), []);
  const closeRef = useRef(false);
  const loadedRef = useRef(false);
  const loadChangeTimeRef = useRef(-1e9);
  const flickerRef = useRef(true);
  const flickerChangeTimeRef = useRef(-1e9);

  const margin = 0.25;
  const top = 0.25;
  const out = 0.25;
  const tilt = Math.atan2(out, height / 2 - top);
  const radius = 0.05;

  const barWidth = width * (1 - 1 / (lights * 2));
  const barHeight = height - top + radius * 2;

  const artworkMarginX = 0.1;
  const artworkMarginY = 0.25;

  const renderer = useThree((state) => state.gl);

  const [artworkTexture, setArtworkTexture] = useState<Texture | null>(null);
  useEffect(() => {
    const file = artwork?.file;
    if (!file && !canvas) return setArtworkTexture(null);
    const interval = setInterval(async () => {
      if (!ref.current?.visible) return;
      clearInterval(interval);
      const texture = new Texture(
        canvas
          ? canvas
          : await (async () => {
              const image = await new Promise<HTMLImageElement>((res, rej) => {
                const image = new Image();
                image.addEventListener("load", () => res(image));
                image.addEventListener("error", rej);
                image.src = "./art/" + file + ".png";
              });
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d")!;
              canvas.width = Math.round(image.width * 0.25);
              canvas.height = Math.round(image.height * 0.25);
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
              return canvas;
            })(),
      );
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = LinearFilter;
      texture.needsUpdate = true;
      setArtworkTexture(texture);
    }, 100);
    return () => {
      clearInterval(interval);
      artworkTexture?.dispose();
    };
  }, [canvas, artwork?.file]);

  useFrame(({ camera }) => {
    const obj = ref.current;
    if (!obj) return;
    obj.getWorldPosition(worldPosition);

    const now = Date.now() / 1e3;

    const yaw = camera.rotation.reorder("XZY").y;
    const desiredYaw =
      Math.atan2(
        worldPosition.x - camera.position.x,
        worldPosition.z - camera.position.z,
      ) + Math.PI;
    const angleDeviation = Math.abs(
      (() => {
        let diff = desiredYaw - yaw;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        return diff;
      })(),
    );
    const desiredDistance =
      angleDeviation > Math.PI / 3
        ? 5
        : angleDeviation > Math.PI / 4
        ? lerp(
            5,
            10,
            (angleDeviation - Math.PI / 3) / (Math.PI / 4 - Math.PI / 3),
          )
        : 10;
    const distance = camera.position.distanceTo(worldPosition);

    const close = !!artwork && distance < (width / 2) * 1.5;
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
      timeSinceChange > 0.5
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
  });

  const scale = artworkTexture
    ? Math.min(
        (width - artworkMarginX * 2) / artworkTexture.width,
        (height - artworkMarginY * 2) / artworkTexture.height,
      )
    : 0;

  return (
    <object3D ref={ref} {...props}>
      {children}
      <mesh position={[0, height / 2, -0.05]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshPhongMaterial color={0xffffff} />
      </mesh>
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
      {Array.from(new Array(lights).keys()).map((i) => (
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
