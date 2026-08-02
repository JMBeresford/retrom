import z from "zod";
import type { LibrarySchema } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { MessageShape } from "@bufbuild/protobuf";

export const builtinMacros = ["{library}", "{platform}", "{game}"];

export const structureDefinitionValidationSchema = z.literal("").or(
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
    .refine((value) => value.includes("{game}"), {
      message: "Must contain {game}",
    })
    .refine(
      (value) => {
        const gamePos = value.indexOf("{game}");
        const platformPos = value.indexOf("{platform}");

        return gamePos > platformPos;
      },
      { message: "{platform} must be before {game}" },
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
    .refine((value) => value.endsWith("{game}"), {
      message: "Must end with {game}",
    }),
);

export const libraryValidationSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  structureDefinition: structureDefinitionValidationSchema,
  ignorePatterns: z.object({
    patterns: z.string().array(),
  }),
}) satisfies z.ZodType<
  Pick<MessageShape<typeof LibrarySchema>, "name" | "structureDefinition">
>;
