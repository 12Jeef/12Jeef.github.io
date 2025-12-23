import { AdditiveBlending, Object3D, Texture, Vector3 } from "three";
import Light, { type LightProps } from "./Light";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { createCanvas } from "./displays";

export function createBloomCanvas(
  size: number,
  color: string,
  alpha: number,
  invert = false,
) {
  const ctx = createCanvas(size, size);
  ctx.globalAlpha = alpha;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(invert ? 1 : 0, color);
  gradient.addColorStop(invert ? 0 : 1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return ctx.canvas;
}

const color = "#ffddbb";
const bloomCanvas = createBloomCanvas(256, color, 0.65);

const bloomTexture = new Texture(bloomCanvas);
bloomTexture.needsUpdate = true;

export type FancyLightProps = LightProps & {
  factor?: number;
};

export default function FancyLight({
  ref,
  position,
  rotation,
  angle = Math.PI / 3,
  penumbra = 1,
  radius = 0.05,
  factor = 0.35 / 0.25,
  ...props
}: FancyLightProps) {
  const worldPosition = useMemo(() => new Vector3(), []);

  const coneHeight = (radius / Math.sin(angle)) * 1.5;
  const coneRadius = (radius / Math.cos(angle)) * 1.5;

  const scale = radius / 0.05;

  const bloomScale = 0.7;

  const bloomRef = useRef<Object3D | null>(null);

  useFrame(({ camera }) => {
    const bloom = bloomRef.current;
    if (!bloom) return;
    const distance = camera.position.distanceTo(
      bloom.getWorldPosition(worldPosition),
    );
    if (distance > 10) return;
    const actualScale = bloomScale;
    scale * Math.min(Math.max(1, Math.pow(distance, 2) / 20), 3);
    bloom.scale.set(actualScale, actualScale, 1);
  }, -1);

  return (
    <object3D position={position} rotation={rotation}>
      <Light
        color={color}
        angle={angle}
        penumbra={penumbra}
        radius={radius}
        {...props}
      />
      <mesh position={[0, coneHeight / 2 + 0.001, 0]}>
        <coneGeometry args={[coneRadius, coneHeight, 16, 1, false]} />
        <meshPhongMaterial color={0x000000} />
      </mesh>
      <sprite ref={bloomRef} position={[0, -radius, 0]} scale={[0, 0, 1]}>
        <spriteMaterial
          map={bloomTexture}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </object3D>
  );
}
