import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { ComponentProps, useMemo, useRef } from "react";
import { Box3, BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { damp } from "three/src/math/MathUtils.js";

const box = new Box3();

export function Name(props: { name?: string }) {
  const ref = useRef<
    Mesh<BufferGeometry, MeshBasicMaterial> & ComponentProps<typeof Text>
  >(null);

  const { width, height } = useThree((s) => s.viewport);

  const [name, lineCount] = useMemo(() => {
    const lines = [];
    let line = "";

    if (props.name !== undefined) {
      for (const part of props.name.split(" ").reverse()) {
        if (line.length > 15) {
          lines.push(line);
          line = "";
        }

        line = part + " " + line;
      }
    }

    lines.push(line.trim());

    const lineCount = lines.length;
    const name = lines.reverse().join("\n").trim().toUpperCase();

    return [name, lineCount];
  }, [props.name]);

  useFrame((_, dt) => {
    if (!ref.current) return;

    box.setFromObject(ref.current);
    let min = box?.min?.x ?? 0;
    let max = box?.max?.x ?? 0;
    if ([min, max].some((v) => [Infinity, -Infinity].includes(v))) {
      min = 0;
      max = 1;
    }
    const boxWidth = Math.abs(max - min);

    const factor =
      (boxWidth < width ? boxWidth / width : -width / boxWidth) * 0.15;

    if (Math.abs(boxWidth - width) > 0.03 * width) {
      ref.current.scale.y = 1;
      ref.current.fillOpacity = -1;
      ref.current.outlineOpacity = -1.5;
      ref.current.scale.addScalar(factor);
    } else {
      const scale = name.length < 7 ? 3 : lineCount > 1 ? 1.25 : 2;
      ref.current.scale.y = damp(ref.current.scale.y, scale, 1, dt);

      ref.current.fillOpacity = damp(ref.current.fillOpacity ?? 0, 1, 0.7, dt);
      ref.current.outlineOpacity = damp(
        ref.current.outlineOpacity ?? -1.5,
        0.5,
        0.7,
        dt,
      );
    }
  });

  return (
    <Text
      ref={ref}
      fontSize={1}
      lineHeight={0.85}
      fontWeight={900}
      textAlign="center"
      anchorY="bottom-baseline"
      anchorX="center"
      rotation-x={-0.55}
      position={[0, -height / 2, 0]}
      scale={[1, 1, 1]}
      renderOrder={2}
      outlineColor="black"
      // outlineWidth={0.005}
      outlineBlur={0.075}
      outlineOpacity={-1.5}
      fillOpacity={-1}
    >
      <meshBasicMaterial
        color="#fff"
        toneMapped={false}
        transparent
        depthTest={false}
      />
      {name}
    </Text>
  );
}
