import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { usePlatforms } from "@/queries/usePlatforms";
import { getFileStub, timestampToDate } from "@/lib/utils";
import { useGames } from "@/queries/useGames";
import { GameWithMetadata } from "@/components/game-list";
import { Route } from "@/routes/_fullscreenLayout";

export type GroupKind = "platform" | "metadataProperty" | (string & {});
export type SortKey = "name" | "lastPlayed";

export type Group = {
  kind: GroupKind;
  id: number;
  name: string;
  sortKey: SortKey;
  partitionedGames: [string, GameWithMetadata[]][];
  allGames: GameWithMetadata[];
};

type GroupContext = {
  allGroups: Group[];
  activeGroup?: Group;
  previousGroup?: Group;
  nextGroup?: Group;
};

const context = createContext<GroupContext | undefined>(undefined);

export function GroupContextProvider(props: PropsWithChildren) {
  const { activeGroupId } = Route.useSearch();

  const { data: platforms } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.platforms.map((platform) => {
        const metadata = data.metadata.find(
          (metadata) => metadata.platformId === platform.id,
        );

        return {
          ...platform,
          metadata,
        };
      }),
  });

  const { data: games } = useGames({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.games.map((game) => {
        const metadata = data.metadata.find(
          (metadata) => metadata.gameId === game.id,
        );

        return {
          ...game,
          metadata,
        };
      }),
  });

  const allGames: Group = useMemo(
    () => ({
      kind: "metadataProperty",
      id: -1,
      name: "All Games",
      sortKey: "name",
      partitionedGames: partitionGamesByKey(games ?? [], "name"),
      allGames: games ?? [],
    }),
    [games],
  );

  const recentlyPlayed: Group = useMemo(() => {
    const partitionedGames =
      partitionGamesByKey(
        games
          ?.sort((a, b) => {
            const aLastPlayed = timestampToDate(
              a.metadata?.lastPlayed,
            ).getTime();
            const bLastPlayed = timestampToDate(
              b.metadata?.lastPlayed,
            ).getTime();

            return bLastPlayed - aLastPlayed;
          })
          .slice(0, 50) ?? [],
        "lastPlayed",
      ) ?? [];

    return {
      kind: "metadataProperty",
      id: -2,
      name: "Recently Played",
      sortKey: "lastPlayed",
      partitionedGames,
      allGames: partitionedGames.flatMap(([, games]) => games),
    };
  }, [games]);

  const platformGroups: Group[] = useMemo(
    () =>
      platforms
        ?.map((platform) => ({
          kind: "platform",
          id: platform.id,
          name: platform.metadata?.name ?? getFileStub(platform.path),
          url: "/fullscreen/platforms/$platformId",
          params: { platformId: platform.id.toString() },
          sortKey: "name" as const,
          allGames:
            games?.filter((game) => game.platformId === platform.id) ?? [],
          partitionedGames: partitionGamesByKey(
            games?.filter((game) => game.platformId === platform.id) ?? [],
            "name",
          ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    [platforms, games],
  );

  const allGroups: Group[] = useMemo(() => {
    return [allGames, recentlyPlayed].concat(platformGroups);
  }, [allGames, recentlyPlayed, platformGroups]);

  const { activeGroup, nextGroup, previousGroup } = useMemo(() => {
    const activeGroupIdx = allGroups.findIndex(
      (group) => group.id === activeGroupId,
    );

    if (activeGroupIdx === -1) {
      return {};
    }

    function getNext(idx: number) {
      const nextIdx = (idx + 1) % allGroups.length;

      return allGroups.at(nextIdx);
    }

    function getPrev(idx: number) {
      const prevIdx = idx - 1;

      return allGroups.at(prevIdx);
    }

    const activeGroup = allGroups.at(activeGroupIdx);
    const previousGroup = getPrev(activeGroupIdx);
    const nextGroup = getNext(activeGroupIdx);

    return { activeGroup, previousGroup, nextGroup };
  }, [allGroups, activeGroupId]);

  return (
    <context.Provider
      value={{ activeGroup, previousGroup, nextGroup, allGroups }}
      {...props}
    />
  );
}

export function useGroupContext() {
  const ctx = useContext(context);

  if (ctx === undefined) {
    throw new Error(
      "useGroupContext must be used within a GroupContextProvider",
    );
  }

  return ctx;
}

function partitionGamesByKey(
  gamesToPartition: GameWithMetadata[],
  key: SortKey,
): Group["partitionedGames"] {
  switch (key) {
    case "name": {
      const charGroups = new Map<string, GameWithMetadata[]>(
        [
          "#",
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "O",
          "P",
          "Q",
          "R",
          "S",
          "T",
          "U",
          "V",
          "W",
          "X",
          "Y",
          "Z",
        ].map((c) => [c, []]),
      );

      gamesToPartition.forEach((game) => {
        const name = game.metadata?.name ?? getFileStub(game.path);
        let char: string;
        if (/^[a-zA-Z]/.test(name[0])) {
          char = name[0].toUpperCase();
        } else {
          char = "#";
        }

        if (!charGroups.has(char)) {
          console.error(
            "Incorrect character group, game may not be visible",
            char,
          );
        }

        charGroups.get(char)?.push(game);
      });

      for (const arr of charGroups.values()) {
        arr.sort((a, b) => {
          const aName = a.metadata?.name ?? getFileStub(a.path);
          const bName = b.metadata?.name ?? getFileStub(b.path);

          return aName.localeCompare(bName);
        });
      }

      return Array.from(charGroups.entries()).sort(([k1], [k2]) =>
        k1.localeCompare(k2),
      );
    }

    // partition by month of last played date
    case "lastPlayed": {
      const monthGroups = new Map<string, GameWithMetadata[]>();

      gamesToPartition.forEach((game) => {
        const lastPlayed = game.metadata?.lastPlayed;
        if (!lastPlayed) {
          return;
        }

        const date = timestampToDate(lastPlayed).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        });

        if (!monthGroups.has(date)) {
          monthGroups.set(date, []);
        }

        monthGroups.get(date)?.push(game);
      });

      for (const arr of monthGroups.values()) {
        arr.sort((a, b) => {
          const aLastPlayed = timestampToDate(a.metadata?.lastPlayed).getTime();
          const bLastPlayed = timestampToDate(b.metadata?.lastPlayed).getTime();

          return bLastPlayed - aLastPlayed;
        });
      }

      return Array.from(monthGroups.entries()).sort(([k1], [k2]) => {
        const date1 = new Date(k1);
        const date2 = new Date(k2);

        return date2.getTime() - date1.getTime();
      });
    }
  }
}
