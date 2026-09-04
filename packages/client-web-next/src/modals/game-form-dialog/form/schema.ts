import z from "zod";
import type { MessageShape } from "@bufbuild/protobuf";
import type { GameMetadataSchema } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";

export const gameValidationSchema = z.object({
  name: z
    .string()
    .min(1, "Game name must not be empty")
    .max(128, "Game name must not exceed 128 characters"),
  description: z
    .string()
    .max(1024, "Game description must not exceed 1024 characters")
    .optional(),
  coverUrl: z.url("Cover URL must be a valid URL").optional(),
  backgroundUrl: z.url("Background URL must be a valid URL").optional(),
  iconUrl: z.url("Icon URL must be a valid URL").optional(),
}) satisfies z.ZodType<
  Pick<
    MessageShape<typeof GameMetadataSchema>,
    "name" | "description" | "coverUrl" | "backgroundUrl" | "iconUrl"
  >
>;
