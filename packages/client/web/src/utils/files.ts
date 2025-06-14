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

export function readableByteSize(
  byteSize: number | bigint,
  asOrder?: FileSizeOrder,
): string {
  byteSize = typeof byteSize === "bigint" ? Number(byteSize) : byteSize;
  if (asOrder !== undefined) {
    return `${(byteSize / asOrder).toFixed(2)} ${FileSizeOrderUnit[asOrder]}`;
  }

  if (byteSize < FileSizeOrder.KILOBYTES.valueOf()) {
    return `${byteSize} B`;
  } else if (byteSize < FileSizeOrder.MEGABYTES.valueOf()) {
    return `${(byteSize / FileSizeOrder.KILOBYTES).toFixed(2)} KB`;
  } else if (byteSize < FileSizeOrder.GIGABYTES.valueOf()) {
    return `${(byteSize / FileSizeOrder.MEGABYTES.valueOf()).toFixed(2)} MB`;
  } else {
    return `${(byteSize / FileSizeOrder.GIGABYTES.valueOf()).toFixed(2)} GB`;
  }
}
