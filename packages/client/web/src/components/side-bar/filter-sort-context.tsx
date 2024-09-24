import { Game } from "@/generated/retrom/models/games";
import {
  GameMetadata,
  PlatformMetadata,
} from "@/generated/retrom/models/metadata";
import { Platform } from "@/generated/retrom/models/platforms";
import { debounce } from "@/lib/utils";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { create, StoreApi, UseBoundStore, useStore } from "zustand";

export type FilterKey =
  | keyof Pick<Game, "platformId">
  | keyof Pick<GameMetadata, "name">;

export type GameSortKey =
  | keyof Pick<Game, "createdAt" | "updatedAt">
  | keyof Pick<GameMetadata, "name">;

export type PlatformSortKey =
  | keyof Pick<Platform, "createdAt" | "updatedAt">
  | keyof Pick<PlatformMetadata, "name">;

export type SidebarFilters = Partial<Record<FilterKey, string>>;

export type SortDirection = "asc" | "desc";

export type FilterAndSortContext = {
  filters: SidebarFilters;
  gameSortKey: GameSortKey;
  platformSortKey: PlatformSortKey;
  gameSortDirection: SortDirection;
  platformSortDirection: SortDirection;
  setFilter: (key: FilterKey, value: string | undefined) => void;
  setGameSort: (key: GameSortKey) => void;
  setPlatformSort: (key: PlatformSortKey) => void;
  toggleGameSortDirection: () => void;
  togglePlatformSortDirection: () => void;
};

type FilterAndSortStore = UseBoundStore<StoreApi<FilterAndSortContext>>;

const context = createContext<FilterAndSortStore | undefined>(undefined);

export function FilterAndSortContext(props: PropsWithChildren) {
  const storeRef = useRef<FilterAndSortStore>();

  if (!storeRef.current) {
    storeRef.current = create<FilterAndSortContext>()((set) => {
      const debouncedSet = debounce(
        (...args: Parameters<typeof set>) => set(...args),
        500,
      );

      return {
        filters: {},
        gameSortKey: "name",
        platformSortKey: "name",
        gameSortDirection: "asc",
        platformSortDirection: "asc",
        setGameSort: (gameSortKey) => set(() => ({ gameSortKey })),
        setPlatformSort: (platformSortKey) => set(() => ({ platformSortKey })),
        toggleGameSortDirection: () => {
          set((state) => ({
            gameSortDirection:
              state.gameSortDirection === "asc" ? "desc" : "asc",
          }));
        },
        togglePlatformSortDirection: () => {
          set((state) => ({
            platformSortDirection:
              state.platformSortDirection === "asc" ? "desc" : "asc",
          }));
        },
        setFilter: (key, value) =>
          debouncedSet((state) => ({
            filters: { ...state.filters, [key]: value },
          })),
      };
    });
  }

  return <context.Provider value={storeRef.current} {...props} />;
}

export function useFilterAndSort() {
  const store = useContext(context);

  if (!store) {
    throw new Error(
      "useFilterAndSort must be used within a FilterAndSortContext",
    );
  }

  return useStore(store);
}
