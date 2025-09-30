export type IndexSignature = string | number | symbol;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type ExhaustiveMatchers<T extends IndexSignature, Result> = Record<
  T,
  () => Result
>;

type Matchers<T extends IndexSignature, Result> =
  | (ExhaustiveMatchers<T, Result> & {
      default?: never;
    })
  | (Partial<ExhaustiveMatchers<T, Result>> & {
      default: () => Result;
    });

export function match<T extends IndexSignature, Result>(
  value: T,
  cases: Matchers<NoInfer<T>, Result>,
): Result {
  const matcher = cases[value];
  if (matcher) {
    return matcher();
  }

  if (cases.default) {
    return cases.default();
  }

  throw new Error(`No case found for value: ${String(value)}`);
}
