import z from "zod";
import type { LibrarySchema } from "@retrom/codegen/retrom/services/library/v1/models_pb";
import type { MessageInitShape } from "@bufbuild/protobuf";

const builtinMacros = ["{library}", "{platform}", "{gameFile}", "{gameDir}"];

export const structureDefinitionSchema = z.literal("").or(
  z
    .string()
    .refine(
      (value) =>
        value.startsWith("{library}") || value.startsWith("{platform}"),
      { message: "Must start with {library} or {platform}" },
    )
    .refine((value) => value.includes("{platform}"), {
      message: "Must contain {platform}",
    })
    .refine(
      (value) => value.includes("{gameFile}") || value.includes("gameDir"),
      {
        message: "Must contain {gameFile} or {gameDir}",
      },
    )
    .refine(
      (value) => !(value.includes("{gameFile}") && value.includes("{gameDir}")),
      {
        message: "Cannot contain both {gameFile} and {gameDir}",
      },
    )
    .refine(
      (value) => {
        const gamePos = value.includes("{gameFile}")
          ? value.indexOf("{gameFile}")
          : value.indexOf("{gameDir}");

        const platformPos = value.indexOf("{platform}");

        return gamePos > platformPos;
      },
      { message: "{platform} must be before {gameDir} or {gameFile}" },
    )
    .superRefine((value, ctx) => {
      const macro = builtinMacros.find((m) => value.split(m).length > 2);

      if (macro) {
        ctx.addIssue({
          code: "custom",
          message: `Must contain at most one ${macro}`,
        });
      }
    })
    .refine(
      (value) => {
        for (let i = 0; i < value.length; i++) {
          const char = value[i];

          if (char === "{" && i !== 0 && value[i - 1] !== "/") {
            return false;
          }

          if (char === "}" && i + 1 > value.length && value[i + 1] !== "/") {
            return false;
          }
        }

        return true;
      },
      {
        message:
          "Macros must not be immediately followed or preceeded by anything but '/'",
      },
    )
    .refine((value) => !value.endsWith("/") && !value.startsWith("/"), {
      message: "Cannot end with a slash",
    })
    .refine((value) => !value.includes("//"), {
      message: "Cannot contain empty sections between slashes",
    })
    .refine(
      (value) => value.endsWith("{gameFile}") || value.endsWith("{gameDir}"),
      {
        message: "Must end with {gameFile} or {gameDir}",
      },
    ),
);

export const librarySchema = z.object({
  path: z.string().min(1),
  structureDefinition: structureDefinitionSchema,
  newly: z.enum(["added", "removed"]).optional(),
  ignorePatterns: z
    .object({
      patterns: z.string().array(),
    })
    .default({ patterns: [] }),
}) satisfies z.ZodSchema<MessageInitShape<typeof LibrarySchema>>;
