import { Timestamp } from "@/generated/google/protobuf/timestamp";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export type InferSchema<T extends object> = z.ZodObject<{
  [K in keyof T]: T[K] extends object & { length?: never }
    ? InferSchema<T[K]>
    : z.ZodType<T[K]>;
}>;

export type DeepRequired<T> = Required<{
  [K in keyof T]-?: T[K] extends object | undefined
    ? DeepRequired<Required<T[K]>>
    : T[K];
}>;

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

export function Image(props: JSX.IntrinsicElements["img"]) {
  return <img {...props} alt={props.alt ?? ""} />;
}

export function getFileParts(path: string) {
  const filename = path.split("/").pop() ?? "";
  const parts = filename.split(".");

  // handle hidden files (starts w/ ".")
  const name = path.startsWith(".") ? `.${parts.shift()}` : parts.shift();

  // handle multi-level fnam extensions
  const extension = parts.join(".");

  return { name, extension };
}

export function getFileStub(path: string) {
  return getFileParts(path).name;
}

export function getFileName(path: string) {
  const { name, extension } = getFileParts(path);
  return name + (extension ? `.${extension}` : "");
}

export function timestampToDate(timestamp?: Timestamp): Date {
  if (!timestamp) {
    return new Date(0);
  }

  const { seconds, nanos } = timestamp;

  let maybeBigIntSeconds = 0;
  try {
    maybeBigIntSeconds = parseInt(seconds, 10);
  } catch {
    console.error("Failed to parse timestamp seconds as int", seconds);
  }

  return new Date(maybeBigIntSeconds * 1000 + nanos / 1000000);
}
