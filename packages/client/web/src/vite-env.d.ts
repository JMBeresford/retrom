/// <reference types="vite/client" />

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
