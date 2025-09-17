export enum FileSizeOrder {
  BYTES = 1,
  KILOBYTES = 1024,
  MEGABYTES = 1024 * 1024,
  GIGABYTES = 1024 * 1024 * 1024,
}

export const FileSizeOrderUnit = {
  [FileSizeOrder.BYTES]: "B",
  [FileSizeOrder.KILOBYTES]: "KB",
  [FileSizeOrder.MEGABYTES]: "MB",
  [FileSizeOrder.GIGABYTES]: "GB",
} as const satisfies Record<FileSizeOrder, string>;

export function getBestFileSizeOrder(byteSize: number | bigint) {
  byteSize =
    typeof byteSize === "bigint" ? byteSize : BigInt(Math.floor(byteSize));

  if (byteSize < BigInt(FileSizeOrder.KILOBYTES)) {
    return FileSizeOrder.BYTES;
  } else if (byteSize < BigInt(FileSizeOrder.MEGABYTES)) {
    return FileSizeOrder.KILOBYTES;
  } else if (byteSize < BigInt(FileSizeOrder.GIGABYTES)) {
    return FileSizeOrder.MEGABYTES;
  } else {
    return FileSizeOrder.GIGABYTES;
  }
}

export function convertToFileSizeOrder(
  byteSize: number | bigint,
  asOrder?: FileSizeOrder,
): typeof byteSize {
  asOrder = asOrder ?? getBestFileSizeOrder(byteSize);

  if (typeof byteSize === "bigint") {
    return byteSize / BigInt(asOrder);
  }

  return byteSize / asOrder;
}

export function readableByteSize(
  byteSize: number | bigint,
  asOrder?: FileSizeOrder,
): string {
  const order = asOrder ?? getBestFileSizeOrder(byteSize);
  const size = convertToFileSizeOrder(byteSize, order);

  return `${size.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${FileSizeOrderUnit[order]}`;
}
