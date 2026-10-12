import { z } from "zod";

/**
 * Parse the ID from a emulator resource path.
 *
 * @example
 * ```ts
 * const emulatorId = emulatorIdSchema.parse("emulators/12345");
 *
 * assert.equal(emulatorId, "12345");
 * ```
 */
export const emulatorIdSchema = z.string().transform((val) => {
  const match = val.match(/^emulators\/([a-zA-Z0-9_-]+)$/);

  const id = match?.[1];
  if (!id) {
    throw new Error("Must match format: 'emulators/<emulator_id>'");
  }

  return id;
});
