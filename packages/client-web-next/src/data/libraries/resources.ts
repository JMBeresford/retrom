import { z } from "zod";

/**
 * Parse the ID from a game resource path.
 *
 * @example
 * ```ts
 * const gameId = gameIdSchema.parse("games/12345");
 *
 * assert.equal(gameId, "12345");
 * ```
 */
export const gameIdSchema = z.string().transform((val) => {
  const match = val.match(/^games\/([a-zA-Z0-9_-]+)$/);

  const id = match?.[1];
  if (!id) {
    throw new Error("Must match format: 'games/<game_id>'");
  }

  return id;
});

/**
 * Parse the ID from a platform resource path.
 *
 * @example
 * ```ts
 * const platformId = platformIdSchema.parse("platforms/12345");
 *
 * assert.equal(platformId, "12345");
 * ```
 */
export const platformIdSchema = z.string().transform((val) => {
  const match = val.match(/^platforms\/([a-zA-Z0-9_-]+)$/);

  const id = match?.[1];

  if (!id) {
    throw new Error("Must match format: 'platforms/<platform_id>'");
  }

  return id;
});
