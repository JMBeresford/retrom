import z from "zod";
import { Emulator_OperatingSystem } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import type { EmulatorSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import type { MessageShape } from "@bufbuild/protobuf";

export const emulatorValidationSchema = z.object({
  displayName: z
    .string()
    .min(1, "Emulator name must not be empty")
    .max(128, "Emulator name must not exceed 128 characters"),
  platforms: z.array(
    z.string().regex(/^platforms\/[a-z0-9_-]+$/, "Invalid platform name"),
  ),
  operatingSystems: z.enum(Emulator_OperatingSystem).array(),
  builtIn: z.boolean(),
}) satisfies z.ZodType<
  Omit<MessageShape<typeof EmulatorSchema>, "$typeName" | "name">
>;
