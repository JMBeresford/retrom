import { useDebouncedValue } from "@tanstack/react-pacer";
import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@retrom/ui-next/components/command";
import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { useSearchCommandContext } from "./context";
import type { PropsWithChildren } from "react";
import { useListGameMetadata } from "@/data/metadata/use-list-game-metadata";

export function GamesSearch() {
  const [search] = useSearchCommandContext();

  const [debouncedSearch, debouncer] = useDebouncedValue(
    search,
    { wait: 500, leading: true },
    (state) => ({
      isPending: state.isPending && !state.canLeadingExecute,
    }),
  );

  const listGameMetadataQuery = useListGameMetadata({
    options: {
      select: ({ metadata }) => metadata,
    },
    request: {
      gameIds: [debouncedSearch],
    },
  });

  const isPending =
    listGameMetadataQuery.isPending || debouncer.state.isPending;
  const isError = listGameMetadataQuery.isError;

  if (isError) {
    return (
      <Group>
        <CommandItem keywords={["*"]}>
          <span className="text-destructive">Error loading games</span>
          <CommandShortcut className="hidden"></CommandShortcut>
        </CommandItem>
      </Group>
    );
  }

  if (isPending) {
    return (
      <Group>
        <CommandItem keywords={["*"]}>
          <Skeleton className="flex grow w-full h-8" />
          <CommandShortcut className="hidden"></CommandShortcut>
        </CommandItem>
      </Group>
    );
  }

  return (
    <Group>
      {listGameMetadataQuery.data.map((metadata) => (
        <CommandItem key={metadata.id} value={metadata.game}>
          {metadata.name}
        </CommandItem>
      ))}
    </Group>
  );
}

function Group(props: PropsWithChildren) {
  return <CommandGroup heading="Games">{props.children}</CommandGroup>;
}
