import { useGroupContext } from "@/providers/fullscreen/group-context";
import { GridGameList } from "@/components/fullscreen/grid-game-list";
import { CatchBoundary, createLazyFileRoute } from "@tanstack/react-router";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { GroupMenu } from "@/components/fullscreen/group-menu";
import { ActionBar } from "@/components/fullscreen/action-bar";
import { Background, Scene } from "@/components/fullscreen/scene";
import {
  FocusContainer,
  useFocusable,
} from "@/components/fullscreen/focus-container";
import { cn } from "@retrom/ui/lib/utils";
import { Button } from "@retrom/ui/components/button";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useMemo } from "react";

export const Route = createLazyFileRoute("/_fullscreenLayout/fullscreen/")({
  component: FullscreenComponent,
});

function FullscreenComponent() {
  return (
    <div className="h-full grid grid-flow-row grid-rows-[1fr_auto]">
      <div className="relative flex gap-4 w-full overflow-hidden">
        <PartitionList />

        <div className="absolute inset-0 z-[-1]">
          <CatchBoundary
            getResetKey={() => "resetScene"}
            onCatch={(error, info) => {
              console.warn("Caught error at boundary: ", error, info);
            }}
            errorComponent={() => (
              <div className="w-full h-full bg-gradient-to-t to-secondary/30 from-accent/10"></div>
            )}
          >
            <Scene>
              <Background />
            </Scene>
          </CatchBoundary>
        </div>
        <ScrollArea className="max-h-full grow">
          <GridGameList />

          <Scrollbar orientation="vertical" className="z-[100]" />
        </ScrollArea>
      </div>

      <ActionBar className="w-full overflow-hidden max-w-screen">
        <GroupMenu className="w-full" />
      </ActionBar>
    </div>
  );
}

function PartitionList() {
  const { activeGroup, allGroups } = useGroupContext();

  return allGroups.map((group) =>
    group.id === activeGroup?.id ? (
      <ScrollArea
        key={group.id}
        className={cn("max-h-full flex w-fit flex-col pr-2")}
      >
        <FocusContainer
          opts={{
            focusKey: `group-${group.id}-partition-list`,
          }}
          className="flex flex-col gap-3 py-10 px-2 w-full"
        >
          {activeGroup?.partitionedGames?.map(([key], idx) => (
            <span
              key={key}
              style={{ animationDelay: `${idx * 50}ms` }}
              className="animate-in ease-out fade-in fill-mode-both"
            >
              <PartitionItem partitionKey={key} />
            </span>
          ))}
        </FocusContainer>

        <Scrollbar orientation="vertical" className="opacity-0" />
      </ScrollArea>
    ) : null,
  );
}

function PartitionItem(props: { partitionKey: string }) {
  const { activeGroup } = useGroupContext();
  const { partitionKey } = props;
  const games = useMemo(() => {
    const group = activeGroup?.partitionedGames?.find(
      ([k]) => k === partitionKey,
    );

    return group ? group[1] : [];
  }, [activeGroup?.partitionedGames, partitionKey]);

  const { ref } = useFocusable<HTMLButtonElement>({
    focusKey: `char-list-${activeGroup?.id}-${partitionKey}`,
    focusable: games.length > 0,

    onFocus: ({ node }) => {
      node.focus();
      node.scrollIntoView({ block: "center" });
    },
  });

  return (
    <HotkeyLayer
      handlers={{
        ACCEPT: {
          handler: () => ref.current?.click(),
        },
      }}
    >
      <Button
        ref={ref}
        variant="inline"
        disabled={!games.length}
        onClick={() => {
          document
            .getElementById(`game-list-header-${partitionKey}`)
            ?.scrollIntoView({ block: "start" });
        }}
        className={cn(
          "w-full h-min flex items-center justify-center",
          "text-foreground font-bold opacity-50",
          "transition-all ease-in-out duration-200 p-2.5",
          "focus-hover:opacity-100 focus-hover:bg-foreground/10",
          "disabled:opacity-15 leading-none",
        )}
      >
        {partitionKey}
      </Button>
    </HotkeyLayer>
  );
}
