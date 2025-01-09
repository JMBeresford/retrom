/// <reference types="vite/client" />

declare module "*.glsl" {
  const content: string;
  export default content;
}

declare module "*.frag" {
  const content: string;
  export default content;
}

declare module "*.vert" {
  const content: string;
  export default content;
}

const _Vars = [
  "RETROM_PORT",
  "RETROM_HOST",
  "RETROM_HOSTNAME",
  "RETROM_VERSION",
] as const;

type Env = (typeof _Vars)[number] | `VITE_${(typeof _Vars)[number]}`;

// eslint-disable-next-line
interface ImportMetaEnv extends Record<Env, string | undefined> {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
