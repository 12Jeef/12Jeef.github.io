import { useThree, type ThreeElements } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { AdditiveBlending, Object3D, SpotLight } from "three";

export type LightProps = Omit<
  ThreeElements["object3D"] & ThreeElements["spotLight"],
  "target"
> & { radius?: number };

export default function Light({
  position,
  rotation,
  radius = 0.05,
  ...props
}: LightProps) {
  const [spotLight, setSpotLight] = useState<SpotLight | null>(null);
  const [target, setTarget] = useState<Object3D | null>(null);
  useEffect(() => {
    if (!spotLight) return;
    if (!target) return;
    spotLight.target = target;
    target.position.set(
      spotLight.position.x,
      spotLight.position.y - 1,
      spotLight.position.z,
    );
  }, [spotLight, target]);
  const gl = useThree((state) => state.gl);
  const beefy = gl.capabilities.maxTextures > 16;

  return (
    <object3D position={position} rotation={rotation} {...props}>
      <spotLight ref={setSpotLight} {...props} castShadow={beefy} />
      <object3D ref={setTarget} />
      <mesh>
        <sphereGeometry args={[radius * 0.75]} />
        <meshBasicMaterial color={props.color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius]} />
        <meshBasicMaterial color={props.color} blending={AdditiveBlending} />
      </mesh>
    </object3D>
  );
}
