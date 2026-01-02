import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Sprite,
  Texture,
} from "three";
import { createBloomCanvas } from "./FancyLight";
import { lerp } from "three/src/math/MathUtils.js";
import { INTRO_TIME, materialBackground } from "./Game";

const skyBlooms = ["#ffffff", "#aaaaff", "#aaccff", "#88ddff"].map((color) =>
  createBloomCanvas(256, color, 1),
);
const skyTextures = skyBlooms.map((bloom) => {
  const texture = new Texture(bloom);
  texture.needsUpdate = true;
  return texture;
});

export type SkyProps = {};

export default function Sky() {
  const ref = useRef<Object3D | null>(null);
  const galaxyRef = useRef<Mesh | null>(null);
  const starsRef = useRef<Object3D | null>(null);

  const introStartTime = useMemo(() => Date.now() / 1e3 + 1.5, []);

  const n = 500;
  const scale = 0.15;

  useFrame(({ camera }) => {
    const obj = ref.current;
    if (!obj) return;
    obj.position.set(
      camera.position.x,
      camera.position.y + 3,
      camera.position.z,
    );

    const globalAlpha = Math.min(
      1,
      (Date.now() / 1e3 - introStartTime) / INTRO_TIME,
    );

    const galaxy = galaxyRef.current;
    if (!galaxy) return;
    (galaxy.material as MeshBasicMaterial).opacity = 0.75 * globalAlpha;

    const stars = starsRef.current;
    if (!stars) return;
    for (let i = 0; i < n; i++) {
      const child = stars.children[i] as Sprite;
      const state = states[i];
      const twinkle =
        (Math.sin(
          (2 * Math.PI * Date.now()) / lerp(5, 10, state[4]) / 1e3 +
            state[5] * 2 * Math.PI,
        ) +
          1) /
        2;
      child.scale.set(
        lerp(1, 0.5, twinkle) * scale,
        lerp(1, 0.5, twinkle) * scale,
        1,
      );
      child.material.opacity = lerp(1, 0, twinkle) * globalAlpha;
    }
  }, -1);

  const states = useMemo(() => {
    const states: number[][] = [];
    for (let i = 0; i < n; i++)
      states.push([
        Math.random(), // r
        Math.random(), // theta
        Math.random(), // y
        Math.random(), // texture
        Math.random(), // twinkle m
        Math.random(), // twinkle b
      ]);
    return states;
  }, [n]);

  const gl = useThree((state) => state.gl);

  const [galaxyTexture, setGalaxyTexture] = useState<Texture | null>(null);
  useEffect(() => {
    (async () => {
      const image = await new Promise<HTMLImageElement>((res, rej) => {
        const image = new Image();
        image.addEventListener("load", () => res(image));
        image.addEventListener("error", rej);
        image.src = "./milky_way.jpg";
      });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        createBloomCanvas(
          Math.max(canvas.width, canvas.height),
          materialBackground,
          1,
          true,
        ),
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const texture = new Texture(canvas);
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.minFilter = LinearFilter;
      texture.needsUpdate = true;
      setGalaxyTexture(texture);
    })();
  }, []);

  return (
    <object3D ref={ref}>
      {galaxyTexture && (
        <mesh
          ref={galaxyRef}
          position={[0, 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[17.5 * (16 / 9), 17.5]} />
          <meshBasicMaterial
            map={galaxyTexture}
            color={0xffffff}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
      <object3D ref={starsRef} position={[0, 0, 0]}>
        {states.map((state, i) => (
          <sprite
            key={i}
            position={[
              lerp(2, 10, state[0]) * Math.cos(lerp(0, 2 * Math.PI, state[1])),
              lerp(-1, 1, state[1]),
              lerp(2, 10, state[0]) * Math.sin(lerp(0, 2 * Math.PI, state[1])),
            ]}
            scale={[0, 0, 1]}
          >
            <spriteMaterial
              map={skyTextures[Math.floor(skyTextures.length * state[3])]}
              transparent
              depthWrite={true}
              blending={AdditiveBlending}
            />
          </sprite>
        ))}
      </object3D>
    </object3D>
  );
}
