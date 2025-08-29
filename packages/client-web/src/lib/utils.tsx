import { RawMessage } from "@/utils/protos";
import { Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import { z } from "zod";

export type InferSchema<T extends object> = z.ZodObject<{
  [K in keyof T]: T[K] extends object
    ? T[K] extends unknown[]
      ? z.ZodType<T[K]>
      : InferSchema<T[K]>
    : z.ZodType<T[K]>;
}>;

export type DeepRequired<T> = Required<{
  [K in keyof T]-?: T[K] extends object | undefined
    ? DeepRequired<Required<T[K]>>
    : T[K];
}>;

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

  // After obtaining the file name without its extension,
  // if the obtained "stub" is empty, return the whole filename
  // This fixes an issue where file names starting with a dot (e.g. ".DS_Store")
  // would crash the application
  if (parts.length == 2) {
    if (parts[0] === "") {
      return { name: filename, extension: "" };
    }
  }

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

export function getFileName(path: string = "") {
  const { name, extension } = getFileParts(path);
  return name + (extension ? `.${extension}` : "");
}

export function millisToTimestamp(millis: number): RawMessage<Timestamp> {
  const seconds = BigInt(Math.floor(millis / 1000));
  const nanos = Math.floor((millis % 1000) * 1000000);

  return { seconds, nanos };
}

export function timestampToDate(timestamp?: Timestamp): Date {
  if (!timestamp) {
    return new Date(0);
  }

  return timestampDate(timestamp);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<Fn extends (...args: any[]) => any>(
  fn: Fn,
  ms: number = 300,
): (...args: Parameters<Fn>) => void {
  let timeout: NodeJS.Timeout | undefined;

  return (...args: Parameters<Fn>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}
