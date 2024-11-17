import { ComponentProps, ReactNode, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BackgroundMaterialKey,
  BackgroundMaterialProps,
} from "./background-material";
import { ACESFilmicToneMapping, BufferGeometry, Mesh } from "three";
import { View } from "@react-three/drei";

export const Scene = (
  props: Omit<ComponentProps<typeof Canvas>, "children"> & {
    children?: ReactNode;
  },
) => {
  const { children = null, ...rest } = props;

  return (
    <Canvas {...rest} gl={{ toneMapping: ACESFilmicToneMapping }}>
      <View.Port />
      {children}
    </Canvas>
  );
};

export function Background() {
  const ref = useRef<Mesh<BufferGeometry, BackgroundMaterialProps>>(null);
  const size = useThree((s) => s.size);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.material.uTime = clock.elapsedTime;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <backgroundMaterial
        key={BackgroundMaterialKey}
        uResolution={[size.width, size.height]}
      />
    </mesh>
  );
}
