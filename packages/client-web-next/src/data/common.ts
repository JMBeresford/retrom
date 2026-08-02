import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";

export type QueryOptionsExt<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey = Array<unknown>,
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;
