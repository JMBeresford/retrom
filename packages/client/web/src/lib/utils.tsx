import { Timestamp } from "@retrom/codegen/google/protobuf/timestamp";
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

  if (parts.length < 2) {
    return { name: filename, extension: "" };
  }

  const extension = parts.pop();
  const name = parts.join(".");

  return { name, extension };
}

export function toTitleCase<T extends { toString: () => string }>(value: T) {
  value = value ?? "";
  return value
    .toString()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getFileStub(path?: string) {
  return path ? getFileParts(path).name : "";
}

export function getFileName(path: string) {
  const { name, extension } = getFileParts(path);
  return name + (extension ? `.${extension}` : "");
}

export function millisToTimestamp(millis: number): Timestamp {
  const seconds = Math.floor(millis / 1000);
  const nanos = (millis % 1000) * 1000000;

  return { seconds, nanos };
}

export function timestampToDate(timestamp?: Timestamp): Date {
  if (!timestamp) {
    return new Date(0);
  }

  const { seconds, nanos } = timestamp;

  return new Date(seconds * 1000 + nanos / 1000000);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<Fn extends (...args: any[]) => any>(
  fn: Fn,
  ms: number = 300,
): (...args: Parameters<Fn>) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- it's fine
  let timeout: any;

  return (...args: Parameters<Fn>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- it's fine
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}
