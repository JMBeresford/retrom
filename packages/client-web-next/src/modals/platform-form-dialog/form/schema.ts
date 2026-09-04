import z from "zod";
import type { MessageShape } from "@bufbuild/protobuf";
import type { PlatformMetadataSchema } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";

export const platformValidationSchema = z.object({
  name: z
    .string()
    .min(1, "Platform name must not be empty")
    .max(128, "Platform name must not exceed 128 characters"),
  description: z
    .string()
    .max(1024, "Platform description must not exceed 1024 characters")
    .optional(),
  logoUrl: z.url("Logo URL must be a valid URL").optional(),
}) satisfies z.ZodType<
  Pick<
    MessageShape<typeof PlatformMetadataSchema>,
    "name" | "description" | "logoUrl"
  >
>;
