import { Image } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { damp } from "three/src/math/MathUtils.js";
import { useGameDetail } from "@/providers/game-details";
import { createUrl, usePublicUrl } from "@/utils/urls";

export function Background() {
  const publicUrl = usePublicUrl();
  const { gameMetadata, extraMetadata } = useGameDetail();
  const { width, height } = useThree((s) => s.viewport);
  const ref = useRef<Mesh<BufferGeometry, MeshBasicMaterial>>(null);

  const backgroundUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.backgroundUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.backgroundUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  const coverUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.coverUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.coverUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

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
  );
}
