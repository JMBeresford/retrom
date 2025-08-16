export type IndexSignature = string | number | symbol;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function match<T extends Record<IndexSignature, unknown>, Result>(
  value: keyof T,
  cases: Record<keyof T, () => Result>,
): Result {
  if (value in cases) {
    return cases[value]();
  }

  throw new Error(`No case found for value: ${String(value)}`);
}
