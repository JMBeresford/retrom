import { z } from "zod";
import type { RetromClientConfigJson } from "@retrom/codegen/retrom/client/v1/client_config_pb";
import { RETROM_HOSTNAME, RETROM_PORT } from "@/env";

export function defaultAPIHostname() {
  return RETROM_HOSTNAME;
}

export function defaultAPIPort() {
  try {
    return Number.parseInt(RETROM_PORT || "5101");
  } catch {
    console.warn("Invalid port number found, using default port 5101");
    return 5101;
  }
}

export function defaultAPIHost() {
  return RETROM_HOSTNAME || `${defaultAPIHostname()}:${defaultAPIPort()}`;
}

export const configSchema = z.object({
  server: z.object({
    hostname: z.union([z.url(), z.ipv4()]),
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
      id: z.string(),
    }),
    installationDir: z.string(),
  }),
  flowCompletions: z.object({
    setupComplete: z.boolean(),
  }),
}) satisfies z.ZodSchema<RetromClientConfigJson>;
