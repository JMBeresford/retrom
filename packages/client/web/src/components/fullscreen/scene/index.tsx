import { ComponentProps, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BackgroundMaterialKey,
  BackgroundMaterialProps,
} from "./background-material";
import { ACESFilmicToneMapping, BufferGeometry, Mesh } from "three";

export function Scene(props: ComponentProps<typeof Canvas>) {
  const { children, ...rest } = props;

  return (
    <Canvas {...rest} gl={{ toneMapping: ACESFilmicToneMapping }}>
      <Background />
      {children}
    </Canvas>
  );
}

function Background() {
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
