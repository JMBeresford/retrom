import { createContext, use } from "react";
import type { Dispatch, SetStateAction } from "react";

export type SearchCommandContextValue = [
  search: string,
  setSearch: Dispatch<SetStateAction<string>>,
];

export const SearchCommandContext = createContext<
  SearchCommandContextValue | undefined
>(undefined);

export const useSearchCommandContext = () => {
  const ctx = use(SearchCommandContext);

  if (!ctx) {
    throw new Error(
      "useSearchCommandContext must be used within a SearchCommandProvider",
    );
  }

  return ctx;
};
