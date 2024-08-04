import { RetromClientConfig } from "@/generated/retrom/client/client-config";
import { InferSchema } from "@/lib/utils";
import { z } from "zod";

const { RETROM_PORT, RETROM_HOST, RETROM_HOSTNAME } = process.env;

export function defaultAPIHostname() {
  return (
    RETROM_HOSTNAME ??
    process.env.NEXT_PUBLIC_RETROM_HOSTNAME ??
    "http://localhost"
  );
}

export function defaultAPIPort() {
  try {
    return Number.parseInt(
      RETROM_PORT ?? process.env.NEXT_PUBLIC_RETROM_PORT ?? "5101",
    );
  } catch (e) {
    console.warn("Invalid port number found, using default port 5101");
    return 5101;
  }
}

export function defaultAPIHost() {
  return (
    RETROM_HOST ??
    process.env.NEXT_PUBLIC_RETROM_HOST ??
    `${defaultAPIHostname()}:${defaultAPIPort()}`
  );
}

export const configSchema: InferSchema<Required<RetromClientConfig>> = z.object(
  {
    server: z.object({
      hostname: z.string().url().or(z.string().ip()),
      port: z.number().int().positive(),
    }),
  },
);
