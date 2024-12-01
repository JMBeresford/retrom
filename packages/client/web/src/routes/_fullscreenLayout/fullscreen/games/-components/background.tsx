import { GameMetadata } from "@/generated/retrom/models/metadata";
import { Image } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CatchBoundary } from "@tanstack/react-router";
import { useRef } from "react";
import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { damp } from "three/src/math/MathUtils.js";

export function Background(props: { metadata: Partial<GameMetadata> }) {
  const { metadata } = props;
  const { backgroundUrl, coverUrl } = metadata;
  const { width, height } = useThree((s) => s.viewport);
  const ref = useRef<Mesh<BufferGeometry, MeshBasicMaterial>>(null);

  const url = backgroundUrl || coverUrl;

  useFrame(({ clock }, dt) => {
    if (!ref.current) return;

    ref.current.position.x = damp(
      ref.current.position.x,
      Math.sin(clock.elapsedTime * 0.1) * width * 0.045,
      0.7,
      dt,
    );

    ref.current.position.y = damp(
      ref.current.position.y,
      Math.sin(clock.elapsedTime * 0.05) * height * 0.045,
      0.7,
      dt,
    );

    ref.current.material.opacity = damp(
      ref.current.material.opacity,
      1,
      0.7,
      dt,
    );
  });

  if (!url) {
    return null;
  }

  return (
    <CatchBoundary
      getResetKey={() => "reset"}
      onCatch={(error) => console.error(error)}
      errorComponent={() => <></>}
    >
      <group scale={1.1}>
        <Image
          ref={ref}
          renderOrder={1}
          url={url}
          scale={[width, height]}
          transparent
          opacity={0}
        />
      </group>
    </CatchBoundary>
  );
}
