import z from "zod";
import type { MessageShape } from "@bufbuild/protobuf";
import type { EmulatorProfileSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";

export const emulatorProfileValidationSchema = z.object({
  name: z
    .string()
    .min(1, "Emulator name must not be empty")
    .max(128, "Emulator name must not exceed 128 characters"),
  builtIn: z.boolean(),
  customArgs: z
    .string()
    .refine(
      (value) =>
        !value || value.includes("{file}") || value.includes("{install_dir}"),
      {
        error: "Launch arguments must include {file} or {install_dir}",
      },
    )
    .max(1024, "Launch arguments must not exceed 1024 characters"),
  supportedExtensions: z.string().array(),
}) satisfies z.ZodType<
  Omit<
    MessageShape<typeof EmulatorProfileSchema>,
    "$typeName" | "id" | "emulator"
  >
>;
