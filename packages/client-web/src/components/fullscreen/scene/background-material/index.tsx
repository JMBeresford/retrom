import { shaderMaterial } from "@react-three/drei";
import { extend, MaterialNode } from "@react-three/fiber";
import vertexShader from "./vert.glsl";
import fragmentShader from "./frag.glsl";
import { Color, ShaderMaterial, AdditiveBlending, Vector4 } from "three";

type Uniforms = {
  uTime: number;
  uColor: [number, number, number] | Color;
  uResolution: [number, number];
  uTrail: [Vector4, Vector4, Vector4, Vector4, Vector4];
};

export type BackgroundMaterialProps = Uniforms & ShaderMaterial;

const uniforms: Uniforms = {
  uTime: 0,
  uColor: new Color(0x6132ac),
  uResolution: [0, 0],
  uTrail: [
    new Vector4(600, 300, 0, 0),
    new Vector4(600, 300, 0, 0),
    new Vector4(600, 300, 0, 0),
    new Vector4(600, 300, 0, 0),
    new Vector4(600, 300, 0, 0),
  ],
};

const BackgroundMaterial = shaderMaterial(
  uniforms,
  vertexShader,
  fragmentShader,
  (m) => {
    if (!m) return;
    m.transparent = true;
    m.premultipliedAlpha = true;
    m.blending = AdditiveBlending;
    m.toneMapped = true;
    m.defines = {
      TONE_MAPPING: "",
    };
    m.extensions = {
      ...m.extensions,
    };
  },
);

extend({ BackgroundMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    backgroundMaterial: MaterialNode<
      BackgroundMaterialProps,
      typeof BackgroundMaterial
    >;
  }
}

export const BackgroundMaterialKey = BackgroundMaterial.key;
