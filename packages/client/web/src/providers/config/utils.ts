import { RetromClientConfigJson } from "@retrom/codegen/retrom/client/client-config_pb";
import { z } from "zod";

const {
  RETROM_PORT,
  RETROM_HOST,
  RETROM_HOSTNAME,
  VITE_RETROM_HOSTNAME,
  VITE_RETROM_HOST,
  VITE_RETROM_PORT,
} = import.meta.env;

export function defaultAPIHostname() {
  return RETROM_HOSTNAME ?? VITE_RETROM_HOSTNAME ?? "http://localhost";
}

export function defaultAPIPort() {
  try {
    return Number.parseInt(RETROM_PORT ?? VITE_RETROM_PORT ?? "5101");
  } catch {
    console.warn("Invalid port number found, using default port 5101");
    return 5101;
  }
}

export function defaultAPIHost() {
  return (
    RETROM_HOST ??
    VITE_RETROM_HOST ??
    `${defaultAPIHostname()}:${defaultAPIPort()}`
  );
}

export const configSchema = z.object({
  server: z.object({
    hostname: z.string().url().or(z.string().ip()),
    port: z
      .string()
      .optional()
      .transform((val) => {
        if (val === undefined || val === "") return undefined;
        return parseInt(val);
      })
      .pipe(z.number().int().positive().optional())
      .or(z.number().int().positive().optional()),
  }),
  config: z.object({
    clientInfo: z.object({
      name: z.string(),
      id: z.number(),
    }),
    installationDir: z.string(),
  }),
  flowCompletions: z.object({
    setupComplete: z.boolean(),
  }),
}) satisfies z.ZodSchema<RetromClientConfigJson, z.ZodTypeDef, unknown>;
