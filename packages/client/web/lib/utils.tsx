import nextConfig from "@/next.config.mjs";
import { default as ImageImpl, ImageProps } from "next/image";
import { type ClassValue, clsx } from "clsx";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toInitials(toInitialize?: string) {
  if (!toInitialize) {
    return "";
  }

  return toInitialize
    .split(" ")
    .map((ss) => ss.at(0))
    .join("");
}

const emptyStringToUndefined = z.literal("").transform(() => undefined);
const emptyNumberToUndefined = z
  .literal(Infinity)
  .transform(() => undefined)
  .or(z.literal(-Infinity).transform(() => undefined));

export function asOptionalString<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(emptyStringToUndefined);
}

export function asOptionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(emptyNumberToUndefined);
}

export function Image(props: ImageProps) {
  const { src } = props;

  const srcUrl = typeof src === "string" ? new URL(src) : undefined;

  if (
    typeof src === "string" &&
    nextConfig.images?.remotePatterns?.some(
      ({ hostname }) => hostname === srcUrl?.hostname,
    )
  ) {
    return <ImageImpl {...props} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...(props as DetailedHTMLProps<
        HTMLAttributes<HTMLImageElement>,
        HTMLImageElement
      >)}
      alt={props.alt ?? ""}
    />
  );
}

export function getFileName(path: string) {
  const filename = path.split("/").pop() ?? "";
  return filename.split(".").slice(0, -1).join(".");
}
